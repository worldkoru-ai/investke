import { NextResponse } from "next/server";
import axios from "axios";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { reference } = await req.json();

    const token = (await cookies()).get("token")?.value;
    const decoded: any = jwt.verify(token!, process.env.JWT_SECRET!);

    const res = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const payment = res.data.data;

    if (payment.status === "success") {
      await getDb().query(
        "UPDATE users SET walletBalance = walletBalance + ? WHERE id = ?",
        [payment.amount / 100, decoded.userId]
      );

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false });
  } catch (err) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { updateWithdrawalDetails } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    const body = await req.json();

    await updateWithdrawalDetails(userId, body);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("WITHDRAWAL UPDATE ERROR:", err.message);
    return NextResponse.json(
      { error: "Failed to update withdrawal details" },
      { status: 500 }
    );
  }
}

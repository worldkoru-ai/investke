import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { amount, email } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // 1. Get user by email
    const [rows]: any = await getDb().query(
      "SELECT id, walletBalance FROM users WHERE email = ?",
      [email]
    );
    const user = rows[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.wallet_balance < amount) {
      return NextResponse.json(
        { error: "Insufficient wallet balance" },
        { status: 400 }
      );
    }

    // 2. Create withdrawal request
    await getDb().query(
      `INSERT INTO withdrawals (user_id, amount, status)
       VALUES (?, ?, 'PENDING')`,
      [user.id, amount]
    );

    // Optionally, reduce wallet balance immediately (or do it on approval)
    await getDb().query(
      "UPDATE users SET walletBalance = walletBalance - ? WHERE id = ?",
      [amount, user.id]
    );

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted and pending approval",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

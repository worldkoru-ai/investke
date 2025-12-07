import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId, amount, reason } = await req.json();

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid withdrawal request" },
        { status: 400 }
      );
    }

    const db = getDb();

    // ✅ 1. Get user wallet balance
    const [users]: any = await db.query(
      "SELECT walletBalance FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const walletBalance = users[0].walletBalance;

    if (walletBalance < amount) {
      return NextResponse.json(
        { error: "Insufficient wallet balance" },
        { status: 400 }
      );
    }

    // ✅ 2. Start DB Transaction
    await db.query("START TRANSACTION");

    // ✅ 3. Deduct wallet
    await db.query(
      "UPDATE users SET walletBalance = walletBalance - ? WHERE id = ?",
      [amount, userId]
    );

    // ✅ 4. Log withdrawal
    await db.query(
      `INSERT INTO withdrawals (userId, amount, method, status, reason)
       VALUES (?, ?, 'wallet', 'pending', ?)`,
      [userId, amount, reason || "Wallet withdrawal"]
    );

    // ✅ 5. Commit transaction
    await db.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted successfully",
      amount,
    });

  } catch (err: any) {
    console.error("WITHDRAW ERROR:", err);

    try {
      const db = getDb();
      await db.query("ROLLBACK");
    } catch {}

    return NextResponse.json(
      { error: "Withdrawal failed", details: err.message },
      { status: 500 }
    );
  }
}

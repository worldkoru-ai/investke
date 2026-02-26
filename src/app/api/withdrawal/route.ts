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

    // ✅ 1. Get user wallet balance and verification status
    const [users]: any = await db.query(
      "SELECT walletBalance, isVerified FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // ✅ 2. Check if user is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { error: "Your account must be verified by admin before withdrawing." },
        { status: 403 }
      );
    }

    // ✅ 3. Check wallet balance
    if (user.walletBalance < amount) {
      return NextResponse.json(
        { error: "Insufficient wallet balance" },
        { status: 400 }
      );
    }

    // ✅ 4. Start DB Transaction
    await db.query("START TRANSACTION");

    // ✅ 5. Deduct wallet
    await db.query(
      "UPDATE users SET walletBalance = walletBalance - ? WHERE id = ?",
      [amount, userId]
    );

    // ✅ 6. Log withdrawal
    await db.query(
      `INSERT INTO withdrawals (userId, amount, method, status, reason)
       VALUES (?, ?, 'wallet', 'pending', ?)`,
      [userId, amount, reason || "Wallet withdrawal"]
    );

    // ✅ 7. Commit transaction
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
      { error: "Service unavailable. Please try again later." },
      { status: 503 }
    );
  }
}
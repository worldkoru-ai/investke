import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  const db = getDb();

  try {
    const { userId, amount, reason } = await req.json();

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid withdrawal request" },
        { status: 400 }
      );
    }

    // ✅ 1. Check for pending withdrawal requests
    const [pending]: any = await db.query(
      "SELECT id FROM withdrawals WHERE userId = ? AND status = 'pending' LIMIT 1",
      [userId]
    );

    if (pending.length > 0) {
      return NextResponse.json(
        { error: "You already have a pending withdrawal request." },
        { status: 400 }
      );
    }

    // ✅ 2. Get user wallet balance and verification status
    const [users]: any = await db.query(
      "SELECT walletBalance, isVerified FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // ✅ 3. Check if user is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { error: "Your account must be verified by admin before withdrawing." },
        { status: 403 }
      );
    }

    // ✅ 4. Check wallet balance
    if (user.walletBalance < amount) {
      return NextResponse.json(
        { error: "Insufficient wallet balance" },
        { status: 400 }
      );
    }

    // ✅ 5. Start DB Transaction
    await db.query("START TRANSACTION");

    // ✅ 6. Deduct wallet
    await db.query(
      "UPDATE users SET walletBalance = walletBalance - ? WHERE id = ?",
      [amount, userId]
    );

    // ✅ 7. Log withdrawal
    await db.query(
      `INSERT INTO withdrawals (userId, amount, method, status, reason)
       VALUES (?, ?, 'wallet', 'pending', ?)`,
      [userId, amount, reason || "Wallet withdrawal"]
    );

    // ✅ 8. Commit transaction
    await db.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted successfully",
      amount,
    });

  } catch (err: any) {
    console.error("WITHDRAW ERROR:", err);

    try {
      await db.query("ROLLBACK");
    } catch {}

    return NextResponse.json(
      { error: "Service unavailable. Please try again later." },
      { status: 503 }
    );
  }
}
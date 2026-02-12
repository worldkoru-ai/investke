import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const { withdrawalId } = await req.json();
    const db = getDb();

    // Get withdrawal details
    const [withdrawals]: any = await db.query(
      "SELECT * FROM withdrawals WHERE id = ?",
      [withdrawalId]
    );

    if (!withdrawals || withdrawals.length === 0) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
    }

    const withdrawal = withdrawals[0];

    // Refund to wallet
    await db.query(
      "UPDATE users SET walletBalance = walletBalance + ? WHERE id = ?",
      [withdrawal.amount, withdrawal.userId]
    );

    // Update withdrawal status
    await db.query(
      "UPDATE withdrawals SET status = 'rejected' WHERE id = ?",
      [withdrawalId]
    );

    return NextResponse.json({ message: "Withdrawal rejected and refunded" }, { status: 200 });
  } catch (error: any) {
    console.error("Withdrawal rejection error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
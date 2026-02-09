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

    if (withdrawal.status === "approved") {
      return NextResponse.json({ error: "Already approved" }, { status: 400 });
    }

    // Update withdrawal status
    await db.query(
      "UPDATE withdrawals SET status = 'approved' WHERE id = ?",
      [withdrawalId]
    );

    return NextResponse.json({ message: "Withdrawal approved successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Withdrawal approval error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
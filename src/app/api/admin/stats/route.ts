import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const db = getDb();

    const [userCount]: any = await db.query("SELECT COUNT(*) as count FROM users");
    const [totalInvested]: any = await db.query("SELECT SUM(amount) as total FROM investments WHERE status = 'active'");
    const [pendingWithdrawals]: any = await db.query("SELECT COUNT(*) as count FROM withdrawals WHERE status = 'pending'");
    const [totalWithdrawals]: any = await db.query("SELECT SUM(amount) as total FROM withdrawals WHERE status = 'approved'");

    return NextResponse.json({
      stats: {
        totalUsers: userCount[0].count,
        totalInvested: totalInvested[0].total || 0,
        pendingWithdrawals: pendingWithdrawals[0].count,
        totalWithdrawals: totalWithdrawals[0].total || 0,
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error("Admin stats fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
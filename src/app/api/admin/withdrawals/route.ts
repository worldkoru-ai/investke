import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const db = getDb();
    const [withdrawals]: any = await db.query(`
      SELECT 
        w.id, 
        w.userId, 
        w.amount, 
        w.status, 
        w.createdAt,
        u.name AS userName, 
        u.email AS userEmail,
        u.withdrawalMethod AS method,
        u.mobileProvider,
        u.mobileNumber,
        u.bankName,
        u.bankAccountName,
        u.bankAccountNumber
      FROM withdrawals w
      LEFT JOIN users u ON w.userId = u.id
      ORDER BY w.createdAt DESC
    `);

    return NextResponse.json({ withdrawals }, { status: 200 });
  } catch (error: any) {
    console.error("Admin withdrawals fetch error:", error);
    return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const db = getDb();
    const [investments]: any = await db.query(`
      SELECT 
        i.id, i.userId, i.planId, i.amount, i.status, 
        i.endDate, i.currentInterest, i.expectedInterest, i.createdAt,
        u.name as userName, u.email as userEmail,
        p.name as planName, p.interestRate, p.duration
      FROM investments i
      LEFT JOIN users u ON i.userId = u.id
      LEFT JOIN plans p ON i.planId = p.id
      ORDER BY i.createdAt DESC
    `);

    return NextResponse.json({ investments }, { status: 200 });
  } catch (error: any) {
    console.error("Admin investments fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
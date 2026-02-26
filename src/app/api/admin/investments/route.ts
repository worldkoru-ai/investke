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
    i.id,
    i.userId,
    i.planId,
    i.amount,
    i.status,
    i.startDate,
    i.endDate AS maturityDate,
    i.currentInterest,
    i.expectedInterest,
    i.created_at AS createdAt,
    u.name AS userName,
    u.email AS userEmail,
    p.interestRate,
    p.durationDays
  FROM investments i
  LEFT JOIN users u ON i.userId = u.id
  LEFT JOIN investment_plans p ON i.planId = p.id
  ORDER BY i.created_at DESC
`);

    return NextResponse.json({ investments }, { status: 200 });
  } catch (error: any) {
    console.error("Admin investments fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
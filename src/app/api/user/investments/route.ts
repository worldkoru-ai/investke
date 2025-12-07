import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const db = getDb();

  const [rows]: any = await db.query(`
    SELECT 
      i.id,
      i.amount,
      i.status,
      i.endDate AS maturityDate,
      p.name AS planName,
      i.expectedInterest,
      i.currentInterest
    FROM investments i
    JOIN investment_plans p ON i.planId = p.id
    WHERE i.userId = ?
    ORDER BY i.created_at DESC
  `, [userId]);

  return NextResponse.json({ investments: rows });
}

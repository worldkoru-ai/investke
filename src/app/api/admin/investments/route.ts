import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const [rows]: any = await db.query(`
      SELECT i.id, i.userId, i.planId, i.amount, i.status, i.startDate, i.endDate,
             u.name as userName,
             p.name as planName
      FROM investments i
      JOIN users u ON i.userId = u.id
      JOIN investment_plans p ON i.planId = p.id
      ORDER BY i.startDate DESC
    `);

    return NextResponse.json({ investments: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch investments" }, { status: 500 });
  }
}

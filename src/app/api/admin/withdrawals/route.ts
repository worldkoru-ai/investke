import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();

    const [rows]: any = await db.query(`
      SELECT w.id, w.userId, w.amount, w.method, w.status, w.createdAt,
             u.name AS fullName, u.email
      FROM withdrawals w
      JOIN users u ON w.userId = u.id
      ORDER BY w.createdAt DESC
    `);

    return NextResponse.json(rows, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch withdrawals" }, { status: 500 });
  }
}

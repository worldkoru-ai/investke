import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const db = getDb();
    const [verifications]: any = await db.query(`
      SELECT uv.id, uv.userId, uv.idType, uv.status, uv.created_at AS createdAt,
             u.name AS userName, u.email AS userEmail
      FROM user_verifications uv
      JOIN users u ON uv.userId = u.id
      WHERE uv.status = 'pending'
      ORDER BY uv.createdAt DESC
    `);


    return NextResponse.json({ verifications }, { status: 200 });
  } catch (err: any) {
    console.error("Fetch verifications error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
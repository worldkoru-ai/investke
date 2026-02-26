import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const db = getDb();
    const [verifications]: any = await db.query(`
      SELECT uv.id, uv.userId, uv.idType, uv.idFront, uv.idBack, uv.status, uv.created_at AS createdAt,
             u.name AS userName, u.email AS userEmail
      FROM user_verifications uv
      JOIN users u ON uv.userId = u.id
      WHERE uv.status = 'pending'
      ORDER BY uv.created_at DESC
    `);

    // Convert BLOBs to Base64 so the frontend can render images
    const verificationsWithImages = verifications.map((v: any) => ({
      ...v,
      idFront: v.idFront ? `data:image/jpeg;base64,${Buffer.from(v.idFront).toString('base64')}` : null,
      idBack: v.idBack ? `data:image/jpeg;base64,${Buffer.from(v.idBack).toString('base64')}` : null,
    }));

    return NextResponse.json({ verifications: verificationsWithImages }, { status: 200 });
  } catch (err: any) {
    console.error("Fetch verifications error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
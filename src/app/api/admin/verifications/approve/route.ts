// app/api/admin/verifications/approve.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const { verificationId, approve }: { verificationId: number; approve: boolean } = await req.json();
    const db = getDb();

    const [verifications]: any = await db.query(
      "SELECT * FROM user_verifications WHERE id = ?",
      [verificationId]
    );

    if (!verifications || verifications.length === 0) {
      return NextResponse.json({ error: "Verification not found" }, { status: 404 });
    }

    const verification = verifications[0];
    if (verification.status !== "pending") {
      return NextResponse.json({ error: "Already processed" }, { status: 400 });
    }

    // Update verification status
    await db.query(
      "UPDATE user_verifications SET status = ? WHERE id = ?",
      [approve ? "approved" : "rejected", verificationId]
    );

    // If approved, mark user as verified
    if (approve) {
      await db.query(
        "UPDATE users SET isVerified = 1 WHERE id = ?",
        [verification.userId]
      );
    }

    return NextResponse.json({
      message: `User verification ${approve ? "approved" : "rejected"} successfully`,
      verificationId,
      approved: approve
    }, { status: 200 });

  } catch (err: any) {
    console.error("Verification approval error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const userId = formData.get("userId") as string;
    const idType = formData.get("idType") as string;
    const front = formData.get("front") as File;
    const back = formData.get("back") as File;

    if (!userId || !idType || !front || !back) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // ✅ Convert files to buffers
    const frontBuffer = Buffer.from(await front.arrayBuffer());
    const backBuffer = Buffer.from(await back.arrayBuffer());

    // ✅ Optional: get MIME type
    const frontMime = front.type;
    const backMime = back.type;

    // ✅ Save directly to DB
await getDb().query(
  `INSERT INTO user_verifications 
    (userId, idType, idFront, idBack, status)
   VALUES (?, ?, ?, ?, 'pending')
   ON DUPLICATE KEY UPDATE
     idType = VALUES(idType),
     idFront = VALUES(idFront),
     idBack = VALUES(idBack),
     status = 'pending'`,
  [userId, idType, frontBuffer, backBuffer]
);

    return NextResponse.json({
      success: true,
      message: "Verification uploaded successfully",
    });

  } catch (err: any) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json({ error: "Upload failed", details: err.message }, { status: 500 });
  }
}
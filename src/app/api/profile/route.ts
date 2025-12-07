import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const userId = formData.get("userId") as string;
    const idType = formData.get("idType") as string;
    const front = formData.get("front") as File;
    const back = formData.get("back") as File;

    if (!userId || !idType || !front || !back) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public/uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // ✅ Save front image
    const frontBytes = Buffer.from(await front.arrayBuffer());
    const frontName = `${Date.now()}-front-${front.name}`;
    const frontPath = path.join(uploadDir, frontName);
    fs.writeFileSync(frontPath, frontBytes);

    // ✅ Save back image
    const backBytes = Buffer.from(await back.arrayBuffer());
    const backName = `${Date.now()}-back-${back.name}`;
    const backPath = path.join(uploadDir, backName);
    fs.writeFileSync(backPath, backBytes);

    const frontUrl = `/uploads/${frontName}`;
    const backUrl = `/uploads/${backName}`;

    // ✅ Save to DB
    await getDb().query(
      `INSERT INTO user_verifications 
        (userId, idType, idFrontUrl, idBackUrl, status)
       VALUES (?, ?, ?, ?, 'pending')
       ON DUPLICATE KEY UPDATE
       idType = VALUES(idType),
       idFrontUrl = VALUES(idFrontUrl),
       idBackUrl = VALUES(idBackUrl),
       status = 'pending'`,
      [userId, idType, frontUrl, backUrl]
    );

    return NextResponse.json({
      success: true,
      message: "Verification uploaded successfully",
    });

  } catch (err: any) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json(
      { error: "Upload failed", details: err.message },
      { status: 500 }
    );
  }
}

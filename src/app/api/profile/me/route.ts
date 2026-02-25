import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const type = req.nextUrl.searchParams.get("type"); // front or back

  if (!userId || !type) {
    return new Response("Missing parameters", { status: 400 });
  }

  const db = getDb();

  const [rows]: any = await db.query(
    `SELECT idFront, idBack
     FROM user_verifications
     WHERE userId = ? LIMIT 1`,
    [userId]
  );

  if (!rows.length) {
    return new Response("Not found", { status: 404 });
  }

  const imageBuffer =
    type === "front" ? rows[0].idFront : rows[0].idBack;

  if (!imageBuffer) {
    return new Response("Image not found", { status: 404 });
  }

  return new Response(imageBuffer, {
    headers: {
      "Content-Type": "image/jpeg", // adjust if needed
      "Cache-Control": "private, max-age=3600",
    },
  });
}
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getDb } from "@/lib/db";

export async function requireAdmin(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    const db = getDb();
    const [rows]: any = await db.query("SELECT isAdmin FROM users WHERE id = ?", [userId]);
    const user = rows[0];

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Access denied. Admin only." }, { status: 403 });
    }

    return { userId, isAdmin: true };
  } catch (error: any) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
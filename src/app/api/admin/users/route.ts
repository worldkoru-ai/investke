// src/app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getDb, getUserById } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const adminId = decoded.userId;
    const admin = await getUserById(adminId);
    if (!admin || admin.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";

    const db = getDb();
    const [rows]: any = await db.query(
      `SELECT id, name, email, walletBalance, totalInvested, role, isSuspended
       FROM users
       WHERE name LIKE ? OR email LIKE ?
       ORDER BY id DESC
       LIMIT 100`,
      [`%${search}%`, `%${search}%`]
    );

    return NextResponse.json({ users: rows }, { status: 200 });

  } catch (err: any) {
    console.error("ADMIN USERS ERROR:", err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}

// Suspend / Unsuspend user
export async function PATCH(req: Request) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const adminId = decoded.userId;
    const admin = await getUserById(adminId);
    if (!admin || admin.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { userId, suspend } = body;

    const db = getDb();
    await db.query(`UPDATE users SET isSuspended = ? WHERE id = ?`, [suspend ? 1 : 0, userId]);

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err: any) {
    console.error("ADMIN USERS PATCH ERROR:", err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}

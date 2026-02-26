// src/app/api/admin/stats/route.ts
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
    const userId = decoded.userId;
    const admin = await getUserById(userId);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = getDb();

    // Totals
    const [[{ totalUsers }]]: any = await db.query(`SELECT COUNT(*) AS totalUsers FROM users`);
    const [[{ totalInvested }]]: any = await db.query(`SELECT IFNULL(SUM(totalInvested), 0) AS totalInvested FROM users`);
    const [[{ totalWallet }]]: any = await db.query(`SELECT IFNULL(SUM(walletBalance), 0) AS totalWallet FROM users`);
    const [[{ pendingWithdrawals }]]: any = await db.query(`SELECT COUNT(*) AS pendingWithdrawals FROM withdrawals WHERE status = 'pending'`);
    const [[{ pendingVerifications }]]: any = await db.query(`SELECT COUNT(*) AS pendingVerifications FROM user_verifications WHERE status = 'pending'`);
    const [[{ totalWithdrawn }]]: any = await db.query(`SELECT IFNULL(SUM(amount), 0) AS totalWithdrawn FROM withdrawals WHERE status = 'paid'`);

    // Small datasets for chart: sum of investments and withdrawals grouped by day (last 14 days)
    const investmentsByDay: any = (await db.query(`
      SELECT DATE(startDate) AS date, IFNULL(SUM(amount),0) AS invested
      FROM investments
      WHERE startDate >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
      GROUP BY DATE(startDate)
      ORDER BY DATE(startDate)
    `))[0];

    const withdrawalsByDay: any = (await db.query(`
      SELECT DATE(created_at) AS date, IFNULL(SUM(amount),0) AS withdrawn
      FROM withdrawals
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `))[0];

    return NextResponse.json({
      totalUsers: Number(totalUsers || 0),
      totalInvested: Number(totalInvested || 0),
      totalWallet: Number(totalWallet || 0),
      totalWithdrawn: Number(totalWithdrawn || 0),
      pendingWithdrawals: Number(pendingWithdrawals || 0),
      pendingVerifications: Number(pendingVerifications || 0),
      investmentsByDay,
      withdrawalsByDay,
    }, { status: 200 });

  } catch (err: any) {
    console.error("ADMIN STATS ERROR:", err);
      return NextResponse.json(
    { error: "Service unavailable. Please try again later." },
    { status: 503 }
  );  }
}

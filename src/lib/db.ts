import mysql from "mysql2/promise";

let pool: mysql.Pool | undefined;

export function getDb() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "exovest",
      connectionLimit: 10,
    });
  }
  return pool;
}
export async function getUserById(userId: string) {
  const db = getDb();
  const [rows]: any = await db.query("SELECT * FROM users WHERE id = ? LIMIT 1", [userId]);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}
export async function getPlanById(planId: string) {
  const db = getDb();
  const [rows]: any = await db.query("SELECT * FROM investment_plans WHERE id = ? LIMIT 1", [planId]);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

export async function updateUserWallet(userId: string, newBalance: number) {
  const db = getDb();
  await db.query("UPDATE users SET walletBalance = ? WHERE id = ?", [newBalance, userId]);
}

export async function updateUserTotalInvested(userId: string, amount: number) {
  const db = getDb();
  await db.query("UPDATE users SET totalInvested = totalInvested + ? WHERE id = ?", [amount, userId]);
} 

export async function createInvestment(investment: {
  userId: string;
  planId: string; 
  amount: number;
  startDate: Date;
  endDate: Date;
  compoundingPeriod: string;
  status: string;
}) {
  const db = getDb(); 
  const { userId, planId, amount, startDate, endDate, compoundingPeriod, status } = investment;
  await db.query(
    "INSERT INTO investments (userId, planId, amount, startDate, endDate, compoundingPeriod, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [userId, planId, amount, startDate, endDate, compoundingPeriod, status]
  );
}


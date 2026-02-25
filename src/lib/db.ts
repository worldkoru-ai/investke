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

export async function getPlanByName(planName: string){
  const db = getDb();
  const [rows]: any = await db.query("SELECT * FROM investment_plans WHERE name = ? LIMIT 1", [planName]);
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


export async function getUserVerification(userId: string) {
  const db = getDb();

  const [rows]: any = await db.query(
    `SELECT 
        idType, 
        status
     FROM user_verifications 
     WHERE userId = ? 
     LIMIT 1`,
    [userId]
  );

  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  return {
    idType: rows[0].idType,
    status: rows[0].status,

    // 👇 image endpoints (served via API)
    idFrontUrl: `/api/verification/image?userId=${userId}&type=front`,
    idBackUrl: `/api/verification/image?userId=${userId}&type=back`,
  };
}

export async function saveUserVerification(data: {
  userId: string;
  idType: string;
  idFront: Buffer;
  idBack: Buffer;
}) {
  const db = getDb();

  const { userId, idType, idFront, idBack } = data;

  await db.query(
    `INSERT INTO user_verifications 
     (userId, idType, idFront, idBack, status) 
     VALUES (?, ?, ?, ?, 'pending')
     ON DUPLICATE KEY UPDATE
       idType = VALUES(idType),
       idFront = VALUES(idFront),
       idBack = VALUES(idBack),
       status = 'pending'`,
    [userId, idType, idFront, idBack]
  );
}

export async function updateWithdrawalDetails(userId: string, data: any) {
  const db = getDb();

  const {
    withdrawalMethod,
    bankName,
    bankAccountName,
    bankAccountNumber,
    mobileProvider,
    mobileNumber,
  } = data;

  await db.query(
    `UPDATE users SET
      withdrawalMethod = ?,
      bankName = ?,
      bankAccountName = ?,
      bankAccountNumber = ?,
      mobileProvider = ?,
      mobileNumber = ?
     WHERE id = ?`,
    [
      withdrawalMethod,
      bankName,
      bankAccountName,
      bankAccountNumber,
      mobileProvider,
      mobileNumber,
      userId,
    ]
  );
}

export async function getVerificationByUserId(userId: string) {
  const db = getDb();
  const [rows]: any = await db.query(
    "SELECT * FROM verifications WHERE userId = ? LIMIT 1",
    [userId]
  );
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

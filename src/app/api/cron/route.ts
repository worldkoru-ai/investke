// import mysql from "mysql2/promise";
// import { NextRequest, NextResponse } from "next/server";

// // Create MySQL connection pool
// const pool = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "toor",
//   database: "investke",
// });

// // GET API to trigger interest update manually
// export async function GET(req: NextRequest) {
//   await updateDailyInterest();
//   return NextResponse.json({ message: "Daily interest updated successfully" });
// }


// // Map compounding periods to periods per year
// const periodsPerYear: Record<string, number> = {
//   daily: 365,
//   weekly: 52,
//   monthly: 12,
//   quarterly: 4,
//   yearly: 1,
// };


// export async function updateDailyInterest() {
//   try {
//     // 1️⃣ Fetch all active investments with daily or monthly compounding
//     const [investments] = await pool.query(
//       `SELECT id, amount, currentInterest, interestRate, startDate, endDate, compoundingPeriod
//        FROM investments
//        WHERE status = 'active'`
//     );

//     const now = new Date();

//     for (const inv of investments as any[]) {
//       const principal = parseFloat(inv.amount);
//       const current = parseFloat(inv.currentInterest);
//       const rate = parseFloat(inv.interestRate) / 100;

//       // 2️⃣ Calculate days passed and total duration
//       const start = new Date(inv.startDate);
//       const end = new Date(inv.endDate);

//       const daysPassed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
//       const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

//       if (daysPassed <= 0) continue; // investment hasn't started yet

//       // 3️⃣ Compute interest depending on compounding period
//       let currentInterest = 0;
//       let expectedInterest = 0;

//       if (inv.compoundingPeriod === "daily") {
//         // Daily compounding formula: A = P*(1 + r/365)^(daysPassed)
//         const totalAmountNow = principal * Math.pow(1 + rate / 365, Math.min(daysPassed, totalDays));
//         currentInterest = totalAmountNow - principal;

//         const totalAmountEnd = principal * Math.pow(1 + rate / 365, totalDays);
//         expectedInterest = totalAmountEnd - principal;
//       } else if (inv.compoundingPeriod === "monthly") {
//         const monthsPassed = Math.floor(daysPassed / 30);
//         const totalMonths = Math.floor(totalDays / 30);

//         const totalAmountNow = principal * Math.pow(1 + rate / 12, Math.min(monthsPassed, totalMonths));
//         currentInterest = totalAmountNow - principal;

//         const totalAmountEnd = principal * Math.pow(1 + rate / 12, totalMonths);
//         expectedInterest = totalAmountEnd - principal;
//       }

//       // 4️⃣ Update DB
//       await pool.query(
//         `UPDATE investments SET currentInterest = ?, expectedInterest = ? WHERE id = ?`,
//         [currentInterest.toFixed(2), expectedInterest.toFixed(2), inv.id]
//       );

//       console.log(
//         `Investment ${inv.id}: Current Interest = ${currentInterest.toFixed(
//           2
//         )}, Expected Interest = ${expectedInterest.toFixed(2)}`
//       );
//     }

//     console.log("Daily interest update complete.");
//   } catch (err) {
//     console.error("Error updating investment interests:", err);
//   }
// }


import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { calculateInvestmentInterest } from "@/lib/interestcalculation";

export async function GET(req: Request) {
  // Verify cron secret for security
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();

    // Get all active investments with their plan details
    const [investments]: any = await db.query(
      `SELECT i.*, p.interestRate, p.compoundingPeriod 
       FROM investments i
       JOIN investment_plans p ON i.planId = p.id
       WHERE i.status = 'active'`
    );

    let updated = 0;
    const now = new Date();

    for (const investment of investments) {
      const interest = calculateInvestmentInterest({
        amount: investment.amount,
        interestRate: investment.interestRate,
        startDate: new Date(investment.startDate),
        endDate: new Date(investment.endDate),
        compoundingPeriod: investment.compoundingPeriod,
      }, now);

      // Update current interest
      await db.query(
        `UPDATE investments 
         SET currentInterest = ?,
             expectedInterest = ?,
             updatedAt = NOW()
         WHERE id = ?`,
        [interest.currentInterest, interest.expectedInterest, investment.id]
      );

      // Check if investment has matured
      if (now >= new Date(investment.endDate)) {
        await db.query(
          `UPDATE investments 
           SET status = 'completed',
               updatedAt = NOW()
           WHERE id = ?`,
          [investment.id]
        );
      }

      updated++;
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updated} investments`,
      timestamp: now.toISOString(),
    });
  } catch (err: any) {
    console.error("CRON UPDATE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to update investments", details: err.message },
      { status: 500 }
    );
  }
}


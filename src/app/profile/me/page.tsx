'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/app/NavBar/page";
import { CheckCircle, XCircle, Clock, Wallet, Smartphone } from "lucide-react";

type User = {
  mobileProvider: string;
  mobileNumber: string;
  bankAccountNumber: string;
  bankAccountName: string;
  bankName: string;
  withdrawalMethod: string;
  name: string;
  email: string;
  walletBalance: number;
  totalInvested: number;
  totalInterestEarned: number;
};

type Verification = {
  idType: string;
  idFrontUrl: string;
  idBackUrl: string;
  status: "pending" | "approved" | "rejected";
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();

        if (!res.ok) {
          return router.push("/login");
        }

        setUser(data.user);
        setVerification(data.verification);
      } catch (err) {
        console.error(err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return null;

  const statusColor = {
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
  };

  return (
    <>
      <NavBar />

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
          
          {/* Profile & Verification */}
          <div className="flex-1 space-y-6">

            {/* Profile Card */}
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow border">
              <h2 className="text-2xl text-indigo-700 font-bold mb-6">My Profile</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Full Name</p>
                  <p className="font-semibold text-black">{user.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Email</p>
                  <p className="font-semibold text-black">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Wallet className="text-indigo-500" />
                  <div>
                    <p className="text-gray-500 text-sm">Wallet Balance</p>
                    <p className="font-semibold text-black">${Number(user.walletBalance).toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="text-indigo-500" />
                  <div>
                    <p className="text-gray-500 text-sm">Total Invested</p>
                    <p className="font-semibold text-black">${Number(user.totalInvested).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Card */}
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow border">
              <h3 className="text-xl font-bold mb-4 text-black flex items-center gap-2">
                <Clock className="text-yellow-500" /> Verification Status
              </h3>

              {!verification ? (
                <div className="bg-yellow-50 border p-4 rounded flex flex-col items-start gap-2">
                  <p className="text-yellow-800">You have not submitted any ID yet.</p>
                  <button
                    onClick={() => router.push("/profile")}
                    className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
                  >
                    Verify Now
                  </button>
                </div>
              ) : (
                <>
                  <span
                    className={`inline-block mb-4 px-4 py-1 rounded-full text-sm font-semibold ${statusColor[verification.status]}`}
                  >
                    {verification.status.toUpperCase()}
                  </span>

                  <p className="mb-2 text-black"><b>ID Type:</b> {verification.idType}</p>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Front</p>
                      <img src={verification.idFrontUrl} className="w-full rounded border" />
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1">Back</p>
                      <img src={verification.idBackUrl} className="w-full rounded border" />
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>

          {/* Withdrawal Details */}
          <div className="flex-1 bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow border space-y-4">
            <h3 className="text-xl font-bold mb-4 text-black">Withdrawal Details</h3>

            <select
              value={user.withdrawalMethod || ""}
              onChange={(e) => setUser({ ...user, withdrawalMethod: e.target.value as any })}
              className="w-full mb-4 border text-black p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">Select Withdrawal Method</option>
              <option value="bank">Bank</option>
              <option value="mobile">Mobile Money</option>
            </select>

            {/* BANK */}
            {user.withdrawalMethod === "bank" && (
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  placeholder="Bank Name"
                  value={user.bankName || ""}
                  onChange={(e) => setUser({ ...user, bankName: e.target.value })}
                  className="border text-black p-2 rounded"
                />
                <input
                  placeholder="Account Holder Name"
                  value={user.bankAccountName || ""}
                  onChange={(e) => setUser({ ...user, bankAccountName: e.target.value })}
                  className="border text-black p-2 rounded"
                />
                <input
                  placeholder="Account Number"
                  value={user.bankAccountNumber || ""}
                  onChange={(e) => setUser({ ...user, bankAccountNumber: e.target.value })}
                  className="border text-black p-2 rounded"
                />
              </div>
            )}

            {/* MOBILE MONEY */}
            {user.withdrawalMethod === "mobile" && (
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  placeholder="Provider (M-Pesa, Airtel)"
                  value={user.mobileProvider || ""}
                  onChange={(e) => setUser({ ...user, mobileProvider: e.target.value })}
                  className="border text-black p-2 rounded"
                />
                <input
                  placeholder="Mobile Number"
                  value={user.mobileNumber || ""}
                  onChange={(e) => setUser({ ...user, mobileNumber: e.target.value })}
                  className="border text-black p-2 rounded"
                />
              </div>
            )}

            <button
              onClick={async () => {
                const res = await fetch("/api/withdrawaldetails", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(user),
                });

                if (res.ok) alert("Withdrawal details saved!");
                else alert("Failed to save details");
              }}
              className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition-colors w-full"
            >
              Save Withdrawal Details
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

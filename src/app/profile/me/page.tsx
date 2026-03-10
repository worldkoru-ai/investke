'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/app/NavBar/page";
import { CheckCircle, Clock, Wallet, Smartphone } from "lucide-react";

// OTP store (simple in-memory)
let otpStore: Record<string, { code: string; expires: number }> = {};
async function sendOtp(email: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore[email] = { code, expires };

  // Send OTP via API (Resend)
  await fetch("/api/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
}
async function verifyOtp(email: string, code: string) {
  const record = otpStore[email];
  if (!record) return false;
  if (record.expires < Date.now()) {
    delete otpStore[email];
    return false;
  }
  if (record.code !== code) return false;
  delete otpStore[email];
  return true;
}

type User = {
  mobileProvider?: string;
  mobileNumber?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankName?: string;
  withdrawalMethod?: string;
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
  const [isEditing, setIsEditing] = useState(false);
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();

        if (!res.ok) {
          router.push("/login");
          return;
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

  // OTP countdown
  useEffect(() => {
    if (!otpExpiry) return;

    const interval = setInterval(() => {
      const secondsLeft = Math.max(Math.floor((otpExpiry - Date.now()) / 1000), 0);
      setTimeLeft(secondsLeft);

      if (secondsLeft <= 0) {
        clearInterval(interval);
        alert("OTP expired. Please request a new one.");
        setAwaitingOtp(false);
        setOtp("");
        setOtpExpiry(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [otpExpiry]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  if (!user) return null;

  const hasBankDetails =
    user.withdrawalMethod === "bank" &&
    !!user.bankName &&
    !!user.bankAccountName &&
    !!user.bankAccountNumber;

  const hasMobileDetails =
    user.withdrawalMethod === "mobile" &&
    !!user.mobileProvider &&
    !!user.mobileNumber;

  const hasWithdrawalDetails = hasBankDetails || hasMobileDetails;

  const statusColor = {
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
  };

  const handleSaveWithdrawal = async () => {
    if (!awaitingOtp) {
      try {
        await sendOtp(user.email);
        setAwaitingOtp(true);
        setOtpExpiry(Date.now() + 5 * 60 * 1000);
        alert("OTP sent to your email. Please enter it below.");
      } catch (err) {
        console.error(err);
        alert("Failed to send OTP. Try again.");
      }
      return;
    }

    // Verify OTP
    const valid = await verifyOtp(user.email, otp);
    if (!valid) {
      alert("Invalid or expired OTP.");
      return;
    }

    // Save withdrawal details
    try {
      const res = await fetch("/api/withdrawaldetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (res.ok) {
        setIsEditing(false);
        setOtp("");
        setAwaitingOtp(false);
        setOtpExpiry(null);
        alert("Withdrawal details saved successfully!");
      } else {
        alert("Failed to save withdrawal details.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save withdrawal details.");
    }
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
          {/* LEFT SIDE */}
          <div className="flex-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white p-6 rounded-xl shadow border">
              <h2 className="text-2xl text-indigo-700 font-bold mb-6">
                My Profile
              </h2>
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
                    <p className="font-semibold text-black">
                      Ksh. {Number(user.walletBalance).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="text-indigo-500" />
                  <div>
                    <p className="text-gray-500 text-sm">Total Invested</p>
                    <p className="font-semibold text-black">
                      Ksh. {Number(user.totalInvested).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification */}
            <div className="bg-white p-6 rounded-xl shadow border">
              <h3 className="text-xl font-bold mb-4 text-black flex items-center gap-2">
                <Clock className="text-yellow-500" /> Verification Status
              </h3>
              {!verification ? (
                <div className="bg-yellow-50 border p-4 rounded">
                  <p className="text-yellow-800">
                    You have not submitted any ID yet.
                  </p>
                  <button
                    onClick={() => router.push("/profile")}
                    className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  >
                    Verify Now
                  </button>
                </div>
              ) : (
                <span
                  className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${statusColor[verification.status]}`}
                >
                  {verification.status.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* RIGHT SIDE — Withdrawal Details */}
          <div className="flex-1 bg-white p-6 rounded-xl shadow border space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-black">Withdrawal Details</h3>
              {hasWithdrawalDetails && !isEditing && (
                <span className="flex items-center gap-1 text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  <CheckCircle size={16} />
                  Details Saved ✓
                </span>
              )}
            </div>

            <select
              disabled={!isEditing && hasWithdrawalDetails}
              value={user.withdrawalMethod || ""}
              onChange={(e) =>
                setUser({ ...user, withdrawalMethod: e.target.value })
              }
              className="w-full border text-black p-2 rounded"
            >
              <option value="">Select Withdrawal Method</option>
              <option value="bank">Bank</option>
              <option value="mobile">Mobile Money</option>
            </select>

            {/* BANK */}
            {user.withdrawalMethod === "bank" && (
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  disabled={!isEditing && hasWithdrawalDetails}
                  placeholder="Bank Name"
                  value={user.bankName || ""}
                  onChange={(e) =>
                    setUser({ ...user, bankName: e.target.value })
                  }
                  className="border text-black p-2 rounded"
                />
                <input
                  disabled={!isEditing && hasWithdrawalDetails}
                  placeholder="Account Holder Name"
                  value={user.bankAccountName || ""}
                  onChange={(e) =>
                    setUser({ ...user, bankAccountName: e.target.value })
                  }
                  className="border text-black p-2 rounded"
                />
                <input
                  disabled={!isEditing && hasWithdrawalDetails}
                  placeholder="Account Number"
                  value={user.bankAccountNumber || ""}
                  onChange={(e) =>
                    setUser({ ...user, bankAccountNumber: e.target.value })
                  }
                  className="border text-black p-2 rounded"
                />
              </div>
            )}

            {/* MOBILE */}
            {user.withdrawalMethod === "mobile" && (
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  disabled={!isEditing && hasWithdrawalDetails}
                  placeholder="Provider (M-Pesa, Airtel)"
                  value={user.mobileProvider || ""}
                  onChange={(e) =>
                    setUser({ ...user, mobileProvider: e.target.value })
                  }
                  className="border text-black p-2 rounded"
                />
                <input
                  disabled={!isEditing && hasWithdrawalDetails}
                  placeholder="Mobile Number"
                  value={user.mobileNumber || ""}
                  onChange={(e) =>
                    setUser({ ...user, mobileNumber: e.target.value })
                  }
                  className="border text-black p-2 rounded"
                />
              </div>
            )}

            {/* OTP Input */}
            {awaitingOtp && (
              <div className="mt-4 flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full border p-2 rounded"
                />
                <span className="text-sm text-gray-500">
                  OTP expires in: {Math.floor(timeLeft / 60)
                    .toString()
                    .padStart(2, "0")}
                  :
                  {(timeLeft % 60).toString().padStart(2, "0")}
                </span>
                {timeLeft <= 0 && (
                  <button
                    className="text-blue-600 text-sm mt-1"
                    onClick={async () => {
                      await sendOtp(user.email);
                      setOtpExpiry(Date.now() + 5 * 60 * 1000);
                      setOtp("");
                      setAwaitingOtp(true);
                      alert("New OTP sent!");
                    }}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            )}

            <button
              onClick={handleSaveWithdrawal}
              className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 w-full"
            >
              {hasWithdrawalDetails && !isEditing
                ? "Edit Withdrawal Details"
                : awaitingOtp
                ? "Verify OTP & Save"
                : "Save Withdrawal Details"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
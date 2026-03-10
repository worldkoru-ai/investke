'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/app/NavBar/page";
import {
  CheckCircle, Clock, Wallet, Smartphone, Building2,
  Pencil, ShieldCheck, X, RefreshCw, ChevronRight, BadgeCheck
} from "lucide-react";

let otpStore: Record<string, { code: string; expires: number }> = {};

async function sendOtp(email: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 5 * 60 * 1000;
  otpStore[email] = { code, expires };
  await fetch("/api/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
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

// Step indicator for withdrawal edit flow
function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className="transition-all duration-300"
            style={{
              width: i < step ? 28 : i === step ? 28 : 8,
              height: 8,
              borderRadius: 99,
              background: i < step ? "#10b981" : i === step ? "#3b82f6" : "#e2e8f0",
            }}
          />
        </div>
      ))}
      <span className="text-xs text-slate-400 ml-1">Step {step + 1} of {total}</span>
    </div>
  );
}

// Method selector card
function MethodCard({
  icon, label, value, selected, onClick, disabled
}: {
  icon: React.ReactNode; label: string; value: string;
  selected: boolean; onClick: () => void; disabled: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="relative flex-1 flex flex-col items-center gap-2 py-5 px-4 rounded-xl border-2 transition-all duration-200 focus:outline-none"
      style={{
        borderColor: selected ? "#3b82f6" : "#e2e8f0",
        background: selected ? "rgba(59,130,246,0.06)" : "#fafafa",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        boxShadow: selected ? "0 0 0 4px rgba(59,130,246,0.12)" : "none",
      }}
    >
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center"
        style={{ background: selected ? "rgba(59,130,246,0.12)" : "#f1f5f9" }}
      >
        <span style={{ color: selected ? "#3b82f6" : "#94a3b8" }}>{icon}</span>
      </div>
      <span className="text-sm font-semibold" style={{ color: selected ? "#1d4ed8" : "#64748b" }}>
        {label}
      </span>
      {selected && (
        <span className="absolute top-2 right-2">
          <CheckCircle size={16} className="text-blue-500" />
        </span>
      )}
    </button>
  );
}

// Styled input for withdrawal form
function Field({
  label, placeholder, value, onChange, disabled, type = "text"
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; disabled: boolean; type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg px-4 py-2.5 text-sm text-slate-800 transition-all"
        style={{
          background: disabled ? "#f8fafc" : "#fff",
          border: "1.5px solid",
          borderColor: disabled ? "#e2e8f0" : "#cbd5e1",
          outline: "none",
        }}
        onFocus={e => { if (!disabled) e.target.style.borderColor = "#3b82f6"; }}
        onBlur={e => { e.target.style.borderColor = disabled ? "#e2e8f0" : "#cbd5e1"; }}
      />
    </div>
  );
}

// OTP digit boxes
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 6);
    onChange(raw);
  };

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        maxLength={6}
        className="absolute inset-0 opacity-0 w-full cursor-text"
        autoFocus
      />
      <div className="flex gap-2 justify-center">
        {digits.map((d, i) => (
          <div
            key={i}
            className="w-12 h-14 flex items-center justify-center rounded-xl text-2xl font-bold transition-all duration-150"
            style={{
              border: "2px solid",
              borderColor: value.length === i ? "#3b82f6" : d ? "#cbd5e1" : "#e2e8f0",
              background: d ? "#eff6ff" : "#f8fafc",
              color: "#1e40af",
              boxShadow: value.length === i ? "0 0 0 4px rgba(59,130,246,0.12)" : "none",
            }}
          >
            {d || <span style={{ color: "#cbd5e1", fontSize: 14 }}>–</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editStep, setEditStep] = useState(0); // 0=method, 1=details, 2=otp
  const [otp, setOtp] = useState("");
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [saving, setSaving] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (!res.ok) { router.push("/login"); return; }
        setUser(data.user);
        setVerification(data.verification);
      } catch { router.push("/login"); }
      finally { setLoading(false); }
    };
    loadProfile();
  }, [router]);

  useEffect(() => {
    if (!otpExpiry) return;
    const interval = setInterval(() => {
      const s = Math.max(Math.floor((otpExpiry - Date.now()) / 1000), 0);
      setTimeLeft(s);
      if (s <= 0) {
        clearInterval(interval);
        setOtpError("OTP expired. Please resend.");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [otpExpiry]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-3 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-slate-400 text-sm">Loading your profile…</p>
      </div>
    </div>
  );

  if (!user) return null;

  const hasBankDetails = user.withdrawalMethod === "bank" && !!user.bankName && !!user.bankAccountName && !!user.bankAccountNumber;
  const hasMobileDetails = user.withdrawalMethod === "mobile" && !!user.mobileProvider && !!user.mobileNumber;
  const hasWithdrawalDetails = hasBankDetails || hasMobileDetails;

  const statusStyle = {
    approved: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    rejected:  { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    pending:   { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  };

  const startEdit = () => {
    setIsEditing(true);
    setEditStep(0);
    setOtp("");
    setOtpError("");
    setOtpExpiry(null);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditStep(0);
    setOtp("");
    setOtpError("");
    setOtpExpiry(null);
  };

  const handleSendOtp = async () => {
    setSendingOtp(true);
    setOtpError("");
    try {
      await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user!.email }),
      });
      setOtpExpiry(Date.now() + 5 * 60 * 1000);
      setTimeLeft(300);
      setEditStep(2);
    } catch {
      setOtpError("Failed to send OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyAndSave = async () => {
    if (otp.length < 6) { setOtpError("Please enter the full 6-digit code."); return; }
    setSaving(true);
    setOtpError("");
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user!.email, code: otp }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) { setOtpError("Incorrect code. Please check and try again."); return; }

      const saveRes = await fetch("/api/withdrawaldetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      if (saveRes.ok) {
        setIsEditing(false);
        setEditStep(0);
        setOtp("");
        setOtpExpiry(null);
      } else {
        setOtpError("Saved OTP but failed to save details. Please retry.");
      }
    } catch {
      setOtpError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const fmt = (t: number) =>
    `${Math.floor(t / 60).toString().padStart(2, "0")}:${(t % 60).toString().padStart(2, "0")}`;

  return (
    <>
      <style>{`
        @keyframes slide-up {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .slide-up { animation: slide-up 0.35s ease both; }
        @keyframes fade-in {
          from { opacity:0; }
          to   { opacity:1; }
        }
        .fade-in { animation: fade-in 0.25s ease both; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <NavBar />
      <div className="min-h-screen pt-20 px-4 pb-12" style={{ background: "linear-gradient(135deg, #f0f6ff 0%, #fafbff 50%, #f4f0ff 100%)" }}>
        <div className="max-w-5xl mx-auto pt-6 flex flex-col md:flex-row gap-5">

          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 flex flex-col gap-5">

            {/* Profile card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden slide-up">
              <div className="px-6 pt-6 pb-4 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
                    style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-lg leading-tight">{user.name}</p>
                    <p className="text-slate-400 text-sm">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-y divide-slate-50">
                {[
                  { icon: <Wallet size={18} />, label: "Wallet Balance", value: `Ksh ${Number(user.walletBalance).toFixed(2)}`, color: "#3b82f6" },
                  { icon: <Smartphone size={18} />, label: "Total Invested", value: `Ksh ${Number(user.totalInvested).toFixed(2)}`, color: "#6366f1" },
                  { icon: <BadgeCheck size={18} />, label: "Interest Earned", value: `Ksh ${Number(user.totalInterestEarned ?? 0).toFixed(2)}`, color: "#10b981" },
                ].map((item, i) => (
                  <div key={i} className="px-5 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${item.color}18`, color: item.color }}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">{item.label}</p>
                      <p className="font-bold text-slate-800 text-sm">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 slide-up" style={{ animationDelay: "0.08s" }}>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={20} className="text-blue-500" />
                <h3 className="font-bold text-slate-800">Identity Verification</h3>
              </div>
              {!verification ? (
                <div className="rounded-xl p-4 flex items-start gap-3"
                  style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                  <Clock size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-amber-800 text-sm font-medium">No ID submitted yet</p>
                    <button onClick={() => router.push("/profile")}
                      className="mt-2 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition"
                      style={{ background: "#f59e0b" }}>
                      Verify Now →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{
                      background: statusStyle[verification.status].bg,
                      color: statusStyle[verification.status].color,
                      border: `1px solid ${statusStyle[verification.status].border}`,
                    }}>
                    {verification.status === "approved" && <CheckCircle size={13} />}
                    {verification.status === "pending" && <Clock size={13} />}
                    {verification.status.toUpperCase()}
                  </span>
                  <p className="text-slate-400 text-sm">
                    {verification.status === "approved" ? "Your identity has been verified." :
                     verification.status === "pending" ? "Under review — usually takes 1–2 days." :
                     "Verification was rejected. Please resubmit."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN — Withdrawal Details ── */}
          <div className="flex-1 slide-up" style={{ animationDelay: "0.12s" }}>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">Withdrawal Details</h3>
                  <p className="text-slate-400 text-xs mt-0.5">How you receive your funds</p>
                </div>
                {hasWithdrawalDetails && !isEditing && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                    style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
                    <CheckCircle size={13} /> Saved
                  </span>
                )}
              </div>

              <div className="p-6">

                {/* ── VIEW MODE ── */}
                {!isEditing && (
                  <div className="fade-in">
                    {hasWithdrawalDetails ? (
                      <div className="space-y-3 mb-6">
                        <div className="rounded-xl p-4 flex items-center gap-4"
                          style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                            {user.withdrawalMethod === "bank"
                              ? <Building2 size={20} />
                              : <Smartphone size={20} />}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Method</p>
                            <p className="font-semibold text-slate-800 capitalize">
                              {user.withdrawalMethod === "bank" ? "Bank Transfer" : "Mobile Money"}
                            </p>
                          </div>
                        </div>

                        {user.withdrawalMethod === "bank" ? (
                          <>
                            {[
                              { label: "Bank", value: user.bankName },
                              { label: "Account Name", value: user.bankAccountName },
                              { label: "Account Number", value: user.bankAccountNumber },
                            ].map(({ label, value }) => (
                              <div key={label} className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-sm text-slate-400">{label}</span>
                                <span className="text-sm font-semibold text-slate-700">{value}</span>
                              </div>
                            ))}
                          </>
                        ) : (
                          <>
                            {[
                              { label: "Provider", value: user.mobileProvider },
                              { label: "Number", value: user.mobileNumber },
                            ].map(({ label, value }) => (
                              <div key={label} className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-sm text-slate-400">{label}</span>
                                <span className="text-sm font-semibold text-slate-700">{value}</span>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl p-5 mb-6 text-center"
                        style={{ background: "#f8fafc", border: "1.5px dashed #cbd5e1" }}>
                        <Wallet size={32} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-slate-500 text-sm font-medium">No withdrawal method set</p>
                        <p className="text-slate-400 text-xs mt-1">Add your bank or mobile money details to enable withdrawals.</p>
                      </div>
                    )}

                    <button onClick={startEdit}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all"
                      style={{ background: "#3b82f6", color: "#fff", boxShadow: "0 4px 14px rgba(59,130,246,0.3)" }}
                      onMouseOver={e => (e.currentTarget.style.background = "#2563eb")}
                      onMouseOut={e => (e.currentTarget.style.background = "#3b82f6")}
                    >
                      <Pencil size={15} />
                      {hasWithdrawalDetails ? "Edit Details" : "Add Withdrawal Method"}
                    </button>
                  </div>
                )}

                {/* ── EDIT MODE — STEP 0: choose method ── */}
                {isEditing && editStep === 0 && (
                  <div className="fade-in">
                    <StepDots step={0} total={3} />
                    <p className="text-sm font-semibold text-slate-700 mb-4">Choose your withdrawal method</p>
                    <div className="flex gap-3 mb-6">
                      <MethodCard
                        icon={<Building2 size={22} />}
                        label="Bank Transfer"
                        value="bank"
                        selected={user.withdrawalMethod === "bank"}
                        disabled={false}
                        onClick={() => setUser({ ...user, withdrawalMethod: "bank" })}
                      />
                      <MethodCard
                        icon={<Smartphone size={22} />}
                        label="Mobile Money"
                        value="mobile"
                        selected={user.withdrawalMethod === "mobile"}
                        disabled={false}
                        onClick={() => setUser({ ...user, withdrawalMethod: "mobile" })}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={cancelEdit}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border"
                        style={{ borderColor: "#e2e8f0", color: "#64748b", background: "#f8fafc" }}>
                        Cancel
                      </button>
                      <button
                        disabled={!user.withdrawalMethod}
                        onClick={() => setEditStep(1)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
                        style={{
                          background: user.withdrawalMethod ? "#3b82f6" : "#e2e8f0",
                          color: user.withdrawalMethod ? "#fff" : "#94a3b8",
                          cursor: user.withdrawalMethod ? "pointer" : "not-allowed",
                        }}>
                        Next <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── EDIT MODE — STEP 1: fill details ── */}
                {isEditing && editStep === 1 && (
                  <div className="fade-in">
                    <StepDots step={1} total={3} />
                    <p className="text-sm font-semibold text-slate-700 mb-4">
                      {user.withdrawalMethod === "bank" ? "Enter your bank details" : "Enter your mobile money details"}
                    </p>
                    <div className="space-y-4 mb-6">
                      {user.withdrawalMethod === "bank" ? (
                        <>
                          <Field label="Bank Name" placeholder="e.g. Equity Bank" value={user.bankName || ""} onChange={v => setUser({ ...user, bankName: v })} disabled={false} />
                          <Field label="Account Holder Name" placeholder="Full name as on account" value={user.bankAccountName || ""} onChange={v => setUser({ ...user, bankAccountName: v })} disabled={false} />
                          <Field label="Account Number" placeholder="e.g. 0123456789" value={user.bankAccountNumber || ""} onChange={v => setUser({ ...user, bankAccountNumber: v })} disabled={false} />
                        </>
                      ) : (
                        <>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Provider</label>
                            <select
                              value={user.mobileProvider || ""}
                              onChange={e => setUser({ ...user, mobileProvider: e.target.value })}
                              className="w-full rounded-lg px-4 py-2.5 text-sm text-slate-800"
                              style={{ background: "#fff", border: "1.5px solid #cbd5e1", outline: "none" }}>
                              <option value="">Select provider</option>
                              <option value="M-Pesa">M-Pesa (Safaricom)</option>
                              <option value="Airtel Money">Airtel Money</option>
                              <option value="T-Kash">T-Kash (Telkom)</option>
                            </select>
                          </div>
                          <Field label="Mobile Number" placeholder="e.g. 0712 345 678" value={user.mobileNumber || ""} onChange={v => setUser({ ...user, mobileNumber: v })} disabled={false} type="tel" />
                        </>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setEditStep(0)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                        style={{ borderColor: "#e2e8f0", color: "#64748b", background: "#f8fafc" }}>
                        Back
                      </button>
                      <button
                        onClick={handleSendOtp}
                        disabled={sendingOtp}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                        style={{ background: "#3b82f6", color: "#fff", boxShadow: "0 4px 14px rgba(59,130,246,0.3)", opacity: sendingOtp ? 0.7 : 1 }}>
                        {sendingOtp
                          ? <><RefreshCw size={15} className="spin" /> Sending…</>
                          : <>Send OTP <ChevronRight size={15} /></>}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── EDIT MODE — STEP 2: OTP verification ── */}
                {isEditing && editStep === 2 && (
                  <div className="fade-in">
                    <StepDots step={2} total={3} />
                    <div className="text-center mb-6">
                      <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                        style={{ background: "rgba(59,130,246,0.08)" }}>
                        <ShieldCheck size={28} className="text-blue-500" />
                      </div>
                      <p className="font-bold text-slate-800">Verify it's you</p>
                      <p className="text-slate-400 text-sm mt-1">
                        We sent a 6-digit code to<br />
                        <span className="font-semibold text-slate-600">{user.email}</span>
                      </p>
                    </div>

                    <div className="mb-5">
                      <OtpInput value={otp} onChange={v => { setOtp(v); setOtpError(""); }} />
                    </div>

                    {/* Timer */}
                    <div className="flex items-center justify-center gap-2 mb-1">
                      {timeLeft > 0 ? (
                        <span className="text-sm text-slate-400">
                          Code expires in <span className="font-bold text-blue-500">{fmt(timeLeft)}</span>
                        </span>
                      ) : (
                        <button
                          onClick={async () => {
                            await sendOtp(user.email);
                            setOtpExpiry(Date.now() + 5 * 60 * 1000);
                            setOtp("");
                            setOtpError("");
                          }}
                          className="flex items-center gap-1.5 text-sm font-semibold text-blue-500 hover:text-blue-700 transition">
                          <RefreshCw size={13} /> Resend code
                        </button>
                      )}
                    </div>

                    {otpError && (
                      <p className="text-center text-red-500 text-xs mt-2 mb-1">{otpError}</p>
                    )}

                    <div className="flex gap-3 mt-5">
                      <button onClick={() => { setEditStep(1); setOtp(""); setOtpError(""); }}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                        style={{ borderColor: "#e2e8f0", color: "#64748b", background: "#f8fafc" }}>
                        Back
                      </button>
                      <button
                        onClick={handleVerifyAndSave}
                        disabled={saving || otp.length < 6}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                        style={{
                          background: otp.length === 6 ? "#3b82f6" : "#e2e8f0",
                          color: otp.length === 6 ? "#fff" : "#94a3b8",
                          opacity: saving ? 0.7 : 1,
                          cursor: otp.length < 6 || saving ? "not-allowed" : "pointer",
                          boxShadow: otp.length === 6 ? "0 4px 14px rgba(59,130,246,0.3)" : "none",
                        }}>
                        {saving
                          ? <><RefreshCw size={15} className="spin" /> Saving…</>
                          : <><CheckCircle size={15} /> Confirm & Save</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
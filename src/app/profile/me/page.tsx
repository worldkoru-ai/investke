'use client';

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/app/NavBar/page";
import {
  CheckCircle, Clock, Wallet, TrendingUp, Edit3,
  Building2, Smartphone, ShieldCheck, X, Loader2,
  ChevronRight, RefreshCw, AlertCircle
} from "lucide-react";

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

type Toast = { type: "success" | "error" | "info"; message: string } | null;
type EditStep = "form" | "otp" | "saving" | "done";

function ToastNotif({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  const styles = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error:   "bg-red-50 border-red-200 text-red-800",
    info:    "bg-blue-50 border-blue-200 text-blue-800",
  };
  const Icon = toast.type === "success" ? CheckCircle : toast.type === "error" ? AlertCircle : ShieldCheck;
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium max-w-sm toastin ${styles[toast.type]}`}>
      <Icon size={16} className="shrink-0" />
      {toast.message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X size={14} /></button>
    </div>
  );
}

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };
  const handleChange = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...digits]; next[i] = d;
    onChange(next.join("").slice(0, 6));
    if (d && i < 5) inputs.current[i + 1]?.focus();
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1}
          value={digits[i] || ""}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          className="w-11 h-13 text-center text-xl font-bold border-2 rounded-xl text-slate-800
            border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          style={{ height: 52 }}
        />
      ))}
    </div>
  );
}

function MethodCard({ icon: Icon, label, selected, disabled, onClick }: {
  icon: React.ElementType; label: string; selected: boolean; disabled: boolean; onClick: () => void;
}) {
  return (
    <button type="button" disabled={disabled} onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-2 py-4 px-2 rounded-xl border-2 transition-all
        ${selected ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50/40"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <Icon size={22} className={selected ? "text-blue-500" : "text-slate-400"} />
      <span className="text-xs font-semibold">{label}</span>
      {selected && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
    </button>
  );
}

function StatCard({ icon: Icon, label, value, accent }: {
  icon: React.ElementType; label: string; value: string; accent: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-base font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

const STEPS: EditStep[] = ["form", "otp", "saving"];
const STEP_LABELS = ["Details", "Verify", "Save"];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editStep, setEditStep] = useState<EditStep>("form");
  const [otp, setOtp] = useState("");
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [toast, setToast] = useState<Toast>(null);
  const [draft, setDraft] = useState<Partial<User>>({});

  const showToast = (type: NonNullable<Toast>["type"], message: string) =>
    setToast({ type, message });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (!res.ok) { router.push("/login"); return; }
        setUser(data.user);
        setVerification(data.verification);
      } catch { router.push("/login"); }
      finally { setLoading(false); }
    })();
  }, [router]);

  useEffect(() => {
    if (!otpExpiry) return;
    const iv = setInterval(() => {
      const s = Math.max(Math.floor((otpExpiry - Date.now()) / 1000), 0);
      setTimeLeft(s);
      if (s <= 0) clearInterval(iv);
    }, 1000);
    return () => clearInterval(iv);
  }, [otpExpiry]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-500" size={32} />
    </div>
  );
  if (!user) return null;

  const hasBankDetails   = user.withdrawalMethod === "bank"   && !!user.bankName && !!user.bankAccountName && !!user.bankAccountNumber;
  const hasMobileDetails = user.withdrawalMethod === "mobile" && !!user.mobileProvider && !!user.mobileNumber;
  const hasWithdrawalDetails = hasBankDetails || hasMobileDetails;

  const startEditing = () => { setDraft({ ...user }); setIsEditing(true); setEditStep("form"); setOtp(""); };
  const cancelEditing = () => { setIsEditing(false); setEditStep("form"); setOtp(""); setOtpExpiry(null); };
  const updateDraft = (fields: Partial<User>) => setDraft(prev => ({ ...prev, ...fields }));

  const d: Partial<User> = isEditing ? draft : user;

  const handleRequestOtp = async () => {
    setEditStep("otp");
    try {
      await fetch("/api/send-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      setOtpExpiry(Date.now() + 5 * 60 * 1000);
      showToast("info", "OTP sent to your email address.");
    } catch {
      showToast("error", "Failed to send OTP. Please try again.");
      setEditStep("form");
    }
  };

  const handleResendOtp = async () => {
    setOtp("");
    try {
      await fetch("/api/send-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      setOtpExpiry(Date.now() + 5 * 60 * 1000);
      showToast("info", "New OTP sent!");
    } catch { showToast("error", "Failed to resend OTP."); }
  };

  const handleVerifyAndSave = async () => {
    if (otp.length < 6) { showToast("error", "Please enter the full 6-digit OTP."); return; }
    setEditStep("saving");
    try {
      const vRes = await fetch("/api/verify-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, code: otp }),
      });
      const vData = await vRes.json();
      if (!vRes.ok || !vData.valid) {
        showToast("error", "Invalid or expired OTP. Please try again.");
        setEditStep("otp"); return;
      }
      const sRes = await fetch("/api/withdrawaldetails", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...user, ...draft }),
      });
      if (!sRes.ok) throw new Error();
      setUser(prev => prev ? { ...prev, ...draft } : prev);
      setEditStep("done");
      showToast("success", "Withdrawal details saved successfully!");
      setTimeout(() => { setIsEditing(false); setEditStep("form"); }, 1400);
    } catch {
      showToast("error", "Something went wrong. Please try again.");
      setEditStep("otp");
    }
  };

  const statusConfig = {
    approved: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Verified", icon: CheckCircle },
    rejected: { cls: "bg-red-50 text-red-700 border-red-200",             label: "Rejected",  icon: AlertCircle },
    pending:  { cls: "bg-amber-50 text-amber-700 border-amber-200",        label: "Pending Review", icon: Clock },
  };

  const stepIndex = STEPS.indexOf(editStep);

  return (
    <>
      <style>{`
        @keyframes toastin  { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeup   { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .toastin   { animation: toastin 0.3s ease both; }
        .fadeup    { animation: fadeup 0.35s ease both; }
        .fadeup-1  { animation: fadeup 0.35s 0.05s ease both; opacity:0; }
        .fadeup-2  { animation: fadeup 0.35s 0.10s ease both; opacity:0; }
        .fadeup-3  { animation: fadeup 0.35s 0.15s ease both; opacity:0; }
        .fadeup-4  { animation: fadeup 0.35s 0.20s ease both; opacity:0; }
      `}</style>

      <ToastNotif toast={toast} onClose={() => setToast(null)} />
      <NavBar />

      <div className="min-h-screen bg-slate-50 pt-24 px-4 pb-16">
        <div className="max-w-5xl mx-auto space-y-5">

          {/* Header */}
          <div className="fadeup">
            <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
            <p className="text-slate-400 text-sm mt-0.5">Manage your account and withdrawal preferences</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 fadeup-1">
            <StatCard icon={Wallet}    label="Wallet Balance"   value={`Ksh ${Number(user.walletBalance).toLocaleString("en-KE",{minimumFractionDigits:2})}`}         accent="bg-blue-500" />
            <StatCard icon={TrendingUp} label="Total Invested"  value={`Ksh ${Number(user.totalInvested).toLocaleString("en-KE",{minimumFractionDigits:2})}`}          accent="bg-indigo-500" />
            <StatCard icon={CheckCircle} label="Interest Earned" value={`Ksh ${Number(user.totalInterestEarned||0).toLocaleString("en-KE",{minimumFractionDigits:2})}`} accent="bg-emerald-500" />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Left */}
            <div className="space-y-4">
              {/* Profile card */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 fadeup-2">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 leading-tight">{user.name}</p>
                    <p className="text-slate-400 text-sm">{user.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[{ label: "Full Name", value: user.name }, { label: "Email", value: user.email }].map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                      <p className="font-semibold text-slate-700 text-sm truncate">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 fadeup-3">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck size={17} className="text-slate-400" />
                  <h3 className="font-bold text-slate-800">Identity Verification</h3>
                </div>
                {!verification ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-amber-700 text-sm font-medium mb-3">No ID document submitted yet</p>
                    <button onClick={() => router.push("/verify")}
                      className="flex items-center gap-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                      Verify Identity <ChevronRight size={14} />
                    </button>
                  </div>
                ) : (() => {
                  const { cls, label, icon: SIcon } = statusConfig[verification.status];
                  return (
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${cls}`}>
                      <SIcon size={14} /> {label}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Right — Withdrawal */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden fadeup-4">
              {/* Card header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">Withdrawal Details</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {hasWithdrawalDetails ? "Your payout method is configured" : "Set up how you receive payouts"}
                  </p>
                </div>
                {hasWithdrawalDetails && !isEditing && (
                  <button onClick={startEditing}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                    <Edit3 size={12} /> Edit
                  </button>
                )}
                {isEditing && (
                  <button onClick={cancelEditing} className="text-slate-300 hover:text-slate-500 transition-colors">
                    <X size={18} />
                  </button>
                )}
              </div>

              <div className="p-6">
                {/* Step progress bar */}
                {isEditing && editStep !== "done" && (
                  <div className="mb-6">
                    <div className="flex items-center gap-0">
                      {STEPS.map((s, i) => (
                        <div key={s} className="flex items-center" style={{ flex: i < STEPS.length - 1 ? 1 : "none" }}>
                          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300
                            ${i < stepIndex ? "bg-blue-500 border-blue-500 text-white" :
                              i === stepIndex ? "bg-white border-blue-500 text-blue-600" :
                              "bg-white border-slate-200 text-slate-400"}`}>
                            {i < stepIndex ? <CheckCircle size={13}/> : i + 1}
                          </div>
                          {i < STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 transition-all duration-300 ${i < stepIndex ? "bg-blue-400" : "bg-slate-200"}`} />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-1.5">
                      {STEP_LABELS.map((l, i) => (
                        <span key={l} className={`text-xs font-medium transition-colors ${i === stepIndex ? "text-blue-600" : "text-slate-400"}`}>{l}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── FORM ── */}
                {(!isEditing || editStep === "form") && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Payment Method</p>
                      <div className="flex gap-2">
                        <MethodCard icon={Building2}  label="Bank Transfer"  selected={d.withdrawalMethod === "bank"}   disabled={!isEditing && hasWithdrawalDetails} onClick={() => updateDraft({ withdrawalMethod: "bank" })} />
                        <MethodCard icon={Smartphone} label="Mobile Money"   selected={d.withdrawalMethod === "mobile"} disabled={!isEditing && hasWithdrawalDetails} onClick={() => updateDraft({ withdrawalMethod: "mobile" })} />
                      </div>
                    </div>

                    {d.withdrawalMethod === "bank" && (
                      <div className="space-y-3">
                        {[
                          { key: "bankName",          label: "Bank Name",         placeholder: "e.g. KCB, Equity" },
                          { key: "bankAccountName",   label: "Account Holder",    placeholder: "Full name on account" },
                          { key: "bankAccountNumber", label: "Account Number",    placeholder: "Account number" },
                        ].map(({ key, label, placeholder }) => (
                          <div key={key}>
                            <label className="text-xs font-semibold text-slate-400 block mb-1">{label}</label>
                            <input
                              disabled={!isEditing && hasWithdrawalDetails}
                              placeholder={placeholder}
                              value={(d as any)[key] || ""}
                              onChange={e => updateDraft({ [key]: e.target.value })}
                              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm
                                placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white
                                focus:ring-2 focus:ring-blue-100 disabled:opacity-60 disabled:cursor-not-allowed transition"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {d.withdrawalMethod === "mobile" && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-400 block mb-2">Provider</label>
                          <div className="flex gap-2">
                            {["M-Pesa", "Airtel Money", "T-Kash"].map(p => (
                              <button key={p} type="button"
                                disabled={!isEditing && hasWithdrawalDetails}
                                onClick={() => updateDraft({ mobileProvider: p })}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all
                                  ${d.mobileProvider === p ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-blue-50/40"}
                                  disabled:opacity-50 disabled:cursor-not-allowed`}>
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-400 block mb-1">Mobile Number</label>
                          <input
                            disabled={!isEditing && hasWithdrawalDetails}
                            placeholder="07XX XXX XXX"
                            value={d.mobileNumber || ""}
                            onChange={e => updateDraft({ mobileNumber: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm
                              placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white
                              focus:ring-2 focus:ring-blue-100 disabled:opacity-60 disabled:cursor-not-allowed transition"
                          />
                        </div>
                      </div>
                    )}

                    {!isEditing && !hasWithdrawalDetails && (
                      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-center">
                        <p className="text-slate-400 text-sm">No withdrawal method set up yet</p>
                      </div>
                    )}

                    {isEditing ? (
                      <button onClick={handleRequestOtp} disabled={!d.withdrawalMethod}
                        className="w-full mt-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700
                          disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm">
                        Continue <ChevronRight size={16} />
                      </button>
                    ) : !hasWithdrawalDetails && (
                      <button onClick={startEditing}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700
                          text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm">
                        <Edit3 size={15} /> Set Up Withdrawal
                      </button>
                    )}
                  </div>
                )}

                {/* ── OTP ── */}
                {isEditing && editStep === "otp" && (
                  <div className="space-y-5 fadeup">
                    <div className="text-center">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <ShieldCheck className="text-blue-500" size={26} />
                      </div>
                      <p className="font-bold text-slate-800 text-base">Verify it's you</p>
                      <p className="text-slate-400 text-sm mt-1">
                        Enter the 6-digit code sent to<br />
                        <span className="font-semibold text-slate-600">{user.email}</span>
                      </p>
                    </div>

                    <OtpInput value={otp} onChange={setOtp} />

                    <p className="text-center text-xs text-slate-400">
                      {timeLeft > 0
                        ? <>Expires in <span className="font-bold text-slate-600 tabular-nums">
                            {String(Math.floor(timeLeft / 60)).padStart(2,"0")}:{String(timeLeft % 60).padStart(2,"0")}
                          </span></>
                        : <span className="text-red-500 font-medium">Code expired</span>}
                    </p>

                    <button onClick={handleVerifyAndSave} disabled={otp.length < 6}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700
                        disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm">
                      <ShieldCheck size={16} /> Verify & Save
                    </button>

                    <p className="text-center text-sm text-slate-400">
                      Didn't receive it?{" "}
                      <button onClick={handleResendOtp}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                        <RefreshCw size={12} /> Resend
                      </button>
                    </p>
                  </div>
                )}

                {/* ── SAVING ── */}
                {isEditing && editStep === "saving" && (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 fadeup">
                    <Loader2 className="animate-spin text-blue-500" size={30} />
                    <p className="text-slate-400 text-sm">Saving your details…</p>
                  </div>
                )}

                {/* ── DONE ── */}
                {isEditing && editStep === "done" && (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 fadeup">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                      <CheckCircle className="text-emerald-500" size={34} />
                    </div>
                    <p className="font-bold text-slate-800">All saved!</p>
                    <p className="text-slate-400 text-sm">Your withdrawal details have been updated.</p>
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
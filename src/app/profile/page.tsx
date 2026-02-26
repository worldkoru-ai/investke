'use client';

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Upload, ChevronDown, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";

const ID_TYPES = [
  { value: "National ID", label: "National ID", icon: "🪪" },
  { value: "Passport", label: "Passport", icon: "📘" },
  { value: "Driving License", label: "Driving License", icon: "🚗" },
];

const REQUIRES_BACK = ["National ID"];

function FileUploadZone({
  label,
  side,
  file,
  onChange,
}: {
  label: string;
  side: "Front" | "Back";
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const previewUrl = file ? URL.createObjectURL(file) : null;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-600 tracking-wide uppercase">
        {label}
      </label>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const dropped = e.dataTransfer.files?.[0];
          if (dropped) onChange(dropped);
        }}
        className={`
          relative group cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 overflow-hidden
          ${dragging ? "border-violet-500 bg-violet-50 scale-[1.01]" : "border-slate-200 hover:border-violet-400 hover:bg-violet-50/40"}
          ${file ? "border-emerald-400 bg-emerald-50/30" : ""}
        `}
        style={{ minHeight: "140px" }}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt={`${side} Preview`}
              className="w-full h-36 object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-medium">Click to replace</span>
            </div>
            <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-1">
              <CheckCircle2 size={14} className="text-white" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors
              ${dragging ? "bg-violet-100" : "bg-slate-100 group-hover:bg-violet-100"}
            `}>
              <Upload size={20} className={`transition-colors ${dragging ? "text-violet-500" : "text-slate-400 group-hover:text-violet-500"}`} />
            </div>
            <p className="text-sm font-medium text-slate-600">Drop image here</p>
            <p className="text-xs text-slate-400 mt-1">or click to browse</p>
            <p className="text-xs text-slate-300 mt-2">PNG, JPG up to 10MB</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
      </div>

      {file && (
        <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
          <CheckCircle2 size={12} />
          {file.name}
        </p>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [idType, setIdType] = useState("");
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const needsBack = REQUIRES_BACK.includes(idType);

  useEffect(() => {
    fetch("/api/me")
      .then(res => res.json())
      .then(data => {
        if (!data.user) router.push("/login");
        setUser(data.user);
      });
  }, []);

  const handleSubmit = async () => {
    if (!idType || !front || (needsBack && !back)) {
      alert("Please fill in all required fields before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("userId", user.id);
    formData.append("idType", idType);
    formData.append("front", front);
    if (needsBack && back) formData.append("back", back);

    setLoading(true);

    const res = await fetch("/api/profile", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) return alert(data.error);
    setSubmitted(true);
  };

  if (!user) return null;

  const allFilled = !!idType && !!front && (needsBack ? !!back : true);
  const totalSteps = needsBack ? 3 : 2;
  const completedSteps = [idType, front, needsBack ? back : true].filter(Boolean).length;
  const remainingSteps = [!idType, !front, needsBack && !back].filter(Boolean).length;

  const steps = [
    { label: "ID Type", done: !!idType },
    { label: "Front", done: !!front },
    ...(needsBack ? [{ label: "Back", done: !!back }] : []),
  ];

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap');`}</style>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 w-full max-w-md p-10 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Submitted!
          </h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Your verification documents have been submitted. We'll review and get back to you within 24–48 hours.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Serif+Display&display=swap');
        .select-arrow { appearance: none; -webkit-appearance: none; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up-1 { animation: fadeUp 0.5s 0.05s ease both; }
        .fade-up-2 { animation: fadeUp 0.5s 0.15s ease both; }
        .fade-up-3 { animation: fadeUp 0.5s 0.25s ease both; }
        .fade-up-4 { animation: fadeUp 0.5s 0.35s ease both; }
      `}</style>

      <div className="w-full max-w-lg">
        <button
          onClick={() => router.push("/dashboard")}
          className="fade-up-1 flex items-center gap-2 text-slate-400 hover:text-slate-700 mb-6 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="fade-up-1 bg-blue-800  px-8 py-7 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
                Identity Verification
              </h2>
              <p className="text-slate-400 text-sm mt-0.5">Secure your account with a valid ID</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-slate-100">
            <div
              className="h-full bg-violet-500 transition-all duration-500 ease-out"
              style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
            />
          </div>

          <div className="px-8 py-7 space-y-6">
            {/* Step indicator */}
            <div className="fade-up-1 flex items-center gap-3 text-xs text-slate-400">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${step.done ? "bg-violet-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                    {step.done ? "✓" : i + 1}
                  </div>
                  <span className={step.done ? "text-violet-600 font-medium" : ""}>{step.label}</span>
                  {i < steps.length - 1 && <div className="w-4 h-px bg-slate-200 ml-1" />}
                </div>
              ))}
            </div>

            {/* ID Type Select */}
            <div className="fade-up-2 space-y-2">
              <label className="block text-sm font-semibold text-slate-600 tracking-wide uppercase">
                Document Type
              </label>
              <div className="relative">
                <select
                  className="select-arrow w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent cursor-pointer transition-all hover:border-slate-300 pr-10"
                  onChange={e => {
                    setIdType(e.target.value);
                    if (!REQUIRES_BACK.includes(e.target.value)) setBack(null);
                  }}
                  value={idType}
                >
                  <option value="">Choose a document type...</option>
                  {ID_TYPES.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.icon} {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              {idType && (
                <p className="text-xs text-violet-600 font-medium flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  {idType} selected
                  {!needsBack && (
                    <span className="text-slate-400 font-normal ml-1">· front side only</span>
                  )}
                </p>
              )}
            </div>

            {/* Upload zones */}
            {idType && (
              <div className={`fade-up-3 grid gap-4 ${needsBack ? "grid-cols-2" : "grid-cols-1"}`}>
                <FileUploadZone
                  label={needsBack ? "Front Side" : "Upload Document"}
                  side="Front"
                  file={front}
                  onChange={setFront}
                />
                {needsBack && (
                  <FileUploadZone
                    label="Back Side"
                    side="Back"
                    file={back}
                    onChange={setBack}
                  />
                )}
              </div>
            )}

            {/* Security notice */}
            <div className="fade-up-3 flex gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <span className="text-lg leading-none">🔒</span>
              <p className="text-xs text-amber-700 leading-relaxed">
                Your documents are encrypted and stored securely. They will only be used for identity verification purposes.
              </p>
            </div>

            {/* Submit */}
            <div className="fade-up-4">
              <button
                onClick={handleSubmit}
                disabled={loading || !allFilled}
                className={`
                  w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2
                  ${allFilled && !loading
                    ? "bg-slate-900 text-white hover:bg-slate-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }
                `}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Uploading documents...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Submit Verification
                  </>
                )}
              </button>

              {!allFilled && remainingSteps > 0 && (
                <p className="text-center text-xs text-slate-400 mt-2">
                  Complete {remainingSteps} remaining step{remainingSteps > 1 ? "s" : ""} to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
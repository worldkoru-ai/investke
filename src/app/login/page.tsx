"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const clearSession = async () => {
      await fetch("/api/logout", { method: "POST" });
    };
    clearSession();
  }, []);

  const form = { email, password };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setForgotMessage("");
    if (!forgotEmail) return setForgotMessage("Please enter your email");
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      setForgotMessage(data.message || "Check your email for instructions");
    } catch (err) {
      console.error(err);
      setForgotMessage("Something went wrong");
    }
  };

  return (
    <>
      <style>{`
        @keyframes drift-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(60px, -80px) scale(1.1); }
          66%       { transform: translate(-40px, 50px) scale(0.95); }
        }
        @keyframes drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(-70px, 60px) scale(1.05); }
          66%       { transform: translate(50px, -40px) scale(1.1); }
        }
        @keyframes drift-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(30px, 70px) scale(1.08); }
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .orb-1 { animation: drift-1 18s ease-in-out infinite; }
        .orb-2 { animation: drift-2 22s ease-in-out infinite; }
        .orb-3 { animation: drift-3 15s ease-in-out infinite; }
        .card-fadein { animation: fadein 0.6s ease both; }

        .login-bg {
          background-color: #060d1f;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.10);
          box-shadow:
            0 0 0 1px rgba(99, 179, 237, 0.08),
            0 32px 64px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .input-dark {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: #e2e8f0;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-dark::placeholder { color: rgba(255,255,255,0.28); }
        .input-dark:focus {
          outline: none;
          border-color: rgba(99,179,237,0.7);
          box-shadow: 0 0 0 3px rgba(99,179,237,0.15);
        }
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          box-shadow: 0 4px 20px rgba(59,130,246,0.35);
          transition: box-shadow 0.2s, transform 0.15s, opacity 0.2s;
        }
        .btn-primary:hover:not(:disabled) {
          box-shadow: 0 6px 28px rgba(59,130,246,0.5);
          transform: translateY(-1px);
        }
        .btn-primary:disabled { opacity: 0.5; }
        .forgot-panel {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 12px;
        }
        .ticker-bar {
          background: rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          font-family: 'Courier New', monospace;
          font-size: 11px;
          letter-spacing: 0.05em;
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ticker-inner { animation: ticker 30s linear infinite; white-space: nowrap; }
      `}</style>

      <div className="login-bg min-h-screen flex flex-col overflow-hidden relative">

        {/* Ambient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="orb-1 absolute top-[-120px] left-[-80px] w-[480px] h-[480px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)" }} />
          <div className="orb-2 absolute bottom-[-100px] right-[-60px] w-[520px] h-[520px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)" }} />
          <div className="orb-3 absolute top-[40%] left-[55%] w-[360px] h-[360px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)" }} />
        </div>

        {/* Ticker bar */}
        <div className="ticker-bar relative z-10 py-2 px-4 overflow-hidden">
          <div className="ticker-inner inline-flex gap-8 text-slate-400">
            {[
              "AAPL +1.24%", "TSLA -0.87%", "BTC +3.12%", "ETH +2.05%",
              "NVDA +5.30%", "AMZN +0.62%", "MSFT +1.18%", "GOOGL -0.34%",
              "SOL +4.71%", "SPY +0.45%",
              "AAPL +1.24%", "TSLA -0.87%", "BTC +3.12%", "ETH +2.05%",
              "NVDA +5.30%", "AMZN +0.62%", "MSFT +1.18%", "GOOGL -0.34%",
              "SOL +4.71%", "SPY +0.45%",
            ].map((t, i) => (
              <span key={i} className={t.includes("+") ? "text-emerald-400" : "text-red-400"}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-4 relative z-10">
          <div className="card-fadein glass-card rounded-2xl p-8 w-full max-w-md">

            {/* Logo */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <polyline points="1,12 5,7 9,9 15,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="11,3 15,3 15,7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">Exovest</span>
              </div>
              <p className="text-slate-400 text-sm">Sign in to access your investment dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-dark w-full px-4 py-2.5 rounded-lg"
                />
              </div>

              <div className="relative">
                <label className="block text-slate-300 text-sm font-medium mb-1.5">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-dark w-full px-4 py-2.5 rounded-lg pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && (
                <p className="text-red-400 text-sm font-medium text-center bg-red-500/10 rounded-lg py-2 px-3 border border-red-500/20">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-white font-semibold py-2.5 rounded-lg"
              >
                {loading ? "Signing In…" : "Sign In"}
              </button>
            </form>

            {/* Forgot Password */}
            <p className="text-right text-sm mt-3">
              <button
                className="text-blue-400 hover:text-blue-300 transition-colors"
                onClick={() => setShowForgot(!showForgot)}
              >
                Forgot Password?
              </button>
            </p>

            {showForgot && (
              <div className="mt-4 p-4 forgot-panel">
                <p className="text-slate-300 text-sm mb-2">
                  Enter your email to reset password:
                </p>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-dark w-full px-3 py-2 rounded-lg mb-2"
                />
                <button
                  onClick={handleForgotPassword}
                  className="btn-primary w-full text-white py-2 rounded-lg"
                >
                  Send Reset Link
                </button>
                {forgotMessage && (
                  <p className="text-sm text-emerald-400 mt-2">{forgotMessage}</p>
                )}
              </div>
            )}

            <p className="text-center text-slate-500 text-sm mt-5">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-center py-4 text-slate-600 text-xs">
          © {new Date().getFullYear()} Exovest. All rights reserved.
        </div>
      </div>
    </>
  );
}
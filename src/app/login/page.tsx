"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

const ChartDoodles = () => (
  <>
    <style>{`
      @keyframes float-a {
        0%,100% { transform: translate(0,0) rotate(-6deg); opacity:0.13; }
        50%      { transform: translate(-30px, 40px) rotate(4deg); opacity:0.20; }
      }
      @keyframes float-b {
        0%,100% { transform: translate(0,0) rotate(8deg); opacity:0.10; }
        50%      { transform: translate(40px,-35px) rotate(-5deg); opacity:0.18; }
      }
      @keyframes float-c {
        0%,100% { transform: translate(0,0) rotate(-3deg); opacity:0.12; }
        33%      { transform: translate(25px, 20px) rotate(6deg); opacity:0.19; }
        66%      { transform: translate(-20px, 35px) rotate(-8deg); opacity:0.14; }
      }
      @keyframes float-d {
        0%,100% { transform: translate(0,0) rotate(5deg); opacity:0.09; }
        50%      { transform: translate(-35px,-25px) rotate(-3deg); opacity:0.17; }
      }
      @keyframes float-e {
        0%,100% { transform: translate(0,0) rotate(-10deg); opacity:0.11; }
        50%      { transform: translate(20px, 45px) rotate(7deg); opacity:0.16; }
      }
      .doodle-a { animation: float-a 14s ease-in-out infinite; }
      .doodle-b { animation: float-b 18s ease-in-out infinite; }
      .doodle-c { animation: float-c 20s ease-in-out infinite; }
      .doodle-d { animation: float-d 16s ease-in-out infinite; }
      .doodle-e { animation: float-e 22s ease-in-out infinite; }
    `}</style>

    {/* Top-left: Line chart */}
    <div className="doodle-a absolute top-[5%] left-[4%] pointer-events-none">
      <svg width="160" height="90" viewBox="0 0 160 90" fill="none">
        <polyline points="0,70 25,50 50,58 75,30 100,38 130,10 160,20"
          stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="75" cy="30" r="4" fill="#3b82f6"/>
        <circle cx="130" cy="10" r="4" fill="#3b82f6"/>
        <line x1="0" y1="85" x2="160" y2="85" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4"/>
      </svg>
    </div>

    {/* Top-right: Candlestick chart */}
    <div className="doodle-b absolute top-[8%] right-[5%] pointer-events-none">
      <svg width="140" height="110" viewBox="0 0 140 110" fill="none">
        {[
          { x:10, top:20, open:35, close:60, bot:75, up:true },
          { x:32, top:30, open:55, close:40, bot:70, up:false },
          { x:54, top:15, open:30, close:55, bot:65, up:true },
          { x:76, top:25, open:65, close:45, bot:80, up:false },
          { x:98, top:10, open:25, close:50, bot:60, up:true },
          { x:120,top:5,  open:20, close:45, bot:55, up:true },
        ].map((c,i) => (
          <g key={i}>
            <line x1={c.x+5} y1={c.top} x2={c.x+5} y2={c.bot}
              stroke={c.up ? "#10b981" : "#f87171"} strokeWidth="1.5"/>
            <rect x={c.x} y={Math.min(c.open,c.close)} width="10"
              height={Math.abs(c.close-c.open)}
              fill={c.up ? "#10b981" : "#f87171"} rx="1"/>
          </g>
        ))}
      </svg>
    </div>

    {/* Mid-left: Bar chart */}
    <div className="doodle-c absolute top-[45%] left-[2%] pointer-events-none">
      <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
        {[{x:5,h:40},{x:25,h:65},{x:45,h:50},{x:65,h:80},{x:85,h:55},{x:105,h:70}].map((b,i) => (
          <rect key={i} x={b.x} y={90-b.h} width="14" height={b.h}
            fill="#6366f1" rx="2" opacity={0.65 + i*0.05}/>
        ))}
        <line x1="0" y1="90" x2="120" y2="90" stroke="#6366f1" strokeWidth="1.5"/>
      </svg>
    </div>

    {/* Mid-right: Area chart */}
    <div className="doodle-d absolute top-[40%] right-[3%] pointer-events-none">
      <svg width="150" height="90" viewBox="0 0 150 90" fill="none">
        <defs>
          <linearGradient id="lgAreaLogin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d="M0,70 C20,60 35,40 55,45 C75,50 90,20 110,25 C130,30 140,15 150,10 L150,85 L0,85 Z"
          fill="url(#lgAreaLogin)"/>
        <path d="M0,70 C20,60 35,40 55,45 C75,50 90,20 110,25 C130,30 140,15 150,10"
          stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      </svg>
    </div>

    {/* Bottom-left: Donut chart */}
    <div className="doodle-e absolute bottom-[8%] left-[5%] pointer-events-none">
      <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
        <circle cx="45" cy="45" r="35" stroke="#6366f1" strokeWidth="12"
          strokeDasharray="88 132" strokeDashoffset="-22"/>
        <circle cx="45" cy="45" r="35" stroke="#10b981" strokeWidth="12"
          strokeDasharray="55 165" strokeDashoffset="-110"/>
        <circle cx="45" cy="45" r="35" stroke="#3b82f6" strokeWidth="12"
          strokeDasharray="44 176" strokeDashoffset="-165"/>
        <circle cx="45" cy="45" r="22" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.08"/>
      </svg>
    </div>

    {/* Bottom-right: Scatter plot */}
    <div className="doodle-b absolute bottom-[10%] right-[5%] pointer-events-none" style={{animationDelay:"-7s"}}>
      <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
        <line x1="10" y1="90" x2="110" y2="90" stroke="#10b981" strokeWidth="1.5"/>
        <line x1="10" y1="90" x2="10" y2="10"  stroke="#10b981" strokeWidth="1.5"/>
        {[[30,70],[50,55],[45,40],[70,35],[85,20],[60,50],[95,15],[75,45]].map(([cx,cy],i) => (
          <circle key={i} cx={cx} cy={cy} r="4"
            fill="none" stroke="#10b981" strokeWidth="1.5" opacity={0.7}/>
        ))}
        <line x1="15" y1="80" x2="105" y2="20" stroke="#10b981"
          strokeWidth="1" strokeDasharray="5 4" opacity="0.5"/>
      </svg>
    </div>

    {/* Top-center: Moving average lines */}
    <div className="doodle-c absolute top-[2%] left-[35%] pointer-events-none" style={{animationDelay:"-5s"}}>
      <svg width="180" height="60" viewBox="0 0 180 60" fill="none">
        <polyline points="0,45 30,38 60,42 90,20 120,28 150,12 180,18"
          stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 3"/>
        <polyline points="0,50 30,44 60,48 90,30 120,36 150,22 180,26"
          stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  </>
);

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
        @keyframes fadein {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-fadein { animation: fadein 0.6s ease both; }

        .login-bg {
          background-color: #e8f0fe;
          background-image:
            linear-gradient(rgba(59,130,246,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.07) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .glass-card {
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(59,130,246,0.15);
          box-shadow:
            0 0 0 1px rgba(59,130,246,0.08),
            0 24px 56px rgba(59,130,246,0.12),
            inset 0 1px 0 rgba(255,255,255,0.9);
        }
        .input-dark {
          background: rgba(255,255,255,0.85);
          border: 1px solid rgba(59,130,246,0.2);
          color: #1e293b;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-dark::placeholder { color: #94a3b8; }
        .input-dark:focus {
          outline: none;
          border-color: rgba(59,130,246,0.6);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
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
          background: rgba(255,255,255,0.6);
          border: 1px solid rgba(59,130,246,0.15);
          border-radius: 12px;
        }
        .ticker-bar {
          background: rgba(255,255,255,0.5);
          border-bottom: 1px solid rgba(59,130,246,0.12);
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

        {/* Chart doodles */}
        <ChartDoodles />

        {/* Soft glow behind card */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div style={{
            width: 500, height: 500, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)"
          }}/>
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
              <span key={i} className={t.includes("+") ? "text-emerald-600" : "text-red-500"}>
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
                <span className="text-2xl font-bold text-blue-700 tracking-tight">Exovest</span>
              </div>
              <p className="text-slate-500 text-sm">Sign in to access your investment dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-1.5">
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
                <label className="block text-slate-600 text-sm font-medium mb-1.5">
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
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 transition-colors"
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
                <p className="text-slate-600 text-sm mb-2">
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
              <Link href="/signup" className="text-blue-600 hover:text-blue-700 transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-center py-4 text-slate-400 text-xs">
          © {new Date().getFullYear()} Exovest. All rights reserved.
        </div>
      </div>
    </>
  );
}
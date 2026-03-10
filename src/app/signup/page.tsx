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
          { x:120, top:5,  open:20, close:45, bot:55, up:true },
        ].map((c,i) => (
          <g key={i}>
            <line x1={c.x+5} y1={c.top} x2={c.x+5} y2={c.bot}
              stroke={c.up ? "#10b981" : "#f87171"} strokeWidth="1.5"/>
            <rect x={c.x} y={Math.min(c.open,c.close)} width="10"
              height={Math.abs(c.close - c.open)}
              fill={c.up ? "#10b981" : "#f87171"} rx="1"/>
          </g>
        ))}
      </svg>
    </div>

    {/* Mid-left: Bar chart */}
    <div className="doodle-c absolute top-[42%] left-[2%] pointer-events-none">
      <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
        {[
          { x:5,  h:40 },
          { x:25, h:65 },
          { x:45, h:50 },
          { x:65, h:80 },
          { x:85, h:55 },
          { x:105,h:70 },
        ].map((b,i) => (
          <rect key={i} x={b.x} y={90-b.h} width="14" height={b.h}
            fill="#6366f1" rx="2" opacity={0.7 + i*0.05}/>
        ))}
        <line x1="0" y1="90" x2="120" y2="90" stroke="#6366f1" strokeWidth="1.5"/>
      </svg>
    </div>

    {/* Mid-right: Area chart */}
    <div className="doodle-d absolute top-[38%] right-[3%] pointer-events-none">
      <svg width="150" height="90" viewBox="0 0 150 90" fill="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d="M0,70 C20,60 35,40 55,45 C75,50 90,20 110,25 C130,30 140,15 150,10 L150,85 L0,85 Z"
          fill="url(#areaGrad)"/>
        <path d="M0,70 C20,60 35,40 55,45 C75,50 90,20 110,25 C130,30 140,15 150,10"
          stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      </svg>
    </div>

    {/* Bottom-left: Pie/donut */}
    <div className="doodle-e absolute bottom-[8%] left-[6%] pointer-events-none">
      <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
        <circle cx="45" cy="45" r="35" stroke="#6366f1" strokeWidth="12"
          strokeDasharray="88 132" strokeDashoffset="-22"/>
        <circle cx="45" cy="45" r="35" stroke="#10b981" strokeWidth="12"
          strokeDasharray="55 165" strokeDashoffset="-110"/>
        <circle cx="45" cy="45" r="35" stroke="#3b82f6" strokeWidth="12"
          strokeDasharray="44 176" strokeDashoffset="-165"/>
        <circle cx="45" cy="45" r="22" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.1"/>
      </svg>
    </div>

    {/* Bottom-right: Scatter plot */}
    <div className="doodle-b absolute bottom-[10%] right-[5%] pointer-events-none" style={{animationDelay:"-7s"}}>
      <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
        <line x1="10" y1="90" x2="110" y2="90" stroke="#10b981" strokeWidth="1.5"/>
        <line x1="10" y1="90" x2="10" y2="10"  stroke="#10b981" strokeWidth="1.5"/>
        {[
          [30,70],[50,55],[45,40],[70,35],[85,20],[60,50],[95,15],[75,45]
        ].map(([cx,cy],i) => (
          <circle key={i} cx={cx} cy={cy} r="4"
            fill="none" stroke="#10b981" strokeWidth="1.5" opacity={0.7}/>
        ))}
        <line x1="15" y1="80" x2="105" y2="20" stroke="#10b981"
          strokeWidth="1" strokeDasharray="5 4" opacity="0.5"/>
      </svg>
    </div>

    {/* Center-top: Moving average lines */}
    <div className="doodle-c absolute top-[2%] left-[38%] pointer-events-none" style={{animationDelay:"-5s"}}>
      <svg width="180" height="60" viewBox="0 0 180 60" fill="none">
        <polyline points="0,45 30,38 60,42 90,20 120,28 150,12 180,18"
          stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 3"/>
        <polyline points="0,50 30,44 60,48 90,30 120,36 150,22 180,26"
          stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  </>
);

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const router = useRouter();

  useEffect(() => {
    const clearSession = async () => {
      await fetch("/api/logout", { method: "POST" });
    };
    clearSession();
  }, []);

  const handleChange = (e: { target: { name: any; value: any } }) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.name === "email"
          ? e.target.value.toLowerCase()
          : e.target.value,
    }));
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Account created successfully! Please login.");
        router.push("/login");
        return;
      }
      alert(data.error || "Registration failed");
    } catch (err) {
      console.error("Error:", err);
      alert("Registration failed");
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadein-up {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .register-bg {
          background-color: #060d1f;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow:
            0 0 0 1px rgba(99,179,237,0.07),
            0 32px 64px rgba(0,0,0,0.55),
            inset 0 1px 0 rgba(255,255,255,0.07);
          animation: fadein-up 0.55s ease both;
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
          box-shadow: 0 0 0 3px rgba(99,179,237,0.14);
        }
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          box-shadow: 0 4px 20px rgba(59,130,246,0.35);
          transition: box-shadow 0.2s, transform 0.15s;
        }
        .btn-primary:hover {
          box-shadow: 0 6px 28px rgba(59,130,246,0.5);
          transform: translateY(-1px);
        }
        .divider-line {
          border-color: rgba(255,255,255,0.10);
        }
        .ticker-bar {
          background: rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          font-family: 'Courier New', monospace;
          font-size: 11px;
          letter-spacing: 0.05em;
        }
        .ticker-inner { animation: ticker 30s linear infinite; white-space: nowrap; }
      `}</style>

      <div className="register-bg min-h-screen flex flex-col overflow-hidden relative">

        {/* Chart doodles */}
        <ChartDoodles />

        {/* Soft glow behind card */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div style={{
            width: 500, height: 500, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)"
          }}/>
        </div>

        {/* Ticker */}
        <div className="ticker-bar relative z-10 py-2 overflow-hidden">
          <div className="ticker-inner inline-flex gap-8 px-4 text-slate-400">
            {[
              "AAPL +1.24%","TSLA -0.87%","BTC +3.12%","ETH +2.05%",
              "NVDA +5.30%","AMZN +0.62%","MSFT +1.18%","GOOGL -0.34%",
              "SOL +4.71%","SPY +0.45%",
              "AAPL +1.24%","TSLA -0.87%","BTC +3.12%","ETH +2.05%",
              "NVDA +5.30%","AMZN +0.62%","MSFT +1.18%","GOOGL -0.34%",
              "SOL +4.71%","SPY +0.45%",
            ].map((t,i) => (
              <span key={i} className={t.includes("+") ? "text-emerald-400" : "text-red-400"}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
          <div className="glass-card rounded-2xl p-8 w-full max-w-md">

            {/* Logo */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <polyline points="1,12 5,7 9,9 15,3"
                      stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="11,3 15,3 15,7"
                      stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">Exovest</span>
              </div>
              <h2 className="text-lg font-semibold text-white mt-1">Create Your Account</h2>
              <p className="text-slate-400 text-sm mt-1">Start your smart investment journey today.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-dark w-full px-4 py-2.5 rounded-lg"
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-dark w-full px-4 py-2.5 rounded-lg"
              />

              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-dark w-full px-4 py-2.5 rounded-lg pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="input-dark w-full px-4 py-2.5 rounded-lg pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>

              <button
                type="submit"
                className="btn-primary w-full text-white py-2.5 rounded-lg font-semibold"
              >
                Sign Up
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 border-t divider-line"/>
              <span className="text-slate-500 text-xs">or</span>
              <div className="flex-1 border-t divider-line"/>
            </div>

            <p className="text-center text-slate-500 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </div>

        <div className="relative z-10 text-center py-4 text-slate-600 text-xs">
          © {new Date().getFullYear()} Exovest. All rights reserved.
        </div>
      </div>
    </>
  );
}
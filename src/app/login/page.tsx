"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const router = useRouter();

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
    <div className="flex items-center justify-center min-h-[85vh] bg-gray-50 px-4">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md mt-[-30px]">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-1">
          Exovest
        </h2>
        <p className="text-center text-gray-500 mb-5 text-sm">
          Sign in to access your investment dashboard
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm font-medium text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Forgot Password */}
        <p className="text-right text-sm mt-2">
          <button
            className="text-blue-600 hover:underline"
            onClick={() => setShowForgot(!showForgot)}
          >
            Forgot Password?
          </button>
        </p>

        {showForgot && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <p className="text-gray-700 text-sm mb-2">
              Enter your email to reset password:
            </p>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 border rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={handleForgotPassword}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Send Reset Link
            </button>
            {forgotMessage && (
              <p className="text-sm text-green-600 mt-2">{forgotMessage}</p>
            )}
          </div>
        )}

        <p className="text-center text-gray-500 text-sm mt-5">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
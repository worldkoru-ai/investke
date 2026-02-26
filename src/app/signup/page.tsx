"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";


export default function Register() {
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
  

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

      setFormData((prev) => ({
    ...prev,
    [e.target.name]: e.target.name === "email" ? e.target.value.toLowerCase() : e.target.value,
  }));
  };


const handleSubmit = async (e: { preventDefault: () => void; }) => {
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
      router.push("/login");  // ← Redirect to login
      return;
    }

    alert(data.error || "Registration failed");
  } catch (err) {
    console.error("Error:", err);
    alert("Registration failed");
  }
};
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-2">
          Create Your Exovest Account
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Start your smart investment journey today.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
          onClick={handleSubmit}
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
          >
            Sign Up
          </button>
        </form>

        <div className="my-4 flex items-center justify-center">
          <div className="border-t border-gray-300 w-1/3"></div>
          <span className="mx-2 text-gray-400 text-sm">or</span>
          <div className="border-t border-gray-300 w-1/3"></div>
        </div>


        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};


"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, TrendingUp, User, Settings, ChevronDown } from "lucide-react";

interface UserType {
  id: number;
  name: string;
  email: string;
  profile_photo?: string;
}

export default function NavBar() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("User load error:", err);
      }
    };
    fetchUser();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Logout
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* LOGO */}
          <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-indigo-600">Exovest</h1>
          </Link>

          {/* NAV LINKS */}
          <div className="flex items-center gap-6">
            <Link href="/admin/sitehome">
              <span className="hidden sm:inline text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                Home
              </span>
            </Link>


            <Link href="/admin/investments">
              <span className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                Investments
              </span>
            </Link>

            {/* USER PROFILE DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full border border-gray-200 hover:border-indigo-400 transition"
              >
                {/* Profile Photo */}
                {user?.profile_photo ? (
                  <img
                    src={user.profile_photo}
                    className="w-8 h-8 rounded-full object-cover"
                    alt="User"
                  />
                ) : (
                  <User className="w-7 h-7 text-gray-500" />
                )}

                {/* NAME */}
                <span className="font-medium text-gray-700 text-sm">{user?.name}</span>

                <ChevronDown
                  className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* MENU */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border shadow-md rounded-lg py-2 animate-fadeIn">
                  
                  <Link
                    href="/admin/users"
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 cursor-pointer"
                  >
                    <User size={15} /> Users
                  </Link>

                  <Link
                    href="/admin/withdrawals"
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 cursor-pointer"
                  >
                    <Settings size={15} /> Withdrawals
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex w-full text-left items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}


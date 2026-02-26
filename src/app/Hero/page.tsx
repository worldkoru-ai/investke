"use client"
import React from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Shield, Zap } from "lucide-react";

export default function Hero() {
  const router = useRouter();
  
  return (
<section className="relative mx-4 sm:mx-6 lg:mx-auto lg:max-w-7xl flex flex-col items-center justify-center text-center py-24 px-6 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white overflow-hidden rounded-3xl shadow-xl">      
      {/* Floating Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl top-10 left-10 animate-pulse"></div>
        <div className="absolute w-64 h-64 bg-purple-500/20 rounded-full blur-3xl bottom-10 right-10 animate-pulse"></div>
        <div className="absolute w-40 h-40 bg-blue-400/15 rounded-full blur-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
          Structured Investment. Measured Growth.
        </h1>

        <p className="text-lg md:text-xl text-gray-100 mb-8 leading-relaxed">
          Exovest is a secure digital investment platform designed to help 
          individuals grow capital through structured plans, transparent 
          reporting, and disciplined investment strategies.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-2xl mx-auto">
          
          <div className="flex flex-col items-center gap-2">
            <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">Structured Returns</h3>
            <p className="text-sm text-gray-200">
              Fixed-term investment plans with clear performance tracking
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">Secure Infrastructure</h3>
            <p className="text-sm text-gray-200">
              Identity verification and protected account access
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">Controlled Withdrawals</h3>
            <p className="text-sm text-gray-200">
              Withdraw funds to verified mobile or bank accounts
            </p>
          </div>

        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-6 mt-8">
          <button
            onClick={() => router.push('/signup')}
            className="bg-white text-indigo-700 font-semibold px-8 py-4 rounded-lg shadow-lg hover:bg-gray-100 hover:shadow-xl transition-all transform hover:scale-105"
          >
            Open Secure Account
          </button>

          <button 
            onClick={() => router.push('/login')}
            className="border-2 border-white text-white font-semibold px-8 py-4 rounded-lg hover:bg-white hover:text-indigo-700 transition-all transform hover:scale-105"
          >
            View Investment Plans
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap justify-center gap-10 text-sm">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold">3</span>
            <span className="text-gray-200">Structured Plans</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold">24/7</span>
            <span className="text-gray-200">Account Access</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold">Verified</span>
            <span className="text-gray-200">User Accounts</span>
          </div>
        </div>
      </div>

      {/* Sub Text */}
      <div className="relative z-10 mt-12 text-gray-200 text-sm">
        🇰🇪 Empowering Kenyan Investors Through Structured Digital Finance
      </div>

    </section>
  );
}
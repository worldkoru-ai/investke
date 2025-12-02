import React from "react";

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center py-24 px-6 bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600 text-white overflow-hidden rounded-3xl shadow-xl">
      {/* Floating Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute w-48 h-48 bg-blue-400/20 rounded-full blur-3xl top-10 left-10 animate-pulse"></div>
        <div className="absolute w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl bottom-10 right-10 animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
          Smart Investing for a Smarter Future
        </h1>
        <p className="text-lg md:text-xl text-gray-100 mb-8 leading-relaxed">
          Watch your money grow daily through real trading, real business, and real profits.  
          Exovest gives you control, clarity, and confidence in your investments.
        </p>

        <div className="flex flex-wrap justify-center gap-6 mt-6">
          <button className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-gray-100 transition">
            Get Started
          </button>
          <button className="border border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white hover:text-blue-700 transition">
            Learn More
          </button>
        </div>
      </div>

      {/* Sub Text */}
      <div className="relative z-10 mt-10 text-gray-200 text-sm italic">
        Trusted by investors worldwide —  transparent, simple, and rewarding.
      </div>
    </section>
  );
}
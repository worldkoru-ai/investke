'use client';
import React from 'react';
import Link from 'next/link';
import { LogOut, TrendingUp } from 'lucide-react';

export default function NavBar() {
    function onNavigate(arg0: string): void {
        throw new Error('Function not implemented.');
    }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-indigo-600">InvestPro</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('topup')}
              className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
            >
              Save
            </button>
            <Link href="/Invest" >
              <button
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                Invest
              </button>
            </Link>
       

            <button
              onClick={() => onNavigate('logout')}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};


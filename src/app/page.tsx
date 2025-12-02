
'use client';
import Link from 'next/link';
import { useState } from 'react';
import Home from './Home/page';




export default function Navigation() {

    return (
       <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 ">
        {/* Navbar */}
        <header className="bg-white shadow-md sticky top-0 z-50">
          <nav className="container mx-auto flex items-center justify-between p-4">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Exovest
            </Link>
            <div className="flex gap-4">

              <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </header>
        <>
        <Home />
        </>
         </div>
    );
}
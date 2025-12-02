import React from 'react';

const AboutUs = () => (
    <div className="about-us">
        <section id="about" className="container mx-auto text-center px-6">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">About Exovest</h2>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Exovest is a modern investment platform designed to make trading simple, transparent, and rewarding. 
            We connect investors’ funds to real businesses, enabling them to earn profits daily. Our mission is to
            empower everyone — from beginners to professionals — to grow wealth confidently with smart, automated strategies.
            </p>

            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white shadow-lg p-6 rounded-2xl hover:shadow-xl transition">
                <h3 className="text-xl font-semibold mb-2 text-blue-600">Real Business Model</h3>
                <p className="text-gray-600 text-sm">
                Your money is actively used to trade and invest in real opportunities, generating real profits daily.
                </p>
            </div>
            <div className="bg-white shadow-lg p-6 rounded-2xl hover:shadow-xl transition">
                <h3 className="text-xl font-semibold mb-2 text-blue-600">Transparency</h3>
                <p className="text-gray-600 text-sm">
                Every investor has access to performance analytics and profit tracking — you always know how your money is growing.
                </p>
            </div>
            <div className="bg-white shadow-lg p-6 rounded-2xl hover:shadow-xl transition">
                <h3 className="text-xl font-semibold mb-2 text-blue-600">Flexible Withdrawals</h3>
                <p className="text-gray-600 text-sm">
                Withdraw profits anytime or reinvest to multiply your gains — your control, your choice.
                </p>
            </div>
            </div>
        </section>
    </div>
);

export default AboutUs;
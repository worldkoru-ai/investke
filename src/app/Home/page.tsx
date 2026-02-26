"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { TrendingUp, Wallet, Clock, Shield, ArrowRight } from "lucide-react";
import Hero from "../Hero/page";
import AboutUs from "../AboutUs/page";

export default function Home() {
  const router = useRouter();
  
const testimonials = [
  {
    id: 1,
    name: "Jane M., Nairobi",
    quote:
      "The structured plans and transparent dashboard give me clarity and confidence in how my capital is performing.",
  },
  {
    id: 2,
    name: "Peter K., Mombasa",
    quote:
      "I appreciate the clear reporting and disciplined investment structure. Everything feels professionally managed.",
  },
  {
    id: 3,
    name: "Rose W., Kisumu",
    quote:
      "The verification process and controlled withdrawals make the platform feel secure and trustworthy.",
  },
  {
    id: 4,
    name: "David O., Eldoret",
    quote:
      "Performance tracking is straightforward and transparent. It helps me plan my finances better.",
  },
  {
    id: 5,
    name: "Sarah N., Nakuru",
    quote:
      "The structured terms and clarity in returns make this a valuable addition to my portfolio.",
  },
  {
    id: 6,
    name: "James M., Thika",
    quote:
      "Account management and reporting are well organized. It feels like a serious financial platform.",
  },
];

  const [visibleSet, setVisibleSet] = useState(0);
  const testimonialsPerPage = 3;
  const totalPages = Math.ceil(testimonials.length / testimonialsPerPage);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleSet(prev => (prev + 1) % totalPages);
    }, 10000);
    return () => clearInterval(interval);
  }, [totalPages]);

  const visibleTestimonials = testimonials.slice(
    visibleSet * testimonialsPerPage,
    visibleSet * testimonialsPerPage + testimonialsPerPage
  );

const features = [
  {
    icon: <TrendingUp className="w-8 h-8 text-indigo-600" />,
    title: "Structured Investment Plans",
    description:
      "Clearly defined investment tiers with fixed durations and transparent performance metrics.",
  },
  {
    icon: <Wallet className="w-8 h-8 text-green-600" />,
    title: "Verified Withdrawals",
    description:
      "Withdraw funds to verified mobile or bank accounts through a structured approval process.",
  },
  {
    icon: <Clock className="w-8 h-8 text-blue-600" />,
    title: "Real-Time Dashboard",
    description:
      "Monitor capital allocation, performance tracking, and transaction history anytime.",
  },
  {
    icon: <Shield className="w-8 h-8 text-purple-600" />,
    title: "Secure Infrastructure",
    description:
      "Identity verification, encrypted sessions, and controlled administrative oversight.",
  },
];

  const plans = [
    {
      name: "Growth",
      rate: "13%",
      duration: "90 days",
      minAmount: "Ksh 10,000",
      color: "from-blue-500 to-indigo-600",
    },
    {
      name: "Premium",
      rate: "18%",
      duration: "180 days",
      minAmount: "Ksh 50,000",
      color: "from-blue-700 to-indigo-900",
      popular: true,
    },
    {
      name: "Elite",
      rate: "25%",
      duration: "365 days",
      minAmount: "Ksh 100,000",
      color: "from-blue-900 to-black",
    },
  ];

  return (
    <div className="space-y-20 bg-white max-w-7xl mx-auto mt-8">
      <Hero />

      {/* How It Works Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-black mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Structured investment in three clear steps          
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">Create Account</h3>
              <p className="text-gray-600">
                Register securely and complete identity verification to activate your investment account.
              </p>
            </div>

            <div className="relative">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">Choose a Plan</h3>
              <p className="text-gray-600">
               Select a structured investment plan aligned with your financial objectives.
              </p>
            </div>

            <div className="relative">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">Watch It Grow</h3>
              <p className="text-gray-600">
                Track capital performance and projected returns from your dashboard.
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push('/signup')}
            className="mt-10 bg-indigo-600 text-white font-semibold px-8 py-4 rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Begin Investment Journey
          </button>
        </div>
      </section>

      {/* Investment Plans Preview */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Investment Plans
          </h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Choose a plan that fits your financial goals
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-gradient-to-br ${plan.color} rounded-2xl p-8 text-white transform hover:scale-105 transition-all shadow-xl`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-5xl font-extrabold my-6">{plan.rate}</div>
                <p className="text-lg mb-4">Annual Returns</p>
                
                <div className="space-y-2 text-left mb-6">
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    Duration: {plan.duration}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    Minimum: {plan.minAmount}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    Daily compound interest
                  </p>
                </div>

                <button
                  onClick={() => router.push('/login')}
                  className="w-full bg-white text-gray-900 font-semibold py-3 rounded-lg hover:bg-gray-100 transition-all"
                >
                  Invest Now
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/login')}
            className="mt-10 text-indigo-600 font-semibold px-8 py-3 rounded-lg border-2 border-indigo-600 hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 mx-auto"
          >
            View All Plans <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">
            Why Choose Us
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="success" className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            What Our Investors Say
          </h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Real stories from real people growing their wealth with us
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <AnimatePresence mode="wait">
              {visibleTestimonials.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 1.2 }}
                  className="bg-white p-6 rounded-2xl shadow-md transform hover:-translate-y-2 transition-all border border-gray-100"
                >
                  <div className="text-4xl text-indigo-600 mb-4">"</div>
                  <p className="text-gray-600 italic mb-4">{t.quote}</p>
                  <h4 className="font-semibold text-indigo-600"> {t.name}</h4>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setVisibleSet(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === visibleSet ? "bg-indigo-600 w-8" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <p className="text-gray-400 text-sm mt-6 italic">
            Investor experiences rotate automatically
          </p>
        </div>
      </section>

    </div>
  );
}
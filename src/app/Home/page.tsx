"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Hero from "../Hero/page";
import AboutUs from "../AboutUs/page";

export default function Home() {
  const testimonials = [
    {
      id: 1,
      name: "Grace, Nairobi",
      quote:
        "I started small with Exovest and within three months, I’ve seen consistent daily profits. It’s simple and real.",
    },
    {
      id: 2,
      name: "Michael, Accra",
      quote:
        "What I love most is the transparency. I can track everything — profits, growth, and withdrawals — right from my dashboard.",
    },
    {
      id: 3,
      name: "Fatima, Dubai",
      quote:
        "Exovest changed my mindset about investing. I no longer fear putting my money to work — it’s empowering.",
    },
    {
      id: 4,
      name: "David, Cape Town",
      quote:
        "Reliable, easy to use, and smooth withdrawals. Exovest feels like the future of global investing.",
    },
    {
      id: 5,
      name: "Sarah, London",
      quote:
        "The interface is beautiful and intuitive. I love how my profits grow daily without stress.",
    },
    {
      id: 6,
      name: "Ali, Dubai",
      quote:
        "I recommended Exovest to my colleagues — we’re all earning together now!",
    },
  ];

  const [visibleSet, setVisibleSet] = useState(0);

  // Switch between first 3 and last 3 cards every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleSet((prev) => (prev === 0 ? 1 : 0));
    }, 60000); // 60 seconds
    return () => clearInterval(interval);
  }, []);

  const visibleTestimonials = testimonials.slice(visibleSet * 3, visibleSet * 3 + 3);

  return (
    <div className="space-y-20 bg-white max-w-7xl mx-auto mt-8">
        <>
        <Hero />
        <AboutUs />
        </>

      <section id="success" className="py-16 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-10">
            What Our Investors Say
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <AnimatePresence mode="wait">
              {visibleTestimonials.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 1.2 }}
                  className="bg-white p-6 rounded-2xl shadow-md transform hover:-translate-y-2 transition"
                >
                  <p className="text-gray-600 italic mb-4">“{t.quote}”</p>
                  <h4 className="font-semibold text-blue-600">— {t.name}</h4>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <p className="text-gray-400 text-sm mt-6 italic">
            Stories refresh automatically every minute ✨
          </p>
        </div>
      </section>
    </div>
  );
}
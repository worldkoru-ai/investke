"use client";
import React, { useState, useEffect, useRef } from "react";
import { DollarSign, Calendar, ArrowLeft } from "lucide-react";
import NavBar from "../NavBar/page";

type CompoundingPeriod = "daily" | "weekly" | "monthly";

type InvestmentPlan = {
  id: string;
  name: string;
  description: string;
  interestRate: number;
  minAmount: number;
  maxAmount: number;
  durationDays: number;
  compoundingPeriod: CompoundingPeriod;
};

export default function Invest() {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "paystack">("paystack");
  const [user, setUser] = useState<any>(null);

  const amountRef = useRef<HTMLInputElement>(null);

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/me");
      const data = await res.json();
      if (res.ok) setUser(data.user);
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    }
  };

  // Fetch investment plans
  const loadPlans = async () => {
    try {
      const res = await fetch("/api/plans");
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (err) {
      console.error("Failed to load plans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    loadPlans();
  }, []);

  useEffect(() => {
    if (showModal) amountRef.current?.focus();
  }, [showModal]);

  // Calculate projected returns
  const calculateReturn = () => {
    if (!selectedPlan || !investmentAmount) return null;
    const amount = parseFloat(investmentAmount);
    const periodsPerYear = { daily: 365, weekly: 52, monthly: 12 };
    const n = periodsPerYear[selectedPlan.compoundingPeriod];
    const r = selectedPlan.interestRate / 100;
    const t = selectedPlan.durationDays / 365;
    const totalAmount = amount * Math.pow(1 + r / n, n * t);
    return { principal: amount, interest: totalAmount - amount, total: totalAmount };
  };

  // Handle wallet investment
  const handleWalletInvest = async (planId: string, amount: number) => {
    if (!user) return;
    fetchUserData(); // refresh user data

    try {
      const res = await fetch("/api/invest/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, planId, amount }),
      });

      const data = await res.json(); // always JSON from API
      console.log("Wallet invest response:", data);

      if (!res.ok) {
        alert(data.error || "Wallet investment failed.");
        return;
      }

      alert(data.message || "Investment successful from wallet!");
      await fetchUserData(); // refresh wallet balance
      setShowModal(false);
    } catch (err) {
      console.error("Wallet investment failed:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  // Handle Paystack investment
  const handlePaystackInvest = async (planId: string, amount: number) => {
    if (!user) return;

   try {
    const response = await fetch("/api/invest/paystack/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(amount),
        userId: user.id,
        email: user.email,
        planId,
        callback_url: `${window.location.origin}/payment/invest/verify`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error initializing Paystack payment:", data.error);
      alert(data.error);
      return;
    }

    window.location.href = data.data.authorization_url;

  } catch (err) {
    console.error("Failed to initialize Paystack payment:", err);
    alert("Payment initialization failed. Try again.");
  }
};

  // Handle form submit
  const handleSubmit = () => {
    if (!selectedPlan) return;

    const amount = parseFloat(investmentAmount);
    if (!amount || amount < selectedPlan.minAmount || amount > selectedPlan.maxAmount) {
      alert(`Enter a valid amount between ${selectedPlan.minAmount} and ${selectedPlan.maxAmount}`);
      return;
    }

    paymentMethod === "wallet"
      ? handleWalletInvest(selectedPlan.id, amount)
      : handlePaystackInvest(selectedPlan.id, amount);
  };

  const returns = calculateReturn();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <NavBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        <button
          onClick={() => window.location.replace("/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Investment Plan</h2>
        <p className="text-gray-600 mb-8">Select a plan that fits your goals</p>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-xl bg-blue-100 shadow-sm p-6 border-2 cursor-pointer transition-all ${
                  selectedPlan?.id === plan.id
                    ? "border-indigo-600 shadow-lg transform scale-105"
                    : "border-gray-200 hover:border-indigo-300 hover:shadow-md"
                }`}
                onClick={() => {
                  setSelectedPlan(plan);
                  setShowModal(true);
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                </div>
                <p className="text-3xl font-bold text-indigo-600 mb-2">{plan.interestRate}% p.a</p>
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <DollarSign className="w-4 h-4" />
                    <span>Min: Ksh. {plan.minAmount} - Max: Ksh. {plan.maxAmount}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4" />
                    <span>Duration: {plan.durationDays} days</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-indigo-50 rounded-lg shadow-lg w-full max-w-md p-8">
              <h3 className="text-lg text-black font-semibold mb-4">
                Invest in {selectedPlan.name}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-black mb-1">Investment Amount (KSH)</label>
                  <input
                    ref={amountRef}
                    type="number"
                    className="w-full border text-black px-4 py-2 rounded"
                    placeholder={`Min: ${selectedPlan.minAmount}, Max: ${selectedPlan.maxAmount}`}
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-black mb-1">Payment Method</label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        checked={paymentMethod === "wallet"}
                        onChange={() => setPaymentMethod("wallet")}
                      />{" "}
                      Wallet
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        checked={paymentMethod === "paystack"}
                        onChange={() => setPaymentMethod("paystack")}
                      />{" "}
                      Paystack
                    </label>
                  </div>
                  {paymentMethod === "wallet" && user && (
                    <p className="mt-1 text-sm text-gray-700">
                      Wallet Balance: Ksh. {user.walletBalance}
                    </p>
                  )}
                </div>

                {returns && (
                  <div className="bg-white p-4 rounded shadow">
                    <h4 className="text-black font-semibold mb-2">Projected Returns:</h4>
                    <p className="text-black">Principal: {returns.principal.toFixed(2)}</p>
                    <p className="text-black">Interest: {returns.interest.toFixed(2)}</p>
                    <p className="text-black font-bold">Total: {returns.total.toFixed(2)}</p>
                  </div>
                )}

                <div className="flex justify-end gap-3 border-t pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-black bg-gray-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                  >
                    Invest Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

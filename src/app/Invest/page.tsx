
"use client";
import React, { useState, useEffect, useRef } from "react";
import { DollarSign, Calendar, ArrowLeft, TrendingUp } from "lucide-react";
import NavBar from "../NavBar/page";

type CompoundingPeriod = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

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

type UserInvestment = {
  planName: string;
  id: string;
  planId: string;
  status: string;
};

export default function Invest() {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
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

  // Fetch user's active investments
  const fetchUserInvestments = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/user/investments?userId=${user.id}`);
      const data = await res.json();
      // Filter only active investments
      const activeInvestments = (data.investments || []).filter(
        (inv: UserInvestment) => inv.status === "active"
      );
      setUserInvestments(activeInvestments);
    } catch (err) {
      console.error("Failed to fetch user investments:", err);
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
    if (user?.id) {
      fetchUserInvestments();
    }
  }, [user?.id]);

  useEffect(() => {
    if (showModal) amountRef.current?.focus();
  }, [showModal]);

  // Filter out plans that user already has active investments in
  const availablePlans = plans.filter(plan => 
    !userInvestments.some(inv => inv.planName === plan.name)
  );

  // Calculate projected returns with daily compounding
  const calculateReturn = () => {
    if (!selectedPlan || !investmentAmount) return null;
    const amount = parseFloat(investmentAmount);
    if (isNaN(amount)) return null;

    const periodsPerYear: Record<CompoundingPeriod, number> = { 
      daily: 365, 
      weekly: 52, 
      monthly: 12, 
      quarterly: 4, 
      yearly: 1 
    };
    
    const n = periodsPerYear[selectedPlan.compoundingPeriod];
    const r = selectedPlan.interestRate / 100;
    const t = selectedPlan.durationDays / 365;

    if (!n) return null;

    // Compound interest formula: A = P(1 + r/n)^(nt)
    const totalAmount = amount * Math.pow(1 + r / n, n * t);
    const interest = totalAmount - amount;

    // Calculate daily interest rate for display
    const dailyRate = (Math.pow(1 + r / n, n / 365) - 1) * 100;

    return { 
      principal: amount, 
      interest: interest, 
      total: totalAmount,
      dailyRate: dailyRate,
      durationDays: selectedPlan.durationDays
    };
  };

  // Handle wallet investment
  const handleWalletInvest = async (planId: string, amount: number) => {
    if (!user) return;
    await fetchUserData();

    if (user.walletBalance < amount) {
      alert("Insufficient wallet balance");
      return;
    }

    try {
      const res = await fetch("/api/invest/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, planId, amount }),
      });

      const data = await res.json();
      console.log("Wallet invest response:", data);

      if (!res.ok) {
        alert(data.error || "Wallet investment failed.");
        return;
      }

      alert(data.message || "Investment successful from wallet!");
      await fetchUserData();
      await fetchUserInvestments();
      setShowModal(false);
      setInvestmentAmount("");
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
        ) : availablePlans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">You have active investments in all available plans!</p>
            <p className="text-gray-500 text-sm">You can top up your existing investments from the dashboard.</p>
            <button
              onClick={() => window.location.replace("/dashboard")}
              className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {availablePlans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-xl bg-white shadow-sm p-6 border-2 cursor-pointer transition-all ${
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
                  <TrendingUp className="text-indigo-600" size={24} />
                </div>
                <p className="text-3xl font-bold text-indigo-600 mb-2">{plan.interestRate}% p.a</p>
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <DollarSign className="w-4 h-4" />
                    <span>Min: Ksh. {plan.minAmount.toLocaleString()} - Max: Ksh. {plan.maxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4" />
                    <span>Duration: {plan.durationDays} days</span>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    <span>Compounded {plan.compoundingPeriod}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Invest in {selectedPlan.name}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Investment Amount (KSH)
                  </label>
                  <input
                    ref={amountRef}
                    type="number"
                    className="w-full border border-gray-300 text-gray-900 px-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={`Min: ${selectedPlan.minAmount.toLocaleString()}, Max: ${selectedPlan.maxAmount.toLocaleString()}`}
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Payment Method</label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={paymentMethod === "wallet"}
                        onChange={() => setPaymentMethod("wallet")}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="text-gray-700">Wallet</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={paymentMethod === "paystack"}
                        onChange={() => setPaymentMethod("paystack")}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="text-gray-700">Mobile Money</span>
                    </label>
                  </div>
                  {paymentMethod === "wallet" && user && (
                    <p className="mt-2 text-sm text-gray-600">
                      Wallet Balance: <span className="font-semibold">Ksh. {user.walletBalance?.toLocaleString()}</span>
                    </p>
                  )}
                </div>

                {returns && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="text-gray-900 font-bold mb-3 flex items-center gap-2">
                      <TrendingUp className="text-indigo-600" size={20} />
                      Projected Returns
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Principal:</span>
                        <span className="font-semibold text-gray-900">
                          Ksh. {returns.principal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expected Interest:</span>
                        <span className="font-semibold text-green-600">
                          Ksh. {returns.interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-indigo-200">
                        <span className="text-gray-900 font-medium">Total Return:</span>
                        <span className="font-bold text-indigo-600 text-lg">
                          Ksh. {returns.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 pt-2">
                        <p>• Compounded {selectedPlan.compoundingPeriod}</p>
                        <p>• Daily effective rate: {returns.dailyRate.toFixed(4)}%</p>
                        <p>• Duration: {returns.durationDays} days</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setInvestmentAmount("");
                    }}
                    className="px-5 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
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
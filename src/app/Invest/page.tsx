"use client";
import React, { useState, useEffect } from "react";
import { Percent, Calendar, DollarSign, ArrowLeft } from "lucide-react";
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
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const plansData = await fetch("/api/plans")
        .then((res) => res.json())
        .then((data) => data.plans);
      setPlans(plansData);
    } catch (error) {
      console.error("Failed to load plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateReturn = () => {
    if (!selectedPlan || !investmentAmount) return null;

    const amount = parseFloat(investmentAmount);
    const periodsPerYear = {
      daily: 365,
      weekly: 52,
      monthly: 12,
    };

    const n = periodsPerYear[selectedPlan.compoundingPeriod];
    const r = selectedPlan.interestRate / 100;
    const t = selectedPlan.durationDays / 365;

    const totalAmount = amount * Math.pow(1 + r / n, n * t);
    const interest = totalAmount - amount;

    return {
      principal: amount,
      interest: interest,
      total: totalAmount,
    };
  };

  const onInvest = async ({
    planId,
    amount,
    phoneNumber,
  }: {
    planId: string;
    amount: number;
    phoneNumber: string;
  }) => {
    try {
      // Replace with real API call
      console.log("Investing:", { planId, amount, phoneNumber });
      alert("Investment confirmed!");
      setShowModal(false);
      setInvestmentAmount("");
      setPhoneNumber("");
    } catch (error) {
      console.error("Investment failed:", error);
    }
  };

  const handleSubmit = () => {
    if (!selectedPlan || !investmentAmount || !phoneNumber) return;

    onInvest({
      planId: selectedPlan.id,
      amount: parseFloat(investmentAmount),
      phoneNumber: phoneNumber,
    });
  };

  function onNavigate(route: string) {
    // Placeholder navigation
    console.log("Navigate to:", route);
  }

  const returns = calculateReturn();

  // Modal component
  const Modal = ({
    open,
    onClose,
    children,
  }: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }) => {
    if (!open) return null;

    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[999]">
        <div className="bg-blue-50 rounded-xl p-6 w-[90%] max-w-md shadow-lg relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
          >
            ✕
          </button>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <NavBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        <button
          onClick={() => onNavigate("dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Investment Plan</h2>
        <p className="text-gray-600 mb-8">Select a plan that fits your goals</p>

        {loading ? (
          <div className="text-center py-12 ">
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

                <p className="text-3xl font-bold text-indigo-600 mb-2">{plan.interestRate}%</p>
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <DollarSign className="w-4 h-4" />
                    <span>
                      Min: ${plan.minAmount} - Max: ${plan.maxAmount}
                    </span>
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
      </div>

      {/* Payment Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        {selectedPlan && (
          <div className="">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedPlan.name}</h3>
            <p className="text-gray-600 mb-4">
              Invest between ${selectedPlan.minAmount} - ${selectedPlan.maxAmount}
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investment Amount
            </label>
            <input
              type="number"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
              placeholder="Enter amount"
              min={selectedPlan.minAmount}
              max={selectedPlan.maxAmount}
            />

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-6"
              placeholder="Enter phone number"
            />

            {returns && (
              <div className="bg-indigo-50 p-4 rounded-lg mb-4 border border-indigo-200">
                <p className="text-sm text-gray-700">
                  Expected Return:{" "}
                  <span className="font-bold text-indigo-600">${returns.total.toFixed(2)}</span>
                </p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={
                !investmentAmount ||
                parseFloat(investmentAmount) < selectedPlan.minAmount ||
                parseFloat(investmentAmount) > selectedPlan.maxAmount
              }
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Confirm Investment
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

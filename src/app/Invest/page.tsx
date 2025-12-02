'use client';
import React, { useState, useEffect } from 'react';
import { Percent, Calendar, DollarSign, ArrowLeft } from 'lucide-react';

import NavBar from '../NavBar/page';


type CompoundingPeriod = 'daily' | 'weekly' | 'monthly';

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
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadPlans();
//   }, []);

//   const loadPlans = async () => {
//     try {
//       const plansData = await api.getInvestmentPlans();
//       setPlans(plansData);
//     } catch (error) {
//       console.error('Failed to load plans:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

  const calculateReturn = () => {
    if (!selectedPlan || !investmentAmount) return null;
    
    const amount = parseFloat(investmentAmount);
    const periodsPerYear = {
      daily: 365,
      weekly: 52,
      monthly: 12
    };
    
    const n = periodsPerYear[selectedPlan.compoundingPeriod];
    const r = selectedPlan.interestRate / 100;
    const t = selectedPlan.durationDays / 365;
    
    const totalAmount = amount * Math.pow((1 + r / n), n * t);
    const interest = totalAmount - amount;
    
    return {
      principal: amount,
      interest: interest,
      total: totalAmount
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
      //wait api.invest({ planId, amount, phoneNumber });
      // Optionally show success message or redirect
    } catch (error) {
      console.error('Investment failed:', error);
      // Optionally show error message
    }
  };

  const handleSubmit = () => {
    if (!selectedPlan || !investmentAmount || !phoneNumber) return;
    
    onInvest({
      planId: selectedPlan.id,
      amount: parseFloat(investmentAmount),
      phoneNumber: phoneNumber
    });
  };

  const returns = calculateReturn();

    function onNavigate(arg0: string): void {
        throw new Error('Function not implemented.');
    }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <NavBar/>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Investment Plan</h2>
        <p className="text-gray-600 mb-8">Select a plan that fits your goals</p>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {plans.map(plan => (
                <div
                  key={plan.id}
                  className={`bg-white rounded-xl shadow-sm p-6 border-2 cursor-pointer transition-all ${
                    selectedPlan?.id === plan.id
                      ? 'border-indigo-600 shadow-lg transform scale-105'
                      : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <Percent className="w-6 h-6 text-indigo-600" />
                  </div>
                  <p className="text-3xl font-bold text-indigo-600 mb-2">{plan.interestRate}%</p>
                  <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <DollarSign className="w-4 h-4" />
                      <span>Min: ${plan.minAmount} - Max: ${plan.maxAmount}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4" />
                      <span>Duration: {plan.durationDays} days</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedPlan && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Investment Amount</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (${selectedPlan.minAmount} - ${selectedPlan.maxAmount})
                  </label>
                  <input
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="Enter amount"
                    min={selectedPlan.minAmount}
                    max={selectedPlan.maxAmount}
                  />
                </div>

                                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PhoneNumber
                  </label>
                  <input
                    type="string"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
                
                {returns && parseFloat(investmentAmount) >= selectedPlan.minAmount && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 mb-4 border border-indigo-200">
                    <h4 className="font-semibold text-gray-900 mb-4 text-lg">Investment Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Principal</p>
                        <p className="text-2xl font-bold text-gray-900">${returns.principal.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Expected Interest</p>
                        <p className="text-2xl font-bold text-green-600">${returns.interest.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Return</p>
                        <p className="text-2xl font-bold text-indigo-600">${returns.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleSubmit}
                  disabled={
                    !investmentAmount ||
                    parseFloat(investmentAmount) < selectedPlan.minAmount ||
                    parseFloat(investmentAmount) > selectedPlan.maxAmount
                  }
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Invest Now
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
    


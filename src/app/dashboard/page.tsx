'use client';
import {useEffect, useState}from 'react';
import { Wallet, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { useRouter } from "next/navigation";
import NavBar from '../NavBar/page';

type Investment = {
  id: string;
  status: string;
  planName: string;
  amount: number;
  maturityDate: string;
  currentInterest?: number;
  expectedInterest?: number;
};

type Withdrawal = {
  id: string;
  amount: number;
  createdAt: string;
  type: string;
};

type User = {
  name: string;
  email: string;
  walletBalance?: number;
  totalInvested?: number;
  totalInterestEarned?: number;
  investments?: Investment[];
  withdrawals?: Withdrawal[];
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error);
          router.push("/login");
          return;
        }

        setUser(data.user);
      } catch (err) {
        setError("Failed to fetch user data");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleWithdrawInterest = async (investmentId: string) => {
    // Implement your withdraw interest logic
    console.log("Withdrawing interest for:", investmentId);
  };

  const handleCompleteInvestment = async (investmentId: string) => {
    // Implement your complete investment logic
    console.log("Completing investment:", investmentId);
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">Loading...</p>
    </div>;
  }

  const activeInvestments = user?.investments?.filter(inv => inv.status === 'active') || [];
  const recentWithdrawals = user?.withdrawals?.slice(-5).reverse() || [];

  return (
    <>
    <NavBar />
  
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user.name}
          </h1>
          <p className="text-gray-600">
            Track your investments and earnings
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Wallet Balance</p>
                <p className="text-2xl font-bold text-gray-900">${user.walletBalance?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Wallet className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Invested</p>
                <p className="text-2xl font-bold text-gray-900">${user.totalInvested?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Interest Earned</p>
                <p className="text-2xl font-bold text-gray-900">${user.totalInterestEarned?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Active Investments */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Active Investments</h3>
          {activeInvestments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No active investments</p>
              <button
                onClick={() => router.push('/invest')}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
              >
                Start Investing
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeInvestments.map(inv => {
                const maturityDate = new Date(inv.maturityDate);
                const isMatured = new Date() >= maturityDate;
                const daysRemaining = Math.max(0, Math.ceil((maturityDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
                
                return (
                  <div key={inv.id} className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{inv.planName}</h4>
                        <p className="text-sm text-gray-600">Principal: ${inv.amount?.toFixed(2)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isMatured ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {isMatured ? 'Matured' : `${daysRemaining} days left`}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                      <div>
                        <p className="text-gray-600">Current Interest</p>
                        <p className="text-lg font-bold text-green-600">${inv.currentInterest?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Expected Interest</p>
                        <p className="text-lg font-bold text-gray-900">${inv.expectedInterest?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>Matures: {maturityDate.toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleWithdrawInterest(inv.id)}
                        disabled={!inv.currentInterest || inv.currentInterest <= 0}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                      >
                        Withdraw Interest
                      </button>
                      {isMatured && (
                        <button
                          onClick={() => handleCompleteInvestment(inv.id)}
                          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
                        >
                          Complete & Withdraw All
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Withdrawals */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Withdrawals</h3>
          {recentWithdrawals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No withdrawals yet</p>
          ) : (
            <div className="space-y-3">
              {recentWithdrawals.map(wd => (
                <div key={wd.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-900">${wd.amount?.toFixed(2)}</p>
                    <p className="text-xs text-gray-600">{new Date(wd.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    {wd.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
      </>
  );
}
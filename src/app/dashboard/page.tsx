'use client';
import {use, useEffect, useState}from 'react';
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
  status: string;
};

type User = {
  id: string;
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
  const [modalType, setModalType] = useState<"topup" | "withdraw" | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const [amount, setAmount] = useState("");


  useEffect(() => {
  const loadDashboard = async () => {
    try {
      const u = await fetch("/api/me").then(r => r.json());

      if (!u?.user) return router.push("/login");

      const [i, w, t] = await Promise.all([
        fetch(`/api/user/investments?userId=${u.user.id}`).then(r => r.json()),
        fetch(`/api/user/withdrawals?userId=${u.user.id}`).then(r => r.json()),
        fetch(`/api/user/transactions?userId=${u.user.id}`).then(r => r.json())
      ]);

      setUser({
        ...u.user,
        investments: i.investments,
        withdrawals: w.withdrawals,
        transactions: t.transactions
      });

    } catch (err) {
      console.error(err);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  loadDashboard();
}, []);

  const fetchUserData = async () => {
    try {
      const u = await fetch("/api/me").then(r => r.json());

      if (!u?.user) return router.push("/login");

      const [i, w, t] = await Promise.all([
        fetch(`/api/user/investments?userId=${u.user.id}`).then(r => r.json()),
        fetch(`/api/user/withdrawals?userId=${u.user.id}`).then(r => r.json()),
        fetch(`/api/user/transactions?userId=${u.user.id}`).then(r => r.json())
      ]);

      setUser({
        ...u.user,
        investments: i.investments,
        withdrawals: w.withdrawals,
        transactions: t.transactions
      });

    } catch (err) {
      console.error(err);
      router.push("/login");
    } finally {
      setLoading(false);
    }
};


  console.log("User data:", user);


  const handleWalletWithdrawalRequest = async (amount: number) => {
  try {
      if (!user?.id ) {
    alert("User not loaded yet. Please try again.");
    return;
  }
    const res = await fetch("/api/withdrawal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        amount,
        reason: "User withdrawal"
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Withdrawal request submitted!");
    await  fetchUserData(); 
    // ✅ updates wallet instantly
    router.push("/dashboard");

  } catch (err) {
    console.error(err);
    alert("Withdrawal failed");
  }
};


const handleConfirmTopup = async () => {
  if (!amount) {
    alert("Enter an amount");
    return;
  }

  if (!user?.id || !user?.email) {
    alert("User not loaded yet. Please try again.");
    return;
  }

  try {
    const response = await fetch("/api/paystack/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(amount),
        userId: user.id,
        email: user.email,
        callback_url: `${window.location.origin}/payment/verify`,
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

  function setTopupAmount(value: string): void {
    throw new Error('Function not implemented.');
  }

  return (
    <>
    <NavBar />
  
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">


        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Wallet Balance</p>
                <p className="text-2xl font-bold text-gray-900">${user.walletBalance ? Number(user.walletBalance).toFixed(2) : '0.00'}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg">
                <Wallet className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4 flex row gap-2">
              <button
                onClick={() => setModalType("topup")}
                className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg"
              >
                Top Up Wallet
              </button>

              <button
                onClick={() => setModalType("withdraw")}
                className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg"
              >
                Withdrawal
              </button>
          </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex row gap-2 items-center justify-between ">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Invested</p>
                <p className="text-2xl font-bold text-gray-900">${Number(user.totalInvested)?.toFixed(2) || '0.00'}</p>
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
                <p className="text-2xl font-bold text-gray-900">${Number(user.totalInterestEarned)?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4">


              </div>  
          </div>
          

          
        </div>

        {/* Active Investments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
          <h3 className="text-xl text-center font-bold text-gray-900 mb-4">Active Investments</h3>
          {activeInvestments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No active investments</p>
              <button
                onClick={() => router.push('/Invest')}
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
                
                function handleCompleteInvestment(id: string): void {
                  throw new Error('Function not implemented.');
                }

                return (
                  <div key={inv.id} className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{inv.planName}</h4>
                        <p className="text-sm text-gray-600">Principal: ${Number(inv.amount)?.toFixed(2)}</p>
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
                        <p className="text-lg font-bold text-green-600">${Number(inv.currentInterest)?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Expected Interest</p>
                        <p className="text-lg font-bold text-gray-900">${Number(inv.expectedInterest)?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>Matures: {maturityDate.toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleWalletWithdrawalRequest(inv.currentInterest!)}
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
          <h3 className="text-xl text-center font-bold text-gray-900 mb-4">Recent Withdrawals</h3>
          {recentWithdrawals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No withdrawals yet</p>
          ) : (
            <div className="space-y-3">
              {recentWithdrawals.map(wd => (
                <div key={wd.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-900">${Number(wd.amount)?.toFixed(2)}</p>
                    <p className="text-xs text-gray-600">{new Date(wd.createdAt).toLocaleString()}</p>
                    
                  </div>
                  <p className=" px-3 py-1 text-xs text-gray-600 bg-green-100 text-green-800 rounded-full"> {wd.status}</p>
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
            {modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-indigo-50 rounded-lg shadow-lg w-full max-w-md p-8">

              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-lg  text-black font-semibold">
                  {modalType === "topup" ? "Top Up Wallet" : "Request Withdrawal"}
                </h3>
                <button onClick={() => setModalType(null)}>✕</button>
              </div>

              <div className="py-4">
                {modalType === "topup" ? (
                  <>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full border text-black px-4 py-2 rounded"
                    />
                  </>
                ) : (
                  < >
                    <p className='text-black'>Withdrawals are processed within 24–48 hours.</p>
                    <p className='text-black'>Ensure your account details are correct.</p>
                    <br />

                    
         

                    <input
                      type="number"
                      placeholder="Enter amount"
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full border text-black px-4 py-2 rounded"
                    />

                    <input
                      type="text"
                      placeholder="Reason (optional)"
                      className="w-full border text-black px-4 py-2 rounded mt-4"
                    />

                  </>
                )}
              </div>

                       <br />
              <div className="flex justify-end text-black gap-3 border-t pt-4">
                <button
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-black bg-gray-200 rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    modalType === "topup"
                      ? handleConfirmTopup()
                      : handleWalletWithdrawalRequest(Number(amount));
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded"
                >
                  Continue
                </button>
              </div>

            </div>
          </div>
        )}

    </div>
      </>
  );
}



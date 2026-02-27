
'use client';
import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, DollarSign, Cog, Plus } from 'lucide-react';
import { useRouter } from "next/navigation";
import NavBar from '../NavBar/page';

type Investment = {
  id: string;
  status: string;
  planId: string;
  planName: string;
  amount: number;
  maturityDate: string;
  startDate: string;
  currentInterest: number;
  expectedInterest: number;
  yesterdayInterest: number;  // ← Add this
  currentValue: number;        // ← Add this
  expectedValue: number;       // ← Add this
  progressPercentage: number;  // ← Add this
  daysElapsed: number;         // ← Add this
  totalDays: number;           // ← Add this
};

type Withdrawal = {
  id: string;
  amount: number;
  createdAt: string;
  type: string;
  status: string;
};

type Transaction = {
  id: number;
  reference?: string;
  email?: string;
  amount: number;
  status: string;
  userId: string;
  type: "topup" | "withdrawal" | "investment" | "verification";
  createdAt: string;
  created_at?: string;
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
  transactions?: Transaction[];
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [modalType, setModalType] = useState<"topup" | "withdraw" | "invest" | "verify" | "topup-investment" | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState("");
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [activeTab, setActiveTab] = useState<"investments" | "withdrawals" | "transactions">("investments");

  useEffect(() => {
    loadDashboard();
  }, []);

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
        transactions: normalizeTransactions(t.transactions || [])
      });

    } catch (err) {
      console.error(err);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

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
        transactions: normalizeTransactions(t.transactions || [])
      });

    } catch (err) {
      console.error(err);
      router.push("/login");
    }
  };

  const normalizeTransactions = (transactions: any[]): Transaction[] =>
    transactions.map(tx => ({
      ...tx,
      type: tx.type || "topup",
      createdAt: tx.createdAt || tx.created_at || new Date().toISOString()
    }));

const handleWalletWithdrawalRequest = async (amount: number) => {
  try {
    if (!user?.id) {
      alert("User not loaded yet.");
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

    await fetchUserData();

    // ✅ CLOSE MODAL HERE
    setModalType(null);
    setAmount("");

  } catch (err) {
    console.error(err);
    alert("Withdrawal failed");
  }
};
  const handleConfirmTopup = async () => {
    if (!amount) return alert("Enter an amount");
    if (!user?.id || !user?.email) return alert("User not loaded.");

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
        alert(data.error);
        return;
      }

      window.location.href = data.data.authorization_url;

    } catch (err) {
      console.error(err);
      alert("Payment initialization failed");
    }
  };


  const handleInvestmentTopup = async (investment: Investment, amount: number, method: "wallet" | "paystack") => {
    console.log("handleInvestmentTopup called with:", { investment, amount, method });
  if (!user?.id) return alert("User not loaded");
  if (!investment) return alert("Select an investment to top up");
  if (!amount || amount <= 0) return alert("Enter a valid amount");

  if(investment.planId === undefined) {

  if(investment.planName==='Growth'){
    investment.planId='4';}
  else if(investment.planName==='Premium'){
    investment.planId='5';}
  else if(investment.planName==='Elite'){
    investment.planId='6';}
}

  try {
    if (method === "wallet") {
      if (user.walletBalance! < amount) {
        alert("Insufficient wallet balance");
        return;
      }

      const res = await fetch("/api/invest/topup/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: user.id, 
          investmentId: investment.id, 
          planName: investment.planName,  
          amount 
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Top up failed");
        return;
      }

      alert("Investment topped up successfully!");
      await fetchUserData();
      setModalType(null);
      setAmount("");
      setSelectedInvestment(null);
    } else {

      // Paystack
      const response = await fetch("/api/invest/topup/paystack/init", {

        
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          userId: user.id,
          email: user.email,
          investmentId: investment.id,          
          planId:investment.planId,
          callback_url: `${window.location.origin}/payment/invest/topup/verify`,
        }),


        
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.error);
        return;
      }

      window.location.href = data.data.authorization_url;
    }
  } catch (err) {
    console.error(err);
    alert("Top up failed");
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <p>User not found</p>;
  }

  const activeInvestments = user.investments?.filter(inv => inv.status === "active") || [];

  return (
    <>
      <NavBar />

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 py-8 mt-16">

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 ">
            <Card title="Wallet Balance" description='This is your available balance. You can save or invest it to grow your wealth.' value={user.walletBalance} icon={<Wallet className="w-6 h-6 text-indigo-600" />} />
            <Card title="Total Invested" description='These are your active investments. Your money is working for you while you focus on life.' value={user.totalInvested} icon={<DollarSign className="w-6 h-6 text-blue-600" />} />
            <Card title="Interest Earned" description='This is the profit you have earned from your investments so far. Watch your wealth grow!' value={user.totalInterestEarned} icon={<TrendingUp className="w-6 h-6 text-green-600" />} />
            <QuickActions setModalType={setModalType} userId={user.id} />
          </div>

          {/* Tabs */}
          <div className="bg-white shadow-sm border text-black rounded-xl p-4">
            <TabHeader activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="mt-6">
              {activeTab === "investments" && (
                <InvestmentsTab 
                  investments={activeInvestments} 
                  handleWalletWithdrawalRequest={handleWalletWithdrawalRequest}
                  onTopUp={(investment) => {
                    setSelectedInvestment(investment);
                    setModalType("topup-investment");
                  }}
                />
              )}
              {activeTab === "withdrawals" && <WithdrawalsTab withdrawals={user.withdrawals || []} />}
              {activeTab === "transactions" && <TransactionsTab transactions={user.transactions || []} />}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalType && (
        <Modal
          type={modalType}
          setModalType={setModalType}
          amount={amount}
          setAmount={setAmount}
          handleConfirmTopup={handleConfirmTopup}
          handleWalletWithdrawalRequest={handleWalletWithdrawalRequest}
          handleInvestmentTopup={handleInvestmentTopup}
          selectedInvestment={selectedInvestment}
          user={user}
        />
      )}
    </>
  );
}

// ===== Components ===== //

const Card = ({ title, description, value, icon }: { title: string, value?: number, description: string, icon: React.ReactNode }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-700">{title}</h3>
        <div>{icon}</div>
      </div>
      <p className="text-md text-gray-600">{description}</p>
      <p className="text-2xl font-bold text-gray-600 mb-2">Ksh. {Number(value).toLocaleString()}</p>
    </div>
);

const QuickActions = ({ setModalType, userId }: { setModalType: any; userId?: string }) => {
  const router = useRouter();
  const handleAction = (action: string) => {
    switch (action) {
      case "Invest": router.push("/Invest"); break;
      case "Save": setModalType("topup"); break;
      case "Withdraw": setModalType("withdraw"); break;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 border flex flex-col gap-2">
      <div className='flex justify-between items-center mb-2'>
        <p className="text-xl font-bold text-gray-700">Quick Actions</p>
        <Cog className="w-6 h-6 text-indigo-600" />
      </div>
      <div className="flex flex-col gap-2">
        {["Invest", "Save", "Withdraw"].map(action => (
          <button
            key={action}
            onClick={() => handleAction(action)}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
};

const TabHeader = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: any }) => (
  <div className="flex flex-wrap gap-2 border-b pb-3">
    {["investments", "withdrawals", "transactions"].map(tab => (
      <button
        key={tab}
        className={`px-4 py-2 rounded-lg font-medium ${activeTab === tab ? "bg-indigo-600 text-white" : "bg-gray-100"}`}
        onClick={() => setActiveTab(tab)}
      >
        {tab.charAt(0).toUpperCase() + tab.slice(1)}
      </button>
    ))}
  </div>
);

const InvestmentsTab = ({ 
  investments, 
  handleWalletWithdrawalRequest,
  onTopUp
}: { 
  investments: Investment[], 
  handleWalletWithdrawalRequest: any,
  onTopUp: (investment: Investment) => void
}) => (
  investments.length === 0
    ? <p className="text-center text-gray-500 py-10">No active investments</p>
    : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {investments.map(inv => {
        const maturityDate = new Date(inv.maturityDate);
        const isMatured = new Date() >= maturityDate;
        const daysRemaining = Math.ceil((maturityDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

return (
  <div key={inv.id} className="bg-indigo-50 border p-4 rounded-lg flex flex-col gap-3 hover:shadow-md transition">
    <div className="flex justify-between">
      <div>
        <h4 className="font-bold">{inv.planName}</h4>
        <p className="text-sm text-gray-600">Investment Plan</p>
      </div>
      <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
        {isMatured ? "Matured" : `${daysRemaining} days left`}
      </span>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-gray-600 text-sm">Current Amount</p>
        <p className="font-bold text-indigo-600">
          Ksh. {(Number(inv.amount) + Number(inv.currentInterest || 0)).toFixed(2)}
        </p>
      </div>
      <div>
        <p className="text-gray-600 text-sm">Interest Yesterday</p>
        <p className="font-bold text-green-600">
              Ksh. {Number(inv.yesterdayInterest || 0).toFixed(2)}
        </p>
      </div>
    </div>

    <div className="flex flex-col md:flex-row gap-3 mt-2">
      <button
        onClick={() => onTopUp(inv)}
        className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        Top Up Investment
      </button>

      {isMatured && (
        <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
          Complete & Withdraw All
        </button>
      )}
    </div>
  </div>
);
      })}
    </div>
);

const WithdrawalsTab = ({ withdrawals }: { withdrawals: Withdrawal[] }) => (
  withdrawals.length === 0
    ? <p className="text-center text-gray-500 py-10">No withdrawals yet</p>
    : <div className="space-y-3">
      {withdrawals.map(w => (
        <div key={w.id} className="flex justify-between bg-gray-50 p-3 rounded border hover:bg-gray-100 transition">
          <div>
            <p className="font-bold">Ksh. {Number(w.amount).toFixed(2)}</p>
            <p className="text-xs text-gray-600">{new Date(w.createdAt).toLocaleString()}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
            {w.status}
          </span>
        </div>
      ))}
    </div>
);

const TransactionsTab = ({ transactions }: { transactions: Transaction[] }) => (
  transactions.length === 0
    ? <p className="text-center text-gray-500 py-10">No transactions yet</p>
    : <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Reference</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Type</th>
            <th className="p-2">Status</th>
            <th className="p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => {
            const date = t.createdAt || t.created_at;
            return (
              <tr key={t.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-2">{t.reference || "-"}</td>
                <td className="p-2">Ksh. {Number(t.amount).toFixed(2)}</td>
                <td className="p-2">{t.type}</td>
                <td className="p-2">{t.status}</td>
                <td className="p-2">{date ? new Date(date).toLocaleString() : "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
);

const Modal = ({ 
  type, 
  setModalType, 
  amount, 
  setAmount, 
  handleConfirmTopup, 
  handleWalletWithdrawalRequest, 
  handleInvestmentTopup,
  selectedInvestment,
  user 
}: any) => {
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "paystack">("paystack");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg animate-fadeIn text-gray-500">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-semibold">
            {type === "topup" 
              ? "Top Up Wallet" 
              : type === "withdraw" 
              ? "Withdrawal Request" 
              : type === "topup-investment"
              ? `Top Up ${selectedInvestment?.planName || 'Investment'}`
              : "Action"}
          </h3>
          <button onClick={() => {
            setModalType(null);
            setAmount("");
          }}>✕</button>
        </div>

        <div className="mt-4">
          {type === "topup-investment" && selectedInvestment && (
            <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Current Principal:</strong> Ksh. {Number(selectedInvestment.amount).toFixed(2)}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Current Interest:</strong> Ksh. {Number(selectedInvestment.currentInterest || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Note: Current interest will be added to your principal when you top up.
              </p>
            </div>
          )}

          <input
            type="number"
            placeholder="Enter amount"
            className="w-full border p-3 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          {type === "topup-investment" && (
            <div className="mb-3">
              <label className="block text-gray-700 font-medium mb-2">Payment Method</label>
              <div className="flex gap-4">
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
          )}
        </div>

        <div className="flex justify-end gap-3 mt-4 border-t pt-3">
          <button 
            onClick={() => {
              setModalType(null);
              setAmount("");
            }} 
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              if (type === "topup") handleConfirmTopup();
              else if (type === "withdraw") handleWalletWithdrawalRequest(Number(amount));
              else if (type === "topup-investment" && selectedInvestment) {
                handleInvestmentTopup(selectedInvestment, Number(amount), paymentMethod);
              }
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
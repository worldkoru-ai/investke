"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, DollarSign, TrendingUp, AlertCircle } from "lucide-react";

type Stats = {
  totalUsers: number;
  totalInvested: number;
  pendingWithdrawals: number;
  totalWithdrawals: number;
};

type User = {
  id: string;
  name: string;
  email: string;
  walletBalance: number;
  totalInvested: number;
  totalInterestEarned: number;
  createdAt: string;
};

type Withdrawal = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  status: string;
  method: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  mobileProvider?: string;
  mobileNumber?: string;
  createdAt: string;
};

type Investment = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planName: string;
  amount: number;
  currentInterest: number;
  expectedInterest: number;
  status: string;
  maturityDate: string;
  createdAt: string;
};

type Verification = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  idType: string;
  idFront: string | null;
  idBack: string | null;
  status: string;
  createdAt: string;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "withdrawals" | "investments" | "verifications">("overview");
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const router = useRouter();
  

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [statsRes, usersRes, withdrawalsRes, investmentsRes, verificationsRes] = await Promise.all([
        fetch("/api/admin/stats").then(r => r.json()),
        fetch("/api/admin/users").then(r => r.json()),
        fetch("/api/admin/withdrawals").then(r => r.json()),
        fetch("/api/admin/investments").then(r => r.json()),
        fetch("/api/admin/verifications").then(r => r.json()),
      ]);

      if (statsRes.error || usersRes.error || withdrawalsRes.error || investmentsRes.error || verificationsRes.error) {
        alert("Access denied. Admin only.");
        router.push("/dashboard");
        return;
      }

      setStats(statsRes.stats);
      setUsers(usersRes.users);
      setWithdrawals(withdrawalsRes.withdrawals);
      setInvestments(investmentsRes.investments);
      setVerifications(verificationsRes.verifications);
    } catch (err) {
      console.error(err);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWithdrawal = async (withdrawalId: string) => {
    try {
      const res = await fetch("/api/admin/withdrawals/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawalId }),
      });

      if (res.ok) {
        alert("Withdrawal approved!");
        loadAdminData();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Approval failed");
    }
  };

  const handleRejectWithdrawal = async (withdrawalId: string) => {
    try {
      const res = await fetch("/api/admin/withdrawals/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawalId }),
      });

      if (res.ok) {
        alert("Withdrawal rejected and refunded!");
        loadAdminData();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Rejection failed");
    }
  };

  const handleApproveVerification = async (verificationId: string) => {
    try {
      const res = await fetch("/api/admin/verifications/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationId }),
      });

      if (res.ok) {
        alert("User verified successfully!");
        loadAdminData();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Verification approval failed");
    }
  };

  const handleRejectVerification = async (verificationId: string) => {
    try {
      const res = await fetch("/api/admin/verifications/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationId }),
      });

      if (res.ok) {
        alert("Verification rejected!");
        loadAdminData();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Verification rejection failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-black">Admin Dashboard</h1>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={<Users className="w-8 h-8 text-blue-600" />}
            />
            <StatCard
              title="Total Invested"
              value={`Ksh ${stats.totalInvested.toLocaleString()}`}
              icon={<DollarSign className="w-8 h-8 text-green-600" />}
            />
            <StatCard
              title="Pending Withdrawals"
              value={stats.pendingWithdrawals}
              icon={<AlertCircle className="w-8 h-8 text-orange-600" />}
            />
            <StatCard
              title="Total Withdrawals"
              value={`Ksh ${stats.totalWithdrawals.toLocaleString()}`}
              icon={<TrendingUp className="w-8 h-8 text-purple-600" />}
            />
            <StatCard
              title="Pending Verifications"
              value={verifications.length}
              icon={<Users className="w-8 h-8 text-yellow-600" />}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <div className="flex gap-4 p-4 flex-wrap">
              {["overview", "users", "withdrawals", "investments", "verifications"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeTab === tab
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <OverviewTab users={users} withdrawals={withdrawals} investments={investments} />
            )}
            {activeTab === "users" && <UsersTab users={users} />}
            {activeTab === "withdrawals" && (
              <WithdrawalsTab withdrawals={withdrawals} onApprove={handleApproveWithdrawal} onReject={handleRejectWithdrawal} />
            )}
            {activeTab === "investments" && <InvestmentsTab investments={investments} />}
            {activeTab === "verifications" && (
              <VerificationsTab
                verifications={verifications}
                onApprove={handleApproveVerification}
                onReject={handleRejectVerification}
                onClickImage={setModalImage} // ✅ pass the setter
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal for enlarged image */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 cursor-pointer"
          onClick={() => setModalImage(null)}
        >
          <img
            src={modalImage}
            className="max-w-3xl max-h-full object-contain rounded shadow-lg"
          />
        </div>
      )}
    </div>
  );
}

// Helper: format date & time
const formatDateTime = (dateStr: string | null) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr.replace(" ", "T"));
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString("en-KE", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// ===== Components =====
const StatCard = ({ title, value, icon }: { title: string; value: any; icon: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-lg shadow border">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-black text-sm">{title}</p>
        <p className="text-2xl text-black font-bold mt-2">{value}</p>
      </div>
      <div>{icon}</div>
    </div>
  </div>
);

const OverviewTab = ({ users, withdrawals, investments }: any) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg text-black font-semibold mb-4">Recent Users</h3>
      <div className="space-y-2">
        {users.slice(0, 5).map((user: User) => (
          <div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium text-lg text-black">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
            <p className="text-sm text-gray-500">{formatDateTime(user.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>

    <div>
      <h3 className="text-lg text-black font-semibold mb-4">Pending Withdrawals</h3>
      <div className="space-y-2">
        {withdrawals
          .filter((w: Withdrawal) => w.status === "pending")
          .slice(0, 5)
          .map((withdrawal: Withdrawal) => (
            <div key={withdrawal.id} className="flex justify-between items-center p-3 bg-yellow-50 rounded">
              <div>
                <p className="font-medium text-black">{withdrawal.userName}</p>
                <p className="text-sm text-gray-600">Ksh {withdrawal.amount.toLocaleString()}</p>
              </div>
              <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-sm">Pending</span>
              <p className="text-sm text-gray-500">{formatDateTime(withdrawal.createdAt)}</p>
            </div>
          ))}
      </div>
    </div>
  </div>
);

// ===== Users Tab =====
const UsersTab = ({ users }: { users: User[] }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Name</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Email</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Wallet</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Invested</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Interest</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Joined</th>
        </tr>
      </thead>
      <tbody className="bg-white text-black divide-y divide-gray-200">
        {users.map((user) => (
          <tr key={user.id}>
            <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
            <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
            <td className="px-6 py-4 whitespace-nowrap">Ksh {user.walletBalance.toLocaleString()}</td>
            <td className="px-6 py-4 whitespace-nowrap">Ksh {user.totalInvested.toLocaleString()}</td>
            <td className="px-6 py-4 whitespace-nowrap">Ksh {user.totalInterestEarned.toLocaleString()}</td>
            <td className="px-6 py-4 whitespace-nowrap">{formatDateTime(user.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ===== Withdrawals Tab =====
const WithdrawalsTab = ({ withdrawals, onApprove, onReject }: any) => (
  <div className="overflow-x-auto">
    <table className="min-w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">User</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Email</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Amount</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Withdrawal Method</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Date</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white text-black divide-y divide-gray-200">
        {withdrawals.map((withdrawal: Withdrawal) => (
          <tr key={withdrawal.id}>
            <td className="px-6 py-4 whitespace-nowrap">{withdrawal.userName}</td>
            <td className="px-6 py-4 whitespace-nowrap">{withdrawal.userEmail}</td>
            <td className="px-6 py-4 whitespace-nowrap">Ksh {withdrawal.amount.toLocaleString()}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              {withdrawal.method === "mobile" ? (
                <span>{withdrawal.mobileProvider || "Mobile"} - {withdrawal.mobileNumber || "N/A"}</span>
              ) : withdrawal.method === "bank" ? (
                <span>{withdrawal.bankName || "Bank"} - {withdrawal.bankAccountName || "N/A"} ({withdrawal.bankAccountNumber || "N/A"})</span>
              ) : (
                <span>{withdrawal.method || "N/A"}</span>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-2 py-1 rounded text-xs ${
                withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                withdrawal.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {withdrawal.status}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">{formatDateTime(withdrawal.createdAt)}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              {withdrawal.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => onApprove(withdrawal.id)} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Approve</button>
                  <button onClick={() => onReject(withdrawal.id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Reject</button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ===== Investments Tab =====
const InvestmentsTab = ({ investments }: { investments: Investment[] }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">User</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Email</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Plan</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Amount</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Current Interest</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Expected Interest</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Maturity</th>
        </tr>
      </thead>
      <tbody className="bg-white text-black divide-y divide-gray-200">
        {investments.map((inv) => (
          <tr key={inv.id}>
            <td className="px-6 py-4 whitespace-nowrap">{inv.userName}</td>
            <td className="px-6 py-4 whitespace-nowrap">{inv.userEmail}</td>
            <td className="px-6 py-4 whitespace-nowrap">{inv.planName}</td>
            <td className="px-6 py-4 whitespace-nowrap">Ksh {inv.amount.toLocaleString()}</td>
            <td className="px-6 py-4 whitespace-nowrap">Ksh {inv.currentInterest.toLocaleString()}</td>
            <td className="px-6 py-4 whitespace-nowrap">Ksh {inv.expectedInterest.toLocaleString()}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-2 py-1 rounded text-xs ${
                inv.status === 'active' ? 'bg-green-100 text-green-800' :
                inv.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }`}>{inv.status}</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">{formatDateTime(inv.maturityDate)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ===== Verifications Tab =====
const VerificationsTab = ({ verifications, onApprove, onReject, onClickImage }: any) => (
  <div className="overflow-x-auto">
    <table className="min-w-full">
      <thead className="bg-gray-50">
        <tr>
          <th>User</th>
          <th>Email</th>
          <th>ID Type</th>
          <th>Front</th>
          <th>Back</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {verifications.map((v: Verification) => (
          <tr key={v.id}>
            <td>{v.userName}</td>
            <td>{v.userEmail}</td>
            <td>{v.idType}</td>
            <td>
              {v.idFront ? (
                <img
                  src={`data:image/jpeg;base64,${v.idFront}`}
                  className="w-24 h-16 object-contain border rounded cursor-pointer"
                  onClick={() => onClickImage(v.idFront)} // now defined
                />
              ) : "N/A"}
            </td>
            <td>
              {v.idBack ? (
                <img
                  src={`data:image/jpeg;base64,${v.idBack}`}
                  className="w-24 h-16 object-contain border rounded cursor-pointer"
                  onClick={() => onClickImage(v.idBack)} // now defined
                />
              ) : "N/A"}
            </td>
            <td>
              <span className={`px-2 py-1 rounded text-xs ${
                v.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                v.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>{v.status}</span>
            </td>
            <td>
              {v.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => onApprove(v.id)} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Approve</button>
                  <button onClick={() => onReject(v.id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Reject</button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);


"use client";
import { useEffect, useState } from "react";
import NavBar from "@/app/admin/NavMenu/page";
import {
  Users,
  CheckCircle,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";

type StatsResp = {
  totalUsers: number;
  totalInvested: number;
  totalWallet: number;
  totalWithdrawn: number;
  pendingWithdrawals: number;
  pendingVerifications: number;
  investmentsByDay: { date: string; invested: number }[];
  withdrawalsByDay: { date: string; withdrawn: number }[];
};

function safeArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.users)) return value.users;
  if (value && typeof value === "object") return Object.values(value);
  return [];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [stats, setStats] = useState<StatsResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "withdrawals" | "investments">("users");
  const [rejectionNote, setRejectionNote] = useState("");
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      const me = await fetch("/api/me").then(r => r.json().catch(() => null)).catch(() => null);
      if (!me?.user || me.user.role !== "admin") {
        router.push("/");
        return;
      }

      try {
        const [statsRes, usersRes, withdrawRes, investRes] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/admin/users"),
          fetch("/api/admin/withdrawals"),
          fetch("/api/admin/investments"),
        ]);

        setStats(await statsRes.json());
        setUsers(safeArray(await usersRes.json()));
        setWithdrawals(safeArray(await withdrawRes.json()));
        setInvestments(safeArray(await investRes.json()));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const handleWithdrawal = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          adminNote: status === "rejected" ? rejectionNote : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowRejectionModal(false);
      setRejectionNote("");
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!stats) return <div className="min-h-screen flex items-center justify-center">Failed to load stats</div>;

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 p-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-500 text-sm">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
              <Users className="text-blue-500 mt-2" size={40} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-500 text-sm">Pending Verifications</p>
              <p className="text-2xl font-bold">{stats.pendingVerifications}</p>
              <CheckCircle className="text-orange-500 mt-2" size={40} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-500 text-sm">Pending Withdrawals</p>
              <p className="text-2xl font-bold">{stats.pendingWithdrawals}</p>
              <CreditCard className="text-red-500 mt-2" size={40} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-500 text-sm">Total Invested</p>
              <p className="text-2xl font-bold">KSh {stats.totalInvested.toLocaleString()}</p>
              <TrendingUp className="text-green-500 mt-2" size={40} />
            </div>
          </div>

          {/* TABS */}
          <div className="bg-white rounded-lg shadow mb-6 flex items-center ">
            <div className="flex border-b flex-wrap ">
              {["users", "withdrawals", "investments"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-4 font-medium ${activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* CONTENT */}
          <div className="space-y-4">

            {/* USERS TABLE */}
            {activeTab === "users" && (
              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-100 text-gray-700 font-semibold">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Wallet</th>
                      <th className="p-3">Invested</th>
                      <th className="p-3">Interest</th>
                      <th className="p-3">Verification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{u.name}</td>
                        <td className="p-3">{u.email}</td>
                        <td className="p-3">{u.phone}</td>
                        <td className="p-3">KSh {u.walletBalance?.toLocaleString()}</td>
                        <td className="p-3">KSh {u.totalInvested?.toLocaleString()}</td>
                        <td className="p-3">KSh {u.totalInterestEarned?.toLocaleString()}</td>
                        <td className="p-3">{u.verificationStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* WITHDRAWALS TABLE */}
            {activeTab === "withdrawals" && (
              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-100 text-gray-700 font-semibold">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Bank</th>
                      <th className="p-3">Account</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map(w => {
                      const user = users.find(u => u.id === w.userId);
                      return (
                        <tr key={w.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{user?.name || "Unknown"}</td>
                          <td className="p-3">KSh {w.amount?.toLocaleString()}</td>
                          <td className="p-3">{user?.bankName}</td>
                          <td className="p-3">{user?.bankAccountNumber }</td>
                          <td className="p-3 capitalize">{w.status}</td>
                          <td className="p-3">
                            {w.status === "pending" && (
                              <div className="flex gap-2 flex-wrap">
                                <button
                                  onClick={() => handleWithdrawal(w.id, "approved")}
                                  className="px-3 py-1 bg-green-600 text-white rounded"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleWithdrawal(w.id, "rejected")}
                                  className="px-3 py-1 bg-red-600 text-white rounded"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* INVESTMENTS TABLE */}
            {activeTab === "investments" && (
              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-100 text-gray-700 font-semibold">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Plan</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map(inv => (
                      <tr key={inv.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{inv.userName}</td>
                        <td className="p-3">{inv.planName}</td>
                        <td className="p-3">KSh {inv.amount?.toLocaleString()}</td>
                        <td className="p-3">{new Date(inv.startDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

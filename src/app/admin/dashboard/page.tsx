"use client";
import { useEffect, useState } from "react";
import NavBar from "@/app/NavBar/page";
import { DollarSign, Users, ArrowUpRight, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from "recharts";

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

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsResp | null>(null);

  useEffect(() => {
    const load = async () => {
      // client guard - ensure admin
      const me = await fetch("/api/me").then(r => r.json()).catch(() => null);
      if (!me?.user || me.user.role !== "admin") {
        router.push("/");
        return;
      }

      try {
        const res = await fetch("/api/stats");
        if (!res.ok) {
          console.error(await res.text());
          return;
        }
        const data: StatsResp = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">Loading...</div>
  );

  if (!stats) return (
    <div className="min-h-screen flex items-center justify-center">No data</div>
  );

  const pieData = [
    { name: "Invested", value: stats.totalInvested },
    { name: "Wallet", value: stats.totalWallet },
    { name: "Withdrawn", value: stats.totalWithdrawn },
  ];
  const COLORS = ["#8884d8", "#00C49F", "#FF8042"];

  // build line chart data merging by date
  const datesSet = new Set<string>();
  stats.investmentsByDay.forEach(d => datesSet.add(d.date));
  stats.withdrawalsByDay.forEach(d => datesSet.add(d.date));
  const dates = Array.from(datesSet).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());
  const lineData = dates.map(date => {
    const inv = stats.investmentsByDay.find(i => i.date === date)?.invested || 0;
    const wd = stats.withdrawalsByDay.find(w => w.date === date)?.withdrawn || 0;
    return { date, invested: inv, withdrawn: wd };
  });

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow border flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg"><Users className="w-6 h-6 text-blue-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow border flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg"><DollarSign className="w-6 h-6 text-green-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Total Invested</p>
                <p className="text-2xl font-bold">KES {Number(stats.totalInvested).toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow border flex items-center gap-4">
              <div className="p-3 bg-orange-50 rounded-lg"><ArrowUpRight className="w-6 h-6 text-orange-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Pending Withdrawals</p>
                <p className="text-2xl font-bold">{stats.pendingWithdrawals}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.pendingVerifications} KYC pending</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-2 bg-white rounded-xl p-6 shadow border">
              <h3 className="text-lg font-semibold mb-4">Activity (14 days)</h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ReTooltip />
                    <Line type="monotone" dataKey="invested" stroke="#8884d8" />
                    <Line type="monotone" dataKey="withdrawn" stroke="#FF8042" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow border">
              <h3 className="text-lg font-semibold mb-4">Funds Distribution</h3>
              <div className="w-full h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                      {pieData.map((entry, idx) => (<Cell key={idx} fill={COLORS[idx % COLORS.length]} />))}
                    </Pie>
                    <ReTooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p><strong>Wallet:</strong> KES {Number(stats.totalWallet).toLocaleString()}</p>
                <p><strong>Withdrawn (paid):</strong> KES {Number(stats.totalWithdrawn).toLocaleString()}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

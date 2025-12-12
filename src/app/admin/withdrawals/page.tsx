'use client';
import { useEffect, useState } from "react";
import NavBar from "@/app/NavBar/page";

type Withdrawal = {
  id: number;
  amount: number;
  status: "pending" | "approved" | "rejected" | "paid";
  method: string;
  createdAt: string;
  fullName: string;
  email: string;
};

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const res = await fetch("/api/admin/withdrawals");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch withdrawals");
        setWithdrawals(data.withdrawals);
      } catch (err) {
        console.error(err);
        alert("Failed to load withdrawals");
      } finally {
        setLoading(false);
      }
    };
    fetchWithdrawals();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      setWithdrawals(prev =>
        prev.map(w => (w.id === id ? { ...w, status: status as Withdrawal["status"] } : w))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow border">
          <h2 className="text-2xl font-bold mb-6 text-black">Withdrawals</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-black text-white">
                  <th className="border px-4 py-2 text-left">User</th>
                  <th className="border px-4 py-2 text-left">Email</th>
                  <th className="border px-4 py-2 text-right">Amount</th>
                  <th className="border px-4 py-2 text-center">Method</th>
                  <th className="border px-4 py-2 text-center">Status</th>
                  <th className="border px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map(w => (
                  <tr key={w.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{w.fullName}</td>
                    <td className="border px-4 py-2">{w.email}</td>
                    <td className="border px-4 py-2 text-right">{Number(w.amount).toFixed(2)}</td>
                    <td className="border px-4 py-2 text-center">{w.method}</td>
                    <td className="border px-4 py-2 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          w.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : w.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : w.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {w.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <select
                        className="border rounded px-2 py-1"
                        defaultValue=""
                        onChange={e => updateStatus(w.id, e.target.value)}
                      >
                        <option value="">Select</option>
                        {w.status !== "approved" && <option value="approved">Approve</option>}
                        {w.status !== "rejected" && <option value="rejected">Reject</option>}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

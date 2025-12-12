'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavMenu from "@/app/admin/NavMenu/page";

type Investment = {
  id: string;
  userId: string;
  userName: string;
  planName: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "completed";
  startDate: string;
  endDate: string;
};

export default function AdminInvestments() {
  const router = useRouter();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const res = await fetch("/api/admin/investments");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch investments");
        setInvestments(data.investments);
      } catch (err) {
        console.error(err);
        alert("Failed to load investments.");
      } finally {
        setLoading(false);
      }
    };
    fetchInvestments();
  }, []);

  const handleAction = (investmentId: string, action: string) => {
    if (action === "") return;

    if (action === "view") {
      router.push(`/admin/investments/${investmentId}`);
    }

    // Implement other actions like approve/reject via API POST here
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <>
      <NavMenu />
      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow border">
          <h2 className="text-2xl font-bold mb-6 text-black">Investment Management</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-black">
                  <th className="border px-4 py-2 text-left text-white">User</th>
                  <th className="border px-4 py-2 text-left text-white">Plan</th>
                  <th className="border px-4 py-2 text-right text-white">Amount</th>
                  <th className="border px-4 py-2 text-center text-white">Status</th>
                  <th className="border px-4 py-2 text-center text-white">Start Date</th>
                  <th className="border px-4 py-2 text-center text-white">End Date</th>
                  <th className="border px-4 py-2 text-center text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {investments.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 text-black">{inv.userName}</td>
                    <td className="border px-4 py-2 text-black">{inv.planName}</td>
                    <td className="border px-4 py-2 text-right text-black">{Number(inv.amount).toFixed(2)}</td>
                    <td className="border px-4 py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        inv.status === "approved" ? "bg-green-100 text-green-700" :
                        inv.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        inv.status === "rejected" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {inv.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="border px-4 py-2 text-center text-black">{new Date(inv.startDate).toLocaleDateString()}</td>
                    <td className="border px-4 py-2 text-center text-black">{new Date(inv.endDate).toLocaleDateString()}</td>
                    <td className="border px-4 py-2 text-center">
                      <select
                        className="border text-black rounded px-2 py-1"
                        defaultValue=""
                        onChange={(e) => handleAction(inv.id, e.target.value)}
                      >
                        <option value="">Select</option>
                        <option value="view">View</option>
                        <option value="approve">Approve</option>
                        <option value="reject">Reject</option>
                        <option value="complete">Mark Complete</option>
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

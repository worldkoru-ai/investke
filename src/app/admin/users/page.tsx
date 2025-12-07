'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/app/NavBar/page";

type User = {
  id: string;
  name: string;
  email: string;
  walletBalance: number;
  totalInvested: number;
  totalInterestEarned: number;
  status: "active" | "suspended";
};

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch users");
        setUsers(data.users);
      } catch (err) {
        console.error(err);
        alert("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleAction = async (userId: string, action: string) => {
    if (action === "") return;
    try {
      if (action === "view") {
        router.push(`/admin/users/${userId}`);
        return;
      }

      const res = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, status: action === "suspend" ? "suspended" : "active" } : u
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to perform action.");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <NavBar />

      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow border">
          <h2 className="text-2xl font-bold mb-6 text-black">User Management</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-black">
                  <th className="border px-4 py-2 text-left">Name</th>
                  <th className="border px-4 py-2 text-left">Email</th>
                  <th className="border px-4 py-2 text-right">Wallet</th>
                  <th className="border px-4 py-2 text-right">Invested</th>
                  <th className="border px-4 py-2 text-right">Interest</th>
                  <th className="border px-4 py-2 text-center">Status</th>
                  <th className="border px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="border px-4 text-black py-2">{user.name}</td>
                    <td className="border px-4 py-2 text-black">{user.email}</td>
                    <td className="border px-4 py-2 text-right text-black">{Number(user.walletBalance).toFixed(2)}</td>
                    <td className="border px-4 py-2 text-right text-black">{Number(user.totalInvested).toFixed(2)}</td>
                    <td className="border px-4 py-2 text-right text-black">{Number(user.totalInterestEarned).toFixed(2)}</td>
                    <td className="border px-4 py-2 text-center text-black">

                        <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.status === "active"
                                ? "bg-green-100 text-green-700"
                                : user.status === "suspended"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                        >
                            {(user.status || "unknown").toUpperCase()}
                        </span>


                    </td>
                    
                    <td className="border text-black px-4 py-2 text-center">
                      <select
                        className="border  text-black rounded px-2 py-1"
                        defaultValue=""
                        onChange={(e) => {
                                const action = e.target.value;
                                if (!action) return;

                                if (action === "view") {
                                    router.push(`/admin/users/${user.id}`); // navigate to profile page
                                } else {
                                    handleAction(user.id, action); // suspend or activate
                                }

                                e.target.value = ""; // reset dropdown after action
                                }}
                            
                        >
                        <option value="">Select</option>
                        <option value="activate">Activate</option>
                        <option value="suspend">Suspend</option>
                        <option value="view">View Profile</option>
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

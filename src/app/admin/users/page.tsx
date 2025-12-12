'use client';
import { useEffect, useState } from "react";
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

type Verification = {
  idType: string;
  idFrontUrl: string;
  idBackUrl: string;
  status: "pending" | "approved" | "rejected";
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [verification, setVerification] = useState<Verification | null>(null);
  const [showModal, setShowModal] = useState(false);

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

  const handleAction = async (user: User, action: string) => {
    if (action === "") return;

    if (action === "view") {
      // Fetch profile via POST
      try {
        const res = await fetch("/api/admin/get-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch user");

        setSelectedUser(data.user);
        setVerification(data.verification);
        setShowModal(true);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch profile.");
      }
      return;
    }

    // For suspend/activate
    try {
      const res = await fetch(`/api/admin/users/${user.id}/${action}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      setUsers(prev =>
        prev.map(u =>
          u.id === user.id ? { ...u, status: action === "suspend" ? "suspended" : "active" } : u
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to perform action.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

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
                  <th className="border px-4 py-2 text-center">Status</th>
                  <th className="border px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 text-black">{user.name}</td>
                    <td className="border px-4 py-2 text-black">{user.email}</td>
                    <td className="border px-4 py-2 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <select
                        className="border text-black rounded px-2 py-1"
                        defaultValue=""
                        onChange={(e) => handleAction(user, e.target.value)}
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

          {/* Modal */}
          {showModal && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="bg-white p-6 rounded-xl max-w-xl w-full relative">
                <button
                  className="absolute top-2 right-2 text-gray-500"
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </button>
                <h3 className="text-xl font-bold mb-4">{selectedUser.name}'s Profile</h3>
                <p><b>Email:</b> {selectedUser.email}</p>
                <p><b>Wallet:</b> ${selectedUser.walletBalance.toFixed(2)}</p>
                <p><b>Total Invested:</b> ${selectedUser.totalInvested.toFixed(2)}</p>
                <p><b>Total Interest:</b> ${selectedUser.totalInterestEarned.toFixed(2)}</p>

                {verification && (
                  <>
                    <h4 className="mt-4 font-semibold">Verification Status</h4>
                    <p><b>ID Type:</b> {verification.idType}</p>
                    <p><b>Status:</b> {verification.status.toUpperCase()}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <img src={verification.idFrontUrl} className="w-full rounded border" />
                      <img src={verification.idBackUrl} className="w-full rounded border" />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

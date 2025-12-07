'use client';
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function AdminViewProfile() {
  const router = useRouter();
  const { id } = useParams(); // get user ID from URL
  const [user, setUser] = useState<User | null>(null);
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch(`/api/admin/users/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch user");

        setUser(data.user);
        setVerification(data.verification);
      } catch (err) {
        console.error(err);
        alert("Failed to load user profile.");
        router.push("/admin/users");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [id, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center">User not found</div>;

  return (
    <>
      <NavBar />

      <div className="min-h-screen bg-gray-50 pt-24 px-6">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow border">
          <h2 className="text-2xl font-bold mb-6 text-black">User Profile</h2>

          {/* USER INFO */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-gray-500 text-sm">Full Name</p>
              <p className="font-semibold text-black">{user.name}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Email</p>
              <p className="font-semibold text-black">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Wallet Balance</p>
              <p className="font-semibold text-black">${Number(user.walletBalance).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Invested</p>
              <p className="font-semibold text-black">${Number(user.totalInvested).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Interest Earned</p>
              <p className="font-semibold text-black">${Number(user.totalInterestEarned).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Status</p>
              <p className={`font-semibold text-black ${user.status === "active" ? "text-green-700" : "text-red-700"}`}>{user.status.toUpperCase()}</p>
            </div>
          </div>

          {/* VERIFICATION */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold mb-3 text-black">Verification Status</h3>

            {!verification ? (
              <div className="bg-yellow-50 border p-4 rounded">
                <p className="text-yellow-800">This user has not submitted any ID yet.</p>
              </div>
            ) : (
              <>
                <span className={`inline-block text-black mb-4 px-4 py-1 rounded-full text-sm font-semibold ${
                  verification.status === "approved" ? "bg-green-100 text-green-700"
                  : verification.status === "rejected" ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
                }`}>
                  {verification.status.toUpperCase()}
                </span>

                <p className="mb-2 text-black"><b>ID Type:</b> {verification.idType}</p>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Front</p>
                    <img src={verification.idFrontUrl} className="w-full rounded border" />
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Back</p>
                    <img src={verification.idBackUrl} className="w-full rounded border" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

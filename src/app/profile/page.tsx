'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [idType, setIdType] = useState("");
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/me")
      .then(res => res.json())
      .then(data => {
        if (!data.user) router.push("/login");
        setUser(data.user);
      });
  }, []);

  const handleSubmit = async () => {
    if (!idType || !front || !back) {
      alert("All fields are required.");
      return;
    }

    const formData = new FormData();
    formData.append("userId", user.id);
    formData.append("idType", idType);
    formData.append("front", front);
    formData.append("back", back);

    setLoading(true);

    const res = await fetch("/api/profile", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) return alert(data.error);

    alert("Verification submitted successfully!");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Profile Verification
        </h2>

        <div className="mb-4">
          <label className="block mb-2 text-gray-700 font-medium">ID Type</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={e => setIdType(e.target.value)}
            value={idType}
          >
            <option value="">Select ID Type</option>
            <option value="National ID">National ID</option>
            <option value="Passport">Passport</option>
            <option value="Driving License">Driving License</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-gray-700 font-medium">Upload Front</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setFront(e.target.files?.[0] || null)}
            className="w-full text-gray-900"
          />
          {front && (
            <img
              src={URL.createObjectURL(front)}
              alt="Front Preview"
              className="mt-2 w-full h-32 object-cover rounded-lg border"
            />
          )}
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-gray-700 font-medium">Upload Back</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setBack(e.target.files?.[0] || null)}
            className="w-full text-gray-900"
          />
          {back && (
            <img
              src={URL.createObjectURL(back)}
              alt="Back Preview"
              className="mt-2 w-full h-32 object-cover rounded-lg border"
            />
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Submit Verification"}
        </button>
      </div>
    </div>
  );
}

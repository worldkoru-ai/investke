"use client";

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
      alert("All fields required");
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md p-6">

        <h2 className="text-2xl  text-black font-bold mb-4">Profile Verification</h2>

        <label className="block mb-2 text-black text-sm font-medium">ID Type</label>
        <select
          className="w-full border text-black rounded px-3 py-2 mb-4"
          onChange={e => setIdType(e.target.value)}
        >
          <option value="">Select</option>
          <option value="National ID">National ID</option>
          <option value="Passport">Passport</option>
          <option value="Driving License">Driving License</option>
        </select>

        <label className="block mb-2  text-black text-sm font-medium">Upload Front</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => setFront(e.target.files?.[0] || null)}
          className="mb-4 text-black"
        />

        <label className="block mb-2  text-black text-sm font-medium">Upload Back</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => setBack(e.target.files?.[0] || null)}
          className="mb-4 text-black"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-indigo-600 text-black py-2 rounded"
        >
          {loading ? "Uploading..." : "Submit Verification"}
        </button>

      </div>
    </div>
  );
}

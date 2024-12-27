"use client";

import { useState, useEffect } from "react";
import { Key } from "lucide-react"; // Icon for resetting passwords

interface User {
  id: number;
  email: string;
  role: string;
}

export default function ResetPasswordPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch("/api/admin/getUsers");
      const data: User[] = await response.json();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!selectedUser || !newPassword) {
      setMessage("Please select a user and enter a new password.");
      return;
    }

    try {
      const response = await fetch("/api/admin/resetUserPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser, newPassword }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to reset password");
      }

      setMessage("Password reset successfully!");
      setNewPassword("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-100 to-white flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-white/90 shadow-2xl rounded-2xl p-8 border border-blue-100">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-4">
            <Key className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-blue-800">Reset User Password</h1>
          <p className="text-sm text-gray-600 mt-2">Select a user and set a new password for them.</p>
        </div>

        {message && (
          <div
            className={`mb-4 text-center py-2 px-3 rounded ${
              message.includes("successfully")
                ? "bg-green-50 border border-green-300 text-green-700"
                : "bg-yellow-50 border border-yellow-300 text-yellow-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <label className="block font-medium mb-2 text-blue-900">Select User</label>
            <select
              value={selectedUser ?? ""}
              onChange={(e) => setSelectedUser(Number(e.target.value))}
              className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            >
              <option value="">-- Choose a user --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email} ({user.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-2 text-blue-900">New Password</label>
            <input
              type="password"
              className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

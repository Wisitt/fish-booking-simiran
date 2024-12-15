"use client";

import { useState } from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";

const AddUserPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/admin/addUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add user.");
      }

      setSuccessMessage("User added successfully!");
      setEmail("");
      setPassword("");
      setRole("user");
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleCancel = () => {
    setEmail("");
    setPassword("");
    setRole("user");
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6">
          <h1 className="text-3xl font-bold text-center text-white">Add New User</h1>
        </div>
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <AlertTriangle className="mr-3 w-6 h-6" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg flex items-center">
              <CheckCircle className="mr-3 w-6 h-6" />
              <p className="text-sm">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleAddUser} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-black-700 mb-2">Email</label>
              <input
                type="text"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black-700 mb-2">Password</label>
              <input
                type="text"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-black-700">Role</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={role === "user"}
                    onChange={() => setRole("user")}
                    className="form-radio text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-black-700">User</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={role === "admin"}
                    onChange={() => setRole("admin")}
                    className="form-radio text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-black-700">Admin</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add User
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="w-full bg-gray-200 text-black-700 py-3 rounded-lg hover:bg-gray-300 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUserPage;

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const AddUserPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

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

      alert("User added successfully!");
      // Redirect or reset the form if needed
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleCancel = () => {
    setEmail("");
    setPassword("");
    setRole("user");
    setError("");
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-600">Add User</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleAddUser} className="space-y-6">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md"
          required
        />

        <div className="space-x-4">
          <label className="text-lg">Role:</label>
          <label>
            <input
              type="radio"
              name="role"
              value="admin"
              checked={role === "admin"}
              onChange={() => setRole("admin")}
              className="mr-2"
            />
            Admin
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="user"
              checked={role === "user"}
              onChange={() => setRole("user")}
              className="mr-2"
            />
            User
          </label>
        </div>

        <div className="flex space-x-4">
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-md">
            Add User
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="w-full bg-gray-600 text-white py-3 rounded-md"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUserPage;

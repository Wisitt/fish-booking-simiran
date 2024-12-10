"use client";

import { useState, useEffect } from "react";

const DeleteUserPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/getUsers");
        const data = await response.json();
        setUsers(data); // Assuming users data comes in a list of user objects
      } catch (error) {
        setError("Failed to fetch users");
      }
    };
    fetchUsers();
  }, []);

  const handleDeleteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      if (!selectedUser) {
        setError("Please select a user to delete.");
        return;
      }

      const response = await fetch('/api/admin/deleteUser', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }

      setSuccessMessage('User deleted successfully!');
      setUsers(users.filter((user: any) => user.id !== selectedUser)); // Remove user from list
    } catch (error) {
      setError("Failed to delete user. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-600">Delete User</h1>
      {error && <p className="text-red-500">{error}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}
      
      <form onSubmit={handleDeleteUser} className="space-y-6">
        <table className="min-w-full table-auto bg-white border-collapse shadow-md rounded-lg">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-left text-gray-600 border-b">Select</th>
              <th className="px-6 py-3 text-sm font-medium text-left text-gray-600 border-b">Email</th>
              <th className="px-6 py-3 text-sm font-medium text-left text-gray-600 border-b">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800 border-b">
                  <input
                    type="radio"
                    name="user"
                    value={user.id}
                    onChange={() => setSelectedUser(user.id)}
                    className="cursor-pointer"
                  />
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 border-b">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-800 border-b">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4">
          <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-md">
            Delete User
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeleteUserPage;

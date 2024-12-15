"use client";

import { useState, useEffect } from "react";
import { Trash2, AlertTriangle, CheckCircle } from "lucide-react";

interface User {
  id: string;
  email: string;
  role: "admin" | "user";
}

const DeleteUserPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/getUsers");
        const data: User[] = await response.json();
        setUsers(data);
        setIsLoading(false);
      } catch {
        setErrorMessage("Failed to fetch users");
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDeleteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!selectedUser) {
      setErrorMessage("Please select a user to delete.");
      return;
    }

    try {
      const response = await fetch("/api/admin/deleteUser", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser }),
      });

      const result: { error?: string } = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete user");
      }

      setSuccessMessage("User deleted successfully!");
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== selectedUser));
    } catch (err) {
      console.error("Error deleting user:", err);
      setErrorMessage("Failed to delete user. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-red-700 p-6">
          <h1 className="text-3xl font-bold text-center text-white flex items-center justify-center">
            <Trash2 className="mr-3 w-8 h-8" />
            Delete User
          </h1>
        </div>

        <div className="p-8">
          {errorMessage && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg flex items-center mb-6">
              <AlertTriangle className="mr-3 w-6 h-6" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg flex items-center mb-6">
              <CheckCircle className="mr-3 w-6 h-6" />
              <p className="text-sm">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleDeleteUser} className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-red-600 rounded-full">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-black-500">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-red-50">
                      <th className="px-6 py-3 text-sm font-medium text-left text-red-600 border-b">
                        Select
                      </th>
                      <th className="px-6 py-3 text-sm font-medium text-left text-red-600 border-b">
                        Username
                      </th>
                      <th className="px-6 py-3 text-sm font-medium text-left text-red-600 border-b">
                        Role
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className={`hover:bg-red-50 transition duration-300 ${
                          selectedUser === user.id ? "bg-red-100" : ""
                        }`}
                      >
                        <td className="px-6 py-4 text-sm text-black border-b">
                          <input
                            type="radio"
                            name="user"
                            value={user.id}
                            onChange={() => setSelectedUser(user.id)}
                            className="form-radio text-red-600 focus:ring-red-500"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-black border-b">{user.email}</td>
                        <td className="px-6 py-4 text-sm text-black border-b">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6">
              <button
                type="submit"
                disabled={!selectedUser}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserPage;

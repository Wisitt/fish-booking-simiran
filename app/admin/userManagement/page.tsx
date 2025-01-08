// app/admin/userManagement/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, AlertTriangle, CheckCircle, Users, Search, Key, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
interface User {
  id: string;
  email: string;
  role: "admin" | "user";
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("user");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  
  useEffect(() => {
    fetchUsers();
  }, []);

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

  const handleDeleteUser = async (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      const response = await fetch("/api/admin/deleteUser", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userToDelete.id }),
      });
  
      if (!response.ok) throw new Error("Failed to delete user");
  
      setUsers(users.filter(user => user.id !== userToDelete.id));
      setSuccessMessage("User deleted successfully!");
    } catch (err) {
      setErrorMessage("Failed to delete user. Please try again.");
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };
  
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/admin/addUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role ,code}),
      });

      if (!response.ok) throw new Error("Failed to add user");

      setSuccessMessage("User added successfully!");
      setEmail("");
      setPassword("");
      setCode("");
      setRole("user");
      fetchUsers();
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) {
      setErrorMessage("Please select a user and enter a new password");
      return;
    }

    try {
      const response = await fetch("/api/admin/resetUserPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser, newPassword }),
      });

      if (!response.ok) throw new Error("Failed to reset password");

      setSuccessMessage("Password reset successfully!");
      setNewPassword("");
      setSelectedUser(null);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            </div>
            
            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="px-4 py-2 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-xl font-bold text-blue-600">{users.length}</p>
              </div>
              <div className="px-4 py-2 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-xl font-bold text-purple-600">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {(errorMessage || successMessage) && (
          <div className="transition-all duration-300 ease-in-out">
            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center">
                <AlertTriangle className="mr-3 w-6 h-6 text-red-500" />
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            )}
            {successMessage && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-center">
                <CheckCircle className="mr-3 w-6 h-6 text-green-500" />
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            )}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Add User Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Add New User
              </h2>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder="Enter email or Username"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                        placeholder="Password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Code</label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder="Enter unique code"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add User
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Reset Password Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Key className="w-5 h-5 text-yellow-600" />
              Reset Password
            </h2>
            <div className="space-y-4">
              <select
                value={selectedUser ?? ""}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email} ({user.role})
                  </option>
                ))}
              </select>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleResetPassword}
                className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-all flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4" />
                Reset Password
              </button>
            </div>
          </div>
        </div>

        {/* Users Table Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">User List</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-800 transition-colors p-2 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Confirm Delete User
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Are you sure you want to delete user <span className="font-semibold text-gray-900">{userToDelete?.email}</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex space-x-3 mt-4">
          <button
            onClick={() => setIsDeleteDialogOpen(false)}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete User
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  );
};

export default UsersPage;

// app/admin/dashboard.tsx
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const AdminDashboard = () => {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole !== 'admin') {
      router.push('/login'); // If not admin, redirect to login
    } else {
      setRole(storedRole);
    }
  }, [router]);

  if (role !== 'admin') return null;

  return (
    <div className="container mx-auto px-6 py-8">
      {/* <h1 className="text-4xl font-bold mb-6 text-center text-blue-600">Admin Dashboard</h1>
      <div className="space-y-6">
        <button onClick={() => router.push('/admin/addUser')} className="bg-blue-600 text-white py-3 px-6 rounded-md">
          Add User
        </button>
        <button onClick={() => router.push('/admin/deleteUser')} className="bg-red-600 text-white py-3 px-6 rounded-md">
          Delete User
        </button>
      </div> */}
      DashBoard :D
    </div>
  );
};

export default AdminDashboard;

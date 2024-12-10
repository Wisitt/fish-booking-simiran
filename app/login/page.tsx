"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  
    const data = await response.json();
  
    if (response.ok) {
      // Ensure userId is set correctly
      const { role, id: userId } = data; // Destructure to get role and userId
  
      // Store role, email, and userId in localStorage
      localStorage.setItem("role", role);
      localStorage.setItem("email", email);
      localStorage.setItem("userId", userId.toString()); // Save userId properly
  
      // Redirect based on role
      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/bookings");
      }
    } else {
      alert(data.message || "Invalid credentials.");
    }
  };
  
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-600">Login</h1>
      <form onSubmit={handleLogin} className="space-y-6">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md"
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-md">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;

// app/login/page.tsx 

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaUserAlt, FaLock } from "react-icons/fa";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const { role, id: userId, code, team, customers } = data;
      localStorage.setItem("role", role);
      localStorage.setItem("email", email);
      localStorage.setItem("userId", userId);
      localStorage.setItem("code", code); // Add code to localStorage
      localStorage.setItem("team", JSON.stringify(team)); // เก็บทีม
      localStorage.setItem("customers", JSON.stringify(customers)); // เก็บลูกค้า

      router.push("/");
    } else {
      alert(data.message || "Invalid credentials.");
    }
    
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-gradient-to-br from-sky-600 via-blue-200 to-sky-300 relative font-sans">
      {/* Decorative Blobs with subtle animation */}
      <div className="absolute w-80 h-80 bg-pink-200 rounded-full top-[-5rem] left-[-5rem] blur-3xl opacity-30 animate-pulse-slow"></div>
      <div className="absolute w-80 h-80 bg-sky-200 rounded-full bottom-[-5rem] right-[10%] blur-3xl opacity-30 animate-pulse-slow"></div>

      {/* Left Side: Branding */}
      <div className="hidden md:flex flex-col justify-center items-start pl-16 relative w-1/2">
        <div className="relative z-10">
          <h1 className="text-6xl font-extrabold leading-snug bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 drop-shadow-sm select-none">
            Simiranfood
          </h1>
          <h2 className="text-4xl font-bold text-black mt-2 select-none">Booking System</h2>
          <p className="text-black mt-4 text-lg max-w-sm select-none">
            Welcome to the ultimate fish booking experience.
            Efficient, Easy, and Elegant.
          </p>
        </div>
      </div>

      {/* Right Side: Login Box */}
      <div className="flex-1 flex items-center justify-center relative p-4">
        <div className="bg-white/50 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-md w-full border border-white/20 hover:shadow-2xl hover:scale-105 transition-transform duration-300 ease-in-out">
          <h1 className="text-4xl text-center   font-extrabold leading-snug bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-sky-400 to-blue-600 drop-shadow-sm select-none">Login</h1>
          <p className="text-center text-black mb-8 font-medium">Sign in to your account</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 pl-12 text-black bg-white/70 rounded-full border border-black-500 placeholder-black-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
              />
              <FaUserAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black" />
            </div>

            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 pl-12 text-black bg-white/70 rounded-full border border-black-500 placeholder-black-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
              />
              <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black" />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-700 to-sky-300 text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:scale-[1.04] transition-transform duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              Login
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .animate-pulse-slow {
          animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;

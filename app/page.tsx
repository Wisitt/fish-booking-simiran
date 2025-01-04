// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./styles/bubble.module.css";

export default function HomePage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("role");
    if (!userId) {
      router.push("/login");
    } else {
      setRole(userRole);
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-gradient-to-br from-sky-300 via-sky-200 to-sky-600">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-10 -left-10 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute w-96 h-96 -top-10 -right-10 bg-sky-400/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute w-96 h-96 -bottom-10 -left-10 bg-indigo-400/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        <div className="absolute w-96 h-96 -bottom-10 -right-10 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
      </div>

      {/* Floating Bubbles */}
      <div className={styles.backgroundWrap}>
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className={`${styles.bubble} ${styles[`x${i + 1}`]}`}
            style={{
              '--delay': `${i * 0.5}s`,
              '--size': `${Math.random() * 2 + 1}rem`
            } as React.CSSProperties}
          ></div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-md w-full mx-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-black/90">
            Welcome to Simiran
          </h1>
          
          <p className="text-lg mb-8 text-black/90">
            Your complete solution for seafood booking management
          </p>

          {role !== "admin" && (
            <Link
              href="/bookings"
              className="group relative inline-flex items-center justify-center px-8 py-3 font-bold text-white rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-50 transition-opacity"></span>
              <span className="relative">Enter Booking System</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

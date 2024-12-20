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
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-gradient-to-b from-sky-400 via-sky-500 to-sky-700 text-white">
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className={styles.lightRays}></div>
      </div>
      <div className={styles.backgroundWrap}>
        {[...Array(10)].map((_, i) => (
          <div key={i} className={`${styles.bubble} ${styles[`x${i + 1}`]}`}></div>
        ))}
      </div>

      <div className="relative z-20 bg-white/70 backdrop-blur-lg shadow-2xl rounded-lg max-w-md w-full p-8 text-center text-sky-900">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Welcome to <span className="text-blue-600">Simiran System</span>
        </h1>
        <p className="text-md md:text-lg mb-6">
          Streamline your bookings and track data effortlessly.
        </p>

        {role !== "admin" && (
          <Link
            href="/bookings"
            className="inline-block px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full shadow-lg hover:scale-105 transition-all"
          >
            Go to Booking System
          </Link>
        )}
      </div>
    </div>
  );
}

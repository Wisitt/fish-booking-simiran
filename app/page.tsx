"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./styles/bubble.module.css"; // Correctly import the CSS module

export default function Home() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("role");

    if (!userId) {
      router.push("/login"); // Redirect to login if no userId is found
    } else {
      setRole(userRole);
    }
  }, [router]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #3baff2, #0a2647)", // Sea gradient background
      }}
    >
      {/* Light Rays Effect */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className={styles.lightRays}></div>
      </div>

      {/* Bubbles Animation */}
      <div className={styles.backgroundWrap}>
        {[...Array(10)].map((_, i) => (
          <div key={i} className={`${styles.bubble} ${styles[`x${i + 1}`]}`}></div>
        ))}
      </div>

      {/* Content Box */}
      <div className="relative z-20 bg-white/50 backdrop-blur-lg shadow-2xl rounded-lg max-w-2xl w-full p-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-black-800 mb-4">
          Welcome to the <span className="text-blue-600">Simiran System</span>
        </h1>
        <p className="text-lg md:text-xl text-black mb-6">
          Streamline your bookings, track data effortlessly, and explore our intuitive system.
        </p>

        {/* Conditionally render the button for non-admin users */}
        {role !== "admin" && (
          <Link
            href="/bookings"
            className="inline-block px-6 py-3 text-lg md:text-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full shadow-lg hover:scale-105 transform transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Go to Booking System
          </Link>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./styles/bubble.module.css"; // Correctly import the CSS module

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");  // หากไม่พบ userId ให้ redirect ไปที่ /login
    }
  }, [router]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #3baff2, #0a2647)",  // Sea gradient background
      }}
    >
      {/* Light Rays Effect */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className={styles.lightRays}></div>
      </div>

      {/* Bubbles Animation */}
      <div className={styles.backgroundWrap}>
        <div className={`${styles.bubble} ${styles.x1}`}></div>
        <div className={`${styles.bubble} ${styles.x2}`}></div>
        <div className={`${styles.bubble} ${styles.x3}`}></div>
        <div className={`${styles.bubble} ${styles.x4}`}></div>
        <div className={`${styles.bubble} ${styles.x5}`}></div>
        <div className={`${styles.bubble} ${styles.x6}`}></div>
        <div className={`${styles.bubble} ${styles.x7}`}></div>
        <div className={`${styles.bubble} ${styles.x8}`}></div>
        <div className={`${styles.bubble} ${styles.x9}`}></div>
        <div className={`${styles.bubble} ${styles.x10}`}></div>
      </div>

      {/* Content Box */}
      <div className="text-center p-10 bg-white/40 rounded-lg shadow-xl max-w-lg w-full z-20">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
          Welcome to the Simiran System
        </h1>
        <p className="text-xl text-gray-800 mb-8">
          Manage your bookings, track data, and more with the Simiran system, designed for ease and efficiency.
        </p>
        <div className="space-y-6">
          <Link
            href="/bookings"
            className="text-2xl font-medium text-white px-8 py-4 rounded-full shadow-xl transition duration-300 transform hover:scale-105"
          >
            Go to Booking System
          </Link>
        </div>
      </div>
    </div>
  );
}

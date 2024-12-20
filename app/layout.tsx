// app/layout.tsx 
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // เพิ่ม event listener เมื่อมีการเปลี่ยนแปลงใน localStorage
  useEffect(() => {
    const checkLoginStatus = () => {
      const role = localStorage.getItem("role");
      setIsLoggedIn(!!role);  // ถ้ามี role แสดงว่า user ได้เข้าสู่ระบบ
    };

    // เช็คสถานะการล็อกอินทันทีที่หน้าโหลด
    checkLoginStatus();

    // ฟังการเปลี่ยนแปลงใน localStorage
    window.addEventListener("storage", checkLoginStatus);

    // ทำความสะอาดหลังจากการ render
    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, [pathname]);

  // ถ้า user ไม่ล็อกอิน หรืออยู่ในหน้า login, ให้แสดงเฉพาะ children
  if (!isLoggedIn || pathname === "/login") {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
      <title>Simiran Food Systems</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Simiran Food Systems - The best food booking system" />
        <link rel="icon" href="/fish_logo.png" />
        </head>
      <body className="h-screen w-screen overflow-hidden bg-gradient-to-b from-sky-200 via-sky-400 to-sky-300  flex">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={handleSidebarToggle} />
        <div className={`flex-1 overflow-auto transition-all ${isSidebarOpen ? "ml-0" : "ml-0"}`}>
          {children}
        </div>
      </body>
    </html>
  );
}

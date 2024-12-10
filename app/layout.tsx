"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
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
      <body className="flex flex-col sm:flex-row">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={handleSidebarToggle} />
        <div className={`flex-1 overflow-auto transition-all ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
          {children}
        </div>
      </body>
    </html>
  );
}

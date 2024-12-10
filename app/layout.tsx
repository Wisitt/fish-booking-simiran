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

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role) {
      setIsLoggedIn(true);  // Set to true if there is a role
    } else {
      setIsLoggedIn(false); // Set to false if no role is found
    }
  }, [router]);

  // If user is not logged in, show login page, else show the sidebar
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

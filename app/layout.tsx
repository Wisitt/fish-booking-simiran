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

  useEffect(() => {
    const checkLoginStatus = () => {
      const role = localStorage.getItem("role");
      setIsLoggedIn(!!role);
    };

    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, [pathname]);

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
      <body className="h-screen w-screen ">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={handleSidebarToggle} />
      <div className={`flex-1 overflow-y-auto transition-all ${
        isSidebarOpen ? "md:ml-60 ml-0" : "ml-0"
      }`}>
        {children}
      </div>
    </body>
    </html>
  );
}

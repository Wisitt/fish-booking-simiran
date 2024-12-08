"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <html lang="en">
      <body className="flex flex-col sm:flex-row">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={handleSidebarToggle} />

        {/* Main content */}
        <div
          className={`flex-1 p-8 overflow-auto transition-all ${
            isSidebarOpen ? "ml-64" : "ml-16"
          }`}
        >
          {children}
        </div>
      </body>
    </html>
  );
}

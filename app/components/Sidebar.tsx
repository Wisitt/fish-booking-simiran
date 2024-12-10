"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../styles/logo.module.css"; // Import the logo CSS module

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    router.push("/login"); // Redirect to login page after logout
  };

  if (!role) {
    return null; // Don't render the Sidebar if there's no role
  }

  return (
    <div
      className={`fixed left-0 top-0 z-50 h-full bg-gradient-to-r from-[#0A2647] via-[#144272] to-[#205295] text-white transition-all duration-300 ease-in-out ${
        isOpen ? "w-64" : "w-20"
      } h-screen shadow-xl rounded-r-md`}
    >
      <div className="flex flex-col w-full h-full p-1.5">
        <button
          onClick={toggleSidebar}
          className={`relative h-8 w-10 mb-2 ${isOpen ? "top-0 left-[199px]" : "top-0 left-3"} p-2 transition-all duration-300 transform hover:scale-110`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-8 h-full w-10 absolute ${isOpen ? "text-white top-0 right-0" : "text-gray-100 top-0 left-0"} transition-all duration-300 transform `}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>

        <div className="flex flex-col items-center justify-center p-2 space-y-2 border rounded-2xl bg-white/35 backdrop-blur-lg">
          {/* Fish Logo */}
          <div className={`${styles["fish-logo"]} h-7 ${isOpen ? "w-20" : "w-[60px]"}`}>
            <img src="/fish_logo.png" alt="Fish Logo" />
          </div>
          <h2
            className={`${
              isOpen ? "block" : "hidden"
            } text-md text-white font-semibold transition-all duration-300 ease-in-out`}
          >
            SIMIRAN FOOD SYSTEMS
          </h2>
        </div>

        <div className="flex flex-col mt-8 space-y-6 px-4">
          <Link
            href="/"
            className={`${
              isOpen ? "block" : "hidden"
            } px-4 py-3 rounded-lg text-lg font-medium hover:bg-[#2C74B3] hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105`}
          >
            Home
          </Link>

          {role === "admin" && (
            <>
              <Link
                href="/admin"
                className={`${
                  isOpen ? "block" : "hidden"
                } px-4 py-3 rounded-lg text-lg font-medium hover:bg-[#2C74B3] hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105`}
              >
                Admin Dashboard
              </Link>
              <Link
              href="/admin/bookings"
              className={`${
                isOpen ? "block" : "hidden"
              } px-4 py-3 rounded-lg text-lg font-medium hover:bg-[#2C74B3] hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105`}
            >
              Booking System
            </Link>
              <Link
                href="/admin/addUser"
                className={`${
                  isOpen ? "block" : "hidden"
                } px-4 py-3 rounded-lg text-lg font-medium hover:bg-[#2C74B3] hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105`}
              >
                Add User
              </Link>
              <Link
                href="/admin/deleteUser"
                className={`${
                  isOpen ? "block" : "hidden"
                } px-4 py-3 rounded-lg text-lg font-medium hover:bg-[#2C74B3] hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105`}
              >
                Delete User
              </Link>
              
            </>
          )}

          {role === "user" && (
            <Link
              href="/bookings"
              className={`${
                isOpen ? "block" : "hidden"
              } px-4 py-3 rounded-lg text-lg font-medium hover:bg-[#2C74B3] hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105`}
            >
              Booking System
            </Link>
          )}
        </div>

        <div className="flex flex-col mt-6 space-y-4">
          <button
            onClick={handleLogout}
            className={`${
              isOpen ? "block" : "hidden"
            } px-4 py-2 text-white bg-red-600 hover:bg-red-700 transition`}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

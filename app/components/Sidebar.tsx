"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../styles/logo.module.css"; // Ensure you have this logo style or remove if unused
import Image from 'next/image';


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
    router.push("/login");
  };

  if (!role) {
    return null;
  }

  // ไอคอนสำหรับเมนู (Inline SVG จาก Heroicons)
  const HomeIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 4l9 5.5M4.5 10v9a1.5 1.5 0 001.5 1.5h3m9-10v10a1.5 1.5 0 01-1.5 1.5H15m-6 0h6" />
    </svg>
  );
  const DashboardIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h7V3H3v9zm0 9h7v-7H3v7zm11-18h7v7h-7V3zm0 18h7v-9h-7v9z" />
    </svg>
  );
  const BookingIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M3 11h18m-14 4h10m-10 4h6" />
    </svg>
  );
  const AddUserIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3M15 5a3 3 0 110-6 3 3 0 010 6zM2 20.5a10 10 0 0113.78-9.56" />
    </svg>
  );
  const DeleteUserIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9h-6m6 0h-6m0 0H9m3 0c0 3.314-2.686 6-6 6S0 12.314 0 9c0-3.314 2.686-6 6-6 1.306 0 2.417.418 3.3 1.119M15 5a3 3 0 110-6 3 3 0 010 6z" />
    </svg>
  );
  const LogoutIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6m0 0v6m0-6L9 15m0 0v6m0-6h6" />
    </svg>
  );

  return (
    <div
      className={`fixed left-0 top-0 z-50 h-screen transition-all duration-300 ease-in-out ${
        isOpen ? "w-64" : "w-20"
      } shadow-xl rounded-r-2xl overflow-hidden bg-gradient-to-b from-sky-300 via-sky-200 to-sky-600 relative font-sans`}
    >
      {/* Decorative Bubbles */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute w-6 h-6 bg-white/30 rounded-full top-10 left-10 animate-bubble"></div>
        <div className="absolute w-4 h-4 bg-white/20 rounded-full top-20 left-16 animate-bubble-slow"></div>
        <div className="absolute w-5 h-5 bg-white/20 rounded-full top-1/2 left-8 animate-bubble"></div>
        <div className="absolute w-3 h-3 bg-white/20 rounded-full bottom-16 right-4 animate-bubble-slow"></div>
      </div>

      <div className="flex flex-col w-full h-full p-2 relative z-10">
        <button
          onClick={toggleSidebar}
          className={`absolute top-4 p-2 text-black-600 transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-48" : "translate-x-2"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-6 h-6`}
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

        <div className="flex flex-col items-center justify-center mt-14 mx-2 p-3 space-y-2 bg-white/40 rounded-xl backdrop-blur-md shadow-md border border-white/20">
          {/* Fish Logo */}
          <div className={`${styles["fish-logo"]} h-10 w-10`}>
            <Image
             src="/fish_logo.png" 
             alt="Fish Logo" 
             className="object-contain"
             width={100} // Set appropriate width
             height={100} // Set appropriate height
             priority={true}
              />
          </div>
          <h2
            className={`${
              isOpen ? "block" : "hidden"
            } text-sm text-black-800 font-semibold transition-all duration-300 ease-in-out`}
          >
            SIMIRAN FOOD SYSTEMS
          </h2>
        </div>

        <div className="flex flex-col mt-10 space-y-4 px-2">
          <Link
            href="/"
            className={`flex items-center ${
              isOpen ? "px-4 py-2" : "p-2 justify-center"
            } rounded-lg text-sm font-medium text-black hover:bg-white/50 hover:scale-105 transition-all duration-300 ease-in-out`}
          >
            {HomeIcon}
            <span className={`${isOpen ? "block" : "hidden"} ml-3`}>Home</span>
          </Link>

          {role === "admin" && (
            <>
              <Link
                href="/admin/dashboard"
                className={`flex items-center ${
                  isOpen ? "px-4 py-2" : "p-2 justify-center"
                } rounded-lg text-sm font-medium text-black hover:bg-white/50 hover:scale-105 transition-all duration-300 ease-in-out`}
              >
                {DashboardIcon}
                <span className={`${isOpen ? "block" : "hidden"} ml-3`}>Dashboard</span>
              </Link>
              <Link
                href="/admin/bookings"
                className={`flex items-center ${
                  isOpen ? "px-4 py-2" : "p-2 justify-center"
                } rounded-lg text-sm font-medium text-black hover:bg-white/50 hover:scale-105 transition-all duration-300 ease-in-out`}
              >
                {BookingIcon}
                <span className={`${isOpen ? "block" : "hidden"} ml-3`}>Booking System</span>
              </Link>
              <Link
                href="/admin/addUser"
                className={`flex items-center ${
                  isOpen ? "px-4 py-2" : "p-2 justify-center"
                } rounded-lg text-sm font-medium text-black hover:bg-white/50 hover:scale-105 transition-all duration-300 ease-in-out`}
              >
                {AddUserIcon}
                <span className={`${isOpen ? "block" : "hidden"} ml-3`}>Add User</span>
              </Link>
              <Link
                href="/admin/deleteUser"
                className={`flex items-center ${
                  isOpen ? "px-4 py-2" : "p-2 justify-center"
                } rounded-lg text-sm font-medium text-black hover:bg-white/50 hover:scale-105 transition-all duration-300 ease-in-out`}
              >
                {DeleteUserIcon}
                <span className={`${isOpen ? "block" : "hidden"} ml-3`}>Delete User</span>
              </Link>
            </>
          )}

          {role === "user" && (
            <Link
              href="/bookings"
              className={`flex items-center ${
                isOpen ? "px-4 py-2" : "p-2 justify-center"
              } rounded-lg text-sm font-medium text-black hover:bg-white/50 hover:scale-105 transition-all duration-300 ease-in-out`}
            >
              {BookingIcon}
              <span className={`${isOpen ? "block" : "hidden"} ml-3`}>Booking System</span>
            </Link>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-end mb-4 px-2">
          <button
            onClick={handleLogout}
            className={`flex items-center ${
              isOpen ? "px-4 py-2" : "p-2 justify-center"
            } rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-400 hover:scale-105 transition-all duration-300 ease-in-out`}
          >
            {LogoutIcon}
            <span className={`${isOpen ? "block" : "hidden"} ml-3`}>Logout</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .animate-bubble {
          animation: bubble 6s infinite ease-in-out;
        }
        .animate-bubble-slow {
          animation: bubble 9s infinite ease-in-out;
        }
        @keyframes bubble {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-15px) scale(1.15);
            opacity: 0.9;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;


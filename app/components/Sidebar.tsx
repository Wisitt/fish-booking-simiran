"use client";
import Link from "next/link";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  return (
    <div
      className={`fixed left-0 top-0 z-50 h-full bg-blue-700 text-white transition-width duration-300 ease-in-out ${
        isOpen ? "w-64" : "w-13"
      }  h-screen`}
    >
      <div className="flex flex-col w-full h-full">
        <div className="flex items-center justify-between p-4">
          {/* Sidebar Header */}
          <h2 className={`${isOpen ? "block" : "hidden"} text-xl font-bold`}>Fish Booking</h2>
          <button onClick={toggleSidebar} className="p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-6 h-6 ${isOpen ? "text-white" : "text-black"}`}
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
        </div>
        <div className="flex flex-col mt-6 space-y-4">
          <Link
            href="/"
            className={`${isOpen ? "block" : "hidden"} px-4 py-2 text-white hover:bg-blue-600 transition`}
          >
            Home
          </Link>
          <Link
            href="/bookings"
            className={`${isOpen ? "block" : "hidden"} px-4 py-2 text-white hover:bg-blue-600 transition`}
          >
            Booking System
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

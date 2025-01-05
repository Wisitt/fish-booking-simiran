// app/components/Sidebar.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from 'next/image';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, Settings, LogOut, Users, Calendar,
  PlusCircle, Trash2, KeyRound, Menu, X 
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const [role, setRole] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    router.push("/login");
  };

  if (!role) return null;

  const menuItems = [
    { icon: <Home size={20} />, label: "Home", href: "/" },
    ...(role === "admin" ? [
      { icon: <Settings size={20} />, label: "Dashboard", href: "/admin/dashboard" },
      { icon: <Calendar size={20} />, label: "Booking System", href: "/admin/bookings" },
      { icon: <PlusCircle size={20} />, label: "User Management", href: "/admin/userManagement" },
      { icon: <PlusCircle size={20} />, label: "Announcements", href: "/admin/announcements" },

      // { icon: <PlusCircle size={20} />, label: "Monitor", href: "/admin/monitor" },
      // { icon: <PlusCircle size={20} />, label: "3daysum", href: "/admin/3daySum" },


    ] : [
      { icon: <Calendar size={20} />, label: "Booking System", href: "/bookings" },
      { icon: <Calendar size={20} />, label: "Booking System", href: "/announcements" },

    ]),
  ];

  const sidebarVariants = {
    mobile: {
      y: isOpen ? 0 : "-100%",
      x: 0,
      width: "100%",
      height: "auto",
      transition: { type: "tween", duration: 0.3 }
    },
    desktop: {
      x: isOpen ? 0 : -240,
      y: 0,
      width: 240,
      height: "100vh",
      transition: { type: "tween", duration: 0.3 }
    }
  };

  return (
    <>
      {/* Toggle Button - แยกออกมาอยู่นอก AnimatePresence */}
      <button
          onClick={toggleSidebar}
          className={`fixed top-2 z-[60] p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-all duration-10
            ${isMobile 
              ? 'right-4' // บนมือถือให้อยู่มุมขวา
              : `left-4 ${isOpen ? 'md:translate-x-44 lg:translate-x-44' : 'translate-x-0'}`
            }
          `}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>


      <AnimatePresence>
        {/* Overlay for mobile */}
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}

        {/* Sidebar */}
        <motion.div
          initial={isMobile ? { y: "-100%" } : { x: "-100%" }}
          animate={
            isMobile 
              ? { y: isOpen ? 0 : "-100%" }
              : { x: isOpen ? 0 : "-100%" }
          }
          exit={isMobile ? { y: "-100%" } : { x: "-100%" }}
          variants={sidebarVariants}
          className={`fixed ${
            isMobile ? 'top-0 left-0 right-0' : 'left-0 top-0 bottom-0 w-60'
          } bg-white shadow-2xl z-50`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                <Image
                  src="/fish_logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="font-bold text-lg">SIMIRAN</span>
              </div>
            </div>

              {/* Menu Items */}
              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {menuItems.map((item) => (
                  <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (isMobile) {
                      toggleSidebar();
                    }
                  }}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
                  ))}
                </div>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full p-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </>
  );
};

export default Sidebar;

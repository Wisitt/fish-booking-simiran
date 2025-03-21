// app/(user)/bookings/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "@/components/Pagination";
import { getMondayWeekAndYear, getPreviousMondayWeek, shiftDailyQuantities } from "@/app/lib/weekUtils";
import { SharedDialog } from "@/app/components/shared/dialog";
import BookingForm from "./components/BookingForm";
interface Booking {
  id: number;
  code: string;
  team: string;
  customerGroup: string;
  customerName: string;
  price: string;
  dailyQuantities: Record<string, number>;
  fishSize: string;
  fishType: string;
  userId: number;
  weekNumber: number; 
  year: number; 
  status: string;
}
type TabKey = "current" | "previous"| "previousGroup2"| "group1" | "group2";

export default function BookingPage() {
  const [bookingsCurrent, setBookingsCurrent] = useState<Booking[]>([]);
  const [bookingsPrevious, setBookingsPrevious] = useState<Booking[]>([]);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("current");

  const [searchCode, setSearchCode] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [bookings, setBookings] = useState<Booking[]>([]);


  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const firstInputRef = useRef<HTMLInputElement | null>(null);


  // Generate summary for bookings
  const generateBookingSummary = (bookings: Booking[]) => {
    const summary: Record<string, { total: number; customers: Record<string, Record<string, number>> }> = {};

    bookings.forEach((booking) => {
      const { fishType, fishSize, customerName, dailyQuantities } = booking;

      if (!summary[fishType]) {
        summary[fishType] = { total: 0, customers: {} };
      }

      if (!summary[fishType].customers[customerName]) {
        summary[fishType].customers[customerName] = {};
      }

      summary[fishType].customers[customerName][fishSize] =
        (summary[fishType].customers[customerName][fishSize] || 0) +
        Object.values(dailyQuantities).reduce((sum, qty) => sum + qty, 0);

      summary[fishType].total += Object.values(dailyQuantities).reduce((sum, qty) => sum + qty, 0);
    });

    return summary;
  };
  
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("/api/bookings");
        if (!res.ok) throw new Error("Failed to fetch bookings");
        const data = await res.json();
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();

    // Polling every 10 seconds for real-time updates
    const interval = setInterval(() => {
      fetchBookings();
    }, 10000);

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);
  
  // Fetch current week bookings
  async function fetchCurrentWeek(userId: string) {
    const { year, weekNumber } = getMondayWeekAndYear(new Date());
    const url = `/api/bookings?year=${year}&weekNumber=${weekNumber}&excludeGroup=กลุ่ม%202%20:%20ต่อราคา`;
    try {
      const res = await fetch(url, { headers: { "user-id": userId } });
      if (!res.ok) throw new Error("Failed to fetch current week bookings");
      const data = await res.json();
      setBookingsCurrent(data);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching current week bookings.");
    }
  }


  // Fetch previous week bookings
  async function fetchPreviousWeek(userId: string) {

    const { year, weekNumber } = getPreviousMondayWeek(new Date());
    const group2Url = `/api/bookings?year=${year}&weekNumber=${weekNumber}&group=กลุ่ม%202%20:%20ต่อราคา`; // Fetch group 2 separately
    const url = `/api/bookings?year=${year}&weekNumber=${weekNumber}&excludeGroup=${encodeURIComponent("กลุ่ม 2 : ต่อราคา")}`;
    try {
      const res = await fetch(url, { headers: { "user-id": userId } });
      if (!res.ok) throw new Error("Failed to fetch previous week bookings");
      const data = await res.json();
      setBookingsPrevious(data.filter((booking: { customerGroup: string; }) => booking.customerGroup !== "กลุ่ม 2 : ต่อราคา"));
      setBookingsPreviousGroup2(data.filter((booking: { customerGroup: string; }) => booking.customerGroup === "กลุ่ม 2 : ต่อราคา"));
    } catch (error) {
      console.error(error);
      toast.error("Error fetching previous week bookings.");
    }
  }

  const [bookingsPreviousGroup2, setBookingsPreviousGroup2] = useState<Booking[]>([]);


  const copyAllEnabled = !bookingsPrevious.some(
    (booking) => booking.customerGroup === "กลุ่ม 2 : ต่อราคา"
  );
  useEffect(() => {
    const checkAndFetchData = () => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        // Fetch current and previous week data
        setCurrentUserId(Number(userId));
        fetchCurrentWeek(userId);
        fetchPreviousWeek(userId);
      }
    };
  
    // Check and update data every day at midnight
    const now = new Date();
    const timeUntilMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0
    ).getTime() - now.getTime();
  
    checkAndFetchData(); // Initial fetch on mount
    const timer = setTimeout(() => {
      checkAndFetchData(); // Fetch new data when the date changes
      setInterval(checkAndFetchData, 24 * 60 * 60 * 1000); // Repeat every 24 hours
    }, timeUntilMidnight);
  
    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);
  

  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchCode, activeTab, bookingsCurrent]);

  const summary =
    activeTab === "current"
      ? generateBookingSummary(bookingsCurrent)
      : activeTab === "previous"
      ? generateBookingSummary(bookingsPrevious)
      : activeTab === "previousGroup2"
      ? generateBookingSummary(bookingsPreviousGroup2)
      : activeTab === "group1"
      ? generateBookingSummary(bookingsCurrent.filter((b) => b.customerGroup === "กลุ่ม 1 : ไม่ต่อราคา"))
      : generateBookingSummary(bookingsCurrent.filter((b) => b.customerGroup === "กลุ่ม 2 : ต่อราคา"));


      
  const filteredBookings = (activeTab === "current"
    ? bookingsCurrent
    : activeTab === "previous"
    ? bookingsPrevious
    : activeTab === "group1"
    ? bookingsCurrent.filter((b) => b.customerGroup === "กลุ่ม 1 : ไม่ต่อราคา")
    : bookingsCurrent.filter((b) => b.customerGroup === "กลุ่ม 2 : ต่อราคา")
  ).filter((b) => b.code.toLowerCase().includes(searchCode.toLowerCase()));


  const totalPages = filteredBookings.length > 0 ? Math.ceil(filteredBookings.length / itemsPerPage) : 1;
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => setCurrentPage(page);


  // ลบ booking
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/bookings?id=${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error deleting booking.");
      }
      setBookingsCurrent((prev) => prev.filter((b) => b.id !== deleteId));
      toast.success("Booking deleted successfully!");
    } catch (error) {
      console.error(error); 
      toast.error("Failed to delete booking.");
    } finally {
      setDeleteId(null);
      setIsDialogOpen(false);
    }
  };
  

  // แก้ไข booking (เปิดฟอร์มในแท็บ current)
  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking); // Set the booking to edit
    setActiveTab("current"); // Switch to the current tab
    setTimeout(() => {
      firstInputRef.current?.focus(); // Focus the first input field
    }, 0);
  };

  const clearEditingBooking = () => {
    setEditingBooking(null);
  };


  async function copyAllToCurrentWeek() {
    if (!currentUserId) {
      toast.error("User not logged in.");
      return;
    }
  
    try {
      const { year, weekNumber } = getMondayWeekAndYear(new Date()); // Current week
      const copiedBookings = bookingsPrevious.map((booking) => {
        const shiftedDaily = shiftDailyQuantities(booking.dailyQuantities, 7); // Shift dates +7 days
        return {
          ...booking,
          year,
          weekNumber,
          dailyQuantities: shiftedDaily,
          id: undefined, // Remove the ID to allow creation of new entries
        };
      });
  
      // POST all copied bookings to the server
      const responses = await Promise.all(
        copiedBookings.map((newBooking) =>
          fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newBooking),
          })
        )
      );
  
      // Check for errors
      const failed = responses.filter((res) => !res.ok);
      if (failed.length > 0) {
        throw new Error(`Failed to copy ${failed.length} bookings.`);
      }
  
      // Add copied bookings to the current bookings state
      const newBookings = await Promise.all(responses.map((res) => res.json()));
      setBookingsCurrent((prev) => [...prev, ...newBookings]);
  
      toast.success("All bookings copied to current week!");
      setActiveTab("current");
    } catch (error) {
      console.error(error); 
      toast.error("Failed to copy all bookings.");
    }
  }
  
  // copy booking จาก previous -> current (วันจันทร์เป็นสัปดาห์ใหม่)
  async function copyToCurrentWeek(booking: Booking) {
    if (!currentUserId) {
      toast.error("User not logged in.");
      return;
    }
    try {
      const { year, weekNumber } = getMondayWeekAndYear(new Date());
      const shiftedDaily = shiftDailyQuantities(booking.dailyQuantities, 7); // +7วัน

      const body = {
        code: booking.code,
        team: booking.team,
        customerGroup: booking.customerGroup,
        customerName: booking.customerName,
        price: booking.price,
        fishSize: booking.fishSize,
        fishType: booking.fishType,
        userId: currentUserId,
        year,
        weekNumber,
        dailyQuantities: shiftedDaily,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to copy booking");
      }

      setBookingsCurrent((prev) => [...prev, data]);
      toast.success(`Copied booking "${booking.code}" to MondayWeek (${year}, #${weekNumber})`);
      setActiveTab("current");
    } catch (error) {
      console.error(error); 
      toast.error("Error copying booking to current week.");
    }
  }

  const TableHeader = ({ isPrevious = false }) => (
    <tr className={`${isPrevious ? 'bg-pink-100' : 'bg-gray-100'} text-center`}>
      <th className="py-2 px-3 font-medium text-gray-700 whitespace-nowrap">Code</th>
      <th className="py-2 px-3 font-medium text-gray-700 whitespace-nowrap">Team</th>
      <th className="py-2 px-3 font-medium text-gray-700 whitespace-nowrap">Group</th>
      <th className="py-2 px-3 font-medium text-gray-700 whitespace-nowrap">Customer</th>
      <th className="py-2 px-3 font-medium text-gray-700 whitespace-nowrap">Fish Size</th>
      <th className="py-2 px-3 font-medium text-gray-700 whitespace-nowrap">Fish Type</th>
      <th className="py-2 px-3 font-medium text-gray-700 whitespace-nowrap">Price</th>
      <th className="py-2 px-3 font-medium text-gray-700 whitespace-nowrap">Daily Qty</th>
      <th className="py-2 px-3 font-medium text-gray-700 whitespace-nowrap">Year</th>
      <th className="py-2 px-3 font-medium text-gray-700 whitespace-nowrap">Week</th>
      <th className="py-2 px-3 font-medium text-gray-700 whitespace-nowrap">Status</th>
      <th className="py-2 px-3 font-medium text-gray-700 text-center whitespace-nowrap">Actions</th>
    </tr>
  );

  const TableRow = ({ booking, isPrevious, onCopy, onEdit,onDelete }: { booking: Booking; isPrevious: boolean; onCopy: (booking: Booking) => void; onEdit: (booking: Booking) => void; onDelete: (id: number) => void }) => (
    <tr className={`hover:${isPrevious ? 'bg-pink-50' : 'bg-gray-50'} text-center`}>
      <td className="py-2 px-3 border whitespace-nowrap">{booking.code}</td>
      <td className="py-2 px-3 border whitespace-nowrap">{booking.team}</td>
      <td className="py-2 px-3 border whitespace-nowrap">{booking.customerGroup}</td>
      <td className="py-2 px-3 border whitespace-nowrap">{booking.customerName}</td>
      <td className="py-2 px-3 border whitespace-nowrap">{booking.fishSize}</td>
      <td className="py-2 px-3 border whitespace-nowrap">{booking.fishType}</td>
      <td className="py-2 px-3 border whitespace-nowrap">{booking.price}</td>
      <td className="py-2 px-3 border">
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full text-center border-collapse">
            <thead>
              <tr>
                {Object.keys(booking.dailyQuantities).map((day) => (
                  <th key={day} className="py-1 px-2 bg-gray-200 border-r last:border-0 text-xs whitespace-nowrap">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {Object.values(booking.dailyQuantities).map((qty, idx) => (
                  <td key={idx} className="py-1 px-2 border-r last:border-0 text-xs whitespace-nowrap">
                    {qty}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </td>
      <td className="py-2 px-3 border whitespace-nowrap">{booking.year}</td>
      <td className="py-2 px-3 border whitespace-nowrap">{booking.weekNumber}</td>
      <td className="py-2 px-3 border whitespace-nowrap">{booking.status}</td>
      <td className="py-2 px-3 border text-center whitespace-nowrap">
        {isPrevious ? (
          <Button
            onClick={() => onCopy(booking)}
            className="bg-blue-200 text-blue-700 hover:bg-blue-100 text-xs w-full"
          >
            Copy
          </Button>
        ) : (
          <div className="flex justify-center gap-2">
          {(booking.status === "รออนุมัติ" || booking.status === "ถูกปฏิเสธ") && (
            <Button onClick={() => onEdit(booking)} variant="edit">
              <FaEdit className="mr-1" /> Edit
            </Button>
          )}
            <Button
              onClick={() => onDelete(booking.id)}
              className="bg-red-500 text-white hover:bg-red-600 text-xs"
            >
              <FaTrash className="mr-1" /> Delete
            </Button>
          </div>
        )}
      </td>
    </tr>
  );

  const calculateDailyTotals = (bookings: Booking[]) => {
    const dailyTotals: Record<string, number> = {};

    bookings.forEach((booking) => {
      Object.entries(booking.dailyQuantities).forEach(([day, qty]) => {
        dailyTotals[day] = (dailyTotals[day] || 0) + qty;
      });
    });

    return dailyTotals;
  };


  const dailyTotals =
  activeTab === "current"
    ? calculateDailyTotals(bookingsCurrent)
    : activeTab === "previous"
    ? calculateDailyTotals(bookingsPrevious)
    : activeTab === "group1"
    ? calculateDailyTotals(bookingsCurrent.filter((b) => b.customerGroup === "กลุ่ม 1 : ไม่ต่อราคา"))
    : calculateDailyTotals(bookingsCurrent.filter((b) => b.customerGroup === "กลุ่ม 2 : ต่อราคา"));

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 p-4 lg:p-8">    
    {/* Header Section */}
    <div className="max-w-7xl mx-auto mb-8">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 text-center">
        Booking Management System
      </h1>
      <p className="text-center text-gray-600 mt-2">
        Manage your bookings for the week
      </p>
    </div>

    {/* Main Content */}
    <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex -mb-px">
          <button
            onClick={() => setActiveTab("current")}
            className={`px-6 py-3 text-sm font-medium transition-colors duration-200 relative
              ${activeTab === "current" 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-gray-500 hover:text-gray-700"}`}
          >
            Current Week
          </button>
          <button
            onClick={() => setActiveTab("previous")}
            className={`px-6 py-3 text-sm font-medium transition-colors duration-200 relative
              ${activeTab === "previous" 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-gray-500 hover:text-gray-700"}`}
          >
            Previous Week
          </button>
          <button
            onClick={() => setActiveTab("previousGroup2")}
            className={`px-6 py-3 text-sm font-medium transition-colors duration-200 relative
              ${activeTab === "previous" 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-gray-500 hover:text-gray-700"}`}
          >
            PreviousGroup2 Week
          </button>
          <button
              onClick={() => setActiveTab("group1")}
              className={`px-6 py-3 text-sm font-medium transition-colors duration-200 relative ${
                activeTab === "group1" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Group 1 (ไม่ต่อราคา)
            </button>
            <button
              onClick={() => setActiveTab("group2")}
              className={`px-6 py-3 text-sm font-medium transition-colors duration-200 relative ${
                activeTab === "group2" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Group 2 (ต่อราคา)
            </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
          {activeTab === "current" && (
          <>
            <div className="mb-8">
              <BookingForm
                setBookings={setBookingsCurrent}
                editingBooking={editingBooking}
                clearEditingBooking={() => clearEditingBooking}
                firstInputRef={firstInputRef}
              />
            </div>
            
        {/* Summary Section */}
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm mb-8 p-6">
        <h2 className="text-lg font-bold text-gray-800">ข้อมูลสรุป</h2>
        {Object.entries(summary).length > 0 ? (
          Object.entries(summary).map(([fishType, details]) => (
            <div key={fishType} className="mt-4 border-b border-gray-200 pb-4">
              <h3 className="text-base font-semibold text-blue-700">{`ชนิดปลา: ${fishType}`}</h3>
              <p className="text-sm text-gray-700">
                <strong>รวมทั้งหมด:</strong> {details.total} ตัว
              </p>
              {Object.entries(details.customers).map(([customerName, fishSizes]) => (
                <div key={customerName} className="mt-2">
                  <p className="text-sm text-gray-700">
                    <strong>ลูกค้า:</strong> {customerName}
                  </p>
                  {Object.entries(fishSizes).map(([fishSize, total]) => (
                    <p key={fishSize} className="text-sm text-gray-700">
                      <strong>ขนาด {fishSize}:</strong> {total} ตัว
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">ไม่มีข้อมูลสรุป</p>
        )}
      </div>


            {/* Search Bar */}
            <div className="flex items-center space-x-2 max-w-sm mb-6">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by code..."
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </>
        )}

        <div className="p-6 bg-gray-50 rounded-lg shadow-sm my-4">
          <h2 className="text-lg font-semibold text-gray-700">Daily Totals</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-4">
            {Object.entries(dailyTotals).map(([day, total]) => (
              <div key={day} className="p-3 bg-white rounded shadow-sm border">
                <h3 className="text-sm font-medium text-gray-600">{day}</h3>
                <p className="text-xl font-bold text-gray-800">{total}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Table Section */}
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <TableHeader isPrevious={activeTab === "previous"} />
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activeTab === "previous" && copyAllEnabled && (
                  <tr className="bg-blue-50">
                    <td colSpan={8} className="py-3 px-4 text-center text-gray-700 font-medium">
                      Copy all previous week's bookings
                    </td>
                    <td colSpan={3} className="py-3 px-4 text-center">
                      <Button
                        onClick={copyAllToCurrentWeek}
                        className="bg-blue-600 text-white hover:bg-blue-700 w-full"
                      >
                        Copy All
                      </Button>
                    </td>
                  </tr>
                )}
                {/* Table Rows */}
                {paginatedBookings.map((booking) => (
                    <TableRow
                      key={booking.id}
                      booking={booking}
                      isPrevious={activeTab === "previous"}
                      onCopy={copyToCurrentWeek}
                      onEdit={(booking) => handleEdit(booking)}
                      onDelete={(id) => {
                        setDeleteId(id);
                        setIsDialogOpen(true);
                      }}
                    />
                  ))}
                
              </tbody>
            </table>
          </div>
        </div>
        <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
      </div>
    </div>

      {/* Dialog Confirm Delete */}
      <SharedDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title="Confirm Deletion"
        description="Are you sure you want to delete this booking? It can&apos;t be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        isDestructive
      />
    </div>
  );
}

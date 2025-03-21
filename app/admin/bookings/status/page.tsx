// app/admin/bookings/status/page.tsx

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Booking {
  id: number;
  code: string;
  status: string;
  isApproved: boolean;
  price: number;
  team: string;
  customerGroup: string;
  customerName: string;
  fishSize: string;
  fishType: string;
  dailyQuantities: Record<string, number>;
}

type TabKey = "group1" | "group2";

interface RejectedBookingLog {
  id: number;
  code: string;
  price: number;
  timestamp: string;
}

export default function StatusTableRow() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("group1");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [rejectedBookings, setRejectedBookings] = useState<RejectedBookingLog[]>([]);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch("/api/bookings");
        if (!res.ok) throw new Error("Failed to fetch bookings");
        const data = await res.json();
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    }
  
    async function fetchRejectedLogs() {
      try {
        const res = await fetch("/api/admin/rejectedBookings");
        if (!res.ok) throw new Error("Failed to fetch rejected logs");
        const data = await res.json();
        setRejectedBookings(data);
      } catch (error) {
        console.error("Error fetching rejected logs:", error);
      }
    }
  
    fetchBookings();
    fetchRejectedLogs();
  }, []);

  const handleDialogOpen = (booking: Booking, action: "approve" | "reject") => {
    setSelectedBooking(booking);
    setActionType(action);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setSelectedBooking(null);
    setActionType(null);
    setIsDialogOpen(false);
  };

  // Confirm action (approve/reject)
  const handleActionConfirm = async () => {
    if (!selectedBooking || !actionType) return;
  
    try {
      if (actionType === "reject") {
        const res = await fetch("/api/bookings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedBooking.id,
            action: actionType,
            price: selectedBooking.price,
          }),
        });
  
        if (!res.ok) {
          const errorData = await res.json();
          alert(errorData.message || "Failed to reject booking.");
          return;
        }
  
        const updatedBooking = await res.json();
        setBookings((prev) =>
          prev.map((b) =>
            b.id === updatedBooking.id ? updatedBooking : b
          )
        );
        alert("Booking rejected successfully.");
      } else if (actionType === "approve") {
        const res = await fetch("/api/bookings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedBooking.id,
            action: actionType,
            price: selectedBooking.price,
          }),
        });
  
        if (!res.ok) {
          const errorData = await res.json();
          alert(errorData.message || "Failed to approve booking.");
          return;
        }
  
        const updatedBooking = await res.json();
        setBookings((prev) =>
          prev.map((b) =>
            b.id === updatedBooking.id ? updatedBooking : b
          )
        );
        alert("Booking approved successfully.");
      }
  
      handleDialogClose();
    } catch (error) {
      console.error("Error in handleActionConfirm:", error);
      alert("Internal server error.");
    }
  };
  

  const filteredBookings = bookings.filter(
    (b) =>
      b.customerGroup ===
      (activeTab === "group1" ? "กลุ่ม 1 : ไม่ต่อราคา" : "กลุ่ม 2 : ต่อราคา")
  );
  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">Admin Dashboard</h1>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab("group1")}
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === "group1" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
          }`}
        >
          กลุ่ม 1 : ไม่ต่อราคา
        </button>
        <button
          onClick={() => setActiveTab("group2")}
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === "group2" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
          }`}
        >
          กลุ่ม 2 : ต่อราคา
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-600 whitespace-nowrap">Code</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600 whitespace-nowrap">Team</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600 whitespace-nowrap">Customer Name</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600 whitespace-nowrap">Fish Size</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600 whitespace-nowrap">Fish Type</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600 whitespace-nowrap">Price (฿)</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600 whitespace-nowrap">Status</th>
              <th className="py-3 px-4 text-center font-semibold text-gray-600 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{booking.code}</td>
                <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{booking.team}</td>
                <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{booking.customerName}</td>
                <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{booking.fishSize}</td>
                <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{booking.fishType}</td>
                <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{booking.price.toLocaleString()} ฿</td>
                <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{booking.status}</td>
                <td className="py-3 px-4 text-center whitespace-nowrap">
                  <button
                    onClick={() => handleDialogOpen(booking, "approve")}
                    className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 mr-2"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDialogOpen(booking, "reject")}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rejected Bookings Log */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">Rejected Bookings Log</h2>
        {rejectedBookings.length > 0 ? (
          <ul className="mt-4 divide-y divide-gray-200">
            {rejectedBookings.map((entry, index) => (
              <li key={index} className="py-2">
                <p className="text-gray-700">
                  <span className="font-bold">#{index + 1}</span> - Code:{" "}
                  <span className="font-semibold">{entry.code}</span>, Price:{" "}
                  <span className="font-semibold">{entry.price.toLocaleString()} ฿</span>, Timestamp:{" "}
                  <span className="font-semibold">{new Date(entry.timestamp).toLocaleString()}</span>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No rejected bookings yet.</p>
        )}
      </div>

      {/* Dialog for Confirmation */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {actionType === "approve" ? "Confirm Approval" : "Confirm Rejection"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {actionType === "approve" ? "approve" : "reject"} booking{" "}
              <strong>{selectedBooking?.code}</strong> with a price of{" "}
              <strong>{selectedBooking?.price.toLocaleString()} ฿</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={handleDialogClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleActionConfirm}
              className={`px-4 py-2 rounded-md text-white ${
                actionType === "approve" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
              }`}
            >
              Confirm
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

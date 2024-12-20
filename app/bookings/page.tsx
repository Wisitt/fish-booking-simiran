// app/admin/bookings/page.tsx 
"use client";

import { useState, useEffect, useRef } from "react";
import BookingForm from "../components/BookingForm";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";

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
}

export default function BookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [searchCode, setSearchCode] = useState("");
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("User not logged in.");
        return;
      }

      const response = await fetch("/api/bookings", {
        method: "GET",
        headers: {
          "userId": userId,
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch bookings");
        return;
      }

      const data = await response.json();
      setBookings(data);
    };

    fetchBookings();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/bookings?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== id));
        alert("Booking deleted successfully!");
      } else {
        alert("Error deleting booking.");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Error deleting booking.");
    }
  };

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
  };

  const clearEditingBooking = () => {
    setEditingBooking(null);
  };

  // ทำการกรอง bookings ตามค่า searchCode
  const filteredBookings = bookings.filter(b => 
    b.code.toLowerCase().includes(searchCode.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 p-12">
      <h1 className="text-4xl font-extrabold mb-6 text-center text-blue-700">Fish Booking System</h1>
      <div className="max-w-5xl mx-auto mb-10">
        <BookingForm
          setBookings={setBookings}
          editingBooking={editingBooking}
          clearEditingBooking={clearEditingBooking}
          firstInputRef={firstInputRef}
        />
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-2 max-w-sm mb-4">
        <FaSearch className="text-gray-500" />
        <input
          type="text"
          placeholder="Filter by code..."
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-blue-600">Your Bookings</h2>
      <div className="overflow-x-auto bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-4">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">Code</th>
              <th className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">Team</th>
              <th className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">Customer Group</th>
              <th className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">Customer Name</th>
              <th className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">Fish Size</th>
              <th className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">Fish Type</th>
              <th className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">Price (THB)</th>
              <th className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">Daily Quantities</th>
              <th className="py-3 px-4 font-medium text-gray-700 text-center whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking, index) => (
              <tr key={booking.id} className={`border-b hover:bg-gray-50 transition ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <td className="py-3 px-4 text-blue-800 font-bold whitespace-nowrap">{booking.code}</td>
                <td className="py-3 px-4 text-gray-800 whitespace-nowrap">{booking.team}</td>
                <td className="py-3 px-4 text-gray-800 whitespace-nowrap">{booking.customerGroup}</td>
                <td className="py-3 px-4 text-gray-800 whitespace-nowrap">{booking.customerName}</td>
                <td className="py-3 px-4 text-gray-800 whitespace-nowrap">{booking.fishSize}</td>
                <td className="py-3 px-4 text-gray-800 whitespace-nowrap">{booking.fishType}</td>
                <td className="py-3 px-4 text-gray-800 whitespace-nowrap">{booking.price}</td>
                <td className="py-3 px-4 text-gray-800">
                  <div className="overflow-x-auto">
                    <table className="text-center border-collapse">
                      <thead>
                        <tr>
                          {Object.keys(booking.dailyQuantities).map((day) => (
                            <th key={day} className="py-1 px-3 font-medium text-gray-700 bg-gray-200 border-r last:border-0 whitespace-nowrap">{day}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {Object.entries(booking.dailyQuantities).map(([day, qty]) => (
                            <td key={day} className="py-1 px-3 border-r last:border-0 whitespace-nowrap">
                              {qty}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </td>
                <td className="py-3 px-4 text-center whitespace-nowrap">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleEdit(booking)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 flex items-center space-x-1"
                      title="Edit Booking"
                    >
                      <FaEdit />
                      <span className="hidden md:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(booking.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center space-x-1"
                      title="Delete Booking"
                    >
                      <FaTrash />
                      <span className="hidden md:inline">Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredBookings.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-6 text-gray-500">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

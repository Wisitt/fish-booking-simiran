"use client";

import { useState, useEffect, useRef } from "react";
import BookingForm from "../components/BookingForm";

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

const BookingPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
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
          "email": "",
          "role": "user",
          "userId": userId,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.statusText}`);
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
        setBookings(bookings.filter((booking) => booking.id !== id));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 p-12 font-sans">
      <h1 className="text-4xl font-extrabold mb-6 text-center text-blue-700 drop-shadow-sm">
        Fish Booking System
      </h1>

      <div className="max-w-5xl mx-auto mb-10">
        <BookingForm
          setBookings={setBookings}
          editingBooking={editingBooking}
          clearEditingBooking={clearEditingBooking}
          firstInputRef={firstInputRef}
        />
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-blue-600">Your Bookings</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="border border-white/30 p-4 rounded-xl shadow-md bg-white/70 backdrop-blur-sm flex flex-col space-y-4 transform hover:scale-[1.02] transition-transform duration-300"
          >
            <div className="font-bold text-lg text-blue-700">{booking.code}</div>
            <div className="text-sm text-black-700">
              <span className="font-medium">Team:</span> {booking.team}
            </div>
            <div className="text-sm text-black-700">
              <span className="font-medium">Customer Group:</span> {booking.customerGroup}
            </div>
            <div className="text-sm text-black-700">
              <span className="font-medium">Customer:</span> {booking.customerName}
            </div>
            <div className="text-sm text-black-700">
              <span className="font-medium">Fish Size:</span> {booking.fishSize}
            </div>
            <div className="text-sm text-black-700">
              <span className="font-medium">Fish Type:</span> {booking.fishType}
            </div>
            <div className="text-sm text-black-700">
              <span className="font-medium">Price:</span> {booking.price} THB
            </div>
            <div className="text-sm text-black-700">
              <span className="font-medium">Daily Quantities:</span>
              <ul className="ml-4 list-disc list-inside">
                {Object.entries(booking.dailyQuantities).map(([day, qty]) => (
                  <li key={day}>
                    <span className="text-black-600">{day}</span>: {qty} fish
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-between space-x-4 mt-4">
              <button
                onClick={() => handleEdit(booking)}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-300"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(booking.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingPage;

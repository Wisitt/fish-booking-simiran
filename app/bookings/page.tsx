// app/booking/page.tsx 
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
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState("");

  const firstInputRef = useRef<HTMLInputElement | null>(null); // Create ref for the first input

  useEffect(() => {
    const fetchBookings = async () => {
      const userId = localStorage.getItem("userId"); // Get userId from localStorage
      if (!userId) {
        alert("User not logged in.");
        return;
      }
  
      const response = await fetch("/api/bookings", {
        method: "GET",
        headers: {
          "email": "",
          "role": "user", // Set role
          "userId": userId, // Pass userId in the header or body to the API
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.statusText}`);
      }
  
      const data = await response.json();
      setBookings(data); // Set bookings data to state
    };
  
    fetchBookings();
  }, []);
  
  

  const handleDelete = async (id: number) => {
    setDeletingBooking(bookings.find((booking) => booking.id === id) || null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCode("");
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
  };

  const handleConfirmDelete = async () => {
    if (code === "edok" || code === "dogfuse" || code === "wisit") {
      try {
        const response = await fetch(`/api/bookings?id=${deletingBooking?.id}&code=${code}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setBookings(bookings.filter((booking) => booking.id !== deletingBooking?.id));
          alert("Booking deleted successfully!");
        } else {
          alert("Invalid code. Deletion not authorized.");
        }
      } catch (error) {
        console.error("Error deleting booking:", error);
        alert("Error deleting booking.");
      } finally {
        handleCloseModal();
      }
    } else {
      alert("Incorrect code. Please try again.");
    }
  };

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
  };

  const clearEditingBooking = () => {
    setEditingBooking(null);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-600">Fish Booking System</h1>

      <BookingForm
        setBookings={setBookings}
        editingBooking={editingBooking}
        clearEditingBooking={clearEditingBooking}
        firstInputRef={firstInputRef} // Pass ref to the form
      />

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-blue-500">Your Bookings</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="border p-4 rounded-lg shadow-md bg-gray-50 flex flex-col space-y-4"
          >
            <div className="font-bold text-lg text-blue-700">{booking.code}</div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Team:</span> {booking.team}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Customer Group:</span> {booking.customerGroup}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Customer:</span> {booking.customerName}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Fish Size:</span> {booking.fishSize}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Fish Type:</span> {booking.fishType}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Price:</span> {booking.price} THB
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Daily Quantities:</span>
              <ul>
                {Object.entries(booking.dailyQuantities).map(([day, qty]) => (
                  <li key={day}>
                    {day}: {qty} fish
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-between space-x-4 mt-4">
              <button
                onClick={() => handleEdit(booking)}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-300"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(booking.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="text-gray-700 mb-4">Please enter the secret code to delete the booking.</p>

            <input
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="Enter code"
              className="w-full p-3 border border-gray-300 rounded-md mb-4"
            />

            <div className="flex justify-between space-x-4">
              <button
                onClick={handleConfirmDelete}
                className="w-full bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600 focus:outline-none transition duration-300"
              >
                Confirm
              </button>
              <button
                onClick={handleCloseModal}
                className="w-full bg-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-400 focus:outline-none transition duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;

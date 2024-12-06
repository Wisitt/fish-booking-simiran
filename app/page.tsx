"use client";

import { useState, useEffect } from "react";
import BookingForm from "./components/BookingForm";
import SummaryTable from "./components/SummaryTable";

interface Booking {
  id: number;
  code:string;
  team: string;
  customerGroup: string;
  customerName: string;
  price: string;
  dailyQuantities: Record<string, number>;
  fishSize: string;
  fishType: string;
}
const SECRET_CODES = ["edok","dogfuse","wisit"];
const Home = () => {
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("/api/bookings");
        if (!response.ok) throw new Error("Failed to fetch bookings");

        const data: Booking[] = await response.json();
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
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
    if (SECRET_CODES.includes(code) && deletingBooking) {
      // Send the delete request
      try {
        const response = await fetch(`/api/bookings?id=${deletingBooking.id}&code=${code}`, {
          method: "DELETE",
        });

        if (response.ok) {
          // Remove the booking from the state
          setBookings(bookings.filter((booking) => booking.id !== deletingBooking.id));
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
    setEditingBooking(booking); // Load the selected booking into the form
  };

  const clearEditingBooking = () => {
    setEditingBooking(null); // Clear the editing state
  };


  const downloadExcel = async () => {
    try {
      const response = await fetch("/api/export/excel");
      if (!response.ok) throw new Error("Failed to download file");
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Fish_Booking_Report.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Error downloading Excel:", error);
      alert("Failed to download Excel file.");
    }
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-600">
        Fish Booking System
      </h1>

      <BookingForm
        setBookings={setBookings}
        editingBooking={editingBooking}
        clearEditingBooking={clearEditingBooking}
      />

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-blue-500">
        All Bookings
      </h2>
      <ul className="space-y-4">
        {bookings.map((booking) => (
          <li
            key={booking.id}
            className="border p-4 rounded-lg shadow-md bg-gray-50 flex flex-col space-y-4"
          >
            <div className="font-bold text-lg text-blue-700">Code: {booking.code}</div>
            <div className="font-bold text-lg text-blue-700">Team: {booking.team}</div>
            <div className="text-gray-600">Customer: {booking.customerName}</div>
            <div className="text-gray-600">Fish Size: {booking.fishSize}</div>
            <div className="text-gray-600">Fish Type: {booking.fishType}</div>
            <div className="text-gray-600">Price: {booking.price} THB</div>
            <div className="text-gray-600">Daily Quantities:</div>
            <ul>
              {Object.entries(booking.dailyQuantities).map(([day, qty]) => (
                <li key={day}>
                  {day}: {qty} fish
                </li>
              ))}
            </ul>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={() => handleEdit(booking)}
                className="bg-yellow-500 text-white px-4 py-2 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(booking.id)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {showModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
      <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
      <p className="text-gray-700 mb-4">Please enter the secret code to delete the booking.</p>

      {/* Input for the code */}
      <input
        type="text"
        value={code}
        onChange={handleCodeChange}
        placeholder="Enter code"
        className="w-full p-2 border border-gray-300 rounded-md mb-4"
      />

      {/* Modal Action Buttons */}
      <div className="flex justify-between space-x-4">
        <button
          onClick={handleConfirmDelete}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none"
        >
          Confirm
        </button>
        <button
          onClick={handleCloseModal}
          className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
      <SummaryTable />
      <button
      onClick={downloadExcel}
      className="bg-green-500 text-white px-4 py-2 rounded"
    >
      Export to Excel
    </button>
    </div>
    
  );
};

export default Home;

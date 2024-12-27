// app/admin/bookings/page.tsx 
"use client";

import { useState, useEffect, useRef } from "react";
import BookingForm from "../components/BookingForm";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
}

export default function BookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [searchCode, setSearchCode] = useState("");
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State for dialog

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setCurrentUserId(userId ? Number(userId) : null);

    const fetchBookings = async () => {
      try {
        const response = await fetch("/api/bookings");
        if (response.ok) {
          const data = await response.json();
          setBookings(data);
        } else {
          throw new Error("Failed to fetch bookings");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching bookings.");
      }
    };

    fetchBookings();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/bookings?id=${deleteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== deleteId));
        toast.success("Booking deleted successfully!");
      } else {
        throw new Error("Error deleting booking.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete booking.");
    } finally {
      setDeleteId(null);
      setIsDialogOpen(false); // Close the dialog after deletion
    }
  };

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
  };

  const clearEditingBooking = () => {
    setEditingBooking(null);
  };

  const filteredBookings = bookings.filter((b) =>
    b.code.toLowerCase().includes(searchCode.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 p-12">
      <ToastContainer />
      <h1 className="text-4xl font-extrabold mb-6 text-center text-blue-700">Fish Booking System</h1>
      <div className="max-w-5xl mx-auto mb-10">
        <BookingForm
          setBookings={setBookings}
          editingBooking={editingBooking}
          clearEditingBooking={clearEditingBooking}
          firstInputRef={firstInputRef}
        />
      </div>

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
      <div className="overflow-x-auto bg-white rounded-xl shadow-lg p-4">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 font-medium text-gray-700">Code</th>
              <th className="py-3 px-4 font-medium text-gray-700">Team</th>
              <th className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">Customer Group</th>
              <th className="py-3 px-4 font-medium text-gray-700">Customer Name</th>
              <th className="py-3 px-4 font-medium text-gray-700">Fish Size</th>
              <th className="py-3 px-4 font-medium text-gray-700">Fish Type</th>
              <th className="py-3 px-4 font-medium text-gray-700">Price</th>
              <th className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">Daily Quantities</th>
              <th className="py-3 px-4 font-medium text-gray-700 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border">{booking.code}</td>
                  <td className="py-3 px-4 border">{booking.team}</td>
                  <td className="py-3 px-4 border">{booking.customerGroup}</td>
                  <td className="py-3 px-4 border">{booking.customerName}</td>
                  <td className="py-3 px-4 border">{booking.fishSize}</td>
                  <td className="py-3 px-4 border">{booking.fishType}</td>
                  <td className="py-3 px-4 border">{booking.price}</td>
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
                  <td className="py-3 px-4 border text-center">
                    {currentUserId === booking.userId && (
                      <div className="flex justify-center space-x-2">
                        <Button
                          onClick={() => handleEdit(booking)}
                          variant="destructive"
                          className="flex items-center space-x-1 bg-yellow-200 border-yellow-300 text-yellow-700 hover:bg-yellow-100" 
                        >
                          <FaEdit />  
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            setDeleteId(booking.id);
                            setIsDialogOpen(true);
                          }}
                          className="flex items-center space-x-1"
                        >
                          <FaTrash />
                          <span>Delete</span>
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

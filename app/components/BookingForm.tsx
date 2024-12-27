// app/components/BookingForm.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { getWeekDays } from "@/app/lib/weekUtils";
import { SingleValue } from 'react-select';
import { FaFish, FaUserTie, FaTag, FaUsers, FaCodeBranch } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface SelectOption {
  value: string;
  label: string;
}

const ReactSelect = dynamic(() => import('react-select'), {
  ssr: false
});

const fishSizeOptions: SelectOption[] = [
  { value: "3-4", label: "3-4" },
  { value: "4-5", label: "4-5" },
  { value: "5-6", label: "5-6" },
];

const fishTypeOptions: SelectOption[] = [
  { value: "Norway", label: "Norway" },
  { value: "Trout", label: "Trout" },
];

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
  weekNumber?: number;
  userId: number;
}

interface FormData extends Omit<Booking, "id"> {}

interface Props {
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  editingBooking?: Booking | null;
  clearEditingBooking?: () => void;
  firstInputRef: React.RefObject<HTMLInputElement>;
}

const BookingForm: React.FC<Props> = ({ setBookings, editingBooking, clearEditingBooking, firstInputRef }) => {
  const weekDays = useMemo(() => getWeekDays(), []);

  const [formData, setFormData] = useState<FormData>({
    code: "",
    team: "",
    customerGroup: "",
    customerName: "",
    fishSize: "",
    fishType: "",
    price: "",
    dailyQuantities: weekDays.reduce((acc, day) => ({ ...acc, [day]: 0 }), {}),
    weekNumber: 0,
    userId: 0,
  });

  useEffect(() => {
    if (editingBooking) {
      setFormData(editingBooking);
    } else {
      setFormData({
        code: "",
        team: "",
        customerGroup: "",
        customerName: "",
        fishSize: "",
        fishType: "",
        price: "",
        dailyQuantities: weekDays.reduce((acc, day) => ({ ...acc, [day]: 0 }), {}),
        weekNumber: 0,
        userId: 0,
      });
    }
    firstInputRef.current?.focus();
  }, [editingBooking, firstInputRef, weekDays]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("day-")) {
      const day = name.replace("day-", "");
      setFormData((prev) => ({
        ...prev,
        dailyQuantities: { ...prev.dailyQuantities, [day]: Number(value) },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (
    field: "fishSize" | "fishType",
    option: SingleValue<SelectOption>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: option?.value || "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.team || !formData.customerGroup || !formData.customerName || !formData.price) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const method = editingBooking ? "PUT" : "POST";
      const url = editingBooking ? `/api/bookings/${editingBooking.id}` : "/api/bookings";
      const userId = localStorage.getItem("userId");

      if (!userId) {
        toast.error("User is not logged in.");
        return;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId: parseInt(userId) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save booking");
      }

      editingBooking
        ? setBookings((prev) => prev.map((b) => (b.id === data.id ? data : b)))
        : setBookings((prev) => [...prev, data]);

      toast.success(editingBooking ? "Booking updated!" : "Booking saved!");
      clearEditingBooking?.();
    } catch (error) {
      console.error("Error saving booking:", error);
      toast.error("Error saving booking.");
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <form onSubmit={handleSubmit} className="space-y-8 p-8 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200">
        <h1 className="text-2xl font-bold text-center text-blue-800 mb-4">
          {editingBooking ? "Edit Booking" : "Add New Booking"}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-2">
              <FaCodeBranch className="text-blue-600" /><span>Code</span>
            </label>
            <input
              ref={firstInputRef}
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="e.g. S123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-2">
              <FaUsers className="text-green-600" /><span>Team</span>
            </label>
            <input
              type="text"
              name="team"
              value={formData.team}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-300"
              placeholder="e.g. Seafood Team"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-2">
              <FaUserTie className="text-purple-600" /><span>Customer Group</span>
            </label>
            <input
              type="text"
              name="customerGroup"
              value={formData.customerGroup}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-300"
              placeholder="e.g. Restaurant, Hotel"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-2">
              <FaUserTie className="text-purple-600" /><span>Customer Name</span>
            </label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-300"
              placeholder="e.g. A Seafood Restaurant"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-2">
              <FaFish className="text-blue-500" /><span>Fish Size</span>
            </label>
            <ReactSelect
              options={fishSizeOptions}
              value={fishSizeOptions.find((o) => o.value === formData.fishSize)}
              onChange={(opt) => handleSelectChange("fishSize", opt as SingleValue<SelectOption>)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-2">
              <FaFish className="text-blue-500" /><span>Fish Type</span>
            </label>
            <ReactSelect
              options={fishTypeOptions}
              value={fishTypeOptions.find((o) => o.value === formData.fishType)}
              onChange={(opt) => handleSelectChange("fishType", opt as SingleValue<SelectOption>)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-2">
              <FaTag className="text-pink-500" /><span>Price (THB)</span>
            </label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="e.g. 1500"
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Quantities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
            {Object.entries(formData.dailyQuantities).map(([day, qty]) => (
              <div key={day} className="flex flex-col bg-white p-3 rounded-md shadow-sm border border-gray-100">
                <label className="text-sm text-gray-700 font-medium mb-1">{day}</label>
                <input
                  type="number"
                  name={`day-${day}`}
                  value={qty}
                  onChange={handleChange}
                  className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-4 pt-8">
          <button
            type="submit"
            className={`flex-1 py-3 font-semibold rounded transition ${
              editingBooking
                ? "bg-yellow-500 text-black hover:bg-yellow-600"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {editingBooking ? "Update Booking" : "Save Booking"}
          </button>
          {editingBooking && (
            <button
              type="button"
              onClick={clearEditingBooking}
              className="flex-1 py-3 bg-gray-300 text-black rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          )}
        </div>

      </form>
    </>
  );
};

export default BookingForm;

"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Select = dynamic(() => import("react-select"), { ssr: false });

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

interface FormData {
  code: string;
  team: string;
  customerGroup: string;
  customerName: string;
  fishSize: string;
  fishType: string;
  price: string;
  dailyQuantities: Record<string, number>;
}

interface BookingFormProps {
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  editingBooking?: Booking | null;
  clearEditingBooking?: () => void;
  firstInputRef: React.RefObject<HTMLInputElement>;
}

const BookingForm: React.FC<BookingFormProps> = ({
  setBookings,
  editingBooking,
  clearEditingBooking,
  firstInputRef,
}) => {
  const getWeekDays = (): string[] => {
    const startDate = new Date();
    const days: string[] = [];
    for (let i = 1; i <= 6; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + (i - startDate.getDay()));
      days.push(date.toISOString().split("T")[0]);
    }
    return days;
  };

  const fishSizeOptions = [
    { value: "3/4", label: "3/4" },
    { value: "4/5", label: "4/5" },
    { value: "5/6", label: "5/6" },
  ];

  const fishTypeOptions = [
    { value: "Norway", label: "Norway" },
    { value: "Trout", label: "Trout" },
  ];

  const [formData, setFormData] = useState<FormData>({
    code: "",
    team: "",
    customerGroup: "",
    customerName: "",
    fishSize: "",
    fishType: "",
    price: "",
    dailyQuantities: {},
  });

  useEffect(() => {
    const weekDays = getWeekDays();
    if (editingBooking) {
      setFormData(editingBooking);
      if (firstInputRef.current) firstInputRef.current.focus();
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
      });
      if (firstInputRef.current) firstInputRef.current.focus();
    }
  }, [editingBooking,firstInputRef]);

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
    option: { value: string; label: string }
  ) => {
    setFormData((prev) => ({ ...prev, [field]: option.value }));
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.code ||
      !formData.team ||
      !formData.customerGroup ||
      !formData.customerName ||
      !formData.price ||
      Object.keys(formData.dailyQuantities).length === 0
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const method = editingBooking ? "PUT" : "POST";
      const url = editingBooking ? `/api/bookings/${editingBooking.id}` : "/api/bookings";

      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("User is not logged in.");
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

      const updatedBooking = data;

      if (editingBooking) {
        setBookings((prev) =>
          prev.map((booking) => (booking.id === updatedBooking.id ? updatedBooking : booking))
        );
        alert("Booking updated!");
      } else {
        setBookings((prev) => [...prev, updatedBooking]);
        alert("Booking saved!");
      }

      clearEditingBooking?.();
    } catch (error) {
      console.error("Error saving booking:", error);
      alert("Error saving booking.");
    }
  };

  return (
    <div className="relative">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-20">
        <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="bgGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="100%" stopColor="#a7f3d0" />
            </linearGradient>
          </defs>
          <rect width="800" height="600" fill="url(#bgGradient)" />
          <path fill="#fff" d="M0,300 C200,400 600,200 800,300 L800,600 L0,600 Z" opacity="0.3" />
        </svg>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 p-8 max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-xl shadow-2xl relative z-10"
      >
        <h1 className="text-3xl font-extrabold text-center text-blue-700 mb-6 drop-shadow-sm">
          {editingBooking ? "Edit Booking" : "Add New Booking"}
        </h1>

        {/* General Information */}
        <div>
          <h2 className="text-xl font-bold text-black-800 mb-4 border-b border-gray-300 pb-2">General Info</h2>
          <div className="flex flex-wrap gap-6">
            <div className="flex flex-col sm:w-full md:w-1/4">
              <label className="block text-sm font-medium text-black-800 mb-1">
                Code <span className="text-red-500"></span>
              </label>
              <input
                ref={firstInputRef}
                type="text"
                name="code"
                placeholder="e.g., AB123"
                value={formData.code}
                onChange={handleChange}
                className="w-full p-2 bg-white/90 text-black border-2 border-emerald-900 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-300 hover:shadow-md"
              />
            </div>
            <div className="flex flex-col sm:w-full md:w-1/4">
              <label className="block text-sm font-medium text-black-800 mb-1">
                Team <span className="text-red-500"></span>
              </label>
              <input
                type="text"
                name="team"
                placeholder="Team Name"
                value={formData.team}
                onChange={handleChange}
                className="w-full p-2 bg-white/90 text-black border-2 border-emerald-900 rounded-md shadow-inner focus:ring-2 focus:ring-blue-400 focus:outline-none hover:shadow-lg"
              />
            </div>
            <div className="flex flex-col sm:w-full md:w-1/4">
              <label className="block text-sm font-medium text-black-800 mb-1">
                Customer Group <span className="text-red-500"></span>
              </label>
              <input
                type="text"
                name="customerGroup"
                placeholder="e.g., VIP Group"
                value={formData.customerGroup}
                onChange={handleChange}
                className="w-full p-2 bg-white/90 text-black border-2 border-emerald-900 rounded-md shadow-inner focus:ring-2 focus:ring-blue-400 focus:outline-none hover:shadow-lg"
              />
            </div>
            <div className="flex flex-col sm:w-full md:w-1/4">
              <label className="block text-sm font-medium text-black-800 mb-1">
                Customer Name <span className="text-red-500"></span>
              </label>
              <input
                type="text"
                name="customerName"
                placeholder="e.g., John Doe"
                value={formData.customerName}
                onChange={handleChange}
                className="w-full p-2 bg-white/90 text-black border-2 border-emerald-900 rounded-md shadow-inner focus:ring-2 focus:ring-blue-400 focus:outline-none hover:shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Fish Info */}
        <div>
          <h2 className="text-xl font-bold text-black-800 mb-4 border-b border-gray-300 pb-2">Fish Details</h2>
          <div className="flex flex-wrap gap-6">
            <div className="flex flex-col sm:w-full md:w-1/4">
              <label className="block text-sm font-medium text-black-800 mb-1">
                Fish Size <span className="text-red-500"></span>
              </label>
              <Select
                options={fishSizeOptions}
                placeholder="Select size..."
                value={fishSizeOptions.find((opt) => opt.value === formData.fishSize)}
                onChange={(option) => handleSelectChange("fishSize", option as { value: string; label: string })}
                className="rounded-md p-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 hover:shadow-lg"
              />
            </div>

            <div className="flex flex-col sm:w-full md:w-1/4">
              <label className="block text-sm font-medium text-black-800 mb-1">
                Fish Type <span className="text-red-500"></span>
              </label>
              <Select
                options={fishTypeOptions}
                placeholder="Select type..."
                value={fishTypeOptions.find((opt) => opt.value === formData.fishType)}
                onChange={(option) => handleSelectChange("fishType", option as { value: string; label: string })}
                className="rounded-md p-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 hover:shadow-lg"
              />
            </div>

            <div className="flex flex-col sm:w-full md:w-1/4">
              <label className="block text-sm font-medium text-black-800 mb-1">
                Price (THB) <span className="text-red-500"></span>
              </label>
              <input
                type="text"
                name="price"
                placeholder="e.g., 500"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2 bg-white/90 text-black border-2 border-emerald-900 rounded-md shadow-inner focus:ring-2 focus:ring-blue-400 focus:outline-none hover:shadow-lg"
              />
              <span className="text-xs text-black-500 mt-1">Enter price in Thai Baht</span>
            </div>
          </div>
        </div>

        {/* Daily Quantities */}
        <div>
          <h2 className="text-xl font-bold text-black-800 mt-8 mb-4 border-b border-gray-300 pb-2">Daily Quantities <span className="text-red-500"></span></h2>
          <p className="text-sm text-black-600 mb-4">Please fill in the quantity for each day.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-4">
            {Object.keys(formData.dailyQuantities).map((day) => (
              <div key={day} className="flex flex-col items-start">
                <label className="text-sm text-black-700 font-medium mb-1">{day}</label>
                <input
                  type="number"
                  name={`day-${day}`}
                  placeholder="0"
                  value={formData.dailyQuantities[day]}
                  onChange={handleChange}
                  className="w-full p-2 bg-white/90 text-black border-2 border-emerald-900 rounded-md shadow-inner focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-300 hover:shadow-lg"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-4 pt-6">
          <button
            type="submit"
            className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-900 text-white font-semibold rounded-lg hover:opacity-90 hover:scale-[1.02] focus:outline-none transition duration-300 shadow-lg"
          >
            {editingBooking ? "Update Booking" : "Save Booking"}
          </button>
          {editingBooking && (
            <button
              type="button"
              onClick={clearEditingBooking}
              className="flex-1 py-3 bg-gray-300 text-black-800 rounded-lg hover:bg-gray-400 focus:outline-none transition duration-300 shadow-lg"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BookingForm;

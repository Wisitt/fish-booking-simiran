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
  firstInputRef: React.RefObject<HTMLInputElement>;  // Add this prop

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
      days.push(date.toISOString().split("T")[0]); // Format as YYYY-MM-DD
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
    fishSize: "Medium",
    fishType: "Tilapia",
    price: "",
    dailyQuantities: {},
  });

  useEffect(() => {
    if (editingBooking) {
      setFormData(editingBooking); // Load data for editing
      if (firstInputRef.current) {
        firstInputRef.current.focus();
      }
    } else {
      const weekDays = getWeekDays(); // Get the days of the current week
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
    }
  }, [editingBooking]);

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

  const handleSelectChange = (field: "fishSize" | "fishType", option: any) => {
    setFormData((prev) => ({ ...prev, [field]: option.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Validate that all required fields are filled
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
  
      // Ensure userId is retrieved from localStorage
      const userId = localStorage.getItem("userId");
  
      if (!userId) {
        alert("User is not logged in.");
        return;
      }
  
      // Log the data to check if everything is correct
      console.log("Form data being submitted:", { ...formData, userId });
  
      // Make the API request
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId: parseInt(userId) }), // Pass userId correctly
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to save booking");
      }
  
      // Handle the response after saving the booking
      const updatedBooking = data;
  
      if (editingBooking) {
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === updatedBooking.id ? updatedBooking : booking
          )
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
    <div className="">
            <form onSubmit={handleSubmit} className="space-y-6 p-8 max-w-4xl mx-auto bg-white rounded-lg shadow-xl">
      <h1 className="text-2xl font-semibold text-center text-blue-600">
        {editingBooking ? "Edit Booking" : "Add New Booking"}
      </h1>

      {/* Responsive Form Layout with Flexbox */}
      <div className="flex flex-wrap gap-2">
        <div className="flex flex-col sm:w-1/1 md:w-1/4 lg:w-1/6">
          <label className="block text-sm font-medium text-gray-700">Code:</label>
          <input
            ref={firstInputRef} 
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex flex-col sm:w-1/1 md:w-1/4 lg:w-1/6">
          <label className="block text-sm font-medium text-gray-700">Team:</label>
          <input
            type="text"
            name="team"
            value={formData.team}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="flex flex-col sm:w-1/1 md:w-1/4 lg:w-1/6">
          <label className="block text-sm font-medium text-gray-700">Customer Group:</label>
          <input
            type="text"
            name="customerGroup"
            value={formData.customerGroup}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="flex flex-col sm:w-1/1 md:w-1/4 lg:w-1/6">
          <label className="block text-sm font-medium text-gray-700">Customer Name:</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex flex-col sm:w-1/1 md:w-1/4 lg:w-1/6">
          <label className="block text-sm font-medium text-gray-700">Fish Size:</label>
          <Select
            options={fishSizeOptions}
            value={fishSizeOptions.find((opt) => opt.value === formData.fishSize)}
            onChange={(option) => handleSelectChange("fishSize", option)}
            className="w-full h-full rounded-md focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex flex-col sm:w-1/1 md:w-1/4 lg:w-1/6">
          <label className="block text-sm font-medium text-gray-700">Fish Type:</label>
          <Select
            options={fishTypeOptions}
            value={fishTypeOptions.find((opt) => opt.value === formData.fishType)}
            onChange={(option) => handleSelectChange("fishType", option)}
            className="w-full h-full rounded-md focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex flex-col sm:w-1/1 md:w-1/4 lg:w-1/6">
          <label className="block text-sm font-medium text-gray-700">Price:</label>
          <input
            type="text"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Daily Quantities Section */}
      <h2 className="text-lg font-semibold text-gray-800 mt-6">Daily Quantities</h2>
      {Object.keys(formData.dailyQuantities).map((day) => (
        <div key={day} className="flex justify-between mb-3">
          <label className="text-sm text-gray-600">{day}:</label>
          <input
            type="number"
            name={`day-${day}`}
            value={formData.dailyQuantities[day]}
            onChange={handleChange}
            className="w-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600"
          />
        </div>
      ))}

      {/* Submit and Cancel Buttons */}
      <div className="flex space-x-4">
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {editingBooking ? "Update" : "Save"}
        </button>
        {editingBooking && (
          <button
            type="button"
            onClick={clearEditingBooking}
            className="w-full py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
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

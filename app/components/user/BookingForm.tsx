// app/components/BookingForm.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getMondayWeekAndYear, getWeekDays } from "../../lib/weekUtils";
import { Button } from "@/components/ui/button";
import { handleNumericInputChange } from "../../lib/inputUtils";

interface SelectOption {
  value: string;
  label: string;
}

const customerGroupOptions: SelectOption[] = [
  { value: "กลุ่ม 1 : ไม่ต่อราคา", label: "กลุ่ม 1 : ไม่ต่อราคา" },
  { value: "กลุ่ม 2 : ต่อราคา", label: "กลุ่ม 2 : ต่อราคา" },
];

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
  weekNumber: number;
  userId: number;
  year: number;
}

interface FormData extends Omit<Booking, "id"> {}

interface Props {
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  editingBooking?: Booking | null;
  clearEditingBooking?: () => void;
  firstInputRef: React.RefObject<HTMLInputElement>;
}

export default function BookingForm({
  setBookings,
  editingBooking,
  clearEditingBooking,
  firstInputRef,
}: Props) {
  const weekDays = useMemo(() => {
    const allDays = getWeekDays();
    return allDays.slice(0, 6); // Show Monday to Saturday only
  }, []);
  const [dailyQuantity, setDailyQuantity] = useState("");

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
    year: 0,
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
        year: 0,
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


  function handleNativeSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { year, weekNumber } = getMondayWeekAndYear(new Date());
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error("User not logged in.");
      return;
    }

    const body = {
      ...formData,
      userId: Number(userId),
      year,
      weekNumber,
      createdAt: new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())).toISOString(),
    };

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Failed to create booking");
      const data = await response.json();
      toast.success("Booking created successfully!");
      setBookings((prev) => [...prev, data]);
    } catch (error) {
      console.error(error);
      toast.error("Error creating booking.");
    }
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto space-y-8 p-8 bg-white shadow-lg rounded-lg border"
      >
        <h1 className="text-3xl font-bold text-center text-blue-700">
          {editingBooking ? "แก้ไข Booking" : "เพิ่ม Booking"}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700">รหัส Booking</label>
            <input
              ref={firstInputRef}
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-300"
              placeholder="รหัส Booking (เช่น S123)"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">ทีม</label>
            <input
              type="text"
              name="team"
              value={formData.team}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-green-300"
              placeholder="ชื่อทีม (เช่น ทีมขายปลา)"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">ชื่อลูกค้า</label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-purple-300"
              placeholder="เช่น A Seafood Restaurant"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">กลุ่มลูกค้า</label>
            <select
              name="customerGroup"
              value={formData.customerGroup}
              onChange={handleNativeSelectChange}
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-purple-300"
            >
              <option value="" disabled>
                -- เลือกกลุ่มลูกค้า --
              </option>
              {customerGroupOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">ขนาดปลา</label>
            <select
              name="fishSize"
              value={formData.fishSize}
              onChange={handleNativeSelectChange}
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-300"
            >
              <option value="" disabled>
                -- เลือกขนาดปลา --
              </option>
              {fishSizeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">ชนิดปลา</label>
            <select
              name="fishType"
              value={formData.fishType}
              onChange={handleNativeSelectChange}
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-300"
            >
              <option value="" disabled>
                -- เลือกชนิดปลา --
              </option>
              {fishTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">ราคา (บาท)</label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-pink-300"
              placeholder="ระบุราคา (เช่น 1500)"
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800">จำนวนปลาแต่ละวัน</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-4">
              {Object.entries(formData.dailyQuantities).map(([day, qty]) => (
                <div key={day} className="p-3 bg-gray-50 rounded shadow-sm border">
                  <label className="text-sm font-medium">{day}</label>
                  <input
                    type="text"
                    name={`day-${day}`}
                    value={qty}
                    onChange={handleNumericInputChange(setDailyQuantity)}
                    className="w-full mt-2 p-2 border rounded focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              ))}
            </div>
          </div>


        <div className="flex space-x-4">
          <Button type="submit" className="w-full">
            {editingBooking ? "อัปเดต Booking" : "บันทึก Booking"}
          </Button>
          {editingBooking && (
            <Button
              type="button"
              onClick={clearEditingBooking}
              variant="secondary"
              className="w-full"
            >
              ยกเลิก
            </Button>
          )}
        </div>
      </form>
    </>
  );
}

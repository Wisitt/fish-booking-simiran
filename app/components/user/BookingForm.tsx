// app/components/BookingForm.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getMondayWeekAndYear, getWeekDays } from "../../lib/weekUtils";
import { Button } from "@/components/ui/button";
import { handleNumericInputChange } from "../../lib/inputUtils";
import CreatableSelect from "react-select/creatable";

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
    return allDays.slice(0, 6);
  }, []);
  const [teams, setTeams] = useState<SelectOption[]>([]);
  const [customerNames, setCustomerNames] = useState<SelectOption[]>([]);
  const [newTeam, setNewTeam] = useState<string | null>(null);
  const [newCustomerName, setNewCustomerName] = useState<string | null>(null);

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
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetch(`/api/bookings/getUserCode?userId=${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData((prev) => ({
            ...prev,
            code: data.code,
          }));
        })
        .catch((err) => console.error("Error fetching user code:", err));
    }
  }, [editingBooking]);
  
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch("/api/common/teams");
        if (!res.ok) throw new Error("Failed to fetch teams");
        const data = await res.json();
        setTeams(data.map((team: any) => ({ value: team.name, label: team.name })));
      } catch (error) {
        console.error("Error loading teams:", error);
        toast.error("Error loading teams.");
      }
    };
  
    const fetchCustomerNames = async () => {
      try {
        const res = await fetch("/api/common/customers");
        if (!res.ok) throw new Error("Failed to fetch customer names");
        const data = await res.json();
        setCustomerNames(
          data.map((group: any) => ({ value: group.name, label: group.name }))
        );        
      } catch (error) {
        console.error("Error loading customer names:", error);
        toast.error("Error loading customer Names.");
      }
    };
  
    fetchTeams();
    fetchCustomerNames();
  }, []);
  


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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const confirmSubmit = window.confirm(
      editingBooking
        ? "คุณต้องการแก้ไข Booking นี้หรือไม่?"
        : "คุณต้องการสร้าง Booking ใหม่หรือไม่?"
    );

    if (!confirmSubmit) {
      toast.info("การดำเนินการถูกยกเลิก");
      return;
    }
    

    const { year, weekNumber } = getMondayWeekAndYear(new Date());
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error("User not logged in.");
      return;
    }

    try {
      // Save new team if provided
      if (newTeam) {
        const res = await fetch("/api/common/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newTeam }),
        });
        const savedTeam = await res.json();
        setTeams((prev) => [...prev, { value: savedTeam.name, label: savedTeam.name }]);
        setFormData((prev) => ({ ...prev, team: savedTeam.name }));
        setNewTeam(null);
      }

      // Save new customer group if provided
      if (newCustomerName) {
        const res = await fetch("/api/common/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newCustomerName }),
        });
        const savedGroup = await res.json();
        setCustomerNames((prev) => [
          ...prev,
          { value: savedGroup.name, label: savedGroup.name },
        ]);
        setFormData((prev) => ({ ...prev, customerGroup: savedGroup.name }));
        setNewCustomerName(null);
      }

      const body = {
        ...formData,
        userId: Number(userId),
        year,
        weekNumber,
      };

      const method = editingBooking ? "PUT" : "POST";
      const url = editingBooking
        ? `/api/bookings/${editingBooking.id}`
        : "/api/bookings";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to submit booking");

      const data = await response.json();
      toast.success(
        editingBooking
          ? "Booking updated successfully!"
          : "Booking created successfully!"
      );

      if (editingBooking) {
        setBookings((prev) =>
          prev.map((b) => (b.id === data.id ? data : b))
        );
      } else {
        setBookings((prev) => [...prev, data]);
      }

      clearEditingBooking?.();
    } catch (error) {
      toast.error("Error submitting booking.");
    }
  };
  
  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto space-y-8 p-8 bg-white shadow-lg rounded-lg border border-gray-900"
      >
        <h1 className={`text-3xl font-bold text-center ${
          editingBooking ? 'text-yellow-600' : 'text-black-700'
        }`}>
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
              readOnly
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-300 bg-gray-100"
              placeholder="รหัส Booking (เช่น S123)"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">ทีม</label>
            <CreatableSelect
              options={teams}
              onChange={(selected) =>
                setFormData((prev) => ({
                  ...prev,
                  team: selected ? selected.value : "",
                }))
              }
              onCreateOption={(inputValue: string) => {
                const newOption = { value: inputValue, label: inputValue };
                setTeams((prev) => [...prev, newOption]); // Add the new option to the list
                setFormData((prev) => ({ ...prev, team: inputValue })); // Update form data with the new team
              }}
              value={teams.find((opt) => opt.value === formData.team)}
              placeholder="เลือกหรือเพิ่มทีม"
              isClearable
              isSearchable
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">ชื่อลูกค้า</label>
            <CreatableSelect
              options={customerNames}
              onChange={(selected) =>
                setFormData((prev) => ({
                  ...prev,
                  customerName: selected ? selected.value : "",
                }))
              }
              onCreateOption={(inputValue: string) => {
                const newOption = { value: inputValue, label: inputValue };
                setCustomerNames((prev) => [...prev, newOption]); // Add the new option to the list
                setFormData((prev) => ({ ...prev, customerName: inputValue })); // Update form data with the new value
              }}
              value={customerNames.find((opt) => opt.value === formData.customerName)}
              placeholder="เลือกหรือเพิ่มกลุ่มลูกค้า"
              isClearable
              isSearchable
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
                    onChange={(e) => handleNumericInputChange(e, setFormData)}
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

// app/(user)/bookings/components/BookingForm.tsx
"use client";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getMondayWeekAndYear, getNextWeekDays, getWeekDays } from "../../../lib/weekUtils";
import { Button } from "@/components/ui/button";
import { handleNumericInputChange } from "../../../lib/inputUtils";
import dynamic from "next/dynamic";
import { SharedDialog } from "@/app/components/shared/dialog"; // <-- import SharedDialog

const CreatableSelectNoSSR = dynamic(
  () => import("../../../../components/ui/CreatableSelectNoSSR"),
  { ssr: false }
);

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
  status: string;
}


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
    const allDays = getNextWeekDays();
    return allDays.slice(0, 6);
  }, []);

  const [teams, setTeams] = useState<SelectOption[]>([]);
  const [customerNames, setCustomerNames] = useState<SelectOption[]>([]);
  const [formData, setFormData] = useState<Omit<Booking, "id">>({
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
    status: "รออนุมัติ",
  });

  // ---------- DIALOG STATES ----------
  const [confirmBookingDialogOpen, setConfirmBookingDialogOpen] = useState(false);
  const [confirmNewTeamDialogOpen, setConfirmNewTeamDialogOpen] = useState(false);
  const [confirmNewCustomerDialogOpen, setConfirmNewCustomerDialogOpen] = useState(false);

  // ค่า input ที่ผู้ใช้กำลังจะสร้าง (สำหรับ team/customer)
  const [pendingNewTeam, setPendingNewTeam] = useState<string>("");
  const [pendingNewCustomer, setPendingNewCustomer] = useState<string>("");
  // ------------------------------------

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
    const fetchUserDetails = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const res = await fetch(`/api/common/customers?userId=${userId}`);
        if (!res.ok) throw new Error("Error fetching user details");
  
        const data = await res.json();
  
        // Set filtered Customers and Team
        setTeams([{ value: data.team, label: data.team }]);
        setCustomerNames(
          data.customers.map((customer: any) => ({
            value: customer.name,
            label: customer.name,
          }))
        );
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchUserDetails();
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
        status: "รออนุมัติ",
      });
    }
    firstInputRef.current?.focus();
  }, [editingBooking, firstInputRef, weekDays]);

  // ==========================
  // FORM INPUT HANDLERS
  // ==========================
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

  // ==========================
  // SUBMIT BOOKING => เปิด Dialog แทน
  // ==========================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // แทน window.confirm(...) => เปิด Dialog
    setConfirmBookingDialogOpen(true);
  };

  // === ฟังก์ชันที่เรียกจริงเมื่อตอบ Confirm จาก Dialog ===
  const actuallySubmitBooking = async () => {
    setConfirmBookingDialogOpen(false);
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error("User not logged in.");
      return;
    }

    try { 
      const { year, weekNumber } = getMondayWeekAndYear(new Date());
      const body = {
        ...formData,
        userId: Number(userId),
        year,
        weekNumber,
        status: formData.customerGroup === "กลุ่ม 2 : ต่อราคา" ? "รออนุมัติ" : "อนุมัติแล้ว",
        isApproved: formData.customerGroup === "กลุ่ม 2 : ต่อราคา" ? false : true,
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
        setBookings((prev) => prev.map((b) => (b.id === data.id ? data : b)));
      } else {
        setBookings((prev) => [...prev, data]);
      }
      clearEditingBooking?.();
    } catch (error) {
      console.error(error);
      toast.error("Error submitting booking.");
    }
  };

  // ==========================
  // CREATE TEAM => เปิด Dialog แทน
  // ==========================
  const handleCreateTeam = (inputValue: string) => {
    setPendingNewTeam(inputValue);
    setConfirmNewTeamDialogOpen(true);
  };

  // ฟังก์ชันเรียก POST จริงเมื่อ user Confirm ใน dialog
  const actuallyCreateTeam = async () => {
    setConfirmNewTeamDialogOpen(false); // ปิด dialog
    const inputValue = pendingNewTeam;
    try {
      const res = await fetch("/api/common/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: inputValue }),
      });
      if (!res.ok) throw new Error("Failed to create new team");
      const newTeam = await res.json(); // { id, name }
      setTeams((prev) => [...prev, { value: newTeam.name, label: newTeam.name }]);
      setFormData((prev) => ({ ...prev, team: newTeam.name }));
      toast.success(`สร้างทีมใหม่ "${inputValue}" เรียบร้อย!`);
    } catch (error) {
      console.error(error);
      toast.error("ไม่สามารถสร้างทีมใหม่ได้");
    } finally {
      setPendingNewTeam(""); // เคลียร์ค่า
    }
  };

  // ==========================
  // CREATE CUSTOMER => เปิด Dialog แทน
  // ==========================
  const handleCreateCustomer = async (inputValue: string) => {
    setPendingNewCustomer(inputValue);
    setConfirmNewCustomerDialogOpen(true);
  };

  // ฟังก์ชันเรียก POST จริงเมื่อ user Confirm
  const actuallyCreateCustomer = async () => {
    setConfirmNewCustomerDialogOpen(false);
    const inputValue = pendingNewCustomer;
  
    try {
      const userId = localStorage.getItem("userId"); // รับ userId จาก localStorage
      if (!userId) {
        toast.error("User not logged in.");
        return;
      }
  
      const res = await fetch("/api/common/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: inputValue, userId: userId }), // ส่ง userId ไปด้วย
      });
  
      if (!res.ok) throw new Error("Failed to create new customer in DB");
  
      const newCustomer = await res.json(); // { id, name }
      const newOption: SelectOption = { value: newCustomer.name, label: newCustomer.name };
  
      // อัปเดตสถานะการเลือกลูกค้าในฟอร์ม
      setCustomerNames((prev) => [...prev, newOption]);
      setFormData((prev) => ({ ...prev, customerName: newCustomer.name }));
      toast.success(`สร้างลูกค้าใหม่ "${inputValue}" เรียบร้อย!`);
    } catch (error) {
      console.error(error);
      toast.error("ไม่สามารถสร้างชื่อลูกค้าใหม่ได้");
    } finally {
      setPendingNewCustomer(""); // เคลียร์ค่า
    }
  };

  // ==========================
  // RENDER
  // ==========================
  return (
    <>
      {/* 
        1) Dialog Confirm Submit Booking 
      */}
      <SharedDialog
        open={confirmBookingDialogOpen}
        onOpenChange={setConfirmBookingDialogOpen}
        title={editingBooking ? "ยืนยันแก้ไข Booking" : "ยืนยันสร้าง Booking"}
        description={
          editingBooking
            ? "คุณต้องการแก้ไข Booking นี้ใช่หรือไม่?"
            : "คุณต้องการสร้าง Booking ใหม่ใช่หรือไม่?"
        }
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={actuallySubmitBooking}
        isEdit={!editingBooking ? false : true}
      />

      {/* 
        2) Dialog Confirm Create Team 
      */}
      <SharedDialog
        open={confirmNewTeamDialogOpen}
        onOpenChange={setConfirmNewTeamDialogOpen}
        title="ยืนยันเพิ่มทีมใหม่"
        description={`ต้องการเพิ่มทีมชื่อ "${pendingNewTeam}" ใช่หรือไม่?`}
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={actuallyCreateTeam}
      />

      {/* 
        3) Dialog Confirm Create Customer 
      */}
      <SharedDialog
        open={confirmNewCustomerDialogOpen}
        onOpenChange={setConfirmNewCustomerDialogOpen}
        title="ยืนยันเพิ่มลูกค้าใหม่"
        description={`ต้องการเพิ่มลูกค้าชื่อ "${pendingNewCustomer}" ใช่หรือไม่?`}
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={actuallyCreateCustomer}
      />

      <form
        onSubmit={handleSubmit} // ไม่ทำงานจริงในนี้ แต่ไปเปิด Dialog
        className="max-w-4xl mx-auto space-y-8 p-8 bg-white shadow-lg rounded-lg border border-gray-900"
      >
        <h1
          className={`text-3xl font-bold text-center ${
            editingBooking ? "text-yellow-600" : "text-black-700"
          }`}
        >
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

          {/* เลือก/สร้าง Team */}
          <div>
            <label className="text-sm font-medium text-gray-700">ทีม</label>
            <CreatableSelectNoSSR
              id="team-select"
              instanceId="team-select"
              options={teams}
              onChange={(selected) =>
                setFormData((prev) => ({
                  ...prev,
                  team: selected ? selected.value : "",
                }))
              }
              onCreateOption={handleCreateTeam} // <-- เปิด Dialog แทน
              value={teams.find((opt) => opt.value === formData.team)}
              placeholder="เลือกหรือเพิ่มทีม"
              isClearable
              isSearchable
            />
          </div>

          {/* เลือก/สร้าง ลูกค้า */}
          <div>
            <label className="text-sm font-medium text-gray-700">ชื่อลูกค้า</label>
            <CreatableSelectNoSSR
              id="customerName-select"
              instanceId="customerName-select"
              options={customerNames}
              onChange={(selected) =>
                setFormData((prev) => ({
                  ...prev,
                  customerName: selected ? selected.value : "",
                }))
              }
              onCreateOption={handleCreateCustomer} // <-- เปิด Dialog แทน
              value={customerNames.find((opt) => opt.value === formData.customerName)}
              placeholder="เลือกหรือเพิ่มชื่อลูกค้า"
              isClearable
              isSearchable
            />
          </div>

          {/* กลุ่มลูกค้า */}
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

          {/* ขนาดปลา */}
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

          {/* ชนิดปลา */}
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

          {/* ราคา */}
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

        {/* จำนวนปลาแต่ละวัน */}
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
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dailyQuantities: {
                        ...prev.dailyQuantities,
                        [day]: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full mt-2 p-2 border rounded focus:ring-2 focus:ring-blue-200"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ปุ่มบันทึก / ยกเลิก */}
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

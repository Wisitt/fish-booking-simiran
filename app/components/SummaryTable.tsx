"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaDownload, FaTable } from "react-icons/fa";

interface Booking {
  code: string;
  customerName: string;
  team: string;
  fishSize: string;
  totalQuantity: number;
  weekNumber: number;
  dailyQuantities: Record<string, number> | null;
  createdAt: string;
  weekStartDate?: string | null;
  weekEndDate?: string | null;
}

const SummaryTable = () => {
  const [summary, setSummary] = useState<Booking[]>([]);
  const [mode, setMode] = useState<"all" | "select">("all");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const userId = localStorage.getItem("userId");

        if (!userId) {
          throw new Error("User ID is not set in localStorage");
        }

        const response = await fetch("/api/summary", {
          headers: {
            userId: userId,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch summary");
        }

        const data: Booking[] = await response.json();

        const updatedData = data.map((booking) => {
          const { start, end } = getWeekStartAndEndDates(
            booking.weekNumber,
            new Date(booking.createdAt).getFullYear()
          );
          return {
            ...booking,
            weekStartDate: start,
            weekEndDate: end,
          };
        });

        setSummary(updatedData);
      } catch (error) {
        console.error("Error fetching summary:", error);
      }
    };

    fetchSummary();
  }, []);

  useEffect(() => {
    if (mode === "select" && selectedDate) {
      const weekNumber = calculateISOWeekNumber(selectedDate);
      setSelectedWeek(weekNumber);
    } else {
      setSelectedWeek(null);
    }
  }, [mode, selectedDate]);

  const calculateISOWeekNumber = (date: Date): number => {
    const tempDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    tempDate.setUTCDate(tempDate.getUTCDate() + 4 - (tempDate.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
    return Math.ceil((((tempDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const getWeekStartAndEndDates = (weekNumber: number, year: number) => {
    const startDate = new Date(Date.UTC(year, 0, 1 + (weekNumber - 1) * 7));
    const dayOffset = startDate.getUTCDay() === 0 ? -6 : 1 - startDate.getUTCDay();
    startDate.setUTCDate(startDate.getUTCDate() + dayOffset);

    const endDate = new Date(startDate);
    endDate.setUTCDate(startDate.getUTCDate() + 5);

    const formatToDDMMYYYY = (date: Date) => {
      const day = String(date.getUTCDate()).padStart(2, "0");
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const year = date.getUTCFullYear();
      return `${day}/${month}/${year}`;
    };

    return {
      start: formatToDDMMYYYY(startDate),
      end: formatToDDMMYYYY(endDate),
    };
  };

  const groupedByWeek = summary.reduce((acc: Record<number, Booking[]>, item) => {
    if (!acc[item.weekNumber]) {
      acc[item.weekNumber] = [];
    }
    acc[item.weekNumber].push(item);
    return acc;
  }, {});

  const displayData =
    mode === "all"
      ? groupedByWeek
      : selectedWeek
      ? { [selectedWeek]: summary.filter((item) => item.weekNumber === selectedWeek) }
      : {};

  const downloadExcel = async (weekNumber: number) => {
    try {
      const response = await fetch(`/api/export/excel?weekNumber=${weekNumber}`);
      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Fish_Booking_Report_Week${weekNumber}.xlsx`);
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
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl md:text-3xl font-bold text-black flex items-center space-x-2">
          <FaTable className="text-blue-600" />
          <span>Summary Table</span>
        </h1>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <label className="text-black font-medium">Mode:</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="all"
                checked={mode === "all"}
                onChange={() => setMode("all")}
                className="form-radio text-blue-600"
              />
              <span className="text-black">All Weeks</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="select"
                checked={mode === "select"}
                onChange={() => setMode("select")}
                className="form-radio text-blue-600"
              />
              <span className="text-black">Select Week via Date</span>
            </label>
          </div>
        </div>

        {mode === "select" && (
          <div className="flex items-center space-x-4">
            <label className="text-black font-medium">Select Date:</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => setSelectedDate(date)}
              dateFormat="yyyy-MM-dd"
              placeholderText="Choose a date"
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      <div className="space-y-8">
        {Object.keys(displayData).map((week) => {
          const weekNumber = Number(week);
          const bookings = displayData[weekNumber];

          const dayList = Array.from(
            new Set(bookings.flatMap((item) => Object.keys(item.dailyQuantities || {})))
          ).sort();

          return (
            <div key={weekNumber} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
                <h2 className="text-lg md:text-xl font-bold text-black">
                  Week {weekNumber} ({bookings[0]?.weekStartDate || "N/A"} - {bookings[0]?.weekEndDate || "N/A"})
                </h2>
                <button
                  onClick={() => downloadExcel(weekNumber)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center space-x-2 hover:bg-green-700 transition"
                >
                  <FaDownload />
                  <span>Export Week {weekNumber}</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 border text-black">Code</th>
                      <th className="px-4 py-2 border text-black">Customer Name</th>
                      <th className="px-4 py-2 border hidden md:table-cell text-black">Team</th>
                      <th className="px-4 py-2 border hidden md:table-cell text-black">Fish Size</th>
                      {dayList.map((day) => (
                        <th key={day} className="px-4 py-2 border hidden lg:table-cell text-black">{day}</th>
                      ))}
                      <th className="px-4 py-2 border text-black">Total</th>
                      <th className="px-4 py-2 border hidden sm:table-cell text-black">Week #</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border text-black">{booking.code}</td>
                        <td className="px-4 py-2 border text-black">{booking.customerName}</td>
                        <td className="px-4 py-2 border hidden md:table-cell text-black">{booking.team}</td>
                        <td className="px-4 py-2 border hidden md:table-cell text-black">{booking.fishSize}</td>
                        {dayList.map((day) => (
                          <td key={day} className="px-4 py-2 border hidden lg:table-cell text-black">
                            {booking.dailyQuantities?.[day] || 0}
                          </td>
                        ))}
                        <td className="px-4 py-2 border text-black">{booking.totalQuantity}</td>
                        <td className="px-4 py-2 border hidden sm:table-cell text-black">{booking.weekNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SummaryTable;

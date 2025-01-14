// app/components/SummaryTable.tsx 

"use client";

import { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { FaDownload, FaFilter, FaTable } from "react-icons/fa";

interface Week {
  weekNumber: number;
  year: number;
}

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
  const [years, setYears] = useState<number[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [mode, setMode] = useState<"all" | "select">("all");

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await fetch("/api/summary/years");
        if (!response.ok) throw new Error("Failed to fetch years");
        setYears(await response.json());
      } catch (error) {
        console.error("Error fetching years:", error);
      }
    };
    fetchYears();
  }, []);

  useEffect(() => {
    if (!selectedYear) {
      setWeeks([]);
      return;
    }
    const fetchWeeks = async () => {
      try {
        const response = await fetch(`/api/summary/weeks?year=${selectedYear}`);
        if (!response.ok) throw new Error("Failed to fetch weeks");
        setWeeks(await response.json());
      } catch (error) {
        console.error("Error fetching weeks:", error);
      }
    };
    fetchWeeks();
  }, [selectedYear]);

  useEffect(() => {
    if (selectedWeek) {
      fetchSummary(selectedWeek.weekNumber, selectedWeek.year);
    }
  }, [selectedWeek]);

  const fetchSummary = async (year?: number, weekNumber?: number) => {
    const queryParams = new URLSearchParams();
    if (year) queryParams.append("year", year.toString());
    if (weekNumber) queryParams.append("weekNumber", weekNumber.toString());

    try {
      const response = await fetch(`/api/summary?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch summary");
      setSummary(await response.json());
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  useEffect(() => {
    if (selectedWeek) {
      fetchSummary(selectedWeek.year, selectedWeek.weekNumber);
    } else if (selectedYear) {
      fetchSummary(selectedYear);
    } else {
      fetchSummary();
    }
  }, [selectedWeek, selectedYear]);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = Number(e.target.value);
    setSelectedYear(year || null);
    setSelectedWeek(null); // Reset selected week when year changes
  };

  const handleWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [weekNumber, year] = e.target.value.split("-").map(Number);
    setSelectedWeek(weekNumber && year ? { weekNumber, year } : null);
  };


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
      ? { [selectedWeek.weekNumber]: summary.filter((item) => item.weekNumber === selectedWeek.weekNumber) }
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


  const getDynamicDateRange = (bookings: Booking[]) => {
    // Extract all days with data from the bookings
    const allDays = bookings.flatMap((booking) => 
      Object.keys(booking.dailyQuantities || {})
    );
  
    if (allDays.length === 0) return "N/A - N/A";
  
    // Sort dates to find the start and end
    const sortedDays = allDays.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
    // Return the formatted range
    const formatDate = (date: string) => {
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    };
  
    return `${formatDate(sortedDays[0])} - ${formatDate(sortedDays[sortedDays.length - 1])}`;
  };

  

  return (
<div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FaTable className="text-blue-600" />
              <span>Booking Summary</span>
            </h1>
          </header>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={selectedYear || ""}
                onChange={handleYearChange}
                className="form-select w-full rounded-md border-gray-300 focus:ring-blue-500"
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {selectedYear && (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Week</label>
                <select
                  onChange={handleWeekChange}
                  value={selectedWeek ? `${selectedWeek.weekNumber}-${selectedWeek.year}` : ""}
                  className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">All Week</option>
                  {weeks.map(({ weekNumber, year }) => (
                    <option key={`${weekNumber}-${year}`} value={`${weekNumber}-${year}`}>
                      Week {weekNumber}, {year}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="space-y-6">
        {Object.keys(displayData).map((week) => {
              const weekNumber = Number(week);
              const bookings = displayData[weekNumber];

              const dayList = Array.from(
                new Set(bookings.flatMap((item) => Object.keys(item.dailyQuantities || {})))
              ).sort();
                  return (
            
                <div key={week} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6 border-b">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Week {week} ({getDynamicDateRange(bookings)})
                      </h2>
                      <button
                        onClick={() => downloadExcel(Number(week))}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                      >
                        <FaDownload className="mr-2" />
                        <span>Export Excel</span>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="sticky left-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                          {dayList.map((day) => (
                            <th key={day} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{day}</th>
                          ))}
                          <th className="sticky right-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.map((booking, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="sticky left-0 bg-white px-6 py-4 text-sm font-medium text-gray-900">{booking.code}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{booking.customerName}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{booking.team}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{booking.fishSize}</td>
                            {dayList.map((day) => (
                              <td key={day} className="px-6 py-4 text-sm text-gray-500">
                                {booking.dailyQuantities?.[day] || 0}
                              </td>
                            ))}
                            <td className="sticky right-0 bg-white px-6 py-4 text-sm font-medium text-gray-900">
                              {booking.totalQuantity}
                            </td>
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
    </div>
  );
};

export default SummaryTable;



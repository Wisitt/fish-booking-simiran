// app/admin/dashboard/components/YearMonthWeekSelector.tsx
"use client";

import React, { useMemo } from 'react';

interface WeeklyProfitData {
  year: number;
  month: number;
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  totalQuantity: number;
  totalProfitOrLoss: number;
}

interface YearMonthWeekSelectorProps {
  ProfitanalysisData: WeeklyProfitData[];
  costsPerWeek: Record<number, number>;
  setCostsPerWeek: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  fetchData: () => void;
}

const YearMonthWeekSelector: React.FC<YearMonthWeekSelectorProps> = ({ ProfitanalysisData, costsPerWeek, setCostsPerWeek, fetchData }) => {
  const [selectedYear, setSelectedYear] = React.useState<number | "">("");
  const [selectedMonth, setSelectedMonth] = React.useState<number | "">("");
  const [selectedWeek, setSelectedWeek] = React.useState<number | "">("");

  const handleWeekCostChange = (weekNumber: number, value: string) => {
    const costVal = Number(value);
    setCostsPerWeek((prev) => ({ ...prev, [weekNumber]: costVal }));
  };

  const handleSaveCosts = () => {
    localStorage.setItem("costsPerWeek", JSON.stringify(costsPerWeek));
    fetchData();
  };

  // รายการปีทั้งหมด
  const allYears = useMemo(() => {
    return Array.from(new Set(ProfitanalysisData.map(w => w.year))).sort((a, b) => a - b);
  }, [ProfitanalysisData]);

  // กรองตามปี (ถ้าไม่เลือกปีจะแสดงทั้งหมด)
  const yearFiltered = useMemo(() => {
    if (selectedYear !== "") {
      return ProfitanalysisData.filter(w => w.year === Number(selectedYear));
    }
    return ProfitanalysisData;
  }, [ProfitanalysisData, selectedYear]);

  // รายการเดือนในปีที่เลือก
  const allMonthsInYear = useMemo(() => {
    return Array.from(new Set(yearFiltered.map(w => w.month))).sort((a, b) => a - b);
  }, [yearFiltered]);

  // กรองตามเดือน (ถ้าไม่เลือกเดือนแสดงทั้งปี)
  const monthFiltered = useMemo(() => {
    if (selectedMonth !== "") {
      return yearFiltered.filter(w => w.month === Number(selectedMonth));
    }
    return yearFiltered;
  }, [yearFiltered, selectedMonth]);

  // รายการอาทิตย์ในเดือนที่เลือก
  const allWeeksInMonth = useMemo(() => {
    return Array.from(new Set(monthFiltered.map(w => w.weekNumber))).sort((a, b) => a - b);
  }, [monthFiltered]);

  // กรองตามสัปดาห์ (ถ้าไม่เลือกสัปดาห์แสดงทั้งเดือน)
  const filteredData = useMemo(() => {
    if (selectedWeek !== "") {
      return monthFiltered.filter(w => w.weekNumber === Number(selectedWeek));
    }
    return monthFiltered;
  }, [monthFiltered, selectedWeek]);

  const totalProfitOrLoss = filteredData.reduce((sum, w) => sum + w.totalProfitOrLoss, 0);

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center mb-6 space-y-4 md:space-y-0 md:space-x-6">
        {/* เลือก Year */}
        <div className="flex flex-col w-full md:w-1/3">
          <label className="mb-2 text-sm font-medium text-gray-700">Select Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value as number | "");
              setSelectedMonth("");
              setSelectedWeek("");
            }}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- All Years --</option>
            {allYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* เลือก Month */}
        <div className="flex flex-col w-full md:w-1/3">
          <label className="mb-2 text-sm font-medium text-gray-700">Select Month:</label>
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value as number | "");
              setSelectedWeek("");
            }}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={selectedYear === "" || allMonthsInYear.length === 0}
          >
            <option value="">-- All Months --</option>
            {allMonthsInYear.map(m => (
              <option key={m} value={m}>Month {m}</option>
            ))}
          </select>
        </div>

        {/* เลือก Week */}
        <div className="flex flex-col w-full md:w-1/3">
          <label className="mb-2 text-sm font-medium text-gray-700">Select Week:</label>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value as number | "")}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={selectedYear === "" || selectedMonth === "" || allWeeksInMonth.length === 0}
          >
            <option value="">-- All Weeks --</option>
            {allWeeksInMonth.map(w => (
              <option key={w} value={w}>Week {w}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ปุ่ม Save Costs & Refresh */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleSaveCosts}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Save Costs & Refresh
        </button>
      </div>

      {/* ตาราง Profit/Loss */}
      <div className="overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          {selectedYear !== "" && `Year ${selectedYear}`}
          {selectedMonth !== "" && `, Month ${selectedMonth}`}
          {selectedWeek !== "" && `, Week ${selectedWeek}`}
        </h3>
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 border text-left">Year</th>
              <th className="py-3 px-4 border text-left">Month</th>
              <th className="py-3 px-4 border text-left">Week #</th>
              <th className="py-3 px-4 border text-left">Start Date</th>
              <th className="py-3 px-4 border text-left">End Date</th>
              <th className="py-3 px-4 border text-right">Total Qty</th>
              <th className="py-3 px-4 border text-right">Profit/Loss (THB)</th>
              <th className="py-3 px-4 border text-right">Cost/Unit (THB)</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((weekData, index) => (
                <tr key={index} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 border text-center">{weekData.year}</td>
                  <td className="py-3 px-4 border text-center">{weekData.month}</td>
                  <td className="py-3 px-4 border text-center">{weekData.weekNumber}</td>
                  <td className="py-3 px-4 border">{weekData.weekStart}</td>
                  <td className="py-3 px-4 border">{weekData.weekEnd}</td>
                  <td className="py-3 px-4 border text-right">{weekData.totalQuantity}</td>
                  <td className={`py-3 px-4 border text-right font-bold ${weekData.totalProfitOrLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {weekData.totalProfitOrLoss >= 0 ? `+${weekData.totalProfitOrLoss}` : weekData.totalProfitOrLoss}
                  </td>
                  <td className="py-3 px-4 border text-right">
                    <input
                      type="number"
                      className="p-1 border border-gray-300 rounded-md w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Cost"
                      value={costsPerWeek[weekData.weekNumber] || ""}
                      onChange={(e) => handleWeekCostChange(weekData.weekNumber, e.target.value)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center text-gray-500 py-4">
                  No data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {filteredData.length > 0 && (
          <div className="mt-4 text-lg font-semibold text-gray-700 text-right">
            Total Profit/Loss:{" "}
            <span className={totalProfitOrLoss >= 0 ? "text-green-600" : "text-red-600"}>
              {totalProfitOrLoss >= 0 ? `+${totalProfitOrLoss}` : totalProfitOrLoss} THB
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default YearMonthWeekSelector;

"use client";

import { useState, useEffect } from "react";

interface Summary {
  code:string;
  customerName: string;
  team: string;
  fishSize: string;
  totalQuantity: number;
}

const SummaryTable = () => {
  const [summary, setSummary] = useState<Summary[]>([]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch("/api/summary");
        if (!response.ok) throw new Error("Failed to fetch summary");

        const data: Summary[] = await response.json();
        setSummary(data);
      } catch (error) {
        console.error("Error fetching summary:", error);
      }
    };

    fetchSummary();
  }, []);

  const downloadExcel = async () => {
    try {
      const response = await fetch("/api/export/excel");
      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Fish_Booking_Report.xlsx");
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
      <h2 className="text-2xl font-semibold mb-4 text-blue-600">All Bookings</h2>
      
      {/* Flex container for the table header and the button */}
      <div className="flex justify-between items-center mb-4">
        <div></div> {/* This is a spacer */}
        <button
          onClick={downloadExcel}
          className="bg-green-500 text-white px-6 py-3 rounded-lg flex items-center hover:bg-green-600 transition duration-300"
        >
          {/* Excel Logo Image */}
          <img src="/excel.png" alt="Excel Logo" className="w-6 h-6 mr-2" />
          Export to Excel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto bg-white border-collapse shadow-md rounded-lg">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-left text-gray-600 border-b">Code</th>
              <th className="px-6 py-3 text-sm font-medium text-left text-gray-600 border-b">Customer Name</th>
              <th className="px-6 py-3 text-sm font-medium text-left text-gray-600 border-b">Team</th>
              <th className="px-6 py-3 text-sm font-medium text-left text-gray-600 border-b">Fish Size</th>
              <th className="px-6 py-3 text-sm font-medium text-left text-gray-600 border-b">Total Quantity</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800 border-b">{item.code}</td>
                <td className="px-6 py-4 text-sm text-gray-800 border-b">{item.customerName}</td>
                <td className="px-6 py-4 text-sm text-gray-800 border-b">{item.team}</td>
                <td className="px-6 py-4 text-sm text-gray-800 border-b">{item.fishSize}</td>
                <td className="px-6 py-4 text-sm text-gray-800 border-b">{item.totalQuantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SummaryTable;

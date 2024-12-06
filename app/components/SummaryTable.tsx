"use client";

import { useState, useEffect } from "react";

interface Summary {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Customer Summary</h2>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">Customer Name</th>
            <th className="border border-gray-300 px-4 py-2">Team</th>
            <th className="border border-gray-300 px-4 py-2">Fish Size</th>
            <th className="border border-gray-300 px-4 py-2">Total Quantity</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((item, index) => (
            <tr key={index} className="text-center">
              <td className="border border-gray-300 px-4 py-2">{item.customerName}</td>
              <td className="border border-gray-300 px-4 py-2">{item.team}</td>
              <td className="border border-gray-300 px-4 py-2">{item.fishSize}</td>
              <td className="border border-gray-300 px-4 py-2">{item.totalQuantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SummaryTable;

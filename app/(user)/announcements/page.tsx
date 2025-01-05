// app/components/UserAnnouncements.tsx
"use client";

import { useState, useEffect } from "react";

interface Announcement {
  id: number;
  title: string;
  content: string;
  weekNumber: number;
  year: number;
  createdAt: string;
  startDate: string;
  endDate: string;
  prices: {
    fishType: string;
    size: string;
    price: number;
  }[];
}

const UserAnnouncements = () => {


  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
  const [priceHistory, setPriceHistory] = useState<Announcement[]>([]);
  const [filterWeek, setFilterWeek] = useState<number | null>(null);
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());

  const fetchCurrentAnnouncement = async () => {
    try {
      const response = await fetch("/api/announcements/current");
      if (!response.ok) throw new Error("Failed to fetch current announcement");
      const data = await response.json();
      setCurrentAnnouncement(data);
    } catch (error) {
      console.error("Error fetching current announcement:", error);
    }
  };

  const fetchPriceHistory = async () => {
    try {
      const response = await fetch("/api/announcements/history");
      if (!response.ok) throw new Error("Failed to fetch price history");
      const data = await response.json();
      setPriceHistory(data);
    } catch (error) {
      console.error("Error fetching price history:", error);
    }
  };

  useEffect(() => {
    fetchCurrentAnnouncement();
  }, []);

  const filteredHistory = priceHistory.filter((announcement) => {
    return (
      (filterWeek === null || announcement.weekNumber === filterWeek) &&
      announcement.year === filterYear
    );
  });

  const uniqueYears = Array.from(
    new Set(priceHistory.map((announcement) => announcement.year))
  ).sort((a, b) => b - a);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Current Week Prices */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Current Fish Prices</h1>
        {currentAnnouncement ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {currentAnnouncement.title}
              </h2>
              <p className="text-gray-600">
                Valid: {currentAnnouncement.startDate} - {currentAnnouncement.endDate}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-4">{currentAnnouncement.content}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentAnnouncement.prices.map((price, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg shadow border border-gray-100"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">{price.fishType}</p>
                        <p className="text-sm text-gray-600">Size: {price.size}</p>
                      </div>
                      <p className="text-lg font-bold text-blue-600">
                        ฿{price.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">No current price announcement available.</p>
        )}
      </div>

      {/* Price History Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Price History</h2>
          <button
            onClick={fetchPriceHistory}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Price History
          </button>
        </div>

        {priceHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-wrap gap-4 mb-6">
              <select
                value={filterWeek ?? ""}
                onChange={(e) => setFilterWeek(e.target.value === "" ? null : Number(e.target.value))}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Weeks</option>
                {Array.from(new Set(priceHistory.map(a => a.weekNumber)))
                  .sort((a, b) => b - a)
                  .map((week) => (
                    <option key={week} value={week}>Week {week}</option>
                  ))
                }
              </select>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(Number(e.target.value))}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {uniqueYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="space-y-6">
              {filteredHistory.length === 0 ? (
                <p className="text-gray-600">No announcements match the selected filters.</p>
              ) : (
                filteredHistory.map((announcement) => (
                  <div key={announcement.id} className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-2">{announcement.title}</h3>
                    <p className="text-gray-600 mb-2">
                      Week {announcement.weekNumber}, {announcement.year}
                    </p>
                    <p className="text-gray-700 mb-4">{announcement.content}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {announcement.prices.map((price, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 p-4 rounded-lg"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{price.fishType}</p>
                              <p className="text-sm text-gray-600">Size: {price.size}</p>
                            </div>
                            <p className="text-lg font-bold text-blue-600">
                              ฿{price.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAnnouncements;

//app/(user)/announcements/page.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Search, ChevronRight } from "lucide-react";
import { formatDate } from "@/app/lib/formatdate";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/Modal"; // หรือใช้ dialog ก็ได้
// (หากมี Modal UI แยกเป็น components/ui/Modal.tsx)

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

export default function UserAnnouncements() {
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
  const [priceHistory, setPriceHistory] = useState<Announcement[]>([]);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [showModal, setShowModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Fetch current announcement
  const fetchCurrentAnnouncement = async () => {
    try {
      const res = await fetch("/api/user/announcements/current");
      if (!res.ok) throw new Error("Failed to fetch current announcement");
      const data = await res.json();
      setCurrentAnnouncement(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch history
  const fetchPriceHistory = async () => {
    try {
      const res = await fetch("/api/user/announcements/history");
      if (!res.ok) throw new Error("Failed to fetch price history");
      const data = await res.json();
      setPriceHistory(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCurrentAnnouncement();
    fetchPriceHistory();
  }, []);

  // Filter by date range
  const filteredHistory = priceHistory.filter((announcement) => {
    if (!dateRange.startDate || !dateRange.endDate) return true;

    const aStart = new Date(announcement.startDate);
    const aEnd = new Date(announcement.endDate);
    const fStart = new Date(dateRange.startDate);
    const fEnd = new Date(dateRange.endDate);

    return (
      (aStart >= fStart && aStart <= fEnd) ||
      (aEnd >= fStart && aEnd <= fEnd)
    );
  });

  const handleViewHistory = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Current Prices */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-8 h-8 text-indigo-600" />
              Current Fish Prices
            </h1>
            {currentAnnouncement && (
              <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                Updated {formatDate(currentAnnouncement.createdAt)}
              </span>
            )}
          </div>

          {currentAnnouncement ? (
            <div className="bg-white rounded-2xl shadow-md border border-sky-900">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">
                  {currentAnnouncement.title}
                </h2>
                <p className="mt-2 text-gray-600">
                  Valid: {formatDate(currentAnnouncement.startDate)} - {formatDate(currentAnnouncement.endDate)}
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentAnnouncement.prices.map((price, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-xl hover:shadow-md border border-gray-900">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{price.fishType}</p>
                          <p className="text-sm text-gray-600">Size: {price.size}</p>
                        </div>
                        <p className="text-lg font-bold text-indigo-600">
                          ฿{price.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <p className="text-gray-500">No current price announcement available.</p>
            </div>
          )}
        </div>

        {/* Price History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-900">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Search className="w-6 h-6 text-indigo-600" />
                Price History
              </h2>
              <div className="flex gap-4">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date Range</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredHistory.map((announcement) => (
                  <tr key={announcement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(announcement.startDate)} - {formatDate(announcement.endDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{announcement.title}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewHistory(announcement)}
                        className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* History Detail Modal */}
        {showModal && selectedAnnouncement && (
          <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
            <ModalHeader>
              <h3 className="text-xl font-semibold text-gray-900">{selectedAnnouncement.title}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 border-black border">
                  <p className="text-sm text-gray-500 mb-1">Valid Period</p>
                  <p className="text-gray-900 font-medium">
                    {formatDate(selectedAnnouncement.startDate)} - {formatDate(selectedAnnouncement.endDate)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border-black border">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedAnnouncement.content}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedAnnouncement.prices.map((price, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm border-black">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{price.fishType}</p>
                          <p className="text-sm text-gray-600">Size: {price.size}</p>
                        </div>
                        <p className="text-lg font-bold text-blue-600">฿{price.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-white bg-gray-600 hover:bg-gray-700 rounded-lg">
                Close
              </button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}

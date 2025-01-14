"use client";

import { formatDate } from "@/app/lib/formatdate";
import { handleNumericAnnouncementPriceChange } from "@/app/lib/inputUtils";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface SelectOption {
  value: string;
  label: string;
}

const fishSizeOptions: SelectOption[] = [
  { value: "3-4", label: "3-4" },
  { value: "4-5", label: "4-5" },
  { value: "5-6", label: "5-6" },
];

const fishTypeOptions: SelectOption[] = [
  { value: "Norway", label: "Norway" },
  { value: "Trout", label: "Trout" },
];

interface Announcement {
  id: number;
  title: string;
  content: string;
  startDate: string;
  endDate: string;
  prices: { fishType: string; size: string; price: number }[];
}

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    startDate: "",
    endDate: "",
    prices: [{ fishType: "", size: "", price: 0 }],
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/admin/announcements");
      if (!response.ok) throw new Error("Failed to fetch announcements.");
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.startDate || !newAnnouncement.endDate) {
      toast.error("Please select both start and end dates.");
      return;
    }
  
    const payload = {
      ...newAnnouncement,
      prices: newAnnouncement.prices.filter(price => price.fishType && price.size && price.price > 0),
      startDate: new Date(newAnnouncement.startDate).toISOString(),
      endDate: new Date(newAnnouncement.endDate).toISOString(),
    };
  
  
    try {
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        fetchAnnouncements();
        setNewAnnouncement({
          title: "",
          content: "",
          startDate: "",
          endDate: "",
          prices: [{ fishType: "", size: "", price: 0 }],
        });
      } else {
        const errorData = await response.json();
        toast.error(`Failed to create announcement: ${errorData.error}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    }
  };
  
  
  
  

  const handleDeleteAnnouncement = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/announcements?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Announcement deleted successfully!");
        fetchAnnouncements();
      } else {
      }
    } catch (error) {
    }
  };

  const handleDeletePrice = (index: number) => {
    const updatedPrices = newAnnouncement.prices.filter((_, i) => i !== index);
    setNewAnnouncement({ ...newAnnouncement, prices: updatedPrices });
  };

  return (
<div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 p-4 lg:p-8">
  <div className="max-w-7xl mx-auto">
    {/* Header Section */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
        <Calendar className="w-8 h-8 text-indigo-600" />
        Manage Fish Prices
      </h1>
    </div>

    {/* Create Announcement Section */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Create New Announcement</h2>
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              placeholder="Enter announcement title"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={newAnnouncement.startDate}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={newAnnouncement.endDate}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <textarea
            placeholder="Enter announcement content"
            value={newAnnouncement.content}
            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-32"
          />
        </div>

        {/* Price List */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Fish Prices</h3>
            <button
              onClick={() => setNewAnnouncement({
                ...newAnnouncement,
                prices: [...newAnnouncement.prices, { fishType: "", size: "", price: 0 }],
              })}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Price
            </button>
          </div>

          <div className="space-y-4">
            {newAnnouncement.prices.map((price, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <select
                    value={price.fishType}
                    onChange={(e) => {
                      const updatedPrices = [...newAnnouncement.prices];
                      updatedPrices[index].fishType = e.target.value;
                      setNewAnnouncement({ ...newAnnouncement, prices: updatedPrices });
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="" disabled>Select Fish Type</option>
                    {fishTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <select
                    value={price.size}
                    onChange={(e) => {
                      const updatedPrices = [...newAnnouncement.prices];
                      updatedPrices[index].size = e.target.value;
                      setNewAnnouncement({ ...newAnnouncement, prices: updatedPrices });
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="" disabled>Select Size</option>
                    {fishSizeOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Price"
                    value={price.price}
                    onChange={(e) =>
                      handleNumericAnnouncementPriceChange(
                        e,
                        setNewAnnouncement,
                        index,
                        newAnnouncement
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => handleDeletePrice(index)}
                    className="inline-flex items-center justify-center w-full px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleCreateAnnouncement}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create Announcement
          </button>
        </div>
      </div>
    </div>

    {/* Announcements List */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800">Current Announcements</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {announcements.map((announcement) => (
              <tr key={announcement.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{announcement.title}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatDate(announcement.startDate)} - {formatDate(announcement.endDate)}
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                    className="text-red-600 hover:text-red-800 font-medium text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

  );
};

export default AdminAnnouncements;

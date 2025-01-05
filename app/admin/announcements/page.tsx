"use client";

import { getPreviousMondayWeek } from "@/app/lib/weekUtils";
import { useState, useEffect } from "react";

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
  weekNumber: number;
  year: number;
  createdAt: string;
  prices: { fishType: string; size: string; price: number }[];
}

const AdminAnnouncements = () => {
  const previousWeek = getPreviousMondayWeek(new Date());
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    weekNumber: getCurrentWeek(),
    year: new Date().getFullYear(),
    prices: [{ fishType: "", size: "", price: 0 }],
  });

  function getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
  }


  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/announcements");
      if (!response.ok) throw new Error("Failed to fetch announcements.");
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  const handleCreateAnnouncement = async () => {
    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAnnouncement),
      });

      if (response.ok) {
        fetchAnnouncements();
        setNewAnnouncement({
          title: "",
          content: "",
          weekNumber: previousWeek.weekNumber,
          year: previousWeek.year,
          prices: [{ fishType: "", size: "", price: 0 }],
        });
      } else {
        console.error("Error creating announcement.");
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    try {
      const response = await fetch(`/api/announcements?id=${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        alert("Announcement deleted successfully!");
        fetchAnnouncements();
      } else {
        console.error("Error deleting announcement.");
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
    }
  };
  

  const confirmAndDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      handleDeleteAnnouncement(id);
    }
  };

  const handleDeletePrice = (index: number) => {
    const updatedPrices = newAnnouncement.prices.filter((_, i) => i !== index);
    setNewAnnouncement({ ...newAnnouncement, prices: updatedPrices });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Manage Fish Prices</h1>

      {/* Create Announcement Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Create Announcement</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={newAnnouncement.title}
            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
            className="block w-full p-2 border rounded"
          />
          <textarea
            placeholder="Content"
            value={newAnnouncement.content}
            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
            className="block w-full p-2 border rounded"
          ></textarea>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Week Number"
              value={newAnnouncement.weekNumber}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, weekNumber: Number(e.target.value) })}
              className="block w-full p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Year"
              value={newAnnouncement.year}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, year: Number(e.target.value) })}
              className="block w-full p-2 border rounded"
            />
          </div>
          <div>
            <label>Fish Prices:</label>
            {newAnnouncement.prices.map((price, index) => (
              <div key={index} className="flex space-x-2 items-center mb-2">
                <select
                  value={price.fishType}
                  onChange={(e) => {
                    const updatedPrices = [...newAnnouncement.prices];
                    updatedPrices[index].fishType = e.target.value;
                    setNewAnnouncement({ ...newAnnouncement, prices: updatedPrices });
                  }}
                  className="block p-2 border rounded"
                >
                  <option value="" disabled>
                    Select Fish Type
                  </option>
                  {fishTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={price.size}
                  onChange={(e) => {
                    const updatedPrices = [...newAnnouncement.prices];
                    updatedPrices[index].size = e.target.value;
                    setNewAnnouncement({ ...newAnnouncement, prices: updatedPrices });
                  }}
                  className="block p-2 border rounded"
                >
                  <option value="" disabled>
                    Select Size
                  </option>
                  {fishSizeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Price"
                  value={price.price}
                  onChange={(e) => {
                    const updatedPrices = [...newAnnouncement.prices];
                    updatedPrices[index].price = Number(e.target.value);
                    setNewAnnouncement({ ...newAnnouncement, prices: updatedPrices });
                  }}
                  className="block p-2 border rounded"
                />
                <button
                  onClick={() => handleDeletePrice(index)}
                  className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                setNewAnnouncement({
                  ...newAnnouncement,
                  prices: [...newAnnouncement.prices, { fishType: "", size: "", price: 0 }],
                })
              }
              className="bg-blue-600 text-white px-2 py-1 rounded"
            >
              Add Price
            </button>
          </div>
          <button
            onClick={handleCreateAnnouncement}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Announcement
          </button>
        </div>
      </div>

      {/* Announcements List Section */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Announcements</h2>
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border px-4 py-2">Title</th>
              <th className="border px-4 py-2">Content</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((announcement) => (
              <tr key={announcement.id}>
                <td className="border px-4 py-2">{announcement.title}</td>
                <td className="border px-4 py-2">{announcement.content}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => confirmAndDelete(announcement.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
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
  );
};

export default AdminAnnouncements;

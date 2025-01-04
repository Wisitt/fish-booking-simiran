"use client";

import { useState, useEffect } from "react";

interface Announcement {
  id: number;
  title: string;
  content: string;
  weekNumber: number;
  year: number;
  createdAt: string;
}

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    weekNumber: 0,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/announcements");
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  const handleCreateAnnouncement = async () => {
    try {
      const response = await fetch("/api/announcements/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAnnouncement),
      });

      if (response.ok) {
        fetchAnnouncements();
        setNewAnnouncement({ title: "", content: "", weekNumber: 0, year: new Date().getFullYear() });
      } else {
        console.error("Error creating announcement");
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Manage Announcements</h1>

      {/* Create Announcement */}
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
          <input
            type="number"
            placeholder="Week Number"
            value={newAnnouncement.weekNumber}
            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, weekNumber: Number(e.target.value) })}
            className="block w-full p-2 border rounded"
          />
          <button
            onClick={handleCreateAnnouncement}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </div>

      {/* List Announcements */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Existing Announcements</h2>
        <ul className="space-y-4">
          {announcements.map((announcement) => (
            <li key={announcement.id} className="bg-gray-100 p-4 rounded">
              <h3 className="text-lg font-bold">{announcement.title}</h3>
              <p>{announcement.content}</p>
              <small>
                Week {announcement.weekNumber}, {announcement.year}
              </small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminAnnouncements;

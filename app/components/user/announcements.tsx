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

const UserAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch("/api/announcements");
        const data = await response.json();
        setAnnouncements(data);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Weekly Announcements</h1>
      <ul className="space-y-4">
        {announcements.map((announcement) => (
          <li key={announcement.id} className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-bold">{announcement.title}</h3>
            <p>{announcement.content}</p>
            <small>
              Week {announcement.weekNumber}, {announcement.year}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserAnnouncements;

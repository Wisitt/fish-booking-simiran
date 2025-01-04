import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      await handleGet(req, res);
      break;
    case "POST":
      await handlePost(req, res);
      break;
    case "PUT":
      await handlePut(req, res);
      break;
    case "DELETE":
      await handleDelete(req, res);
      break;
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ error: "Unable to fetch announcements." });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { title, content, weekNumber, year } = req.body;

  if (!title || !content || !weekNumber || !year) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        weekNumber,
        year,
      },
    });
    res.status(201).json(announcement);
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ error: "Unable to create announcement." });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id, title, content } = req.body;

  if (!id || !title || !content) {
    return res.status(400).json({ error: "ID, title, and content are required." });
  }

  try {
    const announcement = await prisma.announcement.update({
      where: { id },
      data: { title, content },
    });
    res.status(200).json(announcement);
  } catch (error) {
    console.error("Error updating announcement:", error);
    res.status(500).json({ error: "Unable to update announcement." });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID is required." });
  }

  try {
    await prisma.announcement.delete({
      where: { id },
    });
    res.status(200).json({ message: "Announcement deleted successfully." });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({ error: "Unable to delete announcement." });
  }
}

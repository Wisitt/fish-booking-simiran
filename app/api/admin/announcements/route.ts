// app/api/admin/announcements/route.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { title, content, weekNumber, year, prices, startDate, endDate } = await req.json();

    // Validate required fields
    if (!title || !content || !prices || !startDate || !endDate) {
      return new Response(
        JSON.stringify({ error: "Missing required fields." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate prices format
    if (!Array.isArray(prices) || prices.some(p => !p.fishType || !p.size || typeof p.price !== "number")) {
      return new Response(
        JSON.stringify({ error: "Invalid prices format." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Calculate weekNumber and year if not provided
    const calculatedWeekNumber = weekNumber || getWeekNumber(new Date(startDate));
    const calculatedYear = year || new Date(startDate).getFullYear();

    // Create announcement
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        weekNumber: calculatedWeekNumber,
        year: calculatedYear,
        prices,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    return new Response(JSON.stringify(announcement), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in POST /api/announcements:", error);
    return new Response(
      JSON.stringify({ error: "Unable to create announcement." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET(req: Request) {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
    });
    return new Response(JSON.stringify(announcements), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/announcements:", error);
    return new Response(
      JSON.stringify({ error: "Unable to fetch announcements." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID is required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await prisma.announcement.delete({
      where: { id: parseInt(id) },
    });

    return new Response(
      JSON.stringify({ message: "Announcement deleted successfully." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return new Response(
      JSON.stringify({ error: "Unable to delete announcement." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Helper function to calculate week number
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

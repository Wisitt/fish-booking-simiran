// app/api/announcements/route.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
function getWeekDates(weekNumber: number, year: number) {
  const firstDayOfYear = new Date(year, 0, 1);
  const firstMonday = new Date(year, 0, 1 + ((1 - firstDayOfYear.getDay() + 7) % 7));
  
  const startDate = new Date(firstMonday);
  startDate.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);
  
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6); // 7 days including start date
  
  // Set time to start and end of day
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
}

export async function POST(req: Request) {
  try {
    const { title, content, weekNumber, year, prices } = await req.json();
    const { startDate, endDate } = getWeekDates(weekNumber, year);

    const announcement = await prisma.announcement.create({
      data: { 
        title, 
        content, 
        weekNumber, 
        year, 
        prices,
        startDate,
        endDate
      },
    });

    return new Response(JSON.stringify(announcement), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
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
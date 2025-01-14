// app/api/bookings/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getMondayWeekAndYear } from "@/app/lib/weekUtils";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdHeader = req.headers.get("user-id");
    const weekParam = searchParams.get("weekNumber");
    const yearParam = searchParams.get("year");

    const whereCondition: { userId?: number; year?: number; weekNumber?: number } = {};

    if (userIdHeader) {
      const parsedId = parseInt(userIdHeader, 10);
      if (!isNaN(parsedId)) {
        whereCondition.userId = parsedId;
      } else {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
      }
    }
    

    if (yearParam && weekParam) {
      whereCondition.year = Number(yearParam);
      whereCondition.weekNumber = Number(weekParam);
    }
    const bookings = await prisma.booking.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    let { year, weekNumber } = data;
    if (!year || !weekNumber) {
      const { year: calcYear, weekNumber: calcWeekNumber } = getMondayWeekAndYear(new Date());
      year = calcYear;
      weekNumber = calcWeekNumber;
    }

    const newBooking = await prisma.booking.create({
      data: {
        ...data,
        year: Number(year),
        weekNumber: Number(weekNumber),
        createdAt: data.createdAt || new Date(),
      },
    });
    

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }
    await prisma.booking.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: "Booking deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

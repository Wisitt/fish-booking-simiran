// app/api/bookings/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Utility: Calculate ISO Week Number
const getISOWeekNumber = (date: Date): number => {
  const tempDate = new Date(date.getTime());
  tempDate.setUTCDate(tempDate.getUTCDate() + 4 - (tempDate.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
  return Math.ceil((((tempDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

// GET: Fetch bookings for the current ISO week
export async function GET() {
  try {
    const now = new Date();
    const currentWeekNumber = getISOWeekNumber(now);

    const bookings = await prisma.booking.findMany({
      where: { weekNumber: currentWeekNumber },
    });

    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ message: "Error fetching bookings" }, { status: 500 });
  }
}

// POST: Create a new booking
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (
      !body.code ||
      !body.team ||
      !body.customerGroup ||
      !body.customerName ||
      !body.price ||
      !body.dailyQuantities ||
      !body.userId
    ) {
      return NextResponse.json({ error: "Missing or invalid required fields" }, { status: 400 });
    }

    const dates = Object.keys(body.dailyQuantities).map((dateStr: string) => new Date(dateStr));

    if (dates.length === 0) {
      return NextResponse.json({ error: "No dates provided in dailyQuantities" }, { status: 400 });
    }

    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const weekNumber = getISOWeekNumber(minDate);

    const booking = await prisma.booking.create({
      data: {
        ...body,
        weekNumber,
        userId: Number(body.userId),
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE: Delete a booking by ID
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

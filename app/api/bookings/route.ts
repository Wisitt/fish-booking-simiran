// app/api/bookings/route.ts
import { NextResponse } from "next/server";
import { Prisma, PrismaClient } from "@prisma/client";
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

    // Filter bookings by week and year
    if (yearParam && weekParam) {
      whereCondition.year = Number(yearParam);
      whereCondition.weekNumber = Number(weekParam);
    } else {
      // Default to current week's data if no parameters are provided
      const { year, weekNumber } = getMondayWeekAndYear(new Date());
      whereCondition.year = year;
      whereCondition.weekNumber = weekNumber;
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

export async function PATCH(request: Request) {
  try {
    const { id, action, price } = await request.json();

    if (!id || !action) {
      return NextResponse.json(
        { message: "Invalid request: Missing id or action." },
        { status: 400 }
      );
    }

    let updatedBooking;

    if (action === "approve") {
      updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          status: "อนุมัติแล้ว",
          isApproved: true,
          price: price ? price.toString() : undefined,
        },
      });
    } else if (action === "reject") {
      const booking = await prisma.booking.findUnique({
        where: { id },
      });

      if (!booking) {
        return NextResponse.json(
          { message: "Booking not found." },
          { status: 404 }
        );
      }

      updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          status: "ถูกปฏิเสธ",
          isApproved: false,
          price: price ? price.toString() : undefined,
        },
      });

      const existingLog = await prisma.rejectedBooking.findFirst({
        where: { id },
      });

      if (!existingLog) {
        await prisma.rejectedBooking.create({
          data: {
            id: booking.id,
            code: booking.code,
            team: booking.team,
            customerGroup: booking.customerGroup,
            customerName: booking.customerName,
            price: (parseFloat(price || booking.price)).toString(),
            fishSize: booking.fishSize,
            fishType: booking.fishType,
            dailyQuantities: booking.dailyQuantities as Prisma.InputJsonValue,
            weekNumber: booking.weekNumber,
            year: booking.year,
            status: "ถูกปฏิเสธ",
            timestamp: new Date(),
          },
        });
      } else {
        await prisma.rejectedBooking.update({
          where: { id },
          data: {
            price: parseFloat(price || booking.price).toString(),
            timestamp: new Date(),
          },
        });
      }
    } else {
      return NextResponse.json(
        { message: "Invalid action provided." },
        { status: 400 }
      );
    }

    return NextResponse.json(updatedBooking, { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/bookings:", error);
    return NextResponse.json(
      { message: "Internal server error.", error: (error as Error).message },
      { status: 500 }
    );
  }
}
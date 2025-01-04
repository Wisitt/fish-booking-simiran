// app/api/bookings/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const year = url.searchParams.get("year");
  const weekNumber = url.searchParams.get("weekNumber");

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        ...(year ? { year: Number(year) } : {}),
        ...(weekNumber ? { weekNumber: Number(weekNumber) } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

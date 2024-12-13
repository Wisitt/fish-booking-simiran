import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

interface Booking {
  id: number;
  code: string;
  customerName: string;
  team: string;
  fishSize: string;
  dailyQuantities: JsonValue; // Use Prisma's JsonValue
  weekNumber: number;
  createdAt: Date;
}

export async function GET() {
  try {
    // Explicitly type `bookings` as `Booking[]`
    const bookings: Booking[] = await prisma.booking.findMany();

    const summary = bookings.map((booking: Booking) => {
      const totalQuantity = booking.dailyQuantities
        ? Object.values(booking.dailyQuantities as Record<string, number>).reduce(
            (sum, qty) => sum + Number(qty),
            0
          )
        : 0;

      return {
        code: booking.code,
        customerName: booking.customerName,
        team: booking.team,
        fishSize: booking.fishSize,
        totalQuantity,
        weekNumber: booking.weekNumber,
        createdAt: booking.createdAt, // Include the creation date
      };
    });

    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    console.error("Error fetching summary:", error);
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}

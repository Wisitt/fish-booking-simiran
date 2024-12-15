import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define the Booking interface manually
interface Booking {
  id: number;
  code: string;
  customerName: string | null;
  team: string | null;
  fishSize: string | null;
  dailyQuantities: Record<string, number> | null;
  weekNumber: number | null;
  createdAt: Date;
}

export async function GET() {
  try {
    // Fetch bookings from Prisma
    const rawBookings = await prisma.booking.findMany();

    // Transform raw Prisma data to match the Booking interface
    const bookings: Booking[] = rawBookings.map((booking) => ({
      id: booking.id,
      code: booking.code,
      customerName: booking.customerName,
      team: booking.team,
      fishSize: booking.fishSize,
      dailyQuantities:
        typeof booking.dailyQuantities === "object" && !Array.isArray(booking.dailyQuantities)
          ? (booking.dailyQuantities as Record<string, number>)
          : null,
      weekNumber: booking.weekNumber,
      createdAt: booking.createdAt,
    }));

    const summary = bookings.map((booking) => {
      const totalQuantity = booking.dailyQuantities
        ? Object.values(booking.dailyQuantities).reduce((sum, qty) => sum + Number(qty), 0)
        : 0;

      return {
        code: booking.code,
        customerName: booking.customerName,
        team: booking.team,
        fishSize: booking.fishSize,
        totalQuantity,
        weekNumber: booking.weekNumber,
        createdAt: booking.createdAt,
      };
    });

    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    console.error("Error fetching summary:", error);
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}

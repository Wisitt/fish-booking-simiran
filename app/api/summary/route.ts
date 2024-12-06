import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Booking {
  id: number;
  team: string;
  customerGroup: string;
  customerName: string;
  price: string; // Assuming price is stored as a string
  dailyQuantities: Record<string, number>; // Assuming dailyQuantities is a JSON object
  fishSize: string;
  fishType: string;
  code: string; // Salesperson code
  createdAt: Date;
}

export async function GET() {
  try {
    // Fetch all bookings from the database
    const bookings: Booking[] = await prisma.booking.findMany();

    // Generate the summary
    const summary = bookings.map((booking) => {
      const totalQuantity = Object.values(booking.dailyQuantities).reduce(
        (sum, qty) => sum + qty,
        0
      );

      return {
        customerName: booking.customerName,
        team: booking.team,
        fishSize: booking.fishSize,
        totalQuantity,
      };
    });

    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    console.error("Error fetching summary:", error);
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}

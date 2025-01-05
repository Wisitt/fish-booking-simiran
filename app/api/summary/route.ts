// app/api/summary/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const weekNumber = parseInt(url.searchParams.get("weekNumber") || "0", 10);
  const year = parseInt(url.searchParams.get("year") || "0", 10);

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        weekNumber: weekNumber || undefined,
        year: year || undefined,
      },
      orderBy: { createdAt: "desc" },
    });

    const summary = bookings.map((booking) => {
      const daily = booking.dailyQuantities as Record<string, number> | null;
      const totalQuantity = daily
        ? Object.values(daily).reduce((sum, qty) => sum + Number(qty), 0)
        : 0;

      return {
        id: booking.id,
        code: booking.code,
        customerName: booking.customerName,
        team: booking.team,
        fishSize: booking.fishSize,
        totalQuantity,
        weekNumber: booking.weekNumber,
        year: booking.year,
        createdAt: booking.createdAt,
        dailyQuantities: daily,
      };
    });

    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    console.error("Error fetching summary:", error);
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}

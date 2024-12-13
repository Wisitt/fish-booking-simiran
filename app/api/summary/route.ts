// app/api/summary/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany();

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
        createdAt: booking.createdAt, // ส่งวันที่สร้างด้วย
      };
    });

    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    console.error("Error fetching summary:", error);
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}

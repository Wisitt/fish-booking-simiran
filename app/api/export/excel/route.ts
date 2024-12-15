import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

interface RawBooking {
  id: number;
  team: string;
  customerGroup: string;
  customerName: string;
  price: string;
  dailyQuantities: Prisma.JsonValue; // Use Prisma.JsonValue
  fishSize: string;
  fishType: string;
  code: string;
  createdAt: Date;
  weekNumber: number;
  userId: number;
}

interface Booking {
  id: number;
  team: string;
  customerGroup: string;
  customerName: string;
  price: string;
  dailyQuantities: Record<string, number> | null;
  fishSize: string;
  fishType: string;
  code: string;
  createdAt: Date;
  weekNumber: number;
  userId: number;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const weekParam = searchParams.get("weekNumber");
    const searchDateParam = searchParams.get("searchDate");

    let bookings: Booking[];

    if (weekParam && weekParam !== "all") {
      const selectedWeek = parseInt(weekParam, 10);
      if (isNaN(selectedWeek)) {
        return NextResponse.json({ error: "Invalid weekNumber" }, { status: 400 });
      }

      const rawBookings: RawBooking[] = await prisma.booking.findMany({
        where: { weekNumber: selectedWeek },
      });

      bookings = rawBookings.map((booking: RawBooking): Booking => ({
        ...booking,
        dailyQuantities:
          typeof booking.dailyQuantities === "object" &&
          booking.dailyQuantities !== null &&
          !Array.isArray(booking.dailyQuantities)
            ? (booking.dailyQuantities as Record<string, number>)
            : null,
      }));
    } else {
      const rawBookings: RawBooking[] = await prisma.booking.findMany();

      bookings = rawBookings.map((booking: RawBooking): Booking => ({
        ...booking,
        dailyQuantities:
          typeof booking.dailyQuantities === "object" &&
          booking.dailyQuantities !== null &&
          !Array.isArray(booking.dailyQuantities)
            ? (booking.dailyQuantities as Record<string, number>)
            : null,
      }));
    }

    if (searchDateParam) {
      const searchDate = new Date(searchDateParam);
      bookings = bookings.filter((booking: Booking) => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate.toDateString() === searchDate.toDateString();
      });
    }

    const allDays = Array.from(
      new Set(
        bookings.flatMap((booking: Booking) =>
          booking.dailyQuantities ? Object.keys(booking.dailyQuantities) : []
        )
      )
    ).sort();

    const data = bookings.map((booking: Booking) => {
      const dailyQuantitiesData = allDays.reduce((acc: Record<string, number>, day) => {
        acc[day] = booking.dailyQuantities?.[day] || 0;
        return acc;
      }, {});

      return {
        พนักงาน: booking.code,
        Team: booking.team,
        กลุ่มลูกค้า: booking.customerGroup,
        ชื่อลูกค้า: booking.customerName,
        ขนาดปลา: booking.fishSize,
        ประเภทปลา: booking.fishType,
        ราคา: booking.price,
        ...dailyQuantitiesData,
        รวมสัปดาห์: Object.values(dailyQuantitiesData).reduce((sum, qty) => sum + qty, 0),
      };
    });

    const ws = XLSX.utils.json_to_sheet(data, {
      header: ["พนักงาน", "Team", "กลุ่มลูกค้า", "ชื่อลูกค้า", "ขนาดปลา", "ราคา", ...allDays, "รวมสัปดาห์"],
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Booking Report");

    const excelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=Booking_Report${weekParam && weekParam !== "all" ? `_Week${weekParam}` : ""}${searchDateParam ? `_Date${searchDateParam}` : ""}.xlsx`,
      },
    });
  } catch (error) {
    console.error("Error generating Excel:", error);
    return NextResponse.json({ error: "Failed to generate Excel file" }, { status: 500 });
  }
}

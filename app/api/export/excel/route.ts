// app/api/export/excel/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

interface Booking {
  id: number;
  team: string;
  customerGroup: string;
  customerName: string;
  price: string; // Assuming price is stored as a string
  dailyQuantities: Record<string, number> | null; // ปรับให้รองรับ null
  fishSize: string;
  fishType: string;
  code: string; // Salesperson code
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

      bookings = (await prisma.booking.findMany({
        where: { weekNumber: selectedWeek },
      })) as Booking[];
    } else {
      bookings = (await prisma.booking.findMany()) as Booking[];
    }

    if (searchDateParam) {
      const searchDate = new Date(searchDateParam);
      bookings = bookings.filter((booking) => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate.toDateString() === searchDate.toDateString();
      });
    }

    // สร้างโครงสร้างข้อมูลใหม่
    const allDays = Array.from(
      new Set(
        bookings.flatMap((booking) => 
          booking.dailyQuantities ? Object.keys(booking.dailyQuantities) : []
        )
      )
    ).sort();

    const data: any[] = bookings.map((booking) => {
      const dailyQuantitiesData = allDays.reduce((acc: any, day) => {
        acc[day] = booking.dailyQuantities?.[day] || 0;
        return acc;
      }, {});

      return {
        "พนักงาน": booking.code,
        Team: booking.team,
        "กลุ่มลูกค้า": booking.customerGroup,
        "ชื่อลูกค้า": booking.customerName,
        "ขนาดปลา": booking.fishSize,
        "ประเภทปลา": booking.fishType,
        "ราคา": booking.price,
        ...dailyQuantitiesData,
        "รวมสัปดาห์": Object.values(dailyQuantitiesData).reduce((sum: number, qty) => sum + Number(qty), 0),
      };
    });

    const ws = XLSX.utils.json_to_sheet(data, { header: ["พนักงาน", "Team", "กลุ่มลูกค้า", "ชื่อลูกค้า", "ขนาดปลา", "ราคา", ...allDays, "รวมสัปดาห์"] });
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


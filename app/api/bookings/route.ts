// app/api/bookings/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: ดึง bookings ของ user ตาม userId ที่ส่งมาทาง header
export async function GET(req: Request) {
  const userId = req.headers.get("userId");
  if (!userId) {
    return NextResponse.json({ message: "User ID is required" }, { status: 400 });
  }

  const userIdNum = Number(userId);

  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: userIdNum },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ message: "Error fetching bookings" }, { status: 500 });
  }
}

// ฟังก์ชันคำนวณ weekNumber จากวันที่ (ตัวอย่างใช้ ISO week number)
const getISOWeekNumber = (date: Date): number => {
  const tempDate = new Date(date.getTime());
  tempDate.setUTCDate(tempDate.getUTCDate() + 4 - (tempDate.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((tempDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ตรวจสอบว่ามีฟิลด์ที่จำเป็นทั้งหมดหรือไม่
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

    // คำนวณ weekNumber จากวันที่แรกใน dailyQuantities
    const dates = Object.keys(body.dailyQuantities).map(dateStr => new Date(dateStr));
    if (dates.length === 0) {
      return NextResponse.json({ error: "No dates provided in dailyQuantities" }, { status: 400 });
    }
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const weekNumber = getISOWeekNumber(minDate);

    const userIdNum = Number(body.userId);

    const booking = await prisma.booking.create({
      data: {
        code: body.code,
        team: body.team,
        customerGroup: body.customerGroup,
        customerName: body.customerName,
        fishSize: body.fishSize,
        fishType: body.fishType,
        price: body.price,
        dailyQuantities: body.dailyQuantities,
        weekNumber: weekNumber,
        userId: userIdNum,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE: ลบ booking ตาม id และ code ที่ส่งมาใน query string
// ตัวอย่างการเรียก: /api/bookings?id=123&code=dogfuse
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    await prisma.booking.delete({ where: { id: parseInt(id, 10) } });
    return NextResponse.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}



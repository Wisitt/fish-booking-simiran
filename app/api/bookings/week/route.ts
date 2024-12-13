import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { startOfWeek, endOfWeek, format } from "date-fns"; // นำเข้าฟังก์ชันจาก date-fns

const prisma = new PrismaClient();

export async function GET() {
  try {
    const currentDate = new Date();
    const weekStart = startOfWeek(currentDate); // หาวันเริ่มต้นของสัปดาห์
    const weekEnd = endOfWeek(currentDate); // หาวันสิ้นสุดของสัปดาห์

    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: weekStart, // การกรองการจองที่เริ่มตั้งแต่วันเริ่มต้นของสัปดาห์
          lte: weekEnd, // การกรองการจองที่สิ้นสุดไม่เกินวันสิ้นสุดของสัปดาห์
        },
      },
    });

    // กรองข้อมูลที่ต้องการให้เป็นรูปแบบที่สามารถคำนวณได้
    const bookingsGroupedByWeek = {
      weekStart: format(weekStart, "yyyy-MM-dd"), // แปลงวันที่เป็นรูปแบบที่ต้องการ
      weekEnd: format(weekEnd, "yyyy-MM-dd"),
      bookings: bookings.map((booking) => {
        const totalQuantity = Object.values(booking.dailyQuantities ?? {}).reduce(
          (sum, qty) => sum + (qty ?? 0), // ตรวจสอบว่ามีค่า qty หรือไม่, ถ้าไม่ให้ใช้ 0
          0
        );

        return {
          code: booking.code,
          customerName: booking.customerName,
          team: booking.team,
          fishSize: booking.fishSize,
          totalQuantity,
        };
      }),
    };

    return NextResponse.json(bookingsGroupedByWeek);
  } catch (error) {
    console.error("Error fetching weekly bookings:", error);
    return NextResponse.json({ error: "Failed to fetch weekly bookings" }, { status: 500 });
  }
}

// app/api/bookings/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getPreviousMondayWeek } from "@/app/lib/weekUtils";

const prisma = new PrismaClient();

export async function PUT(req: Request) {
  try {
    const { id, userId, ...updateData } = await req.json();

    if (!id || !userId) {
      return NextResponse.json({ error: "Missing required fields: id or userId" }, { status: 400 });
    }

    // หา booking เดิม
    const existingBooking = await prisma.booking.findUnique({ where: { id: Number(id) } });
    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // ตรวจสอบ userId
    if (existingBooking.userId !== Number(userId)) {
      return NextResponse.json({ error: "You are not authorized to edit this booking" }, { status: 403 });
    }

    // ตรวจสอบ customerGroup
    if (existingBooking.customerGroup !== "กลุ่ม 2 : ต่อราคา") {
      return NextResponse.json({
        error: "This booking is not in 'ต่อราคา' group, cannot edit last week's data."
      }, { status: 403 });
    }

    // ตรวจสอบว่า booking นี้เป็น “อาทิตย์ที่แล้ว” (monday-based)
    const { year: prevYear, weekNumber: prevWeek } = getPreviousMondayWeek(new Date());
    const bookingYear = new Date(existingBooking.createdAt).getFullYear();
    if (bookingYear !== prevYear || existingBooking.weekNumber !== prevWeek) {
      return NextResponse.json({
        error: "You can only edit last week's booking if it's 'ต่อราคา'."
      }, { status: 403 });
    }

    // update
    const updatedBooking = await prisma.booking.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return NextResponse.json(updatedBooking, { status: 200 });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

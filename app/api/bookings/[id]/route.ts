// app/api/bookings/[id]/route.ts 
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, userId, ...updateData } = body;

    if (!id || !userId) {
      return NextResponse.json({ error: "Missing required fields: id or userId" }, { status: 400 });
    }

    const existingBooking = await prisma.booking.findUnique({ where: { id: Number(id) } });

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (existingBooking.userId !== Number(userId)) {
      return NextResponse.json({ error: "You are not authorized to edit this booking" }, { status: 403 });
    }

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

// export async function DELETE(req: Request) {
//   try {
//     const url = new URL(req.url);
//     const id = url.searchParams.get("id");

//     if (!id) {
//       return NextResponse.json({ error: "Missing ID" }, { status: 400 });
//     }

//     await prisma.booking.delete({ where: { id: parseInt(id, 10) } });
//     return NextResponse.json({ message: "Booking deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting booking:", error);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

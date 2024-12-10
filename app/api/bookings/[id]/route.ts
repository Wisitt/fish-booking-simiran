// app/api/bookings/[id].ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Example API handler for PUT method
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const bookingId = Number(params.id);  // Convert string to number

  const body = await req.json();

  if (!body.code || !body.team || !body.customerGroup || !body.customerName || !body.price) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        code: body.code,
        team: body.team,
        customerGroup: body.customerGroup,
        customerName: body.customerName,
        fishSize: body.fishSize,
        fishType: body.fishType,
        price: body.price,
        dailyQuantities: body.dailyQuantities, // Ensure dailyQuantities is passed correctly
        userId: body.userId, // Make sure userId is passed for the update
      },
    });

    return NextResponse.json(updatedBooking, { status: 200 });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json({ error: "Error saving booking" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const email = req.headers.get("email");
    if (!email) {
      return NextResponse.json({ message: "Email header is missing" }, { status: 400 });
    }
    const bookingId = Number(params.id);
  
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });
  
      if (!booking) {
        return NextResponse.json({ message: "Booking not found" }, { status: 404 });
      }
  
      const user = await prisma.user.findUnique({ where: { email } });
  
      if (user && booking.userId !== user.id && user.role !== "admin") {
        return NextResponse.json({ message: "Unauthorized to delete this booking" }, { status: 403 });
      }
  
      await prisma.booking.delete({ where: { id: bookingId } });
  
      return NextResponse.json({ message: "Booking deleted successfully" });
    } catch (error) {
      console.error("Error deleting booking:", error);
      return NextResponse.json({ message: "Error deleting booking" }, { status: 500 });
    }
  }
  
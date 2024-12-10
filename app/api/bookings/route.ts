
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const userId = req.headers.get("userId"); // Get userId from request headers

  if (!userId) {
    return NextResponse.json({ message: "User ID is required" }, { status: 400 });
  }

  try {
    // Query bookings where userId matches
    const bookings = await prisma.booking.findMany({
      where: { userId: parseInt(userId) }, // Filter bookings by userId
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ message: "Error fetching bookings" }, { status: 500 });
  }
}

  
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    if (
      !body.code ||
      !body.team ||
      !body.customerGroup ||
      !body.customerName ||
      !body.price ||
      !body.dailyQuantities ||
      !body.userId // Ensure userId is provided
    ) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    // Create the booking
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
        userId: body.userId, // Ensure userId is saved with the booking
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


  
  
  
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
  
  
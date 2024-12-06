import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
      const bookings = await prisma.booking.findMany();
      return NextResponse.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }
  }
  
  export async function POST(req: Request) {
    try {
      const body = await req.json();
  
      if (
        !body.code ||
        !body.team ||
        !body.customerGroup ||
        !body.customerName ||
        !body.price || 
        !body.dailyQuantities
      ) {
        return NextResponse.json(
          { error: "Missing or invalid required fields" },
          { status: 400 }
        );
      }
  
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
  
  
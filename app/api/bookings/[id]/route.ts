import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: Request) {
    try {
      const body = await req.json();
  
      if (!body.id) {
        return NextResponse.json({ error: "Missing ID" }, { status: 400 });
      }
  
      const updatedBooking = await prisma.booking.update({
        where: { id: body.id },
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
  
      return NextResponse.json(updatedBooking, { status: 200 });
    } catch (error) {
      console.error("Error updating booking:", error);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }
  
  
  
  

  
  
  
  
  


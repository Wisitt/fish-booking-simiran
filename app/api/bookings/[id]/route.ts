// app/api/bookings/[id]/route.ts 
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.code || !body.team || !body.customerGroup || !body.customerName || !body.price || !body.userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: Number(body.id) },
      data: {
        code: body.code,
        team: body.team,
        customerGroup: body.customerGroup,
        customerName: body.customerName,
        fishSize: body.fishSize,
        fishType: body.fishType,
        price: body.price,
        dailyQuantities: body.dailyQuantities,
        userId: Number(body.userId),
      },
    });

    return NextResponse.json(updatedBooking, { status: 200 });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json({ error: "Error saving booking" }, { status: 500 });
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

//app/api/admin/rejectedBookings/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Check if the log already exists
    const existingLog = await prisma.rejectedBooking.findFirst({
      where: { id: data.id },
    });

    if (existingLog) {
      return NextResponse.json(
        { message: "This booking has already been rejected." },
        { status: 400 }
      );
    }

    // Save the log in the database
    const log = await prisma.rejectedBooking.create({
      data: {
        ...data, // Copies all fields from the request payload
        timestamp: new Date(), // Adds timestamp
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("Error saving rejected booking log:", error);
    return NextResponse.json(
      { message: "Internal server error.", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const logs = await prisma.rejectedBooking.findMany();
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching rejected logs:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

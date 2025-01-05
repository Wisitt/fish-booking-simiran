// app/api/summary/years/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const years = await prisma.booking.findMany({
      distinct: ["year"],
      select: { year: true },
      orderBy: { year: "desc" },
    });

    const yearList = years.map((entry) => entry.year);
    return NextResponse.json(yearList, { status: 200 });
  } catch (error) {
    console.error("Error fetching years:", error);
    return NextResponse.json({ error: "Failed to fetch years" }, { status: 500 });
  }
}

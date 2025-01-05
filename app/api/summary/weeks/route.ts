// app/api/summary/weeks/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const year = parseInt(url.searchParams.get("year") || "0", 10);

  if (!year) {
    return NextResponse.json({ error: "Year is required" }, { status: 400 });
  }

  try {
    const weeks = await prisma.booking.findMany({
      where: { year },
      distinct: ["weekNumber"],
      select: { weekNumber: true, year: true },
      orderBy: { weekNumber: "asc" },
    });

    return NextResponse.json(weeks, { status: 200 });
  } catch (error) {
    console.error("Error fetching weeks:", error);
    return NextResponse.json({ error: "Failed to fetch weeks" }, { status: 500 });
  }
}

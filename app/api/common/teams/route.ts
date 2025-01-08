import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const teams = await prisma.team.findMany();
    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    const newTeam = await prisma.team.create({
      data: { name },
    });
    return NextResponse.json(newTeam, { status: 201 });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
  }
}

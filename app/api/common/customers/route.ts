//app/api/common/customers/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Fetch user details with their code and teamId
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: {
        team: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch customers matching the user's code and teamId
    const customers = await prisma.customer.findMany({
      where: {
        userId: user.id,
        OR: [
          { teamId: user.teamId || undefined }, // Match user's teamId if it exists
          { userId: user.id },
        ],
      },
    });

    return NextResponse.json({ code: user.code, customers, team: user.team?.name });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}



export async function POST(req: Request) {
  try {
    const { name, userId, teamId } = await req.json();

    if (!name || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: name or userId" },
        { status: 400 }
      );
    }

    const newCustomer = await prisma.customer.create({
      data: {
        name,
        userId: Number(userId),
        teamId: teamId ? Number(teamId) : null, // เชื่อมกับทีมถ้ามี
      },
    });

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
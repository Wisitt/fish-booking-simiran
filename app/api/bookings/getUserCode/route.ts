
// app/api/bookings/getUserCode/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing user ID." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: { code: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ code: user.code }, { status: 200 });
}

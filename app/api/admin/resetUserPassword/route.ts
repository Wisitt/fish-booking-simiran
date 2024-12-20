// app/api/admin/resetUserPassword/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId, newPassword } = await req.json();
    if (!userId || !newPassword) {
      return NextResponse.json({ message: "Missing userId or newPassword" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        passwordHash,
      },
    });

    return NextResponse.json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// app/api/login/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";  // นำเข้า bcrypt

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email, password } = await req.json();

  try {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });    
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Validate password with bcrypt.compare
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }
    return NextResponse.json({ id: user.id, role: user.role, email: user.email, code: user.code });
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ message: "Error during login" }, { status: 500 });
  }
}

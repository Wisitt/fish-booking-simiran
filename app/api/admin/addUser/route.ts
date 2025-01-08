// app/api/admin/addUser/route.ts 

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs"; // Switch to bcryptjs for compatibility

const prisma = new PrismaClient();
const ALLOWED_ROLES = ["admin", "user"];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, password, role, code } = body;

    // Validate required fields
    if (!email || !password || !role || !code) {
      console.error("Validation error: Missing required fields.");
      return NextResponse.json(
        { message: "Email, password, role, and code are required." },
        { status: 400 }
      );
    }

    // Validate role
    if (!ALLOWED_ROLES.includes(role)) {
      console.error("Validation error: Invalid role.");
      return NextResponse.json(
        { message: "Invalid role. Please select either 'admin' or 'user'." },
        { status: 400 }
      );
    }

    // Check if the code already exists
    const existingCode = await prisma.user.findUnique({ where: { code } });
    if (existingCode) {
      console.error("Validation error: Code already exists.");
      return NextResponse.json(
        { message: "Code already exists." },
        { status: 409 }
      );
    }

    // Check if the email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.error("Validation error: User already exists.");
      return NextResponse.json(
        { message: "User already exists." },
        { status: 409 }
      );
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        code, // บันทึก code ที่ผู้ใช้ป้อนลงฐานข้อมูล
      },
    });

    return NextResponse.json({
      message: "User added successfully!",
      user: { id: newUser.id, email: newUser.email, role: newUser.role, code: newUser.code },
    });
  } catch (error: unknown) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { message: "Error adding user", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

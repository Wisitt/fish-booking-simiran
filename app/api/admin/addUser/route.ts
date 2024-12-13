import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs"; // Switch to bcryptjs for compatibility

const prisma = new PrismaClient();
const ALLOWED_ROLES = ["admin", "user"];

export async function POST(req: Request) {
  try {
    console.log("Starting POST /api/admin/addUser...");
    const body = await req.json();
    console.log("Request body parsed:", body);

    const { email, password, role } = body;

    // Validate required fields
    if (!email || !password || !role) {
      console.error("Validation error: Missing required fields.");
      return NextResponse.json(
        { message: "Email, password, and role are required." },
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

    // Check if the email already exists
    console.log("Checking if user exists...");
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.error("Validation error: User already exists.");
      return NextResponse.json(
        { message: "User already exists." },
        { status: 409 }
      );
    }

    // Hash the password
    console.log("Hashing password...");
    const passwordHash = await bcrypt.hash(password, 10);

    // Create a new user in the database
    console.log("Creating new user...");
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
      },
    });

    console.log("User created successfully:", newUser);

    return NextResponse.json({
      message: "User added successfully!",
      user: { id: newUser.id, email: newUser.email, role: newUser.role },
    });
  } catch (error: unknown) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { message: "Error adding user", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"; // Import bcrypt for password hashing

const prisma = new PrismaClient();
const ALLOWED_ROLES = ["admin", "user"]; // Define allowed roles

export async function POST(req: Request) {
  try {
    const { email, password, role } = await req.json();

    // Validate required fields
    if (!email || !password || !role) {
      return NextResponse.json(
        { message: "Email, password, and role are required." },
        { status: 400 }
      );
    }

    // Validate role
    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json(
        { message: "Invalid role. Please select either 'admin' or 'user'." },
        { status: 400 }
      );
    }

    // Check if the email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
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
        passwordHash, // Store the hashed password
        role,
      },
    });

    return NextResponse.json({
      message: "User added successfully!",
      user: { id: newUser.id, email: newUser.email, role: newUser.role }, // Return essential details only
    });
  } catch (error: unknown) {
    console.error("Error adding user:", error);
    return NextResponse.json(
      { message: "Error adding user", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

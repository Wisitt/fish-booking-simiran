// app/api/login/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email, password } = await req.json();

  console.log("Received credentials:", { email, password }); // Debugging log

  try {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.log("User not found");
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Directly compare password without hashing
    if (password !== user.passwordHash) {
      console.log("Invalid password"); // Log invalid password attempt
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    console.log("Login successful", { id:user.id, email: user.email, role: user.role });
    
    return NextResponse.json({ id:user.id ,role: user.role, email: user.email });
  } catch (error) {
    console.error("Error during login:", error);  // Debugging log
    return NextResponse.json({ message: "Error during login" }, { status: 500 });
  }
}

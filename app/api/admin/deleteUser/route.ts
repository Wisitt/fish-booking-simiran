// app/api/admin/deleteUser/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(req: Request) {
  try {
    const { userId } = await req.json();

    await prisma.user.delete({
      where: { id: Number(userId) },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error); // Log the error for debugging purposes
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

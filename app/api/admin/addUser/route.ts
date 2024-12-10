import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email, password, role } = await req.json();

  try {
    // ตรวจสอบว่า role เป็น 'admin' หรือ 'user'
    if (role !== 'admin' && role !== 'user') {
      return NextResponse.json({ message: "Invalid role. Please select either 'admin' or 'user'." }, { status: 400 });
    }

    // ตรวจสอบว่าอีเมลมีอยู่ในฐานข้อมูลแล้วหรือยัง
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists." }, { status: 409 });
    }

    // สร้างผู้ใช้ใหม่ในฐานข้อมูล
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash: password, // ควรเก็บเป็น hash password แต่สำหรับตอนนี้เก็บ plaintext
        role,
      },
    });

    return NextResponse.json({ message: "User added successfully!", user: newUser });
  } catch (error) {
    console.error("Error adding user:", error); // เพิ่มการแสดงข้อผิดพลาด
    return NextResponse.json({ message: "Error adding user", error: (error as any).message }, { status: 500 });
  }
}

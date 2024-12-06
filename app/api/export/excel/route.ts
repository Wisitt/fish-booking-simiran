import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();
interface Booking {
    id: number;
    team: string;
    customerGroup: string;
    customerName: string;
    price: string; // Assuming price is stored as a string
    dailyQuantities: Record<string, number>; // Assuming dailyQuantities is a JSON object
    fishSize: string;
    fishType: string;
    code: string; // Salesperson code
    createdAt: Date;
  }
export async function GET() {
  try {
    const bookings: Booking[] = await prisma.booking.findMany();

    // เตรียมข้อมูลในรูปแบบของ JSON สำหรับสร้าง Excel
    const data: any[] = [];
    bookings.map((booking) => { // ใช้ booking ซึ่งถูกดึงมาจากฐานข้อมูล
      // คำนวณรวมจำนวนปลาทั้งสัปดาห์
      const totalQuantity = Object.values(booking.dailyQuantities).reduce(
        (sum: number, qty: any) => sum + Number(qty),
        0
      );

      // แยกข้อมูลตามขนาดปลาและวัน
      data.push({
        Team: booking.team,
        "กลุ่มลูกค้า": booking.customerGroup,
        "ชื่อลูกค้า": booking.customerName,
        "ขนาดปลา": booking.fishSize,
        "ราคาทั้งสัปดาห์": booking.price,
        ...booking.dailyQuantities, // รวมข้อมูลตามวัน
        "รวมทั้งสัปดาห์": totalQuantity,
      });
    });

    // สร้าง Worksheet จากข้อมูล
    const ws = XLSX.utils.json_to_sheet(data);

    // สร้าง Workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Booking Report");

    // แปลงเป็น Buffer
    const excelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // ส่งออกไฟล์ Excel
    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=Booking_Report.xlsx",
      },
    });
  } catch (error) {
    console.error("Error generating Excel:", error);
    return NextResponse.json(
      { error: "Failed to generate Excel file" },
      { status: 500 }
    );
  }
}

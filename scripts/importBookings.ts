import { PrismaClient } from "@prisma/client";
import XLSX from "xlsx";

const prisma = new PrismaClient();

async function importExcelData() {
  const workbook = XLSX.readFile("./app/data/bookings.xlsx");
  const sheetName = workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json<any>(workbook.Sheets[sheetName]);

  for (const row of rows) {
    const dailyQuantities = {
      "2024-12-09": row["9/12/2024"] || 0,
      "2024-12-10": row["10/12/2024"] || 0,
      "2024-12-11": row["11/12/2024"] || 0,
      "2024-12-12": row["12/12/2024"] || 0,
      "2024-12-13": row["13/12/2024"] || 0,
      "2024-12-14": row["14/12/2024"] || 0,
    };

    await prisma.booking.create({
      data: {
        code: row["พนักงาน"].toString() || "N/A", // แปลงเป็น String
        team: row["Team"] || "N/A",
        customerGroup: row["กลุ่มลูกค้า"] || "N/A",
        customerName: row["ชื่อลูกค้า"] || "N/A",
        price: row["ราคา"]?.toString() || "0",
        dailyQuantities,
        fishSize: "T5-6",
        fishType: "N/A",
        weekNumber: 50,
        userId: 9, // ตรวจสอบให้แน่ใจว่า userId มีอยู่
      },
    });
  }

  console.log("🎉 ข้อมูลถูกนำเข้าลงในฐานข้อมูลเรียบร้อย!");
}

importExcelData()
  .catch((e) => {
    console.error("❌ เกิดข้อผิดพลาด:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// app/api/bookings/analysis/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

interface BookingItem {
  fishType: string;
  fishSize: string;
  createdAt: Date;
  dailyQuantities: Prisma.JsonValue;
  customerName: string | null;
  weekNumber: number;
  price: string;
}

export async function POST(req: Request) {
  try {
    const { userId, role, costsPerWeek, year } = await req.json();
    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    const userIdNum = Number(userId);
    const filter: Record<string, unknown> = role !== "admin" ? { userId: userIdNum } : {};

    const bookings = await prisma.booking.findMany({
      where: filter,
      select: {
        fishType: true,
        fishSize: true,
        createdAt: true,
        dailyQuantities: true,
        customerName: true,
        weekNumber: true,
        price: true
      },
    });

    if (bookings.length === 0) {
      return NextResponse.json({ message: "No bookings found" }, { status: 404 });
    }

    // คำนวณ weeklyBreakdown เดิม
    const weeklyBookings = processWeeklyBookings(bookings);
    const totalBookings = weeklyBookings.reduce((sum, w) => sum + w.totalQuantity, 0);

    let growthRate = 0;
    if (weeklyBookings.length > 1) {
      const latest = weeklyBookings[weeklyBookings.length - 1].totalQuantity;
      const prev = weeklyBookings[weeklyBookings.length - 2].totalQuantity;
      if (prev !== 0) {
        growthRate = ((latest - prev) / prev) * 100;
      }
    }

    // Fish Ranking
    const fishTotals: Record<string, number> = {};
    for (const booking of bookings) {
      const qty = totalFromDailyQuantities(booking.dailyQuantities);
      const fishKey = `${booking.fishType} (${booking.fishSize})`;
      fishTotals[fishKey] = (fishTotals[fishKey] || 0) + qty;
    }

    const mostPopularFish = Object.keys(fishTotals).reduce((a, b) => (fishTotals[a] > fishTotals[b] ? a : b));

    const fishEntries = Object.entries(fishTotals);
    fishEntries.sort((a, b) => b[1] - a[1]);
    const fishRanking = fishEntries.map(([fish, total]) => ({
      fish,
      total,
      share: (total / totalBookings) * 100,
    }));

    // Top Customers
    const customerTotals: Record<string, number> = {};
    for (const booking of bookings) {
      const qty = totalFromDailyQuantities(booking.dailyQuantities);
      const cname = booking.customerName || "Unknown";
      customerTotals[cname] = (customerTotals[cname] || 0) + qty;
    }

    const customerEntries = Object.entries(customerTotals);
    customerEntries.sort((a, b) => b[1] - a[1]);

    const topCustomers = customerEntries.slice(0, 3).map(([customerName, totalQuantity]) => ({
      customerName,
      totalQuantity,
    }));

    const customerDistribution = customerEntries.map(([customerName, total]) => ({
      customerName,
      total,
      share: (total / totalBookings) * 100,
    }));

    // Monthly Breakdown
    const monthlyBreakdown = processMonthlyBookings(bookings);

    // Weekly Profit/Loss คำนวณโดยใช้ costsPerWeek
    // ถ้าไม่มี costsPerWeek หรือไม่มีต้นทุนระบุสำหรับสัปดาห์นั้น ให้ใช้ cost ดีฟอลต์ เช่น 295
    const defaultCost = 300;
    const weeklyDataWithProfit = processWeeklyBookingsWithProfit(bookings, costsPerWeek || {}, defaultCost);

    // สรุป profit รายเดือนและรายปี
    const yearToUse = year ? Number(year) : new Date().getFullYear();
    const monthlyProfit = calculateMonthlyProfit(bookings, costsPerWeek || {}, defaultCost, yearToUse);
    const yearlyProfit = monthlyProfit.reduce((sum, m) => sum + m.totalProfitOrLoss, 0);

    const result = {
      totalBookings,
      growthRate,
      mostPopularFish,
      topCustomers,
      weeklyBreakdown: weeklyBookings,
      fishRanking,
      customerDistribution,
      monthlyBreakdown,
      weeklyDataWithProfit,
      monthlyProfit,   // รายเดือน
      yearlyProfit     // รวมทั้งปี
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

function processWeeklyBookings(bookings: BookingItem[]) {
  const groupedByWeek: Record<number, { weekNumber: number; weekStart: string; weekEnd: string; totalQuantity: number }> =
    {};

  for (const booking of bookings) {
    const weekNumber = booking.weekNumber;

    if (!groupedByWeek[weekNumber]) {
      groupedByWeek[weekNumber] = {
        weekNumber,
        weekStart: getWeekStartDate(weekNumber),
        weekEnd: getWeekEndDate(weekNumber),
        totalQuantity: 0,
      };
    }

    const totalForBooking = totalFromDailyQuantities(booking.dailyQuantities);
    groupedByWeek[weekNumber].totalQuantity += totalForBooking;
  }

  return Object.values(groupedByWeek).sort((a, b) => a.weekNumber - b.weekNumber);
}

function processWeeklyBookingsWithProfit(bookings: BookingItem[], costsPerWeek: Record<number, number>, defaultCost: number) {
  interface WeeklyData {
    weekNumber: number;
    weekStart: string;
    weekEnd: string;
    totalQuantity: number;
    totalProfitOrLoss: number;
  }

  const groupedByWeek: Record<number, WeeklyData> = {};

  for (const booking of bookings) {
    const weekNumber = booking.weekNumber;
    if (!groupedByWeek[weekNumber]) {
      groupedByWeek[weekNumber] = {
        weekNumber,
        weekStart: getWeekStartDate(weekNumber),
        weekEnd: getWeekEndDate(weekNumber),
        totalQuantity: 0,
        totalProfitOrLoss: 0,
      };
    }

    const totalForBooking = totalFromDailyQuantities(booking.dailyQuantities);
    const bookingPrice = parseFloat(booking.price);
    const costForThisWeek = costsPerWeek[weekNumber] !== undefined ? costsPerWeek[weekNumber] : defaultCost;
    const profitOrLossForBooking = (bookingPrice - costForThisWeek) * totalForBooking;

    groupedByWeek[weekNumber].totalQuantity += totalForBooking;
    groupedByWeek[weekNumber].totalProfitOrLoss += profitOrLossForBooking;
  }

  return Object.values(groupedByWeek).sort((a, b) => a.weekNumber - b.weekNumber);
}

function processMonthlyBookings(bookings: BookingItem[]) {
  const year = new Date().getFullYear();
  const monthlyTotals: number[] = Array(12).fill(0);

  for (const booking of bookings) {
    const date = new Date(booking.createdAt);
    if (date.getFullYear() === year) {
      const monthIndex = date.getMonth();
      const totalForBooking = totalFromDailyQuantities(booking.dailyQuantities);
      monthlyTotals[monthIndex] += totalForBooking;
    }
  }

  return monthlyTotals.map((total, index) => ({ month: index + 1, totalQuantity: total }));
}

// ฟังก์ชั่นคำนวณ profit ต่อเดือนและต่อปี
function calculateMonthlyProfit(bookings: BookingItem[], costsPerWeek: Record<number, number>, defaultCost: number, year: number) {
  // สร้าง structure สำหรับเก็บ profit รายเดือน
  interface MonthlyProfit {
    month: number;
    totalProfitOrLoss: number;
  }

  const monthlyData: MonthlyProfit[] = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, totalProfitOrLoss: 0 }));

  for (const booking of bookings) {
    const date = new Date(booking.createdAt);
    if (date.getFullYear() === year) {
      const monthIndex = date.getMonth();
      const totalForBooking = totalFromDailyQuantities(booking.dailyQuantities);
      const bookingPrice = parseFloat(booking.price);
      const costForThisWeek = costsPerWeek[booking.weekNumber] !== undefined ? costsPerWeek[booking.weekNumber] : defaultCost;
      const profitOrLoss = (bookingPrice - costForThisWeek) * totalForBooking;

      monthlyData[monthIndex].totalProfitOrLoss += profitOrLoss;
    }
  }

  return monthlyData;
}

function totalFromDailyQuantities(dailyQuantities: Prisma.JsonValue): number {
  if (typeof dailyQuantities === "object" && dailyQuantities !== null && !Array.isArray(dailyQuantities)) {
    const dq = dailyQuantities as Record<string, number>;
    return Object.values(dq).reduce((sum, qty) => sum + qty, 0);
  }
  return 0;
}

function getWeekStartDate(weekNumber: number): string {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), 0, 1);
  firstDay.setDate(firstDay.getDate() + (weekNumber - 1) * 7);
  return firstDay.toISOString().split("T")[0];
}

function getWeekEndDate(weekNumber: number): string {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), 0, 1);
  firstDay.setDate(firstDay.getDate() + (weekNumber - 1) * 7 + 6);
  return firstDay.toISOString().split("T")[0];
}

import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

interface BookingItem {
  fishType: string;
  createdAt: Date;
  dailyQuantities: Prisma.JsonValue;
  customerName: string | null;
}

export async function POST(req: Request) {
  try {
    const { userId, role } = await req.json();
    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    const userIdNum = Number(userId);
    const filter: Record<string, unknown> = role !== "admin" ? { userId: userIdNum } : {};

    const bookings = await prisma.booking.findMany({
      where: filter,
      select: {
        fishType: true,
        createdAt: true,
        dailyQuantities: true,
        customerName: true,
      },
    });

    if (bookings.length === 0) {
      return NextResponse.json({ message: "No bookings found" }, { status: 404 });
    }

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

    const fishTotals: Record<string, number> = {};
    for (const booking of bookings) {
      const qty = totalFromDailyQuantities(booking.dailyQuantities);
      fishTotals[booking.fishType] = (fishTotals[booking.fishType] || 0) + qty;
    }

    const mostPopularFish = Object.keys(fishTotals).reduce((a, b) => (fishTotals[a] > fishTotals[b] ? a : b));

    const fishEntries = Object.entries(fishTotals);
    fishEntries.sort((a, b) => b[1] - a[1]);
    const fishRanking = fishEntries.map(([fish, total]) => ({
      fish,
      total,
      share: (total / totalBookings) * 100,
    }));

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

    const monthlyBreakdown = processMonthlyBookings(bookings);

    const result = {
      totalBookings,
      growthRate,
      mostPopularFish,
      topCustomers,
      weeklyBreakdown: weeklyBookings,
      fishRanking,
      customerDistribution,
      monthlyBreakdown,
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
    const weekNumber = getWeekNumber(new Date(booking.createdAt));
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

function totalFromDailyQuantities(dailyQuantities: Prisma.JsonValue): number {
  if (typeof dailyQuantities === "object" && dailyQuantities !== null && !Array.isArray(dailyQuantities)) {
    const dq = dailyQuantities as Record<string, number>;
    return Object.values(dq).reduce((sum, qty) => sum + qty, 0);
  }
  return 0;
}

function getWeekNumber(date: Date): number {
  const startDate = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startDate.getTime();
  return Math.ceil((diff / (1000 * 3600 * 24) + 1) / 7);
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

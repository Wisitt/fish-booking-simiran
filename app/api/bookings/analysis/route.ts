import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface BookingItem {
  fishType: string;
  createdAt: Date;
  dailyQuantities: Record<string, number> | null;
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

    const rawBookings = await prisma.booking.findMany({
      where: filter,
      select: {
        fishType: true,
        createdAt: true,
        dailyQuantities: true,
        customerName: true,
      },
    });

    // Explicitly annotate the type of `booking` in the `.map` function
    const bookings: BookingItem[] = rawBookings.map((booking: {
      fishType: string;
      createdAt: Date;
      dailyQuantities: unknown;
      customerName: string | null;
    }) => ({
      fishType: booking.fishType,
      createdAt: booking.createdAt,
      customerName: booking.customerName,
      dailyQuantities:
        typeof booking.dailyQuantities === "object" && !Array.isArray(booking.dailyQuantities)
          ? (booking.dailyQuantities as Record<string, number>)
          : null,
    }));

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

    const fishRanking = Object.entries(fishTotals)
      .sort(([, totalA], [, totalB]) => totalB - totalA)
      .map(([fish, total]) => ({
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

    const topCustomers = Object.entries(customerTotals)
      .sort(([, totalA], [, totalB]) => totalB - totalA)
      .slice(0, 3)
      .map(([customerName, totalQuantity]) => ({
        customerName,
        totalQuantity,
      }));

    const result = {
      totalBookings,
      growthRate,
      mostPopularFish,
      topCustomers,
      fishRanking,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ message: "Internal Server Error", error }, { status: 500 });
  }
}

function processWeeklyBookings(bookings: BookingItem[]) {
  const groupedByWeek: Record<number, { weekNumber: number; totalQuantity: number }> = {};

  for (const booking of bookings) {
    const weekNumber = getWeekNumber(new Date(booking.createdAt));
    groupedByWeek[weekNumber] = groupedByWeek[weekNumber] || { weekNumber, totalQuantity: 0 };
    groupedByWeek[weekNumber].totalQuantity += totalFromDailyQuantities(booking.dailyQuantities);
  }

  return Object.values(groupedByWeek);
}

function totalFromDailyQuantities(dailyQuantities: Record<string, number> | null): number {
  if (!dailyQuantities) return 0;
  return Object.values(dailyQuantities).reduce((sum, qty) => sum + qty, 0);
}

function getWeekNumber(date: Date): number {
  const startDate = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startDate.getTime();
  return Math.ceil((diff / (1000 * 3600 * 24) + 1) / 7);
}

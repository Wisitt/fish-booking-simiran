// app/api/announcements/history/route.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where = {
      ...(startDate && endDate ? {
        AND: [
          { startDate: { gte: new Date(startDate) } },
          { endDate: { lte: new Date(endDate) } }
        ]
      } : {})
    };

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return new Response(JSON.stringify(announcements), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Unable to fetch announcements." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

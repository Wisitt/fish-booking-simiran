// app/api/user/announcements/current/route.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const currentDate = new Date();
    
    const currentAnnouncement = await prisma.announcement.findFirst({
      where: {
        startDate: {
          lte: currentDate
        },
        endDate: {
          gte: currentDate
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return new Response(JSON.stringify(currentAnnouncement), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Unable to fetch current announcement." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

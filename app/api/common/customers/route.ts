import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  const customers = await prisma.customer.findMany();
  return NextResponse.json(customers);
}

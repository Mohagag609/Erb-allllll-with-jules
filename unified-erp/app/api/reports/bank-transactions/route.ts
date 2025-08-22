import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const type = searchParams.get('type');
  const bankName = searchParams.get('bankName');

  const items = await prisma.bankImport.findMany({
    where: {
      AND: [
        startDate ? { date: { gte: new Date(startDate) } } : {},
        endDate ? { date: { lte: new Date(endDate) } } : {},
        type ? { type } : {},
        bankName ? { bankName } : {},
      ],
    },
    orderBy: { date: 'desc' },
  });
  return NextResponse.json(items);
}
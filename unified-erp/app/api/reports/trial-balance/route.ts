import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const lines = await prisma.journalLine.findMany({
    include: { account: true, entry: true },
    where: {
      entry: {
        date: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        }
      }
    }
  });

  const map = new Map<string, { code: string; name: string; debit: number; credit: number }>();
  for (const l of lines as any[]) {
    const key = l.accountId;
    const acc = l.account;
    const item = map.get(key) || { code: acc.code, name: acc.name, debit: 0, credit: 0 };
    item.debit += Number(l.debit || 0);
    item.credit += Number(l.credit || 0);
    map.set(key, item);
  }

  const result = Array.from(map.values());
  return NextResponse.json(result);
}
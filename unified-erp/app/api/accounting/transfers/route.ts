import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createTransfer } from "@/services/accounting/transfers";

export async function GET() {
  const items = await prisma.transfer.findMany({ include: { fromCashbox: true, toCashbox: true }, orderBy: { date: 'desc' } });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const form = new FormData();
    form.append('fromCashboxId', body.fromCashboxId);
    form.append('toCashboxId', body.toCashboxId);
    form.append('date', new Date(body.date).toISOString());
    form.append('amount', String(body.amount));
    if (body.note) form.append('note', body.note);
    await createTransfer(form);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
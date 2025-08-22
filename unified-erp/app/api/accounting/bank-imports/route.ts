import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createBankImport, matchInstallments } from "@/services/accounting/bank-imports";

export async function GET() {
  const items = await prisma.bankImport.findMany({ orderBy: { date: 'desc' } });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const form = new FormData();
    form.append('date', new Date(body.date).toISOString());
    form.append('amount', String(body.amount));
    form.append('type', body.type);
    if (body.reference) form.append('reference', body.reference);
    if (body.bankName) form.append('bankName', body.bankName);
    if (body.description) form.append('description', body.description);
    await createBankImport(form);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (body.action === 'match') {
      await matchInstallments();
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: 'unknown action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
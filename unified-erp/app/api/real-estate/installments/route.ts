import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const installments = await prisma.installment.findMany({ orderBy: { dueDate: 'asc' } });
  return NextResponse.json(installments);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) throw new Error('id required');
    const updated = await prisma.installment.update({ where: { id: body.id }, data: { status: 'PAID', paidAt: new Date() } });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
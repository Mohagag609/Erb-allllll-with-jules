import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createContract } from "@/services/real-estate/contracts";

export async function GET() {
  const contracts = await prisma.contract.findMany({
    include: { client: true, unit: true, installments: true },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(contracts);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const form = new FormData();
    form.append('clientId', body.clientId);
    form.append('unitId', body.unitId);
    form.append('startDate', new Date(body.startDate).toISOString());
    form.append('totalAmount', String(body.totalAmount));
    form.append('downPayment', String(body.downPayment));
    form.append('months', String(body.months));
    form.append('planType', body.planType);
    if (body.notes) form.append('notes', body.notes);

    const contract = await createContract(form);
    return NextResponse.json(contract, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const items = await prisma.cashbox.findMany({ include: { project: true, account: true }, orderBy: { code: 'asc' } });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const item = await prisma.cashbox.create({ data: {
      code: body.code,
      name: body.name,
      projectId: body.projectId ?? undefined,
      accountId: body.accountId,
      branch: body.branch ?? undefined,
    }});
    return NextResponse.json(item, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const units = await prisma.unit.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(units);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const unit = await prisma.unit.create({ data: {
      code: body.code,
      type: body.type,
      area: body.area ?? undefined,
      price: body.price,
      status: body.status ?? 'available',
      description: body.description ?? undefined,
    }});
    return NextResponse.json(unit, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
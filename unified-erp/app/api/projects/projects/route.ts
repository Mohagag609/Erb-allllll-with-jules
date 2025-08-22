import { NextResponse } from "next/server";
import { getProjects, createProject } from "@/services/projects/projects";

export async function GET() {
  const items = await getProjects();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const form = new FormData();
    form.append('code', body.code);
    form.append('name', body.name);
    if (body.status) form.append('status', body.status);
    form.append('startDate', new Date(body.startDate).toISOString());
    if (body.endDate) form.append('endDate', new Date(body.endDate).toISOString());
    if (body.budget !== undefined) form.append('budget', String(body.budget));
    await createProject(form);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
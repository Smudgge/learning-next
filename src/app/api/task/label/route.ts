import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const SearchSchema = z.object({
  limit: z.coerce.number().int().positive().optional().default(10),
  name: z.string().optional()
});

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const result = SearchSchema.safeParse(params);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', details: result.error.flatten() },
      { status: 400 }
    );
  }

  const users = await prisma.label.findMany({
    where: { name: { contains: result.data.name || '', mode: 'insensitive', }},
    select: { id: true, name: true },
    take: result.data.limit,
  })
  return NextResponse.json(users)
}

const AssignSchema = z.object({
  taskId: z.string().min(1),
  labelId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const result = AssignSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid body", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { taskId, labelId } = result.data;

  const existingTaskLabel = await prisma.taskLabel.findUnique({
    where: { taskId_labelId: { taskId, labelId } },
  });

  if (existingTaskLabel) {
    await prisma.taskLabel.delete({
      where: { taskId_labelId: { taskId, labelId } },
    });
    return NextResponse.json({ labeled: false });
  }

  await prisma.taskLabel.create({
    data: { taskId, labelId },
  });
  return NextResponse.json({ labeled: true });
}
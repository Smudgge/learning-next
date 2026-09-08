import { auth } from "@/auth";
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const SearchSchema = z.object({
  limit: z.coerce.number().int().positive().optional().default(10),
  name: z.string().optional(),
  status: z.string().optional(),
  assignees: z.string().optional(),
  labels: z.string().optional(),
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

  const where = {} as any

  // Filter task name
  if (result.data.name) {
    where['name'] = { contains: result.data.name, mode: 'insensitive' }
  }

  // Filter status
  if (result.data.status) {
    where['status'] = result.data.status
  }

  // Filter assignees
  if (result.data.assignees) {
    const names = result.data.assignees.split(',').map((n) => n.trim()).filter(Boolean)
    if (names.length) {
      where['assignments'] = {
        some: { user: { name: { in: names } } }
      }
    }
  }

  // Filter labels
  if (result.data.labels) {
    const names = result.data.labels.split(',').map((n) => n.trim()).filter(Boolean)
    if (names.length) {
      where['labels'] = {
        some: { label: { name: { in: names } } }
      }
    }
  }

  const tasks = await prisma.task.findMany({
    where,
    take: result.data.limit,
    include: {
      assignments: { include: { user: true } },
      labels: { include: { label: true } }
    }
  })
  return NextResponse.json(tasks)
}
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
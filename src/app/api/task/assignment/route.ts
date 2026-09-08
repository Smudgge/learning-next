import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const AssignSchema = z.object({
  taskId: z.string().min(1),
  userId: z.string().min(1),
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

  const { taskId, userId } = result.data;

  const existingTaskAssignment = await prisma.taskAssignment.findUnique({
    where: { taskId_userId: { taskId, userId } },
  });

  if (existingTaskAssignment) {
    await prisma.taskAssignment.delete({
      where: { taskId_userId: { taskId, userId } },
    });
    return NextResponse.json({ assigned: false });
  }

  await prisma.taskAssignment.create({
    data: { taskId, userId },
  });
  return NextResponse.json({ assigned: true });
}
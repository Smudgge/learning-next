import { auth } from "@/auth";
import { TaskStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const AssignSchema = z.object({
  taskId: z.string().min(1),
  status: z.string(),
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

  const { taskId, status } = result.data;

  await prisma.task.update({
    where: { id: taskId },
    data: { status: status as TaskStatus },
  });
  return NextResponse.json({ assigned: true });
}
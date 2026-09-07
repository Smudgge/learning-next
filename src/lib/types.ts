import type { Prisma } from "@/generated/prisma/client"

type TaskExpanded = Prisma.TaskGetPayload<{
  include: {
    assigned: { select: { id: true; name: true; email: true } }
    labels: { include: { label: true } }
  }
}>

export type TaskExpandedJSON = Omit<TaskExpanded, "created" | "dueDate"> & {
  created: string
  dueDate: string | null
}
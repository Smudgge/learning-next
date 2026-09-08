import type { Prisma } from "@/generated/prisma/client"

type TaskExpanded = Prisma.TaskGetPayload<{
  include: {
    assignments: { include: { user: true }}
    labels: { include: { label: true } }
  }
}>

export type TaskExpandedJSON = Omit<TaskExpanded, "created" | "dueDate"> & {
  created: string
  dueDate: string | null
}

export type TaskAssignmentExpanded = Prisma.TaskAssignmentGetPayload<{
  include: {
    user: true
  }
}>

export type TaskLabelExpanded = Prisma.TaskLabelGetPayload<{
  include: {
    label: true
  }
}>
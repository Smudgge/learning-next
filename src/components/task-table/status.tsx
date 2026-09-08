import { TaskStatus } from "@/generated/prisma/client";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";

export default function TaskStatusComponent({ status }: { status: TaskStatus }) {

  if (status == "DONE") {
    return (
      <Badge variant="secondary" className="px-1.5 bg-green-400/20 text-green-600 dark:text-green-400 font-bold">
        Done
      </Badge>
    )
  }
  if (status == "IN_PROGRESS") {
    return (
      <Badge variant="secondary" className="px-1.5 bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 font-bold">
        In Progress
      </Badge>
    )
  }
  if (status == "TODO") {
    return (
      <Badge variant="secondary" className="px-1.5 bg-purple-400/20 text-purple-600 dark:text-purple-400 font-bold">
        Todo
      </Badge>
    )
  }

  return <Label>No display implementation for {status}</Label>
}
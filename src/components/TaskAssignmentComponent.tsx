import { TaskAssignment } from "@/generated/prisma/client";
import { Label } from "./ui/label";

export default function TaskAssignmentComponent({ assignments }: {assignments: TaskAssignment[]}) {
  if (!assignments || assignments.length == 0) {
    return <Label></Label>
  }
  if (assignments.length == 1) {
    return <div></div>
  }
  return <div></div>
}
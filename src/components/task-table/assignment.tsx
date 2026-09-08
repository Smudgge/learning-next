import { Label } from "../ui/label";
import { Avatar, AvatarImage } from "../ui/avatar";
import { TaskAssignmentExpanded } from "@/lib/types";

export default function TaskAssignmentComponent({ assignments }: { assignments: TaskAssignmentExpanded[] }) {
  if (!assignments || assignments.length == 0) {
    return <Label></Label>
  }
  if (assignments.length == 1) {
    return (
      <Label className="flex-1 font-bold" htmlFor={assignments[0].user.name || ''}>
        <Avatar size="sm" className="flex items-center justify-center">
          <AvatarImage
            src="https://github.com/smudgge.png"
            alt="@smudgge"
            className="grayscale"
          />
        </Avatar>
        {assignments[0].user.name}
      </Label>
    )
  }
  return <div></div>
}
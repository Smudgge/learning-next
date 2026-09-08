import { Label as LabelFromPrisma } from "@/generated/prisma/client";
import { Badge } from "../ui/badge";

export default function TaskLabelComponent({ label }: { label: LabelFromPrisma }) {
  return (
    <Badge variant="secondary" className="px-1.5 bg-blue-400/20 text-blue-600 dark:text-blue-400 font-bold">
      {label.name}
    </Badge>
  )
}
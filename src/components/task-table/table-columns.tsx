import { createColumnHelper } from "@tanstack/react-table";
import { features } from "./table-features";
import { TaskExpandedJSON } from "@/lib/types";
import { Label } from "../ui/label";
import { useEffect, useState } from "react";
import { TaskStatus, User } from "@/generated/prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import TaskAssignmentComponent from "./assignment";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Toggle } from "../ui/toggle";
import { Checkbox } from "../ui/checkbox";
import { Avatar, AvatarImage } from "../ui/avatar";
import TaskStatusComponent from "./status";

const columnHelper = createColumnHelper<typeof features, TaskExpandedJSON>()

export const columns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: "Name",
    enableHiding: false,
    cell: ({ row }) => (
      <Label className="px-2 py-3">{row.original.name}</Label>
    )
  }),
  columnHelper.accessor("assignments", {
    header: "Assignees",
    enableHiding: false,
    cell: ({ row }) => {
      const [search, setSearch] = useState<string>()
      const [users, setUsers] = useState<User[]>([])

      useEffect(() => {
        const params = new URLSearchParams()
        params.set("limit", '5')
        if (search) params.set("name", search)

        fetch(`/api/users?${params.toString()}`)
          .then((res) => res.json())
          .then((data) => setUsers(data))
          .catch(() => {
            setUsers([])
          })
      }, [search])

      return <Select
        value={`${row.original.assignments}`}
        onValueChange={(value) => {

        }}
      >
        <SelectTrigger className="w-full bg-transparent dark:bg-transparent border-0">
          <TaskAssignmentComponent assignments={row.original.assignments}/>
        </SelectTrigger>
        <SelectContent side="top" className="w-52">
          <div>
            {/** Title */}
            <Label className="p-3 font-bold">Add assignees</Label>
            {/* Search bar */}
            <div className="px-2 pb-3">
              <Search className="pointer-events-none absolute left-[20px] top-[41px] translate-y-1 h-4 w-4 opacity-50" />
              <Input
                placeholder="Search"
                className="border-2 pl-8 border-muted focus-visible:border-blue-400 shadow-none focus-visible:ring-0 h-8"
                onKeyDown={(e) => e.stopPropagation()}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Separator />
            {/** Users */}
            <div className="p-3 min-h-20">
              {users.map((user) => (
                <Toggle className="w-full flex items-center justify-start gap-2">
                  <Checkbox id={user.name || ''}/>
                  <Label className="flex-1 font-bold" htmlFor={user.name || ''}>
                    <Avatar size="sm" className="flex items-center justify-center">
                      <AvatarImage
                        src="https://github.com/smudgge.png"
                        alt="@smudgge"
                        className="grayscale"
                      />
                    </Avatar>
                    {user.name}
                  </Label>
                </Toggle>
              ))}
              {users.length == 0 &&
                <Label className="px-3 pb-3 font-bold">No Matches</Label>
              }
            </div>
          </div>
        </SelectContent>
      </Select>
    }
  }),
  columnHelper.accessor("status", {
    header: "Status",
    enableHiding: false,
    cell: ({ row }) => (
      <Select
        value={`${row.original.status}`}
        onValueChange={(value) => {

        }}
      >
        <SelectTrigger className="w-full bg-transparent dark:bg-transparent border-0">
          <TaskStatusComponent status={row.original.status}/>
        </SelectTrigger>
        <SelectContent side="top">
          {["TODO", "IN_PROGRESS", "DONE"].map((status, index, arr) => (
            <div key={status}>
              <SelectItem value={`${status}`}>
                <TaskStatusComponent status={status as TaskStatus} />
              </SelectItem>
            </div>
          ))}
        </SelectContent>
      </Select>
    ),
  }),
  columnHelper.accessor("labels", {
    header: "Labels",
    enableHiding: false,
  }),
  columnHelper.accessor("dueDate", {
    header: "Due date",
    enableHiding: false,
  }),
  columnHelper.accessor("created", {
    header: "Created",
    enableHiding: false,
    cell: ({ row }) => (
      <Label>{new Date(row.original.created).toLocaleString()}</Label>
    )
  }),
])

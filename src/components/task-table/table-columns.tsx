import { createColumnHelper } from "@tanstack/react-table";
import { features } from "./table-features";
import { TaskExpandedJSON } from "@/lib/types";
import { Label } from "../ui/label";
import { useEffect, useState } from "react";
import { Label as LabelFromPrisma, TaskLabel, TaskStatus, User } from "@/generated/prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import TaskAssignmentComponent from "./assignment";
import { DotSquare, EllipsisVertical, SearchIcon } from "lucide-react";
import { Separator } from "../ui/separator";
import { Toggle } from "../ui/toggle";
import { Checkbox } from "../ui/checkbox";
import { Avatar, AvatarImage } from "../ui/avatar";
import TaskStatusComponent from "./status";
import TaskLabelComponent from "./label";
import { format } from "date-fns";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";

const columnHelper = createColumnHelper<typeof features, TaskExpandedJSON>()

export const columns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: "Name",
    enableHiding: false,
    cell: ({ row }) => (
      <Label className="px-2 py-3 truncate">{row.original.name}</Label>
    )
  }),
  columnHelper.accessor("assignments", {
    header: "Assignees",
    enableHiding: false,
    cell: ({ row }) => {
      const [search, setSearch] = useState<string>()
      const [users, setUsers] = useState<User[]>([])
      const queryClient = useQueryClient()

      useEffect(() => {
        const params = new URLSearchParams()
        params.set("limit", '5')
        if (search) params.set("name", search)

        fetch(`/api/user?${params.toString()}`)
          .then((res) => res.json())
          .then((data) => setUsers(data))
          .catch(() => {
            setUsers([])
          })
      }, [search])

      const { mutate: toggleUser } = useMutation({
        mutationFn: (user: User) =>
          fetch(`/api/task/assignment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskId: row.original.id, userId: user.id }),
          }),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["tasks"] })
        },
      })

      return (
        <Select
          multiple
          value={row.original.assignments}
          onValueChange={(value) => {
          }}
        >
          <SelectTrigger className="w-full bg-transparent dark:bg-transparent border-0">
            <TaskAssignmentComponent assignments={row.original.assignments}/>
          </SelectTrigger>
          <SelectContent side="top" className="w-52">
            <div>
              {/** Title */}
              <Label className="p-3 font-bold">Select assignees</Label>
              {/* Search bar */}
              <div className="px-2 pb-3">
                <InputGroup>
                  <InputGroupInput
                    id="inline-start-input" 
                    placeholder="Search..." 
                    onKeyDown={(e) => e.stopPropagation()}
                    onChange={(e) => setSearch(e.target.value)} 
                  />
                  <InputGroupAddon align="inline-start">
                    <SearchIcon className="text-muted-foreground" />
                  </InputGroupAddon>
                </InputGroup>
              </div>
              <Separator />
              {/** Users */}
              <div className="p-3 min-h-20">
                {users.map((user) => {
                  const isAssigned = row.original.assignments.find((a) => a.userId == user.id) != null
                  return (
                    <Toggle
                      className="w-full flex items-center justify-start gap-2"
                      pressed={isAssigned}
                      onPressedChange={() => toggleUser(user)}
                    >
                      <Checkbox id={user.name || ''} checked={isAssigned} />
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
                  )
                })}
                {users.length == 0 &&
                  <Label className="px-3 pb-3 font-bold">No Matches</Label>
                }
              </div>
            </div>
          </SelectContent>
        </Select>
      )
    }
  }),
  columnHelper.accessor("status", {
    header: "Status",
    enableHiding: false,
    cell: ({ row }) => {
      const queryClient = useQueryClient()

      const { mutate: setStatus } = useMutation({
        mutationFn: (status: TaskStatus) =>
          fetch(`/api/task/status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskId: row.original.id, status }),
          }),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["tasks"] })
        },
      })

      return (
        <Select
          value={row.original.status}
          onValueChange={(value) => setStatus(value as TaskStatus)}
        >
          <SelectTrigger className="w-full bg-transparent dark:bg-transparent border-0">
            <TaskStatusComponent status={row.original.status}/>
          </SelectTrigger>
          <SelectContent side="top">
            <div>
              {/** Title */}
              <Label className="p-3 font-bold">Set status</Label>
              <Separator />
              {/** Status's */}
              <div className="p-3 min-h-20">
                {["TODO", "IN_PROGRESS", "DONE"].map((status, index, arr) => (
                  <div key={status}>
                    <SelectItem value={`${status}`}>
                      <TaskStatusComponent status={status as TaskStatus} />
                    </SelectItem>
                  </div>
                ))}
              </div>
            </div>
          </SelectContent>
        </Select>
      )
    },
  }),
  columnHelper.accessor("labels", {
    header: "Labels",
    enableHiding: false,
    cell: ({ row }) => {
      const [search, setSearch] = useState<string>()
      const [labels, setLabels] = useState<LabelFromPrisma[]>([])
      const queryClient = useQueryClient()

      useEffect(() => {
        const params = new URLSearchParams()
        params.set("limit", '5')
        if (search) params.set("name", search)

        fetch(`/api/task/label?${params.toString()}`)
          .then((res) => res.json())
          .then((data) => setLabels(data))
          .catch(() => {
            setLabels([])
          })
      }, [search])

      const { mutate: toggleLabel } = useMutation({
        mutationFn: (label: LabelFromPrisma) =>
          fetch(`/api/task/label`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskId: row.original.id, labelId: label.id }),
          }),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["tasks"] })
        },
      })

      return <Select
        multiple
        value={row.original.labels}
        onValueChange={(value) => {
        }}
      >
        <SelectTrigger className="w-full bg-transparent dark:bg-transparent border-0">
          {row.original.labels.map((taskLabel) => (
            <TaskLabelComponent key={taskLabel.labelId} label={taskLabel.label} />
          ))}
        </SelectTrigger>
        <SelectContent side="top" className="w-52">
          <div>
            {/** Title */}
            <Label className="p-3 font-bold">Select labels</Label>
            {/* Search bar */}
            <div className="px-2 pb-3">
              <InputGroup>
                <InputGroupInput
                  id="inline-start-input" 
                  placeholder="Search..." 
                  onKeyDown={(e) => e.stopPropagation()}
                  onChange={(e) => setSearch(e.target.value)} 
                />
                <InputGroupAddon align="inline-start">
                  <SearchIcon className="text-muted-foreground" />
                </InputGroupAddon>
              </InputGroup>
            </div>
            <Separator />
            {/** Labels */}
            <div className="p-3 min-h-20">
              {labels.map((label) => {
                const isLabeled = row.original.labels.find((a) => a.labelId == label.id) != null
                return (
                  <Toggle 
                    className="w-full flex items-center justify-start gap-2"
                    onPressedChange={() => toggleLabel(label)}
                    pressed={isLabeled}
                  >
                    <Checkbox id={label.name || ''} checked={isLabeled} />
                    <Label className="flex-1" htmlFor={label.name || ''}>
                      <TaskLabelComponent label={label} />
                    </Label>
                  </Toggle>
                )
              })}
              {labels.length == 0 &&
                <Label className="px-3 pb-3 font-bold">No Matches</Label>
              }
            </div>
          </div>
        </SelectContent>
      </Select>
    }
  }),
  columnHelper.accessor("dueDate", {
    header: "Due date",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="px-2">
        <Label className="truncate">{format(new Date(row.original.dueDate as string), 'HH:MM, MMM d, yyyy')}</Label>
      </div>
    )
  }),
  columnHelper.accessor("created", {
    header: "Created",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="px-2">
        <Label className="truncate">{format(new Date(row.original.created), 'MM/dd/yyyy')}</Label>
      </div>
    )
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => {
      const queryClient = useQueryClient()

      const { mutate: deleteTask } = useMutation({
        mutationFn: (label: LabelFromPrisma) =>
          fetch(`/api/task`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskId: row.original.id }),
          }),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["tasks"] })
        },
      })

      return (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              className="flex size-8 text-muted-foreground"
              size="icon"
            >
              <EllipsisVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem variant="destructive" onClick={deleteTask}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  }),
])

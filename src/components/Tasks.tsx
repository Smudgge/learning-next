"use client"

import { TaskExpandedJSON } from "@/lib/types";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react";
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  FlexRender,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"
import TaskStatusComponent from "./TaskStatusComponent";
import { TaskStatus, User } from "@/generated/prisma/client";
import TaskAssignmentComponent from "./TaskAssignmentComponent";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Checkbox } from "./ui/checkbox";
import { Toggle } from "./ui/toggle";

const features = tableFeatures({
  columnFilteringFeature,  // Column filtering
  columnVisibilityFeature, // Show/hide columns
  rowPaginationFeature,    // Page state and controle
  rowSortingFeature,       // Sorting
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
})

const columnHelper = createColumnHelper<typeof features, TaskExpandedJSON>()

const columns = columnHelper.columns([
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
    header: "Due Date",
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

export default function Tasks() {
  const [loading, setLoading] = useState<boolean>(true)
  const [tasks, setTasks] = useState<TaskExpandedJSON[]>([])

  const table = useTable({
    features,
    data: tasks,
    columns,
  })

  useEffect(() => {
    fetch("/api/tasks")
      .then(async (response) => {
        const data = await response.json()
        setTasks(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <>
    {/** Table */}
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-muted">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder ? null : (
                    <FlexRender header={header} />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        {/** Table Body */}
        <TableBody>
          {/** Rows exist. */}
          {table.getRowModel().rows?.length && (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="p-0">
                    <FlexRender cell={cell}/>
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
          {/** No rows exist. */}
          {!table.getRowModel().rows?.length && (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
    {/** Pagination */}
    <div className="flex items-center justify-end gap-8 m-4">
      {/** Rows per page */}
      <div className="hidden lg:flex items-center gap-2">
        <Label htmlFor="rows-per-page" className="text-sm font-medium">
          Rows per page
        </Label>
        <Select
          value={`${table.state.pagination.pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value))
          }}
        >
          <SelectTrigger size="sm" className="w-20" id="rows-per-page">
            <SelectValue placeholder={table.state.pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 25, 50, 100].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/** Page 1 of 1 */}
      <div className="flex w-fit items-center justify-center text-sm font-medium">
        Page {table.state.pagination.pageIndex + 1} of{" "}
        {table.getPageCount()}
      </div>
      {/** Change page */}
      <div className="ml-auto flex items-center gap-2 lg:ml-0">
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <span className="sr-only">Go to first page</span>
          <ChevronsLeft />
        </Button>
        <Button
          variant="outline"
          className="size-8"
          size="icon"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          className="size-8"
          size="icon"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight />
        </Button>
        <Button
          variant="outline"
          className="hidden size-8 lg:flex"
          size="icon"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <span className="sr-only">Go to last page</span>
          <ChevronsRight />
        </Button>
      </div>
    </div>
    </>
  )
}
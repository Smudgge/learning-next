"use client"

import { TaskExpandedJSON } from "@/lib/types";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Circle, CircleCheck, Loader } from "lucide-react";
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
import { TaskStatus } from "@/generated/prisma/client";

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
  }),
  columnHelper.accessor("assigned", {
    header: "Assigned",
    enableHiding: false,
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
        <SelectTrigger className="w-full border-0">
          <TaskStatusComponent status={row.original.status}/>
        </SelectTrigger>
        <SelectContent side="top">
          {["TODO", "IN_PROGRESS", "DONE"].map((status) => (
            <SelectItem key={status} value={`${status}`}>
              <TaskStatusComponent status={status as TaskStatus}/>
            </SelectItem>
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
                  <TableCell key={cell.id}>
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
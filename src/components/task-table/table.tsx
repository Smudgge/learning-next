"use client"

import { TaskExpandedJSON } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import {
    FlexRender,
    useTable
} from "@tanstack/react-table";
import { Input } from "../ui/input";
import { ButtonGroup } from "../ui/button-group";
import { features } from "./table-features";
import { columns } from "./table-columns";
import { cn } from "@/lib/utils";
import { keyof } from "zod/v4";

const groups = [ 'Not grouped', 'Assignees', 'Status', 'Labels', 'Due date' ] as const
type Group = (typeof groups)[number]

function extractGroupKeysFromTask(task: TaskExpandedJSON, group: Group): string[] {
  switch (group) {
    case "Status":
      return [task.status]
    case "Assignees":
      return task.assignments?.length
        ? task.assignments.map((a) => a.user?.name ?? "Unknown")
        : ["Unassigned"]
    case "Labels":
      return task.labels.length ? task.labels.map(l => l.label.name) : ["No label"]
    case "Due date":
      return [task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"]
    default:
      return ["__all__"]
  }
}

function ColumnSize() {
  return (
    <colgroup>
      <col style={{ width: "30%" }} /> {/** Name */}
      <col style={{ width: "18%" }} /> {/** Asignees */}
      <col style={{ width: "18%" }} /> {/** Status */}
      <col style={{ width: "18%" }} /> {/** Labels */}
      <col style={{ width: "18%" }} /> {/** Due date */}
      <col style={{ width: "14%" }} /> {/** Created */}
    </colgroup>
  )
}

export default function TaskTable() {
  const [loading, setLoading] = useState<boolean>(true)
  const [tasks, setTasks] = useState<TaskExpandedJSON[]>([])
  const [group, setGroup] = useState<Group>('Not grouped')
  const [pageSizeCache, setPageSizeCache] = useState<number>(10)

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

  const groupedRows = useMemo(() => {
    if (group === "Not grouped") return null
    const rows = table.getRowModel().rows
    const map = new Map<string, typeof rows>()
    for (const row of rows) {
      for (const key of extractGroupKeysFromTask(row.original, group)) {
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(row)
      }
    }
    return map.entries()
  }, [tasks, group])

  if (loading) return <p>Loading...</p>

  return (
    <>
    {/** Top Filtering and Grouping */}
    <div className="flex items-center justify-start gap-8 my-4">
      {/** Filter */}
      <div>
        <ButtonGroup>
          <Input id="input-button-group" placeholder="Filter" />
          <Button variant="outline">Add</Button>
        </ButtonGroup>
      </div>
      {/** Group By */}
      <div>
        <ButtonGroup>
        <Select
          value={group}
          onValueChange={(value) => {
            if (value !== 'Not grouped') {
              table.setPageSize(100)
            } else {
              table.setPageSize(pageSizeCache)
            }
            setGroup(value as Group)
          }}
        >
          <SelectTrigger>
            {group === 'Not grouped' ? 'Group by' : group}
          </SelectTrigger>
          <SelectContent side="top">
            {groups.filter((group) => group !== 'Not grouped').map((group) => (
              <SelectItem key={group} value={group}>
                {group}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() =>{
          setGroup('Not grouped')
          table.setPageSize(pageSizeCache)
        }}>
          Reset
        </Button>
        </ButtonGroup>
      </div>
    </div>
    {/** Table - Not Grouped */}
    {group === 'Not grouped' && <div className="overflow-hidden rounded-lg border">
      <Table className="table-fixed">
        <ColumnSize />
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
    </div>}
    {/** Table - Grouped */}
    {group !== 'Not grouped' && groupedRows!.map(([key, rows], groupIndex) => (
      <div className="overflow-hidden rounded-lg border mb-8">
        <Table className="table-fixed">
          <ColumnSize />
          {groupIndex === 0 &&
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
          }
          {/** Table Body */}
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="p-0">
                    <FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    ))}
    {/** Pagination */}
    {group === 'Not grouped' && <div className="flex items-center justify-end gap-8 m-4">
      {/** Rows per page */}
      <div className="hidden lg:flex items-center gap-2">
        <Label htmlFor="rows-per-page" className="text-sm font-medium">
          Rows per page
        </Label>
        <Select
          value={`${table.state.pagination.pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value))
            setPageSizeCache(Number(value))
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
    </div>}
    </>
  )
}
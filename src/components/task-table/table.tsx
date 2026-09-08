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
import { ButtonGroup } from "../ui/button-group";
import { features } from "./table-features";
import { columns } from "./table-columns";
import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxList } from "../ui/combobox";
import { Separator } from "../ui/separator";
import TaskFilterComponent from "./filter";

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

const groups = [ 'Not grouped', 'Assignees', 'Status', 'Labels', 'Due date' ] as const
type Group = (typeof groups)[number]

const filterableGroups = [ 'Assignees', 'Status', 'Labels' ] as const
type FilterableGroup = (typeof filterableGroups)[number]

export type Filter = {
  id: string
  type: FilterableGroup | "Name"
  name: string
}

/**
 * Currently if you filter mutliple of the same type it will
 * only apply one of them. For example if you filter by TODO and DONE
 * it will only filter by DONE or TODO.
 */
export default function TaskTable() {
  const [loading, setLoading] = useState<boolean>(true)
  const [tasks, setTasks] = useState<TaskExpandedJSON[]>([])
  const [group, setGroup] = useState<Group>('Not grouped')
  const [filterSearchValue, setFilterSearchValue] = useState('')
  const [filters, setFilters] = useState<Filter[]>([])

  // When using 'group by' it sets page size to 100.
  // This is to remember what it was before, when switching back.
  const [pageSizeCache, setPageSizeCache] = useState<number>(10)

  const table = useTable({
    features,
    data: tasks,
    columns,
  })

  useEffect(() => {
    const params = new URLSearchParams()
    for (const filter of filters) {
      params.set(filter.type.toLocaleLowerCase(), filter.name)
    }
    fetch(`/api/tasks?${params}`)
      .then(async (response) => {
        const data = await response.json()
        setTasks(data)
        setLoading(false)
      })
  }, [filters])

  const groupedRows = useMemo(() => {
    if (group === "Not grouped") return null
    const rows = table.getRowModel().rows
    const map = new Map<string, typeof rows>() // key: rows
    for (const row of rows) {
      for (const key of extractGroupKeysFromTask(row.original, group)) {
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(row)
      }
    }
    return map.entries()
  }, [tasks, group])

  const allFilterOptions = useMemo(() => {
    const seen = new Map<string, Filter>() // filter_id: Filter
    for (const task of tasks) {
      for (const filterGroup of filterableGroups) {
        for (const value of extractGroupKeysFromTask(task, filterGroup)) {
          const id = `${filterGroup}:${value}`
          if (!seen.has(id)) seen.set(id, { id, type: filterGroup, name: value })
        }
      }
    }
    // return Filter[]
    return [...seen.values()]
  }, [tasks])

  const matchingFilterOptions = useMemo(() => {
    const query = filterSearchValue.trim().toLowerCase()
    const matches = allFilterOptions.filter((option) =>
        (!query || option.name.toLowerCase().includes(query)) && // Matches query, or all if no query
        !filters.some((filter) => filter.id === option.id) // Remove already selected filters
    )
    // return [{ type, items }, ...]
    return filterableGroups
      .map((type) => ({ type, items: matches.filter((match) => match.type === type) }))
      .filter((g) => g.items && g.items.length > 0)
  }, [filters, filterSearchValue, allFilterOptions])

  const addFilterUsingInput = () => {
    const value = filterSearchValue.trim()
    if (!value) return

    if (matchingFilterOptions.length > 0) {
      const firstSuggestion = matchingFilterOptions[0].items[0]
      if (firstSuggestion.name.toLocaleLowerCase() == value.toLocaleLowerCase()) {
        setFilters((prev) =>
          [...prev, matchingFilterOptions[0].items[0]]
        )
        setFilterSearchValue('')
        return
      }
    }
    // Otherwise create name filter
    const id = `Name:${value}`
    setFilters((prev) =>
      [...prev, { id, type: 'Name', name: value }]
    )
    setFilterSearchValue('')
  }

  if (loading) return <p>Loading...</p>

  return (
    <>
    {/** Top Filtering and Grouping */}
    <div className="flex items-center justify-start gap-8 my-4">
      {/** Filter */}
      <div>
        <ButtonGroup>
          <Combobox
            multiple
            value={filters}
            onValueChange={(newFilters: Filter[]) => setFilters(newFilters)}
            inputValue={filterSearchValue}
            onInputValueChange={setFilterSearchValue}
            itemToStringLabel={(item: Filter) => item.name}
          >
            <ComboboxChips>
              {filters && filters.map((filter) => (
                <ComboboxChip key={filter.id}>{filter.name}</ComboboxChip>
              ))}
              <ComboboxChipsInput 
                placeholder="Filter by name, status, assignee, label..."
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter' && filterSearchValue.trim()) {
                    e.preventDefault()
                    addFilterUsingInput()
                  }
                }} 
              />
            </ComboboxChips>
            <ComboboxContent>
              <ComboboxList>
                {matchingFilterOptions.length >= 0 && matchingFilterOptions.map((group, i) => (
                  <div key={group.type} className="py-1">
                    {i > 0 && <Separator />}
                    <Label className="px-2 py-1 text-xs font-medium text-muted-foreground">
                      {group.type}
                    </Label>
                    {group.items.map((filter) => (
                      <div className="px-3" key={filter.id}>
                        <TaskFilterComponent filter={filter} />
                      </div>
                    ))}
                  </div>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          <Button variant="outline">Search</Button>
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
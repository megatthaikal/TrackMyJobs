"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ExternalLink, Trash2, ArrowUpDown, Inbox } from "lucide-react";
import type { ApplicationModel } from "@/generated/prisma/models";
import { ApplicationStatus, WorkType } from "@/generated/prisma/enums";
import { STATUS_LABELS, STATUS_STYLES, STATUS_HEX } from "@/components/status-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const WORK_TYPE_LABELS: Record<WorkType, string> = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "On-site",
};

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function ApplicationsTable({
  rows,
  onPatch,
  onDelete,
  globalFilter,
  onGlobalFilterChange,
  highlightId,
}: {
  rows: ApplicationModel[];
  onPatch: (id: string, patch: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  highlightId?: string | null;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<ApplicationModel>[]>(
    () => [
      {
        accessorKey: "company",
        header: ({ column }) => (
          <SortableHeader label="Company" column={column} />
        ),
        cell: ({ row }) => (
          <Input
            defaultValue={row.original.company}
            key={row.original.id + row.original.company}
            className="h-8 min-w-[10rem] border-transparent bg-transparent hover:border-input focus-visible:border-input"
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v && v !== row.original.company)
                onPatch(row.original.id, { company: v });
            }}
          />
        ),
      },
      {
        accessorKey: "role",
        header: ({ column }) => (
          <SortableHeader label="Role" column={column} />
        ),
        cell: ({ row }) => (
          <Input
            defaultValue={row.original.role}
            key={row.original.id + row.original.role}
            className="h-8 min-w-[10rem] border-transparent bg-transparent hover:border-input focus-visible:border-input"
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v && v !== row.original.role)
                onPatch(row.original.id, { role: v });
            }}
          />
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <SortableHeader label="Status" column={column} />
        ),
        cell: ({ row }) => (
          <Select
            value={row.original.status}
            onValueChange={(v) => v && onPatch(row.original.id, { status: v })}
          >
            <SelectTrigger
              className={cn(
                "h-8 w-[9.5rem] justify-start gap-1.5 border-transparent px-2.5 font-medium transition-colors hover:opacity-90 [&_svg]:hidden",
                STATUS_STYLES[row.original.status]
              )}
            >
              <SelectValue>
                <span className="flex items-center gap-1.5">
                  <span
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: STATUS_HEX[row.original.status] }}
                  />
                  {STATUS_LABELS[row.original.status]}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.values(ApplicationStatus).map((s) => (
                <SelectItem key={s} value={s}>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: STATUS_HEX[s] }}
                    />
                    {STATUS_LABELS[s]}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
      },
      {
        accessorKey: "datePosted",
        header: ({ column }) => (
          <SortableHeader label="Date Posted" column={column} />
        ),
        cell: ({ row }) => (
          <Input
            type="date"
            defaultValue={toDateInputValue(row.original.datePosted)}
            key={row.original.id + String(row.original.datePosted)}
            className="h-8 w-[9.5rem] border-transparent bg-transparent hover:border-input focus-visible:border-input"
            onChange={(e) =>
              onPatch(row.original.id, { datePosted: e.target.value || null })
            }
          />
        ),
      },
      {
        accessorKey: "dateApplied",
        header: ({ column }) => (
          <SortableHeader label="Date Applied" column={column} />
        ),
        cell: ({ row }) => (
          <Input
            type="date"
            defaultValue={toDateInputValue(row.original.dateApplied)}
            key={row.original.id + String(row.original.dateApplied)}
            className="h-8 w-[9.5rem] border-transparent bg-transparent hover:border-input focus-visible:border-input"
            onChange={(e) =>
              onPatch(row.original.id, {
                dateApplied: e.target.value || null,
              })
            }
          />
        ),
      },
      {
        accessorKey: "location",
        header: ({ column }) => (
          <SortableHeader label="Location" column={column} />
        ),
        cell: ({ row }) => (
          <Input
            defaultValue={row.original.location ?? ""}
            key={row.original.id + (row.original.location ?? "")}
            className="h-8 min-w-[9rem] border-transparent bg-transparent hover:border-input focus-visible:border-input"
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v !== (row.original.location ?? ""))
                onPatch(row.original.id, { location: v || null });
            }}
          />
        ),
      },
      {
        accessorKey: "workType",
        header: ({ column }) => (
          <SortableHeader label="Work Type" column={column} />
        ),
        cell: ({ row }) => (
          <Select
            value={row.original.workType ?? "NONE"}
            onValueChange={(v) =>
              v && onPatch(row.original.id, { workType: v === "NONE" ? null : v })
            }
          >
            <SelectTrigger className="h-8 w-[8rem] border-transparent bg-transparent hover:border-input">
              <SelectValue>
                {(v: string) =>
                  v === "NONE" ? "—" : WORK_TYPE_LABELS[v as WorkType]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">—</SelectItem>
              {Object.values(WorkType).map((w) => (
                <SelectItem key={w} value={w}>
                  {WORK_TYPE_LABELS[w]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
      },
      {
        accessorKey: "jobUrl",
        header: "Link",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.jobUrl ? (
            <a
              href={row.original.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              <ExternalLink className="size-3.5" />
              Open
            </a>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-destructive"
            onClick={() => {
              if (
                confirm(
                  `Delete ${row.original.company} — ${row.original.role}?`
                )
              ) {
                onDelete(row.original.id);
              }
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        ),
      },
    ],
    [onPatch, onDelete]
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue).toLowerCase();
      const a = row.original;
      return (
        a.company.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        (a.location ?? "").toLowerCase().includes(q)
      );
    },
  });

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="whitespace-nowrap">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row, i) => (
              <TableRow
                key={row.id}
                className={cn(
                  "animate-in fade-in slide-in-from-bottom-1 fill-mode-backwards duration-300",
                  row.original.id === highlightId &&
                    "bg-primary/10 duration-1000 hover:bg-primary/10"
                )}
                style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-1">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="h-40 text-center text-muted-foreground"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <Inbox className="size-8 text-muted-foreground/50" />
                  <p>
                    {rows.length === 0
                      ? "No applications yet. Add your first one to get started."
                      : "No applications match your search."}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function SortableHeader({
  label,
  column,
}: {
  label: string;
  column: {
    toggleSorting: (desc?: boolean) => void;
    getIsSorted: () => false | "asc" | "desc";
  };
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 gap-1 px-2"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="size-3.5 text-muted-foreground" />
    </Button>
  );
}

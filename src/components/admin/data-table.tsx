"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  Inbox,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  Eye,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

const PAGE_SIZES = [10, 20, 50] as const;

function getByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined) return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

function buildPageList(
  current: number,
  total: number
): (number | "ellipsis")[] {
  if (total <= 0) return [];
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const set = new Set<number>([
    1,
    total,
    current,
    current - 1,
    current + 1,
  ].filter((p) => p >= 1 && p <= total));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i]! - sorted[i - 1]! > 1) {
      out.push("ellipsis");
    }
    out.push(sorted[i]!);
  }
  return out;
}

export interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  pageCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  /** Total rows (for server pagination “of Z”). If omitted, derived client-side from filtered rows. */
  totalRows?: number;
  defaultPageSize?: number;
  isLoading?: boolean;
  getRowId?: (row: TData, index: number) => string;
  enableSelection?: boolean;
  enableRowActions?: boolean;
  onView?: (row: TData) => void;
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
  onBulkDelete?: (rows: TData[]) => void;
}

export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Tìm kiếm...",
  pageCount: serverPageCount,
  currentPage,
  onPageChange,
  onPageSizeChange,
  totalRows: totalRowsProp,
  defaultPageSize = 10,
  isLoading = false,
  getRowId,
  enableSelection = true,
  enableRowActions = true,
  onView,
  onEdit,
  onDelete,
  onBulkDelete,
}: DataTableProps<TData, TValue>) {
  const isManualPagination =
    typeof onPageChange === "function" && typeof serverPageCount === "number";

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  React.useEffect(() => {
    if (isManualPagination && currentPage != null) {
      setPagination((p) => ({ ...p, pageIndex: currentPage - 1 }));
    }
  }, [currentPage, isManualPagination]);

  React.useEffect(() => {
    if (!isManualPagination) {
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    }
  }, [debouncedSearch, isManualPagination]);

  const selectionColumn = React.useMemo<ColumnDef<TData, TValue>>(
    () => ({
      id: "select",
      size: 40,
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={
            table.getIsSomePageRowsSelected() &&
            !table.getIsAllPageRowsSelected()
          }
          onCheckedChange={(checked) =>
            table.toggleAllPageRowsSelected(!!checked)
          }
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => row.toggleSelected(!!checked)}
          aria-label="Chọn dòng"
        />
      ),
      enableSorting: false,
    }),
    []
  );

  const actionsColumn = React.useMemo<ColumnDef<TData, TValue>>(
    () => ({
      id: "actions",
      size: 48,
      header: () => <span className="sr-only">Thao tác</span>,
      cell: ({ row }) => {
        const hasAny = onView || onEdit || onDelete;
        if (!hasAny) {
          return null;
        }
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-sm" }),
                "h-8 w-8"
              )}
              aria-label="Mở menu"
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {onView && (
                <DropdownMenuItem
                  onClick={() => {
                    onView(row.original);
                  }}
                >
                  <Eye className="size-4" />
                  Xem
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem
                  onClick={() => {
                    onEdit(row.original);
                  }}
                >
                  <Pencil className="size-4" />
                  Sửa
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  {(onView || onEdit) && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                      onDelete(row.original);
                    }}
                  >
                    <Trash2 className="size-4" />
                    Xóa
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
    }),
    [onView, onEdit, onDelete]
  );

  const mergedColumns = React.useMemo(() => {
    const base = [...columns];
    if (enableSelection) {
      base.unshift(selectionColumn);
    }
    if (enableRowActions && (onView || onEdit || onDelete)) {
      base.push(actionsColumn);
    }
    return base;
  }, [
    columns,
    enableSelection,
    enableRowActions,
    onView,
    onEdit,
    onDelete,
    selectionColumn,
    actionsColumn,
  ]);

  const table = useReactTable({
    data,
    columns: mergedColumns,
    state: {
      sorting,
      rowSelection,
      globalFilter: debouncedSearch,
      pagination: isManualPagination
        ? {
            pageIndex: (currentPage ?? 1) - 1,
            pageSize: pagination.pageSize,
          }
        : pagination,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: () => {},
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater(
              isManualPagination
                ? {
                    pageIndex: (currentPage ?? 1) - 1,
                    pageSize: pagination.pageSize,
                  }
                : pagination
            )
          : updater;
      if (isManualPagination) {
        if (next.pageSize !== pagination.pageSize) {
          setPagination((p) => ({ ...p, pageSize: next.pageSize }));
          onPageSizeChange?.(next.pageSize);
          onPageChange?.(1);
        } else if (next.pageIndex !== (currentPage ?? 1) - 1) {
          onPageChange?.(next.pageIndex + 1);
        }
      } else {
        setPagination(next);
      }
    },
    manualPagination: isManualPagination,
    pageCount: isManualPagination ? serverPageCount : undefined,
    getRowId:
      getRowId ??
      ((row, index) => {
        const r = row as { id?: string };
        if (r.id != null) return String(r.id);
        return String(index);
      }),
    enableRowSelection: enableSelection,
    globalFilterFn: (row, _columnId, filterValue) => {
      if (!searchKey || filterValue === undefined || filterValue === "") {
        return true;
      }
      const raw = getByPath(row.original, searchKey);
      const s = String(raw ?? "").toLowerCase();
      return s.includes(String(filterValue).trim().toLowerCase());
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(isManualPagination
      ? {}
      : { getPaginationRowModel: getPaginationRowModel() }),
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedData = selectedRows.map((r) => r.original);

  const filteredCount = table.getFilteredRowModel().rows.length;
  const pageCount = Math.max(table.getPageCount(), 1);
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;

  const displayTotal = isManualPagination
    ? (totalRowsProp ?? data.length)
    : filteredCount;

  const showingFrom =
    displayTotal === 0 ? 0 : pageIndex * pageSize + 1;
  const showingTo = Math.min((pageIndex + 1) * pageSize, displayTotal);

  const colCount = mergedColumns.length;

  const pageNumbers = React.useMemo(
    () => buildPageList(pageIndex + 1, pageCount),
    [pageCount, pageIndex]
  );

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
      {searchKey && (
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            disabled={isLoading}
          />
        </div>
      )}

      {enableSelection && onBulkDelete && selectedRows.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">
          <span className="font-medium">
            Đã chọn {selectedRows.length} mục
          </span>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => {
              onBulkDelete(selectedData);
              setRowSelection({});
            }}
          >
            <Trash2 className="size-4" />
            Xóa đã chọn
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        className={cn(
                          "inline-flex items-center gap-1 font-medium hover:text-foreground",
                          header.column.getIsSorted() && "text-foreground"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " ↑",
                          desc: " ↓",
                        }[header.column.getIsSorted() as string] ?? (
                          <span className="text-muted-foreground/40"> ⇅</span>
                        )}
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  {Array.from({ length: colCount }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colCount} className="h-40">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Inbox className="size-10 opacity-50" />
                    <p className="text-sm font-medium">Không có dữ liệu</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Hiển thị {showingFrom} đến {showingTo} trong tổng số {displayTotal}{" "}
            kết quả
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Số dòng</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  const n = Number(v);
                  table.setPageSize(n);
                }}
              >
                <SelectTrigger size="sm" className="w-18">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Trang trước"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              >
                <ChevronLeft className="size-4" />
              </Button>

              {pageNumbers.map((p, idx) =>
                p === "ellipsis" ? (
                  <span
                    key={`e-${idx}`}
                    className="px-2 text-muted-foreground"
                  >
                    …
                  </span>
                ) : (
                  <Button
                    key={p}
                    type="button"
                    variant={p === pageIndex + 1 ? "default" : "outline"}
                    size="icon-sm"
                    className="min-w-8"
                    onClick={() => table.setPageIndex(p - 1)}
                  >
                    {p}
                  </Button>
                )
              )}

              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Trang sau"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

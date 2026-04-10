"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import type { inferRouterOutputs } from "@trpc/server";
import { Search } from "lucide-react";

import type { AppRouter } from "@/server/trpc";
import { trpc } from "@/lib/trpc/client";
import { formatDate, formatPrice } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import {
  AdminAdvancedFilters,
  AdminFilterField,
} from "@/components/admin/admin-advanced-filters";
import { DataTable } from "@/components/admin/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";

type Row = inferRouterOutputs<AppRouter>["user"]["getAll"]["items"][number];

function initials(name: string | null, email: string) {
  const s = (name ?? email).trim();
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
  }
  return s.slice(0, 2).toUpperCase() || "?";
}

export function CustomersListClient() {
  const [page, setPage] = React.useState(1);
  const [q, setQ] = React.useState("");
  const debouncedQ = useDebounce(q, 300);
  const [hasOrders, setHasOrders] = React.useState<
    "any" | "with" | "without"
  >("any");
  const [detailId, setDetailId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedQ, hasOrders]);

  const advCount = (hasOrders !== "any" ? 1 : 0);

  const { data, isLoading } = trpc.user.getAll.useQuery({
    page,
    limit: 20,
    q: debouncedQ.trim() || undefined,
    hasOrders: hasOrders === "any" ? undefined : hasOrders,
  });

  const { data: detail, isLoading: detailLoading } =
    trpc.user.getCustomerDetail.useQuery(
      { id: detailId! },
      { enabled: !!detailId }
    );

  const columns = React.useMemo<ColumnDef<Row>[]>(
    () => [
      {
        id: "user",
        header: "Khách hàng",
        cell: ({ row }) => {
          const u = row.original;
          const img = u.image;
          return (
            <div className="flex items-center gap-3">
              <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-semibold">
                {img ? (
                  <Image
                    src={img}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover"
                    unoptimized={img.startsWith("data:")}
                  />
                ) : (
                  initials(u.name, u.email)
                )}
              </div>
              <span className="font-medium">{u.name ?? "—"}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.email}</span>
        ),
      },
      {
        accessorKey: "phone",
        header: "SĐT",
        cell: ({ row }) => (
          <span className="text-sm tabular-nums">
            {row.original.phone ?? "—"}
          </span>
        ),
      },
      {
        id: "orders",
        header: "Số đơn",
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.orderCount}</span>
        ),
      },
      {
        id: "spent",
        header: "Tổng chi tiêu",
        cell: ({ row }) => formatPrice(row.original.totalSpent),
      },
      {
        accessorKey: "createdAt",
        header: "Ngày đăng ký",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {formatDate(new Date(row.original.createdAt))}
          </span>
        ),
      },
    ],
    []
  );

  const items = data?.items ?? [];

  return (
    <>
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên, email hoặc SĐT..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
            disabled={isLoading}
          />
        </div>

        <AdminAdvancedFilters
          activeCount={advCount}
          onReset={advCount > 0 ? () => setHasOrders("any") : undefined}
        >
          <AdminFilterField label="Đơn hàng">
            <Select
              value={hasOrders}
              onValueChange={(v) =>
                setHasOrders(v as typeof hasOrders)
              }
            >
              <SelectTrigger className="w-full min-w-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Tất cả</SelectItem>
                <SelectItem value="with">Đã có ít nhất 1 đơn</SelectItem>
                <SelectItem value="without">Chưa có đơn</SelectItem>
              </SelectContent>
            </Select>
          </AdminFilterField>
        </AdminAdvancedFilters>

        <DataTable<Row>
          columns={columns}
          data={items}
          isLoading={isLoading}
          pageCount={data?.totalPages ?? 1}
          currentPage={page}
          onPageChange={setPage}
          totalRows={data?.total ?? 0}
          defaultPageSize={20}
          enableSelection={false}
          enableRowActions
          getRowId={(row) => row.id}
          onView={(row) => setDetailId(row.id)}
        />
      </div>

      <Dialog open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết khách hàng</DialogTitle>
          </DialogHeader>
          {detailLoading && <p className="text-sm text-muted-foreground">Đang tải…</p>}
          {!detailLoading && detail && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-semibold">
                  {detail.image ? (
                    <Image
                      src={detail.image}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized={detail.image.startsWith("data:")}
                    />
                  ) : (
                    initials(detail.name, detail.email)
                  )}
                </div>
                <div>
                  <p className="font-heading text-lg font-semibold">
                    {detail.name ?? "—"}
                  </p>
                  <p className="text-sm text-muted-foreground">{detail.email}</p>
                  <p className="text-sm tabular-nums">
                    {detail.phone ?? "—"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-lg border p-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Tổng chi tiêu (đã giao)</p>
                  <p className="font-semibold tabular-nums">
                    {formatPrice(detail.totalSpent)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Đăng ký</p>
                  <p>{formatDate(new Date(detail.createdAt))}</p>
                </div>
              </div>
              <div>
                <p className="mb-2 font-medium">Đơn gần đây</p>
                <ul className="max-h-56 space-y-2 overflow-y-auto text-sm">
                  {detail.orders.length === 0 ? (
                    <li className="text-muted-foreground">Chưa có đơn</li>
                  ) : (
                    detail.orders.map((o) => (
                      <li
                        key={o.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/30 px-2 py-1.5"
                      >
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-mono text-xs font-semibold text-primary hover:underline"
                        >
                          {o.orderNumber}
                        </Link>
                        <OrderStatusBadge status={o.status} />
                        <span className="w-full text-xs text-muted-foreground sm:w-auto">
                          {formatPrice(o.total)} ·{" "}
                          {formatDate(new Date(o.createdAt))}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

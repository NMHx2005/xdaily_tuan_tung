"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@/server/trpc";
import { trpc } from "@/lib/trpc/client";
import { formatDate, formatPrice } from "@/lib/utils";
import { DataTable } from "@/components/admin/data-table";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/order-status-badge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Row = inferRouterOutputs<AppRouter>["order"]["getAll"]["items"][number];

const METHOD_LABEL: Record<string, string> = {
  COD: "COD",
  VNPAY: "VNPay",
  MOMO: "MoMo",
};

const TABS: { key: "all" | Row["status"]; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "PENDING", label: "Chờ xác nhận" },
  { key: "CONFIRMED", label: "Đã xác nhận" },
  { key: "PROCESSING", label: "Đang xử lý" },
  { key: "SHIPPING", label: "Đang giao" },
  { key: "DELIVERED", label: "Đã giao" },
  { key: "CANCELLED", label: "Đã hủy" },
];

export function OrdersListClient() {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const [tab, setTab] = React.useState<(typeof TABS)[number]["key"]>("all");

  React.useEffect(() => {
    setPage(1);
  }, [tab]);

  const { data, isLoading } = trpc.order.getAll.useQuery({
    page,
    limit: 20,
    status: tab === "all" ? undefined : tab,
  });

  const columns = React.useMemo<ColumnDef<Row>[]>(
    () => [
      {
        accessorKey: "orderNumber",
        header: "Mã đơn",
        cell: ({ row }) => (
          <Link
            href={`/admin/orders/${row.original.id}`}
            className="font-mono text-xs font-semibold text-primary hover:underline"
          >
            {row.original.orderNumber}
          </Link>
        ),
      },
      {
        id: "customer",
        header: "Khách hàng",
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium">
              {row.original.user?.name ?? row.original.shippingName}
            </p>
            <p className="text-xs text-muted-foreground">
              {row.original.shippingPhone}
            </p>
          </div>
        ),
      },
      {
        id: "items",
        header: "SP",
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.items.length}</span>
        ),
      },
      {
        accessorKey: "total",
        header: "Tổng tiền",
        cell: ({ row }) => formatPrice(row.original.total),
      },
      {
        id: "pay",
        header: "Thanh toán",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className="w-fit text-xs">
              {METHOD_LABEL[row.original.paymentMethod] ?? row.original.paymentMethod}
            </Badge>
            <PaymentStatusBadge status={row.original.paymentStatus} />
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "createdAt",
        header: "Ngày đặt",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(new Date(row.original.createdAt))}
          </span>
        ),
      },
    ],
    []
  );

  const items = data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              tab === t.key
                ? "border-primary bg-primary/10 font-medium text-primary"
                : "border-transparent bg-muted/60 text-muted-foreground hover:bg-muted"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

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
        getRowId={(row) => row.id}
        onView={(row) => router.push(`/admin/orders/${row.id}`)}
      />
    </div>
  );
}

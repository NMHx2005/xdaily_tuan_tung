"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@/server/trpc";
import { trpc } from "@/lib/trpc/client";
import { formatDate, formatPrice } from "@/lib/utils";
import {
  AdminAdvancedFilters,
  AdminFilterField,
} from "@/components/admin/admin-advanced-filters";
import { DataTable } from "@/components/admin/data-table";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/order-status-badge";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, ShoppingCart } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

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
  const [paymentStatus, setPaymentStatus] = React.useState<
    "all" | "PENDING" | "PAID" | "FAILED" | "REFUNDED"
  >("all");
  const [paymentMethod, setPaymentMethod] = React.useState<
    "all" | "COD" | "VNPAY" | "MOMO"
  >("all");
  const [advQ, setAdvQ] = React.useState("");
  const debouncedAdvQ = useDebounce(advQ, 300);
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");

  React.useEffect(() => {
    setPage(1);
  }, [tab, paymentStatus, paymentMethod, debouncedAdvQ, dateFrom, dateTo]);

  const advActiveCount = React.useMemo(() => {
    let n = 0;
    if (paymentStatus !== "all") n += 1;
    if (paymentMethod !== "all") n += 1;
    if (debouncedAdvQ.trim()) n += 1;
    if (dateFrom) n += 1;
    if (dateTo) n += 1;
    return n;
  }, [paymentStatus, paymentMethod, debouncedAdvQ, dateFrom, dateTo]);

  const resetAdvanced = React.useCallback(() => {
    setPaymentStatus("all");
    setPaymentMethod("all");
    setAdvQ("");
    setDateFrom("");
    setDateTo("");
  }, []);

  const { data, isLoading } = trpc.order.getAll.useQuery({
    page,
    limit: 20,
    status: tab === "all" ? undefined : tab,
    paymentStatus: paymentStatus === "all" ? undefined : paymentStatus,
    paymentMethod: paymentMethod === "all" ? undefined : paymentMethod,
    q: debouncedAdvQ.trim() || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
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
  const showEmpty = !isLoading && items.length === 0;

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

      <AdminAdvancedFilters
        activeCount={advActiveCount}
        onReset={advActiveCount > 0 ? resetAdvanced : undefined}
      >
        <AdminFilterField label="Tìm nhanh" className="sm:col-span-2 lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Mã đơn, SĐT, tên hoặc email giao hàng..."
              value={advQ}
              onChange={(e) => setAdvQ(e.target.value)}
              className="pl-9"
            />
          </div>
        </AdminFilterField>
        <AdminFilterField label="Thanh toán (trạng thái)">
          <Select
            value={paymentStatus}
            onValueChange={(v) =>
              setPaymentStatus(v as typeof paymentStatus)
            }
          >
            <SelectTrigger className="w-full min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="PENDING">Chưa thanh toán</SelectItem>
              <SelectItem value="PAID">Đã thanh toán</SelectItem>
              <SelectItem value="FAILED">Thất bại</SelectItem>
              <SelectItem value="REFUNDED">Hoàn tiền</SelectItem>
            </SelectContent>
          </Select>
        </AdminFilterField>
        <AdminFilterField label="Phương thức">
          <Select
            value={paymentMethod}
            onValueChange={(v) =>
              setPaymentMethod(v as typeof paymentMethod)
            }
          >
            <SelectTrigger className="w-full min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="COD">COD</SelectItem>
              <SelectItem value="VNPAY">VNPay</SelectItem>
              <SelectItem value="MOMO">MoMo</SelectItem>
            </SelectContent>
          </Select>
        </AdminFilterField>
        <AdminFilterField label="Từ ngày">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full"
          />
        </AdminFilterField>
        <AdminFilterField label="Đến ngày">
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full"
          />
        </AdminFilterField>
      </AdminAdvancedFilters>

      {showEmpty ? (
        <EmptyState
          icon={ShoppingCart}
          title="Chưa có đơn hàng"
          description="Khi có đơn mới, danh sách sẽ hiển thị tại đây."
        />
      ) : (
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
      )}
    </div>
  );
}

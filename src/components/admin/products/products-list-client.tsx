"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import type { inferRouterOutputs } from "@trpc/server";
import { Search } from "lucide-react";
import { toast } from "sonner";

import type { AppRouter } from "@/server/trpc";
import { trpc } from "@/lib/trpc/client";
import { formatPrice } from "@/lib/utils";
import { SITE_URL } from "@/lib/constants";
import { useDebounce } from "@/hooks/use-debounce";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type ProductRow = inferRouterOutputs<AppRouter>["product"]["getAll"]["items"][number];

export function ProductsListClient() {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 300);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, refetch } = trpc.product.getAll.useQuery({
    page,
    limit,
    sort: "newest",
    q: debouncedSearch.trim() || undefined,
  });

  const deleteMut = trpc.product.delete.useMutation({
    onSuccess: () => {
      toast.success("Đã xóa thành công");
      void refetch();
      router.refresh();
    },
    onError: () => toast.error("Đã xảy ra lỗi, vui lòng thử lại"),
  });

  const columns = React.useMemo<ColumnDef<ProductRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Tên sản phẩm",
        cell: ({ row }) => {
          const p = row.original;
          const thumb = p.images[0]?.url;
          return (
            <div className="flex max-w-[280px] items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                {thumb ? (
                  <Image
                    src={thumb}
                    alt={p.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <Link
                href={`/admin/products/${p.id}`}
                className="font-semibold text-primary hover:underline"
              >
                {p.name}
              </Link>
            </div>
          );
        },
      },
      {
        accessorKey: "sku",
        header: "SKU",
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.sku}</span>
        ),
      },
      {
        accessorKey: "price",
        header: "Giá",
        cell: ({ row }) => formatPrice(row.original.price),
      },
      {
        accessorKey: "stockQuantity",
        header: "Tồn kho",
        cell: ({ row }) => {
          const q = row.original.stockQuantity;
          return (
            <Badge variant={q === 0 ? "destructive" : "secondary"}>
              {q}
            </Badge>
          );
        },
      },
      {
        id: "stockStatus",
        header: "Trạng thái",
        cell: ({ row }) =>
          row.original.inStock ? (
            <span className="text-xs font-medium text-green-700">Còn hàng</span>
          ) : (
            <span className="text-xs font-medium text-red-700">Hết hàng</span>
          ),
      },
    ],
    []
  );

  const items = data?.items ?? [];
  const totalRows = data?.total ?? 0;
  const pageCount = Math.max(data?.totalPages ?? 1, 1);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          disabled={isLoading}
        />
      </div>

      <DataTable<ProductRow>
        columns={columns}
        data={items}
        isLoading={isLoading}
        pageCount={pageCount}
        currentPage={page}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setLimit(size);
          setPage(1);
        }}
        defaultPageSize={20}
        totalRows={totalRows}
        getRowId={(row) => row.id}
        onView={(row) => {
          window.open(`${SITE_URL}/products/${row.slug}`, "_blank");
        }}
        onEdit={(row) => {
          router.push(`/admin/products/${row.id}`);
        }}
        onDelete={(row) => {
          if (window.confirm(`Xóa "${row.name}"?`)) {
            deleteMut.mutate({ id: row.id });
          }
        }}
        onBulkDelete={(rows) => {
          if (
            !window.confirm(`Xóa ${rows.length} sản phẩm đã chọn?`)
          ) {
            return;
          }
          Promise.all(rows.map((r) => deleteMut.mutateAsync({ id: r.id })))
            .then(() => {
              toast.success("Đã xóa thành công");
              void refetch();
              router.refresh();
            })
            .catch(() => {});
        }}
      />
    </div>
  );
}

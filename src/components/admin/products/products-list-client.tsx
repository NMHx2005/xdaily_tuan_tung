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
import {
  AdminAdvancedFilters,
  AdminFilterField,
} from "@/components/admin/admin-advanced-filters";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ProductRow = inferRouterOutputs<AppRouter>["product"]["getAll"]["items"][number];

type SortVal =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc"
  | "newest"
  | "bestselling";

const SORT_LABELS: { value: SortVal; label: string }[] = [
  { value: "newest", label: "Mới nhất" },
  { value: "featured", label: "Nổi bật" },
  { value: "bestselling", label: "Bán chạy" },
  { value: "price-asc", label: "Giá tăng dần" },
  { value: "price-desc", label: "Giá giảm dần" },
  { value: "name-asc", label: "Tên A–Z" },
  { value: "name-desc", label: "Tên Z–A" },
];

export function ProductsListClient() {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [collectionId, setCollectionId] = React.useState<string>("");
  const [stockFilter, setStockFilter] = React.useState<
    "all" | "in_stock" | "out_of_stock" | "low_stock"
  >("all");
  const [featuredOnly, setFeaturedOnly] = React.useState(false);
  const [sort, setSort] = React.useState<SortVal>("newest");

  const { data: collections = [] } = trpc.collection.getAllForAdmin.useQuery({});

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, collectionId, stockFilter, featuredOnly, sort]);

  const stockParam =
    stockFilter === "all" ? undefined : stockFilter;

  const { data, isLoading, refetch } = trpc.product.getAll.useQuery({
    page,
    limit,
    sort,
    q: debouncedSearch.trim() || undefined,
    collectionId: collectionId || undefined,
    stockFilter: stockParam,
    featuredOnly: featuredOnly || undefined,
  });

  const filterActiveCount = React.useMemo(() => {
    let n = 0;
    if (collectionId) n += 1;
    if (stockFilter !== "all") n += 1;
    if (featuredOnly) n += 1;
    if (sort !== "newest") n += 1;
    return n;
  }, [collectionId, stockFilter, featuredOnly, sort]);

  const resetAdvanced = React.useCallback(() => {
    setCollectionId("");
    setStockFilter("all");
    setFeaturedOnly(false);
    setSort("newest");
  }, []);

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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên hoặc SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            disabled={isLoading}
          />
        </div>
      </div>

      <AdminAdvancedFilters
        activeCount={filterActiveCount}
        onReset={filterActiveCount > 0 ? resetAdvanced : undefined}
      >
        <AdminFilterField label="Bộ sưu tập">
          <Select
            value={collectionId || "__all__"}
            onValueChange={(v) =>
              setCollectionId(!v || v === "__all__" ? "" : v)
            }
          >
            <SelectTrigger className="w-full min-w-0">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tất cả</SelectItem>
              {collections.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </AdminFilterField>
        <AdminFilterField label="Tồn kho">
          <Select
            value={stockFilter}
            onValueChange={(v) =>
              setStockFilter(v as typeof stockFilter)
            }
          >
            <SelectTrigger className="w-full min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="in_stock">Còn hàng (&gt;0)</SelectItem>
              <SelectItem value="low_stock">Sắp hết (1–10)</SelectItem>
              <SelectItem value="out_of_stock">Hết hàng (0)</SelectItem>
            </SelectContent>
          </Select>
        </AdminFilterField>
        <AdminFilterField label="Sắp xếp">
          <Select
            value={sort}
            onValueChange={(v) => setSort(v as SortVal)}
          >
            <SelectTrigger className="w-full min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_LABELS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </AdminFilterField>
        <AdminFilterField label="Khác" className="sm:col-span-2 lg:col-span-1">
          <label className="flex cursor-pointer items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
            <Checkbox
              checked={featuredOnly}
              onCheckedChange={(c) => setFeaturedOnly(c === true)}
            />
            Chỉ sản phẩm nổi bật
          </label>
        </AdminFilterField>
      </AdminAdvancedFilters>

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

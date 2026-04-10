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
import { Switch } from "@/components/ui/switch";

type Row = inferRouterOutputs<AppRouter>["collection"]["getAllForAdmin"][number];

export function CollectionsListClient() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [q, setQ] = React.useState("");
  const debouncedQ = useDebounce(q, 300);
  const [isVisible, setIsVisible] = React.useState<"all" | "yes" | "no">("all");
  const [inStoreNav, setInStoreNav] = React.useState<"all" | "yes" | "no">(
    "all",
  );
  const [level, setLevel] = React.useState<"all" | "root" | "child">("all");

  const advCount = React.useMemo(() => {
    let n = 0;
    if (debouncedQ.trim()) n += 1;
    if (isVisible !== "all") n += 1;
    if (inStoreNav !== "all") n += 1;
    if (level !== "all") n += 1;
    return n;
  }, [debouncedQ, isVisible, inStoreNav, level]);

  const resetFilters = React.useCallback(() => {
    setQ("");
    setIsVisible("all");
    setInStoreNav("all");
    setLevel("all");
  }, []);

  const { data = [], isLoading } = trpc.collection.getAllForAdmin.useQuery({
    q: debouncedQ.trim() || undefined,
    isVisible: isVisible === "all" ? undefined : isVisible,
    inStoreNav: inStoreNav === "all" ? undefined : inStoreNav,
    level: level === "all" ? undefined : level,
  });

  const updateMut = trpc.collection.update.useMutation({
    onSuccess: () => {
      toast.success("Đã lưu thành công");
      void utils.collection.getAllForAdmin.invalidate();
      router.refresh();
    },
    onError: () => toast.error("Đã xảy ra lỗi, vui lòng thử lại"),
  });

  const deleteMut = trpc.collection.delete.useMutation({
    onSuccess: () => {
      toast.success("Đã xóa thành công");
      void utils.collection.getAllForAdmin.invalidate();
      router.refresh();
    },
    onError: () => toast.error("Đã xảy ra lỗi, vui lòng thử lại"),
  });

  const columns = React.useMemo<ColumnDef<Row>[]>(
    () => [
      {
        id: "image",
        header: "Ảnh",
        enableSorting: false,
        cell: ({ row }) => {
          const img = row.original.image;
          return (
            <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-muted">
              {img ? (
                <Image
                  src={img}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : null}
            </div>
          );
        },
      },
      {
        accessorKey: "name",
        header: "Tên",
        cell: ({ row }) => (
          <Link
            href={`/admin/collections/${row.original.id}`}
            className="font-semibold text-primary hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "slug",
        header: "Slug",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.slug}
          </span>
        ),
      },
      {
        id: "parent",
        header: "Cha",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.parent ? (
            <span className="text-sm text-muted-foreground">
              {row.original.parent.name}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: "storeNav",
        header: "Menu web",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.showInStorefrontNav ? (
            <span className="text-emerald-600">Có</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: "count",
        header: "Số SP",
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original._count.products}</span>
        ),
      },
      {
        id: "visible",
        header: "Hiển thị",
        enableSorting: false,
        cell: ({ row }) => (
          <Switch
            checked={row.original.isVisible}
            onCheckedChange={(checked) => {
              updateMut.mutate({ id: row.original.id, isVisible: checked });
            }}
            disabled={updateMut.isPending}
          />
        ),
      },
    ],
    [updateMut]
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tên hoặc slug..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
          disabled={isLoading}
        />
      </div>

      <AdminAdvancedFilters
        activeCount={advCount}
        onReset={advCount > 0 ? resetFilters : undefined}
      >
        <AdminFilterField label="Hiển thị trên web">
          <Select
            value={isVisible}
            onValueChange={(v) => setIsVisible(v as typeof isVisible)}
          >
            <SelectTrigger className="w-full min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="yes">Đang hiện</SelectItem>
              <SelectItem value="no">Đang ẩn</SelectItem>
            </SelectContent>
          </Select>
        </AdminFilterField>
        <AdminFilterField label="Menu storefront">
          <Select
            value={inStoreNav}
            onValueChange={(v) => setInStoreNav(v as typeof inStoreNav)}
          >
            <SelectTrigger className="w-full min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="yes">Có trên menu</SelectItem>
              <SelectItem value="no">Không trên menu</SelectItem>
            </SelectContent>
          </Select>
        </AdminFilterField>
        <AdminFilterField label="Cấp danh mục">
          <Select
            value={level}
            onValueChange={(v) => setLevel(v as typeof level)}
          >
            <SelectTrigger className="w-full min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="root">Cấp gốc</SelectItem>
              <SelectItem value="child">Có danh mục cha</SelectItem>
            </SelectContent>
          </Select>
        </AdminFilterField>
      </AdminAdvancedFilters>

    <DataTable<Row>
      columns={columns}
      data={data}
      isLoading={isLoading}
      enableSelection={false}
      getRowId={(row) => row.id}
      onEdit={(row) => router.push(`/admin/collections/${row.id}`)}
      onDelete={(row) => {
        if (window.confirm(`Xóa bộ sưu tập "${row.name}"?`)) {
          deleteMut.mutate({ id: row.id });
        }
      }}
    />
    </div>
  );
}

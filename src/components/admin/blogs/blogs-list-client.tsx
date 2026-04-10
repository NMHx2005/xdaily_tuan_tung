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
import { formatDate } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import {
  AdminAdvancedFilters,
  AdminFilterField,
} from "@/components/admin/admin-advanced-filters";
import { DataTable } from "@/components/admin/data-table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Row =
  inferRouterOutputs<AppRouter>["blog"]["listForAdmin"]["items"][number];

export function BlogsListClient() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [page, setPage] = React.useState(1);
  const [q, setQ] = React.useState("");
  const debouncedQ = useDebounce(q, 300);
  const [published, setPublished] = React.useState<
    "all" | "published" | "draft"
  >("all");

  React.useEffect(() => {
    setPage(1);
  }, [debouncedQ, published]);

  const advCount = published !== "all" ? 1 : 0;

  const { data, isLoading } = trpc.blog.listForAdmin.useQuery({
    page,
    limit: 20,
    q: debouncedQ.trim() || undefined,
    published: published === "all" ? undefined : published,
  });

  const deleteMut = trpc.blog.delete.useMutation({
    onSuccess: () => {
      toast.success("Đã xóa thành công");
      void utils.blog.listForAdmin.invalidate();
      router.refresh();
    },
    onError: () => toast.error("Đã xảy ra lỗi, vui lòng thử lại"),
  });

  const columns = React.useMemo<ColumnDef<Row>[]>(
    () => [
      {
        id: "thumb",
        header: "Ảnh",
        enableSorting: false,
        cell: ({ row }) => {
          const src = row.original.thumbnail;
          return (
            <div className="relative h-12 w-16 overflow-hidden rounded-md bg-muted">
              {src ? (
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                  unoptimized={src.startsWith("data:")}
                />
              ) : null}
            </div>
          );
        },
      },
      {
        accessorKey: "title",
        header: "Tiêu đề",
        cell: ({ row }) => (
          <Link
            href={`/admin/blogs/${row.original.id}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.title}
          </Link>
        ),
      },
      {
        accessorKey: "author",
        header: "Tác giả",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.author}</span>
        ),
      },
      {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) =>
          row.original.isPublished ? (
            <Badge variant="default" className="font-normal">
              Đã đăng
            </Badge>
          ) : (
            <Badge variant="secondary" className="font-normal">
              Nháp
            </Badge>
          ),
      },
      {
        id: "publishedAt",
        header: "Ngày đăng",
        cell: ({ row }) => {
          const d = row.original.publishedAt;
          return (
            <span className="whitespace-nowrap text-xs text-muted-foreground">
              {row.original.isPublished && d
                ? formatDate(new Date(d))
                : "—"}
            </span>
          );
        },
      },
    ],
    []
  );

  const items = data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tiêu đề..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
          disabled={isLoading}
        />
      </div>

      <AdminAdvancedFilters
        activeCount={advCount}
        onReset={advCount > 0 ? () => setPublished("all") : undefined}
      >
        <AdminFilterField label="Trạng thái đăng">
          <Select
            value={published}
            onValueChange={(v) =>
              setPublished(v as typeof published)
            }
          >
            <SelectTrigger className="w-full min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="published">Đã đăng</SelectItem>
              <SelectItem value="draft">Nháp</SelectItem>
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
        getRowId={(row) => row.id}
        onEdit={(row) => router.push(`/admin/blogs/${row.id}`)}
        onDelete={(row) => {
          if (window.confirm(`Xóa bài "${row.title}"?`)) {
            deleteMut.mutate({ id: row.id });
          }
        }}
      />
    </div>
  );
}

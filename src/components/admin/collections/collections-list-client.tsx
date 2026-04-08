"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import type { inferRouterOutputs } from "@trpc/server";
import { toast } from "sonner";

import type { AppRouter } from "@/server/trpc";
import { trpc } from "@/lib/trpc/client";
import { DataTable } from "@/components/admin/data-table";
import { Switch } from "@/components/ui/switch";

type Row = inferRouterOutputs<AppRouter>["collection"]["getAllForAdmin"][number];

export function CollectionsListClient() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data = [], isLoading } = trpc.collection.getAllForAdmin.useQuery();

  const updateMut = trpc.collection.update.useMutation({
    onSuccess: () => {
      toast.success("Đã cập nhật");
      void utils.collection.getAllForAdmin.invalidate();
      router.refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMut = trpc.collection.delete.useMutation({
    onSuccess: () => {
      toast.success("Đã xóa");
      void utils.collection.getAllForAdmin.invalidate();
      router.refresh();
    },
    onError: (e) => toast.error(e.message),
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
  );
}

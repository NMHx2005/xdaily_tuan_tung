"use client";

import * as React from "react";
import { Controller, type Control } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NAV_ICON_OPTIONS } from "@/lib/storefront-nav";
import type { CollectionAdminFormValues } from "@/lib/collection-form-schema";
import { trpc } from "@/lib/trpc/client";

type ParentOption = { id: string; name: string; slug: string };

export function CollectionNavFields({
  control,
  excludeCollectionId,
}: {
  control: Control<CollectionAdminFormValues>;
  excludeCollectionId?: string;
}) {
  const { data: all = [] } = trpc.collection.getAllForAdmin.useQuery({});
  const parents: ParentOption[] = React.useMemo(
    () =>
      all.filter((c) => c.id !== excludeCollectionId).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      })),
    [all, excludeCollectionId],
  );

  return (
    <div className="space-y-4 rounded-lg border border-dashed p-4">
      <p className="text-sm font-medium">Menu trang chủ &amp; phân cấp</p>
      <div className="space-y-2">
        <Label>Danh mục cha</Label>
        <Controller
          name="parentId"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value ?? "__none__"}
              onValueChange={(v) => field.onChange(v === "__none__" ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="— Gốc (cấp 1) —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— Gốc (cấp 1) —</SelectItem>
                {parents.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}{" "}
                    <span className="text-muted-foreground">({p.slug})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <p className="text-xs text-muted-foreground">
          Danh mục con hiển thị trong cột phải mega menu / flyout trang chủ.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="navLabel">Tên trên menu (tuỳ chọn)</Label>
        <Controller
          name="navLabel"
          control={control}
          render={({ field }) => (
            <Input
              id="navLabel"
              {...field}
              value={field.value ?? ""}
              placeholder="Để trống = dùng tên danh mục"
            />
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>Icon menu</Label>
        <Controller
          name="navIcon"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NAV_ICON_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="showInStorefrontNav">Hiện trên menu trang chủ / mega</Label>
        <Controller
          name="showInStorefrontNav"
          control={control}
          render={({ field }) => (
            <Switch
              id="showInStorefrontNav"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="position">Thứ tự (cùng cấp)</Label>
        <Controller
          name="position"
          control={control}
          render={({ field }) => (
            <Input
              id="position"
              type="number"
              value={field.value}
              onChange={(e) =>
                field.onChange(Number.parseInt(e.target.value, 10) || 0)
              }
            />
          )}
        />
      </div>
    </div>
  );
}

export function CollectionHomeStripFields({
  control,
}: {
  control: Control<CollectionAdminFormValues>;
}) {
  return (
    <div className="space-y-4 rounded-lg border border-dashed border-blue-200/80 bg-blue-50/40 p-4 dark:bg-blue-950/20">
      <p className="text-sm font-medium">Dải bộ sưu tập trang chủ</p>
      <p className="text-xs text-muted-foreground">
        Icon tròn dưới banner hero. Cần có ảnh bìa (trên) và danh mục đang hiển thị.
      </p>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="showOnHomeCategoryStrip">Hiện trên dải trang chủ</Label>
        <Controller
          name="showOnHomeCategoryStrip"
          control={control}
          render={({ field }) => (
            <Switch
              id="showOnHomeCategoryStrip"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="homeStripPosition">Thứ tự trên dải (0 = trái nhất)</Label>
        <Controller
          name="homeStripPosition"
          control={control}
          render={({ field }) => (
            <Input
              id="homeStripPosition"
              type="number"
              value={field.value}
              onChange={(e) =>
                field.onChange(Number.parseInt(e.target.value, 10) || 0)
              }
            />
          )}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="homeStripLabel">Nhãn trên dải (tuỳ chọn)</Label>
        <Controller
          name="homeStripLabel"
          control={control}
          render={({ field }) => (
            <Input
              id="homeStripLabel"
              {...field}
              value={field.value ?? ""}
              placeholder='Để trống = "Bộ sưu tập" + tên danh mục'
            />
          )}
        />
      </div>
    </div>
  );
}

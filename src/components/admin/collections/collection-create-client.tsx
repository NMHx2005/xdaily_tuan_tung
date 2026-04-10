"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { trpc } from "@/lib/trpc/client";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CollectionCoverField } from "@/components/admin/collections/collection-cover-field";
import {
  CollectionHomeStripFields,
  CollectionNavFields,
} from "@/components/admin/collections/collection-form-fields";
import {
  collectionAdminFormSchema,
  type CollectionAdminFormValues,
} from "@/lib/collection-form-schema";

export function CollectionCreateClient() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const slugTouched = React.useRef(false);

  const createMut = trpc.collection.create.useMutation({
    onSuccess: (c) => {
      toast.success("Đã lưu thành công");
      void utils.collection.getStorefrontNavTree.invalidate();
      void utils.collection.getAllForAdmin.invalidate();
      router.push(`/admin/collections/${c.id}`);
      router.refresh();
    },
    onError: () => toast.error("Đã xảy ra lỗi, vui lòng thử lại"),
  });

  const form = useForm<CollectionAdminFormValues>({
    resolver: zodResolver(collectionAdminFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      image: "",
      isVisible: true,
      seoTitle: "",
      seoDescription: "",
      parentId: null,
      navLabel: "",
      navIcon: "Package",
      showInStorefrontNav: false,
      position: 0,
      showOnHomeCategoryStrip: false,
      homeStripPosition: 0,
      homeStripLabel: "",
    },
  });

  const name = form.watch("name");
  React.useEffect(() => {
    if (!slugTouched.current) {
      form.setValue("slug", slugify(name), { shouldValidate: true });
    }
  }, [name, form]);

  return (
    <form
      className="max-w-2xl space-y-6"
      onSubmit={form.handleSubmit((vals: CollectionAdminFormValues) =>
        createMut.mutate({
          name: vals.name,
          slug: vals.slug,
          description: vals.description || "",
          image: vals.image || undefined,
          isVisible: vals.isVisible,
          seoTitle: vals.seoTitle ?? "",
          seoDescription: vals.seoDescription ?? "",
          parentId: vals.parentId,
          navLabel: vals.navLabel || undefined,
          navIcon: vals.navIcon,
          showInStorefrontNav: vals.showInStorefrontNav,
          position: vals.position,
          showOnHomeCategoryStrip: vals.showOnHomeCategoryStrip,
          homeStripPosition: vals.homeStripPosition,
          homeStripLabel: vals.homeStripLabel || undefined,
        }),
      )}
    >
      <Card>
        <CardHeader>
          <CardTitle>Thông tin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên *</Label>
            <Input id="name" {...form.register("name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              {...form.register("slug")}
              onChange={(e) => {
                slugTouched.current = true;
                form.setValue("slug", e.target.value);
              }}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea id="description" rows={4} {...form.register("description")} />
          </div>
          <Controller
            name="image"
            control={form.control}
            render={({ field }) => (
              <CollectionCoverField
                id="image"
                url={field.value ?? ""}
                onChange={field.onChange}
              />
            )}
          />
          <div className="flex items-center justify-between">
            <Label htmlFor="isVisible">Hiển thị</Label>
            <Switch
              id="isVisible"
              checked={form.watch("isVisible")}
              onCheckedChange={(c) => form.setValue("isVisible", c)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seoTitle">SEO Title</Label>
            <Input id="seoTitle" {...form.register("seoTitle")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seoDescription">SEO Description</Label>
            <Textarea id="seoDescription" rows={3} {...form.register("seoDescription")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Menu storefront</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <CollectionNavFields control={form.control} />
          <CollectionHomeStripFields control={form.control} />
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button type="submit" disabled={createMut.isPending}>
          Tạo &amp; chỉnh sửa tiếp
        </Button>
        <Link href="/admin/collections">
          <Button type="button" variant="ghost">
            Hủy
          </Button>
        </Link>
      </div>
    </form>
  );
}

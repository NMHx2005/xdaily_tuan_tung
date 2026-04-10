"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@/server/trpc";
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
import {
  CollectionProductsManager,
  type CollectionProductEntry,
} from "@/components/admin/collections/collection-products-manager";
import { CollectionCoverField } from "@/components/admin/collections/collection-cover-field";
import {
  CollectionHomeStripFields,
  CollectionNavFields,
} from "@/components/admin/collections/collection-form-fields";
import {
  collectionAdminFormSchema,
  type CollectionAdminFormValues,
} from "@/lib/collection-form-schema";

type CollectionFull = inferRouterOutputs<AppRouter>["collection"]["getById"];

/** Một dòng join ProductCollection + product (khớp include trong collection.getById) */
type CollectionProductJoin = NonNullable<CollectionFull["products"]>[number];

function toEntries(c: CollectionFull): CollectionProductEntry[] {
  return c.products.map((pc: CollectionProductJoin) => ({
    productId: pc.productId,
    name: pc.product.name,
    slug: pc.product.slug,
    image: pc.product.images[0]?.url ?? null,
  }));
}

export function CollectionEditClient({ initial }: { initial: CollectionFull }) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const slugTouched = React.useRef(false);
  const [entries, setEntries] = React.useState<CollectionProductEntry[]>(() =>
    toEntries(initial),
  );

  const updateMut = trpc.collection.update.useMutation({
    onSuccess: () => {
      toast.success("Đã lưu thành công");
      void utils.collection.getStorefrontNavTree.invalidate();
      void utils.collection.getAllForAdmin.invalidate();
      void utils.collection.getHomeCategoryStrip.invalidate();
      router.refresh();
    },
    onError: () => toast.error("Đã xảy ra lỗi, vui lòng thử lại"),
  });

  const form = useForm<CollectionAdminFormValues>({
    resolver: zodResolver(collectionAdminFormSchema),
    defaultValues: {
      name: initial.name,
      slug: initial.slug,
      description: initial.description ?? "",
      image: initial.image ?? "",
      isVisible: initial.isVisible,
      seoTitle: initial.seoTitle,
      seoDescription: initial.seoDescription,
      parentId: initial.parentId ?? null,
      navLabel: initial.navLabel ?? "",
      navIcon: (initial.navIcon as CollectionAdminFormValues["navIcon"]) ?? "Package",
      showInStorefrontNav: initial.showInStorefrontNav,
      position: initial.position,
      showOnHomeCategoryStrip: initial.showOnHomeCategoryStrip,
      homeStripPosition: initial.homeStripPosition,
      homeStripLabel: initial.homeStripLabel ?? "",
    },
  });

  const name = form.watch("name");
  React.useEffect(() => {
    if (!slugTouched.current) {
      form.setValue("slug", slugify(name), { shouldValidate: true });
    }
  }, [name, form]);

  const onSubmit = (vals: CollectionAdminFormValues) => {
    updateMut.mutate({
      id: initial.id,
      name: vals.name,
      slug: vals.slug,
      description: vals.description ?? "",
      image: vals.image || null,
      isVisible: vals.isVisible,
      seoTitle: vals.seoTitle ?? "",
      seoDescription: vals.seoDescription ?? "",
      parentId: vals.parentId,
      navLabel: vals.navLabel || null,
      navIcon: vals.navIcon,
      showInStorefrontNav: vals.showInStorefrontNav,
      position: vals.position,
      showOnHomeCategoryStrip: vals.showOnHomeCategoryStrip,
      homeStripPosition: vals.homeStripPosition,
      homeStripLabel: vals.homeStripLabel || null,
      productIds: entries.map((e) => e.productId),
    });
  };

  return (
    <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
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
                <Textarea
                  id="description"
                  rows={4}
                  {...form.register("description")}
                />
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <CollectionProductsManager value={entries} onChange={setEntries} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Hiển thị &amp; SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Textarea
                  id="seoDescription"
                  rows={3}
                  {...form.register("seoDescription")}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Menu storefront</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <CollectionNavFields
                control={form.control}
                excludeCollectionId={initial.id}
              />
              <CollectionHomeStripFields control={form.control} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t pt-6">
        <Button type="submit" disabled={updateMut.isPending}>
          Lưu
        </Button>
        <Link href="/admin/collections">
          <Button type="button" variant="ghost">
            Quay lại
          </Button>
        </Link>
      </div>
    </form>
  );
}

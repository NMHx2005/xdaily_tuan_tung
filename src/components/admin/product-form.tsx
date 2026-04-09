"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@/server/trpc";
import { trpc } from "@/lib/trpc/client";
import { adminProductScalarSchema, productCreateSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";
import { SITE_URL } from "@/lib/constants";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

const RichTextEditor = dynamic(
  () =>
    import("@/components/admin/rich-text-editor").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="min-h-[240px] w-full rounded-lg border" />
    ),
  }
);
import {
  ImageUploader,
  type ImageUploadRow,
} from "@/components/admin/image-uploader";
import {
  VariantManager,
  type VariantFormRow,
} from "@/components/admin/variant-manager";

type ScalarForm = z.infer<typeof adminProductScalarSchema>;
type ProductAdmin = inferRouterOutputs<AppRouter>["product"]["getById"];
type ProductAdminImage = ProductAdmin["images"][number];
type ProductAdminVariant = ProductAdmin["variants"][number];
type ProductAdminCollection = ProductAdmin["collections"][number];
type CollectionListItem =
  inferRouterOutputs<AppRouter>["collection"]["getAllForAdmin"][number];

function defaultScalar(): ScalarForm {
  return {
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    price: 1000,
    compareAtPrice: null,
    sku: "",
    inStock: true,
    stockQuantity: 0,
    isFeatured: false,
    badge: "none",
    position: 0,
    specifications: [],
    seoTitle: "",
    seoDescription: "",
  };
}

function productToScalar(p: ProductAdmin): ScalarForm {
  return {
    name: p.name,
    slug: p.slug,
    shortDescription: p.shortDescription,
    description: p.description,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    sku: p.sku,
    inStock: p.inStock,
    stockQuantity: p.stockQuantity,
    isFeatured: p.isFeatured,
    badge:
      p.badge === "bestseller" || p.badge === "new" ? p.badge : "none",
    position: p.position,
    specifications: Array.isArray(p.specifications)
      ? (p.specifications as { key: string; value: string }[])
      : [],
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
  };
}

function productToImages(p: ProductAdmin): ImageUploadRow[] {
  return p.images.map((img: ProductAdminImage) => ({
    id: img.id,
    url: img.url,
    alt: img.alt,
  }));
}

function productToVariants(p: ProductAdmin): VariantFormRow[] {
  return p.variants.map((v: ProductAdminVariant) => ({
    id: v.id,
    name: v.name,
    colorHex: v.colorHex || "#888888",
    price: v.price,
    compareAtPrice: v.compareAtPrice,
    sku: v.sku,
    inStock: v.inStock,
    image: v.image,
  }));
}

export interface ProductFormProps {
  mode: "create" | "edit";
  /** Dữ liệu sản phẩm khi sửa (alias theo prompt: `initialData`) */
  initialData?: ProductAdmin;
  /** @deprecated Dùng `initialData` */
  initialProduct?: ProductAdmin;
}

export function ProductForm({
  mode,
  initialData,
  initialProduct,
}: ProductFormProps) {
  const source = initialData ?? initialProduct;
  const router = useRouter();
  const slugManual = React.useRef(false);
  const [images, setImages] = React.useState<ImageUploadRow[]>(() =>
    source ? productToImages(source) : []
  );
  const [variants, setVariants] = React.useState<VariantFormRow[]>(() =>
    source ? productToVariants(source) : []
  );
  const [collectionIds, setCollectionIds] = React.useState<string[]>(() =>
    source
      ? source.collections.map((c: ProductAdminCollection) => c.collectionId)
      : []
  );

  const { data: collections = [] } = trpc.collection.getAllForAdmin.useQuery();

  const form = useForm<ScalarForm>({
    resolver: zodResolver(
      adminProductScalarSchema
    ) as Resolver<ScalarForm>,
    defaultValues: source ? productToScalar(source) : defaultScalar(),
  });

  const nameWatch = form.watch("name");
  const seoTitleWatch = form.watch("seoTitle");
  const seoDescWatch = form.watch("seoDescription");
  const slugWatch = form.watch("slug");

  React.useEffect(() => {
    if (mode === "edit" || slugManual.current) return;
    form.setValue("slug", slugify(nameWatch), { shouldValidate: true });
  }, [mode, nameWatch, form]);

  const createMut = trpc.product.create.useMutation({
    onError: () => toast.error("Đã xảy ra lỗi, vui lòng thử lại"),
  });
  const updateMut = trpc.product.update.useMutation({
    onError: () => toast.error("Đã xảy ra lỗi, vui lòng thử lại"),
  });

  const buildPayload = (scalar: ScalarForm) => {
    const badge =
      scalar.badge === "none" ? null : scalar.badge;

    const imagePayload = images.map((img, i) => ({
      url: img.url,
      alt: img.alt,
      position: i,
    }));

    const variantPayload = variants.map((v, i) => ({
      name: v.name,
      colorHex: v.colorHex,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      sku: v.sku,
      inStock: v.inStock,
      image: v.image,
      position: i,
    }));

    const body = {
      ...scalar,
      badge,
      images: imagePayload,
      variants: variantPayload,
      collectionIds,
    };

    return productCreateSchema.parse(body);
  };

  const submit = async (
    scalar: ScalarForm,
    opts: { stay?: boolean } = {}
  ) => {
    try {
      const payload = buildPayload(scalar);
      if (mode === "create") {
        const created = await createMut.mutateAsync(payload);
        toast.success("Đã lưu thành công");
        if (opts.stay) {
          router.push(`/admin/products/${created.id}`);
        } else {
          router.push("/admin/products");
        }
        router.refresh();
      } else if (source) {
        await updateMut.mutateAsync({
          id: source.id,
          ...payload,
        });
        toast.success("Đã lưu thành công");
        if (!opts.stay) {
          router.push("/admin/products");
        }
        router.refresh();
      }
    } catch {
      /* toast trong mutation / parse */
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit((vals) => submit(vals))}
      className="space-y-8"
    >
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên sản phẩm *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="VD: Ghế bar cao cấp"
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  {...form.register("slug")}
                  onChange={(e) => {
                    slugManual.current = true;
                    form.setValue("slug", e.target.value, {
                      shouldValidate: true,
                    });
                  }}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input id="sku" {...form.register("sku")} className="font-mono" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortDescription">Mô tả ngắn (tối đa 200 ký tự)</Label>
                <Textarea
                  id="shortDescription"
                  {...form.register("shortDescription")}
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  {form.watch("shortDescription")?.length ?? 0}/200
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mô tả chi tiết</CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                name="description"
                control={form.control}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value || ""}
                    onChange={field.onChange}
                  />
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUploader value={images} onChange={setImages} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Biến thể</CardTitle>
            </CardHeader>
            <CardContent>
              <VariantManager value={variants} onChange={setVariants} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">
                  SEO Title ({seoTitleWatch?.length ?? 0}/60)
                </Label>
                <Input
                  id="seoTitle"
                  maxLength={60}
                  {...form.register("seoTitle")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDescription">
                  SEO Description ({seoDescWatch?.length ?? 0}/160)
                </Label>
                <Textarea
                  id="seoDescription"
                  maxLength={160}
                  rows={3}
                  {...form.register("seoDescription")}
                />
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Xem trước kết quả tìm kiếm
                </p>
                <p className="text-sm text-primary">
                  {SITE_URL}/products/{slugWatch || "slug"}
                </p>
                <p className="mt-1 text-lg font-medium text-foreground">
                  {seoTitleWatch || nameWatch || "Tiêu đề trang"}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {seoDescWatch || form.watch("shortDescription") || "Mô tả sẽ hiển thị tại đây."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Giá &amp; kho</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">Giá bán (₫) *</Label>
                <Input
                  id="price"
                  type="number"
                  min={1}
                  {...form.register("price", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compareAtPrice">Giá gốc (₫)</Label>
                <Controller
                  name="compareAtPrice"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="compareAtPrice"
                      type="number"
                      min={0}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(v === "" ? null : Number(v));
                      }}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Tồn kho</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  min={0}
                  {...form.register("stockQuantity", { valueAsNumber: true })}
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="inStock">Còn hàng</Label>
                <Controller
                  name="inStock"
                  control={form.control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bộ sưu tập</CardTitle>
            </CardHeader>
            <CardContent className="max-h-64 space-y-2 overflow-y-auto">
              {collections.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có danh mục</p>
              ) : (
                collections.map((c: CollectionListItem) => (
                  <label
                    key={c.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-sm hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={collectionIds.includes(c.id)}
                      onCheckedChange={(checked) => {
                        setCollectionIds((prev) =>
                          checked
                            ? [...prev, c.id]
                            : prev.filter((id) => id !== c.id)
                        );
                      }}
                    />
                    {c.name}
                  </label>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cài đặt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="isFeatured">Sản phẩm nổi bật</Label>
                <Controller
                  name="isFeatured"
                  control={form.control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Badge</Label>
                <Controller
                  name="badge"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Badge" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Không có</SelectItem>
                        <SelectItem value="bestseller">Bán chạy</SelectItem>
                        <SelectItem value="new">Mới</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Thứ tự hiển thị</Label>
                <Input
                  id="position"
                  type="number"
                  {...form.register("position", { valueAsNumber: true })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t pt-6">
        <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
          Lưu
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={createMut.isPending || updateMut.isPending}
          onClick={form.handleSubmit((vals) => submit(vals, { stay: true }))}
        >
          Lưu &amp; tiếp tục chỉnh sửa
        </Button>
        <Link href="/admin/products">
          <Button type="button" variant="ghost">
            Hủy
          </Button>
        </Link>
      </div>
    </form>
  );
}

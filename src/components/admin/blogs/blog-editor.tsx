"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogThumbnail } from "@/components/admin/blogs/blog-thumbnail";
import { SITE_NAME } from "@/lib/constants";

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

type PostFull = inferRouterOutputs<AppRouter>["blog"]["getById"];

const schema = z.object({
  title: z.string().min(1, "Nhập tiêu đề"),
  slug: z.string().min(1),
  excerpt: z.string().max(300),
  content: z.string(),
  thumbnail: z.string().nullable(),
  author: z.string().min(1),
  tags: z.array(z.string()),
  isPublished: z.boolean(),
  publishedAtLocal: z.string().optional(),
  seoTitle: z.string(),
  seoDescription: z.string(),
});

type FormValues = z.infer<typeof schema>;

function toDatetimeLocal(d: Date | string | null): string {
  if (!d) return "";
  const x = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}T${pad(x.getHours())}:${pad(x.getMinutes())}`;
}

export function BlogEditor({
  mode,
  initialPost,
}: {
  mode: "create" | "edit";
  initialPost?: PostFull;
}) {
  const router = useRouter();
  const slugManual = React.useRef(false);
  const [tagInput, setTagInput] = React.useState("");

  const createMut = trpc.blog.create.useMutation({
    onSuccess: (p) => {
      toast.success("Đã lưu thành công");
      router.push(`/admin/blogs/${p.id}`);
      router.refresh();
    },
    onError: () => toast.error("Đã xảy ra lỗi, vui lòng thử lại"),
  });

  const updateMut = trpc.blog.update.useMutation({
    onSuccess: () => {
      toast.success("Đã lưu thành công");
      router.refresh();
    },
    onError: () => toast.error("Đã xảy ra lỗi, vui lòng thử lại"),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialPost
      ? {
          title: initialPost.title,
          slug: initialPost.slug,
          excerpt: initialPost.excerpt,
          content: initialPost.content,
          thumbnail: initialPost.thumbnail,
          author: initialPost.author,
          tags: Array.isArray(initialPost.tags) ? [...initialPost.tags] : [],
          isPublished: initialPost.isPublished,
          publishedAtLocal: toDatetimeLocal(initialPost.publishedAt),
          seoTitle: initialPost.seoTitle,
          seoDescription: initialPost.seoDescription,
        }
      : {
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          thumbnail: null,
          author: SITE_NAME,
          tags: [],
          isPublished: false,
          publishedAtLocal: "",
          seoTitle: "",
          seoDescription: "",
        },
  });

  const titleWatch = form.watch("title");
  React.useEffect(() => {
    if (mode === "edit" || slugManual.current) return;
    form.setValue("slug", slugify(titleWatch), { shouldValidate: true });
  }, [mode, titleWatch, form]);

  const tags = form.watch("tags");
  const addTag = (raw: string) => {
    const t = raw.trim();
    if (!t || tags.includes(t)) return;
    form.setValue("tags", [...tags, t], { shouldValidate: true });
  };

  const onSubmit = (vals: FormValues) => {
    let publishedAt: Date | null | undefined;
    if (vals.isPublished) {
      publishedAt = vals.publishedAtLocal
        ? new Date(vals.publishedAtLocal)
        : new Date();
    } else {
      publishedAt = null;
    }

    if (mode === "create") {
      createMut.mutate({
        slug: vals.slug,
        title: vals.title,
        excerpt: vals.excerpt,
        content: vals.content,
        thumbnail: vals.thumbnail,
        author: vals.author,
        tags: vals.tags,
        isPublished: vals.isPublished,
        publishedAt,
        seoTitle: vals.seoTitle,
        seoDescription: vals.seoDescription,
      });
    } else if (initialPost) {
      updateMut.mutate({
        id: initialPost.id,
        slug: vals.slug,
        title: vals.title,
        excerpt: vals.excerpt,
        content: vals.content,
        thumbnail: vals.thumbnail,
        author: vals.author,
        tags: vals.tags,
        isPublished: vals.isPublished,
        publishedAt,
        seoTitle: vals.seoTitle,
        seoDescription: vals.seoDescription,
      });
    }
  };

  const seoTitle = form.watch("seoTitle");
  const seoDesc = form.watch("seoDescription");

  return (
    <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Nội dung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input id="title" {...form.register("title")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  {...form.register("slug")}
                  onChange={(e) => {
                    slugManual.current = true;
                    form.setValue("slug", e.target.value);
                  }}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Tóm tắt (tối đa 300 ký tự)</Label>
                <Textarea
                  id="excerpt"
                  rows={3}
                  maxLength={300}
                  {...form.register("excerpt")}
                />
                <p className="text-xs text-muted-foreground">
                  {form.watch("excerpt")?.length ?? 0}/300
                </p>
              </div>
              <div className="space-y-2">
                <Label>Nội dung</Label>
                <Controller
                  name="content"
                  control={form.control}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ảnh đại diện</CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                name="thumbnail"
                control={form.control}
                render={({ field }) => (
                  <BlogThumbnail
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <Badge key={t} variant="secondary" className="gap-1 pr-1">
                    {t}
                    <button
                      type="button"
                      className="ml-1 rounded-sm hover:bg-muted"
                      onClick={() =>
                        form.setValue(
                          "tags",
                          tags.filter((x) => x !== t),
                          { shouldValidate: true }
                        )
                      }
                      aria-label={`Xóa ${t}`}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Nhập tag, Enter để thêm"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(tagInput);
                    setTagInput("");
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Xuất bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="author">Tác giả</Label>
                <Input id="author" {...form.register("author")} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="pub">Xuất bản</Label>
                <Switch
                  id="pub"
                  checked={form.watch("isPublished")}
                  onCheckedChange={(c) => form.setValue("isPublished", c)}
                />
              </div>
              {form.watch("isPublished") && (
                <div className="space-y-2">
                  <Label htmlFor="pdt">Ngày đăng</Label>
                  <Input
                    id="pdt"
                    type="datetime-local"
                    {...form.register("publishedAtLocal")}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title ({seoTitle?.length ?? 0}/60)</Label>
                <Input id="seoTitle" maxLength={60} {...form.register("seoTitle")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDescription">
                  SEO Description ({seoDesc?.length ?? 0}/160)
                </Label>
                <Textarea
                  id="seoDescription"
                  maxLength={160}
                  rows={3}
                  {...form.register("seoDescription")}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t pt-6">
        <Button
          type="submit"
          disabled={createMut.isPending || updateMut.isPending}
        >
          Lưu
        </Button>
        <Link href="/admin/blogs">
          <Button type="button" variant="ghost">
            Hủy
          </Button>
        </Link>
      </div>
    </form>
  );
}

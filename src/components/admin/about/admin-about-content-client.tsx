"use client";

import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import Link from "next/link";
import { ExternalLink, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import {
  aboutPageContentSchema,
  siteContentSchema,
  type AboutPageContentData,
  type AboutPillarIcon,
  type SiteContentData,
} from "@/lib/site-content-schema";
import { defaultSiteContent } from "@/content/site-defaults";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AdminImageUrlField } from "@/components/admin/admin-image-url-field";

const PILLAR_ICON_OPTIONS: { value: AboutPillarIcon; label: string }[] = [
  { value: "factory", label: "Nhà máy / sản xuất (factory)" },
  { value: "sparkles", label: "Thiết kế / nổi bật (sparkles)" },
  { value: "heartHandshake", label: "Phục vụ / cam kết (heartHandshake)" },
];

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function joinParagraphs(arr: string[]): string {
  return arr.join("\n\n");
}

/** Giá trị form — đoạn văn mỗi khối = một textarea (tách đoạn bằng dòng trống). */
export type AboutPageFormValues = {
  meta: AboutPageContentData["meta"];
  organizationJsonLd: AboutPageContentData["organizationJsonLd"];
  hero: AboutPageContentData["hero"];
  stats: { value: string; label: string }[];
  story: AboutPageContentData["story"];
  pillars: { icon: AboutPillarIcon; title: string; text: string }[];
  sections: {
    eyebrow: string;
    title: string;
    paragraphsText: string;
    trailingImageUrl: string;
    trailingImageAlt: string;
  }[];
  cta: AboutPageContentData["cta"];
};

/** `unknown` để nhận cả bản `as const` từ `defaultSiteContent`. */
function contentToFormValues(c: unknown): AboutPageFormValues {
  const x = JSON.parse(JSON.stringify(c)) as AboutPageContentData;
  return {
    meta: { ...x.meta },
    organizationJsonLd: { ...x.organizationJsonLd },
    hero: { ...x.hero },
    stats: x.stats.map((s) => ({ value: s.value, label: s.label })),
    story: {
      ...x.story,
      primaryCta: { ...x.story.primaryCta },
      secondaryCta: { ...x.story.secondaryCta },
    },
    pillars: x.pillars.map((p) => ({
      icon: p.icon,
      title: p.title,
      text: p.text,
    })),
    sections: x.sections.map((s) => ({
      eyebrow: s.eyebrow,
      title: s.title,
      paragraphsText: joinParagraphs(s.paragraphs),
      trailingImageUrl: s.trailingImage?.url ?? "",
      trailingImageAlt: s.trailingImage?.alt ?? "",
    })),
    cta: {
      ...x.cta,
    },
  };
}

function formValuesToContent(f: AboutPageFormValues): AboutPageContentData {
  return {
    meta: f.meta,
    organizationJsonLd: f.organizationJsonLd,
    hero: f.hero,
    stats: f.stats.map((s) => ({ value: s.value.trim(), label: s.label.trim() })),
    story: f.story,
    pillars: f.pillars.map((p) => ({
      icon: p.icon,
      title: p.title.trim(),
      text: p.text.trim(),
    })),
    sections: f.sections.map((s) => {
      const paragraphs = splitParagraphs(s.paragraphsText);
      const alt = s.trailingImageAlt.trim();
      const url = s.trailingImageUrl.trim();
      return {
        eyebrow: s.eyebrow.trim(),
        title: s.title.trim(),
        paragraphs,
        ...(alt || url ? { trailingImage: { alt, url } } : {}),
      };
    }),
    cta: f.cta,
  };
}

function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4 rounded-lg border bg-card/50 p-4 sm:p-5", className)}>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function AdminAboutContentClient() {
  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.site.getAdmin.useQuery(undefined, {
    staleTime: 60_000,
  });

  const form = useForm<AboutPageFormValues>({
    defaultValues: contentToFormValues(
      defaultSiteContent.aboutPageContent,
    ),
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isDirty },
  } = form;

  const statsFA = useFieldArray({ control, name: "stats" });
  const pillarsFA = useFieldArray({ control, name: "pillars" });
  const sectionsFA = useFieldArray({ control, name: "sections" });

  /** Tránh hydration mismatch: SSR & lần render đầu trên client cùng một chuỗi; sau mount mới đọc cache tRPC / locale. */
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    const about =
      data?.content?.aboutPageContent ?? defaultSiteContent.aboutPageContent;
    reset(contentToFormValues(about));
  }, [data?.updatedAt, reset]);

  const updateMut = trpc.site.update.useMutation({
    onSuccess: async () => {
      toast.success("Đã lưu nội dung trang Giới thiệu");
      await utils.site.getAdmin.invalidate();
      await utils.site.getPublic.invalidate();
    },
    onError: (e) => toast.error(e.message || "Không lưu được"),
  });

  function applyTemplate() {
    reset(contentToFormValues(defaultSiteContent.aboutPageContent));
    toast.message("Đã nạp bản mẫu — kiểm tra rồi nhấn Lưu");
  }

  function onSubmit(values: AboutPageFormValues) {
    const about = formValuesToContent(values);
    const aboutResult = aboutPageContentSchema.safeParse(about);
    if (!aboutResult.success) {
      const first = aboutResult.error.issues[0];
      toast.error(
        first
          ? `${first.path.join(".")}: ${first.message}`
          : "Dữ liệu chưa đúng định dạng",
      );
      return;
    }
    const baseFullNow = (data?.content ??
      defaultSiteContent) as SiteContentData;
    const merged: SiteContentData = {
      ...baseFullNow,
      aboutPageContent: aboutResult.data,
    };
    const full = siteContentSchema.safeParse(merged);
    if (!full.success) {
      const first = full.error.issues[0];
      toast.error(
        first ? `${first.path.join(".")}: ${first.message}` : "Không gộp được site",
      );
      return;
    }
    updateMut.mutate({ content: full.data });
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <CardTitle>Trang Giới thiệu</CardTitle>
          <CardDescription>
            <span>
              Chỉnh nội dung hiển thị tại <strong>/about</strong> — SEO, lời dẫn, số liệu,
              cột trụ và các khối chữ. Mỗi khối nội dung dài: tách <strong>đoạn</strong> bằng{" "}
              <strong>một dòng trống</strong> (Enter hai lần). Dán link ảnh (https hoặc đường
            dẫn <code className="rounded bg-muted px-1">/...</code> trong website) để thay ảnh
            mặc định. Domain ngoài được phép hiển thị do{" "}
            <Link href="/admin/image-domains" className="font-medium text-primary underline">
              Quản lý domain ảnh
            </Link>{" "}
            (danh sách trống = không chặn domain).
            </span>
          </CardDescription>
          <p className="mt-2 text-xs text-muted-foreground">
            {!hydrated
              ? "Đang tải trạng thái lưu…"
              : data?.updatedAt
                ? `Site cập nhật: ${new Date(data.updatedAt).toLocaleString("vi-VN")}`
                : "Chưa có bản lưu DB — đang dùng mặc định trong code."}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            <strong>Xem trước website:</strong> nhấn nút bên phải để mở trang công khai (tab
            mới). Cần <strong>Lưu</strong> trước thì khách mới thấy nội dung và ảnh mới.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "inline-flex items-center",
            )}
          >
            <ExternalLink className="mr-2 size-4" />
            Xem trang Giới thiệu
          </Link>
          <Button type="button" variant="outline" size="sm" onClick={applyTemplate}>
            <RotateCcw className="mr-1 size-4" />
            Nạp mẫu
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Đang tải…</p>}
        {error && (
          <p className="text-sm text-destructive">{error.message}</p>
        )}
        {!isLoading && !error && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <FormSection
              title="Google & mạng xã hội (SEO)"
              description="Tiêu đề tab trình duyệt, mô tả ngắn khi chia sẻ link, và tiêu đề Open Graph."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="ab-meta-title">Tiêu đề trang (meta title)</Label>
                  <Input
                    id="ab-meta-title"
                    className="mt-1"
                    {...register("meta.title")}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="ab-meta-desc">Mô tả (meta description)</Label>
                  <Textarea
                    id="ab-meta-desc"
                    rows={2}
                    className="mt-1"
                    {...register("meta.description")}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="ab-meta-og">Tiêu đề khi chia sẻ (OG title)</Label>
                  <Input
                    id="ab-meta-og"
                    className="mt-1"
                    {...register("meta.openGraphTitle")}
                  />
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Mô tả doanh nghiệp (dữ liệu có cấu trúc)"
              description="Đoạn mô tả ngắn dùng cho thông tin tổ chức (JSON-LD) — hỗ trợ hiển thị trên Google."
            >
              <div>
                <Label htmlFor="ab-org-desc">Giới thiệu ngắn về thương hiệu</Label>
                <Textarea
                  id="ab-org-desc"
                  rows={3}
                  className="mt-1"
                  {...register("organizationJsonLd.description")}
                />
              </div>
            </FormSection>

            <FormSection
              title="Khu vực đầu trang (hero)"
              description="Ảnh nền phía sau chữ (toàn chiều ngang). Dòng chữ lớn và đoạn dẫn ngay dưới menu."
            >
              <div className="grid gap-3">
                <div>
                  <Label htmlFor="ab-hero-h1">Tiêu đề chính (H1)</Label>
                  <Input id="ab-hero-h1" className="mt-1" {...register("hero.h1")} />
                </div>
                <div>
                  <Label htmlFor="ab-hero-lead">Đoạn dẫn</Label>
                  <Textarea
                    id="ab-hero-lead"
                    rows={3}
                    className="mt-1"
                    {...register("hero.lead")}
                  />
                </div>
                <AdminImageUrlField<AboutPageFormValues>
                  inputId="ab-hero-bg"
                  label="Ảnh nền hero — link URL"
                  hint="Ví dụ link CDN hoặc upload bên dưới. Để trống = ảnh mặc định của trang."
                  fieldPath="hero.backgroundImageUrl"
                  register={register}
                  watch={watch}
                  setValue={setValue}
                />
              </div>
            </FormSection>

            <FormSection
              title="Số nổi bật (4 ô)"
              description="Ví dụ: năm kinh nghiệm, số tỉnh phục vụ… Có thể thêm/bớt dòng (khuyến nghị 4 ô)."
            >
              <div className="space-y-3">
                {statsFA.fields.map((field, i) => (
                  <div
                    key={field.id}
                    className="flex flex-wrap items-end gap-2 rounded-md border bg-background p-3"
                  >
                    <div className="min-w-20 flex-1">
                      <Label>Số / chữ nổi bật</Label>
                      <Input className="mt-1 font-mono" {...register(`stats.${i}.value`)} />
                    </div>
                    <div className="min-w-40 flex-2">
                      <Label>Chú thích bên dưới</Label>
                      <Input className="mt-1" {...register(`stats.${i}.label`)} />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive shrink-0"
                      onClick={() => statsFA.remove(i)}
                      aria-label="Xóa dòng"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => statsFA.append({ value: "", label: "" })}
                >
                  <Plus className="mr-1 size-4" />
                  Thêm ô số liệu
                </Button>
              </div>
            </FormSection>

            <FormSection
              title="Khối câu chuyện (ảnh + chữ)"
              description="Một khối lớn: nhãn nhỏ phía trên, tiêu đề, ảnh bên cạnh (hoặc trên mobile), đoạn văn và hai nút dẫn link."
            >
              <div className="grid gap-3">
                <div>
                  <Label>Chú thích phía trên tiêu đề (eyebrow)</Label>
                  <Input className="mt-1" {...register("story.eyebrow")} />
                </div>
                <div>
                  <Label>Tiêu đề khối</Label>
                  <Input className="mt-1" {...register("story.title")} />
                </div>
                <AdminImageUrlField<AboutPageFormValues>
                  inputId="ab-story-img"
                  label="Ảnh khối câu chuyện — link URL"
                  hint="Ảnh bên trái (desktop). Để trống = ảnh mặc định."
                  fieldPath="story.imageUrl"
                  register={register}
                  watch={watch}
                  setValue={setValue}
                />
                <div>
                  <Label>Chú thích ảnh (alt) — cho SEO &amp; trợ năng</Label>
                  <Input className="mt-1" {...register("story.imageAlt")} />
                </div>
                <div>
                  <Label>Đoạn văn chính</Label>
                  <Textarea rows={5} className="mt-1" {...register("story.body")} />
                </div>
                <Separator />
                <p className="text-xs font-medium text-muted-foreground">Nút hành động</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Nút chính — nhãn</Label>
                    <Input className="mt-1" {...register("story.primaryCta.label")} />
                  </div>
                  <div>
                    <Label>Nút chính — đường dẫn</Label>
                    <Input
                      className="mt-1 font-mono text-sm"
                      placeholder="/collections"
                      {...register("story.primaryCta.href")}
                    />
                  </div>
                  <div>
                    <Label>Nút phụ — nhãn</Label>
                    <Input className="mt-1" {...register("story.secondaryCta.label")} />
                  </div>
                  <div>
                    <Label>Nút phụ — đường dẫn</Label>
                    <Input
                      className="mt-1 font-mono text-sm"
                      placeholder="/contact"
                      {...register("story.secondaryCta.href")}
                    />
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Ba cột trụ (icon + tiêu đề + mô tả)"
              description="Chọn icon phù hợp nội dung; mỗi cột một đoạn ngắn."
            >
              <div className="space-y-4">
                {pillarsFA.fields.map((field, i) => (
                  <div
                    key={field.id}
                    className="space-y-3 rounded-md border bg-background p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Cột {i + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => pillarsFA.remove(i)}
                      >
                        <Trash2 className="mr-1 size-4" />
                        Xóa
                      </Button>
                    </div>
                    <div>
                      <Label>Biểu tượng</Label>
                      <Select
                        value={watch(`pillars.${i}.icon`)}
                        onValueChange={(v) =>
                          setValue(`pillars.${i}.icon`, v as AboutPillarIcon, {
                            shouldDirty: true,
                          })
                        }
                      >
                        <SelectTrigger className="mt-1 w-full min-w-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PILLAR_ICON_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Tiêu đề cột</Label>
                      <Input className="mt-1" {...register(`pillars.${i}.title`)} />
                    </div>
                    <div>
                      <Label>Nội dung</Label>
                      <Textarea rows={3} className="mt-1" {...register(`pillars.${i}.text`)} />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    pillarsFA.append({
                      icon: "factory",
                      title: "",
                      text: "",
                    })
                  }
                >
                  <Plus className="mr-1 size-4" />
                  Thêm cột trụ
                </Button>
              </div>
            </FormSection>

            <FormSection
              title="Các khối nội dung phía dưới"
              description="Mỗi khối có nhãn nhỏ, tiêu đề và nhiều đoạn văn. Để tách đoạn: Enter hai lần (dòng trống). Có thể thêm ảnh minh họa cuối khối: dán link và chú thích (alt)."
            >
              <div className="space-y-6">
                {sectionsFA.fields.map((field, i) => (
                  <div
                    key={field.id}
                    className="space-y-3 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold">Khối {i + 1}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => sectionsFA.remove(i)}
                      >
                        <Trash2 className="mr-1 size-4" />
                        Xóa khối
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label>Nhãn phía trên (eyebrow)</Label>
                        <Input className="mt-1" {...register(`sections.${i}.eyebrow`)} />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Tiêu đề khối</Label>
                        <Input className="mt-1" {...register(`sections.${i}.title`)} />
                      </div>
                    </div>
                    <div>
                      <Label>Nội dung các đoạn</Label>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Mỗi đoạn cách nhau bằng một dòng trống (Enter hai lần).
                      </p>
                      <Textarea
                        rows={8}
                        className="mt-1 font-sans text-sm leading-relaxed"
                        {...register(`sections.${i}.paragraphsText`)}
                      />
                    </div>
                    <AdminImageUrlField<AboutPageFormValues>
                      inputId={`ab-sec-${i}-img`}
                      label="Ảnh minh họa cuối khối — link URL"
                      hint="Để trống cả link và alt nếu không cần ảnh ở khối này."
                      fieldPath={`sections.${i}.trailingImageUrl`}
                      register={register}
                      watch={watch}
                      setValue={setValue}
                    />
                    <div>
                      <Label>Chú thích ảnh (alt)</Label>
                      <Input
                        className="mt-1"
                        placeholder="Ví dụ: Không gian showroom…"
                        {...register(`sections.${i}.trailingImageAlt`)}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    sectionsFA.append({
                      eyebrow: "",
                      title: "",
                      paragraphsText: "",
                      trailingImageUrl: "",
                      trailingImageAlt: "",
                    })
                  }
                >
                  <Plus className="mr-1 size-4" />
                  Thêm khối nội dung
                </Button>
              </div>
            </FormSection>

            <FormSection
              title="Khu vực kêu gọi cuối trang (CTA)"
              description="Thanh kêu gọi hành động trước chân trang."
            >
              <div className="grid gap-3">
                <div>
                  <Label>Tiêu đề</Label>
                  <Input className="mt-1" {...register("cta.title")} />
                </div>
                <div>
                  <Label>Dòng phụ</Label>
                  <Textarea rows={2} className="mt-1" {...register("cta.subtitle")} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Chữ trên nút</Label>
                    <Input className="mt-1" {...register("cta.buttonLabel")} />
                  </div>
                  <div>
                    <Label>Link nút</Label>
                    <Input
                      className="mt-1 font-mono text-sm"
                      placeholder="/contact"
                      {...register("cta.buttonHref")}
                    />
                  </div>
                </div>
              </div>
            </FormSection>

            <Button type="submit" disabled={updateMut.isPending || !isDirty}>
              <Save className="mr-2 size-4" />
              Lưu trang Giới thiệu
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

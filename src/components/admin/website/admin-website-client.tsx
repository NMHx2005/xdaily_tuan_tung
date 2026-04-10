"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { siteContentSchema, type SiteContentData } from "@/lib/site-content-schema";
import { defaultSiteContent } from "@/content/site-defaults";
import { AdminImageUrlField } from "@/components/admin/admin-image-url-field";
import { Button } from "@/components/ui/button";
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
import { RotateCcw } from "lucide-react";

export type WebsiteFormValues = {
  logoUrl: string;
  brandName: string;
  brandFooterTagline: string;
  hotlineDigits: string;
  hotlineDisplay: string;
  contactEmail: string;
  address: string;
  openingHours: string;
  contactMetaTitle: string;
  contactMetaDescription: string;
  contactMetaOg: string;
  contactHeroTitle: string;
  contactHeroLead: string;
  contactHintPrefix: string;
  contactHintProducts: string;
  contactHintCart: string;
  labelAddress: string;
  labelHotline: string;
  labelEmail: string;
  labelHours: string;
  labelMapOpen: string;
  labelCall: string;
  labelSendEmail: string;
};

function toWebsiteValues(c: SiteContentData): WebsiteFormValues {
  return {
    logoUrl: c.siteBrand.logoUrl,
    brandName: c.siteBrand.name,
    brandFooterTagline: c.siteBrand.footerTagline,
    hotlineDigits: c.siteContact.hotlineDigits,
    hotlineDisplay: c.siteContact.hotlineDisplay,
    contactEmail: c.siteContact.email,
    address: c.siteContact.address,
    openingHours: c.siteContact.openingHours,
    contactMetaTitle: c.contactPageContent.meta.title,
    contactMetaDescription: c.contactPageContent.meta.description,
    contactMetaOg: c.contactPageContent.meta.openGraphTitle,
    contactHeroTitle: c.contactPageContent.hero.title,
    contactHeroLead: c.contactPageContent.hero.lead,
    contactHintPrefix: c.contactPageContent.bottomHint.prefix,
    contactHintProducts: c.contactPageContent.bottomHint.linkProductsLabel,
    contactHintCart: c.contactPageContent.bottomHint.linkCartLabel,
    labelAddress: c.contactPageContent.cardLabels.address,
    labelHotline: c.contactPageContent.cardLabels.hotline,
    labelEmail: c.contactPageContent.cardLabels.email,
    labelHours: c.contactPageContent.cardLabels.hours,
    labelMapOpen: c.contactPageContent.cardLabels.mapOpen,
    labelCall: c.contactPageContent.cardLabels.call,
    labelSendEmail: c.contactPageContent.cardLabels.sendEmail,
  };
}

function mergeWebsiteIntoBase(
  base: SiteContentData,
  q: WebsiteFormValues,
): SiteContentData {
  return {
    ...base,
    siteBrand: {
      logoUrl: q.logoUrl.trim(),
      name: q.brandName,
      footerTagline: q.brandFooterTagline,
    },
    siteContact: {
      hotlineDigits: q.hotlineDigits,
      hotlineDisplay: q.hotlineDisplay,
      email: q.contactEmail,
      address: q.address,
      openingHours: q.openingHours,
    },
    contactPageContent: {
      ...base.contactPageContent,
      meta: {
        title: q.contactMetaTitle,
        description: q.contactMetaDescription,
        openGraphTitle: q.contactMetaOg,
      },
      hero: {
        title: q.contactHeroTitle,
        lead: q.contactHeroLead,
      },
      bottomHint: {
        prefix: q.contactHintPrefix,
        linkProductsLabel: q.contactHintProducts,
        linkCartLabel: q.contactHintCart,
      },
      cardLabels: {
        address: q.labelAddress,
        hotline: q.labelHotline,
        email: q.labelEmail,
        hours: q.labelHours,
        mapOpen: q.labelMapOpen,
        call: q.labelCall,
        sendEmail: q.labelSendEmail,
      },
    },
  };
}

function prettyJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

type Props = {
  baseContent: SiteContentData;
};

export function AdminWebsiteForm({ baseContent }: Props) {
  const utils = trpc.useUtils();
  const updateMut = trpc.site.update.useMutation({
    onSuccess: async () => {
      toast.success("Đã lưu website & liên hệ");
      await utils.site.getAdmin.invalidate();
      await utils.site.getPublic.invalidate();
    },
    onError: (e) => toast.error(e.message || "Không lưu được"),
  });

  const form = useForm<WebsiteFormValues>({
    defaultValues: toWebsiteValues(baseContent),
  });
  const { register, handleSubmit, formState, setValue, watch } = form;

  React.useEffect(() => {
    form.reset(toWebsiteValues(baseContent));
  }, [baseContent, form]);

  function onSubmit(values: WebsiteFormValues) {
    const merged = mergeWebsiteIntoBase(baseContent, values);
    const parsed = siteContentSchema.safeParse(merged);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast.error(
        first
          ? `${first.path.join(".")}: ${first.message}`
          : "Dữ liệu không hợp lệ",
      );
      return;
    }
    updateMut.mutate({ content: parsed.data });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thương hiệu &amp; liên hệ</CardTitle>
        <CardDescription>
          Logo header, tên, hotline, địa chỉ, email và nội dung trang Liên hệ
          (SEO, hero, nhãn). Trang Giới thiệu chỉnh tại mục riêng.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Logo &amp; thương hiệu</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <AdminImageUrlField<WebsiteFormValues>
                  inputId="w-logo-url"
                  label="URL logo (header)"
                  hint="Dán link hoặc upload. Domain ngoài: cấu hình tại Quản lý domain ảnh nếu bạn bật danh sách chặn."
                  fieldPath="logoUrl"
                  register={register}
                  watch={watch}
                  setValue={setValue}
                />
              </div>
              <div>
                <Label htmlFor="w-brand-name">Tên thương hiệu</Label>
                <Input id="w-brand-name" className="mt-1" {...register("brandName")} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="w-brand-tag">Tagline chân trang</Label>
                <Input id="w-brand-tag" className="mt-1" {...register("brandFooterTagline")} />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Liên hệ (header / footer)</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="w-hotline-d">Hotline (số gọi)</Label>
                <Input id="w-hotline-d" className="mt-1" {...register("hotlineDigits")} />
              </div>
              <div>
                <Label htmlFor="w-hotline-disp">Hotline (hiển thị)</Label>
                <Input id="w-hotline-disp" className="mt-1" {...register("hotlineDisplay")} />
              </div>
              <div>
                <Label htmlFor="w-email">Email</Label>
                <Input id="w-email" type="email" className="mt-1" {...register("contactEmail")} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="w-address">Địa chỉ</Label>
                <Input id="w-address" className="mt-1" {...register("address")} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="w-hours">Giờ làm việc</Label>
                <Input id="w-hours" className="mt-1" {...register("openingHours")} />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Trang Liên hệ — SEO &amp; hero</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="w-cmeta-title">Meta title</Label>
                <Input id="w-cmeta-title" className="mt-1" {...register("contactMetaTitle")} />
              </div>
              <div>
                <Label htmlFor="w-cmeta-og">OG title</Label>
                <Input id="w-cmeta-og" className="mt-1" {...register("contactMetaOg")} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="w-cmeta-desc">Meta description</Label>
                <Input id="w-cmeta-desc" className="mt-1" {...register("contactMetaDescription")} />
              </div>
              <div>
                <Label htmlFor="w-chero-t">Tiêu đề hero</Label>
                <Input id="w-chero-t" className="mt-1" {...register("contactHeroTitle")} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="w-chero-l">Lead hero</Label>
                <Input id="w-chero-l" className="mt-1" {...register("contactHeroLead")} />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Trang Liên hệ — gợi ý &amp; nhãn thẻ</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="w-hint-p">Prefix gợi ý cuối</Label>
                <Input id="w-hint-p" className="mt-1" {...register("contactHintPrefix")} />
              </div>
              <div>
                <Label>Nhãn link sản phẩm</Label>
                <Input className="mt-1" {...register("contactHintProducts")} />
              </div>
              <div>
                <Label>Nhãn link giỏ</Label>
                <Input className="mt-1" {...register("contactHintCart")} />
              </div>
              <div>
                <Label>Nhãn địa chỉ</Label>
                <Input className="mt-1" {...register("labelAddress")} />
              </div>
              <div>
                <Label>Nhãn hotline</Label>
                <Input className="mt-1" {...register("labelHotline")} />
              </div>
              <div>
                <Label>Nhãn email</Label>
                <Input className="mt-1" {...register("labelEmail")} />
              </div>
              <div>
                <Label>Nhãn giờ</Label>
                <Input className="mt-1" {...register("labelHours")} />
              </div>
              <div>
                <Label>Nhãn mở bản đồ</Label>
                <Input className="mt-1" {...register("labelMapOpen")} />
              </div>
              <div>
                <Label>Nhãn gọi</Label>
                <Input className="mt-1" {...register("labelCall")} />
              </div>
              <div>
                <Label>Nhãn gửi email</Label>
                <Input className="mt-1" {...register("labelSendEmail")} />
              </div>
            </div>
          </section>

          <Button type="submit" disabled={updateMut.isPending || !formState.isDirty}>
            <Save className="mr-2 size-4" />
            Lưu
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function AdminFullSiteJsonCard() {
  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.site.getAdmin.useQuery(undefined, {
    staleTime: 60_000,
  });
  const [text, setText] = React.useState("");
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    if (data?.content) {
      setText(prettyJson(data.content));
      setDirty(false);
    }
  }, [data?.content, data?.updatedAt]);

  const updateMut = trpc.site.update.useMutation({
    onSuccess: async () => {
      toast.success("Đã lưu JSON toàn site");
      setDirty(false);
      await utils.site.getAdmin.invalidate();
      await utils.site.getPublic.invalidate();
    },
    onError: (e) => toast.error(e.message || "Không lưu được"),
  });

  function applyTemplate() {
    setText(prettyJson(defaultSiteContent));
    setDirty(true);
    toast.message("Đã nạp bản mẫu — nhấn Lưu để áp dụng");
  }

  function handleSave() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      toast.error("JSON không hợp lệ");
      return;
    }
    const result = siteContentSchema.safeParse(parsed);
    if (!result.success) {
      const first = result.error.issues[0];
      toast.error(
        first ? `${first.path.join(".")}: ${first.message}` : "Sai cấu trúc",
      );
      return;
    }
    updateMut.mutate({ content: result.data });
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>JSON toàn bộ site (nâng cao)</CardTitle>
          <CardDescription>
            Sửa trực tiếp toàn <code className="rounded bg-muted px-1">siteContent</code> khi
            cần chỉnh sâu (trang Giới thiệu phức tạp, v.v.).
          </CardDescription>
          {data?.updatedAt ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Cập nhật: {new Date(data.updatedAt).toLocaleString("vi-VN")}
            </p>
          ) : null}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={applyTemplate}>
          <RotateCcw className="mr-1 size-4" />
          Nạp mẫu
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground">Đang tải…</p>}
        {error && (
          <p className="text-sm text-destructive">{error.message}</p>
        )}
        {!isLoading && !error && (
          <>
            <Label htmlFor="full-site-json">siteContent (JSON)</Label>
            <Textarea
              id="full-site-json"
              spellCheck={false}
              rows={22}
              className="min-h-[320px] font-mono text-xs leading-relaxed"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setDirty(true);
              }}
            />
            <Button
              type="button"
              disabled={updateMut.isPending || !dirty}
              onClick={handleSave}
            >
              <Save className="mr-2 size-4" />
              Lưu JSON
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminWebsiteClient() {
  const { data, isLoading, error } = trpc.site.getAdmin.useQuery(undefined, {
    staleTime: 60_000,
  });
  const base = (data?.content ?? defaultSiteContent) as SiteContentData;

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Đang tải…</p>;
  }
  if (error) {
    return <p className="text-sm text-destructive">{error.message}</p>;
  }

  return (
    <div className="space-y-8">
      <AdminWebsiteForm
        key={data?.updatedAt != null ? String(data.updatedAt) : "default"}
        baseContent={base}
      />
      <AdminFullSiteJsonCard />
    </div>
  );
}

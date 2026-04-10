"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { siteContentSchema, type SiteContentData } from "@/lib/site-content-schema";
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

/** Giá trị phẳng cho form — map vào `SiteContentData` khi lưu. */
export type QuickSiteFormValues = {
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
  aboutMetaTitle: string;
  aboutMetaDescription: string;
  aboutMetaOg: string;
  aboutH1: string;
  aboutLead: string;
  aboutOrgDescription: string;
};

function toQuickValues(c: SiteContentData): QuickSiteFormValues {
  return {
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
    aboutMetaTitle: c.aboutPageContent.meta.title,
    aboutMetaDescription: c.aboutPageContent.meta.description,
    aboutMetaOg: c.aboutPageContent.meta.openGraphTitle,
    aboutH1: c.aboutPageContent.hero.h1,
    aboutLead: c.aboutPageContent.hero.lead,
    aboutOrgDescription: c.aboutPageContent.organizationJsonLd.description,
  };
}

function mergeQuickIntoBase(
  base: SiteContentData,
  q: QuickSiteFormValues,
): SiteContentData {
  return {
    ...base,
    siteBrand: {
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
    aboutPageContent: {
      ...base.aboutPageContent,
      meta: {
        title: q.aboutMetaTitle,
        description: q.aboutMetaDescription,
        openGraphTitle: q.aboutMetaOg,
      },
      hero: {
        ...base.aboutPageContent.hero,
        h1: q.aboutH1,
        lead: q.aboutLead,
      },
      organizationJsonLd: {
        description: q.aboutOrgDescription,
      },
    },
  };
}

type Props = {
  baseContent: SiteContentData;
};

export function AdminSiteContentQuickForm({ baseContent }: Props) {
  const utils = trpc.useUtils();
  const updateMut = trpc.site.update.useMutation({
    onSuccess: async () => {
      toast.success("Đã lưu (form nhanh)");
      await utils.site.getAdmin.invalidate();
      await utils.site.getPublic.invalidate();
    },
    onError: (e) => toast.error(e.message || "Không lưu được"),
  });

  const form = useForm<QuickSiteFormValues>({
    defaultValues: toQuickValues(baseContent),
  });

  React.useEffect(() => {
    form.reset(toQuickValues(baseContent));
  }, [baseContent, form]);

  function onSubmit(values: QuickSiteFormValues) {
    const merged = mergeQuickIntoBase(baseContent, values);
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

  const { register, handleSubmit, formState } = form;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form nhanh</CardTitle>
        <CardDescription>
          Chỉnh thương hiệu, liên hệ, nhãn trang Liên hệ và phần đầu trang Giới
          thiệu. Các khối phức tạp (cột trụ, section dài) vẫn chỉnh ở JSON bên
          dưới.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Thương hiệu</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="q-brand-name">Tên thương hiệu</Label>
                <Input id="q-brand-name" className="mt-1" {...register("brandName")} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="q-brand-tag">Tagline chân trang</Label>
                <Input id="q-brand-tag" className="mt-1" {...register("brandFooterTagline")} />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Liên hệ (header / footer)</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="q-hotline-d">Hotline (số gọi)</Label>
                <Input id="q-hotline-d" className="mt-1" {...register("hotlineDigits")} />
              </div>
              <div>
                <Label htmlFor="q-hotline-disp">Hotline (hiển thị)</Label>
                <Input id="q-hotline-disp" className="mt-1" {...register("hotlineDisplay")} />
              </div>
              <div>
                <Label htmlFor="q-email">Email</Label>
                <Input id="q-email" type="email" className="mt-1" {...register("contactEmail")} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="q-address">Địa chỉ</Label>
                <Input id="q-address" className="mt-1" {...register("address")} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="q-hours">Giờ làm việc</Label>
                <Input id="q-hours" className="mt-1" {...register("openingHours")} />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Trang Liên hệ — SEO &amp; hero</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="q-cmeta-title">Meta title</Label>
                <Input id="q-cmeta-title" className="mt-1" {...register("contactMetaTitle")} />
              </div>
              <div>
                <Label htmlFor="q-cmeta-og">OG title</Label>
                <Input id="q-cmeta-og" className="mt-1" {...register("contactMetaOg")} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="q-cmeta-desc">Meta description</Label>
                <Input id="q-cmeta-desc" className="mt-1" {...register("contactMetaDescription")} />
              </div>
              <div>
                <Label htmlFor="q-chero-t">Tiêu đề hero</Label>
                <Input id="q-chero-t" className="mt-1" {...register("contactHeroTitle")} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="q-chero-l">Lead hero</Label>
                <Input id="q-chero-l" className="mt-1" {...register("contactHeroLead")} />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Trang Liên hệ — gợi ý &amp; nhãn thẻ</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="q-hint-p">Prefix gợi ý cuối</Label>
                <Input id="q-hint-p" className="mt-1" {...register("contactHintPrefix")} />
              </div>
              <div>
                <Label htmlFor="q-hint-prod">Nhãn link sản phẩm</Label>
                <Input id="q-hint-prod" className="mt-1" {...register("contactHintProducts")} />
              </div>
              <div>
                <Label htmlFor="q-hint-cart">Nhãn link giỏ</Label>
                <Input id="q-hint-cart" className="mt-1" {...register("contactHintCart")} />
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

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Trang Giới thiệu — đầu trang</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="q-ameta-title">Meta title</Label>
                <Input id="q-ameta-title" className="mt-1" {...register("aboutMetaTitle")} />
              </div>
              <div>
                <Label htmlFor="q-ameta-og">OG title</Label>
                <Input id="q-ameta-og" className="mt-1" {...register("aboutMetaOg")} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="q-ameta-desc">Meta description</Label>
                <Input id="q-ameta-desc" className="mt-1" {...register("aboutMetaDescription")} />
              </div>
              <div>
                <Label htmlFor="q-ah1">H1</Label>
                <Input id="q-ah1" className="mt-1" {...register("aboutH1")} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="q-alead">Lead</Label>
                <Input id="q-alead" className="mt-1" {...register("aboutLead")} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="q-org">Mô tả tổ chức (JSON-LD)</Label>
                <Input id="q-org" className="mt-1" {...register("aboutOrgDescription")} />
              </div>
            </div>
          </section>

          <Button type="submit" disabled={updateMut.isPending || !formState.isDirty}>
            <Save className="mr-2 size-4" />
            Lưu form nhanh
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Breadcrumbs } from "@/components/storefront/collection/breadcrumbs";
import { ContactForm } from "@/components/storefront/contact/contact-form";
import { getMergedSiteContent } from "@/lib/get-site-content";
import { DEFAULT_OG_IMAGE_PATH, getSiteUrl } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getMergedSiteContent();
  const { meta } = site.contactPageContent;
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: "/contact" },
    openGraph: {
      title: meta.openGraphTitle,
      description: meta.description,
      type: "website",
      url: "/contact",
      images: [{ url: DEFAULT_OG_IMAGE_PATH, alt: site.siteBrand.name }],
    },
  };
}

export default async function ContactPage() {
  const site = await getMergedSiteContent();
  const { siteBrand, siteContact, contactPageContent: cp } = site;
  const { meta, hero, bottomHint, cardLabels } = cp;

  const getMapsSearchUrl = () =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteContact.address)}`;

  const cards = [
    {
      icon: MapPin,
      label: cardLabels.address,
      value: siteContact.address,
      href: getMapsSearchUrl(),
      linkLabel: cardLabels.mapOpen,
      external: true,
    },
    {
      icon: Phone,
      label: cardLabels.hotline,
      value: siteContact.hotlineDisplay,
      href: `tel:${siteContact.hotlineDigits}`,
      linkLabel: cardLabels.call,
      external: true,
    },
    {
      icon: Mail,
      label: cardLabels.email,
      value: siteContact.email,
      href: `mailto:${siteContact.email}`,
      linkLabel: cardLabels.sendEmail,
      external: true,
    },
    {
      icon: Clock,
      label: cardLabels.hours,
      value: siteContact.openingHours,
    },
  ] as const;

  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Liên hệ — ${siteBrand.name}`,
    description: meta.description,
    url: `${getSiteUrl()}/contact`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />

      <section className="relative overflow-hidden bg-neutral-900 text-white">
        <div className="absolute inset-0">
          <Image
            src={DEFAULT_OG_IMAGE_PATH}
            alt=""
            fill
            className="object-cover opacity-40"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-r from-neutral-950/95 via-neutral-900/85 to-brand/25" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 [&_nav_a]:text-white/85 [&_nav_a:hover]:text-white [&_nav_.font-medium]:text-white [&_nav_ol>span]:text-white/45">
          <Breadcrumbs items={[{ label: meta.title, jsonLdHref: "/contact" }]} />
          <h1 className="mt-6 font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {hero.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            {hero.lead}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-6 lg:col-span-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {cards.map((c) => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.label}
                    className="flex gap-4 rounded-xl border border-neutral-200 bg-neutral-50/80 p-4 transition-colors hover:border-brand/30 hover:bg-white"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                        {c.label}
                      </p>
                      <p className="mt-1 text-sm font-medium leading-snug text-neutral-900">
                        {c.value}
                      </p>
                      {"href" in c && c.href && (
                        <a
                          href={c.href}
                          target={c.external ? "_blank" : undefined}
                          rel={c.external ? "noopener noreferrer" : undefined}
                          className="mt-2 inline-block text-sm font-semibold text-brand hover:underline"
                        >
                          {c.linkLabel}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
              <iframe
                title={`Bản đồ ${siteBrand.name}`}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(siteContact.address)}&output=embed`}
                className="h-[220px] w-full border-0 sm:h-[260px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {bottomHint.prefix.trim() ? (
              <p className="text-sm text-neutral-500">
                {bottomHint.prefix}{" "}
                <Link href="/collections" className="font-medium text-brand hover:underline">
                  {bottomHint.linkProductsLabel}
                </Link>{" "}
                ·{" "}
                <Link href="/cart" className="font-medium text-brand hover:underline">
                  {bottomHint.linkCartLabel}
                </Link>
              </p>
            ) : null}
          </div>

          <div className="lg:col-span-7">
            <ContactForm />
            <p className="mt-4 text-xs text-neutral-500">
              Khi gửi form, bạn xác nhận đã đọc{" "}
              <Link
                href="/chinh-sach-bao-mat"
                className="font-medium text-brand hover:underline"
              >
                Chính sách bảo mật
              </Link>{" "}
              và{" "}
              <Link
                href="/dieu-khoan-su-dung"
                className="font-medium text-brand hover:underline"
              >
                Điều khoản sử dụng
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

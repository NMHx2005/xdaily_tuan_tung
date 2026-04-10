import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Factory, HeartHandshake, Sparkles, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Breadcrumbs } from "@/components/storefront/collection/breadcrumbs";
import { buttonVariants } from "@/components/ui/button";
import { getMergedSiteContent } from "@/lib/get-site-content";
import type { AboutPillarIcon } from "@/lib/site-content-schema";
import { cn } from "@/lib/utils";
import { DEFAULT_OG_IMAGE_PATH, getSiteUrl } from "@/lib/seo";

export const revalidate = 60;

const PILLAR_ICONS: Record<AboutPillarIcon, LucideIcon> = {
  factory: Factory,
  sparkles: Sparkles,
  heartHandshake: HeartHandshake,
};

function ProseSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-neutral-200 pt-12 first:border-t-0 first:pt-0">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0066FF]">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
        {title}
      </h2>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-neutral-600">
        {children}
      </div>
    </section>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const site = await getMergedSiteContent();
  const { meta } = site.aboutPageContent;
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: "/about" },
    openGraph: {
      title: meta.openGraphTitle,
      description: meta.description,
      type: "website",
      url: "/about",
      images: [{ url: DEFAULT_OG_IMAGE_PATH, alt: site.siteBrand.name }],
    },
  };
}

export default async function AboutPage() {
  const site = await getMergedSiteContent();
  const { siteBrand, aboutPageContent: ap } = site;
  const {
    meta,
    organizationJsonLd,
    hero,
    stats,
    story,
    pillars,
    sections,
    cta,
  } = ap;

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteBrand.name,
    url: getSiteUrl(),
    logo: `${getSiteUrl()}/logo.png`,
    description: organizationJsonLd.description,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      <section className="relative overflow-hidden bg-neutral-900 text-white">
        <div className="absolute inset-0">
          <Image
            src={DEFAULT_OG_IMAGE_PATH}
            alt=""
            fill
            className="object-cover opacity-35"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-br from-neutral-950/95 via-neutral-900/80 to-[#0066FF]/35" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20 [&_nav_a]:text-white/85 [&_nav_a:hover]:text-white [&_nav_.font-medium]:text-white [&_nav_span.text-neutral-300]:text-white/45">
          <Breadcrumbs items={[{ label: meta.title, jsonLdHref: "/about" }]} />
          <div className="mt-6 max-w-3xl">
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {hero.h1}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-white/90">{hero.lead}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-sm"
            >
              <p className="font-heading text-3xl font-bold text-[#0066FF]">{s.value}</p>
              <p className="mt-2 text-sm text-neutral-600">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-neutral-200 shadow-lg lg:aspect-auto lg:min-h-[320px]">
            <Image
              src={DEFAULT_OG_IMAGE_PATH}
              alt={story.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0066FF]">
              {story.eyebrow}
            </p>
            <h2 className="mt-3 font-heading text-2xl font-bold text-neutral-900 sm:text-3xl">
              {story.title}
            </h2>
            <p className="mt-4 text-neutral-600 leading-relaxed">{story.body}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={story.primaryCta.href}
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "bg-[#0066FF] text-base font-semibold hover:bg-[#0052CC]",
                )}
              >
                {story.primaryCta.label}
              </Link>
              <Link
                href={story.secondaryCta.href}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "text-base font-semibold",
                )}
              >
                {story.secondaryCta.label}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {pillars.map((p) => {
            const Icon = PILLAR_ICONS[p.icon];
            return (
              <div
                key={p.title}
                className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-6 transition-colors hover:border-[#0066FF]/25 hover:bg-white"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0066FF]/10 text-[#0066FF]">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mt-4 font-heading text-lg font-bold text-neutral-900">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{p.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-20 space-y-16">
          {sections.map((section) => (
            <ProseSection key={section.title} eyebrow={section.eyebrow} title={section.title}>
              {section.paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
              {"trailingImage" in section && section.trailingImage ? (
                <div className="relative mt-8 aspect-video overflow-hidden rounded-xl bg-neutral-200">
                  <Image
                    src={DEFAULT_OG_IMAGE_PATH}
                    alt={section.trailingImage.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 56rem"
                  />
                </div>
              ) : null}
            </ProseSection>
          ))}
        </div>

        <div className="mt-20 flex flex-col items-center justify-between gap-6 rounded-2xl bg-linear-to-r from-[#0066FF] to-[#0052CC] px-6 py-10 text-center text-white sm:flex-row sm:text-left">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <Users className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <p className="font-heading text-xl font-bold">{cta.title}</p>
              <p className="mt-1 text-sm text-white/90">{cta.subtitle}</p>
            </div>
          </div>
          <Link
            href={cta.buttonHref}
            className={cn(
              buttonVariants({ variant: "secondary", size: "lg" }),
              "h-12 shrink-0 bg-white px-8 text-base font-semibold text-[#0066FF] hover:bg-white/95",
            )}
          >
            {cta.buttonLabel}
          </Link>
        </div>
      </div>
    </>
  );
}

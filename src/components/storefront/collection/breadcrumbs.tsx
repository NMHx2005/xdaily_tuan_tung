import Link from "next/link";
import { SITE_URL } from "@/lib/constants";

export interface BreadcrumbItem {
  label: string;
  /** In-UI link; omit for current page crumb when rendered as plain text */
  href?: string;
  /** Path (e.g. `/collections/x`) for JSON-LD `item` when `href` is omitted */
  jsonLdHref?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

function itemPathForSchema(item: BreadcrumbItem): string | null {
  const p = item.href ?? item.jsonLdHref;
  if (!p) return null;
  return p.startsWith("/") ? `${SITE_URL}${p}` : `${SITE_URL}/${p}`;
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const allItems: BreadcrumbItem[] = [
    { label: "Trang chủ", href: "/", jsonLdHref: "/" },
    ...items,
  ];

  const itemListElement = allItems
    .map((item) => {
      const itemUrl = itemPathForSchema(item);
      if (!itemUrl) return null;
      return { name: item.label, item: itemUrl };
    })
    .filter((x): x is { name: string; item: string } => x !== null)
    .map((el, i) => ({
      "@type": "ListItem" as const,
      position: i + 1,
      name: el.name,
      item: el.item,
    }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm">
          {allItems.map((item, index) => (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && <span className="text-neutral-300">/</span>}
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-neutral-500 transition-colors hover:text-neutral-900"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-neutral-900">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

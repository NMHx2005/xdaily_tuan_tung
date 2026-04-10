"use client";

import type { CSSProperties } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Armchair,
  Baby,
  Bed,
  BookOpen,
  Briefcase,
  Car,
  ChevronRight,
  Coffee,
  Dog,
  Flower2,
  Gift,
  Headphones,
  Heart,
  Home,
  Package,
  Percent,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  TreePine,
  Utensils,
  Wrench,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  displayNavLabel,
  flattenSubcategoryLinks,
  getMegaColumns,
  type StorefrontNavItem,
} from "@/lib/storefront-nav";
import { useStorefrontNav } from "@/components/storefront/storefront-nav-context";

const NAV_ICON_MAP: Record<string, LucideIcon> = {
  Percent,
  Armchair,
  Utensils,
  Bed,
  Briefcase,
  Coffee,
  Sparkles,
  Package,
  ShoppingBag,
  Home,
  Shirt,
  Smartphone,
  Headphones,
  Baby,
  Flower2,
  Gift,
  Star,
  Zap,
  Car,
  TreePine,
  BookOpen,
  Wrench,
  Dog,
  Heart,
};

const NAV_ICON_CLASS: Record<string, string> = {
  Percent: "text-rose-500",
  Armchair: "text-amber-600",
  Utensils: "text-emerald-600",
  Bed: "text-violet-600",
  Briefcase: "text-sky-600",
  Coffee: "text-orange-500",
  Sparkles: "text-teal-600",
  Package: "text-slate-600",
  ShoppingBag: "text-pink-600",
  Home: "text-amber-700",
  Shirt: "text-fuchsia-600",
  Smartphone: "text-blue-600",
  Headphones: "text-indigo-600",
  Baby: "text-rose-400",
  Flower2: "text-green-500",
  Gift: "text-red-500",
  Star: "text-yellow-500",
  Zap: "text-yellow-600",
  Car: "text-slate-700",
  TreePine: "text-green-700",
  BookOpen: "text-amber-600",
  Wrench: "text-zinc-600",
  Dog: "text-amber-800",
  Heart: "text-red-400",
};

export function navIconComponent(key: string): LucideIcon {
  return NAV_ICON_MAP[key] ?? Package;
}

export function navIconColorClass(key: string): string {
  return NAV_ICON_CLASS[key] ?? "text-neutral-500";
}

/** Dùng chung sidebar trang chủ + cột trái mega menu */
export const CATEGORY_NAV_LINK_CLASS =
  "flex items-center gap-2 px-3 py-2.5 text-sm text-neutral-800 transition-colors hover:text-[#0066FF]";

/** Hàng đang chọn trong mega menu — chỉ nhấn mạnh màu chữ, không nền */
export const CATEGORY_NAV_LINK_MEGA_ACTIVE_CLASS = "text-[#0066FF]";

export function categoryItemShowsChevron(item: StorefrontNavItem): boolean {
  return getMegaColumns(item) !== null;
}

export function CategoryNavList({
  className,
  variant = "sidebar",
}: {
  className?: string;
  variant?: "sidebar" | "dropdown";
}) {
  const nav = useStorefrontNav();
  return (
    <ul
      className={cn(
        variant === "sidebar" &&
          "max-h-[min(420px,calc(100vh-140px))] overflow-y-auto border border-neutral-200 bg-white",
        className,
      )}
    >
      {nav.map((item) => {
        const Icon = navIconComponent(item.navIcon);
        const iconClass = navIconColorClass(item.navIcon);
        return (
          <li
            key={item.id}
            className="group relative border-b border-neutral-100 last:border-b-0"
          >
            <Link href={`/collections/${item.slug}`} className={CATEGORY_NAV_LINK_CLASS}>
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-neutral-100",
                  iconClass,
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1 font-medium leading-snug">
                {displayNavLabel(item)}
              </span>
              {categoryItemShowsChevron(item) ? (
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-neutral-400"
                  aria-hidden
                />
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SubcategoryFlyoutPanel({
  parentLabel,
  links,
  onMouseEnter,
  onMouseLeave,
  onNavigate,
  style,
}: {
  parentLabel: string;
  links: { label: string; slug: string }[];
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onNavigate: () => void;
  style: CSSProperties;
}) {
  return (
    <div
      className="fixed z-[90] overflow-y-auto border border-neutral-200 bg-white/98 shadow-xl backdrop-blur-sm"
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="region"
      aria-label={`Danh mục con — ${parentLabel}`}
    >
      <div className="flex h-full flex-col p-4 sm:p-5">
        <p className="mb-3 shrink-0 border-b border-neutral-100 pb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
          {parentLabel}
        </p>
        <ul className="grid min-h-0 flex-1 auto-rows-min grid-cols-2 gap-x-6 gap-y-0.5 sm:grid-cols-3 lg:grid-cols-4">
          {links.map((link) => (
            <li key={`${link.slug}-${link.label}`}>
              <Link
                href={`/collections/${link.slug}`}
                className="block py-1.5 text-sm text-neutral-800 transition-colors hover:text-[#0066FF]"
                onClick={onNavigate}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function CategorySidebar({ className }: { className?: string }) {
  const nav = useStorefrontNav();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [flyoutIdx, setFlyoutIdx] = useState<number | null>(null);
  const [pos, setPos] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const asideRef = useRef<HTMLElement | null>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setFlyoutIdx(null), 260);
  }, [cancelClose]);

  const openFlyout = useCallback(
    (idx: number) => {
      cancelClose();
      const links = flattenSubcategoryLinks(nav[idx]!);
      if (!links?.length) {
        setFlyoutIdx(null);
        return;
      }
      setFlyoutIdx(idx);
    },
    [cancelClose, nav],
  );

  const updateFlyoutPosition = useCallback(() => {
    if (flyoutIdx === null) return;
    const aside = asideRef.current;
    const row = aside?.parentElement;
    const heroCol = row?.children[1] as HTMLElement | undefined;
    if (heroCol) {
      const hr = heroCol.getBoundingClientRect();
      setPos({
        top: hr.top,
        left: hr.left,
        width: hr.width,
        height: hr.height,
      });
      return;
    }
    const el = rowRefs.current[flyoutIdx];
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
    const panelW = Math.min(560, vw - 16);
    let left = r.right + 4;
    if (left + panelW > vw - 8) {
      left = Math.max(8, r.left - panelW - 4);
    }
    setPos({ top: r.top, left, width: panelW, height: 360 });
  }, [flyoutIdx]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setFlyoutIdx(null);
  }, [pathname]);

  useLayoutEffect(() => {
    updateFlyoutPosition();
  }, [flyoutIdx, updateFlyoutPosition]);

  useLayoutEffect(() => {
    if (flyoutIdx === null) return;
    const onScrollOrResize = () => updateFlyoutPosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [flyoutIdx, updateFlyoutPosition]);

  const flyoutLinks =
    flyoutIdx !== null ? flattenSubcategoryLinks(nav[flyoutIdx]!) : null;

  const flyoutPortal =
    mounted &&
    flyoutIdx !== null &&
    flyoutLinks?.length &&
    nav[flyoutIdx] &&
    createPortal(
      <SubcategoryFlyoutPanel
        parentLabel={displayNavLabel(nav[flyoutIdx]!)}
        links={flyoutLinks}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
        onNavigate={() => setFlyoutIdx(null)}
        style={{
          top: pos.top,
          left: pos.left,
          width: pos.width,
          height: pos.height,
        }}
      />,
      document.body,
    );

  return (
    <>
      <aside
        ref={asideRef}
        className={cn(
          "relative z-20 hidden w-full shrink-0 lg:block lg:w-[280px]",
          className,
        )}
        aria-label="Danh mục sản phẩm"
      >
        <ul className="max-h-[min(420px,calc(100vh-140px))] overflow-y-auto border border-neutral-200 bg-white">
          {nav.map((item, idx) => {
            const Icon = navIconComponent(item.navIcon);
            const iconClass = navIconColorClass(item.navIcon);
            const hasSub = flattenSubcategoryLinks(item);
            return (
              <li
                key={item.id}
                ref={(el) => {
                  rowRefs.current[idx] = el;
                }}
                className="group relative border-b border-neutral-100 last:border-b-0"
                onMouseEnter={() => {
                  if (hasSub?.length) openFlyout(idx);
                  else setFlyoutIdx(null);
                }}
                onMouseLeave={scheduleClose}
              >
                <Link
                  href={`/collections/${item.slug}`}
                  className={CATEGORY_NAV_LINK_CLASS}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-neutral-100",
                      iconClass,
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 font-medium leading-snug">
                    {displayNavLabel(item)}
                  </span>
                  {categoryItemShowsChevron(item) ? (
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-neutral-400"
                      aria-hidden
                    />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>
      {flyoutPortal}
    </>
  );
}

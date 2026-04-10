"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LayoutGrid } from "lucide-react";
import {
  displayNavLabel,
  flattenSubcategoryLinks,
  getMegaColumns,
} from "@/lib/storefront-nav";
import {
  CATEGORY_NAV_LINK_CLASS,
  CATEGORY_NAV_LINK_MEGA_ACTIVE_CLASS,
  categoryItemShowsChevron,
  navIconColorClass,
  navIconComponent,
} from "@/components/storefront/home/category-sidebar";
import { useStorefrontNav } from "@/components/storefront/storefront-nav-context";
import { cn } from "@/lib/utils";

export function CategoryMegaMenu() {
  const pathname = usePathname();
  const nav = useStorefrontNav();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [top, setTop] = useState(0);
  const [hovered, setHovered] = useState(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const closePanel = useCallback(() => {
    cancelClose();
    setOpen(false);
  }, [cancelClose]);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  }, [cancelClose]);

  const openPanel = useCallback(() => {
    cancelClose();
    setOpen(true);
  }, [cancelClose]);

  useEffect(() => {
    cancelClose();
    setOpen(false);
  }, [pathname, cancelClose]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const update = () => setTop(el.getBoundingClientRect().bottom);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    if (!open || nav.length === 0) return;
    const first = nav.findIndex((item) => getMegaColumns(item) !== null);
    setHovered(first >= 0 ? first : 0);
  }, [open, nav]);

  useEffect(() => {
    if (nav.length === 0) return;
    if (hovered >= nav.length) setHovered(nav.length - 1);
  }, [nav.length, hovered]);

  const activeItem = nav[hovered] ?? nav[0];
  const subLinks = activeItem ? flattenSubcategoryLinks(activeItem) : null;

  const bridgePx = 16;

  const backdrop =
    open &&
    mounted &&
    createPortal(
      <div
        className="fixed inset-0 z-40 bg-neutral-950/35"
        aria-hidden
        onMouseEnter={closePanel}
      />,
      document.body,
    );

  const panel =
    open &&
    mounted &&
    nav.length > 0 &&
    activeItem &&
    createPortal(
      <div
        className="fixed inset-x-0 z-[100] pt-4"
        style={{ top: top - bridgePx }}
        onMouseEnter={openPanel}
        onMouseLeave={scheduleClose}
        role="navigation"
        aria-label="Danh mục sản phẩm mở rộng"
      >
        <div className="w-full border-b border-neutral-200 bg-white shadow-md">
          <div className="mx-auto flex max-h-[min(420px,calc(100vh-6rem))] max-w-7xl gap-0 overflow-y-auto px-4 sm:px-6 lg:px-8">
            <div className="w-[280px] shrink-0 border-r border-neutral-200 py-2">
              <ul>
                {nav.map((item, idx) => {
                  const Icon = navIconComponent(item.navIcon);
                  const iconClass = navIconColorClass(item.navIcon);
                  const isHoveredRow = idx === hovered;
                  return (
                    <li
                      key={item.id}
                      className="group relative border-b border-neutral-100 last:border-b-0"
                    >
                      <Link
                        href={`/collections/${item.slug}`}
                        className={cn(
                          CATEGORY_NAV_LINK_CLASS,
                          isHoveredRow && CATEGORY_NAV_LINK_MEGA_ACTIVE_CLASS,
                        )}
                        onClick={closePanel}
                        onMouseEnter={() =>
                          setHovered((h) => (h === idx ? h : idx))
                        }
                        onFocus={() => setHovered((h) => (h === idx ? h : idx))}
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
            </div>

            <div className="min-w-0 flex-1 self-stretch py-5 pl-6 pr-4">
              {subLinks && subLinks.length > 0 ? (
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Danh mục con
                  </p>
                  <ul className="grid grid-cols-2 gap-x-8 gap-y-0.5 sm:grid-cols-3">
                    {subLinks.map((link) => (
                      <li key={`${link.slug}-${link.label}`}>
                        <Link
                          href={`/collections/${link.slug}`}
                          className="block py-1.5 text-sm text-neutral-800 transition-colors hover:text-[#0066FF]"
                          onClick={closePanel}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="flex h-full flex-col justify-center">
                  <p className="text-sm text-neutral-600">
                    Xem toàn bộ sản phẩm trong danh mục{" "}
                    <span className="font-medium text-neutral-900">
                      {displayNavLabel(activeItem)}
                    </span>
                    .
                  </p>
                  <Link
                    href={`/collections/${activeItem.slug}`}
                    className="mt-4 inline-flex w-fit rounded-md bg-[#0066FF] px-4 py-2 text-sm font-medium text-white hover:bg-[#0052cc]"
                    onClick={closePanel}
                  >
                    Đến danh mục
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>,
      document.body,
    );

  return (
    <>
      <div
        ref={triggerRef}
        className="relative z-30 flex h-12 w-[280px] shrink-0 cursor-default items-center gap-2 bg-[#0066FF] px-3 text-white"
        onMouseEnter={openPanel}
        onMouseLeave={scheduleClose}
      >
        <LayoutGrid className="h-6 w-6 shrink-0" aria-hidden />
        <span className="text-[11px] font-bold uppercase leading-tight tracking-wide">
          Danh mục sản phẩm
        </span>
      </div>
      {backdrop}
      {panel}
    </>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Home,
  Menu,
  MessageCircle,
  Phone,
  Search,
  User,
  FileText,
  UserCircle,
} from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { SearchBar } from "./search-bar";
import { CartIcon } from "./cart-icon";
import { MobileMenu } from "./mobile-menu";
import { CategoryMegaMenu } from "./category-mega-menu";
import { cn } from "@/lib/utils";

const LOGO_SRC = "https://file.hstatic.net/1000400963/file/logo__1_.png";

const MAIN_NAV = [
  { href: "/", label: "Trang chủ", icon: Home, iconActive: "text-[#0066FF]" },
  {
    href: "/collections",
    label: "Sản phẩm",
    icon: FileText,
    iconActive: "text-red-500",
  },
  {
    href: "/blogs",
    label: "Blog",
    icon: MessageCircle,
    iconActive: "text-neutral-500",
  },
  {
    href: "/about",
    label: "Giới thiệu",
    icon: UserCircle,
    iconActive: "text-neutral-500",
  },
  {
    href: "/contact",
    label: "Liên hệ",
    icon: Phone,
    iconActive: "text-neutral-500",
  },
] as const;

export function Header({
  brandName,
  hotlineDisplay,
  hotlineTel,
}: {
  brandName: string;
  hotlineDisplay: string;
  hotlineTel: string;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const openMobileMenu = useUIStore((s) => s.openMobileMenu);
  const openSearch = useUIStore((s) => s.openSearch);

  const displayName =
    session?.user?.name?.trim() ||
    session?.user?.email?.split("@")[0] ||
    "Khách";

  return (
    <>
      <header
        id="header"
        className="site-header sticky top-0 z-50 w-full"
        style={{ ["--height-header" as string]: "107px" }}
      >
        {/* Top — blue */}
        <div className="bg-[#0066FF] text-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:gap-6 lg:px-8 lg:py-2.5">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4 lg:max-w-[220px] lg:flex-none">
              <button
                type="button"
                onClick={openMobileMenu}
                className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md p-2 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white lg:hidden"
                aria-label="Mở menu"
              >
                <Menu className="h-6 w-6" aria-hidden />
              </button>
              <Link
                href="/"
                className="relative h-[40px] w-[140px] shrink-0 sm:h-[50px] sm:w-[180px] lg:h-[50px] lg:w-[200px]"
                aria-label={`${brandName} — Trang chủ`}
              >
                <Image
                  src={LOGO_SRC}
                  alt={brandName}
                  fill
                  className="object-contain object-left"
                  sizes="200px"
                  priority
                />
              </Link>
            </div>

            <form
              action="/search"
              method="get"
              className={cn(
                "order-3 flex w-full min-w-0 flex-1 items-stretch overflow-hidden rounded-[10px] border border-white",
                "lg:order-none lg:max-w-2xl",
              )}
            >
              <label htmlFor="header-search-q" className="sr-only">
                Tìm kiếm
              </label>
              <input
                id="header-search-q"
                name="q"
                type="text"
                autoComplete="off"
                placeholder="Bạn đang tìm gì..."
                aria-label="Search"
                className={cn(
                  "searchinput input-search search-input",
                  "min-h-[42px] min-w-0 flex-1 rounded-none border-0 bg-white px-3.5 py-2 text-sm text-neutral-800",
                  "placeholder:text-neutral-400",
                  "rounded-l-[9px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-0",
                )}
              />
              <button
                type="submit"
                className={cn(
                  "inline-flex min-w-[48px] shrink-0 items-center justify-center rounded-none rounded-r-[9px]",
                  "border-l border-white/40 bg-[#0066FF] px-3.5 transition-colors",
                  "hover:bg-[#0058e6] active:bg-[#004dcc]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0066FF]",
                )}
                aria-label="Tìm kiếm"
              >
                <Search
                  className="h-[22px] w-[22px] text-white"
                  strokeWidth={2}
                  aria-hidden
                />
              </button>
            </form>

            <div className="ml-auto flex flex-shrink-0 items-center gap-2 sm:gap-4 lg:gap-6">
              <a
                href={hotlineTel}
                className="hidden items-center gap-2 rounded-md py-1.5 text-white transition-colors hover:bg-white/10 md:flex"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                  <Phone className="h-5 w-5" aria-hidden />
                </span>
                <span className="flex flex-col text-xs leading-tight">
                  <span className="font-medium">Hotline</span>
                  <span className="opacity-90">{hotlineDisplay}</span>
                </span>
              </a>

              {status === "loading" ? (
                <span
                  className="hidden h-9 w-[7.5rem] animate-pulse rounded-md bg-white/20 sm:block lg:w-40"
                  aria-hidden
                />
              ) : session?.user ? (
                <Link
                  href="/account"
                  className="hidden max-w-[min(100%,14rem)] items-center gap-2 rounded-md py-1.5 text-white transition-colors hover:bg-white/10 sm:flex"
                >
                  <User className="h-6 w-6 shrink-0" aria-hidden />
                  <span className="hidden min-w-0 flex-col text-xs leading-tight lg:flex">
                    <span className="truncate font-medium" title={displayName}>
                      {displayName}
                    </span>
                    <span className="opacity-90">Tài khoản</span>
                  </span>
                </Link>
              ) : (
                <Link
                  href="/account/login"
                  className="hidden items-center gap-2 rounded-md py-1.5 text-white transition-colors hover:bg-white/10 sm:flex"
                >
                  <User className="h-6 w-6 shrink-0" aria-hidden />
                  <span className="hidden flex-col text-xs leading-tight lg:flex">
                    <span className="font-medium">Đăng nhập</span>
                    <span className="opacity-90">Đăng ký</span>
                  </span>
                </Link>
              )}

              <button
                type="button"
                onClick={openSearch}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md p-2 transition-colors hover:bg-white/10 md:hidden"
                aria-label="Tìm kiếm"
              >
                <Search className="h-5 w-5" aria-hidden />
              </button>

              <CartIcon variant="header" />
            </div>
          </div>
        </div>

        {/* Bottom — white nav + category (desktop) */}
        <div className="hidden border-b border-neutral-200 bg-white lg:block">
          <div className="mx-auto flex max-w-7xl items-stretch px-4 sm:px-6 lg:px-8">
            <CategoryMegaMenu />

            <nav
              className="flex min-h-12 flex-1 items-center gap-1 xl:gap-2"
              aria-label="Điều hướng chính"
            >
              {MAIN_NAV.map(({ href, label, icon: Icon, iconActive }) => {
                const active =
                  href === "/"
                    ? pathname === "/"
                    : href.startsWith("/#")
                      ? false
                      : pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100 hover:text-[#0066FF] xl:px-3",
                      active && "text-[#0066FF]",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-6 w-6 shrink-0",
                        active ? iconActive : "text-neutral-400",
                      )}
                      aria-hidden
                    />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <SearchBar />
      <MobileMenu brandName={brandName} />
    </>
  );
}

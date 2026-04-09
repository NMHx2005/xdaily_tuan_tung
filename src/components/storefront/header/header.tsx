"use client";

import Link from "next/link";
import { Menu, Search, User } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { NavMenu } from "./nav-menu";
import { SearchBar } from "./search-bar";
import { CartIcon } from "./cart-icon";
import { MobileMenu } from "./mobile-menu";

export function Header() {
  const openMobileMenu = useUIStore((s) => s.openMobileMenu);
  const openSearch = useUIStore((s) => s.openSearch);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Mobile: hamburger | Desktop: nav */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={openMobileMenu}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md p-2 lg:hidden transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Mở menu"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
            <NavMenu />
          </div>

          {/* Logo — center on mobile, left-ish on desktop */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 rounded-md lg:static lg:translate-x-0 lg:order-first font-heading text-xl font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="XDAILY — Trang chủ"
          >
            XDAILY
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={openSearch}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md p-2 transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Tìm kiếm"
            >
              <Search className="h-5 w-5" aria-hidden />
            </button>
            <Link
              href="/account/login"
              className="hidden min-h-11 min-w-11 items-center justify-center rounded-md p-2 transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
              aria-label="Tài khoản"
            >
              <User className="h-5 w-5" aria-hidden />
            </Link>
            <CartIcon />
          </div>

          {/* Search overlay */}
          <SearchBar />
        </div>
      </header>

      {/* Mobile menu sheet */}
      <MobileMenu />
    </>
  );
}

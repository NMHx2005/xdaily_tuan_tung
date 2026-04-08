"use client";

import Link from "next/link";
import { Menu, Search, User } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { NavMenu } from "./nav-menu";
import { SearchBar } from "./search-bar";
import { CartIcon } from "./cart-icon";
import { MobileMenu } from "./mobile-menu";

export function Header() {
  const { openMobileMenu, openSearch } = useUIStore();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Mobile: hamburger | Desktop: nav */}
          <div className="flex items-center gap-4">
            <button
              onClick={openMobileMenu}
              className="p-2 lg:hidden transition-colors hover:text-gold"
              aria-label="Mở menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <NavMenu />
          </div>

          {/* Logo — center on mobile, left-ish on desktop */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:order-first font-heading text-xl font-bold tracking-tight"
          >
            XDAILY
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={openSearch}
              className="p-2 transition-colors hover:text-gold"
              aria-label="Tìm kiếm"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              href="/account/login"
              className="hidden sm:block p-2 transition-colors hover:text-gold"
              aria-label="Tài khoản"
            >
              <User className="h-5 w-5" />
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

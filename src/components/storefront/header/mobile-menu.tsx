"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ChevronDown, LogOut, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUIStore } from "@/stores/ui-store";
import { COLLECTIONS } from "@/lib/constants";

export function MobileMenu({ brandName = "XDAILY" }: { brandName?: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const isMobileMenuOpen = useUIStore((s) => s.isMobileMenuOpen);
  const closeMobileMenu = useUIStore((s) => s.closeMobileMenu);
  const [isProductsOpen, setIsProductsOpen] = useState(false);

  const displayName =
    session?.user?.name?.trim() ||
    session?.user?.email?.split("@")[0] ||
    "";

  function handleNav() {
    closeMobileMenu();
    setIsProductsOpen(false);
  }

  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={(open) => !open && closeMobileMenu()}>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-80 p-0"
      >
        <SheetHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-heading text-xl font-bold">{brandName}</SheetTitle>
            <button
              type="button"
              onClick={closeMobileMenu}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md p-1 transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Đóng menu"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </SheetHeader>

        <nav className="flex flex-col py-4" aria-label="Main navigation">
          <Link
            href="/"
            onClick={handleNav}
            className="px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Trang chủ
          </Link>

          <div>
            <button
              type="button"
              aria-expanded={isProductsOpen}
              onClick={() => setIsProductsOpen(!isProductsOpen)}
              className="flex min-h-11 w-full items-center justify-between px-6 py-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            >
              Sản phẩm
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${isProductsOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isProductsOpen && (
              <div className="bg-muted/50 py-1">
                {COLLECTIONS.map((collection) => {
                  const href = `/collections/${collection.slug}`;
                  return (
                    <Link
                      key={collection.slug}
                      href={href}
                      onClick={handleNav}
                      onMouseEnter={() => router.prefetch(href)}
                      className="block px-10 py-2.5 text-sm transition-colors hover:text-gold"
                    >
                      {collection.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <Link
            href="/blogs"
            onClick={handleNav}
            className="px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Blog
          </Link>
          <Link
            href="/about"
            onClick={handleNav}
            className="px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Giới thiệu
          </Link>
          <Link
            href="/contact"
            onClick={handleNav}
            className="px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Liên hệ
          </Link>

          <div className="mx-6 my-4 border-t" />

          {session?.user ? (
            <>
              <div className="px-6 py-2 text-xs text-muted-foreground">
                {displayName ? (
                  <span className="font-medium text-foreground">{displayName}</span>
                ) : null}
              </div>
              <Link
                href="/account"
                onClick={handleNav}
                className="px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                Tài khoản
              </Link>
              <button
                type="button"
                onClick={() => {
                  handleNav();
                  void signOut({ callbackUrl: "/" });
                }}
                className="flex w-full items-center gap-2 px-6 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                Đăng xuất
              </button>
            </>
          ) : (
            <Link
              href="/account/login"
              onClick={handleNav}
              className="px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              Đăng nhập
            </Link>
          )}
          <Link
            href="/search"
            onClick={handleNav}
            className="px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Tìm kiếm
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

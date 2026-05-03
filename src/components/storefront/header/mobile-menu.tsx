"use client";

import { useState } from "react";
import Image from "next/image";
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
import { COLLECTIONS, SITE_NAME } from "@/lib/constants";

export function MobileMenu({
  brandName = SITE_NAME,
  logoUrl,
}: {
  brandName?: string;
  logoUrl?: string;
}) {
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
        className="w-[min(20rem,calc(100vw-0.75rem))] max-w-[calc(100vw-0.5rem)] p-0 pb-[env(safe-area-inset-bottom,0px)]"
      >
        <SheetHeader className="border-b px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              {logoUrl ? (
                <span className="relative h-9 w-24 shrink-0">
                  <Image
                    src={logoUrl}
                    alt=""
                    fill
                    className="object-contain object-left"
                    sizes="96px"
                    unoptimized={
                      logoUrl.startsWith("data:") || logoUrl.startsWith("blob:")
                    }
                  />
                </span>
              ) : null}
              <SheetTitle className="min-w-0 truncate font-heading text-xl font-bold">
                {brandName}
              </SheetTitle>
            </div>
            <button
              type="button"
              onClick={closeMobileMenu}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md p-1 transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Đóng menu"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </SheetHeader>

        <nav
          className="flex max-h-[calc(100dvh-5.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex-col overflow-y-auto overscroll-contain py-2 sm:py-4"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            onClick={handleNav}
            className="px-4 py-3 text-sm font-medium transition-colors hover:bg-muted sm:px-6"
          >
            Trang chủ
          </Link>

          <div>
            <button
              type="button"
              aria-expanded={isProductsOpen}
              onClick={() => setIsProductsOpen(!isProductsOpen)}
              className="flex min-h-11 w-full items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:px-6"
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
                      className="block px-8 py-2.5 text-sm transition-colors hover:text-brand sm:px-10"
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
            className="px-4 py-3 text-sm font-medium transition-colors hover:bg-muted sm:px-6"
          >
            Blog
          </Link>
          <Link
            href="/about"
            onClick={handleNav}
            className="px-4 py-3 text-sm font-medium transition-colors hover:bg-muted sm:px-6"
          >
            Giới thiệu
          </Link>
          <Link
            href="/contact"
            onClick={handleNav}
            className="px-4 py-3 text-sm font-medium transition-colors hover:bg-muted sm:px-6"
          >
            Liên hệ
          </Link>

          <div className="mx-4 my-4 border-t sm:mx-6" />

          {session?.user ? (
            <>
              <div className="px-4 py-2 text-xs text-muted-foreground sm:px-6">
                {displayName ? (
                  <span className="font-medium text-foreground">{displayName}</span>
                ) : null}
              </div>
              <Link
                href="/account"
                onClick={handleNav}
                className="px-4 py-3 text-sm font-medium transition-colors hover:bg-muted sm:px-6"
              >
                Tài khoản
              </Link>
              <button
                type="button"
                onClick={() => {
                  handleNav();
                  void signOut({ callbackUrl: "/" });
                }}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-6"
              >
                <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                Đăng xuất
              </button>
            </>
          ) : (
            <Link
              href="/account/login"
              onClick={handleNav}
              className="px-4 py-3 text-sm font-medium transition-colors hover:bg-muted sm:px-6"
            >
              Đăng nhập
            </Link>
          )}
          <Link
            href="/search"
            onClick={handleNav}
            className="px-4 py-3 text-sm font-medium transition-colors hover:bg-muted sm:px-6"
          >
            Tìm kiếm
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

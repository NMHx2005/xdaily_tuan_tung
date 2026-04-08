"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUIStore } from "@/stores/ui-store";
import { COLLECTIONS } from "@/lib/constants";

export function MobileMenu() {
  const isMobileMenuOpen = useUIStore((s) => s.isMobileMenuOpen);
  const closeMobileMenu = useUIStore((s) => s.closeMobileMenu);
  const [isProductsOpen, setIsProductsOpen] = useState(false);

  function handleNav() {
    closeMobileMenu();
    setIsProductsOpen(false);
  }

  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={(open) => !open && closeMobileMenu()}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-heading text-xl font-bold">XDAILY</SheetTitle>
            <button onClick={closeMobileMenu} className="p-1 hover:text-gold transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </SheetHeader>

        <nav className="flex flex-col py-4">
          <Link
            href="/"
            onClick={handleNav}
            className="px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Trang chủ
          </Link>

          <div>
            <button
              onClick={() => setIsProductsOpen(!isProductsOpen)}
              className="flex w-full items-center justify-between px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              Sản phẩm
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${isProductsOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isProductsOpen && (
              <div className="bg-muted/50 py-1">
                {COLLECTIONS.map((collection) => (
                  <Link
                    key={collection.slug}
                    href={`/collections/${collection.slug}`}
                    onClick={handleNav}
                    className="block px-10 py-2.5 text-sm transition-colors hover:text-gold"
                  >
                    {collection.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/blogs"
            onClick={handleNav}
            className="px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Tin tức
          </Link>
          <Link
            href="/about"
            onClick={handleNav}
            className="px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Giới thiệu
          </Link>

          <div className="mx-6 my-4 border-t" />

          <Link
            href="/account/login"
            onClick={handleNav}
            className="px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Đăng nhập
          </Link>
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

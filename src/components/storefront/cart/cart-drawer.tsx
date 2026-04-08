"use client";

import Link from "next/link";
import { X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useUIStore } from "@/stores/ui-store";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { CartItem } from "./cart-item";
import { EmptyCart } from "./empty-cart";

export function CartDrawer() {
  const isOpen = useUIStore((s) => s.isCartDrawerOpen);
  const close = useUIStore((s) => s.closeCartDrawer);
  const { items, subtotal, itemCount } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-bold">
              Giỏ hàng{" "}
              <span className="text-sm font-normal text-neutral-500">
                ({itemCount} sản phẩm)
              </span>
            </SheetTitle>
            <button
              onClick={close}
              className="p-1 transition-colors hover:text-neutral-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id}>
                  <CartItem item={item} />
                  <Separator className="mt-4" />
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t px-6 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Tạm tính:</span>
              <span className="text-base font-bold">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-neutral-400">
              Phí vận chuyển sẽ được tính ở bước thanh toán
            </p>
            <div className="space-y-2">
              <Link href="/cart" onClick={close}>
                <Button variant="outline" className="w-full">
                  Xem giỏ hàng
                </Button>
              </Link>
              <Link href="/checkout" onClick={close}>
                <Button className="w-full h-11">
                  Thanh toán
                </Button>
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useUIStore } from "@/stores/ui-store";

export function CartIcon() {
  const { itemCount } = useCart();
  const toggleCartDrawer = useUIStore((s) => s.toggleCartDrawer);

  return (
    <button
      type="button"
      onClick={toggleCartDrawer}
      className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-md p-2 transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`Giỏ hàng (${itemCount} sản phẩm)`}
    >
      <ShoppingBag className="h-5 w-5" aria-hidden />
      {itemCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sale px-1 text-[10px] font-bold text-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );
}

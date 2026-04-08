"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useUIStore } from "@/stores/ui-store";

export function CartIcon() {
  const { itemCount } = useCart();
  const toggleCartDrawer = useUIStore((s) => s.toggleCartDrawer);

  return (
    <button
      onClick={toggleCartDrawer}
      className="relative p-2 transition-colors hover:text-gold"
      aria-label={`Giỏ hàng${itemCount > 0 ? `, ${itemCount} sản phẩm` : ""}`}
    >
      <ShoppingBag className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sale px-1 text-[10px] font-bold text-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );
}

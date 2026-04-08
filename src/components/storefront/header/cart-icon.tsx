"use client";

import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";

export function CartIcon() {
  const itemCount = useCartStore((s) => s.itemCount);
  const toggleCart = useUIStore((s) => s.toggleCart);

  return (
    <button
      onClick={toggleCart}
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

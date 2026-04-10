"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

type CartIconProps = {
  className?: string;
  /** Blue header: white outline + always-visible red count badge */
  variant?: "default" | "header";
};

export function CartIcon({ className, variant = "default" }: CartIconProps) {
  const { itemCount } = useCart();
  const toggleCartDrawer = useUIStore((s) => s.toggleCartDrawer);
  const isHeader = variant === "header";

  return (
    <button
      type="button"
      onClick={toggleCartDrawer}
      className={cn(
        "relative inline-flex min-h-11 items-center justify-center rounded-md p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0066FF]",
        isHeader
          ? "gap-2 rounded-lg border-2 border-white px-3 text-white hover:bg-white/10"
          : "min-w-11 hover:text-gold focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      aria-label={`Giỏ hàng (${itemCount} sản phẩm)`}
    >
      <span className="relative inline-flex">
        <ShoppingBag className="h-5 w-5" aria-hidden />
        <span
          className={cn(
            "absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white",
            isHeader ? "bg-red-600" : "bg-sale",
            !isHeader && itemCount === 0 && "hidden",
          )}
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      </span>
      {isHeader && (
        <span className="hidden text-sm font-medium lg:inline">Giỏ hàng</span>
      )}
    </button>
  );
}

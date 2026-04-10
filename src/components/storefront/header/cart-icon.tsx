"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useUIStore } from "@/stores/ui-store";
import { brandClass } from "@/lib/brand-tailwind";
import { cn } from "@/lib/utils";

/** Chuỗi cố định — không dùng cn + bg để tránh lệch SSR/client (Turbopack). */
const CART_BADGE_CLASS =
  "absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white";

type CartIconProps = {
  className?: string;
  /** Blue header: white outline + count badge (màu brand) */
  variant?: "default" | "header";
};

export function CartIcon({ className, variant = "default" }: CartIconProps) {
  const { itemCount } = useCart();
  const toggleCartDrawer = useUIStore((s) => s.toggleCartDrawer);
  const isHeader = variant === "header";
  const count = Math.max(0, Math.min(999, Number(itemCount) || 0));
  const badgeLabel = count > 99 ? "99+" : String(count);

  return (
    <button
      type="button"
      onClick={toggleCartDrawer}
      className={cn(
        "relative inline-flex min-h-11 items-center justify-center rounded-md p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2",
        brandClass.ringOffset,
        isHeader
          ? "gap-2 rounded-lg border-2 border-white px-3 text-white hover:bg-white/10"
          : cn("min-w-11 focus-visible:ring-ring", brandClass.textHover),
        className,
      )}
      aria-label={`Giỏ hàng (${count} sản phẩm)`}
    >
      <span className="relative inline-flex">
        <ShoppingBag className="h-5 w-5" aria-hidden />
        <span
          className={cn(CART_BADGE_CLASS, !isHeader && count === 0 && "hidden")}
          style={{ backgroundColor: "var(--brand)" }}
          suppressHydrationWarning
        >
          {badgeLabel}
        </span>
      </span>
      {isHeader && (
        <span className="hidden text-sm font-medium lg:inline">Giỏ hàng</span>
      )}
    </button>
  );
}

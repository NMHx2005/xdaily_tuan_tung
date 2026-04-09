"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useUIStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";

interface Variant {
  id: string;
  name: string;
  colorHex: string;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  inStock: boolean;
  image: string | null;
}

interface ProductInfoProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  inStock: boolean;
  stockQuantity: number;
  shortDescription: string;
  variants: Variant[];
  thumbnail: string;
  onVariantChange?: (variant: Variant | null) => void;
}

export function ProductInfo({
  id,
  slug,
  name,
  price,
  compareAtPrice,
  inStock,
  stockQuantity,
  shortDescription,
  variants,
  thumbnail,
  onVariantChange,
}: ProductInfoProps) {
  const { addItem } = useCart();
  const openCartDrawer = useUIStore((s) => s.openCartDrawer);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);

  const activePrice = selectedVariant?.price ?? price;
  const activeComparePrice = selectedVariant?.compareAtPrice ?? compareAtPrice;
  const isOnSale = activeComparePrice !== null && activeComparePrice > activePrice;
  const isAvailable = selectedVariant ? selectedVariant.inStock : inStock;
  const maxQty = stockQuantity > 0 ? stockQuantity : 99;

  function handleSelectVariant(variant: Variant) {
    const next = selectedVariant?.id === variant.id ? null : variant;
    setSelectedVariant(next);
    onVariantChange?.(next);
  }

  function handleAddToCart() {
    addItem({
      productId: id,
      variantId: selectedVariant?.id ?? null,
      name,
      variantName: selectedVariant?.name ?? null,
      price: activePrice,
      image: selectedVariant?.image ?? thumbnail,
      slug,
      maxStock: maxQty,
      quantity,
    });
    toast.success(`Đã thêm ${name} vào giỏ hàng`);
    openCartDrawer();
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold lg:text-3xl">{name}</h1>

      <div className="mt-3 flex items-baseline gap-2">
        <span
          className={cn(
            "text-2xl font-bold",
            isOnSale ? "text-sale" : "text-neutral-900"
          )}
        >
          {formatPrice(activePrice)}
        </span>
        {isOnSale && (
          <span className="text-lg text-neutral-400 line-through">
            {formatPrice(activeComparePrice!)}
          </span>
        )}
      </div>

      {variants.length > 0 && (
        <div className="mt-5">
          <p className="text-sm font-medium text-neutral-700">
            Màu sắc:{" "}
            {selectedVariant && (
              <span className="font-normal text-neutral-500">
                {selectedVariant.name}
              </span>
            )}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => handleSelectVariant(v)}
                title={v.name}
                className={cn(
                  "h-8 w-8 rounded-full border-2 transition-all",
                  selectedVariant?.id === v.id
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-neutral-300 hover:border-neutral-400",
                  !v.inStock && "opacity-40 cursor-not-allowed"
                )}
                style={{ backgroundColor: v.colorHex || "#ccc" }}
                disabled={!v.inStock}
                aria-label={v.name}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-5">
        <p className="text-sm font-medium text-neutral-700">Số lượng:</p>
        <div className="mt-2 flex items-center">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="flex h-10 w-10 items-center justify-center rounded-l border border-r-0 text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-40"
            aria-label="Giảm số lượng"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            type="number"
            min={1}
            max={maxQty}
            value={quantity}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (Number.isFinite(v) && v >= 1 && v <= maxQty) setQuantity(v);
            }}
            className="h-10 w-14 border-y text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
            disabled={quantity >= maxQty}
            className="flex h-10 w-10 items-center justify-center rounded-r border border-l-0 text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-40"
            aria-label="Tăng số lượng"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Button
        onClick={handleAddToCart}
        disabled={!isAvailable}
        size="lg"
        className="mt-5 w-full h-12 text-base font-semibold"
      >
        <ShoppingBag className="mr-2 h-5 w-5" />
        {isAvailable ? "Thêm vào giỏ" : "Hết hàng"}
      </Button>

      {shortDescription && (
        <p className="mt-5 text-sm leading-relaxed text-neutral-600">
          {shortDescription}
        </p>
      )}
    </div>
  );
}

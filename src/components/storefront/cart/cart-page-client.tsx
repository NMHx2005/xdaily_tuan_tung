"use client";

import { Breadcrumbs } from "@/components/storefront/collection/breadcrumbs";
import { useCart } from "@/hooks/use-cart";
import { CartItem } from "@/components/storefront/cart/cart-item";
import { CartSummary } from "@/components/storefront/cart/cart-summary";
import { EmptyCart } from "@/components/storefront/cart/empty-cart";
import { Separator } from "@/components/ui/separator";

export function CartPageClient() {
  const { items, itemCount } = useCart();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <Breadcrumbs items={[{ label: "Giỏ hàng", jsonLdHref: "/cart" }]} />

      <h1 className="font-heading text-3xl font-bold">Giỏ hàng của bạn</h1>
      <p className="mt-1 text-sm text-neutral-500">{itemCount} sản phẩm</p>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="space-y-0">
              {items.map((item, i) => (
                <div key={item.id}>
                  <CartItem item={item} />
                  {i < items.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <CartSummary />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

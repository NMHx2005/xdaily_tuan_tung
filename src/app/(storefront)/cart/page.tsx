import type { Metadata } from "next";
import { CartPageClient } from "@/components/storefront/cart/cart-page-client";

export const metadata: Metadata = {
  title: "Giỏ hàng",
  robots: { index: false },
};

export default function CartPage() {
  return <CartPageClient />;
}

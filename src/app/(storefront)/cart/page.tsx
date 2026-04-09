import type { Metadata } from "next";
import { CartPageClient } from "@/components/storefront/cart/cart-page-client";

export const metadata: Metadata = {
  title: "Giỏ hàng",
  description: "Giỏ hàng của bạn tại XDAILY.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "Giỏ hàng | XDAILY",
    description: "Giỏ hàng của bạn tại XDAILY.",
    url: "/cart",
  },
};

export default function CartPage() {
  return <CartPageClient />;
}

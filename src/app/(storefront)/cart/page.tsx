import type { Metadata } from "next";
import { CartPageClient } from "@/components/storefront/cart/cart-page-client";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Giỏ hàng",
  description: `Giỏ hàng của bạn tại ${SITE_NAME}.`,
  robots: { index: false, follow: true },
  openGraph: {
    title: `Giỏ hàng | ${SITE_NAME}`,
    description: `Giỏ hàng của bạn tại ${SITE_NAME}.`,
    url: "/cart",
  },
};

export default function CartPage() {
  return <CartPageClient />;
}

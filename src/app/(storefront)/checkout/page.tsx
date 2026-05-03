import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutPageClient } from "@/components/storefront/checkout/checkout-page-client";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Thanh toán",
  description: `Hoàn tất đơn hàng tại ${SITE_NAME}.`,
  robots: { index: false, follow: true },
  openGraph: {
    title: `Thanh toán | ${SITE_NAME}`,
    description: `Hoàn tất đơn hàng tại ${SITE_NAME}.`,
    url: "/checkout",
  },
};

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutPageClient />
    </Suspense>
  );
}

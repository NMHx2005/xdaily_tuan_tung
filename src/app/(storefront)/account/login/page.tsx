import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPageClient } from "@/components/storefront/auth/auth-page-client";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: `Đăng nhập tài khoản ${SITE_NAME}.`,
  robots: { index: false, follow: true },
  openGraph: {
    title: `Đăng nhập | ${SITE_NAME}`,
    description: `Đăng nhập tài khoản ${SITE_NAME}.`,
    url: "/account/login",
  },
};

export default function LoginPage() {
  return (
    <Suspense>
      <AuthPageClient />
    </Suspense>
  );
}

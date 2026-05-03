import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPageClient } from "@/components/storefront/auth/auth-page-client";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Đăng ký",
  description: `Tạo tài khoản ${SITE_NAME}.`,
  robots: { index: false, follow: true },
  openGraph: {
    title: `Đăng ký | ${SITE_NAME}`,
    description: `Tạo tài khoản ${SITE_NAME}.`,
    url: "/account/register",
  },
};

export default function RegisterPage() {
  return (
    <Suspense>
      <AuthPageClient initialTab="register" />
    </Suspense>
  );
}

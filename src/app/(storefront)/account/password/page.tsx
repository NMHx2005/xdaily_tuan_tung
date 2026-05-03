import type { Metadata } from "next";
import { AccountPasswordClient } from "@/components/storefront/auth/account-password-client";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Đổi mật khẩu",
  description: `Đổi mật khẩu tài khoản ${SITE_NAME}.`,
  robots: { index: false, follow: true },
  openGraph: {
    title: `Đổi mật khẩu | ${SITE_NAME}`,
    url: "/account/password",
  },
};

export default function AccountPasswordPage() {
  return <AccountPasswordClient />;
}

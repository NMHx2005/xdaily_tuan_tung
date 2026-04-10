import type { Metadata } from "next";
import { AccountPasswordClient } from "@/components/storefront/auth/account-password-client";

export const metadata: Metadata = {
  title: "Đổi mật khẩu",
  description: "Đổi mật khẩu tài khoản XDAILY.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "Đổi mật khẩu | XDAILY",
    url: "/account/password",
  },
};

export default function AccountPasswordPage() {
  return <AccountPasswordClient />;
}

import type { Metadata } from "next";
import { AccountDashboardClient } from "@/components/storefront/auth/account-dashboard-client";

export const metadata: Metadata = {
  title: "Tài khoản",
  description: "Quản lý tài khoản khách hàng XDAILY.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "Tài khoản | XDAILY",
    description: "Quản lý tài khoản khách hàng XDAILY.",
    url: "/account",
  },
};

export default function AccountPage() {
  return <AccountDashboardClient />;
}

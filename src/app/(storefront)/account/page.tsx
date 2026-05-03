import type { Metadata } from "next";
import { AccountDashboardClient } from "@/components/storefront/auth/account-dashboard-client";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Tài khoản",
  description: `Quản lý tài khoản khách hàng ${SITE_NAME}.`,
  robots: { index: false, follow: true },
  openGraph: {
    title: `Tài khoản | ${SITE_NAME}`,
    description: `Quản lý tài khoản khách hàng ${SITE_NAME}.`,
    url: "/account",
  },
};

export default function AccountPage() {
  return <AccountDashboardClient />;
}

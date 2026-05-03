import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { TRPCProvider } from "@/lib/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { DEFAULT_OG_IMAGE_PATH, getSiteUrl } from "@/lib/seo";
import "./globals.css";

const siteUrl = getSiteUrl();

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin", "vietnamese"],
  weight: ["700"],
  display: "swap",
});

const defaultTitle = `${SITE_NAME} - Nhà máy nội thất cao cấp`;
const ogDescription = `Ghế ăn, bàn trà, ghế bar, sofa… cao cấp. Thiết kế hiện đại, giá tốt tại ${SITE_NAME}.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: `%s | ${SITE_NAME}`,
    default: defaultTitle,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    siteName: SITE_NAME,
    title: defaultTitle,
    description: ogDescription,
    images: [{ url: DEFAULT_OG_IMAGE_PATH, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: ogDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen antialiased">
        <TRPCProvider>
          {children}
          <Toaster richColors position="top-right" />
        </TRPCProvider>
      </body>
    </html>
  );
}

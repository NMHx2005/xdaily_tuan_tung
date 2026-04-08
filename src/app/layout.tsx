import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { TRPCProvider } from "@/lib/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin", "vietnamese"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | XDAILY",
    default: "XDAILY - Nhà máy nội thất cao cấp",
  },
  description:
    "XDAILY cung cấp ghế ăn, bàn trà, ghế bar, sofa, giường ngủ cao cấp. Thiết kế hiện đại, giá tốt nhất.",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "XDAILY",
    title: "XDAILY - Nhà máy nội thất cao cấp",
    description:
      "XDAILY cung cấp ghế ăn, bàn trà, ghế bar, sofa, giường ngủ cao cấp. Thiết kế hiện đại, giá tốt nhất.",
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

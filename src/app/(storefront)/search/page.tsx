import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResultsClient } from "@/components/storefront/search/search-results-client";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Tìm kiếm",
  description: `Tìm kiếm sản phẩm và bài viết trên ${SITE_NAME}.`,
  robots: { index: false, follow: true },
  openGraph: {
    title: `Tìm kiếm | ${SITE_NAME}`,
    description: `Tìm kiếm sản phẩm và bài viết trên ${SITE_NAME}.`,
    url: "/search",
  },
};

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResultsClient />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResultsClient } from "@/components/storefront/search/search-results-client";

export const metadata: Metadata = {
  title: "Tìm kiếm",
  description: "Tìm kiếm sản phẩm và bài viết trên XDAILY.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "Tìm kiếm | XDAILY",
    description: "Tìm kiếm sản phẩm và bài viết trên XDAILY.",
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

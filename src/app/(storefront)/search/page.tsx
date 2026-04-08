import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResultsClient } from "@/components/storefront/search/search-results-client";

export const metadata: Metadata = {
  title: "Tìm kiếm",
  robots: { index: false },
};

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResultsClient />
    </Suspense>
  );
}

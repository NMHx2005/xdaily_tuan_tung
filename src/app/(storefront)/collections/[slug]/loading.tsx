import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardSkeleton } from "@/components/storefront/product-card-skeleton";

export default function CollectionLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-2" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="mt-6 h-9 w-64 max-w-full sm:h-10" />
      <Skeleton className="mt-2 h-4 w-full max-w-2xl" />
      <Skeleton className="mt-1 h-4 w-48" />
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS } from "@/lib/constants";

interface FilterSortBarProps {
  currentSort: string;
  totalProducts: number;
  collectionName: string;
}

export function FilterSortBar({ currentSort, totalProducts, collectionName }: FilterSortBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSort(value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    if (value === "featured") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Hiển thị <span className="font-medium text-foreground">{totalProducts}</span> sản phẩm
        {collectionName && (
          <> trong <span className="font-medium text-foreground">{collectionName}</span></>
        )}
      </p>
      <Select value={currentSort} onValueChange={handleSort}>
        <SelectTrigger
          aria-label="Sắp xếp"
          className="min-h-11 w-full sm:w-48"
        >
          <SelectValue placeholder="Sắp xếp" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

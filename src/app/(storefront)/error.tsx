"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function StorefrontError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <AlertTriangle className="h-14 w-14 text-amber-500/90" aria-hidden />
      <h1 className="mt-6 font-heading text-2xl font-bold text-neutral-900">
        Đã xảy ra lỗi
      </h1>
      <p className="mt-2 max-w-md text-center text-sm text-neutral-600">
        Trang không tải được đúng cách. Vui lòng thử lại hoặc quay về trang chủ.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={() => reset()}>
          Thử lại
        </Button>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}

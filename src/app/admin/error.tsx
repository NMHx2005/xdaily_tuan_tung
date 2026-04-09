"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16">
      <AlertTriangle className="h-12 w-12 text-destructive" aria-hidden />
      <h1 className="mt-6 font-heading text-xl font-bold">Đã xảy ra lỗi</h1>
      <p className="mt-3 max-w-lg rounded-md border bg-muted/50 px-4 py-3 text-left font-mono text-xs text-muted-foreground break-all">
        {error.message || "Không có thông báo lỗi chi tiết"}
        {error.digest ? ` · digest: ${error.digest}` : ""}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={() => reset()}>
          Thử lại
        </Button>
        <Link
          href="/admin"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Về dashboard
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: "ghost" }))}>
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}

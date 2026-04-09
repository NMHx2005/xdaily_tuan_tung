import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-static";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50/80 px-4 py-16">
      <FileQuestion
        className="h-24 w-24 text-neutral-300"
        strokeWidth={1.25}
        aria-hidden
      />
      <h1 className="mt-6 font-heading text-2xl font-bold text-neutral-900 sm:text-3xl">
        404 — Trang không tồn tại
      </h1>
      <p className="mt-3 max-w-md text-center text-neutral-600">
        Trang bạn tìm kiếm không tồn tại hoặc đã bị xóa.
      </p>
      <Link
        href="/"
        className={cn(buttonVariants({ size: "lg" }), "mt-8")}
      >
        Về trang chủ
      </Link>
      <nav className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-neutral-500">
        <span className="text-neutral-400">Gợi ý:</span>
        <Link href="/collections/ghe-an" className="font-medium text-primary hover:underline">
          Ghế ăn
        </Link>
        <Link href="/collections/ban-tra" className="font-medium text-primary hover:underline">
          Bàn trà
        </Link>
        <Link href="/blogs" className="font-medium text-primary hover:underline">
          Tin tức
        </Link>
      </nav>
    </div>
  );
}

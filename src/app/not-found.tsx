import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="font-heading text-8xl font-bold text-muted-foreground/30">404</h1>
      <h2 className="mt-4 text-xl font-semibold">Trang bạn tìm không tồn tại</h2>
      <p className="mt-2 text-muted-foreground">
        Trang này có thể đã bị xóa hoặc đường dẫn không chính xác.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Về trang chủ
      </Link>
    </div>
  );
}

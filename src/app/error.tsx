"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="font-heading text-4xl font-bold">Đã xảy ra lỗi</h1>
      <p className="mt-4 text-muted-foreground">
        {error.message || "Có lỗi không mong muốn xảy ra. Vui lòng thử lại."}
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Thử lại
      </button>
    </div>
  );
}

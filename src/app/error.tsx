"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold">Đã xảy ra lỗi</h2>
      <p className="mt-2 text-gray-600">{error.message}</p>
      <button
        onClick={reset}
        className="mt-6 rounded-md bg-black px-6 py-3 text-white hover:bg-gray-800"
      >
        Thử lại
      </button>
    </div>
  );
}

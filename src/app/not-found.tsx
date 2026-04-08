import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-lg text-gray-600">
        Trang bạn tìm không tồn tại
      </p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-black px-6 py-3 text-white hover:bg-gray-800"
      >
        Về trang chủ
      </Link>
    </div>
  );
}

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <ShoppingBag className="h-16 w-16 text-neutral-300" />
      <p className="mt-4 text-lg font-medium text-neutral-600">
        Giỏ hàng trống
      </p>
      <p className="mt-1 text-sm text-neutral-400">
        Hãy thêm sản phẩm vào giỏ hàng
      </p>
      <Link href="/" className="mt-6">
        <Button>Tiếp tục mua sắm</Button>
      </Link>
    </div>
  );
}

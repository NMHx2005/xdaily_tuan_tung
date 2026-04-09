import { ShoppingBag } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export function EmptyCart() {
  return (
    <EmptyState
      icon={ShoppingBag}
      title="Giỏ hàng trống"
      description="Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm."
      actionLabel="Tiếp tục mua sắm"
      actionHref="/"
    />
  );
}

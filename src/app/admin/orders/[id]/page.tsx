import Link from "next/link";
import { notFound } from "next/navigation";

import { createCaller } from "@/lib/trpc/server";
import { OrderDetailClient } from "@/components/admin/orders/order-detail-client";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const trpc = await createCaller();
  const o = await trpc.order.getDetail({ id }).catch(() => null);
  if (!o) return { title: "Đơn hàng" };
  return { title: `Đơn ${o.orderNumber}` };
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const trpc = await createCaller();
  const order = await trpc.order.getDetail({ id }).catch(() => null);
  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-1 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-foreground">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/admin/orders" className="hover:text-foreground">
          Đơn hàng
        </Link>
        <span>/</span>
        <span className="text-foreground font-mono">{order.orderNumber}</span>
      </nav>
      <OrderDetailClient order={order} />
    </div>
  );
}

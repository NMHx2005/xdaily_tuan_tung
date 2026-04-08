"use client";

import { cn } from "@/lib/utils";

const FLOW: Array<
  "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPING" | "DELIVERED"
> = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPING", "DELIVERED"];

const labels: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
};

export function OrderStatusTimeline({ status }: { status: string }) {
  if (status === "CANCELLED") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        Đơn hàng đã hủy — không theo quy trình giao hàng chuẩn.
      </div>
    );
  }

  const idx = FLOW.indexOf(status as (typeof FLOW)[number]);

  return (
    <ol className="relative ml-1 space-y-0 border-l-2 border-muted pl-4">
      {FLOW.map((step, i) => {
        const done = idx >= 0 && i < idx;
        const current = idx === i;
        return (
          <li key={step} className="pb-4 last:pb-0">
            <div
              className={cn(
                "absolute -left-[9px] mt-0.5 size-4 rounded-full border-2 bg-background",
                done && "border-primary bg-primary",
                current && "border-primary ring-2 ring-primary/30",
                !done && !current && "border-muted-foreground/30"
              )}
            />
            <p
              className={cn(
                "text-sm font-medium",
                current && "text-primary",
                done && "text-foreground",
                !done && !current && "text-muted-foreground"
              )}
            >
              {labels[step]}
            </p>
            {current && (
              <p className="text-xs text-muted-foreground">Trạng thái hiện tại</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

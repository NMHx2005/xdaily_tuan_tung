import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING:    { label: "Chờ xác nhận", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  CONFIRMED:  { label: "Đã xác nhận", className: "bg-blue-100 text-blue-800 border-blue-200" },
  PROCESSING: { label: "Đang xử lý", className: "bg-purple-100 text-purple-800 border-purple-200" },
  SHIPPING:   { label: "Đang giao", className: "bg-orange-100 text-orange-800 border-orange-200" },
  DELIVERED:  { label: "Đã giao", className: "bg-green-100 text-green-800 border-green-200" },
  CANCELLED:  { label: "Đã hủy", className: "bg-red-100 text-red-800 border-red-200" },
};

const paymentConfig: Record<string, { label: string; className: string }> = {
  PENDING:  { label: "Chưa TT", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  PAID:     { label: "Đã TT", className: "bg-green-100 text-green-800 border-green-200" },
  FAILED:   { label: "Thất bại", className: "bg-red-100 text-red-800 border-red-200" },
  REFUNDED: { label: "Hoàn tiền", className: "bg-gray-100 text-gray-800 border-gray-200" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, className: "bg-neutral-100 text-neutral-800" };
  return <Badge className={`border text-xs ${config.className}`}>{config.label}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const config = paymentConfig[status] ?? { label: status, className: "bg-neutral-100 text-neutral-800" };
  return <Badge className={`border text-xs ${config.className}`}>{config.label}</Badge>;
}

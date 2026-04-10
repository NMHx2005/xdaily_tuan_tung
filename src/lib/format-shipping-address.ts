/** Nối địa chỉ giao hàng; bỏ qua phần rỗng (ví dụ tỉnh/quận/xã khi nhập tay một ô). */
export function formatShippingAddressLine(parts: {
  shippingAddress: string;
  shippingWard: string;
  shippingDistrict: string;
  shippingCity: string;
}): string {
  return [parts.shippingAddress, parts.shippingWard, parts.shippingDistrict, parts.shippingCity]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");
}

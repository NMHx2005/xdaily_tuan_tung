interface CollectionHeaderProps {
  name: string;
  productCount: number;
}

/** Chỉ tiêu đề + số sản phẩm — mô tả bộ sưu tập hiển thị riêng (vd. cuối trang), không đặt dưới H1. */
export function CollectionHeader({ name, productCount }: CollectionHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="font-heading text-3xl font-bold">{name}</h1>
      <p className="mt-2 text-sm text-neutral-400">
        {productCount} sản phẩm
      </p>
    </div>
  );
}

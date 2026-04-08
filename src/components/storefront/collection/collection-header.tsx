interface CollectionHeaderProps {
  name: string;
  description: string | null;
  productCount: number;
}

export function CollectionHeader({
  name,
  description,
  productCount,
}: CollectionHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="font-heading text-3xl font-bold">{name}</h1>
      {description && (
        <p className="mt-2 text-neutral-600">{description}</p>
      )}
      <p className="mt-1 text-sm text-neutral-400">
        {productCount} sản phẩm
      </p>
    </div>
  );
}

/** Nhãn mặc định khi admin để trống `homeStripLabel`. */
export function homeCategoryStripDefaultLabel(collectionName: string): string {
  const rest =
    collectionName.length > 0
      ? collectionName.charAt(0).toLowerCase() + collectionName.slice(1)
      : collectionName;
  return `Bộ sưu tập ${rest}`;
}

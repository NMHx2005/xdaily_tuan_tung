import type { VariantFormRow } from "@/components/admin/variant-manager";

export type VariantOptionGroup = {
  name: string;
  values: string[];
};

const NAME_SEPARATOR = " · ";

/** Tích Descartes danh sách giá trị theo thứ tự nhóm */
export function cartesianValueLists(groups: string[][]): string[][] {
  if (groups.length === 0) return [[]];
  const [first, ...rest] = groups;
  const tail = cartesianValueLists(rest);
  const out: string[][] = [];
  for (const v of first) {
    for (const t of tail) {
      out.push([v, ...t]);
    }
  }
  return out;
}

export function normalizeOptionGroups(raw: unknown): VariantOptionGroup[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((g) => {
      if (!g || typeof g !== "object") return null;
      const name = "name" in g && typeof g.name === "string" ? g.name.trim() : "";
      const valuesRaw = "values" in g ? g.values : undefined;
      const values =
        Array.isArray(valuesRaw)
          ? valuesRaw.filter((v): v is string => typeof v === "string").map((v) => v.trim()).filter(Boolean)
          : [];
      if (!name || values.length === 0) return null;
      return { name, values };
    })
    .filter((x): x is VariantOptionGroup => x !== null);
}

export interface GenerateVariantsOptions {
  groups: VariantOptionGroup[];
  existing: VariantFormRow[];
  baseSku: string;
  defaultPrice: number;
  defaultCompareAt: number | null;
  maxCombinations?: number;
}

/**
 * Sinh danh sách biến thể từ thuộc tính; giữ nguyên giá/SKU/ảnh của dòng trùng `name`.
 */
export function generateVariantsFromOptionGroups(
  opts: GenerateVariantsOptions
): { variants: VariantFormRow[]; comboCount: number; truncated: boolean } {
  const max = opts.maxCombinations ?? 500;
  const trimmed = opts.groups
    .map((g) => ({
      name: g.name.trim(),
      values: [...new Set(g.values.map((v) => v.trim()).filter(Boolean))],
    }))
    .filter((g) => g.name && g.values.length > 0);

  if (trimmed.length === 0) {
    return { variants: opts.existing, comboCount: 0, truncated: false };
  }

  const valueLists = trimmed.map((g) => g.values);
  let combos = cartesianValueLists(valueLists);
  let truncated = false;
  if (combos.length > max) {
    combos = combos.slice(0, max);
    truncated = true;
  }

  const byName = new Map(opts.existing.map((v) => [v.name, v]));
  const usedSkus = new Set<string>([
    opts.baseSku.trim(),
    ...opts.existing.map((v) => v.sku.trim()),
  ]);

  function allocSku(): string {
    let i = 1;
    for (;;) {
      const s = `${opts.baseSku}-V${String(i).padStart(3, "0")}`;
      if (!usedSkus.has(s)) {
        usedSkus.add(s);
        return s;
      }
      i++;
    }
  }

  const fromCombos: VariantFormRow[] = combos.map((parts) => {
    const name = parts.join(NAME_SEPARATOR);
    const prev = byName.get(name);
    if (prev) {
      return { ...prev };
    }
    return {
      id: crypto.randomUUID(),
      name,
      colorHex: "",
      price: opts.defaultPrice,
      compareAtPrice: opts.defaultCompareAt,
      sku: allocSku(),
      inStock: true,
      image: null,
    };
  });

  const generatedNames = new Set(fromCombos.map((v) => v.name));
  const orphans = opts.existing.filter((r) => !generatedNames.has(r.name));

  return {
    variants: [...fromCombos, ...orphans],
    comboCount: combos.length,
    truncated,
  };
}

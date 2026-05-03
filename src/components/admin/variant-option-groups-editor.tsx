"use client";

import * as React from "react";
import { Plus, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { VariantFormRow } from "@/components/admin/variant-manager";
import {
  generateVariantsFromOptionGroups,
  type VariantOptionGroup,
} from "@/lib/variant-option-groups";

function emptyGroup(): VariantOptionGroup {
  return { name: "", values: [""] };
}

export interface VariantOptionGroupsEditorProps {
  groups: VariantOptionGroup[];
  onGroupsChange: (next: VariantOptionGroup[]) => void;
  variants: VariantFormRow[];
  onVariantsChange: (next: VariantFormRow[]) => void;
  baseSku: string;
  defaultPrice: number;
  defaultCompareAt: number | null;
}

export function VariantOptionGroupsEditor({
  groups,
  onGroupsChange,
  variants,
  onVariantsChange,
  baseSku,
  defaultPrice,
  defaultCompareAt,
}: VariantOptionGroupsEditorProps) {
  const updateGroup = (index: number, next: VariantOptionGroup) => {
    const copy = [...groups];
    copy[index] = next;
    onGroupsChange(copy);
  };

  const handleGenerate = () => {
    const { variants: next, comboCount, truncated } = generateVariantsFromOptionGroups({
      groups,
      existing: variants,
      baseSku: baseSku.trim() || "SKU",
      defaultPrice,
      defaultCompareAt,
    });
    if (comboCount === 0) {
      toast.error("Thêm ít nhất một thuộc tính và giá trị hợp lệ.");
      return;
    }
    onVariantsChange(next);
    if (truncated) {
      toast.warning("Đã giới hạn 500 tổ hợp đầu tiên. Thu gọn thuộc tính nếu cần.");
    } else {
      toast.success(
        `Đã sinh ${comboCount} biến thể (giữ biến thể cũ không nằm trong tổ hợp mới ở cuối danh sách).`
      );
    }
  };

  return (
    <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium">Thuộc tính biến thể</p>
          <p className="text-sm text-muted-foreground">
            Mỗi nhóm: tên (vd. Màu, Size) + danh sách giá trị. Bấm sinh tổ hợp để tạo dòng biến thể;
            giá mặc định lấy từ giá sản phẩm — có thể sửa từng dòng sau.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="shrink-0 gap-1"
          onClick={handleGenerate}
        >
          <Wand2 className="size-4" />
          Sinh biến thể từ thuộc tính
        </Button>
      </div>

      <div className="space-y-3">
        {groups.map((g, i) => (
          <GroupRow
            key={i}
            group={g}
            onChange={(next) => updateGroup(i, next)}
            onRemove={() => onGroupsChange(groups.filter((_, j) => j !== i))}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onGroupsChange([...groups, emptyGroup()])}
      >
        <Plus className="size-4" />
        Thêm nhóm thuộc tính
      </Button>
    </div>
  );
}

function GroupRow({
  group,
  onChange,
  onRemove,
}: {
  group: VariantOptionGroup;
  onChange: (next: VariantOptionGroup) => void;
  onRemove: () => void;
}) {
  const values = group.values.length > 0 ? group.values : [""];

  const setValueAt = (index: number, nextText: string) => {
    const next = [...values];
    next[index] = nextText;
    onChange({ ...group, values: next });
  };

  const removeAt = (index: number) => {
    const next = values.filter((_, i) => i !== index);
    onChange({ ...group, values: next.length > 0 ? next : [""] });
  };

  const addValue = () => {
    onChange({ ...group, values: [...values, ""] });
  };

  return (
    <div className="rounded-lg border bg-card p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <Label className="text-xs text-muted-foreground">Tên thuộc tính</Label>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-destructive"
          onClick={onRemove}
          aria-label="Xóa nhóm"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      <Input
        value={group.name}
        onChange={(e) => onChange({ ...group, name: e.target.value })}
        placeholder="VD: Màu sắc"
        className="mb-2"
      />
      <Label className="text-xs text-muted-foreground">Giá trị — mỗi ô một giá trị (có thể dấu phẩy, xuống dòng tự do)</Label>
      <div className="mt-2 space-y-2">
        {values.map((val, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={val}
              onChange={(e) => setValueAt(index, e.target.value)}
              placeholder={`Giá trị ${index + 1}`}
              className="font-mono text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => removeAt(index)}
              aria-label={`Xóa giá trị ${index + 1}`}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="mt-2 gap-1"
        onClick={addValue}
      >
        <Plus className="size-4" />
        Thêm giá trị
      </Button>
    </div>
  );
}

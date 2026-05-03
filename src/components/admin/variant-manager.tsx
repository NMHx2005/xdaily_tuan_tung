"use client";

import * as React from "react";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type VariantFormRow = {
  id: string;
  name: string;
  colorHex: string;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  inStock: boolean;
  image: string | null;
};

function emptyRow(): VariantFormRow {
  return {
    id: crypto.randomUUID(),
    name: "",
    colorHex: "",
    price: 0,
    compareAtPrice: null,
    sku: "",
    inStock: true,
    image: null,
  };
}

function SortableVariantRow({
  row,
  onChange,
  onRemove,
}: {
  row: VariantFormRow;
  onChange: (next: VariantFormRow) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm",
        isDragging && "z-10 opacity-90 ring-2 ring-primary/30"
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-md border bg-muted"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4 text-muted-foreground" />
        </button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-destructive"
          onClick={onRemove}
          aria-label="Xóa biến thể"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label>Tên biến thể</Label>
          <Input
            value={row.name}
            onChange={(e) => onChange({ ...row, name: e.target.value })}
            placeholder="VD: Xám đậm"
          />
        </div>
        <div className="space-y-1.5">
          {row.colorHex.trim() !== "" ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <Label>Màu</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto shrink-0 px-2 py-0 text-xs text-muted-foreground"
                  onClick={() => onChange({ ...row, colorHex: "" })}
                >
                  Bỏ màu
                </Button>
              </div>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={row.colorHex || "#888888"}
                  onChange={(e) =>
                    onChange({ ...row, colorHex: e.target.value })
                  }
                  className="h-8 w-12 cursor-pointer rounded border"
                />
                <Input
                  value={row.colorHex}
                  onChange={(e) =>
                    onChange({ ...row, colorHex: e.target.value })
                  }
                  placeholder="#hex"
                  className="font-mono text-xs"
                />
              </div>
            </>
          ) : (
            <>
              <Label>Màu (tuỳ chọn)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => onChange({ ...row, colorHex: "#888888" })}
              >
                Thêm màu
              </Button>
            </>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Giá (₫)</Label>
          <Input
            type="number"
            min={0}
            value={row.price || ""}
            onChange={(e) =>
              onChange({
                ...row,
                price: Number(e.target.value) || 0,
              })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label>SKU</Label>
          <Input
            value={row.sku}
            onChange={(e) => onChange({ ...row, sku: e.target.value })}
            className="font-mono text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Giá gốc (₫, tuỳ chọn)</Label>
          <Input
            type="number"
            min={0}
            value={row.compareAtPrice ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              onChange({
                ...row,
                compareAtPrice: v === "" ? null : Number(v),
              });
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Ảnh (URL)</Label>
          <Input
            value={row.image ?? ""}
            onChange={(e) =>
              onChange({
                ...row,
                image: e.target.value.trim() === "" ? null : e.target.value,
              })
            }
            placeholder="https://..."
          />
        </div>
        <div className="flex items-end gap-2 pb-0.5">
          <div className="flex items-center gap-2">
            <Switch
              checked={row.inStock}
              onCheckedChange={(c) => onChange({ ...row, inStock: c })}
            />
            <span className="text-sm">Còn hàng</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface VariantManagerProps {
  value: VariantFormRow[];
  onChange: (next: VariantFormRow[]) => void;
}

export function VariantManager({ value, onChange }: VariantManagerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const a = value.findIndex((r) => r.id === active.id);
    const b = value.findIndex((r) => r.id === over.id);
    if (a < 0 || b < 0) return;
    onChange(arrayMove(value, a, b));
  };

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={value.map((r) => r.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {value.map((row) => (
              <SortableVariantRow
                key={row.id}
                row={row}
                onChange={(next) =>
                  onChange(value.map((r) => (r.id === row.id ? next : r)))
                }
                onRemove={() =>
                  onChange(value.filter((r) => r.id !== row.id))
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...value, emptyRow()])}
      >
        <Plus className="size-4" />
        Thêm biến thể
      </Button>
    </div>
  );
}

"use client";

import * as React from "react";
import Image from "next/image";
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
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { uploadImageWithProgress } from "@/lib/upload-image-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp";

export type ImageUploadRow = {
  id: string;
  url: string;
  alt: string;
};

function SortableThumb({
  item,
  onRemove,
  onAltChange,
}: {
  item: ImageUploadRow;
  onRemove: () => void;
  onAltChange: (alt: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const unopt = item.url.startsWith("data:");

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative w-[120px] shrink-0",
        isDragging && "z-10 opacity-80"
      )}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
        {item.url.startsWith("data:") || item.url.startsWith("http") ? (
          <Image
            src={item.url}
            alt={item.alt || "Ảnh"}
            fill
            sizes="120px"
            className="object-cover"
            unoptimized={unopt}
          />
        ) : null}
        <button
          type="button"
          className="absolute left-1 top-1 flex h-7 w-7 cursor-grab items-center justify-center rounded bg-background/90 shadow"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4 text-muted-foreground" />
        </button>
        <Button
          type="button"
          variant="destructive"
          size="icon-sm"
          className="absolute right-1 top-1 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={onRemove}
          aria-label="Xóa ảnh"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
      <input
        type="text"
        placeholder="Alt"
        value={item.alt}
        onChange={(e) => onAltChange(e.target.value)}
        className="mt-1 w-full rounded border bg-transparent px-1.5 py-0.5 text-xs"
      />
    </div>
  );
}

export interface ImageUploaderProps {
  value: ImageUploadRow[];
  onChange: (next: ImageUploadRow[]) => void;
  className?: string;
}

export function ImageUploader({ value, onChange, className }: ImageUploaderProps) {
  const [busy, setBusy] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files).filter(
      (file) =>
        ACCEPT.split(",").some((t) => file.type === t.trim()) &&
        file.size <= MAX_BYTES
    );
    const skipped = Array.from(files).length - list.length;
    if (skipped > 0) {
      toast.error("Một số file bị bỏ qua (chỉ JPEG/PNG/WebP, tối đa 5MB)");
    }
    if (!list.length) return;

    setBusy(true);
    setProgress(0);
    try {
      const next = [...value];
      const total = list.length;
      for (let i = 0; i < list.length; i++) {
        const file = list[i]!;
        const url = await uploadImageWithProgress(file, "products", (p) => {
          setProgress(
            Math.round(((i + p / 100) / total) * 100)
          );
        });
        next.push({
          id: crypto.randomUUID(),
          url,
          alt: file.name.replace(/\.[^.]+$/, ""),
        });
      }
      onChange(next);
      toast.success(`Đã tải ${list.length} ảnh lên`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload thất bại");
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = value.findIndex((i) => i.id === active.id);
    const newIndex = value.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(value, oldIndex, newIndex));
  };

  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          void addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          void addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/40",
          busy && "pointer-events-none opacity-60"
        )}
      >
        <Upload className="size-10 text-muted-foreground" />
        <p className="text-sm font-medium">Kéo thả ảnh vào đây hoặc bấm để chọn</p>
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WebP — tối đa 5MB mỗi ảnh (lưu trên Supabase Storage)
        </p>
        {busy && (
          <div className="w-full max-w-xs space-y-1">
            <p className="text-xs font-medium text-primary">
              Đang tải lên… {progress}%
            </p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {value.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={value.map((i) => i.id)} strategy={rectSortingStrategy}>
            <div className="flex flex-wrap gap-4">
              {value.map((item) => (
                <SortableThumb
                  key={item.id}
                  item={item}
                  onRemove={() =>
                    onChange(value.filter((v) => v.id !== item.id))
                  }
                  onAltChange={(alt) =>
                    onChange(
                      value.map((v) => (v.id === item.id ? { ...v, alt } : v))
                    )
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

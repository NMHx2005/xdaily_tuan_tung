"use client";

import * as React from "react";
import type {
  FieldPath,
  FieldValues,
  PathValue,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { ImagePlus } from "lucide-react";
import { uploadImageWithProgress } from "@/lib/upload-image-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function AdminImagePreview({ url }: { url?: string | null }) {
  const src = url?.trim();
  if (!src) {
    return (
      <p className="mt-2 text-xs text-muted-foreground">
        Chưa có link — trên website sẽ dùng ảnh mặc định (hoặc bị chặn nếu domain không nằm trong danh sách cho phép).
      </p>
    );
  }
  return (
    <div className="mt-2 max-w-xl overflow-hidden rounded-md border bg-muted/30">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="max-h-48 w-full object-contain object-left"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    </div>
  );
}

type Props<T extends FieldValues> = {
  inputId: string;
  label: string;
  hint?: string;
  fieldPath: FieldPath<T>;
  register: UseFormRegister<T>;
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
};

/**
 * Ô URL ảnh + nút upload lên Supabase (bucket banners) — dùng form Giới thiệu, Website, v.v.
 */
export function AdminImageUrlField<T extends FieldValues>({
  inputId,
  label,
  hint,
  fieldPath,
  register,
  watch,
  setValue,
}: Props<T>) {
  const [uploadPct, setUploadPct] = React.useState<number | null>(null);
  const value = watch(fieldPath) as unknown as string;

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadPct(0);
    try {
      const url = await uploadImageWithProgress(file, "banners", setUploadPct);
      setValue(
        fieldPath,
        url as PathValue<T, typeof fieldPath>,
        { shouldDirty: true, shouldTouch: true },
      );
      toast.success("Đã upload — nhấn Lưu để áp dụng");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload thất bại");
    } finally {
      setUploadPct(null);
    }
  }

  return (
    <div>
      <Label htmlFor={inputId}>{label}</Label>
      {hint ? (
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
      <Input
        id={inputId}
        className="mt-1 font-mono text-sm"
        placeholder="https://… hoặc /đường-dẫn-trong-public"
        {...register(fieldPath)}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label className="inline-flex cursor-pointer">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={onFileChange}
          />
          <span className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-muted">
            <ImagePlus className="size-4" />
            Upload ảnh (bucket banners)
          </span>
        </label>
        {uploadPct !== null && (
          <span className="text-xs text-muted-foreground">{uploadPct}%</span>
        )}
      </div>
      <AdminImagePreview url={value} />
    </div>
  );
}

"use client";

import * as React from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import type { StorageBucket } from "@/lib/upload-image-client";
import { uploadImageWithProgress } from "@/lib/upload-image-client";
import { Button } from "@/components/ui/button";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp";

export function BlogThumbnail({
  value,
  onChange,
  className,
  bucket = "blogs",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  className?: string;
  /** Bucket Supabase Storage (public). */
  bucket?: Extract<StorageBucket, "blogs" | "banners">;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const pick = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!ACCEPT.split(",").some((t) => file.type === t.trim())) {
      toast.error("Chỉ chấp nhận JPEG, PNG hoặc WebP");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Ảnh tối đa 5MB");
      return;
    }
    setBusy(true);
    setProgress(0);
    try {
      const url = await uploadImageWithProgress(file, bucket, setProgress);
      onChange(url);
      toast.success("Đã tải ảnh lên");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload thất bại");
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          void pick(e.target.files);
          e.target.value = "";
        }}
      />
      <div
        className={cn(
          "relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-4 transition-colors hover:border-primary/40",
          busy && "pointer-events-none opacity-60"
        )}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
      >
        {value ? (
          <div className="relative aspect-video w-full max-w-md">
            <Image
              src={value}
              alt=""
              fill
              className="object-contain"
              unoptimized={value.startsWith("data:")}
            />
          </div>
        ) : (
          <>
            <Upload className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Ảnh đại diện (JPEG/PNG/WebP, tối đa 5MB)
            </p>
          </>
        )}
        {busy && (
          <div className="absolute inset-x-4 bottom-4 space-y-1">
            <p className="text-center text-xs font-medium text-primary">
              Đang tải lên… {progress}%
            </p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-background/80">
              <div
                className="h-full bg-primary transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onChange(null);
          }}
        >
          Gỡ ảnh
        </Button>
      )}
    </div>
  );
}

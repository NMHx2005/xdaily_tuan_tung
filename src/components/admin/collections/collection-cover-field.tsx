"use client";

import * as React from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { uploadImageWithProgress } from "@/lib/upload-image-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp";

type Props = {
  url: string;
  onChange: (url: string) => void;
  id?: string;
  className?: string;
};

/**
 * Ảnh đại diện collection: nhập URL hoặc upload lên Supabase bucket `collections`.
 */
export function CollectionCoverField({ url, onChange, id, className }: Props) {
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
      const uploaded = await uploadImageWithProgress(
        file,
        "collections",
        setProgress,
      );
      onChange(uploaded);
      toast.success("Đã tải ảnh lên");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload thất bại");
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  const hasPreview = Boolean(url?.trim());

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-2">
        <Label htmlFor={id}>Ảnh đại diện</Label>
        <Input
          id={id}
          type="url"
          value={url}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          autoComplete="off"
        />
        <p className="text-xs text-muted-foreground">
          Dán URL ảnh có sẵn, hoặc tải file từ máy ở khung bên dưới (JPEG / PNG / WebP,
          tối đa 5MB).
        </p>
      </div>

      <div className="relative">
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
            "relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-4 transition-colors hover:border-primary/40",
            busy && "pointer-events-none opacity-60",
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
          {hasPreview ? (
            <div className="relative aspect-4/3 w-full max-w-xs">
              <Image
                src={url.trim()}
                alt=""
                fill
                className="object-contain"
                unoptimized={url.startsWith("data:")}
              />
            </div>
          ) : (
            <>
              <Upload className="size-9 text-muted-foreground" />
              <p className="text-center text-sm text-muted-foreground">
                Tải ảnh từ máy (JPEG / PNG / WebP, tối đa 5MB)
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
      </div>

      {hasPreview && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onChange("");
          }}
        >
          Gỡ ảnh
        </Button>
      )}
    </div>
  );
}

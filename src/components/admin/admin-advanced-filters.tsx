"use client";

import * as React from "react";
import { ChevronDown, ListFilter } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminAdvancedFiltersProps = {
  title?: string;
  /** Số điều kiện lọc đang khác mặc định (hiển thị badge). */
  activeCount: number;
  onReset?: () => void;
  children: React.ReactNode;
  className?: string;
};

export function AdminAdvancedFilters({
  title = "Bộ lọc nâng cao",
  activeCount,
  onReset,
  children,
  className,
}: AdminAdvancedFiltersProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div
      className={cn(
        "rounded-lg border border-dashed bg-muted/15",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium hover:bg-muted/40"
      >
        <span className="flex items-center gap-2">
          <ListFilter className="size-4 shrink-0 text-muted-foreground" />
          {title}
          {activeCount > 0 ? (
            <Badge variant="secondary" className="font-normal tabular-nums">
              {activeCount}
            </Badge>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <div className="space-y-4 border-t px-3 py-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {children}
          </div>
          {onReset && activeCount > 0 ? (
            <div className="flex justify-end border-t pt-3">
              <Button type="button" variant="outline" size="sm" onClick={onReset}>
                Xóa bộ lọc
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

type FilterFieldProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
};

export function AdminFilterField({ label, children, className }: FilterFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center px-4",
        className
      )}
    >
      <Icon className="h-16 w-16 text-neutral-300" aria-hidden />
      <p className="mt-4 text-lg font-medium text-neutral-700">{title}</p>
      <p className="mt-1 max-w-md text-sm text-neutral-500">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className={cn(buttonVariants({ variant: "default" }), "mt-6")}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

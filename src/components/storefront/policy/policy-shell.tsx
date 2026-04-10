import type { ReactNode } from "react";

export function PolicyShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
      <h1 className="font-heading text-3xl font-bold tracking-tight text-neutral-900">
        {title}
      </h1>
      <div className="prose prose-neutral mt-8 max-w-none prose-headings:font-heading prose-a:text-brand">
        {children}
      </div>
    </div>
  );
}

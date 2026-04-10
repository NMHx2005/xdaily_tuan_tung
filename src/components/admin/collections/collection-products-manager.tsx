"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
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
import { GripVertical, Plus, Search, Trash2 } from "lucide-react";
import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@/server/trpc";
import { trpc } from "@/lib/trpc/client";
import { useDebounce } from "@/hooks/use-debounce";
import { SITE_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ProductSearchRow =
  inferRouterOutputs<AppRouter>["product"]["getAll"]["items"][number];

export type CollectionProductEntry = {
  productId: string;
  name: string;
  slug: string;
  image: string | null;
};

function SortableRow({
  entry,
  onRemove,
}: {
  entry: CollectionProductEntry;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.productId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card p-2 pr-3",
        isDragging && "z-10 opacity-90 ring-2 ring-primary/30"
      )}
    >
      <button
        type="button"
        className="flex h-9 w-9 shrink-0 cursor-grab items-center justify-center rounded-md border bg-muted"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4 text-muted-foreground" />
      </button>
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
        {entry.image ? (
          <Image
            src={entry.image}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{entry.name}</p>
        <Link
          href={`${SITE_URL}/products/${entry.slug}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-primary hover:underline"
        >
          Xem trên site
        </Link>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-destructive"
        onClick={onRemove}
        aria-label="Gỡ khỏi danh mục"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

export interface CollectionProductsManagerProps {
  value: CollectionProductEntry[];
  onChange: (next: CollectionProductEntry[]) => void;
}

/** Danh sách tĩnh cùng giao diện — tránh SSR DndContext (@dnd-kit id không khớp client). */
function StaticProductRows({
  value,
  onChange,
}: {
  value: CollectionProductEntry[];
  onChange: (next: CollectionProductEntry[]) => void;
}) {
  return (
    <div className="space-y-2">
      {value.map((entry) => (
        <div
          key={entry.productId}
          className="flex items-center gap-3 rounded-lg border bg-card p-2 pr-3"
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted opacity-40"
            aria-hidden
          >
            <GripVertical className="size-4 text-muted-foreground" />
          </div>
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
            {entry.image ? (
              <Image
                src={entry.image}
                alt=""
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{entry.name}</p>
            <Link
              href={`${SITE_URL}/products/${entry.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary hover:underline"
            >
              Xem trên site
            </Link>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-destructive"
            onClick={() =>
              onChange(value.filter((e) => e.productId !== entry.productId))
            }
            aria-label="Gỡ khỏi danh mục"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

export function CollectionProductsManager({
  value,
  onChange,
}: CollectionProductsManagerProps) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const debounced = useDebounce(q, 300);
  /** Chỉ mount Dnd sau khi client hydrate — tránh hydration mismatch với aria-describedby của dnd-kit. */
  const [dndReady, setDndReady] = React.useState(false);
  React.useLayoutEffect(() => {
    setDndReady(true);
  }, []);

  const { data: searchData } = trpc.product.getAll.useQuery(
    {
      page: 1,
      limit: 15,
      sort: "newest",
      q: debounced.trim() || undefined,
    },
    { enabled: open }
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const a = value.findIndex((e) => e.productId === active.id);
    const b = value.findIndex((e) => e.productId === over.id);
    if (a < 0 || b < 0) return;
    onChange(arrayMove(value, a, b));
  };

  const addProduct = (p: ProductSearchRow) => {
    if (value.some((e) => e.productId === p.id)) {
      return;
    }
    onChange([
      ...value,
      {
        productId: p.id,
        name: p.name,
        slug: p.slug,
        image: p.images[0]?.url ?? null,
      },
    ]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">Sản phẩm trong bộ sưu tập</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button type="button" size="sm" variant="outline">
                <Plus className="size-4" />
                Thêm sản phẩm
              </Button>
            }
          />
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Tìm và thêm sản phẩm</DialogTitle>
            </DialogHeader>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tên sản phẩm..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
              />
            </div>
            <ul className="max-h-64 space-y-1 overflow-y-auto">
              {(searchData?.items ?? []).map((p: ProductSearchRow) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md border px-2 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => {
                      addProduct(p);
                      setOpen(false);
                      setQ("");
                    }}
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                      {p.images[0]?.url ? (
                        <Image
                          src={p.images[0].url}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <span className="truncate font-medium">{p.name}</span>
                  </button>
                </li>
              ))}
              {open && (searchData?.items.length ?? 0) === 0 && debounced.trim() && (
                <li className="py-6 text-center text-sm text-muted-foreground">
                  Không có kết quả
                </li>
              )}
            </ul>
          </DialogContent>
        </Dialog>
      </div>

      {dndReady ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={value.map((e) => e.productId)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {value.map((entry) => (
                <SortableRow
                  key={entry.productId}
                  entry={entry}
                  onRemove={() =>
                    onChange(
                      value.filter((e) => e.productId !== entry.productId)
                    )
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <StaticProductRows value={value} onChange={onChange} />
      )}

      {value.length === 0 && (
        <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
          Chưa có sản phẩm. Bấm &quot;Thêm sản phẩm&quot; để chọn.
        </p>
      )}
    </div>
  );
}

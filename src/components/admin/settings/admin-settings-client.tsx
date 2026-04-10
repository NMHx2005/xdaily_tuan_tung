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
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@/server/trpc";
import { trpc } from "@/lib/trpc/client";
import { formatPrice } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BlogThumbnail } from "@/components/admin/blogs/blog-thumbnail";
import { AdminSiteContentClient } from "@/components/admin/settings/admin-site-content-client";
import { cn } from "@/lib/utils";

type AdminBanner = inferRouterOutputs<AppRouter>["admin"]["getBannersAll"][number];
type FlashSaleData = NonNullable<
  inferRouterOutputs<AppRouter>["admin"]["getFlashSale"]
>;
type ProductListItem =
  inferRouterOutputs<AppRouter>["product"]["getAll"]["items"][number];

function toDatetimeLocal(d: Date): string {
  const x = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}T${pad(x.getHours())}:${pad(x.getMinutes())}`;
}

function SortableBannerCard({
  banner,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  banner: Pick<
    AdminBanner,
    "id" | "image" | "title" | "link" | "isActive"
  >;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: (v: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: banner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3 shadow-sm",
        isDragging && "z-10 opacity-90 ring-2 ring-primary/30"
      )}
    >
      <button
        type="button"
        className="flex h-10 w-10 shrink-0 cursor-grab items-center justify-center rounded-md border bg-muted"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4 text-muted-foreground" />
      </button>
      <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
        {banner.image ? (
          <Image
            src={banner.image}
            alt=""
            fill
            className="object-cover"
            unoptimized={banner.image.startsWith("data:")}
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{banner.title || "Banner"}</p>
        <p className="truncate text-xs text-muted-foreground">{banner.link}</p>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={banner.isActive}
          onCheckedChange={onToggleActive}
        />
        <Button type="button" size="icon-sm" variant="outline" onClick={onEdit}>
          <Pencil className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className="text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function BannerFormFields({
  values,
  onChange,
}: {
  values: {
    image: string;
    mobileImage: string | null;
    title: string;
    subtitle: string;
    link: string;
    isActive: boolean;
  };
  onChange: (next: typeof values) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Ảnh desktop</Label>
        <BlogThumbnail
          bucket="banners"
          value={values.image || null}
          onChange={(url) => onChange({ ...values, image: url ?? "" })}
        />
      </div>
      <div className="space-y-2">
        <Label>Ảnh mobile (tuỳ chọn)</Label>
        <BlogThumbnail
          bucket="banners"
          value={values.mobileImage}
          onChange={(url) => onChange({ ...values, mobileImage: url })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bn-title">Tiêu đề</Label>
        <Input
          id="bn-title"
          value={values.title}
          onChange={(e) => onChange({ ...values, title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bn-sub">Phụ đề</Label>
        <Input
          id="bn-sub"
          value={values.subtitle}
          onChange={(e) => onChange({ ...values, subtitle: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bn-link">Liên kết</Label>
        <Input
          id="bn-link"
          value={values.link}
          onChange={(e) => onChange({ ...values, link: e.target.value })}
          placeholder="/collections/..."
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="bn-act">Hiển thị</Label>
        <Switch
          id="bn-act"
          checked={values.isActive}
          onCheckedChange={(c) => onChange({ ...values, isActive: c })}
        />
      </div>
    </div>
  );
}

function BannersBlock() {
  const utils = trpc.useUtils();
  const { data: bannersData, isLoading } = trpc.admin.getBannersAll.useQuery();
  const banners: AdminBanner[] = bannersData ?? [];

  const reorderMut = trpc.admin.reorderBanners.useMutation({
    onSuccess: () => {
      toast.success("Đã lưu thành công");
      void utils.admin.getBannersAll.invalidate();
    },
    onError: () => toast.error("Đã xảy ra lỗi, vui lòng thử lại"),
  });

  const updateMut = trpc.admin.updateBanner.useMutation({
    onSuccess: () => {
      toast.success("Đã lưu thành công");
      void utils.admin.getBannersAll.invalidate();
    },
    onError: () => toast.error("Đã xảy ra lỗi, vui lòng thử lại"),
  });

  const createMut = trpc.admin.createBanner.useMutation({
    onSuccess: () => {
      toast.success("Đã lưu thành công");
      void utils.admin.getBannersAll.invalidate();
    },
    onError: () => toast.error("Đã xảy ra lỗi, vui lòng thử lại"),
  });

  const deleteMut = trpc.admin.deleteBanner.useMutation({
    onSuccess: () => {
      toast.success("Đã xóa thành công");
      void utils.admin.getBannersAll.invalidate();
    },
    onError: () => toast.error("Đã xảy ra lỗi, vui lòng thử lại"),
  });

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);

  const emptyForm = {
    image: "",
    mobileImage: null as string | null,
    title: "",
    subtitle: "",
    link: "",
    isActive: true,
  };
  const [createForm, setCreateForm] = React.useState(emptyForm);

  const editing = editId ? banners.find((b) => b.id === editId) : undefined;
  const [editForm, setEditForm] = React.useState(emptyForm);
  React.useEffect(() => {
    if (editing) {
      setEditForm({
        image: editing.image,
        mobileImage: editing.mobileImage,
        title: editing.title,
        subtitle: editing.subtitle,
        link: editing.link,
        isActive: editing.isActive,
      });
    }
  }, [editing]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const a = banners.findIndex((b) => b.id === active.id);
    const b = banners.findIndex((x) => x.id === over.id);
    if (a < 0 || b < 0) return;
    const next = arrayMove(banners, a, b);
    reorderMut.mutate({ orderedIds: next.map((x) => x.id) });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle>Banner trang chủ</CardTitle>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger
            render={
              <Button type="button" size="sm" variant="outline">
                <Plus className="size-4" />
                Thêm banner
              </Button>
            }
          />
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Banner mới</DialogTitle>
            </DialogHeader>
            <BannerFormFields values={createForm} onChange={setCreateForm} />
            <Button
              type="button"
              className="w-full"
              disabled={
                createMut.isPending || !createForm.image.trim()
              }
              onClick={() => {
                createMut.mutate(
                  {
                    image: createForm.image,
                    mobileImage: createForm.mobileImage,
                    title: createForm.title,
                    subtitle: createForm.subtitle,
                    link: createForm.link,
                    position: banners.length,
                    isActive: createForm.isActive,
                  },
                  {
                    onSuccess: () => {
                      setCreateOpen(false);
                      setCreateForm(emptyForm);
                    },
                  }
                );
              }}
            >
              Tạo banner
            </Button>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <p className="text-sm text-muted-foreground">Đang tải…</p>
        )}
        {!isLoading && banners.length === 0 && (
          <p className="text-sm text-muted-foreground">Chưa có banner.</p>
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={banners.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {banners.map((b) => (
                <SortableBannerCard
                  key={b.id}
                  banner={b}
                  onToggleActive={(isActive) =>
                    updateMut.mutate({ id: b.id, isActive })
                  }
                  onEdit={() => setEditId(b.id)}
                  onDelete={() => {
                    if (window.confirm("Xóa banner này?")) {
                      deleteMut.mutate({ id: b.id });
                    }
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <Dialog open={!!editId} onOpenChange={(o) => !o && setEditId(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Sửa banner</DialogTitle>
            </DialogHeader>
            {editing && (
              <>
                <BannerFormFields values={editForm} onChange={setEditForm} />
                <Button
                  type="button"
                  className="w-full"
                  disabled={updateMut.isPending || !editForm.image.trim()}
                  onClick={() =>
                    updateMut.mutate(
                      {
                        id: editing.id,
                        image: editForm.image,
                        mobileImage: editForm.mobileImage,
                        title: editForm.title,
                        subtitle: editForm.subtitle,
                        link: editForm.link,
                        isActive: editForm.isActive,
                      },
                      { onSuccess: () => setEditId(null) }
                    )
                  }
                >
                  Lưu
                </Button>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

type FlashLine = {
  productId: string;
  name: string;
  image: string | null;
  salePrice: number;
};

function SortableFlashRow({
  line,
  onPriceChange,
  onRemove,
}: {
  line: FlashLine;
  onPriceChange: (n: number) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: line.productId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg border bg-card p-2",
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
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
        {line.image ? (
          <Image
            src={line.image}
            alt=""
            fill
            className="object-cover"
            unoptimized={line.image.startsWith("data:")}
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{line.name}</p>
        <div className="mt-1 flex max-w-xs items-center gap-2">
          <Label className="text-xs text-muted-foreground">Giá sale</Label>
          <Input
            type="number"
            min={1}
            className="h-8 font-mono text-sm"
            value={line.salePrice}
            onChange={(e) =>
              onPriceChange(Number(e.target.value.replace(/\D/g, "")) || 0)
            }
          />
        </div>
      </div>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        className="text-destructive"
        onClick={onRemove}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

function FlashSaleBlock() {
  const utils = trpc.useUtils();
  const { data: fs, isLoading } = trpc.admin.getFlashSale.useQuery();

  const updateMut = trpc.admin.updateFlashSale.useMutation({
    onSuccess: () => {
      toast.success("Đã lưu thành công");
      void utils.admin.getFlashSale.invalidate();
    },
    onError: () => toast.error("Đã xảy ra lỗi, vui lòng thử lại"),
  });

  const [name, setName] = React.useState("Flash sale");
  const [startsLocal, setStartsLocal] = React.useState("");
  const [endsLocal, setEndsLocal] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);
  const [lines, setLines] = React.useState<FlashLine[]>([]);
  const [addOpen, setAddOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const debouncedQ = useDebounce(q, 300);

  const { data: searchData } = trpc.product.getAll.useQuery(
    {
      page: 1,
      limit: 15,
      sort: "newest",
      q: debouncedQ.trim() || undefined,
    },
    { enabled: addOpen }
  );

  React.useEffect(() => {
    if (isLoading) return;
    if (fs == null) {
      const end = new Date();
      end.setDate(end.getDate() + 7);
      setName("Flash sale");
      setStartsLocal(toDatetimeLocal(new Date()));
      setEndsLocal(toDatetimeLocal(end));
      setIsActive(true);
      setLines([]);
      return;
    }
    setName(fs.name);
    setStartsLocal(toDatetimeLocal(fs.startsAt));
    setEndsLocal(toDatetimeLocal(fs.endsAt));
    setIsActive(fs.isActive);
    setLines(
      fs.items.map((it: FlashSaleData["items"][number]) => ({
        productId: it.productId,
        name: it.product.name,
        image: it.product.images[0]?.url ?? null,
        salePrice: it.salePrice,
      }))
    );
  }, [fs, isLoading]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const a = lines.findIndex((l) => l.productId === active.id);
    const b = lines.findIndex((l) => l.productId === over.id);
    if (a < 0 || b < 0) return;
    setLines(arrayMove(lines, a, b));
  };

  const addProduct = (p: ProductListItem) => {
    if (lines.some((l) => l.productId === p.id)) return;
    setLines((prev) => [
      ...prev,
      {
        productId: p.id,
        name: p.name,
        image: p.images[0]?.url ?? null,
        salePrice: Math.max(1, Math.floor(p.price * 0.9)),
      },
    ]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flash sale</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <p className="text-sm text-muted-foreground">Đang tải…</p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fs-name">Tên chương trình</Label>
            <Input
              id="fs-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between gap-2 sm:col-span-2">
            <Label htmlFor="fs-act">Đang hoạt động</Label>
            <Switch
              id="fs-act"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fs-start">Bắt đầu</Label>
            <Input
              id="fs-start"
              type="datetime-local"
              value={startsLocal}
              onChange={(e) => setStartsLocal(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fs-end">Kết thúc</Label>
            <Input
              id="fs-end"
              type="datetime-local"
              value={endsLocal}
              onChange={(e) => setEndsLocal(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">Sản phẩm flash sale</p>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
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
                <DialogTitle>Chọn sản phẩm</DialogTitle>
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
                {(searchData?.items ?? []).map((p: ProductListItem) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-md border px-2 py-2 text-left text-sm hover:bg-muted"
                      onClick={() => {
                        addProduct(p);
                        setAddOpen(false);
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
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {p.name}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatPrice(p.price)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </DialogContent>
          </Dialog>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={lines.map((l) => l.productId)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {lines.map((line) => (
                <SortableFlashRow
                  key={line.productId}
                  line={line}
                  onPriceChange={(n) =>
                    setLines((prev) =>
                      prev.map((l) =>
                        l.productId === line.productId
                          ? { ...l, salePrice: Math.max(1, n) }
                          : l
                      )
                    )
                  }
                  onRemove={() =>
                    setLines((prev) =>
                      prev.filter((l) => l.productId !== line.productId)
                    )
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {lines.length === 0 && (
          <p className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
            Chưa có sản phẩm. Thêm ít nhất một sản phẩm trước khi bật flash sale.
          </p>
        )}

        <Button
          type="button"
          disabled={
            updateMut.isPending ||
            !name.trim() ||
            !startsLocal ||
            !endsLocal ||
            lines.length === 0
          }
          onClick={() => {
            const startsAt = new Date(startsLocal);
            const endsAt = new Date(endsLocal);
            if (endsAt <= startsAt) {
              toast.error("Thời gian kết thúc phải sau thời gian bắt đầu");
              return;
            }
            updateMut.mutate({
              id: fs?.id,
              name: name.trim(),
              startsAt,
              endsAt,
              isActive,
              items: lines.map((l) => ({
                productId: l.productId,
                salePrice: l.salePrice,
              })),
            });
          }}
        >
          Lưu flash sale
        </Button>
      </CardContent>
    </Card>
  );
}

export function AdminSettingsClient() {
  return (
    <div className="space-y-8">
      <AdminSiteContentClient />

      <BannersBlock />
      <FlashSaleBlock />
    </div>
  );
}

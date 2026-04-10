"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const profileSchema = z.object({
  name: z.string().min(2, "Tên tối thiểu 2 ký tự"),
  phone: z.string().max(20, "Tối đa 20 ký tự").optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function AccountProfileClient() {
  const { update: updateSession } = useSession();
  const utils = trpc.useUtils();
  const { data: profile, isLoading } = trpc.user.getProfile.useQuery();

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", phone: "" },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        phone: profile.phone ?? "",
      });
    }
  }, [profile, form]);

  const updateMut = trpc.user.updateProfile.useMutation({
    onSuccess: async (data) => {
      toast.success("Đã cập nhật thông tin");
      await updateSession({ name: data.name });
      void utils.user.getProfile.invalidate();
    },
    onError: (e) => toast.error(e.message || "Không lưu được"),
  });

  function onSubmit(values: ProfileValues) {
    updateMut.mutate({
      name: values.name,
      phone: values.phone?.trim() ?? "",
    });
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <Link
        href="/account"
        className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-[#0066FF]"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Về tài khoản
      </Link>

      <h1 className="font-heading text-2xl font-bold">Thông tin cá nhân</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Cập nhật tên và số điện thoại liên hệ.
      </p>

      {isLoading || !profile ? (
        <div className="mt-8 w-full max-w-3xl space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-8 w-full max-w-3xl space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              type="email"
              value={profile.email}
              disabled
              className="bg-neutral-50"
            />
            <p className="text-xs text-neutral-500">Email không đổi được tại đây.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-name">Họ và tên</Label>
            <Input id="profile-name" {...form.register("name")} autoComplete="name" />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-phone">Số điện thoại</Label>
            <Input
              id="profile-phone"
              {...form.register("phone")}
              autoComplete="tel"
              placeholder="VD: 0912345678"
            />
            {form.formState.errors.phone && (
              <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <Button type="submit" disabled={updateMut.isPending}>
            {updateMut.isPending ? "Đang lưu…" : "Lưu thay đổi"}
          </Button>
        </form>
      )}
    </div>
  );
}

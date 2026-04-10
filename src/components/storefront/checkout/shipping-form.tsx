"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ShippingValues {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  note: string;
}

export function ShippingForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ShippingValues>();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Thông tin giao hàng</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="fullName">Họ và tên *</Label>
          <Input
            id="fullName"
            aria-required="true"
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            {...register("fullName")}
            placeholder="Nguyễn Văn A"
            className="mt-1"
          />
          {errors.fullName && (
            <p id="fullName-error" role="alert" className="mt-1 text-xs text-destructive">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Số điện thoại *</Label>
          <Input
            id="phone"
            aria-required="true"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            {...register("phone")}
            placeholder="0912345678"
            className="mt-1"
          />
          {errors.phone && (
            <p id="phone-error" role="alert" className="mt-1 text-xs text-destructive">
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
          placeholder="email@example.com"
          className="mt-1"
        />
        {errors.email && (
          <p id="email-error" role="alert" className="mt-1 text-xs text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="address">Địa chỉ giao hàng *</Label>
        <p className="mt-0.5 text-xs text-neutral-500">
          Ghi đầy đủ: số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố…
        </p>
        <Textarea
          id="address"
          aria-required="true"
          aria-invalid={!!errors.address}
          aria-describedby={errors.address ? "address-error" : undefined}
          {...register("address")}
          placeholder="Ví dụ: 12 ngõ 4 Láng Hạ, phường Láng Hạ, quận Đống Đa, Hà Nội"
          rows={4}
          className="mt-1 min-h-[6rem] resize-y"
        />
        {errors.address && (
          <p id="address-error" role="alert" className="mt-1 text-xs text-destructive">
            {errors.address.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="note">Ghi chú</Label>
        <Textarea
          id="note"
          {...register("note")}
          placeholder="Ghi chú cho đơn hàng (tùy chọn)"
          rows={3}
          className="mt-1"
        />
      </div>
    </div>
  );
}

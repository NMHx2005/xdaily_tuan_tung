"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { PROVINCES } from "@/lib/vietnam-provinces";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ShippingValues {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  note: string;
}

export function ShippingForm() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ShippingValues>();

  const selectedCity = watch("city");
  const selectedDistrict = watch("district");

  const province = PROVINCES.find((p) => p.name === selectedCity);
  const district = province?.districts.find((d) => d.name === selectedDistrict);

  useEffect(() => {
    setValue("district", "");
    setValue("ward", "");
  }, [selectedCity, setValue]);

  useEffect(() => {
    setValue("ward", "");
  }, [selectedDistrict, setValue]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Thông tin giao hàng</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="fullName">Họ và tên *</Label>
          <Input
            id="fullName"
            {...register("fullName")}
            placeholder="Nguyễn Văn A"
            className="mt-1"
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Số điện thoại *</Label>
          <Input
            id="phone"
            {...register("phone")}
            placeholder="0912345678"
            className="mt-1"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="email@example.com"
          className="mt-1"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="address">Địa chỉ (số nhà, đường) *</Label>
        <Input
          id="address"
          {...register("address")}
          placeholder="123 Nguyễn Huệ"
          className="mt-1"
        />
        {errors.address && (
          <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>Tỉnh/Thành phố *</Label>
          <Select value={selectedCity || ""} onValueChange={(v) => v && setValue("city", v)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Chọn tỉnh/TP" />
            </SelectTrigger>
            <SelectContent>
              {PROVINCES.map((p) => (
                <SelectItem key={p.name} value={p.name}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.city && (
            <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>
          )}
        </div>

        <div>
          <Label>Quận/Huyện *</Label>
          <Select
            value={selectedDistrict || ""}
            onValueChange={(v) => v && setValue("district", v)}
            disabled={!province}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Chọn quận/huyện" />
            </SelectTrigger>
            <SelectContent>
              {province?.districts.map((d) => (
                <SelectItem key={d.name} value={d.name}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.district && (
            <p className="mt-1 text-xs text-red-500">{errors.district.message}</p>
          )}
        </div>

        <div>
          <Label>Phường/Xã *</Label>
          <Select
            value={watch("ward") || ""}
            onValueChange={(v) => v && setValue("ward", v)}
            disabled={!district}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Chọn phường/xã" />
            </SelectTrigger>
            <SelectContent>
              {district?.wards.map((w) => (
                <SelectItem key={w.name} value={w.name}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.ward && (
            <p className="mt-1 text-xs text-red-500">{errors.ward.message}</p>
          )}
        </div>
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

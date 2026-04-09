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
        <Label htmlFor="address">Địa chỉ (số nhà, đường) *</Label>
        <Input
          id="address"
          aria-required="true"
          aria-invalid={!!errors.address}
          aria-describedby={errors.address ? "address-error" : undefined}
          {...register("address")}
          placeholder="123 Nguyễn Huệ"
          className="mt-1"
        />
        {errors.address && (
          <p id="address-error" role="alert" className="mt-1 text-xs text-destructive">
            {errors.address.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="shipping-city">Tỉnh/Thành phố *</Label>
          <Select value={selectedCity || ""} onValueChange={(v) => v && setValue("city", v)}>
            <SelectTrigger
              id="shipping-city"
              aria-required="true"
              aria-invalid={!!errors.city}
              aria-describedby={errors.city ? "city-error" : undefined}
              aria-label="Tỉnh hoặc thành phố"
              className="mt-1"
            >
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
            <p id="city-error" role="alert" className="mt-1 text-xs text-destructive">
              {errors.city.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="shipping-district">Quận/Huyện *</Label>
          <Select
            value={selectedDistrict || ""}
            onValueChange={(v) => v && setValue("district", v)}
            disabled={!province}
          >
            <SelectTrigger
              id="shipping-district"
              aria-required="true"
              aria-invalid={!!errors.district}
              aria-describedby={errors.district ? "district-error" : undefined}
              aria-label="Quận hoặc huyện"
              className="mt-1"
            >
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
            <p id="district-error" role="alert" className="mt-1 text-xs text-destructive">
              {errors.district.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="shipping-ward">Phường/Xã *</Label>
          <Select
            value={watch("ward") || ""}
            onValueChange={(v) => v && setValue("ward", v)}
            disabled={!district}
          >
            <SelectTrigger
              id="shipping-ward"
              aria-required="true"
              aria-invalid={!!errors.ward}
              aria-describedby={errors.ward ? "ward-error" : undefined}
              aria-label="Phường hoặc xã"
              className="mt-1"
            >
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
            <p id="ward-error" role="alert" className="mt-1 text-xs text-destructive">
              {errors.ward.message}
            </p>
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

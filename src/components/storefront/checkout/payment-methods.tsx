"use client";

import { Truck, CreditCard, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

type PaymentMethod = "COD" | "VNPAY" | "MOMO";

interface PaymentMethodsProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

const methods: { value: PaymentMethod; label: string; desc: string; icon: typeof Truck }[] = [
  { value: "COD", label: "Thanh toán khi nhận hàng", desc: "Trả tiền mặt khi nhận hàng", icon: Truck },
  { value: "VNPAY", label: "VNPay", desc: "Thanh toán qua VNPay", icon: CreditCard },
  { value: "MOMO", label: "MoMo", desc: "Thanh toán qua ví MoMo", icon: Wallet },
];

export function PaymentMethods({ value, onChange }: PaymentMethodsProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold">Phương thức thanh toán</h2>
      <div className="space-y-2">
        {methods.map((m) => {
          const Icon = m.icon;
          const isSelected = value === m.value;
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => onChange(m.value)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-neutral-200 hover:border-neutral-300"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-neutral-100 text-neutral-500"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{m.label}</p>
                <p className="text-xs text-neutral-500">{m.desc}</p>
              </div>
              <div
                className={cn(
                  "h-5 w-5 rounded-full border-2",
                  isSelected ? "border-primary bg-primary" : "border-neutral-300"
                )}
              >
                {isSelected && (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

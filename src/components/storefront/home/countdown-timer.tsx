"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  endsAt: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(endsAt: Date): TimeLeft | null {
  const diff = endsAt.getTime() - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function CountdownTimer({ endsAt }: CountdownTimerProps) {
  const target = new Date(endsAt);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() =>
    calcTimeLeft(target)
  );

  useEffect(() => {
    const t = new Date(endsAt);
    const tick = () => {
      setTimeLeft(calcTimeLeft(t));
    };
    tick();
    const id = setInterval(() => {
      const next = calcTimeLeft(t);
      setTimeLeft(next);
      if (!next) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!timeLeft) {
    return (
      <span className="text-sm font-medium text-red-600">Đã kết thúc</span>
    );
  }

  const units = [
    { label: "Ngày", value: timeLeft.days },
    { label: "Giờ", value: timeLeft.hours },
    { label: "Phút", value: timeLeft.minutes },
    { label: "Giây", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center gap-1.5">
      {units.map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="flex flex-col items-center">
            <span className="flex h-9 w-9 items-center justify-center rounded bg-red-500 text-sm font-bold text-white sm:h-10 sm:w-10 sm:text-base">
              {String(value).padStart(2, "0")}
            </span>
            <span className="mt-0.5 text-[10px] text-neutral-500">
              {label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="mb-3 text-sm font-bold text-red-500">:</span>
          )}
        </div>
      ))}
    </div>
  );
}

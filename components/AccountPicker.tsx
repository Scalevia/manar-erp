"use client";

import { Money } from "@/components/ui";
import { cashAccounts } from "@/lib/mock";

/** اختيار خزنة — وكل خزنة مكتوب تحتها فيها كام */
export function AccountPicker({
  value,
  onChange,
  exclude,
}: {
  value: string;
  onChange: (id: string) => void;
  /** خزنة متتعرضش (مثلاً: «لـ» في التحويل مينفعش تبقى نفس «من») */
  exclude?: string;
}) {
  return (
    <div className="flex gap-2">
      {cashAccounts
        .filter((a) => a.id !== exclude)
        .map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onChange(a.id)}
            aria-pressed={value === a.id}
            className={`press flex-1 rounded-xl border px-2 py-2.5 text-center ${
              value === a.id ? "border-brand bg-brand-soft text-brand" : "border-line bg-card text-ink-mute"
            }`}
          >
            <div className="text-[12px] font-semibold">{a.short}</div>
            <Money value={a.balance} className="mt-0.5 block text-[11px] opacity-80" />
          </button>
        ))}
    </div>
  );
}

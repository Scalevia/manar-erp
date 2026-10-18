"use client";

import { useState } from "react";
import { Check, UserPlus } from "lucide-react";
import { Card, Money } from "@/components/ui";
import { isEgyptMobile } from "@/lib/format";
import { ofKind, TODAY, type Party } from "@/lib/mock";

/**
 * «اشتريت من مين؟» — تاجر قماش من القايمة، أو تاجر جديد (الاسم، والموبايل
 * اختياري). بيرجّع الطرف لما يبقى جاهز، وnull لحد كده.
 */
export function SupplierPicker({ value, onChange }: { value: Party | null; onChange: (x: Party | null) => void }) {
  const suppliers = ofKind("supplier");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  function report(n: string, ph: string) {
    const clean = n.trim().replace(/\s+/g, " ");
    const ok = clean.length >= 2 && (ph === "" || isEgyptMobile(ph));
    onChange(ok ? { id: "new", kind: "supplier", name: clean, phone: ph || undefined, balance: 0, lastActivity: TODAY } : null);
  }

  const pick = "press flex w-full items-center gap-3 px-4 py-3 text-start";

  if (adding)
    return (
      <Card className="mb-4 space-y-3 px-4 py-4">
        <input
          value={name}
          autoFocus
          onChange={(e) => {
            setName(e.target.value);
            report(e.target.value, phone);
          }}
          placeholder="اسم تاجر القماش"
          aria-label="اسم تاجر القماش"
          className="h-12 w-full rounded-xl border border-line bg-page px-3 text-[16px] outline-none placeholder:text-ink-mute/60 focus:border-brand"
        />
        <input
          value={phone}
          onChange={(e) => {
            const ph = e.target.value.replace(/\D/g, "").slice(0, 11);
            setPhone(ph);
            report(name, ph);
          }}
          inputMode="tel"
          placeholder="رقم الموبايل (اختياري)"
          aria-label="رقم الموبايل"
          className="num h-12 w-full rounded-xl border border-line bg-page px-3 text-start text-[16px] outline-none placeholder:text-[14px] placeholder:text-ink-mute/60 focus:border-brand"
        />
        {phone.length === 11 && !isEgyptMobile(phone) && (
          <p className="text-[12px] text-neg">الرقم لازم يبدأ بـ 010 أو 011 أو 012 أو 015.</p>
        )}
        <button
          type="button"
          onClick={() => {
            setAdding(false);
            onChange(null);
          }}
          className="text-[13px] font-semibold text-ink-mute"
        >
          ← رجوع للقايمة
        </button>
      </Card>
    );

  return (
    <Card className="mb-4 overflow-hidden">
      {suppliers.map((x, i) => (
        <div key={x.id}>
          {i > 0 && <div className="ms-4 border-t border-line-soft" />}
          <button
            type="button"
            onClick={() => onChange(x)}
            aria-pressed={value?.id === x.id}
            className={`${pick} ${value?.id === x.id ? "bg-brand-soft" : "active:bg-sunken"}`}
          >
            <span className="flex-1 truncate text-[15px] font-semibold">{x.name}</span>
            {x.balance < 0 && (
              <span className="text-[12px] text-ink-mute">
                ليه <Money value={-x.balance} />
              </span>
            )}
            {value?.id === x.id && <Check size={17} className="text-brand" />}
          </button>
        </div>
      ))}
      <div className="border-t border-line-soft">
        <button
          type="button"
          onClick={() => {
            setAdding(true);
            onChange(null);
          }}
          className="press flex w-full items-center gap-2 px-4 py-3 text-[14px] font-semibold text-brand active:bg-sunken"
        >
          <UserPlus size={17} />
          تاجر قماش جديد
        </button>
      </div>
    </Card>
  );
}

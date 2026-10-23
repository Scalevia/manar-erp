"use client";

import { useState } from "react";
import { Check, UserPlus } from "lucide-react";
import { Card, Money } from "@/components/ui";
import { isEgyptMobile } from "@/lib/format";
import { ofKind, TODAY, type Party } from "@/lib/mock";

type Kind = "supplier" | "factory" | "trader";

const LABELS: Record<Kind, { add: string; name: string; one: string }> = {
  supplier: { add: "تاجر قماش جديد", name: "اسم تاجر القماش", one: "تاجر قماش" },
  factory: { add: "مصنع جديد", name: "اسم المصنع", one: "مصنع" },
  trader: { add: "تاجر جديد", name: "اسم التاجر", one: "تاجر" },
};

/**
 * اختيار تاجر (قماش أو بضاعة) أو مصنع من القايمة، أو إضافة واحد جديد من نفس الشاشة
 * (الاسم، والموبايل اختياري) — مفيش شاشة إدارة لوحدها، زي «عميل جديد» في البيع.
 * بيرجّع الطرف لما يبقى جاهز، وnull لحد كده.
 */
export function PartyPicker({
  kind,
  value,
  onChange,
}: {
  kind: Kind;
  value: Party | null;
  onChange: (x: Party | null) => void;
}) {
  const list = ofKind(kind);
  const label = LABELS[kind];
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const clean = name.trim().replace(/\s+/g, " ");
  // الاسم موجود قبل كده: تنبيه مش منع — يمكن يكون فعلاً حد تاني بنفس الاسم
  const existing = clean ? list.find((x) => x.name === clean) : undefined;

  function report(n: string, ph: string) {
    const c = n.trim().replace(/\s+/g, " ");
    const ok = c.length >= 2 && (ph === "" || isEgyptMobile(ph));
    onChange(ok ? { id: "new", kind, name: c, phone: ph || undefined, balance: 0, lastActivity: TODAY } : null);
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
          placeholder={label.name}
          aria-label={label.name}
          className="h-12 w-full rounded-xl border border-line bg-page px-3 text-[16px] outline-none placeholder:text-ink-mute/60 focus:border-brand"
        />
        {existing && (
          <div className="flex items-center justify-between gap-2 rounded-xl bg-warn-soft px-3 py-2 text-[12px] text-warn">
            <span>
              فيه {label.one} اسمه «{existing.name}» في القايمة
            </span>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                onChange(existing);
              }}
              className="press shrink-0 rounded-lg bg-card px-2.5 py-1 font-semibold text-brand"
            >
              اختاره
            </button>
          </div>
        )}
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
      {list.map((x, i) => (
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
            report(name, phone);
          }}
          className="press flex w-full items-center gap-2 px-4 py-3 text-[14px] font-semibold text-brand active:bg-sunken"
        >
          <UserPlus size={17} />
          {label.add}
        </button>
      </div>
    </Card>
  );
}

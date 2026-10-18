"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Card, Page, PageHeader } from "@/components/ui";
import { nextJobNo, ofKind } from "@/lib/mock";

/**
 * أمر جديد: المصنع + اسم اختياري. مفيش عدد متوقع ولا مصنعية بالقطعة —
 * الأمر بيبدأ فاضي، والفلوس بتدخله من «صرفت» (الـ spec، قسم 5).
 */
export default function NewJobPage() {
  const factories = ofKind("factory");
  const no = nextJobNo();

  // "none" = لسه مش عارف هيوديه لأنهي مصنع (نادر — بيختاره قبل أول مصنعية أو استلام)
  const [factoryId, setFactoryId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  const factory = factories.find((f) => f.id === factoryId);
  const ready = factoryId !== null;

  if (saved) {
    return (
      <>
        <PageHeader title="اتحفظ" />
        <Page>
          <Card className="px-5 py-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-pos-soft text-pos">
              <Check size={28} strokeWidth={3} />
            </div>
            <div className="mt-4 text-[20px] font-bold">
              أمر <span className="num">{no}</span> اتفتح
            </div>
            <div className="mt-1 text-[14px] text-ink-mute">
              {factory?.name ?? "لسه من غير مصنع"}
              {name.trim() && <> · {name.trim()}</>}
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
              أي فلوس هتصرفها على الشغلانة دي — قماش، مصنعية، سوست — سجّلها من «صرفت» جوه الأمر.
            </p>
          </Card>
          <Link
            href="/jobs"
            className="press mt-4 block rounded-2xl bg-brand py-3.5 text-center text-[15px] font-bold text-brand-ink"
          >
            أوامر التصنيع
          </Link>
        </Page>
      </>
    );
  }

  const pick = "press flex w-full items-center gap-3 px-4 py-3.5 text-start";

  return (
    <>
      <PageHeader title={`أمر جديد · ${no}`} back="/jobs" />
      <Page>
        <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">عند أنهي مصنع؟</div>
        <Card className="mb-4 overflow-hidden">
          {factories.map((f, i) => (
            <div key={f.id}>
              {i > 0 && <div className="ms-4 border-t border-line-soft" />}
              <button
                type="button"
                onClick={() => setFactoryId(f.id)}
                aria-pressed={factoryId === f.id}
                className={`${pick} ${factoryId === f.id ? "bg-brand-soft" : "active:bg-sunken"}`}
              >
                <span className="flex-1 truncate text-[15px] font-semibold">{f.name}</span>
                {factoryId === f.id && <Check size={17} className="text-brand" />}
              </button>
            </div>
          ))}
          <div className="border-t border-line-soft">
            <button
              type="button"
              onClick={() => setFactoryId("none")}
              aria-pressed={factoryId === "none"}
              className={`${pick} ${factoryId === "none" ? "bg-brand-soft" : "active:bg-sunken"}`}
            >
              <span className="flex-1 text-[14px] text-ink-soft">لسه مش عارف — هختاره بعدين</span>
              {factoryId === "none" && <Check size={17} className="text-brand" />}
            </button>
          </div>
        </Card>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسم للأمر (اختياري) — مثلاً: 214 صيف"
          aria-label="اسم الأمر"
          className="mb-5 h-12 w-full rounded-2xl border border-line bg-card px-4 text-[16px] outline-none placeholder:text-[14px] placeholder:text-ink-mute focus:border-brand"
        />

        <button
          type="button"
          disabled={!ready}
          onClick={() => setSaved(true)}
          className="press w-full rounded-2xl bg-brand py-4 text-[16px] font-bold text-brand-ink disabled:opacity-35"
        >
          فتح الأمر
        </button>
      </Page>
    </>
  );
}

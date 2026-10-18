"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { PartyPicker } from "@/components/PartyPicker";
import { Card, Page, PageHeader } from "@/components/ui";
import { nextJobNo, type Party } from "@/lib/mock";

/**
 * أمر جديد: المصنع + اسم اختياري (الـ spec، قسم 5). المصنع إجباري — والمصنع
 * الجديد بيتضاف من هنا. مفيش عدد متوقع ولا مصنعية بالقطعة: الأمر بيبدأ فاضي،
 * والفلوس بتدخله من «صرفت».
 */
export default function NewJobPage() {
  const no = nextJobNo();
  const [factory, setFactory] = useState<Party | null>(null);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  if (saved && factory) {
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
              {factory.name}
              {name.trim() && <> · {name.trim()}</>}
            </div>
            {factory.id === "new" && (
              <div className="mt-3 text-[13px] font-semibold text-pos">اتضاف {factory.name} للمصانع</div>
            )}
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

  return (
    <>
      <PageHeader title={`أمر جديد · ${no}`} back="/jobs" />
      <Page>
        <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">عند أنهي مصنع؟</div>
        <PartyPicker kind="factory" value={factory} onChange={setFactory} />

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسم للأمر (اختياري) — مثلاً: 214 صيف"
          aria-label="اسم الأمر"
          className="mb-5 h-12 w-full rounded-2xl border border-line bg-card px-4 text-[16px] outline-none placeholder:text-[14px] placeholder:text-ink-mute focus:border-brand"
        />

        <button
          type="button"
          disabled={!factory}
          onClick={() => setSaved(true)}
          className="press w-full rounded-2xl bg-brand py-4 text-[16px] font-bold text-brand-ink disabled:opacity-35"
        >
          فتح الأمر
        </button>
      </Page>
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Info } from "lucide-react";
import { Card, Money, Page, PageHeader } from "@/components/ui";
import { p } from "@/lib/format";
import { actions, cashAccounts } from "@/lib/mock";

/**
 * فلوس الخزن يوم البداية — أول قايمة في التهيئة (الـ spec، قسم 11).
 * مش زيادة رأس مال ومش بيع: ده اللي كان موجود قبل البرنامج، فمبيظهرش في
 * «ليه زاد؟». لو اتدخلت قبل كده وفيها غلط، بتتصلّح هنا والفرق بس هو اللي بيتسجل.
 */
export default function OpeningCashPage() {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(cashAccounts.map((a) => [a.id, a.opening ? String(a.opening / 100) : ""])),
  );
  const [saved, setSaved] = useState(false);

  const amountOf = (id: string) => p(Number(values[id]) || 0);
  const changes = cashAccounts.filter((a) => amountOf(a.id) !== a.opening);

  if (saved) {
    return (
      <>
        <PageHeader title="اتحفظ" />
        <Page>
          <Card className="px-5 py-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-pos-soft text-pos">
              <Check size={28} strokeWidth={3} />
            </div>
            <div className="mt-4 text-[15px] text-ink-soft">فلوس الخزن يوم البداية</div>
            <div className="mt-4 space-y-2 border-t border-line-soft pt-4 text-[14px]">
              {cashAccounts.map((a) => (
                <div key={a.id} className="flex justify-between">
                  <span className="text-ink-soft">{a.name}</span>
                  <Money value={a.opening} className="font-semibold" />
                </div>
              ))}
            </div>
          </Card>
          <Link
            href="/setup"
            className="press mt-4 block rounded-2xl bg-brand py-3.5 text-center text-[15px] font-bold text-brand-ink"
          >
            رجوع للتهيئة
          </Link>
        </Page>
      </>
    );
  }

  return (
    <>
      <PageHeader title="فلوس الخزن" sub="يوم ما بدأت على البرنامج" back="/setup" />
      <Page>
        <div className="mb-4 flex items-start gap-2 rounded-2xl bg-brand-soft px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
          <Info size={15} className="mt-0.5 shrink-0 text-brand" />
          اكتب اللي كان في كل خزنة يوم ما بدأت. ده مش ربح ومش زيادة رأس مال — ده اللي كان
          موجود قبل البرنامج.
        </div>

        <Card className="mb-4 overflow-hidden">
          {cashAccounts.map((a, i) => (
            <label
              key={a.id}
              className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-line-soft" : ""}`}
            >
              <span className="flex-1 text-[15px] font-semibold">{a.name}</span>
              <input
                value={values[a.id]}
                autoFocus={i === 0}
                onChange={(e) => setValues((v) => ({ ...v, [a.id]: e.target.value.replace(/[^\d.]/g, "") }))}
                inputMode="decimal"
                enterKeyHint="next"
                placeholder="0"
                aria-label={a.name}
                className="num h-11 w-32 rounded-xl border border-line bg-page px-3 text-end text-[17px] font-bold outline-none placeholder:font-normal placeholder:text-ink-mute/50 focus:border-brand"
              />
              <span className="text-[13px] text-ink-mute">ج</span>
            </label>
          ))}
        </Card>

        {/* ---------------------------- اللي هيحصل ---------------------------- */}
        {changes.length > 0 && (
          <Card className="mb-4 overflow-hidden">
            <div className="bg-sunken px-4 py-2 text-[12px] font-semibold text-ink-mute">اللي هيحصل</div>
            {changes.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between border-t border-line-soft px-4 py-3 text-[14px]"
              >
                <span className="text-ink-soft">{a.name} دلوقتي</span>
                <span>
                  <Money value={a.balance} className="text-ink-mute" />
                  {"  ←  "}
                  <Money value={a.balance + amountOf(a.id) - a.opening} className="font-bold" />
                </span>
              </div>
            ))}
          </Card>
        )}

        <button
          type="button"
          disabled={changes.length === 0}
          onClick={() => {
            actions.openingCash(Object.fromEntries(cashAccounts.map((a) => [a.id, amountOf(a.id)])));
            setSaved(true);
          }}
          className="press w-full rounded-2xl bg-brand py-4 text-[16px] font-bold text-brand-ink disabled:opacity-35"
        >
          حفظ
        </button>
      </Page>
    </>
  );
}

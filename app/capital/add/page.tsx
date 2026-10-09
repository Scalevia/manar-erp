"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Info } from "lucide-react";
import { Card, Money, Page, PageHeader } from "@/components/ui";
import { p } from "@/lib/format";
import { cashAccounts, totals } from "@/lib/mock";

/**
 * زيادة رأس المال: فلوس من بره المحل (من البيت، من بيع حاجة).
 * مش ربح — ومش سلفة: السلفة فلوس عليه لحد، ولو اتسجلت هنا رأس المال يبان أكبر من حقيقته.
 */
export default function AddCapitalPage() {
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState(cashAccounts[0].id);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  const amountP = p(Number(amount) || 0);
  const account = cashAccounts.find((a) => a.id === accountId)!;

  if (saved) {
    return (
      <>
        <PageHeader title="اتحفظ" />
        <Page>
          <Card className="px-5 py-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-pos-soft text-pos">
              <Check size={28} strokeWidth={3} />
            </div>
            <div className="mt-4 text-[15px] text-ink-soft">زيادة رأس المال</div>
            <div className="mt-1 flex items-baseline justify-center gap-1.5">
              <Money value={amountP} className="text-[30px] font-bold text-pos" />
              <span className="text-[14px] text-ink-mute">ج</span>
            </div>
            <div className="mt-2 text-[13px] text-ink-mute">دخلت {account.name}</div>
            <div className="mt-5 border-t border-line-soft pt-4 text-[14px]">
              رأس مالك بقى <Money value={totals.capital + amountP} className="font-bold" /> ج
            </div>
          </Card>

          <Link
            href="/capital"
            className="press mt-4 block rounded-2xl bg-brand py-3.5 text-center text-[15px] font-bold text-brand-ink"
          >
            رأس مالي
          </Link>
        </Page>
      </>
    );
  }

  return (
    <>
      <PageHeader title="زيادة رأس المال" back="/capital" />
      <Page>
        <div className="mb-4 rounded-2xl bg-brand-soft px-4 py-3.5 text-[13px] leading-relaxed">
          <p className="font-semibold text-brand">
            هنا بنزوّد لو هتجيب فلوس من بره المحل وتزوّد بيها رأس مالك.
          </p>
          <p className="mt-1.5 flex items-start gap-1.5 text-ink-soft">
            <Info size={14} className="mt-0.5 shrink-0" />
            <span>
              لو دي سلفة هترجّعها، متسجلهاش هنا.{" "}
              <Link href="/loans/new?dir=in" className="font-semibold text-brand underline">
                سجّلها سلفة
              </Link>
            </span>
          </p>
        </div>

        {/* -------------------------------- المبلغ -------------------------------- */}
        <Card className="mb-4 px-4 py-4">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">المبلغ</span>
            <input
              value={amount}
              autoFocus
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
              inputMode="decimal"
              enterKeyHint="done"
              placeholder="0"
              className="num h-16 w-full rounded-xl border border-line bg-page px-3 text-center text-[28px] font-bold outline-none placeholder:font-normal placeholder:text-ink-mute/40 focus:border-brand"
            />
          </label>
        </Card>

        {/* -------------------------------- فين -------------------------------- */}
        <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">حطيتها فين؟</div>
        <div className="mb-3 flex gap-2">
          {cashAccounts.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAccountId(a.id)}
              className={`press flex-1 rounded-xl border px-2 py-2.5 text-center ${
                accountId === a.id ? "border-brand bg-brand-soft text-brand" : "border-line bg-card text-ink-mute"
              }`}
            >
              <div className="text-[12px] font-semibold">{a.short}</div>
              <Money value={a.balance} className="mt-0.5 block text-[11px] opacity-80" />
            </button>
          ))}
        </div>

        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="جت منين؟ (اختياري) — مثلاً: من بيع العربية"
          aria-label="ملاحظة"
          className="mb-4 h-12 w-full rounded-2xl border border-line bg-card px-4 text-[16px] outline-none placeholder:text-[14px] placeholder:text-ink-mute focus:border-brand"
        />

        {/* ------------------------------ اللي هيحصل ------------------------------ */}
        {amountP > 0 && (
          <Card className="mb-4 overflow-hidden">
            <div className="bg-sunken px-4 py-2 text-[12px] font-semibold text-ink-mute">اللي هيحصل</div>
            <div className="flex items-center justify-between border-t border-line-soft px-4 py-3 text-[14px]">
              <span className="text-ink-soft">{account.name}</span>
              <span>
                <Money value={account.balance} className="text-ink-mute" />
                {"  ←  "}
                <Money value={account.balance + amountP} className="font-bold text-pos" />
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-line-soft px-4 py-3 text-[14px]">
              <span className="text-ink-soft">رأس مالك</span>
              <span>
                <Money value={totals.capital} className="text-ink-mute" />
                {"  ←  "}
                <Money value={totals.capital + amountP} className="font-bold text-pos" />
              </span>
            </div>
            <div className="border-t border-line-soft px-4 py-2.5 text-[11px] text-ink-mute">
              مش هتتحسب ربح — هتظهر لوحدها في «ليه زاد؟».
            </div>
          </Card>
        )}

        <button
          type="button"
          disabled={amountP <= 0}
          onClick={() => setSaved(true)}
          className="press w-full rounded-2xl bg-brand py-4 text-[16px] font-bold text-brand-ink disabled:opacity-35"
        >
          حفظ
        </button>
      </Page>
    </>
  );
}

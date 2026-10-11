"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDown, Check } from "lucide-react";
import { AccountPicker } from "@/components/AccountPicker";
import { Card, Money, Page, PageHeader } from "@/components/ui";
import { p } from "@/lib/format";
import { cashAccounts } from "@/lib/mock";

/**
 * تحويل بين الخزن (الـ spec، قسم 7) — المكان الوحيد اللي فيه مصاريف تحويل.
 * اتسحب 10,000 من فودافون ودخل الدرج 9,850 → الـ 150 مصروف بيتقيّد لوحده،
 * عشان رقم البرنامج يفضل زي رقم التليفون.
 */
export default function TransferPage() {
  const [from, setFrom] = useState("vcash");
  const [to, setTo] = useState("drawer");
  const [out, setOut] = useState("");
  const [hasFee, setHasFee] = useState(false);
  const [inn, setInn] = useState("");
  const [saved, setSaved] = useState(false);

  const fromA = cashAccounts.find((a) => a.id === from)!;
  const toA = cashAccounts.find((a) => a.id === to)!;
  const outP = p(Number(out) || 0);
  // الخانة التانية بتظهر بس لو فيه مصاريف — من غيرها، اللي دخل = اللي اتسحب
  const inP = hasFee ? p(Number(inn) || 0) : outP;
  const fee = outP - inP;
  const badIn = hasFee && inP > outP;
  const short = outP > fromA.balance;
  const ready = outP > 0 && inP > 0 && !badIn && from !== to;

  function pickFrom(id: string) {
    setFrom(id);
    if (id === to) setTo(cashAccounts.find((a) => a.id !== id)!.id);
  }

  if (saved) {
    return (
      <>
        <PageHeader title="اتحفظ" />
        <Page>
          <Card className="px-5 py-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-pos-soft text-pos">
              <Check size={28} strokeWidth={3} />
            </div>
            <div className="mt-4 text-[15px] text-ink-soft">
              من {fromA.name} لـ {toA.name}
            </div>
            <div className="mt-1 flex items-baseline justify-center gap-1.5">
              <Money value={inP} className="text-[30px] font-bold" />
              <span className="text-[14px] text-ink-mute">ج</span>
            </div>
            {fee > 0 && (
              <div className="mt-2 text-[13px] text-ink-mute">
                مصاريف تحويل <Money value={fee} /> ج — اتسجلت مصروف
              </div>
            )}
          </Card>
          <Link
            href="/"
            className="press mt-4 block rounded-2xl bg-brand py-3.5 text-center text-[15px] font-bold text-brand-ink"
          >
            الرئيسية
          </Link>
        </Page>
      </>
    );
  }

  return (
    <>
      <PageHeader title="تحويل بين الخزن" back="/" />
      <Page>
        <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">من</div>
        <div className="mb-3">
          <AccountPicker value={from} onChange={pickFrom} />
        </div>

        <div className="mb-3 flex justify-center text-ink-mute">
          <ArrowDown size={20} />
        </div>

        <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">لـ</div>
        <div className="mb-5">
          <AccountPicker value={to} onChange={setTo} exclude={from} />
        </div>

        {/* -------------------------------- المبلغ -------------------------------- */}
        <Card className="mb-4 px-4 py-4">
          <span className="mb-1.5 block text-[13px] font-semibold">اتسحب كام من {fromA.name}؟</span>
          <input
            value={out}
            autoFocus
            onChange={(e) => setOut(e.target.value.replace(/[^\d.]/g, ""))}
            inputMode="decimal"
            placeholder="0"
            aria-label="المبلغ اللي اتسحب"
            className="num h-16 w-full rounded-xl border border-line bg-page px-3 text-center text-[28px] font-bold outline-none placeholder:font-normal placeholder:text-ink-mute/40 focus:border-brand"
          />
          {short && (
            <p className="mt-2 text-[12px] text-warn">
              {fromA.name} فيه <Money value={fromA.balance} /> ج بس.
            </p>
          )}

          <label className="mt-4 flex items-center gap-2.5 text-[13px] text-ink-soft">
            <input
              type="checkbox"
              checked={hasFee}
              onChange={(e) => {
                setHasFee(e.target.checked);
                if (e.target.checked && !inn) setInn(out);
              }}
              className="size-5 accent-[var(--brand)]"
            />
            وصل أقل؟ (فيه مصاريف سحب)
          </label>

          {hasFee && (
            <div className="mt-3">
              <span className="mb-1.5 block text-[13px] font-semibold">دخل كام {toA.name}؟</span>
              <input
                value={inn}
                onChange={(e) => setInn(e.target.value.replace(/[^\d.]/g, ""))}
                inputMode="decimal"
                placeholder="0"
                aria-label="المبلغ اللي دخل"
                className="num h-12 w-full rounded-xl border border-line bg-page px-3 text-center text-[20px] font-bold outline-none focus:border-brand"
              />
              {badIn && <p className="mt-2 text-[12px] text-neg">اللي دخل مينفعش يبقى أكتر من اللي اتسحب.</p>}
            </div>
          )}
        </Card>

        {/* ------------------------------ اللي هيحصل ------------------------------ */}
        {ready && (
          <Card className="mb-4 overflow-hidden">
            <div className="bg-sunken px-4 py-2 text-[12px] font-semibold text-ink-mute">اللي هيحصل</div>
            <div className="flex items-center justify-between border-t border-line-soft px-4 py-3 text-[14px]">
              <span className="text-ink-soft">{fromA.name}</span>
              <span>
                <Money value={fromA.balance} className="text-ink-mute" />
                {"  ←  "}
                <Money value={fromA.balance - outP} className="font-bold text-neg" />
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-line-soft px-4 py-3 text-[14px]">
              <span className="text-ink-soft">{toA.name}</span>
              <span>
                <Money value={toA.balance} className="text-ink-mute" />
                {"  ←  "}
                <Money value={toA.balance + inP} className="font-bold text-pos" />
              </span>
            </div>
            {fee > 0 && (
              <div className="flex items-center justify-between border-t border-line-soft px-4 py-3 text-[14px]">
                <span className="text-ink-soft">مصاريف تحويل</span>
                <span className="font-bold">
                  <Money value={fee} /> <span className="text-[12px] font-normal text-ink-mute">مصروف</span>
                </span>
              </div>
            )}
          </Card>
        )}

        <button
          type="button"
          disabled={!ready}
          onClick={() => setSaved(true)}
          className="press w-full rounded-2xl bg-brand py-4 text-[16px] font-bold text-brand-ink disabled:opacity-35"
        >
          حفظ التحويل
        </button>
      </Page>
    </>
  );
}

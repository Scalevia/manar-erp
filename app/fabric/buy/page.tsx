"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { AccountPicker } from "@/components/AccountPicker";
import { SupplierPicker } from "@/components/SupplierPicker";
import { Card, Money, Page, PageHeader } from "@/components/ui";
import { p } from "@/lib/format";
import { cashAccounts, fabricOnHand, type Party } from "@/lib/mock";

/**
 * شراء قماش للمحل — هيشيله عنده ويبعته بعدين (الـ spec، قسم 5):
 *   القماش اللي عندي: يزيد بالشراية كلها
 *   تاجر القماش:      ليه اللي مندفعش
 *   الخزنة:           تقل باللي اتدفع بس
 * ورأس المال مبيتغيرش: فلوس اتحولت لقماش.
 */
export default function BuyFabricPage() {
  const onHand = fabricOnHand();
  const [supplier, setSupplier] = useState<Party | null>(null);
  const [amount, setAmount] = useState("");
  const [paid, setPaid] = useState("");
  const [accountId, setAccountId] = useState(cashAccounts[0].id);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  const amountP = p(Number(amount) || 0);
  const paidP = Math.min(p(Number(paid) || 0), amountP);
  const rest = amountP - paidP;
  const account = cashAccounts.find((a) => a.id === accountId)!;
  const short = paidP > account.balance;
  const owedAfter = -(supplier?.balance ?? 0) + rest;
  const ready = !!supplier && amountP > 0;

  if (saved && supplier) {
    return (
      <>
        <PageHeader title="اتحفظ" />
        <Page>
          <Card className="px-5 py-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-pos-soft text-pos">
              <Check size={28} strokeWidth={3} />
            </div>
            <div className="mt-4 text-[15px] text-ink-soft">قماش من {supplier.name} للمحل</div>
            <div className="mt-1 flex items-baseline justify-center gap-1.5">
              <Money value={amountP} className="text-[30px] font-bold" />
              <span className="text-[14px] text-ink-mute">ج</span>
            </div>
            <div className="mt-5 space-y-2 border-t border-line-soft pt-4 text-[14px]">
              <Row label="قماش عندك في المحل" value={<Money value={onHand + amountP} className="font-semibold" />} />
              {paidP > 0 && <Row label={`دفعت من ${account.name}`} value={<Money value={paidP} className="font-semibold" />} />}
              {rest > 0 && <Row label={`عليك لـ ${supplier.name}`} value={<Money value={owedAfter} className="font-bold text-neg" />} />}
            </div>
          </Card>
          <Link
            href="/fabric"
            className="press mt-4 block rounded-2xl bg-brand py-3.5 text-center text-[15px] font-bold text-brand-ink"
          >
            القماش اللي عندي
          </Link>
        </Page>
      </>
    );
  }

  return (
    <>
      <PageHeader title="شراء قماش للمحل" sub="هتشيله عندك وتبعته بعدين" back="/fabric" />
      <Page>
        <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">اشتريت من مين؟</div>
        <SupplierPicker value={supplier} onChange={setSupplier} />

        <Card className="mb-4 px-4 py-4">
          <span className="mb-1.5 block text-[13px] font-semibold">اشتريت بكام؟</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            inputMode="decimal"
            placeholder="0"
            aria-label="إجمالي الشراية"
            className="num h-16 w-full rounded-xl border border-line bg-page px-3 text-center text-[28px] font-bold outline-none placeholder:font-normal placeholder:text-ink-mute/40 focus:border-brand"
          />

          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-[13px] font-semibold">دفعت كام دلوقتي؟</span>
            {amountP > 0 && (
              <button
                type="button"
                onClick={() => setPaid(String(amountP / 100))}
                className="press rounded-lg bg-brand-soft px-2.5 py-1 text-[12px] font-semibold text-brand"
              >
                دفعت كله
              </button>
            )}
          </div>
          <input
            value={paid}
            onChange={(e) => setPaid(e.target.value.replace(/[^\d.]/g, ""))}
            inputMode="decimal"
            placeholder="0 — على الحساب"
            aria-label="المدفوع"
            className="num mt-1.5 h-12 w-full rounded-xl border border-line bg-page px-3 text-center text-[18px] font-bold outline-none placeholder:text-[14px] placeholder:font-normal placeholder:text-ink-mute/50 focus:border-brand"
          />
          {paidP > 0 && (
            <div className="mt-3">
              <AccountPicker value={accountId} onChange={setAccountId} />
            </div>
          )}
          {short && (
            <p className="mt-2 text-[12px] text-warn">
              {account.name} فيه <Money value={account.balance} /> ج بس.
            </p>
          )}
        </Card>

        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="ملاحظة (اختياري) — مثلاً: قطن مصري"
          aria-label="ملاحظة"
          className="mb-4 h-12 w-full rounded-2xl border border-line bg-card px-4 text-[16px] outline-none placeholder:text-[14px] placeholder:text-ink-mute focus:border-brand"
        />

        {ready && (
          <Card className="mb-4 overflow-hidden">
            <div className="bg-sunken px-4 py-2 text-[12px] font-semibold text-ink-mute">اللي هيحصل</div>
            <Effect label="قماش عندي في المحل">
              <Money value={onHand} className="font-normal text-ink-mute" />
              {"  ←  "}
              <Money value={onHand + amountP} className="text-pos" />
            </Effect>
            {rest > 0 && (
              <Effect label={supplier!.name} sub="اللي مندفعش">
                <span className="text-neg">
                  هيبقى ليه <Money value={owedAfter} />
                </span>
              </Effect>
            )}
            {paidP > 0 && (
              <Effect label={account.name}>
                <Money value={account.balance} className="font-normal text-ink-mute" />
                {"  ←  "}
                <Money value={account.balance - paidP} className="text-neg" />
              </Effect>
            )}
          </Card>
        )}

        <button
          type="button"
          disabled={!ready}
          onClick={() => setSaved(true)}
          className="press w-full rounded-2xl bg-brand py-4 text-[16px] font-bold text-brand-ink disabled:opacity-35"
        >
          حفظ الشراية
        </button>
      </Page>
    </>
  );
}

function Effect({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-line-soft px-4 py-3">
      <div className="min-w-0">
        <div className="truncate text-[14px] text-ink-soft">{label}</div>
        {sub && <div className="mt-0.5 text-[11px] text-ink-mute">{sub}</div>}
      </div>
      <span className="shrink-0 text-[14px] font-bold">{children}</span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-soft">{label}</span>
      {value}
    </div>
  );
}

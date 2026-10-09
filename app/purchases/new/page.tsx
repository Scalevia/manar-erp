"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, UserPlus } from "lucide-react";
import { Card, Money, Page, PageHeader } from "@/components/ui";
import { isEgyptMobile, p } from "@/lib/format";
import { cashAccounts, ofKind, totals, TODAY, type Party } from "@/lib/mock";

/**
 * شراء قماش — بالفلوس بس: «اشتريت بكام، دفعت كام». مفيش أمتار ولا أنواع.
 * القماش في المحل بيزيد بالإجمالي، والباقي بيتكتب لتاجر القماش.
 */
export default function NewPurchasePage() {
  const suppliers = ofKind("supplier");

  const [supplier, setSupplier] = useState<Party | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [paid, setPaid] = useState("");
  const [accountId, setAccountId] = useState(cashAccounts[0].id);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  const cleanName = name.trim().replace(/\s+/g, " ");
  const phoneOk = phone === "" || isEgyptMobile(phone);
  const target: Party | null = adding
    ? cleanName.length >= 2 && phoneOk
      ? { id: "new", kind: "supplier", name: cleanName, phone: phone || undefined, balance: 0, lastActivity: TODAY }
      : null
    : supplier;

  const amountP = p(Number(amount) || 0);
  const paidP = Math.min(p(Number(paid) || 0), amountP);
  const rest = amountP - paidP;
  const account = cashAccounts.find((a) => a.id === accountId)!;
  // رصيد تاجر القماش سالب = ليه عندك
  const owedAfter = -(target?.balance ?? 0) + rest;
  const short = paidP > account.balance;
  const ready = !!target && amountP > 0;

  if (saved && target) {
    return (
      <>
        <PageHeader title="اتحفظ" />
        <Page>
          <Card className="px-5 py-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-pos-soft text-pos">
              <Check size={28} strokeWidth={3} />
            </div>
            <div className="mt-4 text-[15px] text-ink-soft">اشتريت قماش من {target.name}</div>
            <div className="mt-1 flex items-baseline justify-center gap-1.5">
              <Money value={amountP} className="text-[30px] font-bold" />
              <span className="text-[14px] text-ink-mute">ج</span>
            </div>
            <div className="mt-5 space-y-2 border-t border-line-soft pt-4 text-[14px]">
              <div className="flex justify-between">
                <span className="text-ink-soft">دفعت</span>
                <Money value={paidP} className="font-semibold" />
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">ليه عندك دلوقتي</span>
                <Money value={owedAfter} className="font-bold text-neg" />
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">القماش في المحل</span>
                <Money value={totals.fabricValue + amountP} className="font-bold" />
              </div>
            </div>
          </Card>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              href="/fabric"
              className="press rounded-2xl bg-brand py-3.5 text-center text-[15px] font-bold text-brand-ink"
            >
              القماش في المحل
            </Link>
            <Link
              href="/purchases"
              className="press rounded-2xl border border-line bg-card py-3.5 text-center text-[15px] font-semibold text-ink-soft"
            >
              المشتريات
            </Link>
          </div>
        </Page>
      </>
    );
  }

  return (
    <>
      <PageHeader title="شراء قماش" back="/purchases" />
      <Page>
        {/* -------------------------------- من مين -------------------------------- */}
        <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">من مين؟</div>
        {!adding ? (
          <Card className="mb-4 overflow-hidden">
            {suppliers.map((x, i) => (
              <div key={x.id}>
                {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                <button
                  type="button"
                  onClick={() => setSupplier(x)}
                  aria-pressed={supplier?.id === x.id}
                  className={`press flex w-full items-center gap-3 px-4 py-3 text-start ${
                    supplier?.id === x.id ? "bg-brand-soft" : "active:bg-sunken"
                  }`}
                >
                  <span className="flex-1 truncate text-[15px] font-semibold">{x.name}</span>
                  {x.balance < 0 && (
                    <span className="text-[12px] text-ink-mute">
                      ليه <Money value={-x.balance} />
                    </span>
                  )}
                  {supplier?.id === x.id && <Check size={17} className="text-brand" />}
                </button>
              </div>
            ))}
            <div className="border-t border-line-soft">
              <button
                type="button"
                onClick={() => {
                  setAdding(true);
                  setSupplier(null);
                }}
                className="press flex w-full items-center gap-2 px-4 py-3 text-[14px] font-semibold text-brand active:bg-sunken"
              >
                <UserPlus size={17} />
                تاجر قماش جديد
              </button>
            </div>
          </Card>
        ) : (
          <Card className="mb-4 space-y-3 px-4 py-4">
            <input
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              placeholder="اسم تاجر القماش"
              aria-label="اسم تاجر القماش"
              className="h-12 w-full rounded-xl border border-line bg-page px-3 text-[16px] outline-none placeholder:text-ink-mute/60 focus:border-brand"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
              inputMode="tel"
              placeholder="رقم الموبايل (اختياري)"
              aria-label="رقم الموبايل"
              className="num h-12 w-full rounded-xl border border-line bg-page px-3 text-start text-[16px] outline-none placeholder:text-[14px] placeholder:text-ink-mute/60 focus:border-brand"
            />
            {phone.length === 11 && !isEgyptMobile(phone) && (
              <p className="text-[12px] text-neg">الرقم لازم يبدأ بـ 010 أو 011 أو 012 أو 015.</p>
            )}
            <button type="button" onClick={() => setAdding(false)} className="text-[13px] font-semibold text-ink-mute">
              ← رجوع للقايمة
            </button>
          </Card>
        )}

        {/* ------------------------------ اشتريت بكام ------------------------------ */}
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
            <div className="mt-3 flex gap-2">
              {cashAccounts.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAccountId(a.id)}
                  className={`press flex-1 rounded-xl border px-2 py-2 text-center ${
                    accountId === a.id ? "border-brand bg-brand-soft text-brand" : "border-line bg-card text-ink-mute"
                  }`}
                >
                  <div className="text-[12px] font-semibold">{a.short}</div>
                  <Money value={a.balance} className="mt-0.5 block text-[11px] opacity-80" />
                </button>
              ))}
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
          placeholder="ملاحظة (اختياري) — مثلاً: قطن وكتان"
          aria-label="ملاحظة"
          className="mb-4 h-12 w-full rounded-2xl border border-line bg-card px-4 text-[16px] outline-none placeholder:text-[14px] placeholder:text-ink-mute focus:border-brand"
        />

        {/* ----------------------------- اللي هيحصل ----------------------------- */}
        {ready && (
          <Card className="mb-4 overflow-hidden">
            <div className="bg-sunken px-4 py-2 text-[12px] font-semibold text-ink-mute">اللي هيحصل</div>
            <div className="flex items-center justify-between border-t border-line-soft px-4 py-3 text-[14px]">
              <span className="text-ink-soft">القماش في المحل</span>
              <span>
                <Money value={totals.fabricValue} className="text-ink-mute" />
                {"  ←  "}
                <Money value={totals.fabricValue + amountP} className="font-bold" />
              </span>
            </div>
            {paidP > 0 && (
              <div className="flex items-center justify-between border-t border-line-soft px-4 py-3 text-[14px]">
                <span className="text-ink-soft">{account.name}</span>
                <span>
                  <Money value={account.balance} className="text-ink-mute" />
                  {"  ←  "}
                  <Money value={account.balance - paidP} className="font-bold text-neg" />
                </span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-line-soft px-4 py-3 text-[14px]">
              <span className="text-ink-soft">{target!.name}</span>
              <span className="font-bold">
                {owedAfter > 0 ? (
                  <>
                    هيبقى ليه عندك <Money value={owedAfter} />
                  </>
                ) : (
                  "خالصين"
                )}
              </span>
            </div>
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

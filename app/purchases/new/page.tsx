"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, UserPlus } from "lucide-react";
import { AccountPicker } from "@/components/AccountPicker";
import { Card, Money, Page, PageHeader } from "@/components/ui";
import { isEgyptMobile, p } from "@/lib/format";
import { cashAccounts, ofKind, TODAY, type Party } from "@/lib/mock";

/**
 * شراء قماش لمصنع (الـ spec، قسم 5): القماش مش بيتسجل قماش —
 * «اشتريت بمليون قماش، هكتبها دفعة للمصنع» (العميل).
 *   المصنع: الشراية كلها بتتحسب دفعة ليه
 *   تاجر القماش: اللي مندفعش بيتكتب عليه له
 *   الخزنة: بتقل باللي اتدفع بس
 */
export default function NewPurchasePage() {
  const suppliers = ofKind("supplier");
  const factories = ofKind("factory");

  const [supplier, setSupplier] = useState<Party | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [factory, setFactory] = useState<Party | null>(null);
  const [amount, setAmount] = useState("");
  const [paid, setPaid] = useState("");
  const [accountId, setAccountId] = useState(cashAccounts[0].id);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  const cleanName = name.trim().replace(/\s+/g, " ");
  const phoneOk = phone === "" || isEgyptMobile(phone);
  const seller: Party | null = adding
    ? cleanName.length >= 2 && phoneOk
      ? { id: "new", kind: "supplier", name: cleanName, phone: phone || undefined, balance: 0, lastActivity: TODAY }
      : null
    : supplier;

  const amountP = p(Number(amount) || 0);
  const paidP = Math.min(p(Number(paid) || 0), amountP);
  const rest = amountP - paidP;
  const account = cashAccounts.find((a) => a.id === accountId)!;
  const short = paidP > account.balance;
  const supplierOwedAfter = -(seller?.balance ?? 0) + rest;
  // المصنع: سالب = ليه عندي. الدفعة بتقلل اللي ليه
  const factoryOwedBefore = factory ? -factory.balance : 0;
  const factoryOwedAfter = factoryOwedBefore - amountP;
  const ready = !!seller && !!factory && amountP > 0;

  if (saved && seller && factory) {
    return (
      <>
        <PageHeader title="اتحفظ" />
        <Page>
          <Card className="px-5 py-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-pos-soft text-pos">
              <Check size={28} strokeWidth={3} />
            </div>
            <div className="mt-4 text-[15px] text-ink-soft">
              قماش من {seller.name} لـ {factory.name}
            </div>
            <div className="mt-1 flex items-baseline justify-center gap-1.5">
              <Money value={amountP} className="text-[30px] font-bold" />
              <span className="text-[14px] text-ink-mute">ج</span>
            </div>
            <div className="mt-5 space-y-2 border-t border-line-soft pt-4 text-[14px]">
              <Row label={`دفعة لـ ${factory.name}`} value={<Money value={amountP} className="font-semibold" />} />
              <Row label="دفعت" value={<Money value={paidP} className="font-semibold" />} />
              {rest > 0 && <Row label={`عليك لـ ${seller.name}`} value={<Money value={supplierOwedAfter} className="font-bold text-neg" />} />}
            </div>
          </Card>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link href={`/accounts/${factory.id}`} className="press rounded-2xl bg-brand py-3.5 text-center text-[15px] font-bold text-brand-ink">
              كشف المصنع
            </Link>
            <Link href="/purchases" className="press rounded-2xl border border-line bg-card py-3.5 text-center text-[15px] font-semibold text-ink-soft">
              المشتريات
            </Link>
          </div>
        </Page>
      </>
    );
  }

  const pick = "press flex w-full items-center gap-3 px-4 py-3 text-start";

  return (
    <>
      <PageHeader title="شراء قماش" back="/purchases" />
      <Page>
        {/* ------------------------------ من مين ------------------------------ */}
        <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">اشتريت من مين؟</div>
        {!adding ? (
          <Card className="mb-4 overflow-hidden">
            {suppliers.map((x, i) => (
              <div key={x.id}>
                {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                <button type="button" onClick={() => setSupplier(x)} aria-pressed={supplier?.id === x.id}
                  className={`${pick} ${supplier?.id === x.id ? "bg-brand-soft" : "active:bg-sunken"}`}>
                  <span className="flex-1 truncate text-[15px] font-semibold">{x.name}</span>
                  {x.balance < 0 && <span className="text-[12px] text-ink-mute">ليه <Money value={-x.balance} /></span>}
                  {supplier?.id === x.id && <Check size={17} className="text-brand" />}
                </button>
              </div>
            ))}
            <div className="border-t border-line-soft">
              <button type="button" onClick={() => { setAdding(true); setSupplier(null); }}
                className="press flex w-full items-center gap-2 px-4 py-3 text-[14px] font-semibold text-brand active:bg-sunken">
                <UserPlus size={17} />
                تاجر قماش جديد
              </button>
            </div>
          </Card>
        ) : (
          <Card className="mb-4 space-y-3 px-4 py-4">
            <input value={name} autoFocus onChange={(e) => setName(e.target.value)} placeholder="اسم تاجر القماش" aria-label="اسم تاجر القماش"
              className="h-12 w-full rounded-xl border border-line bg-page px-3 text-[16px] outline-none placeholder:text-ink-mute/60 focus:border-brand" />
            <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))} inputMode="tel"
              placeholder="رقم الموبايل (اختياري)" aria-label="رقم الموبايل"
              className="num h-12 w-full rounded-xl border border-line bg-page px-3 text-start text-[16px] outline-none placeholder:text-[14px] placeholder:text-ink-mute/60 focus:border-brand" />
            {phone.length === 11 && !isEgyptMobile(phone) && (
              <p className="text-[12px] text-neg">الرقم لازم يبدأ بـ 010 أو 011 أو 012 أو 015.</p>
            )}
            <button type="button" onClick={() => setAdding(false)} className="text-[13px] font-semibold text-ink-mute">← رجوع للقايمة</button>
          </Card>
        )}

        {/* ------------------------------ لمصنع مين ------------------------------ */}
        <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">القماش ده لأنهي مصنع؟</div>
        <Card className="mb-4 overflow-hidden">
          {factories.map((x, i) => (
            <div key={x.id}>
              {i > 0 && <div className="ms-4 border-t border-line-soft" />}
              <button type="button" onClick={() => setFactory(x)} aria-pressed={factory?.id === x.id}
                className={`${pick} ${factory?.id === x.id ? "bg-brand-soft" : "active:bg-sunken"}`}>
                <span className="flex-1 truncate text-[15px] font-semibold">{x.name}</span>
                {factory?.id === x.id && <Check size={17} className="text-brand" />}
              </button>
            </div>
          ))}
        </Card>

        {/* ------------------------------ المبلغ ------------------------------ */}
        <Card className="mb-4 px-4 py-4">
          <span className="mb-1.5 block text-[13px] font-semibold">اشتريت بكام؟</span>
          <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" placeholder="0" aria-label="إجمالي الشراية"
            className="num h-16 w-full rounded-xl border border-line bg-page px-3 text-center text-[28px] font-bold outline-none placeholder:font-normal placeholder:text-ink-mute/40 focus:border-brand" />

          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-[13px] font-semibold">دفعت كام دلوقتي؟</span>
            {amountP > 0 && (
              <button type="button" onClick={() => setPaid(String(amountP / 100))}
                className="press rounded-lg bg-brand-soft px-2.5 py-1 text-[12px] font-semibold text-brand">
                دفعت كله
              </button>
            )}
          </div>
          <input value={paid} onChange={(e) => setPaid(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" placeholder="0 — على الحساب" aria-label="المدفوع"
            className="num mt-1.5 h-12 w-full rounded-xl border border-line bg-page px-3 text-center text-[18px] font-bold outline-none placeholder:text-[14px] placeholder:font-normal placeholder:text-ink-mute/50 focus:border-brand" />
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

        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="ملاحظة (اختياري) — مثلاً: قطن أبيض" aria-label="ملاحظة"
          className="mb-4 h-12 w-full rounded-2xl border border-line bg-card px-4 text-[16px] outline-none placeholder:text-[14px] placeholder:text-ink-mute focus:border-brand" />

        {/* ----------------------------- اللي هيحصل ----------------------------- */}
        {ready && (
          <Card className="mb-4 overflow-hidden">
            <div className="bg-sunken px-4 py-2 text-[12px] font-semibold text-ink-mute">اللي هيحصل</div>
            <Effect label={factory!.name} sub="الشراية كلها دفعة للمصنع">
              {factoryOwedAfter > 0 ? <>هيبقى ليه <Money value={factoryOwedAfter} /></>
                : factoryOwedAfter < 0 ? <span className="text-pos">هيبقى عليه <Money value={-factoryOwedAfter} /></span>
                : <span className="text-pos">خالصين</span>}
            </Effect>
            {rest > 0 && (
              <Effect label={seller!.name} sub="اللي مندفعش">
                <span className="text-neg">هيبقى ليه <Money value={supplierOwedAfter} /></span>
              </Effect>
            )}
            {paidP > 0 && (
              <Effect label={account.name}>
                <Money value={account.balance} className="font-normal text-ink-mute" />{"  ←  "}
                <Money value={account.balance - paidP} className="text-neg" />
              </Effect>
            )}
          </Card>
        )}

        <button type="button" disabled={!ready} onClick={() => setSaved(true)}
          className="press w-full rounded-2xl bg-brand py-4 text-[16px] font-bold text-brand-ink disabled:opacity-35">
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

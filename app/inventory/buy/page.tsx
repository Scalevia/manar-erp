"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Check, Plus, Trash2 } from "lucide-react";
import { AccountPicker } from "@/components/AccountPicker";
import { PartyPicker } from "@/components/PartyPicker";
import { Card, Empty, Money, Num, Page, PageHeader } from "@/components/ui";
import { p } from "@/lib/format";
import { cashAccounts, modelByCode, stockOf, totals, type Party } from "@/lib/mock";

/**
 * شراء مخزون — بضاعة جاهزة من تاجر تاني، مش من مصنع (الـ spec، قسم 4):
 *   المخزن:  يزيد بسعر الشراء على طول — مفيش أمر تصنيع
 *   التاجر:  ليه اللي مندفعش، ويدفعه بعدين من كشف حسابه
 *   الخزنة:  تقل باللي اتدفع بس
 */

type Line = { id: number; code: number; name?: string; isNew: boolean; qty: number; price: number };

export default function BuyStockPage() {
  const [trader, setTrader] = useState<Party | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [paid, setPaid] = useState("");
  const [accountId, setAccountId] = useState(cashAccounts[0].id);
  const [saved, setSaved] = useState(false);

  const total = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const pieces = lines.reduce((s, l) => s + l.qty, 0);
  const paidP = Math.min(p(Number(paid) || 0), total);
  const rest = total - paidP;
  const account = cashAccounts.find((a) => a.id === accountId)!;
  const short = paidP > account.balance;
  // رصيد التاجر سالب = ليه عندي
  const owedAfter = -(trader?.balance ?? 0) + rest;
  const ready = !!trader && lines.length > 0;

  if (saved && trader) {
    return (
      <>
        <PageHeader title="اتحفظ" />
        <Page>
          <Card className="px-5 py-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-pos-soft text-pos">
              <Check size={28} strokeWidth={3} />
            </div>
            <div className="mt-4 text-[17px] font-bold">
              <Num value={pieces} /> قطعة دخلت المخزن
            </div>
            <div className="mt-1 text-[13px] text-ink-mute">
              من {trader.name} · <Money value={total} /> ج
            </div>
            <div className="mt-5 space-y-2 border-t border-line-soft pt-4 text-[14px]">
              {paidP > 0 && <Row label={`دفعت من ${account.name}`} value={<Money value={paidP} className="font-semibold" />} />}
              <Row
                label="ليه عندك دلوقتي"
                value={owedAfter > 0 ? <Money value={owedAfter} className="font-bold text-neg" /> : <span className="font-bold text-pos">خالصين</span>}
              />
            </div>
          </Card>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link href="/inventory" className="press rounded-2xl bg-brand py-3.5 text-center text-[15px] font-bold text-brand-ink">
              المخزون
            </Link>
            {trader.id === "new" ? (
              <button
                type="button"
                onClick={() => {
                  setLines([]);
                  setPaid("");
                  setSaved(false);
                }}
                className="press rounded-2xl border border-line bg-card py-3.5 text-[15px] font-semibold text-ink-soft"
              >
                شراء تاني
              </button>
            ) : (
              <Link
                href={`/accounts/${trader.id}`}
                className="press rounded-2xl border border-line bg-card py-3.5 text-center text-[15px] font-semibold text-ink-soft"
              >
                كشف حسابه
              </Link>
            )}
          </div>
        </Page>
      </>
    );
  }

  return (
    <>
      <PageHeader title="شراء مخزون" sub="بضاعة جاهزة من تاجر" back="/inventory" />
      <Page>
        {/* ------------------------------- من مين ------------------------------- */}
        <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">شاريها من مين؟</div>
        <PartyPicker kind="trader" value={trader} onChange={setTrader} />

        {/* ------------------------------- اشترى إيه ------------------------------- */}
        <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">اشتريت إيه؟</div>
        <Card className="mb-4 overflow-hidden">
          {lines.length === 0 ? (
            <Empty>ضيف الموديلات اللي اشتريتها</Empty>
          ) : (
            lines.map((l, i) => (
              <div key={l.id}>
                {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-12 shrink-0">
                    <div className="num text-[16px] font-bold">{l.code}</div>
                    {l.isNew && <div className="text-[10px] font-semibold text-brand">جديد</div>}
                  </div>
                  <span className="min-w-0 flex-1 truncate text-[13px] text-ink-mute">
                    <span className="num">×{l.qty}</span> · <Money value={l.price} decimals /> ج
                    {l.name && <> · {l.name}</>}
                  </span>
                  <Money value={l.qty * l.price} className="text-[15px] font-bold" />
                  <button
                    type="button"
                    onClick={() => setLines((v) => v.filter((x) => x.id !== l.id))}
                    aria-label="حذف السطر"
                    className="press -me-1 grid size-8 place-items-center rounded-full text-ink-mute active:bg-sunken"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
          <div className="border-t border-line">
            <AddLine onAdd={(l) => setLines((v) => [...v, l])} />
          </div>
        </Card>

        {/* -------------------------------- الحساب -------------------------------- */}
        {lines.length > 0 && (
          <Card className="mb-4 px-4 py-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[14px] text-ink-soft">
                الإجمالي · <Num value={pieces} /> قطعة
              </span>
              <Money value={total} className="text-[20px] font-bold" />
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-[13px] font-semibold">دفعت كام دلوقتي؟</span>
              <button
                type="button"
                onClick={() => setPaid(String(total / 100))}
                className="press rounded-lg bg-brand-soft px-2.5 py-1 text-[12px] font-semibold text-brand"
              >
                دفعت كله
              </button>
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
        )}

        {ready && (
          <Card className="mb-4 overflow-hidden">
            <div className="bg-sunken px-4 py-2 text-[12px] font-semibold text-ink-mute">اللي هيحصل</div>
            <Effect label="البضاعة في المخزن">
              <Money value={totals.stockValue} className="font-normal text-ink-mute" />
              {"  ←  "}
              <Money value={totals.stockValue + total} className="text-pos" />
            </Effect>
            {rest > 0 && (
              <Effect label={trader!.name} sub="اللي مندفعش">
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
        {!trader && lines.length > 0 && (
          <p className="mt-2 text-center text-[12px] text-ink-mute">اختار التاجر الأول</p>
        )}
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

/* ====================== إضافة سطر — الكيبورد مبيقفلش ====================== */

function AddLine({ onAdd }: { onAdd: (l: Line) => void }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");

  const codeRef = useRef<HTMLInputElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);

  const model = code ? modelByCode(Number(code)) : undefined;
  const isNew = !!code && !model;
  const ready = Number(code) > 0 && Number(qty) > 0 && Number(price) > 0;

  function submit() {
    if (!ready) return;
    onAdd({
      id: Date.now(),
      code: Number(code),
      name: model?.name ?? (name.trim() || undefined),
      isNew,
      qty: Number(qty),
      price: p(Number(price)),
    });
    setCode("");
    setName("");
    setQty("");
    setPrice("");
    codeRef.current?.focus();
  }

  const field =
    "num h-11 w-full rounded-xl border border-line bg-page px-2.5 text-center text-[16px] font-semibold outline-none placeholder:font-normal placeholder:text-ink-mute/50 focus:border-brand";

  return (
    <div className="px-4 py-3">
      <div className="flex items-end gap-2">
        <label className="block w-20">
          <span className="mb-1 block text-[11px] text-ink-mute">موديل</span>
          <input ref={codeRef} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && qtyRef.current?.focus()}
            inputMode="numeric" enterKeyHint="next" placeholder="240" className={field} />
        </label>
        <label className="block w-16">
          <span className="mb-1 block text-[11px] text-ink-mute">عدد</span>
          <input ref={qtyRef} value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && priceRef.current?.focus()}
            inputMode="numeric" enterKeyHint="next" placeholder="100" className={field} />
        </label>
        <label className="block flex-1">
          <span className="mb-1 block text-[11px] text-ink-mute">سعر القطعة</span>
          <input ref={priceRef} value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            inputMode="decimal" enterKeyHint="done" placeholder="95" className={field} />
        </label>
        <button type="button" onClick={submit} disabled={!ready} aria-label="إضافة السطر"
          className="press grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-brand-ink disabled:opacity-30">
          <Plus size={20} strokeWidth={2.6} />
        </button>
      </div>

      {/* موديل جديد: بيتعمل هنا في نفس الشاشة (الـ spec، قسم 4) */}
      {isNew && (
        <input value={name} onChange={(e) => setName(e.target.value)}
          placeholder="موديل جديد — اسمه؟ (اختياري)" aria-label="اسم الموديل الجديد"
          className="mt-2 h-10 w-full rounded-xl border border-brand/40 bg-brand-soft/40 px-3 text-[14px] outline-none placeholder:text-ink-mute focus:border-brand" />
      )}

      <div className="mt-2 min-h-[20px] text-[12px] text-ink-mute">
        {model && (
          <>
            {model.name ? `${model.name} · ` : ""}عندك <Num value={stockOf(model)} /> قطعة
          </>
        )}
        {isNew && <span className="font-semibold text-brand">كود جديد — هيتعمل موديل جديد</span>}
      </div>
    </div>
  );
}

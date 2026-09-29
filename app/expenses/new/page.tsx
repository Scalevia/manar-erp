"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Factory, X } from "lucide-react";
import { Card, Money, Page, PageHeader } from "@/components/ui";
import { p } from "@/lib/format";
import {
  byId,
  cashAccounts,
  expenseCategories,
  openOrders,
  type ProductionOrder,
} from "@/lib/mock";

export default function NewExpensePage() {
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState(cashAccounts[0].id);
  const [note, setNote] = useState("");
  const [showOrder, setShowOrder] = useState(false);
  const [order, setOrder] = useState<ProductionOrder | null>(null);
  const [saved, setSaved] = useState(false);

  const amountP = p(Number(amount) || 0);
  const account = cashAccounts.find((a) => a.id === accountId)!;
  const category = expenseCategories.find((c) => c.id === categoryId);
  const personal = !!category?.personal;
  const short = amountP > account.balance;
  const ready = amountP > 0 && !!category;

  function reset() {
    setAmount("");
    setCategoryId("");
    setAccountId(cashAccounts[0].id);
    setNote("");
    setShowOrder(false);
    setOrder(null);
    setSaved(false);
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
            <div className="mt-4 text-[17px] font-bold">{category?.label}</div>
            <div className="mt-1 flex items-baseline justify-center gap-1.5">
              <Money value={amountP} className="text-[30px] font-bold text-neg" />
              <span className="text-[14px] text-ink-mute">ج</span>
            </div>
            <div className="mt-2 text-[13px] text-ink-mute">
              من {account.name} · فاضل فيه <Money value={account.balance - amountP} /> ج
            </div>
            {order && (
              <div className="mt-2 text-[12px] text-brand">
                اتضاف على تكلفة {order.label} · موديل <span className="num">{order.modelCode}</span>
              </div>
            )}
          </Card>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={reset}
              className="press rounded-2xl bg-brand py-3.5 text-[15px] font-bold text-brand-ink"
            >
              مصروف تاني
            </button>
            <Link
              href="/expenses"
              className="press rounded-2xl border border-line bg-card py-3.5 text-center text-[15px] font-semibold text-ink-soft"
            >
              المصاريف
            </Link>
          </div>
        </Page>
      </>
    );
  }

  return (
    <>
      <PageHeader title="مصروف جديد" back="/expenses" />
      <Page>
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

        {/* -------------------------------- في إيه -------------------------------- */}
        <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">في إيه؟</div>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {expenseCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCategoryId(c.id);
                // السحب الشخصي عمره ما يبقى على أمر تصنيع
                if (c.personal) {
                  setShowOrder(false);
                  setOrder(null);
                }
              }}
              className={`press rounded-xl border px-3 py-3 text-[14px] font-semibold ${
                categoryId === c.id
                  ? "border-brand bg-brand-soft text-brand"
                  : "border-line bg-card text-ink-soft"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {personal && (
          <div className="mb-4 rounded-2xl bg-sunken px-4 py-3 text-[12px] leading-relaxed text-ink-soft">
            السحب الشخصي بيقلل الفلوس في الخزنة بس — <span className="font-semibold">مش بيتحسب مصروف
            على الشغل ومش بيقلل الربح.</span>
          </div>
        )}

        {/* --------------------------------- منين --------------------------------- */}
        <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">من أنهي خزنة؟</div>
        <div className="mb-2 flex gap-2">
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
        {short && (
          <p className="mb-2 px-1 text-[12px] text-warn">
            {account.name} فيه <Money value={account.balance} /> ج بس.
          </p>
        )}

        {/* -------------------------------- ملاحظة -------------------------------- */}
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="ملاحظة (اختياري) — مثلاً: فطار، تحميل بضاعة"
          aria-label="ملاحظة"
          className="mb-4 mt-2 h-12 w-full rounded-2xl border border-line bg-card px-4 text-[16px] outline-none placeholder:text-[14px] placeholder:text-ink-mute focus:border-brand"
        />

        {/* ------------------- تبع أمر تصنيع — نادر، فمخفي ------------------- */}
        {!personal && (
          <div className="mb-5">
            {!showOrder ? (
              <button
                type="button"
                onClick={() => setShowOrder(true)}
                className="press flex items-center gap-2 text-[13px] font-semibold text-brand"
              >
                <Factory size={15} />
                المصروف ده تبع أمر تصنيع؟
              </button>
            ) : (
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between bg-sunken px-4 py-2">
                  <span className="text-[12px] font-semibold text-ink-mute">
                    بيتضاف على تكلفة أمر التصنيع، مش مصروف عام
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOrder(false);
                      setOrder(null);
                    }}
                    aria-label="إلغاء"
                    className="grid size-7 place-items-center rounded-full text-ink-mute active:bg-card"
                  >
                    <X size={15} />
                  </button>
                </div>
                {openOrders().map((o, i) => (
                  <div key={o.id}>
                    {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                    <button
                      type="button"
                      onClick={() => setOrder(o)}
                      className={`press flex w-full items-center gap-3 px-4 py-3 text-start ${
                        order?.id === o.id ? "bg-brand-soft" : "active:bg-sunken"
                      }`}
                    >
                      <span className="flex-1 text-[14px]">
                        <span className="font-semibold">{byId(o.factoryId)?.name}</span>
                        <span className="text-ink-mute">
                          {" "}
                          · {o.label} · <span className="num">{o.modelCode}</span>
                        </span>
                      </span>
                      {order?.id === o.id && <Check size={17} className="text-brand" />}
                    </button>
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}

        <button
          type="button"
          disabled={!ready}
          onClick={() => setSaved(true)}
          className="press w-full rounded-2xl bg-brand py-4 text-[16px] font-bold text-brand-ink disabled:opacity-35"
        >
          حفظ المصروف
        </button>
      </Page>
    </>
  );
}

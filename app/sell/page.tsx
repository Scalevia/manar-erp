"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, Plus, Search, Trash2, X } from "lucide-react";
import { Badge, Card, Empty, Money, Num, Page, PageHeader } from "@/components/ui";
import { p } from "@/lib/format";
import {
  cashAccounts,
  modelByCode,
  ofKind,
  stockOf,
  type Party,
} from "@/lib/mock";

type Line = { id: number; code: number; qty: number; price: number };

export default function SellPage() {
  const [customer, setCustomer] = useState<Party | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [paid, setPaid] = useState("");
  const [account, setAccount] = useState(cashAccounts[0].id);
  const [done, setDone] = useState(false);

  const total = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const paidP = paid.trim() === "" ? 0 : p(Number(paid) || 0);
  const remaining = Math.max(0, total - paidP);

  if (done && customer) {
    return (
      <Saved
        customer={customer}
        total={total}
        paid={paidP}
        onNew={() => {
          setCustomer(null);
          setLines([]);
          setPaid("");
          setDone(false);
        }}
      />
    );
  }

  if (!customer) return <PickCustomer onPick={setCustomer} />;

  return (
    <>
      <PageHeader
        title="فاتورة جديدة"
        sub={customer.name}
        action={
          <button
            type="button"
            onClick={() => setCustomer(null)}
            className="press rounded-xl bg-sunken px-3 py-1.5 text-[13px] font-semibold text-ink-soft"
          >
            تغيير
          </button>
        }
      />

      <Page>
        {/* ------------------------ عليه قبل الفاتورة ------------------------ */}
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-sunken px-4 py-3">
          <span className="text-[13px] text-ink-soft">عليه قبل الفاتورة</span>
          <Money value={customer.balance} className="text-[15px] font-bold text-pos" />
        </div>

        {/* ------------------------------ السطور ------------------------------ */}
        <Card className="mb-3 overflow-hidden">
          {lines.length === 0 ? (
            <Empty>ابدأ بإضافة موديل</Empty>
          ) : (
            lines.map((l, i) => (
              <div key={l.id}>
                {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="num w-11 shrink-0 text-[16px] font-bold">{l.code}</span>
                  <span className="flex-1 text-[13px] text-ink-mute">
                    <span className="num">×{l.qty}</span>
                    {"  "}
                    <Money value={l.price} /> ج
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

        {/* ------------------------------ الحساب ------------------------------ */}
        <Card className="mb-4 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[14px] text-ink-soft">الإجمالي</span>
            <Money value={total} className="text-[18px] font-bold" />
          </div>

          <div className="ms-4 border-t border-line-soft" />

          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[14px] text-ink-soft">دفع</span>
              <div className="flex items-center gap-1.5">
                <input
                  value={paid}
                  onChange={(e) => setPaid(e.target.value.replace(/[^\d.]/g, ""))}
                  inputMode="decimal"
                  placeholder="0"
                  aria-label="المبلغ المدفوع"
                  className="num h-10 w-28 rounded-xl border border-line bg-page px-3 text-end text-[16px] font-semibold outline-none focus:border-brand"
                />
                <span className="text-[13px] text-ink-mute">ج</span>
              </div>
            </div>

            {paidP > 0 && (
              <div className="mt-3 flex gap-2">
                {cashAccounts.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAccount(a.id)}
                    className={`press flex-1 rounded-xl border px-2 py-2 text-[12px] font-semibold ${
                      account === a.id
                        ? "border-brand bg-brand-soft text-brand"
                        : "border-line bg-card text-ink-mute"
                    }`}
                  >
                    {a.short}
                  </button>
                ))}
              </div>
            )}

            <p className="mt-2.5 text-[11px] leading-relaxed text-ink-mute">
              سيبها فاضية = آجل بالكامل · اكتب الإجمالي = نقدي بالكامل
            </p>
          </div>

          <div className="ms-4 border-t border-line-soft" />

          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[14px] font-semibold">باقي على الفاتورة</span>
            <Money
              value={remaining}
              className={`text-[18px] font-bold ${remaining > 0 ? "text-neg" : "text-pos"}`}
            />
          </div>

          <div className="bg-sunken px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-ink-soft">حسابه دلوقتي</span>
              <Money
                value={customer.balance + remaining}
                className="text-[15px] font-bold text-pos"
              />
            </div>
          </div>
        </Card>

        <button
          type="button"
          disabled={lines.length === 0}
          onClick={() => setDone(true)}
          className="press w-full rounded-2xl bg-brand py-4 text-[16px] font-bold text-brand-ink disabled:opacity-35"
        >
          حفظ الفاتورة
        </button>
      </Page>
    </>
  );
}

/* ====================== إضافة سطر — الكيبورد مبيقفلش ====================== */

function AddLine({ onAdd }: { onAdd: (l: Line) => void }) {
  const [code, setCode] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");

  const codeRef = useRef<HTMLInputElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);

  const model = code ? modelByCode(Number(code)) : undefined;
  const ready = !!model && Number(qty) > 0 && Number(price) > 0;

  function submit() {
    if (!ready) return;
    onAdd({
      id: Date.now(),
      code: Number(code),
      qty: Number(qty),
      price: p(Number(price)),
    });
    setCode("");
    setQty("");
    setPrice("");
    codeRef.current?.focus();
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-end gap-2">
        <Field
          ref={codeRef}
          label="موديل"
          value={code}
          onChange={setCode}
          onEnter={() => qtyRef.current?.focus()}
          width="w-20"
          placeholder="214"
        />
        <Field
          ref={qtyRef}
          label="عدد"
          value={qty}
          onChange={setQty}
          onEnter={() => priceRef.current?.focus()}
          width="w-16"
          placeholder="60"
        />
        <Field
          ref={priceRef}
          label="سعر"
          value={price}
          onChange={setPrice}
          onEnter={submit}
          width="flex-1"
          placeholder="120"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!ready}
          aria-label="إضافة السطر"
          className="press grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-brand-ink disabled:opacity-30"
        >
          <Plus size={20} strokeWidth={2.6} />
        </button>
      </div>

      {/* تأكيد بصري إن الكود موجود وفيه مخزون */}
      <div className="mt-2 min-h-[18px] text-[12px]">
        {code && !model && <span className="text-neg">مفيش موديل بالكود ده</span>}
        {model && (
          <span className="text-ink-mute">
            {model.name ? `${model.name} · ` : ""}
            <Num value={stockOf(model)} /> قطعة في المحل
            {Number(qty) > stockOf(model) && (
              <span className="text-warn"> — أكتر من اللي عندك</span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}

function Field({
  ref,
  label,
  value,
  onChange,
  onEnter,
  width,
  placeholder,
}: {
  ref: React.RefObject<HTMLInputElement | null>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter: () => void;
  width: string;
  placeholder: string;
}) {
  return (
    <label className={`${width} block`}>
      <span className="mb-1 block text-[11px] text-ink-mute">{label}</span>
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onEnter();
          }
        }}
        inputMode="decimal"
        enterKeyHint="next"
        placeholder={placeholder}
        className="num h-11 w-full rounded-xl border border-line bg-page px-2.5 text-center text-[16px] font-semibold outline-none placeholder:font-normal placeholder:text-ink-mute/50 focus:border-brand"
      />
    </label>
  );
}

/* ========================== اختيار العميل ========================== */

function PickCustomer({ onPick }: { onPick: (p: Party) => void }) {
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const all = ofKind("customer").sort(
      (a, b) => +new Date(b.lastActivity) - +new Date(a.lastActivity),
    );
    const term = q.trim();
    return term ? all.filter((x) => x.name.includes(term)) : all;
  }, [q]);

  return (
    <>
      <PageHeader title="بيع" sub="اختار العميل" />
      <Page>
        <div className="relative mb-4">
          <Search
            size={18}
            className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-ink-mute"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث بالاسم"
            aria-label="ابحث بالاسم"
            enterKeyHint="search"
            className="h-12 w-full rounded-2xl border border-line bg-card ps-11 pe-10 text-[16px] outline-none placeholder:text-ink-mute focus:border-brand"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="مسح"
              className="absolute end-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ink-mute active:bg-sunken"
            >
              <X size={17} />
            </button>
          )}
        </div>

        {!q && (
          <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">
            آخر العملاء
          </div>
        )}

        <Card className="overflow-hidden">
          {list.length === 0 ? (
            <Empty>مفيش عميل بالاسم ده</Empty>
          ) : (
            list.map((c, i) => (
              <div key={c.id}>
                {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                <button
                  type="button"
                  onClick={() => onPick(c)}
                  className="press flex w-full items-center gap-3 px-4 py-3.5 text-start active:bg-sunken"
                >
                  <span className="flex-1 truncate text-[15px] font-semibold">
                    {c.name}
                  </span>
                  {c.balance > 0 ? (
                    <span className="text-[13px] text-ink-mute">
                      عليه <Money value={c.balance} className="font-semibold text-pos" />
                    </span>
                  ) : (
                    <Badge tone="neutral">مفيش حساب</Badge>
                  )}
                </button>
              </div>
            ))
          )}
        </Card>

        <p className="mt-3 px-1 text-[12px] leading-relaxed text-ink-mute">
          الرصيد بيبان جنب الاسم قبل ما تختار — تعرف انت داخل على مين.
        </p>
      </Page>
    </>
  );
}

/* ============================ بعد الحفظ ============================ */

function Saved({
  customer,
  total,
  paid,
  onNew,
}: {
  customer: Party;
  total: number;
  paid: number;
  onNew: () => void;
}) {
  const remaining = Math.max(0, total - paid);
  return (
    <>
      <PageHeader title="اتحفظت" />
      <Page>
        <Card className="px-5 py-8 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-pos-soft text-pos">
            <Check size={28} strokeWidth={3} />
          </div>
          <div className="mt-4 text-[17px] font-bold">{customer.name}</div>
          <div className="mt-1 text-[13px] text-ink-mute">
            فاتورة بـ <Money value={total} /> ج
          </div>

          <div className="mt-5 space-y-2 border-t border-line-soft pt-5 text-[14px]">
            <div className="flex justify-between">
              <span className="text-ink-soft">دفع</span>
              <Money value={paid} className="font-semibold" />
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">باقي على الفاتورة</span>
              <Money value={remaining} className="font-semibold text-neg" />
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">حسابه دلوقتي</span>
              <Money value={customer.balance + remaining} className="font-bold text-pos" />
            </div>
          </div>
        </Card>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onNew}
            className="press rounded-2xl bg-brand py-3.5 text-[15px] font-bold text-brand-ink"
          >
            فاتورة جديدة
          </button>
          <Link
            href={`/accounts/${customer.id}`}
            className="press rounded-2xl border border-line bg-card py-3.5 text-center text-[15px] font-semibold text-ink-soft"
          >
            كشف حسابه
          </Link>
        </div>
      </Page>
    </>
  );
}

"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Calculator, Check, Plus, Trash2 } from "lucide-react";
import { Card, Empty, Money, Num, Page, PageHeader } from "@/components/ui";
import { money2, p } from "@/lib/format";
import { modelByCode, ofKind, stockOf, type Party } from "@/lib/mock";

/**
 * استلام بضاعة من المصنع = عملية شراء عادية (الـ spec، قسم 5).
 *
 * المصنع بيسلّم على دفعات، وكل دفعة بتتحسب لوحدها: الموديل · العدد · سعر القطعة.
 * التاجر بيعرف السعر وقت الاستلام: اللي صرفه على الحتة ÷ اللي وصل فعلاً —
 * فالسقطات (القصة 100 تيجي 95) بتدخل في السعر لوحدها. مفيش سعر مبدئي.
 */

type Line = { id: number; code: number; name?: string; isNew: boolean; qty: number; price: number };

export default function ReceiveFlow({ initialFactoryId }: { initialFactoryId?: string }) {
  const factories = ofKind("factory");
  const [factory, setFactory] = useState<Party | null>(factories.find((f) => f.id === initialFactoryId) ?? null);
  const [lines, setLines] = useState<Line[]>([]);
  const [saved, setSaved] = useState(false);

  const total = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const pieces = lines.reduce((s, l) => s + l.qty, 0);
  // رصيد المصنع: سالب = ليه عندي · موجب = عليه (دفعتله قماش أكتر من البضاعة)
  const owedBefore = factory ? -factory.balance : 0;
  const owedAfter = owedBefore + total;

  if (saved && factory) {
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
              من {factory.name} · <Money value={total} /> ج
            </div>
            <div className="mt-5 border-t border-line-soft pt-4 text-[14px] font-semibold">
              <FactoryBalance value={owedAfter} />
            </div>
          </Card>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setLines([]);
                setSaved(false);
              }}
              className="press rounded-2xl bg-brand py-3.5 text-[15px] font-bold text-brand-ink"
            >
              استلام تاني
            </button>
            <Link
              href={`/accounts/${factory.id}`}
              className="press rounded-2xl border border-line bg-card py-3.5 text-center text-[15px] font-semibold text-ink-soft"
            >
              كشف حسابه
            </Link>
          </div>
        </Page>
      </>
    );
  }

  if (!factory) {
    return (
      <>
        <PageHeader title="استلام من المصنع" sub="اختار المصنع" back="/" />
        <Page>
          <Card className="overflow-hidden">
            {factories.map((f, i) => (
              <div key={f.id}>
                {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                <button
                  type="button"
                  onClick={() => setFactory(f)}
                  className="press flex w-full items-center gap-3 px-4 py-3.5 text-start active:bg-sunken"
                >
                  <span className="flex-1 truncate text-[15px] font-semibold">{f.name}</span>
                  {f.balance !== 0 && (
                    <span className="text-[12px] text-ink-mute">
                      {f.balance < 0 ? "ليه " : "عليه "}
                      <Money value={Math.abs(f.balance)} />
                    </span>
                  )}
                </button>
              </div>
            ))}
          </Card>
        </Page>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="استلام من المصنع"
        sub={factory.name}
        action={
          <button
            type="button"
            onClick={() => setFactory(null)}
            className="press rounded-xl bg-sunken px-3 py-1.5 text-[13px] font-semibold text-ink-soft"
          >
            تغيير
          </button>
        }
      />
      <Page>
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-sunken px-4 py-3">
          <span className="text-[13px] text-ink-soft">{factory.name} دلوقتي</span>
          <span className="text-[14px] font-bold">
            <FactoryBalance value={owedBefore} now />
          </span>
        </div>

        {/* -------------------------------- السطور -------------------------------- */}
        <Card className="mb-4 overflow-hidden">
          {lines.length === 0 ? (
            <Empty>ضيف الموديلات اللي وصلت</Empty>
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

        {/* ------------------------------ اللي هيحصل ------------------------------ */}
        {lines.length > 0 && (
          <Card className="mb-4 overflow-hidden">
            <div className="bg-sunken px-4 py-2 text-[12px] font-semibold text-ink-mute">اللي هيحصل</div>
            <div className="flex items-center justify-between border-t border-line-soft px-4 py-3 text-[14px]">
              <span className="text-ink-soft">المخزن</span>
              <span className="font-bold text-pos">
                <span className="num">+</span>
                <Num value={pieces} /> قطعة
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-line-soft px-4 py-3 text-[14px]">
              <span className="text-ink-soft">الإجمالي</span>
              <Money value={total} className="font-bold" />
            </div>
            <div className="flex items-center justify-between border-t border-line-soft px-4 py-3 text-[14px]">
              <span className="text-ink-soft">{factory.name}</span>
              <span className="font-bold">
                <FactoryBalance value={owedAfter} />
              </span>
            </div>
          </Card>
        )}

        <button
          type="button"
          disabled={lines.length === 0}
          onClick={() => setSaved(true)}
          className="press w-full rounded-2xl bg-brand py-4 text-[16px] font-bold text-brand-ink disabled:opacity-35"
        >
          حفظ الاستلام
        </button>
      </Page>
    </>
  );
}

/** موجب = ليه عندي · سالب = عليه (دفعتله أكتر) · صفر = خالصين */
function FactoryBalance({ value, now }: { value: number; now?: boolean }) {
  if (value === 0) return <span className="text-pos">خالصين</span>;
  if (value > 0)
    return (
      <span className="text-neg">
        {now ? "ليه " : "هيبقى ليه "}
        <Money value={value} />
      </span>
    );
  return (
    <span className="text-pos">
      {now ? "عليه " : "هيبقى عليه "}
      <Money value={-value} />
      <span className="text-[11px] font-normal text-ink-mute"> (دفعتله أكتر)</span>
    </span>
  );
}

/* ====================== إضافة سطر — الكيبورد مبيقفلش ====================== */

function AddLine({ onAdd }: { onAdd: (l: Line) => void }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [calc, setCalc] = useState(false);
  const [spent, setSpent] = useState("");

  const codeRef = useRef<HTMLInputElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);

  const model = code ? modelByCode(Number(code)) : undefined;
  const isNew = !!code && !model;
  // «احسبلي السعر»: اللي صرفته على الحتة ÷ اللي وصل فعلاً
  const calcPrice = Number(spent) > 0 && Number(qty) > 0 ? Number(spent) / Number(qty) : 0;
  const priceN = calc ? calcPrice : Number(price);
  const ready = Number(code) > 0 && Number(qty) > 0 && priceN > 0;

  function submit() {
    if (!ready) return;
    onAdd({
      id: Date.now(),
      code: Number(code),
      name: model?.name ?? (name.trim() || undefined),
      isNew,
      qty: Number(qty),
      price: p(Math.round(priceN * 100) / 100),
    });
    setCode("");
    setName("");
    setQty("");
    setPrice("");
    setSpent("");
    setCalc(false);
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
            inputMode="numeric" enterKeyHint="next" placeholder="214" className={field} />
        </label>
        <label className="block w-16">
          <span className="mb-1 block text-[11px] text-ink-mute">وصل</span>
          <input ref={qtyRef} value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && priceRef.current?.focus()}
            inputMode="numeric" enterKeyHint="next" placeholder="950" className={field} />
        </label>
        <label className="block flex-1">
          <span className="mb-1 block text-[11px] text-ink-mute">سعر القطعة</span>
          {calc ? (
            <div className={`${field} grid place-items-center bg-sunken`}>
              {calcPrice > 0 ? money2(p(calcPrice)) : "—"}
            </div>
          ) : (
            <input ref={priceRef} value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              inputMode="decimal" enterKeyHint="done" placeholder="82" className={field} />
          )}
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

      <div className="mt-2 flex min-h-[20px] items-center justify-between gap-2 text-[12px]">
        <span className="text-ink-mute">
          {model && (
            <>
              {model.name ? `${model.name} · ` : ""}عندك <Num value={stockOf(model)} /> قطعة
            </>
          )}
          {isNew && <span className="font-semibold text-brand">كود جديد — هيتعمل موديل جديد</span>}
        </span>
        <button
          type="button"
          onClick={() => setCalc((v) => !v)}
          className={`press flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 font-semibold ${calc ? "bg-brand-soft text-brand" : "text-brand"}`}
        >
          <Calculator size={14} />
          {calc ? "هكتب السعر بنفسي" : "احسبلي السعر"}
        </button>
      </div>

      {calc && (
        <div className="mt-2 rounded-xl bg-sunken px-3 py-3">
          <label className="block">
            <span className="mb-1 block text-[12px] text-ink-soft">صرفت كام على الحتة دي؟ (قماش ومصنعية وكله)</span>
            <input value={spent} onChange={(e) => setSpent(e.target.value.replace(/[^\d.]/g, ""))}
              inputMode="decimal" placeholder="78000" className={`${field} bg-card`} />
          </label>
          {calcPrice > 0 && (
            <p className="mt-2 text-[12px] text-ink-soft">
              <span className="num">{Number(spent).toLocaleString("en-US")}</span> ÷{" "}
              <span className="num">{Number(qty).toLocaleString("en-US")}</span> قطعة وصلت ={" "}
              <span className="num font-bold text-ink">{money2(p(calcPrice))}</span> للقطعة
            </p>
          )}
          <p className="mt-1 text-[11px] text-ink-mute">السقطات بتدخل لوحدها: بتقسم على اللي وصل فعلاً.</p>
        </div>
      )}
    </div>
  );
}

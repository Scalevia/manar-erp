"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, Scissors, X } from "lucide-react";
import { Badge, Card, Empty, Money, Num, Page, PageHeader } from "@/components/ui";
import { since } from "@/lib/format";
import {
  byId,
  openOrders,
  orders,
  provisionalCost,
  TODAY,
  type ProductionOrder,
} from "@/lib/mock";

type Receipt = { good: number; bad: number; fabricM: number };

export default function ReceiveFlow({ initialOrderId }: { initialOrderId?: string }) {
  const initial = orders.find((o) => o.id === initialOrderId && o.status === "open") ?? null;

  const [order, setOrder] = useState<ProductionOrder | null>(initial);
  const [saved, setSaved] = useState<Receipt | null>(null);

  if (order && saved)
    return (
      <Saved
        order={order}
        r={saved}
        onNew={() => {
          setOrder(null);
          setSaved(null);
        }}
      />
    );

  if (!order) return <PickOrder onPick={setOrder} />;

  return <ReceiveForm order={order} onChange={() => setOrder(null)} onSave={setSaved} />;
}

/* ========================= اختيار أمر التصنيع ========================= */

function PickOrder({ onPick }: { onPick: (o: ProductionOrder) => void }) {
  const open = openOrders();

  return (
    <>
      <PageHeader title="استلام من المصنع" sub="اختار أمر التصنيع" back="/production" />
      <Page>
        <Card className="overflow-hidden">
          {open.length === 0 ? (
            <Empty>مفيش أوامر تصنيع مفتوحة</Empty>
          ) : (
            open.map((o, i) => {
              const left = Math.max(0, o.expectedPieces - o.receivedGood);
              return (
                <div key={o.id}>
                  {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                  <button
                    type="button"
                    onClick={() => onPick(o)}
                    className="press flex w-full items-center gap-3 px-4 py-3.5 text-start active:bg-sunken"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-semibold">{byId(o.factoryId)?.name}</div>
                      <div className="mt-0.5 text-[12px] text-ink-mute">
                        {o.label} · موديل <span className="num">{o.modelCode}</span> ·{" "}
                        {since(o.openedAt, new Date(TODAY))}
                      </div>
                    </div>
                    {left > 0 && (
                      <Badge tone="brand">
                        فاضل <Num value={left} />
                      </Badge>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </Card>
      </Page>
    </>
  );
}

/* ============================ شاشة الاستلام ============================ */

function ReceiveForm({
  order,
  onChange,
  onSave,
}: {
  order: ProductionOrder;
  onChange: () => void;
  onSave: (r: Receipt) => void;
}) {
  const [good, setGood] = useState("");
  const [bad, setBad] = useState("");
  const [fabric, setFabric] = useState("");
  const [showFabric, setShowFabric] = useState(false);

  const factory = byId(order.factoryId);
  const goodN = Number(good) || 0;
  const badN = Number(bad) || 0;
  const fabricN = Number(fabric) || 0;

  // المصنعية على السليم بس — المضروب مش بيتدفع ومش بيدخل المخزون
  const work = goodN * order.workPerPiece;
  const cost = provisionalCost(order);
  const perMeter = Math.round(order.fabricCost / order.fabricMeters);

  const leftBefore = Math.max(0, order.expectedPieces - order.receivedGood);
  const over = goodN > leftBefore;

  return (
    <>
      <PageHeader
        title="استلام من المصنع"
        sub={`${factory?.name} · ${order.label}`}
        action={
          <button
            type="button"
            onClick={onChange}
            className="press rounded-xl bg-sunken px-3 py-1.5 text-[13px] font-semibold text-ink-soft"
          >
            تغيير
          </button>
        }
      />

      <Page>
        {/* ------------------------------ الوضع الحالي ------------------------------ */}
        <Card className="mb-4 overflow-hidden">
          <div className="grid grid-cols-3 gap-px bg-line-soft">
            <Cell label="متوقع" value={order.expectedPieces} />
            <Cell label="استلمت قبل كده" value={order.receivedGood} />
            <Cell label="فاضل" value={leftBefore} brand />
          </div>
          <div className="px-4 py-2.5 text-center text-[12px] text-ink-mute">
            موديل <span className="num font-semibold">{order.modelCode}</span> · مصنعية{" "}
            <Money value={order.workPerPiece} className="font-semibold" /> ج للقطعة
          </div>
        </Card>

        {/* -------------------------------- الإدخال -------------------------------- */}
        <Card className="mb-4 px-4 py-4">
          <NumField label="القطع السليمة" value={good} onChange={setGood} placeholder="0" autoFocus big />
          {over && (
            <p className="mt-2 text-[12px] text-warn">
              أكتر من الفاضل المتوقع (<span className="num">{leftBefore}</span>) — تمام لو ده اللي وصل فعلاً.
            </p>
          )}

          <div className="mt-4">
            <NumField label="قطع مضروبة" hint="اختياري" value={bad} onChange={setBad} placeholder="0" />
          </div>

          {/* الحاجة النادرة: ممكنة، بس متتعبش المتكرر (الـ spec، قسم 2) */}
          <div className="mt-4">
            {showFabric ? (
              <div className="relative">
                <NumField
                  label="قماش راجع بالمتر"
                  hint="بيرجع لمخزن القماش بتكلفته"
                  value={fabric}
                  onChange={setFabric}
                  placeholder="0"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowFabric(false);
                    setFabric("");
                  }}
                  aria-label="إلغاء القماش الراجع"
                  className="absolute end-0 top-0 grid size-7 place-items-center rounded-full text-ink-mute active:bg-sunken"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowFabric(true)}
                className="press flex items-center gap-2 text-[13px] font-semibold text-brand"
              >
                <Scissors size={15} />
                رجّع قماش زيادة؟
              </button>
            )}
          </div>
        </Card>

        {/* ------------------------------ اللي هيحصل ------------------------------ */}
        {goodN > 0 && (
          <Card className="mb-4 overflow-hidden">
            <div className="bg-sunken px-4 py-2 text-[12px] font-semibold text-ink-mute">اللي هيحصل</div>

            <Effect label="يدخل المحل" value={<><Num value={goodN} className="font-bold" /> قطعة</>} />
            <Effect
              label={`مصنعية ${goodN} × ${order.workPerPiece / 100}`}
              value={<><Money value={work} className="font-bold text-neg" /> ج</>}
              sub={`عليا لـ ${factory?.name}`}
            />
            <Effect
              label="تكلفة القطعة"
              value={<><Money value={cost} decimals className="font-bold text-warn" /> ج</>}
              sub="مبدئية — تتظبط لما أمر التصنيع يقفل"
            />
            {fabricN > 0 && (
              <Effect
                label={`قماش راجع ${fabricN} م`}
                value={<><Money value={fabricN * perMeter} className="font-bold" /> ج</>}
                sub="بيرجع مخزن القماش ومش بيتحمّل على القطع"
              />
            )}

            {badN > 0 && (
              <div className="border-t border-line-soft bg-warn-soft/50 px-4 py-3 text-[12px] leading-relaxed text-warn">
                الـ <span className="num font-semibold">{badN}</span> قطعة المضروبة مش بتدخل المخزون ومش
                بتتحسب مصنعية — بتتشال من القسمة فبتزوّد تكلفة السليم.
              </div>
            )}
          </Card>
        )}

        <button
          type="button"
          disabled={goodN <= 0}
          onClick={() => onSave({ good: goodN, bad: badN, fabricM: fabricN })}
          className="press w-full rounded-2xl bg-brand py-4 text-[16px] font-bold text-brand-ink disabled:opacity-35"
        >
          حفظ الاستلام
        </button>
      </Page>
    </>
  );
}

/* ------------------------------------------------------------------ */

function Cell({ label, value, brand }: { label: string; value: number; brand?: boolean }) {
  return (
    <div className="bg-card px-2 py-3 text-center">
      <Num value={value} className={`block text-[19px] font-bold ${brand ? "text-brand" : ""}`} />
      <div className="mt-0.5 text-[11px] text-ink-mute">{label}</div>
    </div>
  );
}

function Effect({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-line-soft px-4 py-3">
      <div className="min-w-0">
        <div className="text-[14px] text-ink-soft">{label}</div>
        {sub && <div className="mt-0.5 text-[11px] text-ink-mute">{sub}</div>}
      </div>
      <div className="shrink-0 text-[15px]">{value}</div>
    </div>
  );
}

function NumField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  autoFocus,
  big,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  big?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-2">
        <span className="text-[13px] font-semibold">{label}</span>
        {hint && <span className="text-[11px] text-ink-mute">{hint}</span>}
      </span>
      <input
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        inputMode="numeric"
        enterKeyHint="done"
        placeholder={placeholder}
        className={`num w-full rounded-xl border border-line bg-page px-3 text-center font-bold outline-none placeholder:font-normal placeholder:text-ink-mute/40 focus:border-brand ${
          big ? "h-16 text-[28px]" : "h-12 text-[18px]"
        }`}
      />
    </label>
  );
}

/* ============================== بعد الحفظ ============================== */

function Saved({ order, r, onNew }: { order: ProductionOrder; r: Receipt; onNew: () => void }) {
  const factory = byId(order.factoryId);
  const totalAfter = order.receivedGood + r.good;
  const leftAfter = Math.max(0, order.expectedPieces - totalAfter);

  return (
    <>
      <PageHeader title="اتحفظ" />
      <Page>
        <Card className="px-5 py-8 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-pos-soft text-pos">
            <Check size={28} strokeWidth={3} />
          </div>
          <div className="mt-4 text-[17px] font-bold">
            <Num value={r.good} /> قطعة دخلت المحل
          </div>
          <div className="mt-1 text-[13px] text-ink-mute">
            موديل <span className="num">{order.modelCode}</span> · {order.label}
          </div>

          <div className="mt-5 space-y-2 border-t border-line-soft pt-5 text-[14px]">
            <div className="flex justify-between">
              <span className="text-ink-soft">مصنعية {factory?.name}</span>
              <Money value={r.good * order.workPerPiece} className="font-semibold text-neg" />
            </div>
            {r.bad > 0 && (
              <div className="flex justify-between">
                <span className="text-ink-soft">مضروب</span>
                <span className="num font-semibold">{r.bad}</span>
              </div>
            )}
            {r.fabricM > 0 && (
              <div className="flex justify-between">
                <span className="text-ink-soft">قماش راجع</span>
                <span className="font-semibold">
                  <span className="num">{r.fabricM}</span> م
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-ink-soft">استلمت من الأمر ده</span>
              <span className="num font-semibold">{totalAfter}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">فاضل متوقع</span>
              <span className="num font-semibold">{leftAfter}</span>
            </div>
          </div>

          {leftAfter === 0 && (
            <div className="mt-5 rounded-xl bg-warn-soft px-4 py-3 text-[12px] leading-relaxed text-warn">
              وصلك العدد المتوقع كله. لو المصنع خلص،{" "}
              <span className="font-bold">اقفل أمر التصنيع</span> عشان التكلفة تتظبط وتبقى حقيقية.
            </div>
          )}
        </Card>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onNew}
            className="press rounded-2xl bg-brand py-3.5 text-[15px] font-bold text-brand-ink"
          >
            استلام تاني
          </button>
          <Link
            href="/production"
            className="press flex items-center justify-center gap-1.5 rounded-2xl border border-line bg-card py-3.5 text-[15px] font-semibold text-ink-soft"
          >
            أوامر التصنيع
            <ChevronLeft size={16} />
          </Link>
        </div>
      </Page>
    </>
  );
}

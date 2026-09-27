"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Check, Undo2 } from "lucide-react";
import { Card, Empty, Money, Num, Page, PageHeader } from "@/components/ui";
import { p } from "@/lib/format";

type Entry = { id: number; code: number; pieces: number; cost: number };

/**
 * الإدخال السريع (الـ spec، قسم 11).
 *
 * القاعدة: **الكيبورد مبيقفلش.** كود → عدد → تكلفة → تمام → السطر يطلع فوق
 * والمؤشر يرجع لأول خانة. الكود أرقام صافية فالكيبورد الرقمي مبيتبدلش.
 *
 * تكرار الكود **مسموح ومتوقع** — نفس الموديل ممكن يكون بتكلفتين من أمرين تصنيع.
 */
export default function StockEntryPage() {
  const [rows, setRows] = useState<Entry[]>([
    { id: 3, code: 190, pieces: 45, cost: p(120) },
    { id: 2, code: 208, pieces: 180, cost: p(92) },
    { id: 1, code: 214, pieces: 340, cost: p(85) },
  ]);

  const [code, setCode] = useState("");
  const [pieces, setPieces] = useState("");
  const [cost, setCost] = useState("");

  const codeRef = useRef<HTMLInputElement>(null);
  const piecesRef = useRef<HTMLInputElement>(null);
  const costRef = useRef<HTMLInputElement>(null);

  const ready = Number(code) > 0 && Number(pieces) > 0 && Number(cost) > 0;

  const totalPieces = rows.reduce((s, r) => s + r.pieces, 0);
  const totalValue = rows.reduce((s, r) => s + r.pieces * r.cost, 0);

  function add() {
    if (!ready) return;
    setRows((v) => [
      { id: Date.now(), code: Number(code), pieces: Number(pieces), cost: p(Number(cost)) },
      ...v,
    ]);
    setCode("");
    setPieces("");
    setCost("");
    // اهتزاز خفيف يأكد الحفظ من غير ما يبص على الشاشة
    navigator.vibrate?.(12);
    codeRef.current?.focus();
  }

  return (
    <>
      <PageHeader
        title="إدخال بضاعة المخزن"
        sub={
          <>
            <Num value={rows.length} /> موديل · <Num value={totalPieces} /> قطعة ·{" "}
            <Money value={totalValue} /> ج
          </>
        }
        back="/setup"
      />

      <Page>
        {/* ------------------------------ صف الإدخال ------------------------------ */}
        <Card className="mb-4 px-4 py-3.5">
          <div className="flex items-end gap-2">
            <Field
              ref={codeRef}
              label="موديل"
              value={code}
              onChange={setCode}
              onEnter={() => piecesRef.current?.focus()}
              width="w-20"
              placeholder="214"
              autoFocus
            />
            <Field
              ref={piecesRef}
              label="عدد"
              value={pieces}
              onChange={setPieces}
              onEnter={() => costRef.current?.focus()}
              width="w-20"
              placeholder="340"
            />
            <Field
              ref={costRef}
              label="تكلفة"
              value={cost}
              onChange={setCost}
              onEnter={add}
              width="flex-1"
              placeholder="85"
            />
            <button
              type="button"
              onClick={add}
              disabled={!ready}
              className="press h-11 shrink-0 rounded-xl bg-brand px-4 text-[14px] font-bold text-brand-ink disabled:opacity-30"
            >
              تمام
            </button>
          </div>

          <p className="mt-2.5 text-[11px] leading-relaxed text-ink-mute">
            نفس الكود ممكن يتكرر بتكلفتين — دي دفعتين من أمرين تصنيع مختلفين.
          </p>
        </Card>

        {/* -------------------------------- السطور -------------------------------- */}
        <Card className="overflow-hidden">
          {rows.length === 0 ? (
            <Empty>لسه مدخّلتش حاجة</Empty>
          ) : (
            rows.map((r, i) => (
              <div key={r.id}>
                {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="num w-11 shrink-0 text-[16px] font-bold">{r.code}</span>
                  <span className="flex-1 text-[14px]">
                    <Num value={r.pieces} className="font-semibold" />{" "}
                    <span className="text-ink-mute">قطعة</span>
                  </span>
                  <Money value={r.cost} decimals className="text-[14px] font-semibold" />
                  <button
                    type="button"
                    onClick={() => setRows((v) => v.filter((x) => x.id !== r.id))}
                    aria-label="تراجع عن السطر"
                    className="press -me-1 grid size-8 place-items-center rounded-full text-ink-mute active:bg-sunken"
                  >
                    <Undo2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </Card>

        {/* -------------------------------- الاعتماد -------------------------------- */}
        <Link href="/setup" className="press mt-4 block">
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-card py-3.5 text-[15px] font-bold text-ink-soft">
            <Check size={18} />
            خلصت — اعتماد الجرد
          </div>
        </Link>

        <p className="mt-3 px-1 text-[12px] leading-relaxed text-ink-mute">
          السطور بتتحفظ أول بأول، تقدر تقفل وترجع تكمّل. الاعتماد بيقيّدها كلها مرة
          واحدة.
        </p>
      </Page>
    </>
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
  autoFocus,
}: {
  ref: React.RefObject<HTMLInputElement | null>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter: () => void;
  width: string;
  placeholder: string;
  autoFocus?: boolean;
}) {
  return (
    <label className={`${width} block`}>
      <span className="mb-1 block text-[11px] text-ink-mute">{label}</span>
      <input
        ref={ref}
        value={value}
        autoFocus={autoFocus}
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

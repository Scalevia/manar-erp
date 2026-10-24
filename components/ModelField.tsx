"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Hash, Type } from "lucide-react";
import { latinDigits } from "@/lib/format";
import { findModel, searchModels, type Model } from "@/lib/mock";

/**
 * خانة الموديل في كل شاشات الإدخال — بالكود أو بالاسم (الـ spec، قسم 4).
 *
 * الكيبورد الرقمي هو الأساس لأن أغلب البضاعة بكود، وزرار «بالاسم» بيقلبه
 * لكيبورد الحروف. وهو بيكتب الاسم بتطلع الموديلات اللي شبهه، والمطابقة مبتفرقش
 * «ة/ه» و«أ/ا» و«ى/ي» — عشان نفس الموديل ميتسجلش مرتين.
 *
 * allowNew: الاستلام والشراء والتهيئة بيعملوا موديل جديد · البيع والمرتجع لأ.
 */
export function useModelField({ allowNew }: { allowNew: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [byName, setByName] = useState(false);
  // اختاره من الاقتراحات — أدق من المطابقة بالاسم لو فيه اسمين شبه بعض
  const [picked, setPicked] = useState<Model | null>(null);

  const clean = q.trim().replace(/\s+/g, " ");
  const model = picked ?? findModel(clean);
  const isNew = allowNew && !model && (byName ? clean.length >= 2 : clean.length > 0);
  // جديد بأرقام = كود جديد · بحروف = موديل بالاسم من غير كود
  const newCode = isNew && /^\d+$/.test(clean) ? Number(clean) : undefined;
  const newName = isNew && newCode === undefined ? clean : undefined;
  const suggestions = byName && clean && !model ? searchModels(clean).slice(0, 4) : [];
  // تأكيد تحت الصف بالنص التاني: الاسم لو كتب الكود، والكود لو كتب الاسم
  const other = !model ? "" : byName ? (model.code?.toString() ?? "") : (model.name ?? "");

  function change(v: string) {
    setPicked(null);
    setQ(byName ? v : latinDigits(v).replace(/\D/g, ""));
  }

  /** الكيبورد بيتغير بس لما الخانة تاخد الفوكس من جديد — فبنثبّت الحالة الأول */
  function toggle() {
    flushSync(() => {
      setByName((v) => !v);
      setQ("");
      setPicked(null);
    });
    ref.current?.blur();
    ref.current?.focus();
  }

  function pick(m: Model) {
    setPicked(m);
    setQ(m.name ?? String(m.code));
  }

  /** بعد إضافة السطر: نفضّي ونرجع لأول خانة — والكيبورد مبيقفلش */
  function reset() {
    setQ("");
    setPicked(null);
    ref.current?.focus();
  }

  // الـ ref لوحده بره الحالة — React مبيسمحش نقرا من object فيه ref وقت الرسم
  const state = { q, byName, model, isNew, newCode, newName, suggestions, other, change, toggle, pick, reset };
  return [state, ref] as const;
}

export type ModelFieldState = ReturnType<typeof useModelField>[0];

const fieldClass =
  "h-11 w-full rounded-xl border border-line bg-page px-2.5 text-[16px] font-semibold outline-none placeholder:font-normal placeholder:text-ink-mute/50 focus:border-brand";

/** الخانة نفسها — بالاسم بتاخد مساحة أكبر في الصف */
export function ModelInput({
  field,
  inputRef,
  onEnter,
  placeholder = "214",
  autoFocus,
}: {
  field: ModelFieldState;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onEnter: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className={`block ${field.byName ? "min-w-0 flex-1" : "w-20"}`}>
      <span className="mb-1 block text-[11px] text-ink-mute">{field.byName ? "اسم الموديل" : "موديل"}</span>
      <input
        ref={inputRef}
        value={field.q}
        autoFocus={autoFocus}
        onChange={(e) => field.change(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          e.preventDefault();
          // Enter على اسم ناقص = أول اقتراح
          if (!field.model && field.suggestions[0]) field.pick(field.suggestions[0]);
          onEnter();
        }}
        inputMode={field.byName ? "text" : "numeric"}
        enterKeyHint="next"
        placeholder={field.byName ? "طقم ولادي" : placeholder}
        aria-label={field.byName ? "اسم الموديل" : "كود الموديل"}
        className={`${fieldClass} ${field.byName ? "text-start" : "num text-center"}`}
      />
    </label>
  );
}

/** «بالاسم» ↔ «بالكود» — تحت الصف */
export function ModelModeToggle({ field }: { field: ModelFieldState }) {
  return (
    <button
      type="button"
      onClick={field.toggle}
      className="press flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-semibold text-brand"
    >
      {field.byName ? <Hash size={13} /> : <Type size={13} />}
      {field.byName ? "بالكود" : "بالاسم"}
    </button>
  );
}

/** الموديلات اللي اسمها شبه اللي بيتكتب — دوسة تختاره وتنقل للعدد */
export function ModelSuggestions({ field, onPicked }: { field: ModelFieldState; onPicked: () => void }) {
  if (field.suggestions.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {field.suggestions.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => {
            field.pick(m);
            onPicked();
          }}
          className="press rounded-full border border-line bg-card px-3 py-1.5 text-[13px] font-semibold"
        >
          {m.name}
          {m.code !== undefined && <span className="num ms-1.5 text-ink-mute">{m.code}</span>}
        </button>
      ))}
    </div>
  );
}

/** «مفيش موديل…» — للبيع والمرتجع (مفيش موديل جديد هناك) */
export function notFoundText(field: ModelFieldState) {
  if (!field.q || field.model || field.suggestions.length > 0) return null;
  return field.byName ? "مفيش موديل بالاسم ده" : "مفيش موديل بالكود ده";
}

/** «كود جديد…» / «اسم جديد…» — للاستلام والشراء والتهيئة */
export function newModelText(field: ModelFieldState) {
  if (!field.isNew || field.suggestions.length > 0) return null;
  return field.newCode !== undefined ? "كود جديد — هيتعمل موديل جديد" : "اسم جديد — هيتعمل موديل من غير كود";
}

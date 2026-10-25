"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Card, Money, Page, PageHeader } from "@/components/ui";
import { formatPhone, isEgyptMobile, normalizeArabic, p } from "@/lib/format";
import { parties, TODAY, type PartyKind } from "@/lib/mock";

/**
 * فتح حساب من شاشة الحسابات — لعميل أو مصنع أو تاجر قبل أول عملية معاه، أو حد
 * من الدفتر القديم عليه أو ليه فلوس من قبل البرنامج.
 *
 * الحسابات لسه بتتفتح من جوه العمليات كمان («عميل جديد» في البيع، «مصنع جديد» في
 * أمر التصنيع ...) — دي مش بديل، دي لما يحب يفتحه الأول.
 * السلفة مش هنا: ليها شاشتها، لأنها فلوس بتتحرك من الخزنة.
 */

export type OpenKind = Exclude<PartyKind, "person">;

/** نوعين بس — المورد بيجمع المصنع وتاجر القماش وتاجر البضاعة (الـ spec، قسم 7) */
const KINDS: { id: OpenKind; label: string; hint: string }[] = [
  { id: "customer", label: "عميل", hint: "بيشتري منك" },
  { id: "supplier", label: "مورد", hint: "مصنع أو تاجر — بتشتري منه" },
];

const kindLabel = (k: PartyKind) => KINDS.find((x) => x.id === k)?.label ?? "سلفة";

/** حساب قديم من قبل البرنامج: عليه (ليا عنده) · ليه (عليا له) */
type Old = "none" | "owes" | "owed";

export default function OpenAccount({ initialKind }: { initialKind: OpenKind }) {
  const [kind, setKind] = useState<OpenKind>(initialKind);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [old, setOld] = useState<Old>("none");
  const [amount, setAmount] = useState("");
  const [since, setSince] = useState("");
  const [saved, setSaved] = useState(false);

  const isCustomer = kind === "customer";
  const cleanName = name.trim().replace(/\s+/g, " ");
  // العميل لازم موبايل — الرقم هو اللي بيميّزه (زي «عميل جديد» في البيع). الباقي اختياري
  const phoneOk = phone === "" ? !isCustomer : isEgyptMobile(phone);
  const samePhone = isEgyptMobile(phone) ? parties.find((x) => x.phone === phone) : undefined;
  // نفس الرقم لنفس النوع = غالباً نفس الشخص → ممنوع · لنوع تاني ممكن (تاجر بيشتري منك وبتشتري منه)
  const blockedByPhone = !!samePhone && samePhone.kind === kind;
  const sameName = cleanName
    ? parties.find((x) => x.kind === kind && normalizeArabic(x.name) === normalizeArabic(cleanName))
    : undefined;

  const amountP = p(Number(amount) || 0);
  // الرصيد بإشارته: موجب = عليه · سالب = ليه
  const balance = old === "owes" ? amountP : old === "owed" ? -amountP : 0;
  const ready = cleanName.length >= 2 && phoneOk && !blockedByPhone && (old === "none" || amountP > 0);

  function reset() {
    setName("");
    setPhone("");
    setOld("none");
    setAmount("");
    setSince("");
    setSaved(false);
  }

  if (saved) {
    return (
      <>
        <PageHeader title="اتفتح" />
        <Page>
          <Card className="px-5 py-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-pos-soft text-pos">
              <Check size={28} strokeWidth={3} />
            </div>
            <div className="mt-4 text-[17px] font-bold">{cleanName}</div>
            <div className="mt-1 text-[13px] text-ink-mute">
              {kindLabel(kind)}
              {phone && (
                <>
                  {" · "}
                  <span className="num">{formatPhone(phone)}</span>
                </>
              )}
            </div>
            <div className="mt-5 border-t border-line-soft pt-4 text-[14px] font-semibold">
              <Opening balance={balance} />
            </div>
          </Card>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              href={balance < 0 ? "/accounts?tab=payable" : "/accounts"}
              className="press rounded-2xl bg-brand py-3.5 text-center text-[15px] font-bold text-brand-ink"
            >
              الحسابات
            </Link>
            <button
              type="button"
              onClick={reset}
              className="press rounded-2xl border border-line bg-card py-3.5 text-[15px] font-semibold text-ink-soft"
            >
              فتح حساب تاني
            </button>
          </div>
        </Page>
      </>
    );
  }

  const chip = (active: boolean) =>
    `press rounded-xl border px-3 py-2.5 text-start ${
      active ? "border-brand bg-brand-soft text-brand" : "border-line bg-card text-ink-soft"
    }`;

  return (
    <>
      <PageHeader title="فتح حساب" back="/accounts" />
      <Page>
        {/* ------------------------------- لمين ------------------------------- */}
        <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">حساب لمين؟</div>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {KINDS.map((k) => (
            <button key={k.id} type="button" onClick={() => setKind(k.id)} aria-pressed={kind === k.id} className={chip(kind === k.id)}>
              <div className="text-[14px] font-bold">{k.label}</div>
              <div className="mt-0.5 text-[11px] opacity-80">{k.hint}</div>
            </button>
          ))}
        </div>

        {/* ---------------------------- الاسم والموبايل ---------------------------- */}
        <Card className="mb-4 space-y-3 px-4 py-4">
          <div>
            <input
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              placeholder="الاسم"
              aria-label="الاسم"
              className="h-12 w-full rounded-xl border border-line bg-page px-3 text-[16px] outline-none placeholder:text-ink-mute/60 focus:border-brand"
            />
            {sameName && (
              <p className="mt-1.5 text-[12px] text-warn">
                فيه {kindLabel(kind)} بنفس الاسم —{" "}
                <Link href={`/accounts/${sameName.id}`} className="font-semibold text-brand underline">
                  افتح حسابه
                </Link>{" "}
                واتأكد إنه مش هو.
              </p>
            )}
          </div>
          <div>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
              inputMode="tel"
              autoComplete="tel"
              placeholder={isCustomer ? "رقم الموبايل" : "رقم الموبايل (اختياري)"}
              aria-label="رقم الموبايل"
              className="num h-12 w-full rounded-xl border border-line bg-page px-3 text-start text-[16px] outline-none placeholder:text-[14px] placeholder:text-ink-mute/60 focus:border-brand"
            />
            {phone.length === 11 && !isEgyptMobile(phone) && (
              <p className="mt-1.5 text-[12px] text-neg">الرقم لازم يبدأ بـ 010 أو 011 أو 012 أو 015.</p>
            )}
            {samePhone && (
              <p className={`mt-1.5 text-[12px] ${blockedByPhone ? "text-neg" : "text-warn"}`}>
                الرقم ده متسجل باسم {samePhone.name} ({kindLabel(samePhone.kind)}) —{" "}
                <Link href={`/accounts/${samePhone.id}`} className="font-semibold text-brand underline">
                  افتح حسابه
                </Link>
              </p>
            )}
          </div>
        </Card>

        {/* ----------------------------- حساب قديم ----------------------------- */}
        <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">
          ليه حساب قديم من قبل البرنامج؟
        </div>
        <div className="mb-3 grid grid-cols-3 gap-1 rounded-2xl bg-sunken p-1">
          {(
            [
              ["none", "لأ"],
              ["owes", "عليه فلوس"],
              ["owed", "ليه فلوس"],
            ] as [Old, string][]
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => setOld(v)}
              aria-pressed={old === v}
              className={`press rounded-xl py-2.5 text-[13px] font-bold ${old === v ? "bg-card text-ink shadow-sm" : "text-ink-mute"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {old !== "none" && (
          <Card className="mb-4 space-y-3 px-4 py-4">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold">
                {old === "owes" ? "عليه كام؟" : "ليه كام؟"}
              </span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                inputMode="decimal"
                placeholder="0"
                aria-label="المبلغ"
                className="num h-14 w-full rounded-xl border border-line bg-page px-3 text-center text-[24px] font-bold outline-none placeholder:font-normal placeholder:text-ink-mute/40 focus:border-brand"
              />
            </label>
            {/* «من إمتى» هي اللي بترتّب «مين متأخر» (الـ spec، قسم 11) */}
            {old === "owes" && (
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-semibold">
                  من إمتى؟ <span className="font-normal text-ink-mute">(اختياري)</span>
                </span>
                <input
                  type="date"
                  value={since}
                  max={TODAY}
                  onChange={(e) => setSince(e.target.value)}
                  aria-label="من إمتى"
                  className="h-12 w-full rounded-xl border border-line bg-page px-3 text-[16px] outline-none focus:border-brand"
                />
              </label>
            )}
            <p className="text-[11px] leading-relaxed text-ink-mute">
              ده رصيد افتتاحي — مش بيع ولا دفع، ومش بيلمس الخزنة. بيدخل في رأس مالك زي
              تهيئة المحل.
            </p>
          </Card>
        )}

        {ready && (
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-sunken px-4 py-3 text-[14px]">
            <span className="text-ink-soft">{cleanName}</span>
            <span className="font-bold">
              <Opening balance={balance} />
            </span>
          </div>
        )}

        <button
          type="button"
          disabled={!ready}
          onClick={() => setSaved(true)}
          className="press w-full rounded-2xl bg-brand py-4 text-[16px] font-bold text-brand-ink disabled:opacity-35"
        >
          افتح الحساب
        </button>
      </Page>
    </>
  );
}

/** الحساب هيظهر فين: عليه ← «ليا» · ليه ← «عليا» · صفر ← حساب جديد */
function Opening({ balance }: { balance: number }) {
  if (balance === 0) return <span className="text-ink-soft">حساب جديد على صفر</span>;
  if (balance > 0)
    return (
      <span className="text-pos">
        عليه <Money value={balance} /> — في «ليا»
      </span>
    );
  return (
    <span className="text-neg">
      ليه <Money value={-balance} /> — في «عليا»
    </span>
  );
}

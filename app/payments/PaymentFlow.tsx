"use client";

import { useState } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { Badge, Card, Money, Page, PageHeader } from "@/components/ui";
import { p } from "@/lib/format";
import { actions, byId, cashAccounts, isCollectFrom, paymentTitle, type Party } from "@/lib/mock";

/**
 * تحصيل أو دفع لأي حساب (العملية 7 في الـ spec).
 *
 * الرصيد في البيانات: موجب = ليا عنده · سالب = عليا له.
 * بتتفتح من حساب الشخص بس (مفيش شاشة «اختار مين» — كانت بتلخبط بين العميل
 * والمصنع). الشاشة بتفتح على العادي للنوع (العميل تحصيل، المصنع «دفعة تحت
 * الحساب»)، والعكس لينك صغير تحت. الخزنة بتزيد في التحصيل وتقل في الدفع.
 */
export default function PaymentFlow({ partyId }: { partyId: string }) {
  // نسخة من قبل الدفع — شاشة «اتحفظ» بتحسب الرصيد بعدها منها
  const [party] = useState(() => byId(partyId));
  const [saved, setSaved] = useState<{ amount: number; accountId: string; collect: boolean } | null>(null);

  if (!party || party.isCash) redirect("/accounts");

  if (saved)
    return <Saved party={party} amount={saved.amount} accountId={saved.accountId} collect={saved.collect} />;

  return (
    <PaymentForm
      party={party}
      onSave={(amount, accountId, collect) => {
        actions.pay({ partyId: party.id, collect, amount, accountId });
        setSaved({ amount, accountId, collect });
      }}
    />
  );
}

/** الرصيد بعد العملية بإشارته: موجب = عليه · سالب = ليه عندك */
const afterOf = (balance: number, amount: number, collect: boolean) => balance + (collect ? -amount : amount);

const KIND_LABEL = { customer: "عميل", supplier: "مصنع أو تاجر", person: "سلفة" } as const;

/* ============================== الشاشة ============================== */

function PaymentForm({
  party,
  onSave,
}: {
  party: Party;
  onSave: (amount: number, accountId: string, collect: boolean) => void;
}) {
  const usual = isCollectFrom(party);
  const [collect, setCollect] = useState(usual);
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState(cashAccounts[0].id);
  const [note, setNote] = useState("");

  const amountP = p(Number(amount) || 0);
  const account = cashAccounts.find((a) => a.id === accountId)!;
  const isSupplier = party.kind === "supplier";

  const before = party.balance;
  const after = afterOf(before, amountP, collect);
  // المبلغ اللي يقفل الحساب في الاتجاه ده — صفر لو الاتجاه ده بيزوّد مش بيقفل
  const toClose = collect ? Math.max(0, before) : Math.max(0, -before);
  const tooMuch = toClose > 0 && amountP > toClose;
  const accountShort = !collect && amountP > account.balance;
  const title = paymentTitle(party, collect);

  return (
    <>
      <PageHeader title={title} back={`/accounts/${party.id}`} />

      <Page>
        {/* ------------------------------ مين ------------------------------ */}
        <Card className="mb-4 px-4 py-3.5">
          <div className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-[17px] font-bold">{party.name}</span>
            <Badge tone={isSupplier ? "brand" : "neutral"}>{KIND_LABEL[party.kind]}</Badge>
          </div>
          <div className="mt-1.5 text-[13px] text-ink-soft">
            حسابه دلوقتي: <Balance party={party} value={before} />
          </div>
        </Card>

        {/* ------------------------------ المبلغ ------------------------------ */}
        <Card className="mb-4 px-4 py-4">
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-[13px] font-semibold">{collect ? "استلمت كام؟" : "دفعت كام؟"}</span>
            {toClose > 0 && (
              <button
                type="button"
                onClick={() => setAmount(String(toClose / 100))}
                className="press rounded-lg bg-brand-soft px-2.5 py-1 text-[12px] font-semibold text-brand"
              >
                الحساب كله
              </button>
            )}
          </div>
          <input
            value={amount}
            autoFocus
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            inputMode="decimal"
            enterKeyHint="done"
            placeholder="0"
            aria-label="المبلغ"
            className="num h-16 w-full rounded-xl border border-line bg-page px-3 text-center text-[28px] font-bold outline-none placeholder:font-normal placeholder:text-ink-mute/40 focus:border-brand"
          />
          {/* الدفعة للمصنع: بتسدّ اللي ليه الأول، والباقي مقدّم بيتخصم من أول شراية */}
          {isSupplier && !collect ? (
            <p className="mt-2 text-[12px] leading-relaxed text-brand">
              {toClose === 0 ? (
                <>فلوس مقدّم عنده — بتتخصم لوحدها من أول بضاعة تشتريها منه.</>
              ) : amountP > toClose ? (
                <>
                  <Money value={toClose} /> بتقفل اللي ليه، و<Money value={amountP - toClose} /> مقدّم بيتخصم من
                  أول شراية.
                </>
              ) : (
                <>بتقلل اللي ليه عندك.</>
              )}
            </p>
          ) : (
            tooMuch && (
              <p className="mt-2 text-[12px] leading-relaxed text-warn">
                {collect ? "أكتر من اللي عليه — الزيادة هتتسجل ليه عندك." : "أكتر من اللي ليه — الزيادة هتتسجل ليك عنده."}
              </p>
            )
          )}
        </Card>

        {/* ------------------------------ الخزنة ------------------------------ */}
        <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">
          {collect ? "الفلوس دخلت فين؟" : "الفلوس طلعت منين؟"}
        </div>
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
        {accountShort && (
          <p className="mb-2 px-1 text-[12px] text-warn">
            {account.name} فيه <Money value={account.balance} /> ج بس.
          </p>
        )}

        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="ملاحظة (اختياري)"
          aria-label="ملاحظة"
          className="mb-4 mt-2 h-12 w-full rounded-2xl border border-line bg-card px-4 text-[16px] outline-none placeholder:text-[14px] placeholder:text-ink-mute focus:border-brand"
        />

        {/* ---------------------------- اللي هيحصل ---------------------------- */}
        {amountP > 0 && (
          <Card className="mb-4 overflow-hidden">
            <div className="bg-sunken px-4 py-2 text-[12px] font-semibold text-ink-mute">اللي هيحصل</div>
            <div className="flex items-center justify-between border-t border-line-soft px-4 py-3">
              <span className="text-[14px] text-ink-soft">{account.name}</span>
              <span className="text-[14px]">
                <Money value={account.balance} className="text-ink-mute" />
                {"  ←  "}
                <Money
                  value={account.balance + (collect ? amountP : -amountP)}
                  className={`font-bold ${collect ? "text-pos" : "text-neg"}`}
                />
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-line-soft px-4 py-3">
              <span className="text-[14px] text-ink-soft">{party.name}</span>
              <span className="text-[14px] font-bold">
                {after === 0 ? (
                  <span className="text-pos">الحساب هيتقفل ✓</span>
                ) : (
                  <>
                    هيبقى <Balance party={party} value={after} />
                  </>
                )}
              </span>
            </div>
          </Card>
        )}

        <button
          type="button"
          disabled={amountP <= 0}
          onClick={() => onSave(amountP, accountId, collect)}
          className="press w-full rounded-2xl bg-brand py-4 text-[16px] font-bold text-brand-ink disabled:opacity-35"
        >
          حفظ {isSupplier && !collect ? "الدفعة" : collect ? "التحصيل" : "الدفع"}
        </button>

        {/* العكس نادر (المصنع رجّعلك فلوس · رجّعت للعميل فلوس) — لينك صغير مش زرار فوق */}
        <button
          type="button"
          onClick={() => setCollect((v) => !v)}
          className="press mt-4 block w-full py-2 text-center text-[13px] font-semibold text-ink-mute underline-offset-4 active:underline"
        >
          {collect !== usual
            ? `رجوع لـ «${paymentTitle(party, usual)}»`
            : isSupplier
              ? "المصنع هو اللي رجّعلك فلوس؟"
              : party.kind === "customer"
                ? "انت اللي رجّعتله فلوس؟"
                : collect
                  ? "انت اللي دفعتله؟"
                  : "هو اللي دفعلك؟"}
        </button>
      </Page>
    </>
  );
}

/**
 * موجب = عليه (ليك عنده) · سالب = ليه عندك · صفر = خالصين.
 * المصنع اللي عليه = عنده مقدّم لسه مستلمتش بيه بضاعة.
 */
function Balance({ party, value }: { party: Party; value: number }) {
  if (value === 0) return <span className="text-ink-soft">خالصين</span>;
  return value > 0 ? (
    <span className="text-pos">
      {party.kind === "supplier" ? "عنده مقدّم " : "عليه "}
      <Money value={value} />
    </span>
  ) : (
    <span className="text-neg">
      ليه عندك <Money value={-value} />
    </span>
  );
}

/* ============================== بعد الحفظ ============================== */

function Saved({
  party,
  amount,
  accountId,
  collect,
}: {
  party: Party;
  amount: number;
  accountId: string;
  collect: boolean;
}) {
  const account = cashAccounts.find((a) => a.id === accountId)!;
  const after = afterOf(party.balance, amount, collect);

  return (
    <>
      <PageHeader title="اتحفظ" />
      <Page>
        <Card className="px-5 py-8 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-pos-soft text-pos">
            <Check size={28} strokeWidth={3} />
          </div>
          <div className="mt-4 text-[15px] text-ink-soft">
            {party.kind === "supplier" && !collect
              ? `دفعة تحت الحساب لـ ${party.name}`
              : collect
                ? `استلمت من ${party.name}`
                : `دفعت لـ ${party.name}`}
          </div>
          <div className="mt-1 flex items-baseline justify-center gap-1.5">
            <Money value={amount} className={`text-[30px] font-bold ${collect ? "text-pos" : "text-neg"}`} />
            <span className="text-[14px] text-ink-mute">ج</span>
          </div>
          <div className="mt-2 text-[13px] text-ink-mute">
            {collect ? "دخلت" : "من"} {account.name}
          </div>

          <div className="mt-5 border-t border-line-soft pt-4 text-[14px] font-semibold">
            {after === 0 ? (
              <span className="text-pos">الحساب اتقفل ✓</span>
            ) : (
              <>
                حسابه دلوقتي: <Balance party={party} value={after} />
              </>
            )}
          </div>
        </Card>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href={`/accounts/${party.id}`}
            className="press rounded-2xl bg-brand py-3.5 text-center text-[15px] font-bold text-brand-ink"
          >
            كشف حسابه
          </Link>
          <Link
            href="/accounts"
            className="press rounded-2xl border border-line bg-card py-3.5 text-center text-[15px] font-semibold text-ink-soft"
          >
            الحسابات
          </Link>
        </div>
      </Page>
    </>
  );
}

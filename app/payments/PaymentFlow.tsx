"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Card, Empty, Money, Page, PageHeader, SectionTitle } from "@/components/ui";
import { p } from "@/lib/format";
import { byId, cashAccounts, isCollectFrom, payables, receivables, type Party } from "@/lib/mock";

/**
 * تحصيل من عميل أو دفع لمصنع / تاجر قماش (العملية 7 في الـ spec).
 *
 * الرصيد في البيانات: موجب = ليا عنده · سالب = عليا له.
 * تحصيل بيقلل الموجب، ودفع بيقلل السالب. الخزنة بتزيد في التحصيل وتقل في الدفع.
 */
export default function PaymentFlow({ initialPartyId }: { initialPartyId?: string }) {
  const initial = initialPartyId ? byId(initialPartyId) : undefined;
  const [party, setParty] = useState<Party | null>(initial && !initial.isCash ? initial : null);
  const [saved, setSaved] = useState<{ amount: number; accountId: string } | null>(null);

  if (party && saved)
    return <Saved party={party} amount={saved.amount} accountId={saved.accountId} />;

  if (!party) return <PickParty onPick={setParty} />;

  return (
    <PaymentForm
      party={party}
      onChange={() => setParty(null)}
      onSave={(amount, accountId) => setSaved({ amount, accountId })}
    />
  );
}

const isCollect = isCollectFrom;

/* ============================ اختيار الطرف ============================ */

function PickParty({ onPick }: { onPick: (x: Party) => void }) {
  const collect = receivables();
  const pay = payables();

  const row = (x: Party, i: number) => (
    <div key={x.id}>
      {i > 0 && <div className="ms-4 border-t border-line-soft" />}
      <button
        type="button"
        onClick={() => onPick(x)}
        className="press flex w-full items-center gap-3 px-4 py-3.5 text-start active:bg-sunken"
      >
        <span className="flex-1 truncate text-[15px] font-semibold">{x.name}</span>
        <Money
          value={Math.abs(x.balance)}
          className={`text-[15px] font-bold ${isCollect(x) ? "text-pos" : "text-neg"}`}
        />
      </button>
    </div>
  );

  return (
    <>
      <PageHeader title="تحصيل ودفع" sub="اختار العميل أو المصنع" />
      <Page>
        <SectionTitle>تحصيل — عليهم فلوس</SectionTitle>
        <Card className="mb-5 overflow-hidden">
          {collect.length === 0 ? <Empty>مفيش حد عليه فلوس</Empty> : collect.map(row)}
        </Card>

        <SectionTitle>دفع — ليهم فلوس</SectionTitle>
        <Card className="overflow-hidden">
          {pay.length === 0 ? <Empty>مفيش حد ليه فلوس</Empty> : pay.map(row)}
        </Card>
        {/* اللي حسابه صفر مش ظاهر هنا — بيتفتح من كشف حسابه */}
      </Page>
    </>
  );
}

/* ============================== الشاشة ============================== */

function PaymentForm({
  party,
  onChange,
  onSave,
}: {
  party: Party;
  onChange: () => void;
  onSave: (amount: number, accountId: string) => void;
}) {
  const collect = isCollect(party);
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState(cashAccounts[0].id);
  const [note, setNote] = useState("");

  const amountP = p(Number(amount) || 0);
  const account = cashAccounts.find((a) => a.id === accountId)!;

  // اللي عليه (تحصيل) أو اللي ليه (دفع) قبل العملية
  const owed = collect ? Math.max(0, party.balance) : Math.max(0, -party.balance);
  const after = owed - amountP;
  const tooMuch = amountP > owed && owed > 0;
  const accountShort = !collect && amountP > account.balance;

  return (
    <>
      <PageHeader
        title={collect ? "تحصيل" : "دفع"}
        sub={party.name}
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
        {/* ------------------------------- قبل ------------------------------- */}
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-sunken px-4 py-3">
          <span className="text-[13px] text-ink-soft">{collect ? "عليه دلوقتي" : "ليه عندك دلوقتي"}</span>
          <Money value={owed} className={`text-[15px] font-bold ${collect ? "text-pos" : "text-neg"}`} />
        </div>

        {/* ------------------------------ المبلغ ------------------------------ */}
        <Card className="mb-4 px-4 py-4">
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-[13px] font-semibold">{collect ? "استلمت كام؟" : "دفعت كام؟"}</span>
            {owed > 0 && (
              <button
                type="button"
                onClick={() => setAmount(String(owed / 100))}
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
          {tooMuch && (
            <p className="mt-2 text-[12px] leading-relaxed text-warn">
              {collect
                ? "أكتر من اللي عليه — الزيادة هتتسجل ليه عندك."
                : "أكتر من اللي ليه — الزيادة هتتسجل ليك عنده."}
            </p>
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
                {after > 0 ? (
                  <>
                    {collect ? "هيبقى عليه " : "هيبقى ليه "}
                    <Money value={after} />
                  </>
                ) : after === 0 ? (
                  <span className="text-pos">الحساب هيتقفل ✓</span>
                ) : (
                  <>
                    {collect ? "هيبقى ليه عندك " : "هيبقى ليك عنده "}
                    <Money value={-after} />
                  </>
                )}
              </span>
            </div>
          </Card>
        )}

        <button
          type="button"
          disabled={amountP <= 0}
          onClick={() => onSave(amountP, accountId)}
          className="press w-full rounded-2xl bg-brand py-4 text-[16px] font-bold text-brand-ink disabled:opacity-35"
        >
          {collect ? "حفظ التحصيل" : "حفظ الدفع"}
        </button>
      </Page>
    </>
  );
}

/* ============================== بعد الحفظ ============================== */

function Saved({ party, amount, accountId }: { party: Party; amount: number; accountId: string }) {
  const collect = isCollect(party);
  const account = cashAccounts.find((a) => a.id === accountId)!;
  const owed = collect ? Math.max(0, party.balance) : Math.max(0, -party.balance);
  const after = owed - amount;

  return (
    <>
      <PageHeader title="اتحفظ" />
      <Page>
        <Card className="px-5 py-8 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-pos-soft text-pos">
            <Check size={28} strokeWidth={3} />
          </div>
          <div className="mt-4 text-[15px] text-ink-soft">
            {collect ? `استلمت من ${party.name}` : `دفعت لـ ${party.name}`}
          </div>
          <div className="mt-1 flex items-baseline justify-center gap-1.5">
            <Money value={amount} className={`text-[30px] font-bold ${collect ? "text-pos" : "text-neg"}`} />
            <span className="text-[14px] text-ink-mute">ج</span>
          </div>
          <div className="mt-2 text-[13px] text-ink-mute">
            {collect ? "دخلت" : "من"} {account.name}
          </div>

          <div className="mt-5 border-t border-line-soft pt-4 text-[14px] font-semibold">
            {after > 0 ? (
              <>
                {collect ? "لسه عليه " : "لسه ليه "}
                <Money value={after} /> ج
              </>
            ) : after === 0 ? (
              <span className="text-pos">الحساب اتقفل ✓</span>
            ) : (
              <>
                {collect ? "ليه عندك " : "ليك عنده "}
                <Money value={-after} /> ج
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
            href="/payments"
            className="press rounded-2xl border border-line bg-card py-3.5 text-center text-[15px] font-semibold text-ink-soft"
          >
            تحصيل أو دفع تاني
          </Link>
        </div>
      </Page>
    </>
  );
}

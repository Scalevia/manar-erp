"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check } from "lucide-react";
import { Card, Empty, Money, Page, PageHeader, SectionTitle } from "@/components/ui";
import { p } from "@/lib/format";
import { byId, parties, type Party } from "@/lib/mock";

/**
 * المسامحة — في الاتجاهين (الـ spec، قسم 7):
 *   سامحته: عميل (أو حد سلّفته) عليه فلوس ← الدين بيقل، وبتتحسب من ربح المحل
 *   سامحني: مصنع أو تاجر قماش (أو حد استلفت منه) ← اللي عليا بيقل، وبتتحسب مكسب
 * الخزنة متتمسش في الحالتين.
 */

const REASONS = ["تقريب", "عيب في البضاعة", "خصم", "سبب تاني"];

/** فوق المبلغ ده بيسأل «متأكد؟» قبل الحفظ — عشان رقم غلط ميضيعش فلوس */
const BIG = p(1000);

export default function SettleFlow({ initialPartyId }: { initialPartyId?: string }) {
  const initial = initialPartyId ? byId(initialPartyId) : undefined;
  const [party, setParty] = useState<Party | null>(
    initial && !initial.isCash && initial.balance !== 0 ? initial : null,
  );
  const [saved, setSaved] = useState<{ amount: number; reason: string } | null>(null);

  if (party && saved) return <Saved party={party} amount={saved.amount} reason={saved.reason} />;
  if (!party) return <PickParty onPick={setParty} />;
  return <SettleForm party={party} onChange={() => setParty(null)} onSave={(amount, reason) => setSaved({ amount, reason })} />;
}

/* ============================ اختيار الطرف ============================ */

function PickParty({ onPick }: { onPick: (x: Party) => void }) {
  const owesMe = parties.filter((x) => !x.isCash && x.balance > 0);
  const iOwe = parties.filter((x) => x.balance < 0);

  const row = (x: Party, i: number) => (
    <div key={x.id}>
      {i > 0 && <div className="ms-4 border-t border-line-soft" />}
      <button
        type="button"
        onClick={() => onPick(x)}
        className="press flex w-full items-center gap-3 px-4 py-3.5 text-start active:bg-sunken"
      >
        <span className="flex-1 truncate text-[15px] font-semibold">{x.name}</span>
        <Money value={Math.abs(x.balance)} className={`text-[14px] font-bold ${x.balance > 0 ? "text-pos" : "text-neg"}`} />
      </button>
    </div>
  );

  return (
    <>
      <PageHeader title="مسامحة" sub="اختار الحساب" back="/accounts" />
      <Page>
        <SectionTitle>تسامحه — عليه فلوس</SectionTitle>
        <Card className="mb-5 overflow-hidden">{owesMe.length ? owesMe.map(row) : <Empty>مفيش</Empty>}</Card>
        <SectionTitle>يسامحك — ليه فلوس</SectionTitle>
        <Card className="overflow-hidden">{iOwe.length ? iOwe.map(row) : <Empty>مفيش</Empty>}</Card>
      </Page>
    </>
  );
}

/* ================================ الشاشة ================================ */

function SettleForm({
  party,
  onChange,
  onSave,
}: {
  party: Party;
  onChange: () => void;
  onSave: (amount: number, reason: string) => void;
}) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);

  // owesMe: أنا اللي بسامح · غير كده: هو اللي بيسامحني
  const owesMe = party.balance > 0;
  const owed = Math.abs(party.balance);
  const amountP = p(Number(amount) || 0);
  const tooMuch = amountP > owed;
  const after = owed - amountP;
  const ready = amountP > 0 && !tooMuch;

  function save() {
    if (!ready) return;
    if (amountP > BIG && !confirming) {
      setConfirming(true);
      return;
    }
    onSave(amountP, reason);
  }

  return (
    <>
      <PageHeader
        title={owesMe ? "مسامحة" : "سامحني"}
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
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-sunken px-4 py-3">
          <span className="text-[13px] text-ink-soft">{owesMe ? "عليه دلوقتي" : "ليه عندك دلوقتي"}</span>
          <Money value={owed} className={`text-[15px] font-bold ${owesMe ? "text-pos" : "text-neg"}`} />
        </div>

        {/* -------------------------------- المبلغ -------------------------------- */}
        <Card className="mb-4 px-4 py-4">
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-[13px] font-semibold">{owesMe ? "سامحته في كام؟" : "سامحك في كام؟"}</span>
            <button
              type="button"
              onClick={() => {
                setAmount(String(owed / 100));
                setConfirming(false);
              }}
              className="press rounded-lg bg-brand-soft px-2.5 py-1 text-[12px] font-semibold text-brand"
            >
              الباقي كله
            </button>
          </div>
          <input
            value={amount}
            autoFocus
            onChange={(e) => {
              setAmount(e.target.value.replace(/[^\d.]/g, ""));
              setConfirming(false);
            }}
            inputMode="decimal"
            placeholder="0"
            aria-label="مبلغ المسامحة"
            className="num h-16 w-full rounded-xl border border-line bg-page px-3 text-center text-[28px] font-bold outline-none placeholder:font-normal placeholder:text-ink-mute/40 focus:border-brand"
          />
          {tooMuch && (
            <p className="mt-2 text-[12px] text-neg">
              أكتر من {owesMe ? "اللي عليه" : "اللي ليه"} (<Money value={owed} />) — مينفعش.
            </p>
          )}
        </Card>

        {/* -------------------------------- السبب -------------------------------- */}
        <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">
          السبب <span className="font-normal">(اختياري)</span>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason(reason === r ? "" : r)}
              aria-pressed={reason === r}
              className={`press rounded-full border px-3.5 py-1.5 text-[13px] font-semibold ${
                reason === r ? "border-brand bg-brand-soft text-brand" : "border-line bg-card text-ink-mute"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* ------------------------------ اللي هيحصل ------------------------------ */}
        {ready && (
          <Card className="mb-4 overflow-hidden">
            <div className="bg-sunken px-4 py-2 text-[12px] font-semibold text-ink-mute">اللي هيحصل</div>
            <div className="flex items-center justify-between border-t border-line-soft px-4 py-3 text-[14px]">
              <span className="text-ink-soft">{party.name}</span>
              <span className="font-bold">
                {after === 0 ? (
                  <span className="text-pos">الحساب هيتقفل ✓</span>
                ) : (
                  <>
                    <Money value={owed} className="font-normal text-ink-mute" />
                    {"  ←  "}
                    <Money value={after} />
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-line-soft px-4 py-3 text-[14px]">
              <span className="text-ink-soft">الخزنة</span>
              <span className="text-ink-mute">مفيش فلوس هتتحرك</span>
            </div>
            <div className="border-t border-line-soft px-4 py-2.5 text-[11px] text-ink-mute">
              {owesMe ? "هتتحسب من ربح المحل (مسامحات)." : "هتتحسب مكسب للمحل."}
            </div>
          </Card>
        )}

        {confirming && (
          <div className="mb-3 flex items-start gap-2 rounded-2xl border border-warn/25 bg-warn-soft px-4 py-3 text-[13px] leading-relaxed text-warn">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>
              ده مبلغ كبير — <Money value={amountP} className="font-bold" /> ج. متأكد إنه مسامحة مش تحصيل؟
            </span>
          </div>
        )}

        <button
          type="button"
          disabled={!ready}
          onClick={save}
          className="press w-full rounded-2xl bg-brand py-4 text-[16px] font-bold text-brand-ink disabled:opacity-35"
        >
          {confirming ? "أيوة، متأكد — احفظ" : "حفظ المسامحة"}
        </button>
      </Page>
    </>
  );
}

/* ================================ بعد الحفظ ================================ */

function Saved({ party, amount, reason }: { party: Party; amount: number; reason: string }) {
  const owesMe = party.balance > 0;
  const after = Math.abs(party.balance) - amount;
  return (
    <>
      <PageHeader title="اتحفظت" />
      <Page>
        <Card className="px-5 py-8 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-pos-soft text-pos">
            <Check size={28} strokeWidth={3} />
          </div>
          <div className="mt-4 text-[15px] text-ink-soft">
            {owesMe ? `سامحت ${party.name}` : `${party.name} سامحك`}
            {reason && <> · {reason}</>}
          </div>
          <div className="mt-1 flex items-baseline justify-center gap-1.5">
            <Money value={amount} className="text-[30px] font-bold" />
            <span className="text-[14px] text-ink-mute">ج</span>
          </div>
          <div className="mt-5 border-t border-line-soft pt-4 text-[14px] font-semibold">
            {after === 0 ? (
              <span className="text-pos">الحساب اتقفل ✓</span>
            ) : (
              <>
                {owesMe ? "لسه عليه " : "لسه ليه "}
                <Money value={after} /> ج
              </>
            )}
          </div>
        </Card>
        <Link
          href={`/accounts/${party.id}`}
          className="press mt-4 block rounded-2xl bg-brand py-3.5 text-center text-[15px] font-bold text-brand-ink"
        >
          كشف حسابه
        </Link>
      </Page>
    </>
  );
}

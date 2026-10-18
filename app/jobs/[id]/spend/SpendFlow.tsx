"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { AccountPicker } from "@/components/AccountPicker";
import { SupplierPicker } from "@/components/SupplierPicker";
import { Card, Money, Page, PageHeader } from "@/components/ui";
import { p } from "@/lib/format";
import {
  byId,
  cashAccounts,
  costItemById,
  fabricOnHand,
  jobById,
  jobCostItems,
  jobSummary,
  jobTitle,
  ofKind,
  type Party,
} from "@/lib/mock";

/**
 * «صرفت» — أي فلوس على الأمر (الـ spec، قسم 5). الأمر بيزيد بالمبلغ كله، و:
 *   قماش من عندي:     القماش اللي في المحل يقل — الخزنة متتلمسش (دفع تمنه يوم ما اشتراه)
 *   قماش اشتريته دلوقتي: تاجر القماش ليه اللي مندفعش · الخزنة تقل باللي اتدفع
 *   مصنعية:           لمصنع الأمر لوحده — مبيسألش «لمين؟»
 *   شحن · سوست · تاني: على الأمر على طول، من خزنة — مبيسألش «لمين؟» (طلب العميل)
 */

export type Source = "stock" | "buy";

export default function SpendFlow({
  jobId,
  initialItem,
  initialSource,
}: {
  jobId: string;
  initialItem?: string;
  initialSource?: Source;
}) {
  const job = jobById(jobId)!;
  const summary = jobSummary(job);
  const jobFactory = job.factoryId ? byId(job.factoryId) : undefined;
  const onHand = fabricOnHand();
  // لو عنده قماش في المحل، الغالب إنه بيبعت منه
  const defaultSource: Source = onHand > 0 ? "stock" : "buy";

  const [itemId, setItemId] = useState(costItemById(initialItem ?? "") ? initialItem! : "");
  const [source, setSource] = useState<Source>(initialSource ?? defaultSource);
  const [supplier, setSupplier] = useState<Party | null>(null);
  // المصنعية لو الأمر لسه من غير مصنع — اللي يختاره يبقى مصنع الأمر
  const [laborFactoryId, setLaborFactoryId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [paid, setPaid] = useState("");
  const [accountId, setAccountId] = useState(cashAccounts[0].id);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  const item = costItemById(itemId);
  const fromStock = itemId === "fabric" && source === "stock";
  const buyingFabric = itemId === "fabric" && source === "buy";
  const isLabor = itemId === "labor";
  // البنود اللي ليها طرف: قماش بيتشرى، ومصنعية. الباقي كاش على الأمر على طول
  const party: Party | null = buyingFabric
    ? supplier
    : isLabor
      ? (jobFactory ?? (laborFactoryId ? byId(laborFactoryId) ?? null : null))
      : null;
  const hasParty = buyingFabric || isLabor;

  const amountP = p(Number(amount) || 0);
  const paidP = fromStock ? 0 : hasParty ? Math.min(p(Number(paid) || 0), amountP) : amountP;
  const rest = amountP - paidP;
  const account = cashAccounts.find((a) => a.id === accountId)!;
  const short = paidP > account.balance;
  const owedAfter = -(party?.balance ?? 0) + rest;
  const overStock = fromStock && amountP > onHand;
  const ready = !!item && amountP > 0 && (!hasParty || !!party);

  function pickItem(id: string) {
    setItemId(id);
    setSource(defaultSource);
    setSupplier(null);
    setPaid("");
  }

  function reset() {
    setItemId("");
    setSource(defaultSource);
    setSupplier(null);
    setLaborFactoryId(null);
    setAmount("");
    setPaid("");
    setAccountId(cashAccounts[0].id);
    setNote("");
    setSaved(false);
  }

  if (saved && item) {
    return (
      <>
        <PageHeader title="اتحفظ" />
        <Page>
          <Card className="px-5 py-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-pos-soft text-pos">
              <Check size={28} strokeWidth={3} />
            </div>
            <div className="mt-4 text-[15px] text-ink-soft">
              {item.label}
              {fromStock && " من عندي"}
              {party && <> · {party.name}</>} · {jobTitle(job)}
            </div>
            <div className="mt-1 flex items-baseline justify-center gap-1.5">
              <Money value={amountP} className="text-[30px] font-bold" />
              <span className="text-[14px] text-ink-mute">ج</span>
            </div>
            <div className="mt-5 space-y-2 border-t border-line-soft pt-4 text-[14px]">
              <Row label={`فاضل في ${jobTitle(job)}`} value={<Money value={summary.remaining + amountP} className="font-semibold" />} />
              {fromStock && <Row label="قماش عندك في المحل" value={<Money value={onHand - amountP} className="font-semibold" />} />}
              {paidP > 0 && <Row label={`دفعت من ${account.name}`} value={<Money value={paidP} className="font-semibold" />} />}
              {party && rest > 0 && (
                <Row label={`عليك لـ ${party.name}`} value={<Money value={owedAfter} className="font-bold text-neg" />} />
              )}
            </div>
          </Card>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={reset} className="press rounded-2xl bg-brand py-3.5 text-[15px] font-bold text-brand-ink">
              صرفت حاجة تانية
            </button>
            <Link
              href={`/jobs/${job.id}`}
              className="press rounded-2xl border border-line bg-card py-3.5 text-center text-[15px] font-semibold text-ink-soft"
            >
              {jobTitle(job)}
            </Link>
          </div>
        </Page>
      </>
    );
  }

  const chip = (active: boolean) =>
    `press rounded-xl border px-3.5 py-2.5 text-[14px] font-semibold ${
      active ? "border-brand bg-brand-soft text-brand" : "border-line bg-card text-ink-soft"
    }`;

  return (
    <>
      <PageHeader
        title={`صرفت على ${jobTitle(job)}`}
        sub={[jobFactory?.name, job.name].filter(Boolean).join(" · ")}
        back={`/jobs/${job.id}`}
      />
      <Page>
        {/* -------------------------------- على إيه -------------------------------- */}
        <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">على إيه؟</div>
        <div className="mb-4 flex flex-wrap gap-2">
          {jobCostItems.map((it) => (
            <button key={it.id} type="button" onClick={() => pickItem(it.id)} aria-pressed={itemId === it.id} className={chip(itemId === it.id)}>
              {it.label}
            </button>
          ))}
        </div>

        {item && (
          <>
            {/* ----------------------------- القماش منين ----------------------------- */}
            {itemId === "fabric" && (
              <>
                <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">القماش ده منين؟</div>
                <div className="mb-2 grid grid-cols-2 gap-1 rounded-2xl bg-sunken p-1">
                  {(
                    [
                      ["stock", "من عندي"],
                      ["buy", "اشتريته دلوقتي"],
                    ] as [Source, string][]
                  ).map(([s, label]) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSource(s)}
                      aria-pressed={source === s}
                      className={`press rounded-xl py-2.5 text-[14px] font-bold ${source === s ? "bg-card text-ink shadow-sm" : "text-ink-mute"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="mb-4 px-1 text-[12px] text-ink-mute">
                  {fromStock ? (
                    <>
                      عندك قماش في المحل بـ <Money value={onHand} className="font-semibold text-ink-soft" /> — اكتب قيمة
                      اللي بعته. الخزنة مش هتتلمس.
                    </>
                  ) : (
                    "اشتريته وبعته للمصنع على طول — من غير ما يعدّي على المحل."
                  )}
                </p>
              </>
            )}

            {/* -------------------------------- لمين -------------------------------- */}
            {buyingFabric && (
              <>
                <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">اشتريته من مين؟</div>
                <SupplierPicker value={supplier} onChange={setSupplier} />
              </>
            )}
            {/* المصنعية لمصنع الأمر — مبيسألش (طلب العميل). بيسأل بس لو الأمر لسه من غير مصنع */}
            {isLabor &&
              (jobFactory ? (
                <div className="mb-4 flex items-center justify-between rounded-2xl bg-sunken px-4 py-3">
                  <span className="text-[14px] font-semibold">لـ {jobFactory.name}</span>
                  <span className="text-[12px] text-ink-mute">
                    {jobFactory.balance < 0 ? (
                      <>
                        ليه دلوقتي <Money value={-jobFactory.balance} />
                      </>
                    ) : (
                      "مصنع الأمر"
                    )}
                  </span>
                </div>
              ) : (
                <>
                  <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">لأنهي مصنع؟ (هيبقى مصنع الأمر)</div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {ofKind("factory").map((f) => (
                      <button key={f.id} type="button" onClick={() => setLaborFactoryId(f.id)} aria-pressed={laborFactoryId === f.id} className={chip(laborFactoryId === f.id)}>
                        {f.name}
                      </button>
                    ))}
                  </div>
                </>
              ))}

            {/* ------------------------------- المبلغ ------------------------------- */}
            <Card className="mb-4 px-4 py-4">
              <span className="mb-1.5 block text-[13px] font-semibold">{fromStock ? "قيمة القماش اللي بعته" : "بكام؟"}</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                inputMode="decimal"
                placeholder="0"
                aria-label="المبلغ"
                className="num h-16 w-full rounded-xl border border-line bg-page px-3 text-center text-[28px] font-bold outline-none placeholder:font-normal placeholder:text-ink-mute/40 focus:border-brand"
              />
              {fromStock && onHand > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(String(onHand / 100))}
                  className="press mt-2 rounded-lg bg-brand-soft px-2.5 py-1 text-[12px] font-semibold text-brand"
                >
                  القماش كله
                </button>
              )}
              {overStock && (
                <p className="mt-2 text-[12px] text-warn">
                  ده أكتر من القماش اللي عندك (<Money value={onHand} />) — متأكد من الرقم؟
                </p>
              )}

              {hasParty && (
                <>
                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-[13px] font-semibold">دفعت كام دلوقتي؟</span>
                    {amountP > 0 && (
                      <button
                        type="button"
                        onClick={() => setPaid(String(amountP / 100))}
                        className="press rounded-lg bg-brand-soft px-2.5 py-1 text-[12px] font-semibold text-brand"
                      >
                        دفعت كله
                      </button>
                    )}
                  </div>
                  <input
                    value={paid}
                    onChange={(e) => setPaid(e.target.value.replace(/[^\d.]/g, ""))}
                    inputMode="decimal"
                    placeholder="0 — على الحساب"
                    aria-label="المدفوع"
                    className="num mt-1.5 h-12 w-full rounded-xl border border-line bg-page px-3 text-center text-[18px] font-bold outline-none placeholder:text-[14px] placeholder:font-normal placeholder:text-ink-mute/50 focus:border-brand"
                  />
                </>
              )}
              {!fromStock && (!hasParty || paidP > 0) && (
                <div className="mt-3">
                  <div className="mb-1.5 text-[12px] text-ink-mute">من أنهي خزنة؟</div>
                  <AccountPicker value={accountId} onChange={setAccountId} />
                </div>
              )}
              {short && (
                <p className="mt-2 text-[12px] text-warn">
                  {account.name} فيه <Money value={account.balance} /> ج بس.
                </p>
              )}
            </Card>

            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={itemId === "fabric" ? "ملاحظة (اختياري) — مثلاً: قطن أبيض" : "ملاحظة (اختياري)"}
              aria-label="ملاحظة"
              className="mb-4 h-12 w-full rounded-2xl border border-line bg-card px-4 text-[16px] outline-none placeholder:text-[14px] placeholder:text-ink-mute focus:border-brand"
            />

            {/* ------------------------------ اللي هيحصل ------------------------------ */}
            {ready && (
              <Card className="mb-4 overflow-hidden">
                <div className="bg-sunken px-4 py-2 text-[12px] font-semibold text-ink-mute">اللي هيحصل</div>
                <Effect label={jobTitle(job)} sub="الفلوس كلها بتدخل الأمر — مش مصروف">
                  <Money value={summary.remaining} className="font-normal text-ink-mute" />
                  {"  ←  "}
                  <Money value={summary.remaining + amountP} />
                </Effect>
                {fromStock && (
                  <Effect label="قماش عندي في المحل">
                    <Money value={onHand} className="font-normal text-ink-mute" />
                    {"  ←  "}
                    <Money value={onHand - amountP} className={overStock ? "text-warn" : ""} />
                  </Effect>
                )}
                {party && rest > 0 && (
                  <Effect label={party.name} sub="اللي مندفعش">
                    <span className="text-neg">
                      هيبقى ليه <Money value={owedAfter} />
                    </span>
                  </Effect>
                )}
                {paidP > 0 && (
                  <Effect label={account.name}>
                    <Money value={account.balance} className="font-normal text-ink-mute" />
                    {"  ←  "}
                    <Money value={account.balance - paidP} className="text-neg" />
                  </Effect>
                )}
                {fromStock && <Effect label="الخزن">مش هتتلمس</Effect>}
              </Card>
            )}
          </>
        )}

        <button
          type="button"
          disabled={!ready}
          onClick={() => setSaved(true)}
          className="press w-full rounded-2xl bg-brand py-4 text-[16px] font-bold text-brand-ink disabled:opacity-35"
        >
          حفظ
        </button>
      </Page>
    </>
  );
}

function Effect({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-line-soft px-4 py-3">
      <div className="min-w-0">
        <div className="truncate text-[14px] text-ink-soft">{label}</div>
        {sub && <div className="mt-0.5 text-[11px] text-ink-mute">{sub}</div>}
      </div>
      <span className="shrink-0 text-[14px] font-bold">{children}</span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-soft">{label}</span>
      {value}
    </div>
  );
}

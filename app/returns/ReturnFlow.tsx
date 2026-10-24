"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Check, Plus, Trash2 } from "lucide-react";
import { AccountPicker } from "@/components/AccountPicker";
import { ModelInput, ModelModeToggle, ModelSuggestions, notFoundText, useModelField } from "@/components/ModelField";
import { Card, Empty, ModelTag, Money, Num, Page, PageHeader } from "@/components/ui";
import { p } from "@/lib/format";
import { cashAccounts, jobById, jobSummary, jobTitle, modelById, ofKind, stockOf, type Party } from "@/lib/mock";

/**
 * المرتجعات (الـ spec، قسم 6 — العمليتين 5 و6):
 *   من عميل: البضاعة ترجع المخزن، والمبلغ ينزل من حسابه — أو يرجعله فلوس من خزنة
 *   للمصنع:  البضاعة تطلع من المخزن، والمبلغ ينزل من اللي عليا له بسعر شراها منه
 */

type Dir = "customer" | "factory";
type Line = { id: number; modelId: string; qty: number; price: number; jobId?: string };

const REASONS: Record<Dir, string[]> = {
  customer: ["مش ماشية معاه", "عيب", "سبب تاني"],
  factory: ["عيب في الخياطة", "عيب في القماش", "سبب تاني"],
};

export default function ReturnFlow({ initialDir, initialPartyId }: { initialDir: Dir; initialPartyId?: string }) {
  const kindOf = (d: Dir) => (d === "customer" ? "customer" : "factory");
  const list = (d: Dir) => ofKind(kindOf(d)).filter((x) => !x.isCash);
  const initial = list(initialDir).find((x) => x.id === initialPartyId) ?? null;

  const [dir, setDir] = useState<Dir>(initialDir);
  const [party, setParty] = useState<Party | null>(initial);
  const [lines, setLines] = useState<Line[]>([]);
  const [reason, setReason] = useState("");
  const [refund, setRefund] = useState(false);
  const [accountId, setAccountId] = useState(cashAccounts[0].id);
  const [saved, setSaved] = useState(false);

  const isCustomer = dir === "customer";
  const total = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const pieces = lines.reduce((s, l) => s + l.qty, 0);
  const account = cashAccounts.find((a) => a.id === accountId)!;

  // الرصيد بعد: العميل موجب (عليه) والمصنع سالب (ليه)
  const owedBefore = party ? Math.abs(party.balance) : 0;
  // للمصنع: اللي من أمر مفتوح بيرجع للأمر، والباقي (أمر مقفول) بينزل من حساب المصنع
  const toJobs = new Map<string, number>();
  let toFactory = 0;
  for (const l of isCustomer ? [] : lines) {
    const j = l.jobId ? jobById(l.jobId) : undefined;
    if (j && !j.closedAt) toJobs.set(j.id, (toJobs.get(j.id) ?? 0) + l.qty * l.price);
    else toFactory += l.qty * l.price;
  }
  const owedAfter = isCustomer ? (refund ? owedBefore : owedBefore - total) : owedBefore - toFactory;

  function switchDir(d: Dir) {
    setDir(d);
    setParty(null);
    setLines([]);
    setReason("");
    setRefund(false);
  }

  if (saved && party) {
    return (
      <>
        <PageHeader title="اتحفظ" />
        <Page>
          <Card className="px-5 py-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-pos-soft text-pos">
              <Check size={28} strokeWidth={3} />
            </div>
            <div className="mt-4 text-[15px] text-ink-soft">
              {isCustomer ? `مرتجع من ${party.name}` : `مرتجع لـ ${party.name}`}
            </div>
            <div className="mt-1 text-[17px] font-bold">
              <Num value={pieces} /> قطعة · <Money value={total} /> ج
            </div>
            <div className="mt-5 border-t border-line-soft pt-4 text-[14px] font-semibold">
              {isCustomer && refund ? (
                <>
                  رجعتله <Money value={total} /> من {account.name}
                </>
              ) : (
                <Balance value={owedAfter} customer={isCustomer} />
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

  return (
    <>
      <PageHeader title="مرتجع" sub={party?.name} back="/more" />
      <Page>
        {/* -------------------------------- الاتجاه -------------------------------- */}
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-2xl bg-sunken p-1">
          {(
            [
              ["customer", "من عميل"],
              ["factory", "للمصنع"],
            ] as [Dir, string][]
          ).map(([d, label]) => (
            <button
              key={d}
              type="button"
              onClick={() => switchDir(d)}
              aria-pressed={dir === d}
              className={`press rounded-xl py-2.5 text-[14px] font-bold ${dir === d ? "bg-card text-ink shadow-sm" : "text-ink-mute"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ---------------------------------- مين ---------------------------------- */}
        {!party ? (
          <>
            <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">
              {isCustomer ? "رجّع من مين؟" : "هترجّع لأنهي مصنع؟"}
            </div>
            <Card className="overflow-hidden">
              {list(dir).map((x, i) => (
                <div key={x.id}>
                  {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                  <button
                    type="button"
                    onClick={() => setParty(x)}
                    className="press flex w-full items-center gap-3 px-4 py-3.5 text-start active:bg-sunken"
                  >
                    <span className="flex-1 truncate text-[15px] font-semibold">{x.name}</span>
                    {x.balance !== 0 && (
                      <span className="text-[12px] text-ink-mute">
                        {x.balance > 0 ? "عليه " : "ليه "}
                        <Money value={Math.abs(x.balance)} />
                      </span>
                    )}
                  </button>
                </div>
              ))}
            </Card>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between rounded-2xl bg-sunken px-4 py-3">
              <span className="text-[13px] text-ink-soft">
                {party.name} · {isCustomer ? "عليه" : "ليه عندك"}
              </span>
              <span className="flex items-center gap-3">
                <Money value={owedBefore} className={`text-[15px] font-bold ${isCustomer ? "text-pos" : "text-neg"}`} />
                <button type="button" onClick={() => setParty(null)} className="text-[12px] font-semibold text-brand">
                  تغيير
                </button>
              </span>
            </div>

            {/* -------------------------------- السطور -------------------------------- */}
            <Card className="mb-4 overflow-hidden">
              {lines.length === 0 ? (
                <Empty>{isCustomer ? "ضيف الموديلات اللي رجعت" : "ضيف الموديلات اللي هترجع للمصنع"}</Empty>
              ) : (
                lines.map((l, i) => (
                  <div key={l.id}>
                    {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <ModelTag code={modelById(l.modelId)?.code} name={modelById(l.modelId)?.name} />
                      <span className="flex-1 text-[13px] text-ink-mute">
                        <span className="num">×{l.qty}</span> · <Money value={l.price} /> ج
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
                <AddLine dir={dir} factoryId={party.id} onAdd={(l) => setLines((v) => [...v, l])} />
              </div>
            </Card>

            {/* -------------------------------- السبب -------------------------------- */}
            <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">
              السبب <span className="font-normal">(اختياري)</span>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              {REASONS[dir].map((r) => (
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

            {/* ---------------------- العميل: ينزل من حسابه ولا فلوس؟ ---------------------- */}
            {isCustomer && (
              <>
                <div className="mb-2 grid grid-cols-2 gap-1 rounded-2xl bg-sunken p-1">
                  {[
                    [false, "ينزل من حسابه"],
                    [true, "رجعتله فلوس"],
                  ].map(([v, label]) => (
                    <button
                      key={String(v)}
                      type="button"
                      onClick={() => setRefund(v as boolean)}
                      aria-pressed={refund === v}
                      className={`press rounded-xl py-2 text-[13px] font-bold ${refund === v ? "bg-card text-ink shadow-sm" : "text-ink-mute"}`}
                    >
                      {label as string}
                    </button>
                  ))}
                </div>
                {refund && (
                  <div className="mb-4 mt-3">
                    <AccountPicker value={accountId} onChange={setAccountId} />
                  </div>
                )}
                {!refund && <div className="mb-4" />}
              </>
            )}

            {/* ------------------------------ اللي هيحصل ------------------------------ */}
            {lines.length > 0 && (
              <Card className="mb-4 overflow-hidden">
                <div className="bg-sunken px-4 py-2 text-[12px] font-semibold text-ink-mute">اللي هيحصل</div>
                <div className="flex items-center justify-between border-t border-line-soft px-4 py-3 text-[14px]">
                  <span className="text-ink-soft">المخزن</span>
                  <span className={`font-bold ${isCustomer ? "text-pos" : "text-neg"}`}>
                    <Num value={pieces} sign={isCustomer ? "+" : "−"} /> قطعة
                  </span>
                </div>
                {isCustomer && refund ? (
                  <div className="flex items-center justify-between border-t border-line-soft px-4 py-3 text-[14px]">
                    <span className="text-ink-soft">{account.name}</span>
                    <span>
                      <Money value={account.balance} className="text-ink-mute" />
                      {"  ←  "}
                      <Money value={account.balance - total} className="font-bold text-neg" />
                    </span>
                  </div>
                ) : (
                  <>
                    {[...toJobs].map(([id, amount]) => {
                      const j = jobById(id)!;
                      const before = jobSummary(j).remaining;
                      return (
                        <div key={id} className="flex items-center justify-between border-t border-line-soft px-4 py-3 text-[14px]">
                          <div>
                            <div className="text-ink-soft">{jobTitle(j)}</div>
                            <div className="mt-0.5 text-[11px] text-ink-mute">الفلوس بترجع للأمر</div>
                          </div>
                          <span>
                            <Money value={before} className="text-ink-mute" />
                            {"  ←  "}
                            <Money value={before + amount} className="font-bold" />
                          </span>
                        </div>
                      );
                    })}
                    {(isCustomer || toFactory > 0) && (
                      <div className="flex items-center justify-between border-t border-line-soft px-4 py-3 text-[14px]">
                        <span className="text-ink-soft">{party.name}</span>
                        <span className="font-bold">
                          <Balance value={owedAfter} customer={isCustomer} />
                        </span>
                      </div>
                    )}
                  </>
                )}
              </Card>
            )}

            <button
              type="button"
              disabled={lines.length === 0}
              onClick={() => setSaved(true)}
              className="press w-full rounded-2xl bg-brand py-4 text-[16px] font-bold text-brand-ink disabled:opacity-35"
            >
              حفظ المرتجع
            </button>
          </>
        )}
      </Page>
    </>
  );
}

/** owed موجب = لسه في دين بنفس الاتجاه · سالب = الاتجاه اتقلب */
function Balance({ value, customer }: { value: number; customer: boolean }) {
  if (value === 0) return <span className="text-pos">الحساب هيتقفل ✓</span>;
  if (value > 0)
    return (
      <>
        {customer ? "هيبقى عليه " : "هيبقى ليه "}
        <Money value={value} />
      </>
    );
  return (
    <>
      {customer ? "هيبقى ليه عندك " : "هيبقى عليه "}
      <Money value={-value} />
    </>
  );
}

/* ====================== إضافة سطر — الكيبورد مبيقفلش ====================== */

function AddLine({ dir, factoryId, onAdd }: { dir: Dir; factoryId: string; onAdd: (l: Line) => void }) {
  const [field, modelRef] = useModelField({ allowNew: false });
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const qtyRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);

  const model = field.model;
  const notFound = notFoundText(field);
  const isCustomer = dir === "customer";
  // للمصنع: تكلفة القطعة من آخر استلام للموديل ده من المصنع ده — ومنه بنعرف الأمر
  const batch =
    !isCustomer && model ? [...model.batches].reverse().find((b) => b.sourceId === factoryId) : undefined;
  const work = batch?.unitCost;
  const priceN = price === "" && work ? work / 100 : Number(price);
  const over = !isCustomer && model && Number(qty) > stockOf(model);
  const ready = !!model && Number(qty) > 0 && priceN > 0;

  function submit() {
    if (!ready) return;
    onAdd({ id: nextId.current++, modelId: model.id, qty: Number(qty), price: p(priceN), jobId: batch?.jobId });
    setQty("");
    setPrice("");
    field.reset();
  }

  const input = "num h-11 w-full rounded-xl border border-line bg-page px-2.5 text-center text-[16px] font-semibold outline-none placeholder:font-normal placeholder:text-ink-mute/50 focus:border-brand";

  return (
    <div className="px-4 py-3">
      <div className="flex items-end gap-2">
        <ModelInput field={field} inputRef={modelRef} onEnter={() => qtyRef.current?.focus()} />
        <label className="block w-16">
          <span className="mb-1 block text-[11px] text-ink-mute">عدد</span>
          <input ref={qtyRef} value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && priceRef.current?.focus()} inputMode="numeric" enterKeyHint="next" placeholder="10" className={input} />
        </label>
        <label className={`block ${field.byName ? "w-20" : "flex-1"}`}>
          <span className="mb-1 block text-[11px] text-ink-mute">{isCustomer ? "سعر القطعة" : "بسعر القطعة"}</span>
          <input ref={priceRef} value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && submit()} inputMode="decimal" enterKeyHint="done"
            placeholder={work ? String(work / 100) : "120"} className={input} />
        </label>
        <button type="button" onClick={submit} disabled={!ready} aria-label="إضافة السطر"
          className="press grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-brand-ink disabled:opacity-30">
          <Plus size={20} strokeWidth={2.6} />
        </button>
      </div>
      <ModelSuggestions field={field} onPicked={() => qtyRef.current?.focus()} />
      <div className="mt-2 flex min-h-[20px] items-center justify-between gap-2 text-[12px]">
        <span>
          {notFound && <span className="text-neg">{notFound}</span>}
          {model && (
            <span className="text-ink-mute">
              {field.other && `${field.other} · `}
              <Num value={stockOf(model)} /> قطعة في المحل
              {work && price === "" && <> · تكلفته <Money value={work} decimals /> ج{batch?.jobId && jobById(batch.jobId) ? <> · {jobTitle(jobById(batch.jobId)!)}</> : null}</>}
              {over && <span className="text-warn"> — أكتر من اللي عندك</span>}
            </span>
          )}
        </span>
        <ModelModeToggle field={field} />
      </div>
    </div>
  );
}

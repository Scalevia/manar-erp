"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowDown, ArrowUp, ChevronDown, Minus, Plus } from "lucide-react";
import { Badge, Card, Money, Page, PageHeader, SectionTitle } from "@/components/ui";
import { money, monthOnly, pct } from "@/lib/format";
import {
  capitalChange,
  capitalPeriods,
  openOrders,
  periodAvailable,
  shopProfit,
  STARTED,
  totals,
  type CapitalPeriod,
} from "@/lib/mock";

/** النسبة على رأس المال في أول الفترة، مش آخرها */
const growthPct = (x: CapitalPeriod) => {
  const start = totals.capital - capitalChange(x);
  return start <= 0 ? 0 : (capitalChange(x) / start) * 100;
};

export default function CapitalPage() {
  const [selected, setSelected] = useState<CapitalPeriod["id"]>("1m");
  const [showParts, setShowParts] = useState(false);

  const period = capitalPeriods.find((x) => x.id === selected)!;
  const provisional = openOrders().length > 0;

  const parts: [string, number][] = [
    ["بضاعة في المحل", totals.stockValue],
    ["قماش في المحل", totals.fabricValue],
    ["قماش عند المصانع", totals.fabricAtFactoriesValue],
    ["فلوس في الخزن", totals.liquidity],
    ["ليك في السوق", totals.receivable],
    ["عليك", -totals.payable],
  ];

  return (
    <>
      <PageHeader title="رأس مالي" back="/reports" />
      <Page>
        {/* --------------------------- الرقم الكبير --------------------------- */}
        <Card className="mb-4 overflow-hidden">
          <div className="px-5 pb-4 pt-5">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-ink-mute">كل اللي تملكه في الشغل</span>
              {provisional && <Badge tone="warn">تقريبي</Badge>}
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              {/* رقم لوحده كبير: أرقام بعرضها الطبيعي، مش عرض ثابت */}
              <span
                className="text-[48px] font-bold leading-none"
                style={{ direction: "ltr", unicodeBidi: "isolate", fontVariantNumeric: "proportional-nums" }}
              >
                {money(totals.capital)}
              </span>
              <span className="text-[16px] font-semibold text-ink-mute">ج</span>
            </div>
            {provisional && (
              <p className="mt-2.5 text-[12px] leading-relaxed text-ink-mute">
                فيه أوامر تصنيع مفتوحة — الرقم هيتظبط لما تقفلها.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowParts((v) => !v)}
            aria-expanded={showParts}
            className="press flex w-full items-center justify-between border-t border-line-soft px-5 py-3 text-[13px] font-semibold text-ink-soft active:bg-sunken"
          >
            بيتكوّن من إيه؟
            <ChevronDown size={17} className={`transition-transform ${showParts ? "rotate-180" : ""}`} />
          </button>
          {showParts && (
            <div className="border-t border-line-soft bg-sunken/50 px-5 py-2">
              {parts.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-1.5 text-[13px]">
                  <span className="text-ink-soft">{label}</span>
                  <span className="font-semibold">
                    {value < 0 && <span className="num">−</span>}
                    <Money value={Math.abs(value)} />
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ------------------------------ النمو ------------------------------ */}
        <SectionTitle>زاد ولا نقص؟</SectionTitle>
        <Card className="mb-4 overflow-hidden">
          {capitalPeriods.map((x, i) => {
            const available = periodAvailable(x);
            const change = capitalChange(x);
            const up = change >= 0;
            const active = selected === x.id && available;
            return (
              <div key={x.id}>
                {i > 0 && <div className="border-t border-line-soft" />}
                <button
                  type="button"
                  disabled={!available}
                  onClick={() => setSelected(x.id)}
                  aria-pressed={active}
                  className={`press flex w-full items-center gap-3 px-4 py-3.5 text-start ${
                    active ? "bg-brand-soft" : "active:bg-sunken"
                  }`}
                >
                  <span className={`flex-1 text-[14px] ${active ? "font-bold text-brand" : "text-ink-soft"}`}>
                    {x.label}
                  </span>
                  {available ? (
                    <>
                      <span className={`flex items-center gap-1 text-[16px] font-bold ${up ? "text-pos" : "text-neg"}`}>
                        {up ? <ArrowUp size={16} strokeWidth={2.6} /> : <ArrowDown size={16} strokeWidth={2.6} />}
                        <span className="num">{pct(Math.abs(Math.round(growthPct(x) * 10) / 10))}</span>
                      </span>
                      <span className="w-20 text-end text-[13px] text-ink-mute">
                        <span className="num">{up ? "+" : "−"}</span>
                        <Money value={Math.abs(change)} />
                      </span>
                    </>
                  ) : (
                    <span className="text-[12px] text-ink-mute">
                      محتاج وقت · شغال من {monthOnly(STARTED)}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </Card>

        {/* ------------------------------- ليه؟ ------------------------------- */}
        <Why period={period} />

        {/* ------------------------ فلوس مش مضمونة ------------------------ */}
        {totals.overdueReceivable > 0 && (
          <Link href="/accounts" className="press mb-4 block">
            <div className="flex items-start gap-3 rounded-2xl border border-warn/25 bg-warn-soft px-4 py-3.5">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warn" />
              <div className="text-[12px] leading-relaxed text-warn">
                منهم <Money value={totals.overdueReceivable} className="font-bold" /> ج عند ناس متأخرين أكتر من 3
                شهور — محسوبين في رأس مالك، بس لسه ماجوش.
              </div>
            </div>
          </Link>
        )}

        <Link href="/capital/add" className="press block">
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-card py-3.5 text-[15px] font-bold text-ink-soft">
            <Plus size={18} />
            زيادة رأس المال
          </div>
        </Link>
      </Page>
    </>
  );
}

/* ------------------------------------------------------------------ */

function Why({ period }: { period: CapitalPeriod }) {
  const change = capitalChange(period);
  const profit = shopProfit(period);
  const gross = period.sales - period.cogs;
  const up = change >= 0;

  // لما ينقص: أكبر حاجة سحبته لتحت هي اللي بنعلّم عليها
  const drags: [string, number][] = [
    ["withdrawn", period.withdrawn],
    ["expenses", period.expenses],
    ["settlements", period.settlements],
    ["loss", Math.max(0, -gross)],
  ];
  const biggest = up ? null : drags.sort((a, b) => b[1] - a[1])[0][0];

  return (
    <>
      <SectionTitle>
        ليه {up ? "زاد" : "نقص"} <Money value={Math.abs(change)} /> في {period.label}؟
      </SectionTitle>
      <Card className="mb-4 overflow-hidden">
        <Line
          label={profit >= 0 ? "المحل كسب" : "المحل خسر"}
          value={profit}
          strong
        />
        <div className="border-t border-line-soft bg-sunken/50 px-4 py-1.5">
          <Sub label="بعت بضاعة وكسبت فيها" value={gross} flag={biggest === "loss"} />
          <Sub
            label="مصاريف المحل"
            hint={period.topExpenses.map((e) => `${e.label} ${money(e.amount)}`).join(" · ")}
            value={-period.expenses}
            flag={biggest === "expenses"}
          />
          {period.settlements > 0 && (
            <Sub label="مسامحات" value={-period.settlements} flag={biggest === "settlements"} />
          )}
        </div>
        {period.added > 0 && <Line label="زيادة رأس المال" value={period.added} />}
        {period.withdrawn > 0 && (
          <Line label="خدته لنفسك" value={-period.withdrawn} flag={biggest === "withdrawn"} />
        )}
      </Card>
    </>
  );
}

function Signed({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={className}>
      <span className="num">{value >= 0 ? "+" : "−"}</span>
      <Money value={Math.abs(value)} />
    </span>
  );
}

function Line({
  label,
  value,
  strong,
  flag,
}: {
  label: string;
  value: number;
  strong?: boolean;
  flag?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between border-t border-line-soft px-4 py-3 first:border-t-0 ${flag ? "bg-neg-soft" : ""}`}>
      <span className={`flex items-center gap-2 text-[14px] ${strong ? "font-semibold" : "text-ink-soft"}`}>
        {value >= 0 ? <Plus size={14} className="text-pos" /> : <Minus size={14} className="text-neg" />}
        {label}
        {flag && <span className="text-[11px] font-semibold text-neg">← أكبر سبب</span>}
      </span>
      <Signed value={value} className={`text-[15px] ${strong ? "font-bold" : "font-semibold"}`} />
    </div>
  );
}

function Sub({
  label,
  hint,
  value,
  flag,
}: {
  label: string;
  hint?: string;
  value: number;
  flag?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <div className="min-w-0">
        <div className="text-[13px] text-ink-soft">
          {label}
          {flag && <span className="ms-2 text-[11px] font-semibold text-neg">← أكبر سبب</span>}
        </div>
        {hint && <div className="mt-0.5 truncate text-[11px] text-ink-mute">{hint}</div>}
      </div>
      <Signed value={value} className="shrink-0 text-[13px] font-semibold text-ink-soft" />
    </div>
  );
}

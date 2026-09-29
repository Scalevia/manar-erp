import Link from "next/link";
import { AlertTriangle, ArrowDown, ArrowUp, ChevronLeft, FileText, TrendingUp } from "lucide-react";
import { Badge, Card, Money, Num, Page, PageHeader, SectionTitle } from "@/components/ui";
import { pct, since } from "@/lib/format";
import {
  capitalChange,
  capitalPeriods,
  invoices,
  marginOf,
  totals,
  modelByCode,
  modelStats,
  profitOf,
  staleModels,
  stockOf,
  TODAY,
  valueOf,
  wasteByFactory,
} from "@/lib/mock";

export default function ReportsPage() {
  const profits = [...modelStats].sort((a, b) => profitOf(b) - profitOf(a));
  const stale = staleModels();
  const waste = wasteByFactory();

  const frozen = stale.reduce((s, m) => s + valueOf(m), 0);
  const capital1m = capitalPeriods.find((x) => x.id === "1m");

  return (
    <>
      <PageHeader title="التقارير" />
      <Page>
        {/* ------------------------------ رأس مالي ------------------------------ */}
        <Link href="/capital" className="press mb-3 block">
          <Card className="px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                <TrendingUp size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-bold">رأس مالي</div>
                <div className="mt-0.5 text-[12px] text-ink-mute">زاد ولا نقص، وليه</div>
              </div>
              {capital1m && (
                <span
                  className={`flex items-center gap-1 text-[15px] font-bold ${
                    capitalChange(capital1m) >= 0 ? "text-pos" : "text-neg"
                  }`}
                >
                  {capitalChange(capital1m) >= 0 ? <ArrowUp size={15} strokeWidth={2.6} /> : <ArrowDown size={15} strokeWidth={2.6} />}
                  <Money value={Math.abs(capitalChange(capital1m))} />
                </span>
              )}
              <ChevronLeft size={18} className="shrink-0 text-ink-mute" />
            </div>
            <div className="mt-3 flex items-baseline justify-between border-t border-line-soft pt-3">
              <span className="text-[12px] text-ink-mute">كل اللي تملكه في الشغل</span>
              <span className="text-[17px] font-bold">
                <Money value={totals.capital} /> ج
              </span>
            </div>
          </Card>
        </Link>

        {/* ------------------------------ الفواتير ------------------------------ */}
        <Link href="/invoices" className="press mb-6 block">
          <Card className="flex items-center gap-3 px-4 py-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
              <FileText size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-bold">الفواتير</div>
              <div className="mt-0.5 text-[12px] text-ink-mute">
                سجل كل الفواتير بالتاريخ · <Num value={invoices.length} /> فاتورة
              </div>
            </div>
            <ChevronLeft size={18} className="shrink-0 text-ink-mute" />
          </Card>
        </Link>

        {/* --------------------------- أنهي موديل بيكسب --------------------------- */}
        <SectionTitle action={<span className="text-[12px] text-ink-mute">آخر 3 شهور</span>}>
          أنهي موديل بيكسب؟
        </SectionTitle>
        <Card className="mb-6 overflow-hidden">
          {profits.map((s, i) => {
            const weak = marginOf(s) < 22;
            return (
              <div key={s.code}>
                {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                <Link href={`/inventory/${s.code}`} className="press block active:bg-sunken">
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <span className="num w-11 shrink-0 text-[16px] font-bold">
                      {s.code}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] text-ink-mute">
                        باع <Num value={s.sold} /> قطعة
                      </div>
                      <div className="mt-0.5 truncate text-[12px] text-ink-mute">
                        {modelByCode(s.code)?.name}
                      </div>
                    </div>
                    {weak && <Badge tone="warn">ضعيف</Badge>}
                    <div className="shrink-0 text-end">
                      <Money
                        value={profitOf(s)}
                        className="text-[15px] font-bold text-pos"
                      />
                      <div className="num text-[11px] text-ink-mute">
                        {pct(marginOf(s))}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </Card>

        {/* ------------------------------ الراكد ------------------------------ */}
        <SectionTitle
          action={
            <span className="text-[12px] font-semibold text-warn">
              <Money value={frozen} /> ج متجمدة
            </span>
          }
        >
          إيه اللي راكد؟
        </SectionTitle>
        <Card className="mb-6 overflow-hidden">
          {stale.map((m, i) => (
            <div key={m.code}>
              {i > 0 && <div className="ms-4 border-t border-line-soft" />}
              <Link href={`/inventory/${m.code}`} className="press block active:bg-sunken">
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <span className="num w-11 shrink-0 text-[16px] font-bold">{m.code}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px]">
                      <Num value={stockOf(m)} className="font-semibold" /> قطعة
                    </div>
                    <div className="mt-0.5 text-[12px] text-warn">
                      آخر بيعة {m.lastSale ? since(m.lastSale, new Date(TODAY)) : "مفيش"}
                    </div>
                  </div>
                  <div className="shrink-0 text-end">
                    <Money value={valueOf(m)} className="text-[15px] font-bold text-warn" />
                    <div className="text-[11px] text-ink-mute">متجمدة</div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </Card>

        {/* ------------------------ الهدر عند المصانع ------------------------ */}
        <SectionTitle>أنهي مصنع بياكل قماشي؟</SectionTitle>
        <Card className="mb-6 overflow-hidden">
          {waste.map((w, i) => {
            const bad = w.pct > 6;
            return (
              <div key={w.factoryId}>
                {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <span className="flex-1 truncate text-[14px] font-semibold">
                    {w.name}
                  </span>
                  {bad && (
                    <span className="flex items-center gap-1 text-[12px] font-semibold text-neg">
                      <AlertTriangle size={14} />
                      بياكل قماشك
                    </span>
                  )}
                  <span
                    className={`num w-14 text-end text-[16px] font-bold ${
                      bad ? "text-neg" : "text-ink"
                    }`}
                  >
                    {pct(w.pct)}
                  </span>
                </div>
              </div>
            );
          })}
        </Card>

        <p className="px-1 text-[12px] leading-relaxed text-ink-mute">
          الهدر بيتحسب لوحده من الفرق بين المتوقع واللي استلمته — من غير ما تسجّله.
        </p>
      </Page>
    </>
  );
}

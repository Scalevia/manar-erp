"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, Money, Num, Page, PageHeader, SectionTitle } from "@/components/ui";
import { dozens, shortDate, since } from "@/lib/format";
import { avgCost, byId, modelById, stockOf, TODAY, valueOf } from "@/lib/mock";

export default function ModelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const m = modelById(id);
  if (!m) notFound();

  const stock = stockOf(m);

  return (
    <>
      <PageHeader
        title={m.code !== undefined ? `موديل ${m.code}` : (m.name ?? "")}
        sub={m.code !== undefined ? m.name : "من غير كود"}
        back="/inventory"
      />

      <Page>
        {/* -------------------------------- الإجمالي -------------------------------- */}
        {stock < 0 ? (
          // بالسالب: اتباع أكتر من المتسجل — البيع مبيقفش، بس لازم الاستلام يتسجل (الـ spec، قسم 4)
          <Card className="mb-4 px-5 py-5 text-center">
            <div className="flex items-baseline justify-center gap-1.5 text-neg">
              <Num value={-stock} sign="−" className="text-[38px] font-bold leading-none" />
              <span className="text-[15px] font-semibold">قطعة</span>
            </div>
            <p className="mt-3 border-t border-line-soft pt-3 text-[13px] leading-relaxed text-ink-soft">
              اتباع منه <Num value={-stock} className="font-bold" /> قطعة مش متسجلين في المخزن. لما
              تسجّل الشراية (من المصنع أو التاجر)، السالب بيتقفل الأول.
            </p>
            <Link
              href="/inventory/buy"
              className="press mt-3 block rounded-xl bg-brand py-2.5 text-[13px] font-bold text-brand-ink"
            >
              شراء مخزون
            </Link>
          </Card>
        ) : (
          <Card className="mb-4 px-5 py-5 text-center">
            <div className="flex items-baseline justify-center gap-1.5">
              <Num value={stock} className="text-[38px] font-bold leading-none" />
              <span className="text-[15px] font-semibold text-ink-mute">قطعة</span>
            </div>
            <div className="mt-1.5 text-[13px] text-ink-mute">{dozens(stock)}</div>
            <div className="mt-3 border-t border-line-soft pt-3 text-[13px] text-ink-soft">
              القيمة <Money value={valueOf(m)} className="font-bold text-ink" /> ج ·
              متوسط التكلفة <Money value={avgCost(m)} decimals className="font-bold text-ink" /> ج
            </div>
          </Card>
        )}

        {/* -------------------------------- في المحل -------------------------------- */}
        {m.batches.length > 0 && (
          <>
            <SectionTitle>في المحل</SectionTitle>
            <Card className="mb-4 overflow-hidden">
              {m.batches.map((b, i) => (
                <div key={`${b.receivedAt}-${b.sourceId}`}>
                  {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px]">
                        <Num value={b.pieces} className="font-semibold" /> قطعة
                      </div>
                      <div className="mt-0.5 truncate text-[12px] text-ink-mute">
                        {/* كل دفعة شراية من مورد — مصنع أو تاجر (بيع وشراء، الـ spec قسم 5) */}
                        شراء <span className="num">{shortDate(b.receivedAt)}</span> · {byId(b.sourceId)?.name}
                      </div>
                    </div>
                    <div className="shrink-0 text-end">
                      <Money value={b.unitCost} decimals className="text-[15px] font-bold" />
                      <div className="text-[11px] text-ink-mute">تكلفة القطعة</div>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </>
        )}

        {/* --------------------------------- الحركة --------------------------------- */}
        <SectionTitle>الحركة</SectionTitle>
        <Card className="overflow-hidden">
          <InfoRow
            label="آخر بيعة"
            value={m.lastSale ? since(m.lastSale, new Date(TODAY)) : "مفيش"}
            warn={!m.lastSale || m.soldThisMonth === 0}
          />
          <div className="ms-4 border-t border-line-soft" />
          <InfoRow
            label="اتباع الشهر ده"
            value={<><Num value={m.soldThisMonth} /> قطعة</>}
          />
        </Card>
      </Page>
    </>
  );
}

function InfoRow({
  label,
  value,
  warn,
}: {
  label: string;
  value: React.ReactNode;
  warn?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-[14px] text-ink-soft">{label}</span>
      <span className={`text-[14px] font-semibold ${warn ? "text-warn" : "text-ink"}`}>
        {value}
      </span>
    </div>
  );
}

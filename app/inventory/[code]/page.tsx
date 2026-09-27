import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge, Card, Money, Num, Page, PageHeader, SectionTitle } from "@/components/ui";
import { dozens, since } from "@/lib/format";
import { avgCost, modelByCode, models, stockOf, TODAY, valueOf } from "@/lib/mock";

export function generateStaticParams() {
  return models.map((m) => ({ code: String(m.code) }));
}

export default async function ModelPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const m = modelByCode(Number(code));
  if (!m) notFound();

  const stock = stockOf(m);

  return (
    <>
      <PageHeader title={`موديل ${m.code}`} sub={m.name} back="/inventory" />

      <Page>
        {/* -------------------------------- الإجمالي -------------------------------- */}
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

        {/* -------------------------------- في المحل -------------------------------- */}
        <SectionTitle>في المحل</SectionTitle>
        <Card className="mb-4 overflow-hidden">
          {m.batches.map((b, i) => (
            <div key={b.orderId}>
              {i > 0 && <div className="ms-4 border-t border-line-soft" />}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="text-[15px]">
                    <Num value={b.pieces} className="font-semibold" /> قطعة
                  </div>
                  <div className="mt-0.5 truncate text-[12px] text-ink-mute">
                    {b.orderLabel}
                  </div>
                </div>
                {b.provisional && <Badge tone="warn">تكلفة مبدئية</Badge>}
                <div className="shrink-0 text-end">
                  <Money value={b.unitCost} decimals className="text-[15px] font-bold" />
                  <div className="text-[11px] text-ink-mute">تكلفة القطعة</div>
                </div>
              </div>
            </div>
          ))}
        </Card>

        {/* ----------------------------- لسه عند المصنع ----------------------------- */}
        {m.incoming > 0 && (
          <>
            <SectionTitle>لسه عند المصنع</SectionTitle>
            <Card className="mb-4 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-[15px]">
                    <Num value={m.incoming} className="font-semibold" /> قطعة
                  </div>
                  <div className="mt-0.5 text-[12px] text-ink-mute">
                    متوقعة — التكلفة تتظبط لما أمر التصنيع يقفل
                  </div>
                </div>
                <Link
                  href="/production"
                  className="press shrink-0 rounded-xl bg-sunken px-3 py-2 text-[13px] font-semibold text-ink-soft"
                >
                  أمر التصنيع
                </Link>
              </div>
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

import { AlertTriangle, Lock } from "lucide-react";
import { Badge, Card, Money, Num, Page, PageHeader, SectionTitle } from "@/components/ui";
import { pct, since } from "@/lib/format";
import {
  actualCost,
  byId,
  orders,
  provisionalCost,
  TODAY,
  wastePct,
  type ProductionOrder,
} from "@/lib/mock";

export default function ProductionPage() {
  const open = orders.filter((o) => o.status === "open");
  const closed = orders.filter((o) => o.status === "closed");

  return (
    <>
      <PageHeader
        title="أوامر التصنيع"
        sub={`${open.length} مفتوحة · ${closed.length} مقفولة`}
      />
      <Page>
        {open.length > 0 && (
          <>
            <SectionTitle>مفتوحة</SectionTitle>
            <div className="mb-5 space-y-3">
              {open.map((o) => (
                <OrderCard key={o.id} o={o} />
              ))}
            </div>
          </>
        )}

        <SectionTitle>مقفولة</SectionTitle>
        <div className="space-y-3">
          {closed.map((o) => (
            <OrderCard key={o.id} o={o} />
          ))}
        </div>
      </Page>
    </>
  );
}

function OrderCard({ o }: { o: ProductionOrder }) {
  const factory = byId(o.factoryId);
  const isOpen = o.status === "open";
  const cost = isOpen ? provisionalCost(o) : actualCost(o);
  const remaining = o.receivedGood - o.sold;
  const stuck = remaining * actualCost(o);

  return (
    <Card className="overflow-hidden">
      {/* ------------------------------ العنوان ------------------------------ */}
      <div className="flex items-start gap-3 px-4 pb-3 pt-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold">{o.label}</span>
            {isOpen ? (
              <Badge tone="warn">مفتوح</Badge>
            ) : (
              <Badge tone="neutral">مقفول</Badge>
            )}
          </div>
          <div className="mt-0.5 text-[12px] text-ink-mute">
            {factory?.name} · موديل <span className="num">{o.modelCode}</span> ·{" "}
            {since(o.openedAt, new Date(TODAY))}
          </div>
        </div>
      </div>

      {/* ------------------------------ الأرقام ------------------------------ */}
      <div className="grid grid-cols-3 gap-px bg-line-soft">
        <Cell label="متوقع" value={o.expectedPieces} />
        <Cell label="استلمت" value={o.receivedGood} />
        <Cell
          label={isOpen ? "فاضل جاي" : "فاضل في المحل"}
          value={isOpen ? Math.max(0, o.expectedPieces - o.receivedGood) : remaining}
          tone={isOpen ? "brand" : undefined}
        />
      </div>

      {/* ------------------------------ التكلفة ------------------------------ */}
      <div className="space-y-2 px-4 py-3.5 text-[13px]">
        <Line label="قماش" value={<Money value={o.fabricCost} />} />
        <Line
          label={`مصنعية (${o.receivedGood > 0 ? o.receivedGood : o.expectedPieces} × ${o.workPerPiece / 100})`}
          value={
            <Money
              value={(isOpen ? o.expectedPieces : o.receivedGood) * o.workPerPiece}
            />
          }
        />
        <Line label="مصاريف" value={<Money value={o.extras} />} />

        <div className="flex items-center justify-between border-t border-line-soft pt-2.5">
          <span className="font-semibold">
            {isOpen ? "تكلفة القطعة (مبدئية)" : "تكلفة القطعة"}
          </span>
          <span
            className={`text-[16px] font-bold ${isOpen ? "text-warn" : "text-ink"}`}
          >
            <Money value={cost} decimals /> ج
          </span>
        </div>

        {!isOpen && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-ink-soft">الهدر</span>
              <span className="num font-semibold text-ink-soft">
                {pct(wastePct(o))}
              </span>
            </div>
            {remaining > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-ink-soft">فلوس متجمدة</span>
                <span className="font-semibold text-warn">
                  <Money value={stuck} /> ج
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* ------------------------------- الإجراء ------------------------------- */}
      {isOpen && (
        <div className="border-t border-line-soft bg-warn-soft/60 px-4 py-3">
          <div className="mb-2.5 flex items-start gap-2 text-[12px] leading-snug text-warn">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span>
              التكلفة لسه مبدئية. لما تستلم الباقي واتقفل، هتتظبط لوحدها والأرباح
              تتصحح.
            </span>
          </div>
          <button
            type="button"
            className="press flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-[14px] font-bold text-brand-ink"
          >
            <Lock size={16} />
            قفل أمر التصنيع
          </button>
        </div>
      )}
    </Card>
  );
}

function Cell({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "brand";
}) {
  return (
    <div className="bg-card px-3 py-3 text-center">
      <Num
        value={value}
        className={`block text-[19px] font-bold ${tone === "brand" ? "text-brand" : ""}`}
      />
      <div className="mt-0.5 text-[11px] text-ink-mute">{label}</div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-mute">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, Money, Page, PageHeader, SectionTitle } from "@/components/ui";
import { shortDate } from "@/lib/format";
import { byId, fabricAtFactories, fabricMoves, totals, type FabricMove } from "@/lib/mock";

const KIND: Record<FabricMove["kind"], string> = {
  start: "كان موجود",
  buy: "اشتريت",
  send: "بعت لمصنع",
  return: "رجع من مصنع",
};

/** القماش بالفلوس بس — من غير أمتار ولا أنواع (الـ spec، قسم 4) */
export default function FabricPage() {
  const atFactories = fabricAtFactories();
  const moves = [...fabricMoves].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHeader
        title="القماش"
        back="/more"
        action={
          <Link
            href="/purchases/new"
            className="press flex items-center gap-1 rounded-xl bg-brand px-3 py-1.5 text-[13px] font-bold text-brand-ink"
          >
            <Plus size={16} strokeWidth={2.6} />
            شراء
          </Link>
        }
      />
      <Page>
        {/* ------------------------------ الرقمين ------------------------------ */}
        <Card className="mb-5 overflow-hidden">
          <div className="grid grid-cols-2 gap-px bg-line-soft">
            <div className="bg-card px-4 py-4">
              <div className="text-[12px] text-ink-mute">قماش في المحل</div>
              <div className="mt-1 text-[22px] font-bold">
                <Money value={totals.fabricValue} /> <span className="text-[13px] text-ink-mute">ج</span>
              </div>
            </div>
            <div className="bg-card px-4 py-4">
              <div className="text-[12px] text-ink-mute">قماش عند المصانع</div>
              <div className="mt-1 text-[22px] font-bold">
                <Money value={totals.fabricAtFactoriesValue} /> <span className="text-[13px] text-ink-mute">ج</span>
              </div>
            </div>
          </div>
        </Card>

        {/* -------------------------- عند المصانع -------------------------- */}
        {atFactories.length > 0 && (
          <>
            <SectionTitle>عند المصانع دلوقتي</SectionTitle>
            <Card className="mb-5 overflow-hidden">
              {atFactories.map((f, i) => (
                <div key={f.orderId}>
                  {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                  <Link href="/production" className="press block active:bg-sunken">
                    <div className="flex items-center gap-3 px-4 py-3.5">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[14px] font-semibold">{byId(f.factoryId)?.name}</div>
                        <div className="mt-0.5 text-[12px] text-ink-mute">{f.label}</div>
                      </div>
                      <Money value={f.amount} className="text-[15px] font-bold" />
                    </div>
                  </Link>
                </div>
              ))}
            </Card>
          </>
        )}

        {/* ------------------------------- الحركة ------------------------------- */}
        <SectionTitle>الحركة</SectionTitle>
        <Card className="overflow-hidden">
          {moves.map((m, i) => {
            const out = m.kind === "send";
            return (
              <div key={m.id}>
                {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="num w-10 shrink-0 text-[12px] text-ink-mute">{shortDate(m.date)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold">{KIND[m.kind]}</div>
                    <div className="mt-0.5 truncate text-[12px] text-ink-mute">{m.label}</div>
                  </div>
                  <span className={`text-[14px] font-bold ${out ? "text-ink-soft" : "text-pos"}`}>
                    <span className="num">{out ? "−" : "+"}</span>
                    <Money value={m.amount} />
                  </span>
                </div>
              </div>
            );
          })}
        </Card>

        <p className="mt-3 px-1 text-[12px] leading-relaxed text-ink-mute">
          القماش بيتحسب بالفلوس بس. لما تبعت قماش لمصنع، بيتسجل في أمر التصنيع وبيدخل في تكلفة القطعة.
        </p>
      </Page>
    </>
  );
}

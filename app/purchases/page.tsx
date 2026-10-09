import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge, Card, Money, Page, PageHeader } from "@/components/ui";
import { monthName, shortDate } from "@/lib/format";
import { byId, purchases, type Purchase } from "@/lib/mock";

/** تجميع بالشهر — الشهر الحالي فوق */
function byMonth(rows: Purchase[]) {
  const groups = new Map<string, Purchase[]>();
  for (const r of [...rows].sort((a, b) => b.date.localeCompare(a.date))) {
    const key = r.date.slice(0, 7);
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  return [...groups.entries()];
}

function PaidBadge({ r }: { r: Purchase }) {
  if (r.paid >= r.amount) return <Badge tone="pos">دفعت كله</Badge>;
  if (r.paid > 0)
    return (
      <Badge tone="warn">
        دفعت <Money value={r.paid} />
      </Badge>
    );
  return <Badge tone="neutral">على الحساب</Badge>;
}

export default function PurchasesPage() {
  const groups = byMonth(purchases);

  return (
    <>
      <PageHeader
        title="شراء قماش"
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
        <div className="space-y-5">
          {groups.map(([key, rows]) => (
            <div key={key}>
              <div className="mb-2 flex items-baseline justify-between px-1">
                <h2 className="text-[13px] font-semibold text-ink-mute">{monthName(rows[0].date)}</h2>
                <Money value={rows.reduce((s, r) => s + r.amount, 0)} className="text-[13px] font-bold" />
              </div>

              <Card className="overflow-hidden">
                {rows.map((r, i) => (
                  <div key={r.id}>
                    {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                    <Link href={`/accounts/${r.supplierId}`} className="press block active:bg-sunken">
                      <div className="flex items-center gap-3 px-4 py-3.5">
                        <span className="num w-9 shrink-0 text-[12px] text-ink-mute">{shortDate(r.date)}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-[14px] font-semibold">{byId(r.supplierId)?.name}</span>
                            <PaidBadge r={r} />
                          </div>
                          {r.note && <div className="mt-0.5 truncate text-[12px] text-ink-mute">{r.note}</div>}
                        </div>
                        <Money value={r.amount} className="text-[15px] font-bold" />
                      </div>
                    </Link>
                  </div>
                ))}
              </Card>
            </div>
          ))}
        </div>
      </Page>
    </>
  );
}

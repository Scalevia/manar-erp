import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge, Card, Money, Page, PageHeader } from "@/components/ui";
import { monthName, shortDate } from "@/lib/format";
import { byId, fabricBuys, jobById, jobCosts, jobTitle } from "@/lib/mock";

/** شراية قماش — للمحل، أو لأمر على طول */
type Buy = { id: string; date: string; supplierId: string; amount: number; paid: number; note?: string; to: string; href: string };

/** تجميع بالشهر — الشهر الحالي فوق */
function byMonth(rows: Buy[]) {
  const groups = new Map<string, Buy[]>();
  for (const r of [...rows].sort((a, b) => b.date.localeCompare(a.date))) {
    const key = r.date.slice(0, 7);
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  return [...groups.entries()];
}

function PaidBadge({ r }: { r: Buy }) {
  if (r.paid >= r.amount) return <Badge tone="pos">دفعت كله</Badge>;
  if (r.paid > 0)
    return (
      <Badge tone="warn">
        دفعت <Money value={r.paid} />
      </Badge>
    );
  return <Badge tone="neutral">على الحساب</Badge>;
}

/**
 * شراء قماش — سجل بس (الـ spec، قسم 10): كل قماش اشتراه، سواء شاله في المحل
 * أو بعته لأمر على طول. «من عندي» مش شراية — دي في شاشة القماش.
 */
export default function PurchasesPage() {
  const rows: Buy[] = [
    ...fabricBuys.map((b): Buy => ({ ...b, to: "للمحل", href: "/fabric" })),
    ...jobCosts
      .filter((c) => c.itemId === "fabric" && !c.fromStock && c.partyId)
      .map((c): Buy => {
        const job = jobById(c.jobId)!;
        return {
          id: c.id, date: c.date, supplierId: c.partyId!, amount: c.amount, paid: c.paid, note: c.note,
          to: `لـ ${jobTitle(job)} · ${byId(job.factoryId ?? "")?.name ?? "لسه من غير مصنع"}`,
          href: `/jobs/${job.id}`,
        };
      }),
  ];

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
          {byMonth(rows).map(([key, group]) => (
            <div key={key}>
              <div className="mb-2 flex items-baseline justify-between px-1">
                <h2 className="text-[13px] font-semibold text-ink-mute">{monthName(group[0].date)}</h2>
                <Money value={group.reduce((s, r) => s + r.amount, 0)} className="text-[13px] font-bold" />
              </div>
              <Card className="overflow-hidden">
                {group.map((r, i) => (
                  <div key={r.id}>
                    {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                    <Link href={r.href} className="press block active:bg-sunken">
                      <div className="flex items-center gap-3 px-4 py-3.5">
                        <span className="num w-9 shrink-0 text-[12px] text-ink-mute">{shortDate(r.date)}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-[14px] font-semibold">{byId(r.supplierId)?.name}</span>
                            <PaidBadge r={r} />
                          </div>
                          <div className="mt-0.5 truncate text-[12px] text-ink-mute">
                            {r.to}
                            {r.note && <> · {r.note}</>}
                          </div>
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

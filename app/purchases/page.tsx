import { Card, Money, Num, Page, PageHeader } from "@/components/ui";
import { monthName, shortDate } from "@/lib/format";
import { purchases, type Purchase } from "@/lib/mock";

/** تجميع بالشهر — الافتراضي إن الشهر الحالي فوق */
function byMonth(rows: Purchase[]) {
  const groups = new Map<string, Purchase[]>();
  for (const r of [...rows].sort((a, b) => +new Date(b.date) - +new Date(a.date))) {
    const key = r.date.slice(0, 7);
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  return [...groups.entries()];
}

export default function PurchasesPage() {
  const groups = byMonth(purchases);

  return (
    <>
      <PageHeader title="المشتريات" />
      <Page>
        <div className="space-y-5">
          {groups.map(([key, rows]) => {
            const total = rows.reduce((s, r) => s + r.amount, 0);
            return (
              <div key={key}>
                <div className="mb-2 flex items-baseline justify-between px-1">
                  <h2 className="text-[13px] font-semibold text-ink-mute">
                    {monthName(rows[0].date)}
                  </h2>
                  <Money value={total} className="text-[13px] font-bold" />
                </div>

                <Card className="overflow-hidden">
                  {rows.map((r, i) => (
                    <div key={r.id}>
                      {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                      <div className="flex items-center gap-3 px-4 py-3.5">
                        <span className="num w-9 shrink-0 text-[12px] text-ink-mute">
                          {shortDate(r.date)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[14px] font-medium">
                            {r.what}
                            {r.meters && (
                              <span className="text-ink-mute">
                                {" "}
                                · <Num value={r.meters} /> م
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 truncate text-[12px] text-ink-mute">
                            {r.supplierName}
                          </div>
                        </div>
                        <Money value={r.amount} className="text-[15px] font-bold" />
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            );
          })}
        </div>
      </Page>
    </>
  );
}

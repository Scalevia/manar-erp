import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge, Card, Money, Page, PageHeader } from "@/components/ui";
import { monthOnly } from "@/lib/format";
import {
  cashAccounts,
  categoryById,
  expenses,
  orders,
  TODAY,
  type Expense,
} from "@/lib/mock";

const DAYS = ["الحد", "الاتنين", "التلات", "الأربع", "الخميس", "الجمعة", "السبت"];

function dayLabel(iso: string) {
  if (iso === TODAY) return "النهاردة";
  const d = new Date(iso);
  return `${DAYS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
}

const isPersonal = (e: Expense) => !!categoryById(e.categoryId)?.personal;

export default function ExpensesPage() {
  const month = TODAY.slice(0, 7);
  const thisMonth = expenses.filter((e) => e.date.startsWith(month));

  // مصاريف المحل بس: السحب الشخصي بيتعرض لوحده، واللي على أمر تصنيع بيروح على
  // تكلفة الأمر ده — الاتنين مش بيقللوا ربح المحل
  const isShop = (e: Expense) => !isPersonal(e) && !e.orderId;
  const today = thisMonth.filter((e) => e.date === TODAY && isShop(e));
  const work = thisMonth.filter(isShop);
  const personal = thisMonth.filter(isPersonal);
  const onOrders = thisMonth.filter((e) => e.orderId);

  const sum = (rows: Expense[]) => rows.reduce((s, e) => s + e.amount, 0);

  const days = new Map<string, Expense[]>();
  for (const e of [...thisMonth].sort((a, b) => b.date.localeCompare(a.date))) {
    days.set(e.date, [...(days.get(e.date) ?? []), e]);
  }

  return (
    <>
      <PageHeader
        title="المصاريف"
        sub={monthOnly(TODAY)}
        action={
          <Link
            href="/expenses/new"
            className="press flex items-center gap-1 rounded-xl bg-brand px-3 py-1.5 text-[13px] font-bold text-brand-ink"
          >
            <Plus size={16} strokeWidth={2.6} />
            مصروف
          </Link>
        }
      />

      <Page>
        {/* -------------------------------- الملخص -------------------------------- */}
        <Card className="mb-5 overflow-hidden">
          <div className="grid grid-cols-2 gap-px bg-line-soft">
            <div className="bg-card px-4 py-3.5">
              <div className="text-[12px] text-ink-mute">النهاردة</div>
              <Money value={sum(today)} className="mt-1 block text-[20px] font-bold" />
            </div>
            <div className="bg-card px-4 py-3.5">
              <div className="text-[12px] text-ink-mute">الشهر ده</div>
              <Money value={sum(work)} className="mt-1 block text-[20px] font-bold" />
            </div>
          </div>
          {onOrders.length > 0 && (
            <div className="flex items-center justify-between border-t border-line-soft px-4 py-3">
              <div>
                <div className="text-[13px] text-ink-soft">على أوامر تصنيع الشهر ده</div>
                <div className="mt-0.5 text-[11px] text-ink-mute">اتضافت على تكلفة القطعة، مش مصاريف محل</div>
              </div>
              <Money value={sum(onOrders)} className="text-[15px] font-bold" />
            </div>
          )}
          {personal.length > 0 && (
            <div className="flex items-center justify-between border-t border-line-soft px-4 py-3">
              <div>
                <div className="text-[13px] text-ink-soft">خدته لنفسك الشهر ده</div>
                <div className="mt-0.5 text-[11px] text-ink-mute">فلوس خرجت من الدرج ليك، مش على المحل</div>
              </div>
              <Money value={sum(personal)} className="text-[15px] font-bold" />
            </div>
          )}
        </Card>

        {/* -------------------------------- الأيام -------------------------------- */}
        <div className="space-y-5">
          {[...days.entries()].map(([date, rows]) => (
            <div key={date}>
              <div className="mb-2 flex items-baseline justify-between px-1">
                <h2 className="text-[13px] font-semibold text-ink-mute">{dayLabel(date)}</h2>
                <Money value={sum(rows)} className="text-[13px] font-bold text-ink-soft" />
              </div>
              <Card className="overflow-hidden">
                {rows.map((e, i) => {
                  const cat = categoryById(e.categoryId);
                  const order = e.orderId ? orders.find((o) => o.id === e.orderId) : undefined;
                  return (
                    <div key={e.id}>
                      {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                      <div className="flex items-center gap-3 px-4 py-3.5">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-[14px] font-semibold">{cat?.label}</span>
                            {cat?.personal && <Badge tone="neutral">شخصي</Badge>}
                            {order && (
                              <Badge tone="brand">
                                {order.label} · <span className="num">{order.modelCode}</span>
                              </Badge>
                            )}
                          </div>
                          <div className="mt-0.5 truncate text-[12px] text-ink-mute">
                            {[e.note, cashAccounts.find((a) => a.id === e.accountId)?.name]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>
                        </div>
                        <Money value={e.amount} className="text-[15px] font-bold text-neg" />
                      </div>
                    </div>
                  );
                })}
              </Card>
            </div>
          ))}
        </div>
      </Page>
    </>
  );
}

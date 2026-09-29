"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Badge, Card, Empty, Money, Num, Page, PageHeader } from "@/components/ui";
import { monthOnly } from "@/lib/format";
import {
  byId,
  invoiceKind,
  invoicePieces,
  invoices,
  invoiceTotal,
  TODAY,
  type Invoice,
} from "@/lib/mock";

type Filter = "all" | "credit" | "cash";

const KIND: Record<ReturnType<typeof invoiceKind>, { label: string; tone: "pos" | "warn" | "neutral" }> = {
  cash: { label: "نقدي", tone: "pos" },
  partial: { label: "جزئي", tone: "warn" },
  credit: { label: "آجل", tone: "neutral" },
};

const DAYS = ["الحد", "الاتنين", "التلات", "الأربع", "الخميس", "الجمعة", "السبت"];

function dayLabel(iso: string) {
  if (iso === TODAY) return "النهاردة";
  const d = new Date(iso);
  return `${DAYS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
}

const partyName = (inv: Invoice) => {
  const x = byId(inv.partyId);
  return x?.isCash ? "بيع نقدي" : (x?.name ?? "");
};

export default function InvoicesPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const list = useMemo(() => {
    const term = q.trim();
    return [...invoices]
      .sort((a, b) => b.no - a.no)
      .filter((inv) => {
        const kind = invoiceKind(inv);
        if (filter === "cash" && kind !== "cash") return false;
        if (filter === "credit" && kind === "cash") return false;
        if (!term) return true;
        // رقم الفاتورة أو اسم العميل
        return String(inv.no).includes(term) || partyName(inv).includes(term);
      });
  }, [q, filter]);

  const month = TODAY.slice(0, 7);
  const thisMonth = invoices.filter((i) => i.date.startsWith(month));
  const monthTotal = thisMonth.reduce((s, i) => s + invoiceTotal(i), 0);

  const days = new Map<string, Invoice[]>();
  for (const inv of list) days.set(inv.date, [...(days.get(inv.date) ?? []), inv]);

  return (
    <>
      <PageHeader
        title="الفواتير"
        sub={
          <>
            {monthOnly(TODAY)}: <Num value={thisMonth.length} /> فاتورة · <Money value={monthTotal} /> ج
          </>
        }
        back="/reports"
      />

      <Page>
        {/* ------------------------------- البحث ------------------------------- */}
        <div className="relative mb-3">
          <Search
            size={18}
            className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-ink-mute"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="اسم العميل أو رقم الفاتورة"
            aria-label="بحث"
            enterKeyHint="search"
            className="h-12 w-full rounded-2xl border border-line bg-card ps-11 pe-10 text-[16px] outline-none placeholder:text-[14px] placeholder:text-ink-mute focus:border-brand"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="مسح"
              className="absolute end-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ink-mute active:bg-sunken"
            >
              <X size={17} />
            </button>
          )}
        </div>

        {/* ------------------------------- الفلتر ------------------------------- */}
        <div className="mb-5 flex gap-2">
          {(
            [
              ["all", "الكل"],
              ["credit", "آجل"],
              ["cash", "نقدي"],
            ] as [Filter, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`press rounded-full border px-4 py-1.5 text-[13px] font-semibold ${
                filter === id ? "border-brand bg-brand-soft text-brand" : "border-line bg-card text-ink-mute"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ------------------------------- الأيام ------------------------------- */}
        {list.length === 0 ? (
          <Card>
            <Empty>مفيش فواتير بالبحث ده</Empty>
          </Card>
        ) : (
          <div className="space-y-5">
            {[...days.entries()].map(([date, rows]) => (
              <div key={date}>
                <div className="mb-2 flex items-baseline justify-between px-1">
                  <h2 className="text-[13px] font-semibold text-ink-mute">{dayLabel(date)}</h2>
                  <Money
                    value={rows.reduce((s, r) => s + invoiceTotal(r), 0)}
                    className="text-[13px] font-bold text-ink-soft"
                  />
                </div>
                <Card className="overflow-hidden">
                  {rows.map((inv, i) => {
                    const kind = KIND[invoiceKind(inv)];
                    return (
                      <div key={inv.no}>
                        {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                        <Link href={`/invoices/${inv.no}`} className="press block active:bg-sunken">
                          <div className="flex items-center gap-3 px-4 py-3.5">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate text-[15px] font-semibold">{partyName(inv)}</span>
                                <Badge tone={kind.tone}>{kind.label}</Badge>
                              </div>
                              <div className="mt-0.5 text-[12px] text-ink-mute">
                                <span className="num">#{inv.no}</span> · <span className="num">{inv.time}</span> ·{" "}
                                <Num value={invoicePieces(inv)} /> قطعة
                              </div>
                            </div>
                            <Money value={invoiceTotal(inv)} className="text-[15px] font-bold" />
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </Card>
              </div>
            ))}
          </div>
        )}
      </Page>
    </>
  );
}

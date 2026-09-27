"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Badge, Card, Empty, Money, Num, Page, PageHeader } from "@/components/ui";
import { since } from "@/lib/format";
import { isStale, models, stockOf, TODAY, totals, valueOf } from "@/lib/mock";

export default function InventoryPage() {
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const term = q.trim();
    const base = models.filter((m) => stockOf(m) > 0 || m.incoming > 0);
    if (!term) return base;
    return base.filter(
      (m) => String(m.code).includes(term) || (m.name ?? "").includes(term),
    );
  }, [q]);

  return (
    <>
      <PageHeader
        title="المخزون"
        sub={
          <>
            <Num value={models.length} /> موديل · <Money value={totals.stockValue} /> ج
          </>
        }
      />

      <Page>
        {/* --------------------------------- البحث --------------------------------- */}
        <div className="relative mb-4">
          <Search
            size={18}
            className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-ink-mute"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            // كيبورد أرقام — الأكواد أرقام صافية (الـ spec، قسم 4)
            inputMode="numeric"
            enterKeyHint="search"
            placeholder="ابحث بالكود"
            aria-label="ابحث بالكود"
            className="h-12 w-full rounded-2xl border border-line bg-card ps-11 pe-10 text-[16px] outline-none placeholder:text-ink-mute focus:border-brand"
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

        {/* -------------------------------- القايمة -------------------------------- */}
        <Card className="overflow-hidden">
          {list.length === 0 ? (
            <Empty>مفيش موديل بالكود ده</Empty>
          ) : (
            list.map((m, i) => {
              const stock = stockOf(m);
              const stale = isStale(m);
              return (
                <div key={m.code}>
                  {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                  <Link
                    href={`/inventory/${m.code}`}
                    className="press block active:bg-sunken"
                  >
                    <div className="flex items-center gap-3 px-4 py-3.5">
                      <span className="num w-12 shrink-0 text-[17px] font-bold">
                        {m.code}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="text-[14px]">
                          <Num value={stock} className="font-semibold" /> قطعة
                        </div>
                        {m.name && (
                          <div className="mt-0.5 truncate text-[12px] text-ink-mute">
                            {m.name}
                          </div>
                        )}
                      </div>

                      {m.incoming > 0 && (
                        <Badge tone="brand">
                          + <Num value={m.incoming} /> جايين
                        </Badge>
                      )}
                      {stale && (
                        <Badge tone="warn">
                          راكد {m.lastSale ? since(m.lastSale, new Date(TODAY)) : ""}
                        </Badge>
                      )}

                      <Money
                        value={valueOf(m)}
                        className="w-16 shrink-0 text-end text-[13px] text-ink-mute"
                      />
                    </div>
                  </Link>
                </div>
              );
            })
          )}
        </Card>
      </Page>
    </>
  );
}

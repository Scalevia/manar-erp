"use client";

import { useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { Hash, Plus, Search, Type, X } from "lucide-react";
import { Badge, Card, Empty, Money, Num, Page, PageHeader } from "@/components/ui";
import { since } from "@/lib/format";
import { isStale, models, searchModels, stockOf, TODAY, totals, valueOf } from "@/lib/mock";

export default function InventoryPage() {
  const [q, setQ] = useState("");
  // كيبورد الأرقام هو الأساس — والهدوم اللي من غير كود بتتدوّر باسمها
  const [byName, setByName] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const list = useMemo(() => {
    const inStock = models.filter((m) => stockOf(m) > 0);
    if (!q.trim()) return inStock;
    const found = new Set(searchModels(q));
    return inStock.filter((m) => found.has(m));
  }, [q]);

  /** الكيبورد بيتغير بس لما الخانة تاخد الفوكس من جديد */
  function toggleKeyboard() {
    flushSync(() => {
      setByName((v) => !v);
      setQ("");
    });
    inputRef.current?.blur();
    inputRef.current?.focus();
  }

  return (
    <>
      <PageHeader
        title="المخزون"
        sub={
          <>
            <Num value={models.length} /> موديل · <Money value={totals.stockValue} /> ج
          </>
        }
        action={
          <Link
            href="/inventory/buy"
            className="press flex items-center gap-1 rounded-xl bg-brand px-3 py-1.5 text-[13px] font-bold text-brand-ink"
          >
            <Plus size={16} strokeWidth={2.6} />
            شراء مخزون
          </Link>
        }
      />

      <Page>
        {/* --------------------------------- البحث --------------------------------- */}
        <div className="mb-4 flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-ink-mute"
            />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              // كيبورد أرقام للكود (الـ spec، قسم 4) — وحروف للاسم
              inputMode={byName ? "search" : "numeric"}
              enterKeyHint="search"
              placeholder={byName ? "ابحث بالاسم" : "ابحث بالكود"}
              aria-label={byName ? "ابحث بالاسم" : "ابحث بالكود"}
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
          <button
            type="button"
            onClick={toggleKeyboard}
            className="press flex h-12 shrink-0 items-center gap-1.5 rounded-2xl border border-line bg-card px-3.5 text-[13px] font-semibold text-brand"
          >
            {byName ? <Hash size={16} /> : <Type size={16} />}
            {byName ? "بالكود" : "بالاسم"}
          </button>
        </div>

        {/* -------------------------------- القايمة -------------------------------- */}
        <Card className="overflow-hidden">
          {list.length === 0 ? (
            <Empty>{byName ? "مفيش موديل بالاسم ده" : "مفيش موديل بالكود ده"}</Empty>
          ) : (
            list.map((m, i) => {
              const stock = stockOf(m);
              const stale = isStale(m);
              return (
                <div key={m.id}>
                  {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                  <Link
                    href={`/inventory/${m.id}`}
                    className="press block active:bg-sunken"
                  >
                    <div className="flex items-center gap-3 px-4 py-3.5">
                      {m.code !== undefined ? (
                        <>
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
                        </>
                      ) : (
                        // من غير كود: الاسم هو اللي بيعرّفه، فبياخد مكان الكود
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[15px] font-bold">{m.name}</div>
                          <div className="mt-0.5 text-[12px] text-ink-mute">
                            <Num value={stock} className="font-semibold text-ink-soft" /> قطعة
                          </div>
                        </div>
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

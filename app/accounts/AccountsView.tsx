"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Plus, Search, X } from "lucide-react";
import { Card, Empty, Money, Page, PageHeader } from "@/components/ui";
import { daysSince, normalizeArabic, since } from "@/lib/format";
import { ofKind, TODAY, totals, type Party, type PartyKind } from "@/lib/mock";

/**
 * الحسابات (الـ spec، قسم 10): التبويبات **بالناس** — عملائي ومصانعي وسلفي —
 * مش بالفلوس. التاجر بيدوّر على «مصنع الفجر» في مصانعه، مش في «ليا» عشان رصيده
 * اتقلب مقدّم. كل سطر بيقول اتجاهه (عليه / ليه)، والإجماليين فوق أرقام بس.
 */

export type Tab = "customers" | "suppliers" | "loans";

const TABS: { id: Tab; label: string; kind: PartyKind }[] = [
  { id: "customers", label: "العملاء", kind: "customer" },
  { id: "suppliers", label: "المصانع والتجار", kind: "supplier" },
  { id: "loans", label: "السلف", kind: "person" },
];

const LATE_DAYS = 90;

/** العملاء: اللي عليه الأقدم الأول (ترتيب «مين متأخر») · الباقي: الأكبر الأول */
function sortRows(rows: Party[], tab: Tab) {
  if (tab === "customers")
    return [...rows].sort((a, b) => {
      if ((a.balance > 0) !== (b.balance > 0)) return a.balance > 0 ? -1 : 1;
      return daysSince(b.oldestDue ?? TODAY) - daysSince(a.oldestDue ?? TODAY);
    });
  return [...rows].sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
}

export default function AccountsView({ initialTab }: { initialTab: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const kind = TABS.find((t) => t.id === tab)!.kind;
    const term = normalizeArabic(q);
    const all = ofKind(kind).filter((x) => !x.isCash);
    const found = term ? all.filter((x) => normalizeArabic(x.name).includes(term)) : all;
    return sortRows(found, tab);
  }, [tab, q]);

  return (
    <>
      <PageHeader
        title="الحسابات"
        action={
          <Link
            href={tab === "suppliers" ? "/accounts/new?kind=supplier" : "/accounts/new"}
            className="press flex items-center gap-1 rounded-xl bg-brand px-3 py-1.5 text-[13px] font-bold text-brand-ink"
          >
            <Plus size={16} strokeWidth={2.6} />
            فتح حساب
          </Link>
        }
      />
      <Page>
        {/* ------------------------- الإجماليين — نظرة سريعة ------------------------- */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          <Card className="px-4 py-3">
            <div className="text-[12px] font-semibold text-ink-mute">ليا في السوق</div>
            <Money value={totals.receivable} className="mt-1 block text-[20px] font-bold text-pos" />
          </Card>
          <Card className="px-4 py-3">
            <div className="text-[12px] font-semibold text-ink-mute">اللي عليا</div>
            <Money value={totals.payable} className="mt-1 block text-[20px] font-bold text-neg" />
          </Card>
        </div>

        {/* ---------------------------------- البحث ---------------------------------- */}
        <div className="relative mb-3">
          <Search
            size={18}
            className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-ink-mute"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            enterKeyHint="search"
            placeholder="ابحث بالاسم"
            aria-label="ابحث بالاسم"
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

        {/* --------------------------------- التبويبات -------------------------------- */}
        <div className="mb-4 grid grid-cols-3 gap-1 rounded-2xl bg-sunken p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              className={`press rounded-xl py-2.5 text-[13px] font-bold ${tab === t.id ? "bg-card text-ink shadow-sm" : "text-ink-mute"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ---------------------------------- القايمة --------------------------------- */}
        <Card className="overflow-hidden">
          {rows.length === 0 ? (
            <Empty>{q ? "مفيش حد بالاسم ده" : "مفيش حسابات هنا"}</Empty>
          ) : (
            rows.map((party, i) => (
              <div key={party.id}>
                {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                <PartyRow party={party} />
              </div>
            ))
          )}
        </Card>

        {tab === "loans" && (
          <Link href="/loans/new" className="mt-4 block text-center text-[13px] font-semibold text-brand">
            + سلفة جديدة
          </Link>
        )}
      </Page>
    </>
  );
}

/* ------------------------------------------------------------------ */

function PartyRow({ party }: { party: Party }) {
  const now = new Date(TODAY);
  const late = party.kind === "customer" && party.balance > 0 && !!party.oldestDue && daysSince(party.oldestDue, now) > LATE_DAYS;
  // عليه فلوس: من إمتى أقدم مبلغ · غير كده: آخر حركة
  const when = party.balance > 0 && party.oldestDue ? party.oldestDue : party.lastActivity;

  return (
    <Link href={`/accounts/${party.id}`} className="press block active:bg-sunken">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[15px] font-semibold">{party.name}</span>
            {late && <AlertTriangle size={14} className="shrink-0 text-warn" />}
          </div>
          <div className="mt-0.5 text-[12px] text-ink-mute">{since(when, now)}</div>
        </div>

        {/* الاتجاه مكتوب جنب الرقم — مش محتاج يعرف هو في أنهي قايمة */}
        {party.balance === 0 ? (
          <span className="text-[13px] text-ink-mute">خالص</span>
        ) : (
          <span className={`text-[13px] ${party.balance > 0 ? "text-pos" : "text-neg"}`}>
            {party.balance > 0 ? (party.kind === "supplier" ? "عنده مقدّم " : "عليه ") : "ليه "}
            <Money value={Math.abs(party.balance)} className="text-[16px] font-bold" />
          </span>
        )}
      </div>
    </Link>
  );
}

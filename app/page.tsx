import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeftRight,
  Banknote,
  HandCoins,
  Package,
  Receipt,
  Scissors,
} from "lucide-react";
import { Card, Money, Num, Page, SectionTitle } from "@/components/ui";
import { daysSince, shortDate } from "@/lib/format";
import { cashAccounts, loansDueSoon, openOrders, totals, TODAY } from "@/lib/mock";

const DAYS = ["الحد", "الاتنين", "التلات", "الأربع", "الخميس", "الجمعة", "السبت"];
const MONTHS = [
  "يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

function today() {
  const d = new Date(TODAY);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export default function Dashboard() {
  const open = openOrders();

  return (
    <>
      <div className="pt-safe" />
      <Page>
        {/* ------------------------------ الترويسة ------------------------------ */}
        <div className="mb-5 flex items-end justify-between px-1 pt-2">
          <div>
            <div className="text-[22px] font-bold leading-tight">منار</div>
            <div className="mt-0.5 text-[13px] text-ink-mute">{today()}</div>
          </div>
          <Link
            href="/more"
            className="text-[13px] font-semibold text-brand hover:underline"
          >
            المزيد
          </Link>
        </div>

        {/* ---------------------------- صافي موقفي ---------------------------- */}
        <Card className="mb-3 overflow-hidden">
          <div className="px-5 pb-4 pt-5">
            <div className="text-[13px] font-semibold text-ink-mute">صافي موقفي</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <Money value={totals.net} className="text-[40px] font-bold leading-none" />
              <span className="text-[15px] font-semibold text-ink-mute">ج</span>
            </div>
            <div className="mt-2 text-[12px] leading-relaxed text-ink-mute">
              لو كل الناس سدّت واتسدّ اللي عليا
            </div>
          </div>

          <div className="border-t border-line-soft">
            <StatLine label="السيولة" value={totals.liquidity} />
            <StatLine label="ليا في السوق" value={totals.receivable} tone="pos" href="/accounts" />
            <StatLine
              label="اللي عليا"
              value={-totals.payable}
              tone="neg"
              href="/accounts?tab=payable"
            />
          </div>
        </Card>

        {/* ------------------------------- الخزن ------------------------------- */}
        <SectionTitle>الخزن</SectionTitle>
        <div className="mb-5 grid grid-cols-3 gap-2">
          {cashAccounts.map((a) => (
            <Card key={a.id} className="px-3 py-3">
              <div className="truncate text-[12px] text-ink-mute">{a.short}</div>
              <Money value={a.balance} className="mt-1 block text-[17px] font-bold" />
            </Card>
          ))}
        </div>

        {/* ------------------------------ البضاعة ------------------------------ */}
        <SectionTitle>البضاعة والقماش</SectionTitle>
        <Card className="mb-5 overflow-hidden">
          <AssetLine
            icon={<Package size={18} />}
            label="بضاعة في المحل"
            value={totals.stockValue}
            href="/inventory"
          />
          <div className="ms-4 border-t border-line-soft" />
          <AssetLine
            icon={<Scissors size={18} />}
            label="قماش في المحل"
            value={totals.fabricValue}
          />
          <div className="ms-4 border-t border-line-soft" />
          <AssetLine
            icon={<ArrowLeftRight size={18} />}
            label="قماش عند المصانع"
            value={totals.fabricAtFactoriesValue}
            href="/production"
          />
        </Card>

        {/* ------------------------ أوامر تصنيع مفتوحة ------------------------ */}
        {open.length > 0 && (
          <Link href="/production" className="press block">
            <div className="flex items-center gap-3 rounded-2xl border border-warn/25 bg-warn-soft px-4 py-3.5">
              <AlertTriangle size={19} className="shrink-0 text-warn" />
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-warn">
                  أوامر تصنيع مفتوحة: <Num value={open.length} />
                </div>
                <div className="mt-0.5 text-[12px] leading-snug text-warn/80">
                  التكلفة فيها لسه مبدئية — اقفله لما تستلم الباقي
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* ---------------------- سلف ميعادها قرّب أو فات ---------------------- */}
        {loansDueSoon().map((x) => {
          const late = daysSince(TODAY, new Date(x.dueDate!)) < 0;
          return (
            <Link key={x.id} href={`/accounts/${x.id}`} className="press mt-3 block">
              <div className="flex items-center gap-3 rounded-2xl border border-warn/25 bg-warn-soft px-4 py-3.5">
                <HandCoins size={19} className="shrink-0 text-warn" />
                <div className="min-w-0 flex-1 text-[13px] leading-snug text-warn">
                  <span className="font-semibold">
                    {x.balance < 0 ? `سلفة ${x.name}` : `سلفتك لـ ${x.name}`}
                  </span>{" "}
                  <Money value={Math.abs(x.balance)} className="font-bold" /> ج —{" "}
                  {late ? "فات ميعادها" : "ميعادها"} <span className="num">{shortDate(x.dueDate!)}</span>
                </div>
              </div>
            </Link>
          );
        })}

        {/* ----------------------------- إجراء سريع ----------------------------- */}
        <div className="mt-5 grid grid-cols-[2fr_1fr] gap-2 lg:hidden">
          <Link href="/sell" className="press block">
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-4 text-brand-ink">
              <Banknote size={20} />
              <span className="text-[15px] font-bold">فاتورة جديدة</span>
            </div>
          </Link>
          <Link href="/expenses/new" className="press block">
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-card px-3 py-4 text-ink-soft">
              <Receipt size={19} />
              <span className="text-[15px] font-bold">مصروف</span>
            </div>
          </Link>
        </div>
      </Page>
    </>
  );
}

/* ------------------------------------------------------------------ */

function StatLine({
  label,
  value,
  tone,
  href,
}: {
  label: string;
  value: number;
  tone?: "pos" | "neg";
  href?: string;
}) {
  const color = tone === "pos" ? "text-pos" : tone === "neg" ? "text-neg" : "text-ink";
  const body = (
    <div className="flex items-center justify-between px-5 py-3">
      <span className="text-[14px] text-ink-soft">{label}</span>
      <span className={`text-[16px] font-bold ${color}`}>
        {value < 0 && <span className="num">−</span>}
        <Money value={Math.abs(value)} />
      </span>
    </div>
  );
  return href ? (
    <Link href={href} className="press block active:bg-sunken">
      {body}
    </Link>
  ) : (
    body
  );
}

function AssetLine({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  href?: string;
}) {
  const body = (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sunken text-ink-soft">
        {icon}
      </span>
      <span className="flex-1 text-[14px] text-ink-soft">{label}</span>
      <Money value={value} className="text-[16px] font-bold" />
    </div>
  );
  return href ? (
    <Link href={href} className="press block active:bg-sunken">
      {body}
    </Link>
  ) : (
    body
  );
}

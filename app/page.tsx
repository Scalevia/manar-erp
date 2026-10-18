import Link from "next/link";
import {
  AlertTriangle,
  ChevronLeft,
  Factory,
  FileText,
  HandCoins,
  PackagePlus,
  Phone,
  Receipt,
  TrendingUp,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { LogoLockup } from "@/components/Logo";
import { Card, Money, Num, Page, SectionTitle } from "@/components/ui";
import { daysSince, shortDate, since } from "@/lib/format";
import {
  byId,
  capitalChange,
  capitalPeriods,
  cashAccounts,
  jobSummary,
  jobTitle,
  loansDueSoon,
  openJobs,
  staleJobs,
  receivables,
  recentActivity,
  todaySummary,
  TODAY,
  totals,
  type Activity,
} from "@/lib/mock";

const DAYS = ["الحد", "الاتنين", "التلات", "الأربع", "الخميس", "الجمعة", "السبت"];
const MONTHS = [
  "يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

function todayLabel() {
  const d = new Date(TODAY);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** متأخر = أقدم مبلغ عليه بقاله أكتر من 90 يوم — بيظهر في «محتاج انتباهك» */
const LATE_DAYS = 90;

/**
 * الرئيسية — بتساعده يشتغل مش بس بتعرض أرقام:
 * زراير فوق ← النهاردة ← محتاج انتباهك ← الفلوس ← آخر الحركات ← رأس مالي.
 * «بيع» مش هنا لأنه في نص التنقل تحت، بلمسة واحدة من أي شاشة.
 */
export default function Dashboard() {
  const day = todaySummary();
  const now = new Date(TODAY);

  const late = receivables()
    .filter((x) => x.kind === "customer" && x.oldestDue && daysSince(x.oldestDue, now) > LATE_DAYS)
    .slice(0, 3);
  const loans = loansDueSoon();
  const stale = staleJobs();
  const capital1m = capitalPeriods.find((x) => x.id === "1m")!;

  return (
    <>
      <div className="pt-safe" />
      <Page>
        {/* ------------------------------ الترويسة ------------------------------ */}
        <div className="mb-4 flex items-end justify-between px-1 pt-2">
          <LogoLockup size={42} />
          <div className="text-[13px] text-ink-mute">{todayLabel()}</div>
        </div>

        {/* -------------------------- أكتر حاجات بيعملها -------------------------- */}
        <div className="mb-5 grid grid-cols-3 gap-2">
          <Quick href="/expenses/new" icon={Receipt} label="مصروف" primary />
          <Quick href="/payments" icon={HandCoins} label="تحصيل" />
          <Quick href="/receive" icon={PackagePlus} label="استلام" />
        </div>

        {/* ------------------------------- النهاردة ------------------------------- */}
        <SectionTitle>النهاردة</SectionTitle>
        <Card className="mb-5 overflow-hidden">
          <Link href="/invoices" className="press block active:bg-sunken">
            <div className="flex items-baseline justify-between px-4 pb-3 pt-4">
              <div>
                <div className="text-[13px] text-ink-mute">بعت</div>
                <div className="mt-0.5 text-[12px] text-ink-mute">
                  <Num value={day.salesCount} /> {day.salesCount === 1 ? "فاتورة" : "فواتير"}
                </div>
              </div>
              <span className="flex items-baseline gap-1">
                <Money value={day.salesTotal} className="text-[30px] font-bold leading-none" />
                <span className="text-[13px] text-ink-mute">ج</span>
              </span>
            </div>
          </Link>
          <div className="grid grid-cols-3 gap-px border-t border-line-soft bg-line-soft">
            <DayCell label="دخل الخزن" value={day.cashIn} tone="pos" />
            <DayCell label="مصاريف" value={day.expenses} tone="neg" href="/expenses" />
            <DayCell label="السيولة" value={totals.liquidity} />
          </div>
        </Card>

        {/* ---------------------------- محتاج انتباهك ---------------------------- */}
        {(late.length > 0 || loans.length > 0 || stale.length > 0) && (
          <>
            <SectionTitle>محتاج انتباهك</SectionTitle>
            <Card className="mb-5 overflow-hidden">
              {late.map((x, i) => (
                <div key={x.id} className={i > 0 ? "border-t border-line-soft" : ""}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <AlertTriangle size={17} className="shrink-0 text-warn" />
                    <Link href={`/accounts/${x.id}`} className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-semibold">{x.name}</div>
                      <div className="mt-0.5 text-[12px] text-ink-mute">
                        عليه <Money value={x.balance} className="font-semibold text-pos" /> ·{" "}
                        {since(x.oldestDue!, now)}
                      </div>
                    </Link>
                    {x.phone && (
                      <a
                        href={`tel:${x.phone}`}
                        aria-label={`اتصل بـ ${x.name}`}
                        className="press flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-soft px-3 py-2 text-[12px] font-bold text-brand"
                      >
                        <Phone size={14} />
                        اتصل
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {loans.map((x, i) => {
                const overdue = daysSince(TODAY, new Date(x.dueDate!)) < 0;
                return (
                  <Link
                    key={x.id}
                    href={`/accounts/${x.id}`}
                    className={`press block active:bg-sunken ${late.length + i > 0 ? "border-t border-line-soft" : ""}`}
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      <HandCoins size={17} className="shrink-0 text-warn" />
                      <div className="min-w-0 flex-1 text-[13px]">
                        <span className="font-semibold">
                          {x.balance < 0 ? `سلفة ${x.name}` : `سلفتك لـ ${x.name}`}
                        </span>{" "}
                        <Money value={Math.abs(x.balance)} className="font-bold" /> ·{" "}
                        <span className="text-ink-mute">
                          {overdue ? "فات ميعادها" : "ميعادها"} <span className="num">{shortDate(x.dueDate!)}</span>
                        </span>
                      </div>
                      <ChevronLeft size={16} className="shrink-0 text-ink-mute" />
                    </div>
                  </Link>
                );
              })}

              {/* أمر مفتوح ومفيش استلام فيه من فترة — يمكن نسي يقفله */}
              {stale.map((j, i) => {
                const last = jobSummary(j).lastReceipt;
                return (
                  <Link
                    key={j.id}
                    href={`/jobs/${j.id}`}
                    className={`press block active:bg-sunken ${late.length + loans.length + i > 0 ? "border-t border-line-soft" : ""}`}
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Factory size={17} className="shrink-0 text-warn" />
                      <div className="min-w-0 flex-1 text-[13px]">
                        <span className="font-semibold">
                          {jobTitle(j)} · {byId(j.factoryId ?? "")?.name}
                        </span>{" "}
                        <span className="text-ink-mute">
                          — {last ? "آخر استلام" : "لسه موصلش منه حاجة"} {since(last ?? j.openedAt, now)}
                        </span>
                      </div>
                      <ChevronLeft size={16} className="shrink-0 text-ink-mute" />
                    </div>
                  </Link>
                );
              })}
            </Card>
          </>
        )}

        {/* -------------------------------- الفلوس -------------------------------- */}
        <SectionTitle
          action={
            <Link href="/transfer" className="text-[12px] font-semibold text-brand hover:underline">
              تحويل بين الخزن
            </Link>
          }
        >
          الفلوس
        </SectionTitle>
        <Card className="mb-5 overflow-hidden">
          <div className="grid grid-cols-2 gap-px bg-line-soft">
            <Link href="/accounts" className="press block bg-card px-4 py-3.5 active:bg-sunken">
              <div className="text-[12px] text-ink-mute">ليا في السوق</div>
              <Money value={totals.receivable} className="mt-1 block text-[18px] font-bold text-pos" />
            </Link>
            <Link href="/accounts?tab=payable" className="press block bg-card px-4 py-3.5 active:bg-sunken">
              <div className="text-[12px] text-ink-mute">اللي عليا</div>
              <Money value={totals.payable} className="mt-1 block text-[18px] font-bold text-neg" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-px border-t border-line-soft bg-line-soft">
            {cashAccounts.map((a) => (
              <div key={a.id} className="bg-card px-3 py-3">
                <div className="truncate text-[11px] text-ink-mute">{a.short}</div>
                <Money value={a.balance} className="mt-0.5 block text-[15px] font-bold" />
              </div>
            ))}
          </div>
          {/* فلوس اتحولت لقماش أو لشغل لسه موصلش — محسوبة في رأس المال، مش في السيولة */}
          <div className="grid grid-cols-2 gap-px border-t border-line-soft bg-line-soft">
            <Link href="/jobs" className="press block bg-card px-4 py-3 active:bg-sunken">
              <div className="truncate text-[11px] text-ink-mute">
                في أوامر التصنيع · <span className="num">{openJobs().length}</span>
              </div>
              <Money value={totals.inJobs} className="mt-0.5 block text-[15px] font-bold" />
            </Link>
            <Link href="/fabric" className="press block bg-card px-4 py-3 active:bg-sunken">
              <div className="truncate text-[11px] text-ink-mute">قماش في المحل</div>
              <Money value={totals.fabric} className="mt-0.5 block text-[15px] font-bold" />
            </Link>
          </div>
        </Card>

        {/* ------------------------------ آخر الحركات ------------------------------ */}
        <SectionTitle>آخر الحركات</SectionTitle>
        <Card className="mb-5 overflow-hidden">
          {recentActivity().map((a, i) => (
            <ActivityRow key={a.key} a={a} first={i === 0} />
          ))}
        </Card>

        {/* -------------------------------- رأس مالي -------------------------------- */}
        <Link href="/capital" className="press block">
          <Card className="flex items-center gap-3 px-4 py-3.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
              <TrendingUp size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-semibold">رأس مالي</div>
              <div className="mt-0.5 text-[12px] text-ink-mute">
                <Money value={totals.capital} /> ج · آخر شهر{" "}
                <span className={capitalChange(capital1m) >= 0 ? "text-pos" : "text-neg"}>
                  <span className="num">{capitalChange(capital1m) >= 0 ? "+" : "−"}</span>
                  <Money value={Math.abs(capitalChange(capital1m))} />
                </span>
              </div>
            </div>
            <ChevronLeft size={17} className="shrink-0 text-ink-mute" />
          </Card>
        </Link>
      </Page>
    </>
  );
}

/* ------------------------------------------------------------------ */

function Quick({
  href,
  icon: Icon,
  label,
  primary,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`press flex flex-col items-center justify-center gap-1.5 rounded-2xl py-3.5 ${
        primary ? "bg-brand text-brand-ink" : "border border-line bg-card text-ink-soft"
      }`}
    >
      <Icon size={20} />
      <span className="text-[13px] font-bold">{label}</span>
    </Link>
  );
}

function DayCell({
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
  const body = (
    <div className="bg-card px-3 py-3">
      <div className="text-[11px] text-ink-mute">{label}</div>
      <Money
        value={value}
        className={`mt-0.5 block text-[15px] font-bold ${tone === "pos" ? "text-pos" : tone === "neg" ? "text-neg" : ""}`}
      />
    </div>
  );
  return href ? (
    <Link href={href} className="press block active:opacity-80">
      {body}
    </Link>
  ) : (
    body
  );
}

const ACTIVITY_ICON: Record<Activity["kind"], LucideIcon> = {
  invoice: FileText,
  payment: HandCoins,
  expense: Receipt,
  purchase: Truck,
  receive: PackagePlus,
};

function ActivityRow({ a, first }: { a: Activity; first: boolean }) {
  const Icon = ACTIVITY_ICON[a.kind];
  const moneyIn = a.kind === "invoice" || a.kind === "payment";
  const day = a.date === TODAY ? "النهاردة" : since(a.date, new Date(TODAY));
  return (
    <Link href={a.href} className={`press block active:bg-sunken ${first ? "" : "border-t border-line-soft"}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-sunken text-ink-soft">
          <Icon size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-medium">{a.title}</div>
          <div className="mt-0.5 truncate text-[11px] text-ink-mute">
            {day}
            {a.date === TODAY && a.time && (
              <>
                {" "}
                <span className="num">{a.time}</span>
              </>
            )}
            {a.sub && <> · {a.sub}</>}
          </div>
        </div>
        <span className={`text-[14px] font-bold ${moneyIn ? "text-ink" : "text-ink-soft"}`}>
          <Money value={a.amount} />
        </span>
      </div>
    </Link>
  );
}

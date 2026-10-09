import Link from "next/link";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { Badge, Card, Empty, Money, Page, PageHeader, SectionTitle } from "@/components/ui";
import { daysSince, shortDate } from "@/lib/format";
import { ofKind, TODAY, type Party } from "@/lib/mock";

export default function LoansPage() {
  const people = ofKind("person");
  const borrowed = people.filter((x) => x.balance < 0);
  const lent = people.filter((x) => x.balance > 0);
  const sum = (rows: Party[]) => rows.reduce((s, x) => s + Math.abs(x.balance), 0);

  return (
    <>
      <PageHeader title="السلف" back="/more" />
      <Page>
        {/* -------------------------------- الزراير -------------------------------- */}
        <div className="mb-5 grid grid-cols-2 gap-2">
          <Link
            href="/loans/new?dir=in"
            className="press flex flex-col items-center gap-1.5 rounded-2xl bg-brand py-4 text-brand-ink"
          >
            <ArrowDownToLine size={20} />
            <span className="text-[14px] font-bold">استلفت</span>
            <span className="text-[11px] opacity-80">حد سلّفني فلوس</span>
          </Link>
          <Link
            href="/loans/new?dir=out"
            className="press flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-card py-4 text-ink-soft"
          >
            <ArrowUpFromLine size={20} />
            <span className="text-[14px] font-bold">سلّفت حد</span>
            <span className="text-[11px] text-ink-mute">فلوس طلعت وهترجع</span>
          </Link>
        </div>

        {/* ---------------------------- استلفت منهم ---------------------------- */}
        <SectionTitle action={<Money value={sum(borrowed)} className="text-[13px] font-bold text-neg" />}>
          استلفت منهم — عليك
        </SectionTitle>
        <Card className="mb-5 overflow-hidden">
          {borrowed.length === 0 ? <Empty>مفيش سلف عليك</Empty> : borrowed.map((x, i) => <LoanRow key={x.id} x={x} first={i === 0} />)}
        </Card>

        {/* ------------------------------ سلّفتهم ------------------------------ */}
        <SectionTitle action={<Money value={sum(lent)} className="text-[13px] font-bold text-pos" />}>
          سلّفتهم — ليك
        </SectionTitle>
        <Card className="mb-4 overflow-hidden">
          {lent.length === 0 ? <Empty>مفيش حد مسلّفه</Empty> : lent.map((x, i) => <LoanRow key={x.id} x={x} first={i === 0} />)}
        </Card>

        <p className="px-1 text-[12px] leading-relaxed text-ink-mute">
          السلف مش بتغيّر رأس مالك — الفلوس اتنقلت بس. والسداد من «تحصيل» أو «دفع» في كشف حساب الشخص.
        </p>
      </Page>
    </>
  );
}

function LoanRow({ x, first }: { x: Party; first: boolean }) {
  const owesMe = x.balance > 0;
  // أيام لحد الميعاد: سالب = فات
  const left = x.dueDate ? daysSince(TODAY, new Date(x.dueDate)) : null;

  return (
    <div>
      {!first && <div className="ms-4 border-t border-line-soft" />}
      <Link href={`/accounts/${x.id}`} className="press block active:bg-sunken">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-semibold">{x.name}</div>
            <div className="mt-0.5 text-[12px] text-ink-mute">
              {x.dueDate ? (
                <>
                  ميعادها <span className="num">{shortDate(x.dueDate)}</span>
                </>
              ) : (
                "من غير ميعاد"
              )}
            </div>
          </div>
          {left !== null && left < 0 && <Badge tone="neg">فات ميعادها</Badge>}
          {left !== null && left >= 0 && left <= 7 && <Badge tone="warn">قرّب ميعادها</Badge>}
          <Money value={Math.abs(x.balance)} className={`text-[15px] font-bold ${owesMe ? "text-pos" : "text-neg"}`} />
        </div>
      </Link>
    </div>
  );
}

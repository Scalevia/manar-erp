import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { Badge, Card, Empty, Money, Num, Page, PageHeader, SectionTitle } from "@/components/ui";
import { daysSince, shortDate, since } from "@/lib/format";
import {
  closedJobs,
  factoryOf,
  jobSummary,
  jobTitle,
  openJobs,
  STALE_JOB_DAYS,
  TODAY,
  totals,
  type Job,
} from "@/lib/mock";

/**
 * أوامر التصنيع (الـ spec، قسم 5): المفتوحة فوق بالفاضل في كل واحد،
 * والمقفولة تحت. الأمر = شنطة فلوس لشغلانة واحدة عند مصنع واحد.
 */
export default function JobsPage() {
  const open = openJobs();
  const closed = closedJobs();

  return (
    <>
      <PageHeader
        title="أوامر التصنيع"
        back="/more"
        action={
          <Link
            href="/jobs/new"
            className="press flex items-center gap-1 rounded-xl bg-brand px-3 py-1.5 text-[13px] font-bold text-brand-ink"
          >
            <Plus size={16} strokeWidth={2.6} />
            أمر جديد
          </Link>
        }
      />
      <Page>
        {/* الفاضل في المفتوح = فلوس في الشغل، محسوبة في رأس المال ومش في السيولة */}
        <Card className="mb-5 flex items-center justify-between px-4 py-3.5">
          <div>
            <div className="text-[13px] font-semibold">فلوس في الشغل</div>
            <div className="mt-0.5 text-[11px] text-ink-mute">اتصرفت على أوامر لسه بضاعتها موصلتش كلها</div>
          </div>
          <Money value={totals.inJobs} className="text-[20px] font-bold" />
        </Card>

        <SectionTitle>مفتوحة</SectionTitle>
        <Card className="mb-5 overflow-hidden">
          {open.length === 0 ? (
            <Empty>مفيش أوامر مفتوحة</Empty>
          ) : (
            open.map((j, i) => <JobRow key={j.id} j={j} first={i === 0} />)
          )}
        </Card>

        {closed.length > 0 && (
          <>
            <SectionTitle>اتقفلت</SectionTitle>
            <Card className="overflow-hidden">
              {closed.map((j, i) => (
                <JobRow key={j.id} j={j} first={i === 0} />
              ))}
            </Card>
          </>
        )}
      </Page>
    </>
  );
}

function JobRow({ j, first }: { j: Job; first: boolean }) {
  const s = jobSummary(j);
  const factory = factoryOf(j);
  const last = s.lastReceipt ?? j.openedAt;
  const stale = !j.closedAt && daysSince(last, new Date(TODAY)) > STALE_JOB_DAYS;

  return (
    <Link href={`/jobs/${j.id}`} className={`press block active:bg-sunken ${first ? "" : "border-t border-line-soft"}`}>
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] font-bold">{jobTitle(j)}</span>
            <span className="truncate text-[14px] text-ink-soft">· {factory.name}</span>
            {stale && <Badge tone="warn">{s.lastReceipt ? "مفيش استلام" : "لسه موصلش"} {since(last, new Date(TODAY))}</Badge>}
          </div>
          {j.name && <div className="mt-0.5 truncate text-[12px] text-ink-mute">{j.name}</div>}
          <div className="mt-1 text-[12px] text-ink-mute">
            اتصرف <Money value={s.spent} className="font-semibold text-ink-soft" /> ·{" "}
            {s.receivedPieces > 0 ? (
              <>
                وصل <Num value={s.receivedPieces} className="font-semibold text-ink-soft" /> قطعة
              </>
            ) : (
              "لسه موصلش حاجة"
            )}
            {j.closedAt && (
              <>
                {" "}· اتقفل <span className="num">{shortDate(j.closedAt)}</span>
              </>
            )}
          </div>
        </div>
        {!j.closedAt && (
          <div className="shrink-0 text-end">
            <Money value={Math.abs(s.remaining)} className={`text-[16px] font-bold ${s.remaining < 0 ? "text-neg" : ""}`} />
            <div className="text-[11px] text-ink-mute">{s.remaining < 0 ? "بالسالب" : "فاضل فيه"}</div>
          </div>
        )}
        <ChevronLeft size={17} className="shrink-0 text-ink-mute" />
      </div>
    </Link>
  );
}

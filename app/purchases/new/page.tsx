import Link from "next/link";
import { ChevronLeft, Plus, Warehouse } from "lucide-react";
import { Card, Money, Page, PageHeader } from "@/components/ui";
import { byId, jobSummary, jobTitle, openJobs, totals } from "@/lib/mock";

/**
 * شراء قماش: أول سؤال «هتوديه فين؟» (الـ spec، قسم 5)
 *   للمحل:  هيشيله عنده ويبعته بعدين — «القماش اللي عندي» يزيد
 *   لأمر:   بيبعته للمصنع على طول — «صرفت · قماش · اشتريته دلوقتي»
 */
export default function NewPurchasePage() {
  const open = openJobs();

  return (
    <>
      <PageHeader title="شراء قماش" sub="هتوديه فين؟" back="/purchases" />
      <Page>
        <Link href="/fabric/buy" className="press mb-5 block">
          <Card className="flex items-center gap-3 px-4 py-3.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
              <Warehouse size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold">هشيله عندي في المحل</div>
              <div className="mt-0.5 text-[12px] text-ink-mute">
                وأبعته بعدين · عندك دلوقتي <Money value={totals.fabric} />
              </div>
            </div>
            <ChevronLeft size={17} className="shrink-0 text-ink-mute" />
          </Card>
        </Link>

        <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">أو هبعته على طول لأمر</div>
        <Card className="mb-4 overflow-hidden">
          {open.map((j, i) => (
            <div key={j.id}>
              {i > 0 && <div className="ms-4 border-t border-line-soft" />}
              <Link href={`/jobs/${j.id}/spend?item=fabric&source=buy`} className="press block active:bg-sunken">
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-semibold">
                      {jobTitle(j)} · {j.factoryId ? byId(j.factoryId)?.name : "لسه من غير مصنع"}
                    </div>
                    {j.name && <div className="mt-0.5 truncate text-[12px] text-ink-mute">{j.name}</div>}
                  </div>
                  <span className="text-[12px] text-ink-mute">
                    فاضل <Money value={jobSummary(j).remaining} />
                  </span>
                  <ChevronLeft size={17} className="shrink-0 text-ink-mute" />
                </div>
              </Link>
            </div>
          ))}
        </Card>

        <Link
          href="/jobs/new"
          className="press flex items-center justify-center gap-1.5 rounded-2xl border border-line bg-card py-3.5 text-[15px] font-semibold text-brand"
        >
          <Plus size={17} />
          شغلانة جديدة — أمر جديد
        </Link>
      </Page>
    </>
  );
}

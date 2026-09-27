import Link from "next/link";
import { Check, ChevronRight, Clock } from "lucide-react";
import { Card, Page, PageHeader } from "@/components/ui";

type Step = {
  href?: string;
  title: string;
  fields: string;
  time: string;
  done?: boolean;
};

/** الترتيب مقصود: يبدأ بأسرع قايمة عشان يحس إنه بيتقدم (الـ spec، قسم 11) */
const steps: Step[] = [
  { title: "الخزن", fields: "3 أرقام بس", time: "دقيقة", done: true },
  { title: "العملاء", fields: "الاسم · المبلغ · من إمتى", time: "ربع ساعة", done: true },
  { title: "المصانع", fields: "الاسم · المبلغ", time: "5 دقايق", done: true },
  { title: "تجار القماش", fields: "الاسم · المبلغ", time: "5 دقايق" },
  { title: "القماش", fields: "النوع · المتر · سعر المتر", time: "10 دقايق" },
  { href: "/setup/stock", title: "البضاعة", fields: "الكود · العدد · التكلفة", time: "نص ساعة" },
  { title: "أوامر التصنيع المفتوحة", fields: "يدوي، قليلين", time: "10 دقايق" },
];

export default function SetupPage() {
  const done = steps.filter((s) => s.done).length;

  return (
    <>
      <PageHeader
        title="تهيئة المحل لأول مرة"
        sub={`${done} من ${steps.length} خلصوا`}
        back="/more"
      />
      <Page>
        <Card className="mb-4 px-5 py-4">
          <p className="text-[13px] leading-relaxed text-ink-soft">
            هندخّل <span className="font-semibold text-ink">الوضع الحالي بس</span> — مش
            تاريخ سنين. كل اللي قبل النهاردة بيتحط رقم واحد، وكل اللي بعده يتسجل عادي.
          </p>
        </Card>

        <Card className="overflow-hidden">
          {steps.map((s, i) => {
            const body = (
              <div className="flex items-center gap-3 px-4 py-3.5">
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-bold ${
                    s.done
                      ? "bg-pos-soft text-pos"
                      : "border border-line bg-card text-ink-mute"
                  }`}
                >
                  {s.done ? <Check size={16} strokeWidth={3} /> : <span className="num">{i + 1}</span>}
                </span>

                <div className="min-w-0 flex-1">
                  <div
                    className={`text-[15px] font-semibold ${s.done ? "text-ink-mute line-through" : ""}`}
                  >
                    {s.title}
                  </div>
                  <div className="mt-0.5 truncate text-[12px] text-ink-mute">
                    {s.fields}
                  </div>
                </div>

                <span className="flex shrink-0 items-center gap-1 text-[11px] text-ink-mute">
                  <Clock size={12} />
                  {s.time}
                </span>

                {s.href && <ChevronRight size={17} className="rotate-180 text-ink-mute" />}
              </div>
            );

            return (
              <div key={s.title}>
                {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                {s.href ? (
                  <Link href={s.href} className="press block active:bg-sunken">
                    {body}
                  </Link>
                ) : (
                  <div className={s.done ? "opacity-70" : ""}>{body}</div>
                )}
              </div>
            );
          })}
        </Card>

        <p className="mt-4 px-1 text-[12px] leading-relaxed text-ink-mute">
          سيب الدفتر معاك أول شهر وقارن. لما الأرقام تطلع زي بعض، هتسيبه لوحدك.
        </p>
      </Page>
    </>
  );
}

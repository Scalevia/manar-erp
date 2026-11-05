"use client";

import Link from "next/link";
import { Check, ChevronRight, Clock } from "lucide-react";
import { Card, Num, Page, PageHeader } from "@/components/ui";
import { money } from "@/lib/format";
import { cashAccounts, setupProgress, useData } from "@/lib/mock";

type Step = {
  href: string;
  title: string;
  fields: string;
  time: string;
  /** فيها بيانات — مش شرط إنها خلصت كلها */
  done: boolean;
  status?: React.ReactNode;
};

export default function SetupPage() {
  useData();
  const p = setupProgress();

  /** الترتيب مقصود: يبدأ بأسرع قايمة عشان يحس إنه بيتقدم (الـ spec، قسم 11) */
  const steps: Step[] = [
    {
      href: "/setup/cash",
      title: "الخزن",
      fields: "3 أرقام بس",
      time: "دقيقة",
      done: p.cash,
      status: p.cash && cashAccounts.map((a) => `${a.short} ${money(a.opening)}`).join(" · "),
    },
    // العملاء والمصانع من «فتح حساب» — فيه خانة «ليه حساب قديم» و«من إمتى»
    {
      href: "/accounts/new?from=setup",
      title: "العملاء",
      fields: "الاسم · الموبايل · المبلغ · من إمتى",
      time: "ربع ساعة",
      done: p.customers > 0,
      status: p.customers > 0 && (
        <>
          <Num value={p.customers} /> برصيد قديم — دوس تضيف الباقي
        </>
      ),
    },
    {
      href: "/accounts/new?kind=supplier&from=setup",
      title: "المصانع والتجار",
      fields: "الاسم · ليه كام أو عنده مقدّم",
      time: "10 دقايق",
      done: p.suppliers > 0,
      status: p.suppliers > 0 && (
        <>
          <Num value={p.suppliers} /> برصيد قديم — دوس تضيف الباقي
        </>
      ),
    },
    // شاشة «سلفة» نفسها، من غير ما الخزنة تتحرك — فلوسها اتحركت قبل البرنامج
    {
      href: "/loans/new?old=1",
      title: "السلف",
      fields: "الاسم · المبلغ · الاتجاه · الميعاد",
      time: "5 دقايق",
      done: p.loans > 0,
      status: p.loans > 0 && (
        <>
          <Num value={p.loans} /> سلفة قديمة — دوس تضيف الباقي
        </>
      ),
    },
    {
      href: "/setup/stock",
      title: "البضاعة",
      fields: "الكود أو الاسم · العدد · التكلفة",
      time: "نص ساعة",
      done: p.models > 0,
      status: p.models > 0 && (
        <>
          <Num value={p.models} /> موديل اتعتمد — دوس تضيف الباقي
        </>
      ),
    },
  ];
  const done = steps.filter((s) => s.done).length;

  return (
    <>
      <PageHeader title="تهيئة المحل لأول مرة" sub={`اتدخّل ${done} من ${steps.length}`} back="/more" />
      <Page>
        <Card className="mb-4 px-5 py-4">
          <p className="text-[13px] leading-relaxed text-ink-soft">
            هندخّل <span className="font-semibold text-ink">الوضع الحالي بس</span> — مش
            تاريخ سنين. كل اللي قبل النهاردة بيتحط رقم واحد، وكل اللي بعده يتسجل عادي.
          </p>
        </Card>

        <Card className="overflow-hidden">
          {steps.map((s, i) => (
            <div key={s.title}>
              {i > 0 && <div className="ms-4 border-t border-line-soft" />}
              <Link href={s.href} className="press block active:bg-sunken">
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-bold ${
                      s.done ? "bg-pos-soft text-pos" : "border border-line bg-card text-ink-mute"
                    }`}
                  >
                    {s.done ? <Check size={16} strokeWidth={3} /> : <span className="num">{i + 1}</span>}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-semibold">{s.title}</div>
                    <div className={`mt-0.5 truncate text-[12px] ${s.status ? "text-pos" : "text-ink-mute"}`}>
                      {s.status || s.fields}
                    </div>
                  </div>

                  {!s.done && (
                    <span className="flex shrink-0 items-center gap-1 text-[11px] text-ink-mute">
                      <Clock size={12} />
                      {s.time}
                    </span>
                  )}

                  <ChevronRight size={17} className="rotate-180 text-ink-mute" />
                </div>
              </Link>
            </div>
          ))}
        </Card>

        <p className="mt-4 px-1 text-[12px] leading-relaxed text-ink-mute">
          سيب الدفتر معاك أول شهر وقارن. لما الأرقام تطلع زي بعض، هتسيبه لوحدك.
        </p>
      </Page>
    </>
  );
}

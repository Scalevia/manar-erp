"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Card, Money, Num, Page, PageHeader } from "@/components/ui";
import { money2 } from "@/lib/format";
import { byId, jobById, jobSummary, jobTitle, type CloseMode } from "@/lib/mock";

/**
 * قفل الأمر — الفاضل يروح فين (الـ spec، قسم 5):
 *   وزّعه على القطع: تكلفة القطع اللي لسه في المخزن من الأمر ده بس
 *                    (اللي اتباع ربحه اتحسب خلاص ومبيتغيرش)
 *   المصنع عليه:    المصنع خد فلوس ومسلّمش — الفاضل يتنقل لحسابه
 *   خسارة:          بتنزل من الربح كـ «هدر أوامر التصنيع»
 * ولو الفاضل بالسالب: نفس الكلام بالعكس، و«المصنع عليه» مبتظهرش.
 */
export default function CloseFlow({ jobId }: { jobId: string }) {
  const job = jobById(jobId)!;
  const s = jobSummary(job);
  const factory = job.factoryId ? byId(job.factoryId) : undefined;
  const R = s.remaining;
  const N = s.inStock;
  const negative = R < 0;

  const [mode, setMode] = useState<CloseMode | null>(null);
  const [saved, setSaved] = useState(false);

  // بالقروش: القسمة لتحت، والقروش الزيادة على آخر سطر — المجموع مظبوط بالقرش
  const perUnit = N > 0 ? Math.trunc(R / N) : 0;
  const leftover = R - perUnit * N;

  const factoryOwed = factory ? -factory.balance : 0;
  const factoryAfter = factoryOwed - R;

  const options: { id: CloseMode; title: string; when: string; result: React.ReactNode; disabled?: string }[] = [
    {
      id: "spread",
      title: negative ? "قلّل تكلفة القطع" : "وزّعه على القطع",
      when: negative ? "السعر اللي كتبته كان أعلى من اللي صرفته" : "فلوس اتصرفت فعلاً — سقطات، هالك",
      result: (
        <>
          كل قطعة من الـ <Num value={N} /> اللي في المخزن {negative ? "تقل" : "تزيد"}{" "}
          <span className="num font-bold">{money2(Math.abs(perUnit))}</span> ج
        </>
      ),
      disabled: N === 0 ? "كل قطع الأمر اتباعت — مفيش حاجة يتوزع عليها" : undefined,
    },
    ...(!negative
      ? [
          {
            id: "factory" as const,
            title: "المصنع عليه الباقي",
            when: "المصنع خد فلوس ومسلّمش بيها",
            result: factory ? (
              <>
                {factory.name}:{" "}
                {factoryAfter >= 0 ? (
                  <>
                    ليه <Money value={factoryOwed} className="text-ink-mute" /> ← <Money value={factoryAfter} className="font-bold" />
                  </>
                ) : (
                  <>
                    هيبقى عليه <Money value={-factoryAfter} className="font-bold text-pos" />
                  </>
                )}
              </>
            ) : null,
            disabled: factory ? undefined : "الأمر لسه من غير مصنع",
          },
        ]
      : []),
    {
      id: "loss",
      title: negative ? "مكسب" : "خسارة",
      when: negative ? "كل القطع اتباعت" : "فلوس راحت ومش هترجع",
      result: (
        <>
          {negative ? "هيزوّد" : "هتنزل من"} الربح <Money value={Math.abs(R)} className="font-bold" /> ج
        </>
      ),
    },
  ];

  const ready = R === 0 || (mode !== null && !options.find((o) => o.id === mode)?.disabled);

  if (saved) {
    const chosen = options.find((o) => o.id === mode);
    return (
      <>
        <PageHeader title="اتحفظ" />
        <Page>
          <Card className="px-5 py-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-pos-soft text-pos">
              <Check size={28} strokeWidth={3} />
            </div>
            <div className="mt-4 text-[20px] font-bold">{jobTitle(job)} اتقفل</div>
            <div className="mt-2 text-[14px] text-ink-soft">
              {R === 0 ? "على صفر — مفيش فاضل" : chosen?.result}
            </div>
            <div className="mt-4 text-[12px] text-ink-mute">
              اتصرف <Money value={s.spent} /> · وصل <Num value={s.receivedPieces} /> قطعة
            </div>
          </Card>
          <Link
            href="/jobs"
            className="press mt-4 block rounded-2xl bg-brand py-3.5 text-center text-[15px] font-bold text-brand-ink"
          >
            أوامر التصنيع
          </Link>
        </Page>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`قفل ${jobTitle(job)}`}
        sub={[factory?.name, job.name].filter(Boolean).join(" · ")}
        back={`/jobs/${job.id}`}
      />
      <Page>
        <Card className="mb-4 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 text-[14px]">
            <span className="text-ink-soft">اتصرف عليه</span>
            <Money value={s.spent} className="font-semibold" />
          </div>
          <div className="flex items-center justify-between border-t border-line-soft px-4 py-3 text-[14px]">
            <span className="text-ink-soft">
              وصل منه <Num value={s.receivedPieces} /> قطعة
            </span>
            <Money value={s.receivedValue} className="font-semibold" />
          </div>
          <div className="flex items-center justify-between border-t border-line bg-sunken/60 px-4 py-3.5">
            <span className="text-[14px] font-semibold">{negative ? "بالسالب" : "فاضل فيه"}</span>
            <Money value={Math.abs(R)} className={`text-[22px] font-bold ${negative ? "text-neg" : ""}`} />
          </div>
        </Card>

        {R === 0 ? (
          <p className="mb-5 px-1 text-[14px] leading-relaxed text-ink-soft">
            الأمر هيتقفل على صفر — كل اللي اتصرف طلع في البضاعة اللي وصلت.
          </p>
        ) : (
          <>
            <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">
              {negative ? "الفرق ده يروح فين؟" : "الفاضل ده يروح فين؟"}
            </div>
            <div className="mb-4 space-y-2">
              {options.map((o) => {
                const active = mode === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    disabled={!!o.disabled}
                    onClick={() => setMode(o.id)}
                    aria-pressed={active}
                    className={`press block w-full rounded-2xl border px-4 py-3.5 text-start disabled:opacity-45 ${
                      active ? "border-brand bg-brand-soft" : "border-line bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`flex-1 text-[15px] font-bold ${active ? "text-brand" : ""}`}>{o.title}</span>
                      {active && <Check size={17} className="text-brand" />}
                    </div>
                    <div className="mt-0.5 text-[12px] text-ink-mute">{o.disabled ?? o.when}</div>
                    {!o.disabled && o.result && <div className="mt-2 text-[13px] text-ink-soft">{o.result}</div>}
                  </button>
                );
              })}
            </div>

            {mode === "spread" && N > 0 && (
              <p className="mb-4 px-1 text-[12px] leading-relaxed text-ink-mute">
                <span className="num">{money2(Math.abs(R))}</span> ÷ <Num value={N} /> قطعة.{" "}
                {leftover !== 0 && <>القروش الزيادة (<span className="num">{money2(Math.abs(leftover))}</span>) على آخر دفعة. </>}
                القطع اللي اتباعت ربحها متغيرش.
              </p>
            )}
          </>
        )}

        <p className="mb-4 px-1 text-[12px] text-ink-mute">بعد القفل الأمر مبيقبلش صرف ولا استلام جديد.</p>

        <button
          type="button"
          disabled={!ready}
          onClick={() => setSaved(true)}
          className="press w-full rounded-2xl bg-brand py-4 text-[16px] font-bold text-brand-ink disabled:opacity-35"
        >
          قفل الأمر
        </button>
      </Page>
    </>
  );
}

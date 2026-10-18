import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, Money, Page, PageHeader, SectionTitle } from "@/components/ui";
import { shortDate } from "@/lib/format";
import { byId, fabricBuys, fabricSends, jobById, jobTitle, totals } from "@/lib/mock";

/**
 * القماش اللي في المحل — بالفلوس بس، من غير متر ولا أنواع (الـ spec، قسم 5).
 * بيزيد بالشراية للمحل، وبيقل لما يبعت منه لأمر تصنيع («صرفت · قماش · من عندي»).
 */
export default function FabricPage() {
  type Move = { key: string; date: string; title: string; sub: string; amount: number; out: boolean; href: string };
  const moves: Move[] = [
    ...fabricBuys.map((b): Move => ({
      key: b.id,
      date: b.date,
      title: `اشتريت · ${byId(b.supplierId)?.name}`,
      sub: [b.note, b.paid >= b.amount ? "دفعت كله" : b.paid > 0 ? "دفعت جزء" : "على الحساب"].filter(Boolean).join(" · "),
      amount: b.amount,
      out: false,
      href: `/accounts/${b.supplierId}`,
    })),
    ...fabricSends().map((c): Move => {
      const j = jobById(c.jobId)!;
      return {
        key: c.id,
        date: c.date,
        title: `بعت لـ ${jobTitle(j)} · ${byId(j.factoryId ?? "")?.name ?? ""}`,
        sub: c.note ?? "",
        amount: c.amount,
        out: true,
        href: `/jobs/${j.id}`,
      };
    }),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHeader
        title="القماش اللي عندي"
        back="/more"
        action={
          <Link
            href="/fabric/buy"
            className="press flex items-center gap-1 rounded-xl bg-brand px-3 py-1.5 text-[13px] font-bold text-brand-ink"
          >
            <Plus size={16} strokeWidth={2.6} />
            شراء
          </Link>
        }
      />
      <Page>
        <Card className="mb-5 px-5 py-5">
          <div className="text-[13px] font-semibold text-ink-mute">قماش في المحل</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <Money value={totals.fabric} className="text-[34px] font-bold leading-none" />
            <span className="text-[14px] text-ink-mute">ج</span>
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-ink-mute">
            اشتريته ولسه مبعتوش لمصنع. لما تبعت منه، سجّله من جوه الأمر: «صرفت ← قماش ← من عندي».
          </p>
        </Card>

        <SectionTitle>الحركة</SectionTitle>
        <Card className="overflow-hidden">
          {moves.map((m, i) => (
            <Link key={m.key} href={m.href} className={`press block active:bg-sunken ${i > 0 ? "border-t border-line-soft" : ""}`}>
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="num w-10 shrink-0 text-[12px] text-ink-mute">{shortDate(m.date)}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-semibold">{m.title}</div>
                  {m.sub && <div className="mt-0.5 truncate text-[12px] text-ink-mute">{m.sub}</div>}
                </div>
                <span className={`text-[14px] font-bold ${m.out ? "text-ink-soft" : "text-pos"}`}>
                  <Money value={m.amount} sign={m.out ? "−" : "+"} />
                </span>
              </div>
            </Link>
          ))}
        </Card>
        <p className="mt-3 px-1 text-[12px] text-ink-mute">
          القماش اللي بتشتريه وتبعته للمصنع على طول مبيعدّيش هنا — بيدخل الأمر مباشرة.
        </p>
      </Page>
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock, PackagePlus, Wallet } from "lucide-react";
import { Badge, Card, Money, Num, Page, PageHeader, SectionTitle } from "@/components/ui";
import { shortDate } from "@/lib/format";
import {
  byId,
  cashAccounts,
  costItemById,
  jobById,
  jobSummary,
  jobTitle,
  receiptPieces,
  receiptValue,
} from "@/lib/mock";

const CLOSE_LABEL = {
  spread: "الفاضل اتوزع على القطع",
  factory: "الفاضل اتنقل على المصنع",
  loss: "الفاضل اتحسب خسارة",
} as const;

/**
 * جوه الأمر (الـ spec، قسم 5): اتصرف كام · وصل كام · فاضل كام،
 * وتحتهم كل حركة بالترتيب — الصرف بيزوّد الأمر والاستلام بيقلله.
 */
export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const j = jobById(id);
  if (!j) notFound();

  const s = jobSummary(j);
  const factory = j.factoryId ? byId(j.factoryId) : undefined;
  const open = !j.closedAt;

  type Move = { key: string; date: string; title: string; sub: string; amount: number; out: boolean };
  const moves: Move[] = [
    ...s.costs.map((c): Move => {
      const who = c.partyId ? byId(c.partyId)?.name : undefined;
      const from = cashAccounts.find((a) => a.id === c.accountId)?.name;
      const how = c.fromStock
        ? "من القماش اللي في المحل"
        : c.paid >= c.amount
          ? `دفعت كله${from ? ` من ${from}` : ""}`
          : c.paid > 0
            ? "دفعت جزء"
            : "على الحساب";
      return {
        key: c.id,
        date: c.date,
        title: [costItemById(c.itemId)?.label, c.fromStock ? "من عندي" : who].filter(Boolean).join(" · "),
        sub: [c.note, how].filter(Boolean).join(" · "),
        amount: c.amount,
        out: false,
      };
    }),
    ...s.receipts.map((r): Move => ({
      key: r.id,
      date: r.date,
      title: `استلام ${receiptPieces(r)} قطعة`,
      sub: r.lines.map((l) => `${l.code} × ${l.qty} × ${l.unitCost / 100}`).join(" · "),
      amount: receiptValue(r),
      out: true,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHeader
        title={`${jobTitle(j)} · ${factory?.name ?? "لسه من غير مصنع"}`}
        sub={j.name}
        back="/jobs"
        action={open ? <Badge tone="brand">مفتوح</Badge> : <Badge>اتقفل</Badge>}
      />
      <Page>
        {/* --------------------------- الأرقام التلاتة --------------------------- */}
        <Card className="mb-4 overflow-hidden">
          <Line label="اتصرف عليه" value={<Money value={s.spent} className="font-bold" />} />
          <Line
            label={
              <>
                وصل منه <Num value={s.receivedPieces} /> قطعة
              </>
            }
            value={<Money value={s.receivedValue} className="font-bold" />}
          />
          <div className="flex items-center justify-between border-t border-line bg-sunken/60 px-4 py-3.5">
            <span className="text-[14px] font-semibold">{s.remaining < 0 ? "بالسالب" : "فاضل فيه"}</span>
            <Money
              value={Math.abs(s.remaining)}
              className={`text-[22px] font-bold ${s.remaining < 0 ? "text-neg" : ""}`}
            />
          </div>
          {s.inStock > 0 && (
            <div className="border-t border-line-soft px-4 py-2.5 text-[12px] text-ink-mute">
              لسه في المخزن منه <Num value={s.inStock} className="font-semibold text-ink-soft" /> قطعة
            </div>
          )}
          {!open && (
            <div className="border-t border-line-soft px-4 py-2.5 text-[12px] text-ink-mute">
              اتقفل <span className="num">{shortDate(j.closedAt!)}</span>
              {j.closeMode ? ` · ${CLOSE_LABEL[j.closeMode]}` : " · على صفر"}
            </div>
          )}
        </Card>

        {/* ------------------------------ الإجراءات ------------------------------ */}
        {open && (
          <div className="mb-5 grid grid-cols-3 gap-2">
            <Action href={`/jobs/${j.id}/spend`} icon={<Wallet size={18} />} label="صرفت" primary />
            <Action href={`/receive?job=${j.id}`} icon={<PackagePlus size={18} />} label="استلام" />
            <Action href={`/jobs/${j.id}/close`} icon={<Lock size={18} />} label="قفل الأمر" />
          </div>
        )}

        {/* ------------------------------ اتصرف على إيه ------------------------------ */}
        {s.byItem.length > 0 && (
          <>
            <SectionTitle>اتصرف على إيه</SectionTitle>
            <Card className="mb-5 overflow-hidden">
              {s.byItem.map((x, i) => (
                <div key={x.id} className={`flex items-center justify-between px-4 py-2.5 text-[14px] ${i > 0 ? "border-t border-line-soft" : ""}`}>
                  <span className="text-ink-soft">{x.label}</span>
                  <Money value={x.amount} className="font-semibold" />
                </div>
              ))}
            </Card>
          </>
        )}

        {/* -------------------------------- الحركة -------------------------------- */}
        <SectionTitle>الحركة</SectionTitle>
        <Card className="overflow-hidden">
          {moves.map((m, i) => (
            <div key={m.key} className={i > 0 ? "border-t border-line-soft" : ""}>
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="num w-10 shrink-0 text-[12px] text-ink-mute">{shortDate(m.date)}</span>
                <div className="min-w-0 flex-1">
                  <div className={`text-[14px] font-medium ${m.out ? "text-pos" : ""}`}>{m.title}</div>
                  {m.sub && <div className="num mt-0.5 text-[12px] leading-snug text-ink-mute">{m.sub}</div>}
                </div>
                <Money value={m.amount} className={`shrink-0 text-[14px] font-bold ${m.out ? "text-pos" : ""}`} />
              </div>
            </div>
          ))}
        </Card>
        <p className="mt-3 px-1 text-[12px] text-ink-mute">
          <span className="font-semibold text-pos">الأخضر</span> = استلام، بيقلل الفاضل في الأمر.
        </p>

        {factory && (
          <Link href={`/accounts/${factory.id}`} className="mt-4 block text-center text-[13px] font-semibold text-brand">
            كشف حساب {factory.name}
          </Link>
        )}
      </Page>
    </>
  );
}

function Line({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-t border-line-soft px-4 py-3 text-[14px] first:border-t-0">
      <span className="text-ink-soft">{label}</span>
      {value}
    </div>
  );
}

function Action({ href, icon, label, primary }: { href: string; icon: React.ReactNode; label: string; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={`press flex flex-col items-center justify-center gap-1.5 rounded-2xl border py-3.5 ${
        primary ? "border-transparent bg-brand text-brand-ink" : "border-line bg-card text-ink-soft"
      }`}
    >
      {icon}
      <span className="text-[12px] font-semibold">{label}</span>
    </Link>
  );
}

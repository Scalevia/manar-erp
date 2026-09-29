import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Badge, Card, Money, Num, Page, PageHeader } from "@/components/ui";
import { monthName } from "@/lib/format";
import {
  byId,
  cashAccounts,
  invoiceByNo,
  invoiceKind,
  invoicePieces,
  invoices,
  invoiceTotal,
  modelByCode,
} from "@/lib/mock";

export function generateStaticParams() {
  return invoices.map((inv) => ({ no: String(inv.no) }));
}

const DAYS = ["الحد", "الاتنين", "التلات", "الأربع", "الخميس", "الجمعة", "السبت"];

const KIND = {
  cash: { label: "نقدي", tone: "pos" as const },
  partial: { label: "دفع جزئي", tone: "warn" as const },
  credit: { label: "آجل", tone: "neutral" as const },
};

export default async function InvoicePage({ params }: { params: Promise<{ no: string }> }) {
  const { no } = await params;
  const inv = invoiceByNo(Number(no));
  if (!inv) notFound();

  const party = byId(inv.partyId);
  const walkIn = !!party?.isCash;
  const total = invoiceTotal(inv);
  const remaining = Math.max(0, total - inv.paid);
  const kind = KIND[invoiceKind(inv)];
  const account = cashAccounts.find((a) => a.id === inv.accountId);

  const d = new Date(inv.date);
  const when = `${DAYS[d.getDay()]} ${d.getDate()} ${monthName(inv.date)}`;

  return (
    <>
      <PageHeader title={`فاتورة #${inv.no}`} sub={when} back="/invoices" />

      <Page>
        {/* ------------------------------- العميل ------------------------------- */}
        <Card className="mb-4 overflow-hidden">
          {walkIn ? (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <span className="flex-1 text-[15px] font-semibold">بيع نقدي</span>
              <Badge tone={kind.tone}>{kind.label}</Badge>
            </div>
          ) : (
            <Link href={`/accounts/${inv.partyId}`} className="press block active:bg-sunken">
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-semibold">{party?.name}</div>
                  <div className="mt-0.5 text-[12px] text-ink-mute">كشف حسابه</div>
                </div>
                <Badge tone={kind.tone}>{kind.label}</Badge>
                <ChevronLeft size={17} className="shrink-0 text-ink-mute" />
              </div>
            </Link>
          )}
          <div className="border-t border-line-soft px-4 py-2.5 text-[12px] text-ink-mute">
            الساعة <span className="num">{inv.time}</span> · <Num value={invoicePieces(inv)} /> قطعة
          </div>
        </Card>

        {/* ------------------------------- السطور ------------------------------- */}
        <Card className="mb-4 overflow-hidden">
          <div className="flex items-center gap-3 bg-sunken px-4 py-2 text-[11px] font-semibold text-ink-mute">
            <span className="w-12 shrink-0">الموديل</span>
            <span className="flex-1">العدد × السعر</span>
            <span className="shrink-0 text-end">الإجمالي</span>
          </div>
          {inv.lines.map((l, i) => (
            <div key={i} className="border-t border-line-soft">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-12 shrink-0">
                  <div className="num text-[16px] font-bold">{l.code}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px]">
                    <span className="num">{l.qty}</span> × <Money value={l.price} /> ج
                  </div>
                  {modelByCode(l.code)?.name && (
                    <div className="mt-0.5 truncate text-[12px] text-ink-mute">
                      {modelByCode(l.code)?.name}
                    </div>
                  )}
                </div>
                <Money value={l.qty * l.price} className="shrink-0 text-[15px] font-bold" />
              </div>
            </div>
          ))}
        </Card>

        {/* ------------------------------- الحساب ------------------------------- */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[14px] font-semibold">الإجمالي</span>
            <Money value={total} className="text-[20px] font-bold" />
          </div>
          <div className="flex items-center justify-between border-t border-line-soft px-4 py-3">
            <span className="text-[14px] text-ink-soft">
              دفع وقت البيع{account ? ` ← ${account.name}` : ""}
            </span>
            <Money value={inv.paid} className="text-[15px] font-semibold text-pos" />
          </div>
          {!walkIn && (
            <div className="flex items-center justify-between border-t border-line-soft px-4 py-3">
              <span className="text-[14px] text-ink-soft">اتكتب عليه</span>
              <Money
                value={remaining}
                className={`text-[15px] font-bold ${remaining > 0 ? "text-neg" : "text-ink"}`}
              />
            </div>
          )}
        </Card>

        {!walkIn && remaining > 0 && (
          <p className="mt-3 px-1 text-[12px] leading-relaxed text-ink-mute">
            ده اللي اتكتب عليه يوم الفاتورة. اللي دفعه بعد كده بيظهر في كشف حسابه.
          </p>
        )}
      </Page>
    </>
  );
}

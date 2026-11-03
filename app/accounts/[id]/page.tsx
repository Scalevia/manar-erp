"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HandCoins, HeartHandshake, Phone } from "lucide-react";
import { Badge, Card, Empty, ModelTag, Money, Num, Page, PageHeader, SectionTitle } from "@/components/ui";
import { formatPhone, pct, shortDate, since } from "@/lib/format";
import {
  byId,
  customerStatsOf,
  invoiceKind,
  invoicePieces,
  invoicesOf,
  invoiceTotal,
  isCollectFrom,
  modelById,
  paymentTitle,
  statementOf,
  TODAY,
  type Party,
} from "@/lib/mock";

function kindLabel(x: Party) {
  if (x.kind === "customer") return "عميل";
  if (x.kind === "supplier") return "مصنع أو تاجر";
  return x.balance > 0 ? "سلفة · سلّفته" : "سلفة · استلفت منه";
}

export default function StatementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const party = byId(id);
  if (!party) notFound();

  const rows = statementOf(id);
  const owesMe = party.balance > 0;
  // المصنع اللي «عليه» = عنده فلوس مقدّم لسه مستلمتش بيها بضاعة
  const isSupplier = party.kind === "supplier";
  // الزرار: العميل تحصيل، المصنع «دفعة تحت الحساب» دايماً (وفي الشاشة يقدر يعكس)
  const collect = isCollectFrom(party);
  const payLabel = paymentTitle(party, collect);
  const amount = Math.abs(party.balance);
  const settled = party.balance === 0;

  return (
    <>
      <PageHeader
        title={party.name}
        sub={
          <>
            {kindLabel(party)}
            {party.phone && (
              <>
                {" · "}
                <span className="num">{formatPhone(party.phone)}</span>
              </>
            )}
          </>
        }
        back={
          // يرجع لتبويبه في الحسابات — التبويبات بالنوع
          party.kind === "customer" ? "/accounts" : party.kind === "supplier" ? "/accounts?tab=suppliers" : "/accounts?tab=loans"
        }
      />

      <Page>
        {/* --------------------------------- الرصيد --------------------------------- */}
        <Card className="mb-3 px-5 py-5 text-center">
          {settled ? (
            <div className="text-[16px] font-semibold text-ink-mute">الحساب مقفول</div>
          ) : (
            <>
              <div
                className={`text-[13px] font-semibold ${owesMe ? "text-pos" : "text-neg"}`}
              >
                {owesMe ? (isSupplier ? "عنده مقدّم — لسه مستلمتش بيه بضاعة" : "ليا عنده") : "عليا له"}
              </div>
              <div className="mt-1 flex items-baseline justify-center gap-1.5">
                <Money
                  value={amount}
                  className={`text-[38px] font-bold leading-none ${
                    owesMe ? "text-pos" : "text-neg"
                  }`}
                />
                <span className="text-[15px] font-semibold text-ink-mute">ج</span>
              </div>
              {owesMe && !isSupplier && party.oldestDue && (
                <div className="mt-2 text-[12px] text-ink-mute">
                  أقدم مبلغ {since(party.oldestDue, new Date(TODAY))}
                </div>
              )}
              {party.dueDate && (
                <div className="mt-2 text-[12px] font-semibold text-warn">
                  ميعاد الرجوع <span className="num">{shortDate(party.dueDate)}</span>
                </div>
              )}
            </>
          )}
        </Card>

        {/* -------------------------------- الإجراءات -------------------------------- */}
        {/* المرتجع في «المزيد» بس، مش هنا */}
        <div className="mb-5 grid grid-cols-3 gap-2">
          <Action
            icon={<HandCoins size={18} />}
            label={payLabel}
            href={`/payments?party=${party.id}`}
            primary
          />
          <Action
            icon={<HeartHandshake size={18} />}
            label="مسامحة"
            href={`/settle?party=${party.id}`}
            disabled={party.balance === 0}
          />
          {/* tel: بيفتح تطبيق الاتصال على الآيفون بالرقم جاهز */}
          <Action
            icon={<Phone size={18} />}
            label="اتصال"
            href={party.phone ? `tel:${party.phone}` : undefined}
            disabled={!party.phone}
          />
        </div>

        {party.kind === "customer" && <CustomerDetails partyId={party.id} />}

        {/* ------------------------------- كشف الحساب ------------------------------- */}
        <h2 className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">كشف الحساب</h2>

        <Card className="overflow-hidden">
          {rows.length === 0 ? (
            <Empty>مفيش حركات مسجلة</Empty>
          ) : (
            <>
              {/* عناوين الأعمدة — من غيرها مش باين أنهي رقم الحركة وأنهي الرصيد */}
              <div className="flex items-center gap-3 bg-sunken px-4 py-2 text-[11px] font-semibold text-ink-mute">
                <span className="w-10 shrink-0">التاريخ</span>
                <span className="flex-1">الحركة</span>
                <span className="w-20 shrink-0 text-end">المبلغ</span>
                <span className="w-24 shrink-0 text-end">الرصيد بعدها</span>
              </div>

              {rows.map((r) => {
                // الأخضر = الدين قلّ (دفع أو مرتجع أو مسامحة). مفيش إشارة سالب يفكر فيها.
                const reduces = r.amount < 0;
                return (
                  <div key={r.id} className="border-t border-line-soft">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <span className="num w-10 shrink-0 text-[12px] text-ink-mute">
                        {shortDate(r.date)}
                      </span>
                      <span
                        className={`min-w-0 flex-1 text-[13px] leading-snug ${reduces ? "text-pos" : ""}`}
                      >
                        {r.label}
                      </span>
                      <Money
                        value={Math.abs(r.amount)}
                        className={`w-20 shrink-0 text-end text-[14px] font-semibold ${
                          reduces ? "text-pos" : "text-ink"
                        }`}
                      />
                      {/* كل سطر بيقول اتجاهه: المصنع ممكن يبدأ «عليه» (دفعتله تمن قماش)
                          وبعد البضاعة يبقى «ليه» — رقم من غير اتجاه هنا يلخبط */}
                      <span className="w-24 shrink-0 text-end text-[12px] text-ink-mute">
                        {r.balance === 0 ? (
                          "خالص"
                        ) : (
                          <>
                            {r.balance > 0 ? (isSupplier ? "مقدّم " : "عليه ") : "ليه "}
                            <Money value={Math.abs(r.balance)} className="text-[13px]" />
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </Card>

        {rows.length > 0 && (
          <p className="mt-3 px-1 text-[12px] text-ink-mute">
            <span className="font-semibold text-pos">الأخضر</span> = حركة قللت{" "}
            {collect ? "اللي عليه" : "اللي ليه"}.
          </p>
        )}
      </Page>
    </>
  );
}

/* ------------------------------------------------------------------ */

const KIND: Record<ReturnType<typeof invoiceKind>, { label: string; tone: "pos" | "warn" | "neutral" }> = {
  cash: { label: "نقدي", tone: "pos" },
  partial: { label: "جزئي", tone: "warn" },
  credit: { label: "آجل", tone: "neutral" },
};

const FIRST = 5;

/** تفاصيل العميل: ملخص شغله، والموديلات اللي بياخدها، وفواتيره */
function CustomerDetails({ partyId }: { partyId: string }) {
  const [allInvoices, setAllInvoices] = useState(false);
  const [allModels, setAllModels] = useState(false);
  const stats = customerStatsOf(partyId);
  if (!stats) return null;

  const invs = invoicesOf(partyId);
  const margin = stats.sales > 0 ? (stats.profit / stats.sales) * 100 : 0;

  return (
    <>
      {/* ------------------------------- ملخص شغله ------------------------------- */}
      <SectionTitle>ملخص شغله</SectionTitle>
      <div className="mb-5 grid grid-cols-2 gap-2">
        <Card className="px-4 py-3">
          <div className="text-[12px] font-semibold text-ink-mute">اشترى بـ</div>
          <Money value={stats.sales} className="mt-1 block text-[20px] font-bold" />
        </Card>
        <Card className="px-4 py-3">
          <div className="text-[12px] font-semibold text-ink-mute">كسبت منه</div>
          <Money value={stats.profit} className={`mt-1 block text-[20px] font-bold ${stats.profit < 0 ? "text-neg" : "text-pos"}`} />
          {stats.sales > 0 && <div className="text-[11px] text-ink-mute">{pct(margin)} من البيع</div>}
        </Card>
        <Card className="px-4 py-3">
          <div className="text-[12px] font-semibold text-ink-mute">
            <Num value={stats.invoices} /> فاتورة
          </div>
          <div className="mt-1 text-[20px] font-bold">
            <Num value={stats.pieces} /> <span className="text-[13px] font-semibold text-ink-mute">قطعة</span>
          </div>
          {stats.returned > 0 && (
            <div className="text-[11px] text-ink-mute">
              بعد مرتجع <Num value={stats.returned} />
            </div>
          )}
        </Card>
        <Card className="px-4 py-3">
          <div className="text-[12px] font-semibold text-ink-mute">آخر شراية</div>
          <div className="mt-1 text-[16px] font-bold">{stats.lastSale ? since(stats.lastSale, new Date(TODAY)) : "—"}</div>
          {stats.lastSale && <div className="num text-[11px] text-ink-mute">{shortDate(stats.lastSale)}</div>}
        </Card>
      </div>

      {/* ------------------------- الموديلات اللي بياخدها ------------------------- */}
      {stats.models.length > 0 && (
        <>
          <SectionTitle>الموديلات اللي بياخدها</SectionTitle>
          <Card className="mb-5 overflow-hidden">
            <div className="flex items-center gap-3 bg-sunken px-4 py-2 text-[11px] font-semibold text-ink-mute">
              <span className="flex-1">الموديل</span>
              <span className="w-16 shrink-0 text-end">خد</span>
              <span className="w-20 shrink-0 text-end">آخر سعر</span>
            </div>
            {(allModels ? stats.models : stats.models.slice(0, FIRST)).map((x) => {
              const m = modelById(x.modelId);
              return (
                <Link key={x.modelId} href={`/inventory/${x.modelId}`} className="press block border-t border-line-soft active:bg-sunken">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <ModelTag code={m?.code} name={m?.name} />
                      {m?.code !== undefined && m.name && <span className="truncate text-[12px] text-ink-mute">{m.name}</span>}
                    </div>
                    <span className="w-16 shrink-0 text-end text-[13px]">
                      <Num value={x.qty} className="font-semibold" /> <span className="text-ink-mute">قطعة</span>
                    </span>
                    <Money value={x.lastPrice} decimals className="w-20 shrink-0 text-end text-[14px] font-semibold" />
                  </div>
                </Link>
              );
            })}
            {stats.models.length > FIRST && (
              <ShowAll open={allModels} count={stats.models.length} onClick={() => setAllModels((v) => !v)} />
            )}
          </Card>
        </>
      )}

      {/* --------------------------------- فواتيره --------------------------------- */}
      {invs.length > 0 && (
        <>
          <SectionTitle>فواتيره</SectionTitle>
          <Card className="mb-5 overflow-hidden">
            {(allInvoices ? invs : invs.slice(0, FIRST)).map((inv, i) => {
              const kind = KIND[invoiceKind(inv)];
              return (
                <div key={inv.no}>
                  {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                  <Link href={`/invoices/${inv.no}`} className="press block active:bg-sunken">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="num text-[15px] font-semibold">#{inv.no}</span>
                          <Badge tone={kind.tone}>{kind.label}</Badge>
                        </div>
                        <div className="mt-0.5 text-[12px] text-ink-mute">
                          <span className="num">{shortDate(inv.date)}</span> · <Num value={invoicePieces(inv)} /> قطعة
                        </div>
                      </div>
                      <Money value={invoiceTotal(inv)} className="text-[15px] font-bold" />
                    </div>
                  </Link>
                </div>
              );
            })}
            {invs.length > FIRST && (
              <ShowAll open={allInvoices} count={invs.length} onClick={() => setAllInvoices((v) => !v)} />
            )}
          </Card>
        </>
      )}
    </>
  );
}

function ShowAll({ open, count, onClick }: { open: boolean; count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="press block w-full border-t border-line-soft py-3 text-center text-[13px] font-semibold text-brand active:bg-sunken"
    >
      {open ? "أقل" : <>عرض الكل (<Num value={count} />)</>}
    </button>
  );
}

function Action({
  icon,
  label,
  href,
  primary,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  primary?: boolean;
  disabled?: boolean;
}) {
  const className = `press flex flex-col items-center justify-center gap-1.5 rounded-2xl border py-3.5 ${
    primary ? "border-transparent bg-brand text-brand-ink" : "border-line bg-card text-ink-soft"
  } ${disabled ? "pointer-events-none opacity-40" : ""}`;

  const body = (
    <>
      {icon}
      <span className="text-[12px] font-semibold">{label}</span>
    </>
  );

  if (!href || disabled)
    return (
      <button type="button" disabled={disabled} className={className}>
        {body}
      </button>
    );

  // tel: لازم يبقى <a> عادي — Link بتاع Next للصفحات جوه البرنامج بس
  if (href.startsWith("tel:"))
    return (
      <a href={href} className={className}>
        {body}
      </a>
    );

  return (
    <Link href={href} className={className}>
      {body}
    </Link>
  );
}

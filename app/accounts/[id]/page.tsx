import Link from "next/link";
import { notFound } from "next/navigation";
import { HandCoins, HeartHandshake, Phone } from "lucide-react";
import { Card, Empty, Money, Page, PageHeader } from "@/components/ui";
import { formatPhone, shortDate, since } from "@/lib/format";
import { byId, statementOf, TODAY } from "@/lib/mock";

const KIND_LABEL = {
  customer: "عميل",
  factory: "مصنع",
  supplier: "تاجر قماش",
} as const;

export default async function StatementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const party = byId(id);
  if (!party) notFound();

  const rows = statementOf(id);
  const owesMe = party.balance > 0;
  const amount = Math.abs(party.balance);
  const settled = party.balance === 0;

  return (
    <>
      <PageHeader
        title={party.name}
        sub={
          <>
            {KIND_LABEL[party.kind]}
            {party.phone && (
              <>
                {" · "}
                <span className="num">{formatPhone(party.phone)}</span>
              </>
            )}
          </>
        }
        back={party.kind === "customer" ? "/accounts" : "/accounts?tab=payable"}
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
                {owesMe ? "ليا عنده" : "عليا له"}
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
              {owesMe && party.oldestDue && (
                <div className="mt-2 text-[12px] text-ink-mute">
                  أقدم مبلغ {since(party.oldestDue, new Date(TODAY))}
                </div>
              )}
            </>
          )}
        </Card>

        {/* -------------------------------- الإجراءات -------------------------------- */}
        <div className="mb-5 grid grid-cols-3 gap-2">
          <Action
            icon={<HandCoins size={18} />}
            label={party.kind === "customer" ? "تحصيل" : "دفع"}
            href={`/payments?party=${party.id}`}
            primary
          />
          <Action icon={<HeartHandshake size={18} />} label="مسامحة" />
          {/* tel: بيفتح تطبيق الاتصال على الآيفون بالرقم جاهز */}
          <Action
            icon={<Phone size={18} />}
            label="اتصال"
            href={party.phone ? `tel:${party.phone}` : undefined}
            disabled={!party.phone}
          />
        </div>

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
                <span className="w-20 shrink-0 text-end">
                  {party.kind === "customer" ? "عليه بعدها" : "ليه بعدها"}
                </span>
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
                        className={`min-w-0 flex-1 truncate text-[14px] ${reduces ? "text-pos" : ""}`}
                      >
                        {r.label}
                      </span>
                      <Money
                        value={Math.abs(r.amount)}
                        className={`w-20 shrink-0 text-end text-[14px] font-semibold ${
                          reduces ? "text-pos" : "text-ink"
                        }`}
                      />
                      <Money
                        value={Math.abs(r.balance)}
                        className="w-20 shrink-0 text-end text-[13px] text-ink-mute"
                      />
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
            {party.kind === "customer" ? "اللي عليه" : "اللي ليه"}.
          </p>
        )}
      </Page>
    </>
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

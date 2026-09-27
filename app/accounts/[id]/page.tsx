import { notFound } from "next/navigation";
import { HandCoins, HeartHandshake, Phone } from "lucide-react";
import { Card, Empty, Money, Page, PageHeader } from "@/components/ui";
import { shortDate, since } from "@/lib/format";
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
        sub={KIND_LABEL[party.kind]}
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
            label={owesMe ? "تحصيل" : "دفع"}
            primary
          />
          <Action icon={<HeartHandshake size={18} />} label="مسامحة" />
          <Action icon={<Phone size={18} />} label="اتصال" disabled={!party.phone} />
        </div>

        {/* ------------------------------- كشف الحساب ------------------------------- */}
        <div className="mb-2 flex items-baseline justify-between px-1">
          <h2 className="text-[13px] font-semibold text-ink-mute">كشف الحساب</h2>
          <span className="text-[12px] text-ink-mute">الرصيد بعد كل حركة</span>
        </div>

        <Card className="overflow-hidden">
          {rows.length === 0 ? (
            <Empty>مفيش حركات مسجلة</Empty>
          ) : (
            rows.map((r, i) => (
              <div key={r.id}>
                {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="num w-10 shrink-0 text-[12px] text-ink-mute">
                    {shortDate(r.date)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[14px]">{r.label}</span>
                  <span
                    className={`w-20 shrink-0 text-end text-[14px] font-semibold ${
                      r.amount < 0 ? "text-pos" : "text-ink"
                    }`}
                  >
                    {r.amount < 0 && <span className="num">−</span>}
                    <Money value={Math.abs(r.amount)} />
                  </span>
                  <span className="w-20 shrink-0 text-end text-[13px] text-ink-mute">
                    <Money value={Math.abs(r.balance)} />
                  </span>
                </div>
              </div>
            ))
          )}
        </Card>
      </Page>
    </>
  );
}

function Action({
  icon,
  label,
  primary,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`press flex flex-col items-center justify-center gap-1.5 rounded-2xl border py-3.5 ${
        primary
          ? "border-transparent bg-brand text-brand-ink"
          : "border-line bg-card text-ink-soft"
      } ${disabled ? "opacity-40" : ""}`}
    >
      {icon}
      <span className="text-[12px] font-semibold">{label}</span>
    </button>
  );
}

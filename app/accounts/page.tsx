import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Badge, Card, Empty, Money, Page, PageHeader } from "@/components/ui";
import { daysSince, since } from "@/lib/format";
import { payables, receivables, totals, TODAY, type Party } from "@/lib/mock";

const LATE_DAYS = 90;

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const showPayable = tab === "payable";

  const rows = showPayable ? payables() : receivables();

  return (
    <>
      <PageHeader title="الحسابات" />
      <Page>
        {/* --------------------------------- التبّين -------------------------------- */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          <TabCard
            href="/accounts"
            active={!showPayable}
            label="ليا في السوق"
            value={totals.receivable}
            tone="pos"
          />
          <TabCard
            href="/accounts?tab=payable"
            active={showPayable}
            label="اللي عليا"
            value={totals.payable}
            tone="neg"
          />
        </div>

        {/* --------------------------------- القايمة -------------------------------- */}
        <Card className="overflow-hidden">
          {rows.length === 0 ? (
            <Empty>مفيش حاجة هنا</Empty>
          ) : (
            rows.map((party, i) => (
              <div key={party.id}>
                {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                <PartyRow party={party} payable={showPayable} />
              </div>
            ))
          )}
        </Card>

        {!showPayable && rows.length > 0 && (
          <p className="mt-3 px-1 text-[12px] leading-relaxed text-ink-mute">
            مرتبين بالأقدم — اللي فوق هو اللي متأخر عليك أكتر.
          </p>
        )}
      </Page>
    </>
  );
}

/* ------------------------------------------------------------------ */

function TabCard({
  href,
  active,
  label,
  value,
  tone,
}: {
  href: string;
  active: boolean;
  label: string;
  value: number;
  tone: "pos" | "neg";
}) {
  return (
    <Link href={href} className="press block">
      <div
        className={`rounded-2xl border px-4 py-3 transition-colors ${
          active
            ? tone === "pos"
              ? "border-pos/30 bg-pos-soft"
              : "border-neg/30 bg-neg-soft"
            : "border-line bg-card"
        }`}
      >
        <div
          className={`text-[12px] font-semibold ${
            active ? (tone === "pos" ? "text-pos" : "text-neg") : "text-ink-mute"
          }`}
        >
          {label}
        </div>
        <Money
          value={value}
          className={`mt-1 block text-[20px] font-bold ${
            active ? (tone === "pos" ? "text-pos" : "text-neg") : "text-ink"
          }`}
        />
      </div>
    </Link>
  );
}

function PartyRow({ party, payable }: { party: Party; payable: boolean }) {
  const amount = Math.abs(party.balance);
  const late = !payable && party.oldestDue && daysSince(party.oldestDue, new Date(TODAY)) > LATE_DAYS;
  const when = payable ? party.lastActivity : party.oldestDue;

  return (
    <Link href={`/accounts/${party.id}`} className="press block active:bg-sunken">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[15px] font-semibold">{party.name}</span>
            {late && <AlertTriangle size={14} className="shrink-0 text-warn" />}
          </div>
          {when && (
            <div className="mt-0.5 text-[12px] text-ink-mute">
              {since(when, new Date(TODAY))}
            </div>
          )}
        </div>

        {payable && party.kind === "factory" && (
          <Badge tone="neutral">مصنع</Badge>
        )}
        {payable && party.kind === "supplier" && (
          <Badge tone="neutral">قماش</Badge>
        )}

        <Money
          value={amount}
          className={`text-[16px] font-bold ${payable ? "text-neg" : "text-pos"}`}
        />
      </div>
    </Link>
  );
}

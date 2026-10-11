import SettleFlow from "./SettleFlow";

/** ?party=c1 بيفتح على الطرف ده على طول (من زرار «مسامحة» في كشف الحساب) */
export default async function SettlePage({
  searchParams,
}: {
  searchParams: Promise<{ party?: string }>;
}) {
  const { party } = await searchParams;
  return <SettleFlow initialPartyId={party} />;
}

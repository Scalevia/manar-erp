import PaymentFlow from "./PaymentFlow";

/** ?party=c1 بيفتح على الطرف ده على طول (من زرار «تحصيل» أو «دفع» في كشف الحساب) */
export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ party?: string }>;
}) {
  const { party } = await searchParams;
  return <PaymentFlow initialPartyId={party} />;
}

import { redirect } from "next/navigation";
import PaymentFlow from "./PaymentFlow";

/** ?party=c1 — بتتفتح من زرار «تحصيل» أو «دفعة تحت الحساب» في كشف الحساب بس */
export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ party?: string }>;
}) {
  const { party } = await searchParams;
  if (!party) redirect("/accounts");
  return <PaymentFlow partyId={party} />;
}

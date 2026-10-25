import ReturnFlow from "./ReturnFlow";

/** ?dir=customer|supplier&party=c1 — بيفتح جاهز من الفاتورة أو من كشف الحساب */
export default async function ReturnsPage({
  searchParams,
}: {
  searchParams: Promise<{ dir?: string; party?: string }>;
}) {
  const { dir, party } = await searchParams;
  return <ReturnFlow initialDir={dir === "supplier" ? "supplier" : "customer"} initialPartyId={party} />;
}

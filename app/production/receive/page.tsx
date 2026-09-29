import ReceiveFlow from "./ReceiveFlow";

/** ?order=o5 بيفتح على أمر التصنيع ده على طول (من كارت أمر التصنيع) */
export default async function ReceivePage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return <ReceiveFlow initialOrderId={order} />;
}

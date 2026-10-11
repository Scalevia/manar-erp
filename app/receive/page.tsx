import ReceiveFlow from "./ReceiveFlow";

/** ?factory=f1 بيفتح على المصنع ده على طول */
export default async function ReceivePage({
  searchParams,
}: {
  searchParams: Promise<{ factory?: string }>;
}) {
  const { factory } = await searchParams;
  return <ReceiveFlow initialFactoryId={factory} />;
}

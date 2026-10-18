import ReceiveFlow from "./ReceiveFlow";

/** ?job=j7 بيفتح على الأمر ده على طول (من جوه الأمر) */
export default async function ReceivePage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string }>;
}) {
  const { job } = await searchParams;
  return <ReceiveFlow initialJobId={job} />;
}

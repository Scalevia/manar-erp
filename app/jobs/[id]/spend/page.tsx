import { notFound } from "next/navigation";
import { jobById } from "@/lib/mock";
import SpendFlow from "./SpendFlow";

/** ?item=fabric&source=buy بيفتح على البند ده على طول (من «شراء قماش») */
export default async function SpendPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ item?: string; source?: string }>;
}) {
  const { id } = await params;
  const { item, source } = await searchParams;
  const job = jobById(id);
  if (!job || job.closedAt) notFound();
  return (
    <SpendFlow
      jobId={job.id}
      initialItem={item}
      initialSource={source === "buy" || source === "stock" ? source : undefined}
    />
  );
}

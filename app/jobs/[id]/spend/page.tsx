import { notFound } from "next/navigation";
import { jobById } from "@/lib/mock";
import SpendFlow from "./SpendFlow";

export default async function SpendPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = jobById(id);
  if (!job || job.closedAt) notFound();
  return <SpendFlow jobId={job.id} />;
}

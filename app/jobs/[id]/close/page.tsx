import { notFound } from "next/navigation";
import { jobById } from "@/lib/mock";
import CloseFlow from "./CloseFlow";

export default async function CloseJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = jobById(id);
  if (!job || job.closedAt) notFound();
  return <CloseFlow jobId={job.id} />;
}

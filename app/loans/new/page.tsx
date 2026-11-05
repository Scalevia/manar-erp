import LoanForm from "./LoanForm";

/** ?dir=in استلفت · ?dir=out سلّفت حد · ?old=1 سلفة من قبل البرنامج (من التهيئة) */
export default async function NewLoanPage({
  searchParams,
}: {
  searchParams: Promise<{ dir?: string; old?: string }>;
}) {
  const { dir, old } = await searchParams;
  return <LoanForm initialDir={dir === "out" ? "out" : "in"} old={old === "1"} />;
}

import LoanForm from "./LoanForm";

/** ?dir=in استلفت · ?dir=out سلّفت حد */
export default async function NewLoanPage({
  searchParams,
}: {
  searchParams: Promise<{ dir?: string }>;
}) {
  const { dir } = await searchParams;
  return <LoanForm initialDir={dir === "out" ? "out" : "in"} />;
}

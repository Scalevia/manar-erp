import OpenAccount, { type OpenKind } from "./OpenAccount";

const KINDS: OpenKind[] = ["customer", "supplier"];

/** ?kind=supplier بيفتح على النوع ده — من تبّة «اللي عليا» بيبدأ بمورد */
export default async function OpenAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind } = await searchParams;
  const initial = KINDS.find((k) => k === kind) ?? "customer";
  return <OpenAccount initialKind={initial} />;
}

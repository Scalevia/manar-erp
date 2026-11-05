import OpenAccount, { type OpenKind } from "./OpenAccount";

const KINDS: OpenKind[] = ["customer", "supplier"];

/**
 * ?kind=supplier بيفتح على النوع ده — من تبّة «اللي عليا» بيبدأ بمورد ·
 * ?from=setup جاي من «تهيئة المحل لأول مرة» وبيرجعلها
 */
export default async function OpenAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; from?: string }>;
}) {
  const { kind, from } = await searchParams;
  const initial = KINDS.find((k) => k === kind) ?? "customer";
  return <OpenAccount initialKind={initial} fromSetup={from === "setup"} />;
}

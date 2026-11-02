import AccountsView, { type Tab } from "./AccountsView";

const TABS: Tab[] = ["customers", "suppliers", "loans"];

/** ?tab=suppliers بيفتح على المصانع والتجار — من كشف حساب مورد أو «اللي عليا» في الرئيسية */
export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  return <AccountsView initialTab={TABS.find((t) => t === tab) ?? "customers"} />;
}

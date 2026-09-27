"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Factory,
  Home,
  LayoutGrid,
  Package,
  Plus,
  Settings,
  Truck,
  Wallet,
  type LucideIcon,
} from "lucide-react";

type Item = { href: string; label: string; icon: LucideIcon };

/** التنقل السفلي — خمس تبويبات، و«بيع» بارز في النص (الـ spec، قسم 10) */
const tabs: Item[] = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/inventory", label: "المخزون", icon: Package },
  { href: "/sell", label: "بيع", icon: Plus },
  { href: "/accounts", label: "الحسابات", icon: Wallet },
  { href: "/more", label: "المزيد", icon: LayoutGrid },
];

const sidebar: Item[][] = [
  [
    { href: "/", label: "الرئيسية", icon: Home },
    { href: "/sell", label: "بيع", icon: Plus },
  ],
  [
    { href: "/inventory", label: "المخزون", icon: Package },
    { href: "/production", label: "أوامر التصنيع", icon: Factory },
    { href: "/purchases", label: "المشتريات", icon: Truck },
  ],
  [
    { href: "/accounts", label: "الحسابات", icon: Wallet },
    { href: "/reports", label: "التقارير", icon: BarChart3 },
  ],
  [{ href: "/more", label: "الإعدادات", icon: Settings }],
];

function useActive() {
  const path = usePathname();
  return (href: string) =>
    href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const isActive = useActive();

  return (
    <div className="flex min-h-dvh">
      {/* ---------- السايدبار — ديسكتوب ---------- */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-e border-line bg-card lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-6">
          <div className="grid size-9 place-items-center rounded-xl bg-brand text-brand-ink">
            <span className="text-lg font-bold">م</span>
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-bold">منار</div>
            <div className="text-xs text-ink-mute">جملة ملابس</div>
          </div>
        </div>

        <nav className="flex-1 space-y-6 px-3 py-2">
          {sidebar.map((group, i) => (
            <div key={i} className="space-y-1">
              {group.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition-colors ${
                      active
                        ? "bg-brand-soft font-semibold text-brand"
                        : "text-ink-soft hover:bg-sunken hover:text-ink"
                    }`}
                  >
                    <Icon size={19} strokeWidth={active ? 2.4 : 2} />
                    {label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-line-soft px-5 py-4 text-xs text-ink-mute">
          نسخة عرض · بيانات تجريبية
        </div>
      </aside>

      {/* ---------- المحتوى ---------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 pb-nav lg:pb-10">{children}</main>
      </div>

      {/* ---------- التنقل السفلي — موبايل ---------- */}
      <nav
        className="glass fixed inset-x-0 bottom-0 z-50 border-t lg:hidden"
        style={{ borderColor: "var(--glass-line)" }}
      >
        <div
          className="mx-auto flex max-w-lg items-stretch justify-around px-2"
          style={{ height: "var(--nav-h)" }}
        >
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            const primary = href === "/sell";

            if (primary) {
              return (
                <Link
                  key={href}
                  href={href}
                  aria-label={label}
                  className="press flex w-20 flex-col items-center justify-center gap-1"
                >
                  <span
                    className={`grid size-12 place-items-center rounded-2xl shadow-lg shadow-brand/25 ${
                      active ? "bg-brand" : "bg-brand"
                    } text-brand-ink`}
                  >
                    <Icon size={24} strokeWidth={2.6} />
                  </span>
                  <span className="text-[11px] font-semibold text-brand">{label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className="press flex w-20 flex-col items-center justify-center gap-1.5"
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.9}
                  className={active ? "text-brand" : "text-ink-mute"}
                />
                <span
                  className={`text-[11px] ${
                    active ? "font-semibold text-brand" : "text-ink-mute"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
        {/* مساحة الـ Home Indicator */}
        <div style={{ height: "var(--sab)" }} />
      </nav>
    </div>
  );
}

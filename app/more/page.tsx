"use client";

import Link from "next/link";
import {
  ArrowLeftRight,
  BarChart3,
  ChevronRight,
  FileText,
  LogOut,
  Moon,
  PackagePlus,
  Receipt,
  Repeat,
  Rocket,
  RotateCcw,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Card, Num, Page, PageHeader, SectionTitle } from "@/components/ui";
import { signOut, useSession } from "@/lib/auth";
import { ofKind, resetStore } from "@/lib/mock";

type Item = {
  href: string;
  label: string;
  icon: LucideIcon;
  hint?: React.ReactNode;
};

export default function MorePage() {
  const session = useSession();
  const groups: { title: string; items: Item[] }[] = [
    {
      title: "الشغل",
      items: [
        // بيع وشراء (الـ spec، قسم 5): البضاعة من المصنع شراء، والخامات دفعة للمصنع
        { href: "/inventory/buy", label: "شراء مخزون", icon: PackagePlus, hint: "من مصنع أو تاجر" },
        { href: "/expenses", label: "المصاريف", icon: Receipt },
        { href: "/loans", label: "السلف", icon: ArrowLeftRight },
        { href: "/returns", label: "مرتجع", icon: RotateCcw },
        { href: "/transfer", label: "تحويل بين الخزن", icon: Repeat },
      ],
    },
    {
      title: "المتابعة",
      items: [
        { href: "/reports", label: "التقارير", icon: BarChart3 },
        { href: "/invoices", label: "الفواتير", icon: FileText },
        { href: "/capital", label: "رأس مالي", icon: TrendingUp },
        {
          href: "/accounts",
          label: "العملاء والموردين",
          icon: Users,
          // «نقدي» (البيع للزبون الطياري) متسجل عميل بس مالوش حساب — مبيتعدّش
          hint: <><Num value={ofKind("customer").filter((x) => !x.isCash).length} /> عميل</>,
        },
      ],
    },
    {
      title: "الإعداد",
      items: [
        {
          href: "/setup",
          label: "تهيئة المحل لأول مرة",
          icon: Rocket,
          hint: "إدخال الأرصدة",
        },
      ],
    },
  ];

  return (
    <>
      <PageHeader title="المزيد" />
      <Page>
        <div className="space-y-5">
          {groups.map((g) => (
            <div key={g.title}>
              <SectionTitle>{g.title}</SectionTitle>
              <Card className="overflow-hidden">
                {g.items.map(({ href, label, icon: Icon, hint }, i) => (
                  <div key={label}>
                    {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                    <Link href={href} className="press block active:bg-sunken">
                      <div className="flex items-center gap-3 px-4 py-3.5">
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sunken text-ink-soft">
                          <Icon size={18} />
                        </span>
                        <span className="flex-1 text-[15px]">{label}</span>
                        {hint && (
                          <span className="text-[12px] text-ink-mute">{hint}</span>
                        )}
                        <ChevronRight size={17} className="rotate-180 text-ink-mute" />
                      </div>
                    </Link>
                  </div>
                ))}
              </Card>
            </div>
          ))}

          {/* ------------------------------ ملاحظة ------------------------------ */}
          <Card className="px-4 py-3.5">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sunken text-ink-soft">
                <Moon size={18} />
              </span>
              <div className="flex-1 text-[13px] leading-relaxed text-ink-mute">
                الوضع الليلي بيتغيّر لوحده مع إعدادات التليفون.
              </div>
            </div>
          </Card>

          {/* مع Supabase: «خروج» و«اخرج من كل الأجهزة» (الـ spec، قسم 9) */}
          <button
            type="button"
            onClick={signOut}
            className="press flex w-full items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3.5 text-start"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sunken text-ink-soft">
              <LogOut size={18} />
            </span>
            <span className="flex-1">
              <span className="block text-[15px]">خروج</span>
              {session && (
                <span className="mt-0.5 block text-[12px] text-ink-mute">
                  داخل باسم <span className="num">{session.username}</span>
                </span>
              )}
            </span>
          </button>

          {/* البيانات التجريبية بتتحفظ في المتصفح — ده بيمسح اللي اتسجل ويرجّعها زي الأول */}
          <button
            type="button"
            onClick={() => {
              if (confirm("هيتمسح كل اللي اتسجل وترجع البيانات التجريبية زي الأول. متأكد؟")) resetStore();
            }}
            className="press flex w-full items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3.5 text-start"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-neg-soft text-neg">
              <RotateCcw size={18} />
            </span>
            <span className="flex-1">
              <span className="block text-[15px] text-neg">رجّع البيانات التجريبية</span>
              <span className="mt-0.5 block text-[12px] text-ink-mute">يمسح كل اللي اتسجل ويبدأ من الأول</span>
            </span>
          </button>

          <p className="px-1 pb-2 text-center text-[12px] text-ink-mute">
            مكتب منار · نسخة تجريبية · اللي بتسجله بيتحفظ على الجهاز ده بس
          </p>
        </div>
      </Page>
    </>
  );
}

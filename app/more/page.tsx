import Link from "next/link";
import {
  BarChart3,
  ChevronRight,
  Factory,
  HandCoins,
  Moon,
  PackagePlus,
  Receipt,
  Rocket,
  Scissors,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Card, Money, Num, Page, PageHeader, SectionTitle } from "@/components/ui";
import { fabrics, ofKind, totals } from "@/lib/mock";

type Item = {
  href: string;
  label: string;
  icon: LucideIcon;
  hint?: React.ReactNode;
};

export default function MorePage() {
  const groups: { title: string; items: Item[] }[] = [
    {
      title: "الشغل",
      items: [
        { href: "/production/receive", label: "استلام من المصنع", icon: PackagePlus },
        { href: "/production", label: "أوامر التصنيع", icon: Factory },
        { href: "/purchases", label: "المشتريات", icon: Truck },
        { href: "/payments", label: "تحصيل ودفع", icon: HandCoins },
        { href: "/expenses", label: "المصاريف", icon: Receipt },
        {
          href: "/more",
          label: "القماش في المحل",
          icon: Scissors,
          hint: (
            <>
              <Num value={fabrics.reduce((s, f) => s + f.meters, 0)} /> م ·{" "}
              <Money value={totals.fabricValue} /> ج
            </>
          ),
        },
      ],
    },
    {
      title: "المتابعة",
      items: [
        { href: "/reports", label: "التقارير", icon: BarChart3 },
        {
          href: "/accounts",
          label: "العملاء والمصانع",
          icon: Users,
          hint: <><Num value={ofKind("customer").length} /> عميل</>,
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

          <p className="px-1 pb-2 text-center text-[12px] text-ink-mute">
            منار · نسخة عرض للتصميم · البيانات كلها تجريبية
          </p>
        </div>
      </Page>
    </>
  );
}

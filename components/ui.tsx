import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { money, money2, num } from "@/lib/format";

/* ---------------------------------- رأس الصفحة --------------------------------- */

export function PageHeader({
  title,
  sub,
  back,
  action,
}: {
  title: string;
  sub?: React.ReactNode;
  back?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="glass sticky top-0 z-40 border-b border-line-soft pt-safe">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3.5">
        {back && (
          <Link
            href={back}
            aria-label="رجوع"
            className="press -me-1 grid size-9 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-sunken"
          >
            {/* في RTL السهم بيشاور ناحية اليمين */}
            <ChevronRight size={22} />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[17px] font-bold leading-tight">{title}</h1>
          {sub && <div className="mt-0.5 truncate text-[13px] text-ink-mute">{sub}</div>}
        </div>
        {action}
      </div>
    </header>
  );
}

/** حاوية الصفحة — عرض مريح للقراءة على الديسكتوب، وحواف 16px على الموبايل */
export function Page({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-3xl px-4 py-4">{children}</div>;
}

/* ----------------------------------- الأرقام ---------------------------------- */

/** مبلغ بالقروش → نص. الأرقام لاتينية وعرضها ثابت. */
export function Money({
  value,
  decimals = false,
  className = "",
}: {
  value: number;
  decimals?: boolean;
  className?: string;
}) {
  return (
    <span className={`num ${className}`}>
      {decimals ? money2(value) : money(value)}
    </span>
  );
}

export function Num({ value, className = "" }: { value: number; className?: string }) {
  return <span className={`num ${className}`}>{num(value)}</span>;
}

/* ----------------------------------- الكروت ---------------------------------- */

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-line bg-card ${className}`}>
      {children}
    </div>
  );
}

/** عنوان قسم صغير فوق قايمة */
export function SectionTitle({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex items-baseline justify-between px-1">
      <h2 className="text-[13px] font-semibold text-ink-mute">{children}</h2>
      {action}
    </div>
  );
}

/* ----------------------------------- الشارات ---------------------------------- */

type Tone = "neutral" | "pos" | "neg" | "warn" | "brand";

const toneClass: Record<Tone, string> = {
  neutral: "bg-sunken text-ink-soft",
  pos: "bg-pos-soft text-pos",
  neg: "bg-neg-soft text-neg",
  warn: "bg-warn-soft text-warn",
  brand: "bg-brand-soft text-brand",
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${toneClass[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/* ------------------------------- صف في قايمة ------------------------------- */

export function Row({
  href,
  children,
  className = "",
}: {
  href?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const inner = (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 text-start ${
        href ? "press active:bg-sunken" : ""
      } ${className}`}
    >
      {children}
      {href && <ChevronRight size={17} className="shrink-0 rotate-180 text-ink-mute" />}
    </div>
  );

  if (!href) return inner;
  return (
    <Link href={href} className="block">
      {inner}
    </Link>
  );
}

/** فاصل بين صفوف القايمة، بيبدأ بعد الحافة زي قوايم iOS */
export function Divider() {
  return <div className="ms-4 border-t border-line-soft" />;
}

/** قايمة كروت — بتحط الفواصل لوحدها */
export function List({ children }: { children: React.ReactNode }) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <Card className="overflow-hidden">
      {items.map((child, i) => (
        <div key={i}>
          {i > 0 && <Divider />}
          {child}
        </div>
      ))}
    </Card>
  );
}

/* --------------------------------- حالة فاضية -------------------------------- */

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-10 text-center text-[14px] text-ink-mute">{children}</div>
  );
}

/**
 * لوجو «مكتب منار»: حرف «م» — الدايرة قاعدة على الخط، والإبرة واقفة مكان ديل
 * الحرف، وآخر الخط بيتحول خيط دهبي بيدخل في خرم الإبرة.
 *
 * الحرف والإبرة بلون `currentColor`، والخيط بلون `--accent` — فاللوجو بيتبع
 * الوضع الفاتح والغامق لوحده. الخرم متقص جوه الشكل نفسه (evenodd) مش بـ mask،
 * عشان ميحصلش تعارض لو اللوجو اتكرر في نفس الصفحة.
 */

const NEEDLE =
  // جسم الإبرة: الخرم فوق والسن تحت
  "M28.5 37.5 A5.5 5.5 0 0 1 39.5 37.5 L39.5 56 L34 87 L28.5 56 Z " +
  // الخرم
  "M34 36 a1.8 1.8 0 0 1 1.8 1.8 V45.7 a1.8 1.8 0 0 1 -3.6 0 V37.8 A1.8 1.8 0 0 1 34 36 Z";

export function LogoMark({
  size = 40,
  className = "",
  title = "مكتب منار",
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="2.5 5 100 100"
      role="img"
      aria-label={title}
      className={className}
    >
      {/* الخيط بعد ما عدّى من الخرم — تحت الإبرة */}
      <path
        d="M34 41.5 C24 41.5 19 49 21.5 58 C23 63.5 21 68 18 70"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path d={NEEDLE} fill="currentColor" fillRule="evenodd" />
      <circle cx="72" cy="32" r="12" fill="none" stroke="currentColor" strokeWidth="9.5" />
      <path d="M72 44 H49" fill="none" stroke="currentColor" strokeWidth="9.5" strokeLinecap="round" />
      {/* آخر الخط بيتحول خيط وبيدخل الخرم — فوق الإبرة */}
      <path
        d="M49 44 C42 44 39 41.5 34 41.5"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** اللوجو + الاسم: «مكتب» صغيرة فوق «منار» */
export function LogoLockup({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <LogoMark size={size} className="shrink-0 text-brand" />
      <div className="leading-none">
        <div className="text-[11px] font-medium text-ink-mute">مكتب</div>
        <div className="mt-0.5 text-[20px] font-bold text-ink">منار</div>
      </div>
    </div>
  );
}

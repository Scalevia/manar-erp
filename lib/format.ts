/**
 * تنسيق الأرقام والتواريخ.
 *
 * الفلوس بتتخزن **بالقروش كأعداد صحيحة** (قاعدة من الـ spec، قسم 8).
 * الدوال دي بتاخد قروش وبتطلع نص جاهز للعرض بأرقام لاتينية.
 */

/** جنيه → قرش. بتستعمل في بيانات العرض التجريبية عشان الأرقام تفضل مقروءة. */
export const p = (egp: number) => Math.round(egp * 100);

const nf = new Intl.NumberFormat("en-US");
const nf2 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 4500000 → "45,000" · والكسور بتظهر بس لو موجودة */
export function money(piastres: number): string {
  const egp = piastres / 100;
  return Number.isInteger(egp) ? nf.format(egp) : nf2.format(egp);
}

/** زي money بس بيجبر الكسرين — للتكلفة والأسعار */
export function money2(piastres: number): string {
  return nf2.format(piastres / 100);
}

/** رقم بفاصلة الآلاف */
export function num(n: number): string {
  return nf.format(n);
}

/** 4.2 → "4.2%" */
export function pct(n: number): string {
  return `${Number.isInteger(n) ? n : n.toFixed(1)}%`;
}

/** إشارة صريحة للمبالغ في كشف الحساب */
export function signed(piastres: number): string {
  const s = money(Math.abs(piastres));
  return piastres < 0 ? `−${s}` : s;
}

/* ------------------------------------------------------------------ */

const DAY = 86_400_000;

/** جمع عربي: يوم / يومين / أيام / يوم */
function arabicPlural(n: number, one: string, two: string, few: string, many: string) {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n >= 3 && n <= 10) return `${n} ${few}`;
  return `${n} ${many}`;
}

/**
 * "من 4 شهور" · "من يومين" · "النهاردة"
 * ده الكلام اللي بيخلي تقرير «مين متأخر» مفهوم من غير تواريخ.
 */
export function since(iso: string, now: Date = new Date()): string {
  const days = Math.floor((now.getTime() - new Date(iso).getTime()) / DAY);

  if (days <= 0) return "النهاردة";
  if (days === 1) return "من إمبارح";
  if (days < 30) return `من ${arabicPlural(days, "يوم", "يومين", "أيام", "يوم")}`;

  const months = Math.floor(days / 30);
  if (months < 12)
    return `من ${arabicPlural(months, "شهر", "شهرين", "شهور", "شهر")}`;

  const years = Math.floor(months / 12);
  return `من ${arabicPlural(years, "سنة", "سنتين", "سنين", "سنة")}`;
}

/** عدد الأيام من تاريخ — للترتيب والتنبيهات */
export function daysSince(iso: string, now: Date = new Date()): number {
  return Math.floor((now.getTime() - new Date(iso).getTime()) / DAY);
}

/** "23/9" — تواريخ قصيرة لكشوف الحسابات */
export function shortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

const MONTHS = [
  "يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

/** "سبتمبر 2026" */
export function monthName(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "سبتمبر" */
export function monthOnly(iso: string): string {
  return MONTHS[new Date(iso).getMonth()];
}

/* ------------------------------------------------------------------ */

/** أرقام الموبايل المصري: 11 رقم وبيبدأ بـ 010 / 011 / 012 / 015 */
export function isEgyptMobile(phone: string): boolean {
  return /^01[0125]\d{8}$/.test(phone);
}

/** 01001234567 → "0100 123 4567" — أسهل في القراية */
export function formatPhone(phone: string): string {
  return isEgyptMobile(phone)
    ? `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`
    : phone;
}

/** 460 قطعة → "38 دستة و4" — للعرض جنب الرقم لما يفكر بالدستة */
export function dozens(pieces: number): string {
  const d = Math.floor(pieces / 12);
  const r = pieces % 12;
  if (d === 0) return `${r} قطعة`;
  if (r === 0) return `${num(d)} دستة`;
  return `${num(d)} دستة و${r}`;
}

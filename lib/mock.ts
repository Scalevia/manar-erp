/**
 * بيانات العرض — بتتحفظ في المتصفح عشان العميل يجرّب البرنامج بجد.
 *
 * زي الداتابيز الجاية بالظبط (الـ spec، قسم 8): مفيش رصيد متخزن. اللي بيتخزن
 * **العمليات** بس (بيع، شراء، دفع، مرتجع ...)، وكل حاجة تانية — أرصدة الناس
 * وكشوف الحسابات والخزن والمخزون بالدفعات (FIFO) ورأس المال — بتتحسب منها.
 * عشان كده الحسابات دايماً راكبة على بعض، مهما سجّل.
 *
 * البداية بيانات تجريبية (seed) تواريخها نسبة للنهاردة عشان العرض يفضل جديد،
 * وزرار «رجّع البيانات التجريبية» في «المزيد» بيمسح اللي اتسجل ويبدأ من الأول.
 *
 * كل المبالغ **بالقروش**.
 */

import { useSyncExternalStore } from "react";
import { daysSince, normalizeArabic, p } from "./format";

/* ============================ التاريخ ============================ */

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const TODAY = iso(new Date());

/** النهاردة ± أيام — للبيانات التجريبية */
const day = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return iso(d);
};

const nowTime = () => {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/* ============================ الأنواع ============================ */

/**
 * تلات أنواع بس (الـ spec، قسم 7):
 *   customer = عميل — بيشتري منك
 *   supplier = مورد — مصنع أو تاجر: أي حد بتشتري منه
 *   person   = سلفة — شخص بينه وبين المحل سلفة
 */
export type PartyKind = "customer" | "supplier" | "person";

export type Party = {
  id: string;
  kind: PartyKind;
  name: string;
  phone?: string;
  /** موجب = ليا عنده · سالب = عليا له — محسوب من العمليات */
  balance: number;
  /** أقدم مبلغ لسه مستحق — منه بييجي «من إمتى» */
  oldestDue?: string;
  lastActivity: string;
  /** طرف «نقدي» للبيع لزبون طياري — مالوش حساب ومبيظهرش في القوايم */
  isCash?: boolean;
  /** ميعاد رجوع السلفة */
  dueDate?: string;
};

export type CashAccount = { id: string; name: string; short: string; balance: number };

/** دفعة بضاعة في المحل — pieces = اللي لسه موجود منها، والبيع بياخد من الأقدم */
export type Batch = {
  receivedAt: string;
  /** المورد اللي اشترى منه — أو العميل لو مرتجع، أو فاضي لو رصيد أول المدة */
  sourceId: string;
  pieces: number;
  unitCost: number;
};

/** الموديل بالكود أو بالاسم أو الاتنين (الـ spec، قسم 4) */
export type Model = {
  id: string;
  code?: number;
  name?: string;
  batches: Batch[];
  lastSale?: string;
  soldThisMonth: number;
};

export type LedgerRow = {
  id: string;
  date: string;
  label: string;
  /** موجب = زاد اللي عليه (في اتجاه الحساب العادي) · سالب = قلّ */
  amount: number;
  balance: number;
};

export type InvoiceLine = { modelId: string; qty: number; price: number };

export type Invoice = {
  no: number;
  date: string;
  time: string;
  partyId: string;
  lines: InvoiceLine[];
  /** اتدفع كام وقت البيع */
  paid: number;
  accountId?: string;
};

export type CustomerModel = { modelId: string; qty: number; lastPrice: number; lastDate: string };

export type CustomerStats = {
  sales: number;
  profit: number;
  invoices: number;
  pieces: number;
  returned: number;
  lastSale?: string;
  /** الأكتر قطع الأول */
  models: CustomerModel[];
};

export type StockBuy = {
  id: string;
  date: string;
  supplierId: string;
  lines: { modelId: string; qty: number; unitCost: number }[];
  paid: number;
  accountId?: string;
};

export type ExpenseCategory = { id: string; label: string; personal?: boolean; auto?: boolean };

export type Expense = {
  id: string;
  date: string;
  categoryId: string;
  amount: number;
  accountId: string;
  note?: string;
};

export type CapitalIn = { id: string; date: string; amount: number; accountId: string; note?: string };

export type ModelStat = { modelId: string; sold: number; revenue: number; cost: number };

export type CapitalPeriod = {
  id: "1m" | "3m" | "1y";
  label: string;
  days: number;
  sales: number;
  cogs: number;
  expenses: number;
  settlements: number;
  added: number;
  withdrawn: number;
  topExpenses: { label: string; amount: number }[];
};

export type Activity = {
  key: string;
  date: string;
  time?: string;
  kind: "invoice" | "payment" | "expense" | "purchase" | "receive";
  title: string;
  sub: string;
  amount: number;
  href: string;
};

/* ============================ الثوابت ============================ */

const CASH_ACCOUNTS = [
  { id: "drawer", name: "الدرج", short: "الدرج" },
  { id: "instapay", name: "انستاباي", short: "انستاباي" },
  { id: "vcash", name: "فودافون كاش", short: "فودافون" },
];

/** «سحب شخصي» مش مصروف: بيقلل الخزنة بس **مبيقللش الربح** */
export const expenseCategories: ExpenseCategory[] = [
  { id: "food", label: "أكل وشرب" },
  { id: "transport", label: "مواصلات" },
  { id: "shipping", label: "شحن وتحميل" },
  { id: "wages", label: "يوميات" },
  { id: "bills", label: "كهربا ومياه" },
  { id: "rent", label: "إيجار" },
  { id: "other", label: "حاجات تانية" },
  { id: "personal", label: "سحب شخصي", personal: true },
  // بيتسجل لوحده من التحويل بين الخزن — مش اختيار في «مصروف جديد»
  { id: "fees", label: "مصاريف تحويل", auto: true },
];

export const categoryById = (id: string) => expenseCategories.find((c) => c.id === id);

/** الزبون الطياري — حساب ثابت */
export const cashParty: Party = { id: "cash", kind: "customer", name: "نقدي", balance: 0, lastActivity: TODAY, isCash: true };

/* ============================ العمليات المتخزنة ============================ */

type PartyRec = { id: string; kind: PartyKind; name: string; phone?: string; isCash?: boolean; createdAt: string };
type ModelRec = { id: string; code?: number; name?: string };
type SaleLine = { modelId: string; qty: number; price: number };
type CostLine = { modelId: string; qty: number; unitCost: number };

type TxBody =
  | { t: "sale"; no: number; partyId: string; lines: SaleLine[]; paid: number; accountId?: string }
  | { t: "buy"; supplierId: string; lines: CostLine[]; paid: number; accountId?: string }
  | { t: "pay"; partyId: string; collect: boolean; amount: number; accountId: string; note?: string }
  | { t: "settle"; partyId: string; amount: number; reason?: string }
  | { t: "creturn"; partyId: string; lines: SaleLine[]; refund: boolean; accountId?: string }
  | { t: "sreturn"; partyId: string; lines: CostLine[] }
  | { t: "expense"; categoryId: string; amount: number; accountId: string; note?: string }
  | { t: "transfer"; from: string; to: string; out: number; in: number }
  | { t: "capital"; amount: number; accountId: string; note?: string }
  | { t: "loan"; partyId: string; dir: "in" | "out"; amount: number; accountId: string; dueDate?: string }
  | { t: "opening"; partyId: string; amount: number; since?: string }
  | { t: "openCash"; accountId: string; amount: number }
  | { t: "openStock"; modelId: string; qty: number; unitCost: number };

type Tx = TxBody & { id: string; date: string; time: string };

type Db = { v: 1; seq: number; invoiceNo: number; parties: PartyRec[]; models: ModelRec[]; txs: Tx[] };

/* ============================ البيانات التجريبية ============================ */

function seed(): Db {
  const parties: PartyRec[] = [
    { id: "cash", kind: "customer", name: "نقدي", isCash: true, createdAt: day(-200) },
    { id: "c1", kind: "customer", name: "أحمد الشوا", phone: "01001234567", createdAt: day(-130) },
    { id: "c2", kind: "customer", name: "محمود سعيد", phone: "01112223344", createdAt: day(-60) },
    { id: "c3", kind: "customer", name: "عصام الجمل", phone: "01225556677", createdAt: day(-60) },
    { id: "c4", kind: "customer", name: "رمضان أبو العلا", phone: "01008889900", createdAt: day(-30) },
    { id: "c5", kind: "customer", name: "سيد النجار", phone: "01144556677", createdAt: day(-110) },
    { id: "c6", kind: "customer", name: "خالد عبد ربه", phone: "01277889900", createdAt: day(-30) },
    { id: "c7", kind: "customer", name: "مصطفى الليثي", phone: "01033445566", createdAt: day(-30) },
    { id: "c8", kind: "customer", name: "جمال شحاتة", phone: "01155667788", createdAt: day(-20) },
    { id: "c9", kind: "customer", name: "ياسر الدمرداش", phone: "01266778899", createdAt: day(-10) },
    { id: "f1", kind: "supplier", name: "مصنع النور", phone: "01020304050", createdAt: day(-40) },
    { id: "f2", kind: "supplier", name: "مصنع الأمانة", phone: "01060708090", createdAt: day(-40) },
    { id: "f3", kind: "supplier", name: "مصنع الشروق", phone: "01099887766", createdAt: day(-40) },
    { id: "f4", kind: "supplier", name: "مصنع الفجر", phone: "01066554433", createdAt: day(-40) },
    { id: "t1", kind: "supplier", name: "الحاج محمود للجملة", phone: "01098765432", createdAt: day(-10) },
    { id: "p1", kind: "person", name: "حاج سيد العطار", phone: "01019876543", createdAt: day(-20) },
    { id: "p2", kind: "person", name: "محمد الصبي", phone: "01147654321", createdAt: day(-5) },
  ];
  const models: ModelRec[] = [
    { id: "m214", code: 214, name: "قميص كاروهات" },
    { id: "m208", code: 208, name: "بنطلون جينز" },
    { id: "m221", code: 221, name: "تيشيرت قطن" },
    { id: "m199", code: 199, name: "قميص سادة" },
    { id: "m235", code: 235, name: "جاكيت خفيف" },
    { id: "m190", code: 190, name: "جاكيت شتوي" },
    { id: "m176", code: 176, name: "بلوزة صيفي" },
    { id: "m183", code: 183, name: "شورت" },
    { id: "m240", code: 240, name: "بلوزة شتوي" },
    { id: "m168", code: 168 },
    { id: "mk1", name: "طقم ولادي" },
    { id: "mk2", name: "بيجامة حريمي" },
    { id: "m226", code: 226, name: "بنطلون قماش" },
  ];

  const txs: Tx[] = [];
  let n = 0;
  const add = (date: string, body: TxBody, time = "12:00") => txs.push({ ...body, id: `s${++n}`, date, time } as Tx);
  const sale = (date: string, partyId: string, lines: [string, number, number][], paid = 0, accountId?: string, time?: string) =>
    add(date, { t: "sale", no: 0, partyId, lines: lines.map(([modelId, qty, price]) => ({ modelId, qty, price: p(price) })), paid: p(paid), accountId }, time);
  const buy = (date: string, supplierId: string, lines: [string, number, number][], paid = 0, accountId?: string) =>
    add(date, { t: "buy", supplierId, lines: lines.map(([modelId, qty, c]) => ({ modelId, qty, unitCost: p(c) })), paid: p(paid), accountId });
  const pay = (date: string, partyId: string, collect: boolean, amount: number, accountId: string) =>
    add(date, { t: "pay", partyId, collect, amount: p(amount), accountId });
  const stock = (date: string, modelId: string, qty: number, cost: number) =>
    add(date, { t: "openStock", modelId, qty, unitCost: p(cost) });
  const expense = (date: string, categoryId: string, amount: number, accountId: string, note?: string) =>
    add(date, { t: "expense", categoryId, amount: p(amount), accountId, note });

  // ---- تهيئة المحل: الخزن والبضاعة اللي كانت موجودة ----
  add(day(-200), { t: "openCash", accountId: "drawer", amount: p(40000) });
  add(day(-200), { t: "openCash", accountId: "instapay", amount: p(80000) });
  add(day(-200), { t: "openCash", accountId: "vcash", amount: p(5000) });
  stock(day(-200), "m190", 45, 120);
  stock(day(-200), "m176", 125, 86.67);
  stock(day(-200), "m183", 62, 85);
  stock(day(-60), "m168", 100, 88);
  stock(day(-60), "m199", 180, 88);
  stock(day(-60), "m208", 300, 78);
  stock(day(-60), "mk1", 60, 70);
  stock(day(-60), "mk2", 42, 95);
  stock(day(-50), "m226", 60, 80);
  // آخر بيعة من الراكد — من شهور
  sale(day(-150), "cash", [["m176", 5, 120]], 600, "drawer");
  sale(day(-110), "cash", [["m183", 2, 120]], 240, "drawer");
  sale(day(-95), "cash", [["m190", 1, 160]], 160, "drawer");
  // حسابات قديمة من الدفتر
  add(day(-125), { t: "opening", partyId: "c1", amount: p(40000), since: day(-125) });
  add(day(-100), { t: "opening", partyId: "c5", amount: p(20400), since: day(-100) });

  // ---- مصنع النور: دفعات تحت الحساب، وبعدين البضاعة بالسعر اللي كتبه ----
  pay(day(-34), "f1", false, 21000, "drawer");
  pay(day(-31), "f1", false, 20000, "instapay");
  pay(day(-29), "f1", false, 3000, "drawer");
  buy(day(-19), "f1", [["m214", 300, 82]]);
  buy(day(-2), "f1", [["m214", 390, 82]]);
  pay(day(0), "f1", false, 2580, "drawer");
  // مصنع الأمانة
  pay(day(-29), "f2", false, 6500, "drawer");
  buy(day(-15), "f2", [["m235", 120, 100]]);
  buy(day(-7), "f2", [["m235", 90, 100]]);
  // مصنع الشروق
  pay(day(-17), "f3", false, 16200, "instapay");
  buy(day(-13), "f3", [["m221", 256, 75]]);
  buy(day(-11), "f3", [["m221", 80, 75]]);
  // مصنع الفجر — مقدّم ولسه مسلّمش
  pay(day(-34), "f4", false, 3000, "drawer");
  pay(day(-3), "f4", false, 10000, "instapay");
  // تاجر جاهز
  buy(day(-4), "t1", [["m240", 100, 95]], 5000, "drawer");

  // ---- المبيعات ----
  sale(day(-56), "c2", [["m208", 70, 130], ["m199", 50, 130]]);
  sale(day(-50), "c3", [["m208", 100, 120]]);
  sale(day(-40), "c5", [["m168", 30, 120]]);
  sale(day(-26), "c7", [["m199", 60, 120]], 2000, "drawer");
  sale(day(-20), "c6", [["m226", 40, 115]]);
  sale(day(-12), "c3", [["m221", 100, 120]]);
  sale(day(-11), "c1", [["m214", 60, 120]]);
  sale(day(-10), "c6", [["m221", 80, 120]]);
  sale(day(-9), "c8", [["m235", 50, 130]]);
  sale(day(-8), "c4", [["m214", 120, 120]], 4000, "instapay");
  sale(day(-5), "c6", [["m214", 80, 120]]);
  sale(day(-2), "c9", [["m240", 12, 130]]);
  sale(day(-1), "c4", [["m221", 60, 120]]);
  // بيع نقدي — زبون طياري
  sale(day(-9), "cash", [["m221", 36, 105]], 3780, "drawer", "11:20");
  sale(day(-8), "cash", [["m235", 6, 160]], 960, "instapay", "13:05");
  sale(day(-5), "cash", [["m199", 24, 120]], 2880, "drawer", "10:40");
  sale(day(-3), "cash", [["m208", 12, 130], ["m199", 12, 125], ["mk1", 12, 85]], 4080, "vcash", "16:15");
  sale(day(-1), "cash", [["m221", 24, 110]], 2640, "drawer", "18:06");
  sale(day(-1), "cash", [["m226", 20, 115]], 2300, "drawer", "12:57");
  sale(day(0), "cash", [["m199", 12, 125], ["m208", 12, 130]], 3060, "vcash", "14:34");
  sale(day(0), "cash", [["m221", 24, 110]], 2640, "drawer", "15:10");
  sale(day(0), "cash", [["m214", 12, 125]], 1500, "drawer", "16:11");

  // ---- التحصيل والمرتجعات والمسامحة ----
  pay(day(-9), "c2", true, 10000, "instapay");
  add(day(-4), { t: "creturn", partyId: "c2", lines: [{ modelId: "m208", qty: 5, price: p(130) }], refund: false });
  pay(day(-3), "c1", true, 5000, "vcash");
  add(day(-1), { t: "creturn", partyId: "c1", lines: [{ modelId: "m214", qty: 10, price: p(120) }], refund: false });
  add(day(0), { t: "settle", partyId: "c1", amount: p(1000), reason: "تقريب" });

  // ---- السلف وزيادة رأس المال والتحويل ----
  add(day(-13), { t: "loan", partyId: "p1", dir: "in", amount: p(30000), accountId: "instapay", dueDate: day(7) });
  add(day(-3), { t: "loan", partyId: "p2", dir: "out", amount: p(1500), accountId: "drawer" });
  add(day(-18), { t: "capital", amount: p(20000), accountId: "instapay", note: "من بيع أرض" });
  add(day(-6), { t: "transfer", from: "vcash", to: "drawer", out: p(3000), in: p(2950) });

  // ---- المصاريف ----
  expense(day(-82), "rent", 6000, "instapay", "إيجار");
  expense(day(-52), "rent", 6000, "instapay", "إيجار");
  expense(day(-40), "personal", 3000, "drawer", "للبيت");
  expense(day(-22), "rent", 6000, "instapay", "إيجار الشهر");
  expense(day(-8), "bills", 850, "instapay", "كهربا المحل");
  expense(day(-2), "wages", 600, "drawer", "يومية شيّال");
  expense(day(-1), "transport", 120, "drawer");
  expense(day(-1), "other", 350, "drawer", "أكياس تغليف");
  expense(day(0), "food", 150, "drawer", "فطار");
  expense(day(0), "shipping", 400, "drawer", "تحميل بضاعة لأحمد الشوا");
  expense(day(0), "personal", 2000, "drawer", "للبيت");

  // أرقام الفواتير بالترتيب الزمني
  const ordered = sortTxs(txs);
  let no = 1000;
  for (const t of ordered) if (t.t === "sale") t.no = ++no;
  return { v: 1, seq: n, invoiceNo: no, parties, models, txs: ordered };
}

/** بالتاريخ وبعدين الساعة وبعدين ترتيب التسجيل */
function sortTxs(txs: Tx[]) {
  return txs
    .map((t, i) => ({ t, i }))
    .sort((a, b) => a.t.date.localeCompare(b.t.date) || timeKey(a.t.time) - timeKey(b.t.time) || a.i - b.i)
    .map((x) => x.t);
}
const timeKey = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

/* ============================ الحالة والحفظ ============================ */

const KEY = "manar-erp-demo-v1";
let db: Db = seed();
let version = 0;
let loaded = false;
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    // مساحة المتصفح أو وضع التصفح الخفي — البيانات تفضل في الذاكرة بس
  }
}

function changed() {
  rebuild();
  version++;
  listeners.forEach((fn) => fn());
}

/** بيتنادى مرة من StoreGate لما الصفحة تفتح في المتصفح */
export function loadStore() {
  if (loaded) return;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) db = JSON.parse(raw) as Db;
  } catch {
    db = seed();
  }
  loaded = true;
  changed();
}

/** اتحمّلت من المتصفح ولا لسه — على السيرفر دايماً لأ */
export const useLoaded = () => useSyncExternalStore(subscribe, () => loaded, () => false);

/** «رجّع البيانات التجريبية» — يمسح كل اللي اتسجل */
export function resetStore() {
  db = seed();
  persist();
  changed();
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** أي شاشة بتقرا البيانات بتناديه — بتترسم تاني لما حاجة تتسجل */
export function useData() {
  return useSyncExternalStore(subscribe, () => version, () => version);
}

/* ============================ المحسوب ============================ */
/* مصفوفات ثابتة بتتملا من جديد بعد كل عملية — الشاشات بتقرا منها على طول */

export const parties: Party[] = [];
export const cashAccounts: CashAccount[] = [];
export const models: Model[] = [];
export const invoices: Invoice[] = [];
export const stockBuys: StockBuy[] = [];
export const expenses: Expense[] = [];
export const capitalIns: CapitalIn[] = [];
export const modelStats: ModelStat[] = [];
export const capitalPeriods: CapitalPeriod[] = [];
const statements = new Map<string, LedgerRow[]>();
const customerStats = new Map<string, CustomerStats>();
let started = TODAY;
let recent: Activity[] = [];

const fill = <T>(arr: T[], items: T[]) => {
  arr.length = 0;
  arr.push(...items);
};

/** اسم الموديل القصير في كشوف الحساب: الكود لو موجود، وإلا الاسم */
const shortModel = (id: string) => {
  const m = db.models.find((x) => x.id === id);
  return m?.code !== undefined ? String(m.code) : (m?.name ?? "");
};
const accName = (id?: string) => CASH_ACCOUNTS.find((a) => a.id === id)?.name ?? "";
const pieces = (lines: { qty: number }[]) => lines.reduce((s, l) => s + l.qty, 0);

/** «قطعة» · «قطعتين» · «5 قطع» · «20 قطعة» */
const qtyText = (n: number) => (n === 1 ? "قطعة" : n === 2 ? "قطعتين" : n <= 10 ? `${n} قطع` : `${n} قطعة`);

function rebuild() {
  const txs = sortTxs(db.txs);
  const recs = new Map(db.parties.map((r) => [r.id, r]));

  /* ---- الخزن ---- */
  const cash = new Map(CASH_ACCOUNTS.map((a) => [a.id, 0]));
  const addCash = (id: string | undefined, v: number) => {
    if (id) cash.set(id, (cash.get(id) ?? 0) + v);
  };

  /* ---- الناس: الرصيد والكشف و«من إمتى» ---- */
  // اتجاه الحساب العادي: العميل عليه · المورد ليه · السلفة حسب أول سلفة
  const natural = new Map<string, boolean>();
  for (const t of txs) if (t.t === "loan" && !natural.has(t.partyId)) natural.set(t.partyId, t.dir === "out");
  type PS = { bal: number; rows: LedgerRow[]; last?: string; debits: { date: string; amt: number }[]; credit: number; dueDate?: string };
  const ps = new Map<string, PS>(db.parties.map((r) => [r.id, { bal: 0, rows: [], debits: [], credit: 0 }]));
  let rowN = 0;
  const post = (partyId: string, date: string, label: string, delta: number, dueFrom?: string) => {
    const r = recs.get(partyId);
    const s = ps.get(partyId);
    if (!r || !s || r.isCash) return;
    s.bal += delta;
    const nat = r.kind === "customer" ? true : r.kind === "supplier" ? false : (natural.get(partyId) ?? true);
    s.rows.push({ id: `r${++rowN}`, date, label, amount: nat ? delta : -delta, balance: s.bal });
    s.last = date;
    // «من إمتى»: الفلوس اللي عليه بتتسدّ من الأقدم
    if (delta > 0) {
      let amt = delta;
      const used = Math.min(amt, s.credit);
      s.credit -= used;
      amt -= used;
      if (amt > 0) s.debits.push({ date: dueFrom ?? date, amt });
    } else {
      let c = -delta;
      while (c > 0 && s.debits.length) {
        const d = s.debits[0];
        const take = Math.min(c, d.amt);
        d.amt -= take;
        c -= take;
        if (d.amt === 0) s.debits.shift();
      }
      s.credit += c;
    }
  };
  const balOf = (id: string) => ps.get(id)?.bal ?? 0;

  /* ---- المخزون: دفعات بالأقدم ---- */
  type MS = { batches: Batch[]; lastCost: number; lastSale?: string; events: { date: string; qty: number; revenue: number; cost: number }[] };
  const ms = new Map<string, MS>(db.models.map((m) => [m.id, { batches: [], lastCost: 0, events: [] }]));
  const addStock = (modelId: string, date: string, sourceId: string, qty: number, unitCost: number) => {
    const m = ms.get(modelId);
    if (!m) return;
    if (unitCost > 0) m.lastCost = unitCost;
    if (qty > 0) m.batches.push({ receivedAt: date, sourceId, pieces: qty, unitCost });
  };
  /** بيطلّع قطع من الأقدم ويرجّع تكلفتها — الشاشات مبتسمحش بأكتر من اللي في المحل */
  const takeStock = (modelId: string, qty: number, preferSource?: string) => {
    const m = ms.get(modelId);
    if (!m) return 0;
    let left = qty;
    let cost = 0;
    const order = preferSource
      ? [...m.batches.filter((b) => b.sourceId === preferSource).reverse(), ...m.batches.filter((b) => b.sourceId !== preferSource)]
      : [...m.batches];
    for (const b of order) {
      if (left === 0) break;
      const take = Math.min(left, b.pieces);
      b.pieces -= take;
      cost += take * b.unitCost;
      left -= take;
    }
    m.batches = m.batches.filter((b) => b.pieces > 0);
    return cost + left * m.lastCost;
  };

  /* ---- شغل كل عميل: اشترى بكام، وكسبت منه كام، وبياخد أنهي موديلات ---- */
  const cs = new Map<string, { sales: number; cost: number; pieces: number; returned: number; lastSale?: string; models: Map<string, CustomerModel> }>();
  const csOf = (id: string) => {
    if (!cs.has(id)) cs.set(id, { sales: 0, cost: 0, pieces: 0, returned: 0, models: new Map() });
    return cs.get(id)!;
  };

  const invs: Invoice[] = [];
  const buys: StockBuy[] = [];
  const exps: Expense[] = [];
  const caps: CapitalIn[] = [];
  const settleEvents: { date: string; cost: number }[] = [];
  const acts: Activity[] = [];

  for (const t of txs) {
    switch (t.t) {
      case "openCash":
        addCash(t.accountId, t.amount);
        break;
      case "openStock":
        addStock(t.modelId, t.date, "", t.qty, t.unitCost);
        break;
      case "opening":
        post(t.partyId, t.date, "رصيد قديم من قبل البرنامج", t.amount, t.since);
        break;
      case "sale": {
        const total = t.lines.reduce((s, l) => s + l.qty * l.price, 0);
        post(t.partyId, t.date, `بيع ${qtyText(pieces(t.lines))}`, total);
        if (t.paid > 0) {
          addCash(t.accountId, t.paid);
          post(t.partyId, t.date, `دفع ← ${accName(t.accountId)}`, -t.paid);
        }
        const c = csOf(t.partyId);
        c.lastSale = t.date;
        for (const l of t.lines) {
          const cost = takeStock(l.modelId, l.qty);
          const m = ms.get(l.modelId);
          if (m) {
            m.lastSale = t.date;
            m.events.push({ date: t.date, qty: l.qty, revenue: l.qty * l.price, cost });
          }
          c.sales += l.qty * l.price;
          c.cost += cost;
          c.pieces += l.qty;
          const cm = c.models.get(l.modelId) ?? { modelId: l.modelId, qty: 0, lastPrice: 0, lastDate: t.date };
          c.models.set(l.modelId, { ...cm, qty: cm.qty + l.qty, lastPrice: l.price, lastDate: t.date });
        }
        invs.push({ no: t.no, date: t.date, time: t.time, partyId: t.partyId, lines: t.lines, paid: t.paid, accountId: t.accountId });
        const x = recs.get(t.partyId);
        acts.push({
          key: t.id, date: t.date, time: t.time, kind: "invoice",
          title: x?.isCash ? "بيع نقدي" : `فاتورة · ${x?.name}`, sub: `#${t.no}`, amount: total, href: `/invoices/${t.no}`,
        });
        break;
      }
      case "buy": {
        const total = t.lines.reduce((s, l) => s + l.qty * l.unitCost, 0);
        const one = t.lines.length === 1 ? ` · موديل ${shortModel(t.lines[0].modelId)} × ${t.lines[0].unitCost / 100}` : "";
        post(t.supplierId, t.date, `شراء ${qtyText(pieces(t.lines))}${one}`, -total);
        if (t.paid > 0) {
          addCash(t.accountId, -t.paid);
          post(t.supplierId, t.date, `دفعتله ← من ${accName(t.accountId)}`, t.paid);
        }
        for (const l of t.lines) addStock(l.modelId, t.date, t.supplierId, l.qty, l.unitCost);
        buys.push({ id: t.id, date: t.date, supplierId: t.supplierId, lines: t.lines, paid: t.paid, accountId: t.accountId });
        acts.push({
          key: t.id, date: t.date, time: t.time, kind: "receive",
          title: `شراء مخزون · ${recs.get(t.supplierId)?.name}`, sub: qtyText(pieces(t.lines)), amount: total, href: `/accounts/${t.supplierId}`,
        });
        break;
      }
      case "pay": {
        const r = recs.get(t.partyId);
        let label: string;
        if (t.collect) {
          addCash(t.accountId, t.amount);
          label = r?.kind === "supplier" ? `رجّعلي ← ${accName(t.accountId)}` : `دفع ← ${accName(t.accountId)}`;
          post(t.partyId, t.date, label, -t.amount);
        } else {
          addCash(t.accountId, -t.amount);
          label =
            r?.kind === "supplier"
              ? `دفعة تحت الحساب ← من ${accName(t.accountId)}`
              : r?.kind === "customer"
                ? `رجعتله فلوس ← من ${accName(t.accountId)}`
                : `دفعتله ← من ${accName(t.accountId)}`;
          post(t.partyId, t.date, label, t.amount);
        }
        acts.push({
          key: t.id, date: t.date, time: t.time, kind: t.collect ? "payment" : "purchase",
          title: `${t.collect ? "تحصيل" : r?.kind === "supplier" ? "دفعة تحت الحساب" : "دفع"} · ${r?.name}`, sub: accName(t.accountId), amount: t.amount, href: `/accounts/${t.partyId}`,
        });
        break;
      }
      case "settle": {
        const before = balOf(t.partyId);
        // نحو الصفر: عليه فلوس ← سامحته (خسارة) · ليه فلوس ← سامحني (مكسب)
        post(t.partyId, t.date, t.reason ? `مسامحة · ${t.reason}` : "مسامحة", before > 0 ? -t.amount : t.amount);
        settleEvents.push({ date: t.date, cost: before > 0 ? t.amount : -t.amount });
        break;
      }
      case "creturn": {
        const total = t.lines.reduce((s, l) => s + l.qty * l.price, 0);
        post(t.partyId, t.date, `مرتجع ${qtyText(pieces(t.lines))}`, -total);
        if (t.refund) {
          addCash(t.accountId, -total);
          post(t.partyId, t.date, `رجعتله فلوس ← من ${accName(t.accountId)}`, total);
        }
        const c = csOf(t.partyId);
        for (const l of t.lines) {
          const m = ms.get(l.modelId);
          const unit = m?.lastCost ?? 0;
          addStock(l.modelId, t.date, t.partyId, l.qty, unit);
          m?.events.push({ date: t.date, qty: -l.qty, revenue: -l.qty * l.price, cost: -l.qty * unit });
          c.sales -= l.qty * l.price;
          c.cost -= l.qty * unit;
          c.pieces -= l.qty;
          c.returned += l.qty;
          const cm = c.models.get(l.modelId);
          if (cm) c.models.set(l.modelId, { ...cm, qty: cm.qty - l.qty });
        }
        break;
      }
      case "sreturn": {
        const total = t.lines.reduce((s, l) => s + l.qty * l.unitCost, 0);
        post(t.partyId, t.date, `مرتجع ${qtyText(pieces(t.lines))} للمورد`, total);
        for (const l of t.lines) takeStock(l.modelId, l.qty, t.partyId);
        break;
      }
      case "expense": {
        addCash(t.accountId, -t.amount);
        exps.push({ id: t.id, date: t.date, categoryId: t.categoryId, amount: t.amount, accountId: t.accountId, note: t.note });
        const c = categoryById(t.categoryId);
        acts.push({
          key: t.id, date: t.date, time: t.time, kind: "expense",
          title: c?.personal ? "خدته لنفسك" : `مصروف · ${c?.label}`, sub: t.note ?? "", amount: t.amount, href: "/expenses",
        });
        break;
      }
      case "transfer": {
        addCash(t.from, -t.out);
        addCash(t.to, t.in);
        // اتسحب 3,000 ودخل 2,950 ← الـ 50 مصروف لوحده (الـ spec، قسم 7)
        if (t.out > t.in)
          exps.push({ id: t.id, date: t.date, categoryId: "fees", amount: t.out - t.in, accountId: t.from, note: `تحويل ${accName(t.from)} ← ${accName(t.to)}` });
        break;
      }
      case "capital":
        addCash(t.accountId, t.amount);
        caps.push({ id: t.id, date: t.date, amount: t.amount, accountId: t.accountId, note: t.note });
        acts.push({
          key: t.id, date: t.date, time: t.time, kind: "payment",
          title: "زيادة رأس المال", sub: t.note ?? accName(t.accountId), amount: t.amount, href: "/capital",
        });
        break;
      case "loan": {
        if (t.dir === "in") {
          addCash(t.accountId, t.amount);
          post(t.partyId, t.date, `استلفت ← دخلت ${accName(t.accountId)}`, -t.amount);
        } else {
          addCash(t.accountId, -t.amount);
          post(t.partyId, t.date, `سلّفته ← من ${accName(t.accountId)}`, t.amount);
        }
        const s = ps.get(t.partyId);
        if (s) s.dueDate = t.dueDate;
        break;
      }
    }
  }

  /* ---- النتايج ---- */
  fill(
    cashAccounts,
    CASH_ACCOUNTS.map((a) => ({ ...a, balance: cash.get(a.id) ?? 0 })),
  );

  statements.clear();
  fill(
    parties,
    db.parties.map((r) => {
      const s = ps.get(r.id)!;
      statements.set(r.id, s.rows);
      return {
        id: r.id,
        kind: r.kind,
        name: r.name,
        phone: r.phone,
        balance: r.isCash ? 0 : s.bal,
        oldestDue: s.bal > 0 && s.debits.length ? s.debits[0].date : undefined,
        lastActivity: s.last ?? r.createdAt,
        isCash: r.isCash,
        dueDate: s.bal !== 0 ? s.dueDate : undefined,
      };
    }),
  );

  const month = TODAY.slice(0, 7);
  fill(
    models,
    db.models.map((r) => {
      const m = ms.get(r.id)!;
      return {
        ...r,
        batches: m.batches,
        lastSale: m.lastSale,
        soldThisMonth: m.events.filter((e) => e.date.startsWith(month)).reduce((s, e) => s + e.qty, 0),
      };
    }),
  );

  customerStats.clear();
  for (const [id, c] of cs)
    customerStats.set(id, {
      sales: c.sales,
      profit: c.sales - c.cost,
      invoices: invs.filter((x) => x.partyId === id).length,
      pieces: c.pieces,
      returned: c.returned,
      lastSale: c.lastSale,
      models: [...c.models.values()].filter((m) => m.qty > 0).sort((a, b) => b.qty - a.qty),
    });

  fill(invoices, invs.sort((a, b) => a.no - b.no));
  fill(stockBuys, buys);
  fill(expenses, exps);
  fill(capitalIns, caps);
  recent = acts.reverse();

  // أنهي موديل بيكسب — آخر 3 شهور
  const since90 = day(-91);
  fill(
    modelStats,
    db.models
      .map((r) => {
        const ev = ms.get(r.id)!.events.filter((e) => e.date > since90);
        return {
          modelId: r.id,
          sold: ev.reduce((s, e) => s + e.qty, 0),
          revenue: ev.reduce((s, e) => s + e.revenue, 0),
          cost: ev.reduce((s, e) => s + e.cost, 0),
        };
      })
      .filter((x) => x.sold > 0),
  );

  // رأس المال: ليه زاد ولا نقص في كل فترة
  started = txs[0]?.date ?? TODAY;
  const allEvents = [...ms.values()].flatMap((m) => m.events);
  fill(
    capitalPeriods,
    (
      [
        ["1m", "آخر شهر", 30],
        ["3m", "آخر 3 شهور", 91],
        ["1y", "آخر سنة", 365],
      ] as const
    ).map(([id, label, days]) => {
      const from = day(-days);
      const inWin = (d: string) => d > from;
      const ev = allEvents.filter((e) => inWin(e.date));
      const shop = exps.filter((e) => inWin(e.date) && !categoryById(e.categoryId)?.personal);
      const byCat = new Map<string, number>();
      for (const e of shop) byCat.set(e.categoryId, (byCat.get(e.categoryId) ?? 0) + e.amount);
      return {
        id,
        label,
        days,
        sales: ev.reduce((s, e) => s + e.revenue, 0),
        cogs: ev.reduce((s, e) => s + e.cost, 0),
        expenses: shop.reduce((s, e) => s + e.amount, 0),
        settlements: settleEvents.filter((e) => inWin(e.date)).reduce((s, e) => s + e.cost, 0),
        added: caps.filter((c) => inWin(c.date)).reduce((s, c) => s + c.amount, 0),
        withdrawn: exps.filter((e) => inWin(e.date) && categoryById(e.categoryId)?.personal).reduce((s, e) => s + e.amount, 0),
        topExpenses: [...byCat]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([c, amount]) => ({ label: categoryById(c)?.label ?? "", amount })),
      };
    }),
  );
}

rebuild();

/* ============================ التسجيل ============================ */

const newId = () => `n${++db.seq}`;

function commit(body: TxBody, date = TODAY) {
  db.txs.push({ ...body, id: newId(), date, time: nowTime() } as Tx);
  persist();
  changed();
}

/** طرف جديد اتعمل من نفس الشاشة (id = "new") بيتسجل هنا الأول */
function ensureParty(x: Party): string {
  if (x.id !== "new" && !x.id.startsWith("new-") && db.parties.some((r) => r.id === x.id)) return x.id;
  const id = newId();
  db.parties.push({ id, kind: x.kind, name: x.name, phone: x.phone, createdAt: TODAY });
  return id;
}

/** موديل جديد اتكتب كوده أو اسمه في السطر */
type LineModel = { modelId?: string; code?: number; name?: string };
function ensureModel(l: LineModel): string {
  if (l.modelId && db.models.some((m) => m.id === l.modelId)) return l.modelId;
  const found = db.models.find((m) => (l.code !== undefined && m.code === l.code) || (l.code === undefined && l.name && m.name === l.name));
  if (found) return found.id;
  const id = newId();
  db.models.push({ id, code: l.code, name: l.name });
  return id;
}

export const actions = {
  /** بيع — ويرجّع رقم الفاتورة ورقم العميل (لو اتفتحله حساب جديد) */
  sale(a: { party: Party; lines: SaleLine[]; paid: number; accountId?: string }) {
    const partyId = ensureParty(a.party);
    const no = ++db.invoiceNo;
    commit({ t: "sale", no, partyId, lines: a.lines, paid: a.paid, accountId: a.paid > 0 ? a.accountId : undefined });
    return { no, partyId };
  },
  buy(a: { supplier: Party; lines: (LineModel & { qty: number; unitCost: number })[]; paid: number; accountId?: string }) {
    const supplierId = ensureParty(a.supplier);
    const lines = a.lines.map((l) => ({ modelId: ensureModel(l), qty: l.qty, unitCost: l.unitCost }));
    commit({ t: "buy", supplierId, lines, paid: a.paid, accountId: a.paid > 0 ? a.accountId : undefined });
    return { supplierId };
  },
  pay(a: { partyId: string; collect: boolean; amount: number; accountId: string; note?: string }) {
    commit({ t: "pay", ...a });
  },
  settle(a: { partyId: string; amount: number; reason?: string }) {
    commit({ t: "settle", ...a });
  },
  customerReturn(a: { partyId: string; lines: SaleLine[]; refund: boolean; accountId?: string }) {
    commit({ t: "creturn", ...a });
  },
  supplierReturn(a: { partyId: string; lines: CostLine[] }) {
    commit({ t: "sreturn", ...a });
  },
  expense(a: { categoryId: string; amount: number; accountId: string; note?: string }) {
    commit({ t: "expense", ...a });
  },
  transfer(a: { from: string; to: string; out: number; in: number }) {
    commit({ t: "transfer", ...a });
  },
  capital(a: { amount: number; accountId: string; note?: string }) {
    commit({ t: "capital", ...a });
  },
  loan(a: { person: Party; dir: "in" | "out"; amount: number; accountId: string; dueDate?: string }) {
    const partyId = ensureParty(a.person);
    commit({ t: "loan", partyId, dir: a.dir, amount: a.amount, accountId: a.accountId, dueDate: a.dueDate || undefined });
    return { partyId };
  },
  /** فتح حساب — ولو له حساب قديم بيتسجل رصيد افتتاحي */
  openAccount(a: { kind: PartyKind; name: string; phone?: string; opening: number; since?: string }) {
    const id = ensureParty({ id: "new", kind: a.kind, name: a.name, phone: a.phone, balance: 0, lastActivity: TODAY });
    if (a.opening !== 0) commit({ t: "opening", partyId: id, amount: a.opening, since: a.since || undefined });
    else {
      persist();
      changed();
    }
    return { id };
  },
  /** جرد التهيئة — كل سطر دفعة بضاعة بتكلفتها */
  openingStock(rows: (LineModel & { qty: number; unitCost: number })[]) {
    for (const r of rows) {
      const modelId = ensureModel(r);
      db.txs.push({ t: "openStock", modelId, qty: r.qty, unitCost: r.unitCost, id: newId(), date: TODAY, time: nowTime() });
    }
    persist();
    changed();
  },
};

/* ============================ الأطراف ============================ */

export const byId = (id: string) => parties.find((x) => x.id === id);
export const ofKind = (k: PartyKind) => parties.filter((x) => x.kind === k);

/** «ليا»: أي حد عليه فلوس — الأقدم الأول */
export const receivables = () =>
  parties
    .filter((x) => x.balance > 0)
    .sort((a, b) => daysSince(b.oldestDue ?? TODAY) - daysSince(a.oldestDue ?? TODAY));

/**
 * شاشة الدفع بتفتح على أنهي اتجاه — وتقدر تقلبه («استلمت منه / دفعتله»):
 * العميل استلمت منه · المورد دفعتله حتى لو عليه مقدّم · السلفة حسب اتجاهها.
 */
export const isCollectFrom = (x: Party) => x.kind === "customer" || (x.kind === "person" && x.balance > 0);

/** اسم الدفعة: أي فلوس للمصنع أو التاجر «دفعة تحت الحساب» — سدّت اللي ليه ولا بقت مقدّم */
export function paymentTitle(x: Party, collect: boolean) {
  if (x.kind === "customer") return collect ? "تحصيل" : "رجّعتله فلوس";
  if (x.kind === "supplier") return collect ? "رجّعلك فلوس" : "دفعة تحت الحساب";
  return collect ? "استلمت منه" : "دفعتله";
}
/** حساب المورد بعد شراية: اللي مندفعش بيتخصم من المقدّم الأول، والباقي يبقى ليه */
export function afterPurchase(balance: number, unpaid: number) {
  return { fromAdvance: Math.min(unpaid, Math.max(0, balance)), after: balance - unpaid };
}

/** السلف اللي ميعادها فات أو جاي خلال أسبوع */
export const loansDueSoon = () =>
  ofKind("person")
    .filter((x) => x.balance !== 0 && x.dueDate && daysSince(TODAY, new Date(x.dueDate)) <= 7)
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!));

export const statementOf = (partyId: string): LedgerRow[] => statements.get(partyId) ?? [];

/** ملخص شغل العميل — البيع والمكسب صافيين بعد المرتجع */
export const customerStatsOf = (partyId: string): CustomerStats | undefined => customerStats.get(partyId);
export const invoicesOf = (partyId: string) => invoices.filter((x) => x.partyId === partyId).sort((a, b) => b.no - a.no);

/* ============================ الموديلات ============================ */

export const modelById = (id: string) => models.find((m) => m.id === id);
export const modelByCode = (code: number) => models.find((m) => m.code === code);

/** «214 · قميص كاروهات» · «168» · «طقم ولادي» */
export const modelLabel = (m: Pick<Model, "code" | "name">) =>
  m.code !== undefined && m.name ? `${m.code} · ${m.name}` : m.code !== undefined ? String(m.code) : (m.name ?? "");

/** الموديل اللي اتكتب بالظبط: أرقام = كود · حروف = اسم بعد التوحيد */
export function findModel(q: string): Model | undefined {
  const t = normalizeArabic(q);
  if (!t) return undefined;
  if (/^\d+$/.test(t)) return modelByCode(Number(t));
  return models.find((m) => m.name && normalizeArabic(m.name) === t);
}

/** للبحث والاقتراحات: الكود فيه الأرقام دي، أو الاسم فيه الكلام ده */
export function searchModels(q: string): Model[] {
  const t = normalizeArabic(q);
  if (!t) return [];
  return models.filter(
    (m) => (m.code !== undefined && String(m.code).includes(t)) || (!!m.name && normalizeArabic(m.name).includes(t)),
  );
}

/** القطع في المحل — مفيش بيع أكتر منها، فمبيبقاش بالسالب */
export const stockOf = (m: Model) => m.batches.reduce((s, b) => s + b.pieces, 0);

/** قيمة الموديل بالقروش — متقرّبة لأقرب جنيه */
export const valueOf = (m: Model) => Math.round(m.batches.reduce((s, b) => s + b.pieces * b.unitCost, 0) / 100) * 100;

/** راكد = فيه مخزون وآخر بيعة بقالها أكتر من 90 يوم */
export const isStale = (m: Model) =>
  stockOf(m) > 0 && (!m.lastSale || daysSince(m.lastSale, new Date(TODAY)) > 90);

export const avgCost = (m: Model) => {
  const n = stockOf(m);
  return n <= 0 ? 0 : Math.round(valueOf(m) / n);
};

export const buyTotal = (b: StockBuy) => b.lines.reduce((s, l) => s + l.qty * l.unitCost, 0);
export const buyPieces = (b: StockBuy) => b.lines.reduce((s, l) => s + l.qty, 0);

/* ============================ الفواتير ============================ */

export const invoiceTotal = (inv: Invoice) => inv.lines.reduce((s, l) => s + l.qty * l.price, 0);
export const invoicePieces = (inv: Invoice) => inv.lines.reduce((s, l) => s + l.qty, 0);

export function invoiceKind(inv: Invoice): "cash" | "partial" | "credit" {
  const total = invoiceTotal(inv);
  if (inv.paid >= total) return "cash";
  if (inv.paid > 0) return "partial";
  return "credit";
}

export const invoiceByNo = (no: number) => invoices.find((x) => x.no === no);

/* ============================ النهاردة ============================ */

export function todaySummary() {
  const sales = invoices.filter((i) => i.date === TODAY);
  const shopExpenses = expenses
    .filter((e) => e.date === TODAY && !categoryById(e.categoryId)?.personal)
    .reduce((s, e) => s + e.amount, 0);
  return {
    salesCount: sales.length,
    salesTotal: sales.reduce((s, i) => s + invoiceTotal(i), 0),
    expenses: shopExpenses,
  };
}

/** آخر الحركات — بتطمّنه إن اللي سجّله اتحفظ */
export const recentActivity = (limit = 6) => recent.slice(0, limit);

/* ========================== أرقام البيع والربح ========================== */

export const profitOf = (s: ModelStat) => s.revenue - s.cost;
export const marginOf = (s: ModelStat) => (s.revenue === 0 ? 0 : (profitOf(s) / s.revenue) * 100);

export const staleModels = () => models.filter(isStale).sort((a, b) => valueOf(b) - valueOf(a));

/* ============================ رأس المال ============================ */

/** البرنامج اشتغل من أول عملية — قبلها مفيش أرقام نقارن بيها */
export const startedAt = () => started;

export const shopProfit = (x: CapitalPeriod) => x.sales - x.cogs - x.expenses - x.settlements;
export const capitalChange = (x: CapitalPeriod) => shopProfit(x) + x.added - x.withdrawn;
export const periodAvailable = (x: CapitalPeriod) => daysSince(started, new Date(TODAY)) >= x.days;

/* محسوبة من البيانات — مفيش رقم مكتوب بالإيد (الـ spec، قسم 8) */
export const totals = {
  get stockValue() {
    return models.reduce((s, m) => s + valueOf(m), 0);
  },
  get liquidity() {
    return cashAccounts.reduce((s, a) => s + a.balance, 0);
  },
  get receivable() {
    return parties.reduce((s, x) => s + Math.max(0, x.balance), 0);
  },
  get payable() {
    return parties.reduce((s, x) => s + Math.max(0, -x.balance), 0);
  },
  /** صافي موقفي = السيولة + ليا − عليا (فلوس بس، من غير بضاعة) */
  get net() {
    return totals.liquidity + totals.receivable - totals.payable;
  },
  /** رأس المال = بضاعة + فلوس + ليه − عليه */
  get capital() {
    return totals.stockValue + totals.liquidity + totals.receivable - totals.payable;
  },
  /** فلوس عند عملاء متأخرين أكتر من 90 يوم — محسوبة في رأس المال ومش مضمونة */
  get overdueReceivable() {
    return ofKind("customer")
      .filter((x) => x.balance > 0 && x.oldestDue && daysSince(x.oldestDue, new Date(TODAY)) > 90)
      .reduce((s, x) => s + x.balance, 0);
  },
};

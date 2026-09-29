/**
 * بيانات عرض تجريبية.
 *
 * الأنواع هنا مرآة لجداول Supabase الجاية (الـ spec، قسم 8)، عشان الربط
 * بعدين يبقى تبديل مصدر البيانات مش إعادة كتابة للشاشات.
 *
 * كل المبالغ **بالقروش**. الإجماليات **محسوبة** مش مكتوبة بالإيد — نفس قاعدة
 * الـ spec: مفيش رصيد متخزن.
 */

import { p, daysSince } from "./format";

export const TODAY = "2026-09-23";

/* ============================ الأطراف ============================ */

export type PartyKind = "customer" | "factory" | "supplier";

export type Party = {
  id: string;
  kind: PartyKind;
  name: string;
  phone?: string;
  /** موجب = ليا عنده · سالب = عليا له */
  balance: number;
  /** أقدم مبلغ لسه مستحق — منه بييجي «من إمتى» */
  oldestDue?: string;
  lastActivity: string;
  /** طرف «نقدي» للبيع لزبون طياري — مالوش حساب ومبيظهرش في قايمة العملاء */
  isCash?: boolean;
};

export const parties: Party[] = [
  // العملاء — ليا عندهم
  { id: "c1", kind: "customer", name: "أحمد الشوا", phone: "01001234567", balance: p(45000), oldestDue: "2026-05-20", lastActivity: "2026-09-23" },
  { id: "c2", kind: "customer", name: "محمود سعيد", phone: "01112223344", balance: p(38000), oldestDue: "2026-07-21", lastActivity: "2026-09-19" },
  { id: "c3", kind: "customer", name: "عصام الجمل", phone: "01225556677", balance: p(32000), oldestDue: "2026-09-11", lastActivity: "2026-09-21" },
  { id: "c4", kind: "customer", name: "رمضان أبو العلا", phone: "01008889900", balance: p(28500), oldestDue: "2026-09-15", lastActivity: "2026-09-22" },
  { id: "c5", kind: "customer", name: "سيد النجار", phone: "01144556677", balance: p(24000), oldestDue: "2026-06-18", lastActivity: "2026-09-10" },
  { id: "c6", kind: "customer", name: "خالد عبد ربه", phone: "01277889900", balance: p(18500), oldestDue: "2026-09-05", lastActivity: "2026-09-20" },
  { id: "c7", kind: "customer", name: "مصطفى الليثي", phone: "01033445566", balance: p(12300), oldestDue: "2026-08-28", lastActivity: "2026-09-18" },
  { id: "c8", kind: "customer", name: "جمال شحاتة", phone: "01155667788", balance: p(8700), oldestDue: "2026-09-14", lastActivity: "2026-09-22" },
  { id: "c9", kind: "customer", name: "ياسر الدمرداش", phone: "01266778899", balance: p(3000), oldestDue: "2026-09-17", lastActivity: "2026-09-17" },
  { id: "c10", kind: "customer", name: "نقدي", balance: 0, lastActivity: TODAY, isCash: true },

  // المصانع — عليا ليهم (مصنعية)
  { id: "f1", kind: "factory", name: "مصنع النور", phone: "01020304050", balance: -p(18000), lastActivity: "2026-09-21" },
  { id: "f2", kind: "factory", name: "مصنع الأمانة", phone: "01060708090", balance: -p(14500), lastActivity: "2026-09-16" },
  { id: "f3", kind: "factory", name: "مصنع الشروق", phone: "01099887766", balance: -p(9000), lastActivity: "2026-09-12" },

  // تجار القماش — عليا ليهم
  { id: "s1", kind: "supplier", name: "حسن الأقمشة", phone: "01011223344", balance: -p(20000), lastActivity: "2026-09-23" },
  { id: "s2", kind: "supplier", name: "مورد الدلتا", phone: "01233445566", balance: -p(6500), lastActivity: "2026-09-18" },
];

export const byId = (id: string) => parties.find((x) => x.id === id);
export const cashParty = parties.find((x) => x.isCash)!;
export const ofKind = (k: PartyKind) => parties.filter((x) => x.kind === k);

/** العملاء اللي عليهم فلوس، الأقدم الأول — ده ترتيب «مين متأخر» */
export const receivables = () =>
  ofKind("customer")
    .filter((x) => x.balance > 0)
    .sort((a, b) => daysSince(a.oldestDue ?? TODAY) - daysSince(b.oldestDue ?? TODAY));

/** المصانع وتجار القماش اللي ليهم فلوس */
export const payables = () =>
  parties
    .filter((x) => x.kind !== "customer" && x.balance < 0)
    .sort((a, b) => a.balance - b.balance);

/* ============================ الخزن ============================ */

export type CashAccount = { id: string; name: string; short: string; balance: number };

export const cashAccounts: CashAccount[] = [
  { id: "drawer", name: "الدرج", short: "الدرج", balance: p(15000) },
  { id: "instapay", name: "انستاباي", short: "انستاباي", balance: p(40000) },
  { id: "vcash", name: "فودافون كاش", short: "فودافون", balance: p(3200) },
];

/* ============================ الموديلات ============================ */

/** دفعة من أمر تصنيع — نفس الكود ممكن يتكرر بتكلفتين (الـ spec، قسم 4) */
export type Batch = {
  orderId: string;
  orderLabel: string;
  pieces: number;
  unitCost: number;
  /** التكلفة لسه مبدئية لأن أمر التصنيع مقفلش */
  provisional: boolean;
};

export type Model = {
  code: number;
  name?: string;
  batches: Batch[];
  /** لسه عند المصنع — «فاضل قد إيه» */
  incoming: number;
  lastSale?: string;
  soldThisMonth: number;
};

export const models: Model[] = [
  {
    code: 214,
    name: "قميص كاروهات",
    batches: [
      { orderId: "o1", orderLabel: "أمر تصنيع مارس", pieces: 120, unitCost: p(85), provisional: false },
      { orderId: "o5", orderLabel: "أمر تصنيع سبتمبر", pieces: 340, unitCost: p(92), provisional: true },
    ],
    incoming: 30,
    lastSale: "2026-09-20",
    soldThisMonth: 85,
  },
  {
    code: 208,
    name: "بنطلون جينز",
    batches: [{ orderId: "o2", orderLabel: "أمر تصنيع أغسطس", pieces: 180, unitCost: p(78), provisional: false }],
    incoming: 0,
    lastSale: "2026-09-22",
    soldThisMonth: 140,
  },
  {
    code: 221,
    name: "تيشيرت قطن",
    batches: [{ orderId: "o3", orderLabel: "أمر تصنيع أغسطس", pieces: 260, unitCost: p(74), provisional: false }],
    incoming: 0,
    lastSale: "2026-09-21",
    soldThisMonth: 210,
  },
  {
    code: 199,
    name: "قميص سادة",
    batches: [{ orderId: "o4", orderLabel: "أمر تصنيع يوليو", pieces: 150, unitCost: p(88), provisional: false }],
    incoming: 0,
    lastSale: "2026-09-18",
    soldThisMonth: 60,
  },
  {
    code: 235,
    name: "جاكيت خفيف",
    batches: [{ orderId: "o6", orderLabel: "أمر تصنيع سبتمبر", pieces: 95, unitCost: p(96), provisional: true }],
    incoming: 120,
    lastSale: "2026-09-19",
    soldThisMonth: 25,
  },
  {
    code: 190,
    name: "جاكيت شتوي",
    batches: [{ orderId: "o7", orderLabel: "أمر تصنيع فبراير", pieces: 45, unitCost: p(120), provisional: false }],
    incoming: 0,
    lastSale: "2026-06-02",
    soldThisMonth: 0,
  },
  {
    code: 176,
    name: "بلوزة صيفي",
    batches: [{ orderId: "o8", orderLabel: "أمر تصنيع إبريل", pieces: 120, unitCost: p(86.67), provisional: false }],
    incoming: 0,
    lastSale: "2026-04-25",
    soldThisMonth: 0,
  },
  {
    code: 183,
    name: "شورت",
    batches: [{ orderId: "o9", orderLabel: "أمر تصنيع مايو", pieces: 60, unitCost: p(85), provisional: false }],
    incoming: 0,
    lastSale: "2026-05-30",
    soldThisMonth: 0,
  },
  {
    code: 168,
    batches: [{ orderId: "o10", orderLabel: "أمر تصنيع يونيو", pieces: 70, unitCost: p(88), provisional: false }],
    incoming: 0,
    lastSale: "2026-09-14",
    soldThisMonth: 18,
  },
];

export const modelByCode = (code: number) => models.find((m) => m.code === code);

/** إجمالي القطع في المحل */
export const stockOf = (m: Model) => m.batches.reduce((s, b) => s + b.pieces, 0);

/** قيمة الموديل بالقروش */
export const valueOf = (m: Model) =>
  m.batches.reduce((s, b) => s + b.pieces * b.unitCost, 0);

/** راكد = آخر بيعة بقالها أكتر من 90 يوم وفيه مخزون */
export const isStale = (m: Model) =>
  stockOf(m) > 0 && (!m.lastSale || daysSince(m.lastSale) > 90);

/** متوسط تكلفة القطعة — للعرض في تفاصيل الموديل */
export const avgCost = (m: Model) => {
  const n = stockOf(m);
  return n === 0 ? 0 : Math.round(valueOf(m) / n);
};

/* ============================ أوامر التصنيع ============================ */

export type ProductionOrder = {
  id: string;
  label: string;
  factoryId: string;
  modelCode: number;
  fabricMeters: number;
  fabricCost: number;
  workPerPiece: number;
  extras: number;
  expectedPieces: number;
  receivedGood: number;
  receivedDefective: number;
  returnedFabricM: number;
  sold: number;
  status: "open" | "closed";
  openedAt: string;
  closedAt?: string;
};

export const orders: ProductionOrder[] = [
  {
    id: "o5", label: "أمر تصنيع سبتمبر", factoryId: "f1", modelCode: 214,
    fabricMeters: 200, fabricCost: p(20000), workPerPiece: p(30), extras: p(1000),
    expectedPieces: 400, receivedGood: 370, receivedDefective: 10, returnedFabricM: 0,
    sold: 30, status: "open", openedAt: "2026-08-28",
  },
  {
    id: "o6", label: "أمر تصنيع سبتمبر", factoryId: "f2", modelCode: 235,
    fabricMeters: 180, fabricCost: p(21600), workPerPiece: p(38), extras: p(900),
    expectedPieces: 240, receivedGood: 120, receivedDefective: 4, returnedFabricM: 0,
    sold: 25, status: "open", openedAt: "2026-09-08",
  },
  {
    id: "o1", label: "أمر تصنيع مارس", factoryId: "f1", modelCode: 214,
    fabricMeters: 150, fabricCost: p(13500), workPerPiece: p(28), extras: p(700),
    expectedPieces: 300, receivedGood: 288, receivedDefective: 6, returnedFabricM: 5,
    sold: 168, status: "closed", openedAt: "2026-03-02", closedAt: "2026-03-28",
  },
  {
    id: "o3", label: "أمر تصنيع أغسطس", factoryId: "f3", modelCode: 221,
    fabricMeters: 220, fabricCost: p(17600), workPerPiece: p(24), extras: p(600),
    expectedPieces: 480, receivedGood: 470, receivedDefective: 8, returnedFabricM: 0,
    sold: 210, status: "closed", openedAt: "2026-07-30", closedAt: "2026-08-24",
  },
];

/** التكلفة المبدئية — على العدد المتوقع */
export const provisionalCost = (o: ProductionOrder) =>
  Math.round(
    (o.fabricCost + o.expectedPieces * o.workPerPiece + o.extras) / o.expectedPieces,
  );

/** التكلفة الحقيقية — على السليم اللي وصل فعلاً (الهدر بيتحمل لوحده) */
export const actualCost = (o: ProductionOrder) =>
  o.receivedGood === 0
    ? 0
    : Math.round(
        (o.fabricCost + o.receivedGood * o.workPerPiece + o.extras) / o.receivedGood,
      );

/** نسبة الهدر = اللي ضاع من المتوقع */
export const wastePct = (o: ProductionOrder) =>
  o.expectedPieces === 0
    ? 0
    : ((o.expectedPieces - o.receivedGood) / o.expectedPieces) * 100;

export const openOrders = () => orders.filter((o) => o.status === "open");

/** الهدر لكل مصنع — الرقم اللي محدش في السوق بيحسبه */
export function wasteByFactory() {
  const map = new Map<string, { expected: number; got: number }>();
  for (const o of orders) {
    const e = map.get(o.factoryId) ?? { expected: 0, got: 0 };
    e.expected += o.expectedPieces;
    e.got += o.receivedGood;
    map.set(o.factoryId, e);
  }
  return [...map.entries()]
    .map(([factoryId, v]) => ({
      factoryId,
      name: byId(factoryId)?.name ?? "",
      pct: ((v.expected - v.got) / v.expected) * 100,
    }))
    .sort((a, b) => b.pct - a.pct);
}

/* ============================ المشتريات ============================ */

export type Purchase = {
  id: string;
  date: string;
  what: string;
  meters?: number;
  amount: number;
  supplierName: string;
};

export const purchases: Purchase[] = [
  { id: "p1", date: "2026-09-23", what: "قماش قطن", meters: 200, amount: p(20000), supplierName: "حسن الأقمشة" },
  { id: "p2", date: "2026-09-18", what: "قماش كتان", meters: 150, amount: p(18000), supplierName: "مورد الدلتا" },
  { id: "p3", date: "2026-09-12", what: "أزرار وخيوط", amount: p(800), supplierName: "نقدي" },
  { id: "p4", date: "2026-09-06", what: "قماش جينز", meters: 180, amount: p(16200), supplierName: "حسن الأقمشة" },
  { id: "p5", date: "2026-08-29", what: "قماش قطن", meters: 220, amount: p(21000), supplierName: "حسن الأقمشة" },
  { id: "p6", date: "2026-08-21", what: "شحن وتغليف", amount: p(1200), supplierName: "نقدي" },
];

/* ============================ القماش في المحل ============================ */

export type Fabric = { id: string; name: string; meters: number; costPerMeter: number };

export const fabrics: Fabric[] = [
  { id: "fb1", name: "قطن أبيض", meters: 120, costPerMeter: p(100) },
  { id: "fb2", name: "كتان بيچ", meters: 85, costPerMeter: p(120) },
  { id: "fb3", name: "جينز أزرق", meters: 90, costPerMeter: p(90) },
];

export const fabricAtFactories: Fabric[] = [
  { id: "fx1", name: "قطن أبيض · مصنع النور", meters: 200, costPerMeter: p(100) },
  { id: "fx2", name: "كتان بيچ · مصنع الأمانة", meters: 180, costPerMeter: p(120) },
];

/* ============================ كشوف الحسابات ============================ */

export type LedgerRow = {
  id: string;
  date: string;
  label: string;
  /** موجب = زاد اللي عليه · سالب = قلّ */
  amount: number;
  balance: number;
};

const statements: Record<string, LedgerRow[]> = {
  c1: [
    { id: "l1", date: "2026-09-12", label: "بيع 60 قطعة", amount: p(7200), balance: p(52200) },
    { id: "l2", date: "2026-09-20", label: "دفع ← فودافون كاش", amount: -p(5000), balance: p(47200) },
    { id: "l3", date: "2026-09-22", label: "مرتجع 10 قطع", amount: -p(1200), balance: p(46000) },
    { id: "l4", date: "2026-09-23", label: "مسامحة", amount: -p(1000), balance: p(45000) },
  ],
  c2: [
    { id: "l5", date: "2026-09-03", label: "بيع 120 قطعة", amount: p(15600), balance: p(48600) },
    { id: "l6", date: "2026-09-14", label: "دفع ← انستاباي", amount: -p(10000), balance: p(38600) },
    { id: "l7", date: "2026-09-19", label: "مرتجع 5 قطع", amount: -p(600), balance: p(38000) },
  ],
  f1: [
    { id: "l8", date: "2026-09-04", label: "استلام 150 قطعة · مصنعية", amount: p(4500), balance: -p(11500) },
    { id: "l9", date: "2026-09-15", label: "دفعتله ← من الدرج", amount: -p(4000), balance: -p(7500) },
    { id: "l10", date: "2026-09-21", label: "استلام 220 قطعة · مصنعية", amount: p(6600), balance: -p(18000) },
  ],
  s1: [
    { id: "l11", date: "2026-09-06", label: "شراء قماش جينز 180 م", amount: p(16200), balance: -p(16200) },
    { id: "l12", date: "2026-09-16", label: "دفعتله ← من انستاباي", amount: -p(16200), balance: 0 },
    { id: "l13", date: "2026-09-23", label: "شراء قماش قطن 200 م", amount: p(20000), balance: -p(20000) },
  ],
};

/* باقي الأطراف: حركات بتتولّد وبتنتهي عند الرصيد بالظبط، عشان مفيش كشف حساب
   فاضي ورصيده مش صفر. بتتشال لما الداتا الحقيقية تيجي من Supabase. */

const addDays = (iso: string, n: number) =>
  new Date(new Date(iso).getTime() + n * 86_400_000).toISOString().slice(0, 10);

/** تقريب لأقرب 100 جنيه — الأرقام تبان طبيعية */
const r100 = (piastres: number) => Math.round(piastres / p(100)) * p(100);

const PRICE = p(120);

/** تواريخ الحركات التلاتة: أول مبلغ مستحق · النص · آخر حركة */
function historyDates(x: Party) {
  const end = x.lastActivity;
  const start = x.oldestDue ?? addDays(end, -24);
  // في النص بين الأول والآخر — ولو نفس اليوم، يبقى نفس اليوم
  const mid = addDays(start, Math.floor((+new Date(end) - +new Date(start)) / 86_400_000 / 2));
  return { start, mid, end };
}

/**
 * العملاء: بيعتين بعدد قطع صحيح × 120 ج، والدفع اللي في النص هو اللي بيظبط
 * الفرق — كده كل بيعة في الكشف ليها فاتورة بسعر نضيف.
 */
function customerSales(x: Party) {
  const owed = x.balance;
  const pieces1 = Math.max(1, Math.round((owed * 0.6) / PRICE));
  const pieces2 = Math.max(1, Math.round((owed * 0.7) / PRICE));
  const first = pieces1 * PRICE;
  const last = pieces2 * PRICE;
  const paid = first + last - owed;
  return { pieces1, pieces2, first, last, paid };
}

function generatedStatement(x: Party): LedgerRow[] {
  const owed = Math.abs(x.balance);
  if (owed === 0) return [];
  const { start, mid, end } = historyDates(x);

  if (x.kind === "customer") {
    const s = customerSales(x);
    return [
      { id: `${x.id}-1`, date: start, label: `بيع ${s.pieces1} قطعة`, amount: s.first, balance: s.first },
      { id: `${x.id}-2`, date: mid, label: "دفع كاش ← الدرج", amount: -s.paid, balance: s.first - s.paid },
      { id: `${x.id}-3`, date: end, label: `بيع ${s.pieces2} قطعة`, amount: s.last, balance: owed },
    ];
  }

  // المصانع وتجار القماش — الرصيد سالب (عليا له)
  const first = r100(owed * 0.6);
  const paid = r100(owed * 0.3);
  const last = owed - first + paid;
  const units = (amount: number, per: number) => Math.max(1, Math.round(amount / p(per)));

  const [inLabel, outLabel, lastLabel] =
    x.kind === "factory"
      ? [`استلام ${units(first, 30)} قطعة · مصنعية`, "دفعتله ← من الدرج", `استلام ${units(last, 30)} قطعة · مصنعية`]
      : [`شراء قماش ${units(first, 100)} م`, "دفعتله ← من انستاباي", `شراء قماش ${units(last, 100)} م`];

  return [
    { id: `${x.id}-1`, date: start, label: inLabel, amount: first, balance: -first },
    { id: `${x.id}-2`, date: mid, label: outLabel, amount: -paid, balance: -(first - paid) },
    { id: `${x.id}-3`, date: end, label: lastLabel, amount: last, balance: -owed },
  ];
}

export const statementOf = (partyId: string): LedgerRow[] => {
  if (statements[partyId]) return statements[partyId];
  const x = byId(partyId);
  return x ? generatedStatement(x) : [];
};

/* ============================== الفواتير ============================== */

export type InvoiceLine = { code: number; qty: number; price: number };

export type Invoice = {
  no: number;
  date: string;
  /** "10:35" — بتفرق لما يدوّر على فاتورة بعينها في يوم زحمة */
  time: string;
  partyId: string;
  lines: InvoiceLine[];
  /** اتدفع كام وقت البيع — مش اللي اتحصّل بعدين (ده في كشف الحساب) */
  paid: number;
  accountId?: string;
};

export const invoiceTotal = (inv: Invoice) =>
  inv.lines.reduce((s, l) => s + l.qty * l.price, 0);

export const invoicePieces = (inv: Invoice) => inv.lines.reduce((s, l) => s + l.qty, 0);

/** نوع الفاتورة وقت البيع: نقدي · جزئي · آجل */
export function invoiceKind(inv: Invoice): "cash" | "partial" | "credit" {
  const total = invoiceTotal(inv);
  if (inv.paid >= total) return "cash";
  if (inv.paid > 0) return "partial";
  return "credit";
}

const MODEL_CODES = [214, 208, 221, 199, 235, 168];

/** بيعة واحدة مقسومة على موديلين، بنفس إجمالي القطع والسعر */
function splitLines(pieces: number, seed: number): InvoiceLine[] {
  const a = MODEL_CODES[seed % MODEL_CODES.length];
  const b = MODEL_CODES[(seed + 2) % MODEL_CODES.length];
  const qa = Math.ceil(pieces * 0.6);
  const qb = pieces - qa;
  return qb > 0
    ? [{ code: a, qty: qa, price: PRICE }, { code: b, qty: qb, price: PRICE }]
    : [{ code: a, qty: qa, price: PRICE }];
}

function buildInvoices(): Invoice[] {
  type Draft = Omit<Invoice, "no" | "time">;
  const drafts: Draft[] = [
    // مطابقة لكشوف الحساب المكتوبة بالإيد
    {
      date: "2026-09-12", partyId: "c1", paid: 0,
      lines: [{ code: 214, qty: 40, price: p(120) }, { code: 208, qty: 20, price: p(120) }],
    },
    {
      date: "2026-09-03", partyId: "c2", paid: 0,
      lines: [{ code: 221, qty: 70, price: p(130) }, { code: 199, qty: 50, price: p(130) }],
    },
  ];

  // باقي العملاء — نفس البيعتين اللي في كشف حسابهم
  parties
    .filter((x) => x.kind === "customer" && !x.isCash && x.balance > 0 && !statements[x.id])
    .forEach((x, i) => {
      const { start, end } = historyDates(x);
      const s = customerSales(x);
      drafts.push({ date: start, partyId: x.id, paid: 0, lines: splitLines(s.pieces1, i) });
      drafts.push({ date: end, partyId: x.id, paid: 0, lines: splitLines(s.pieces2, i + 1) });
    });

  // بيع نقدي — زبون جملة من غير حساب
  const cash = cashParty.id;
  const walkIns: [string, InvoiceLine[], string][] = [
    ["2026-09-23", [{ code: 214, qty: 12, price: p(125) }], "drawer"],
    ["2026-09-22", [{ code: 221, qty: 24, price: p(110) }], "drawer"],
    ["2026-09-20", [{ code: 208, qty: 12, price: p(130) }, { code: 199, qty: 12, price: p(125) }], "vcash"],
    ["2026-09-18", [{ code: 199, qty: 24, price: p(120) }], "drawer"],
    ["2026-09-15", [{ code: 235, qty: 6, price: p(160) }], "instapay"],
    ["2026-09-09", [{ code: 221, qty: 36, price: p(105) }], "drawer"],
  ];
  for (const [date, lines, accountId] of walkIns) {
    const total = lines.reduce((s, l) => s + l.qty * l.price, 0);
    drafts.push({ date, partyId: cash, lines, paid: total, accountId });
  }

  // ترقيم بالترتيب الزمني، وساعة ثابتة لكل فاتورة
  return drafts
    .sort((a, b) => a.date.localeCompare(b.date) || a.partyId.localeCompare(b.partyId))
    .map((d, i) => {
      const minutes = 9 * 60 + ((i * 97) % (10 * 60));
      const time = `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
      return { ...d, no: 1001 + i, time };
    });
}

export const invoices: Invoice[] = buildInvoices();

export const invoiceByNo = (no: number) => invoices.find((x) => x.no === no);

/* ========================== أرقام البيع والربح ========================== */

/** مبيعات آخر 3 شهور لكل موديل — منها بييجي تقرير «أنهي موديل بيكسب» */
export type ModelStat = { code: number; sold: number; revenue: number; cost: number };

export const modelStats: ModelStat[] = [
  { code: 214, sold: 340, revenue: p(40800), cost: p(29920) },
  { code: 208, sold: 180, revenue: p(21600), cost: p(14040) },
  { code: 221, sold: 210, revenue: p(21000), cost: p(15540) },
  { code: 199, sold: 60, revenue: p(7800), cost: p(5280) },
  { code: 235, sold: 25, revenue: p(3750), cost: p(2400) },
  { code: 190, sold: 45, revenue: p(6750), cost: p(5400) },
  { code: 168, sold: 18, revenue: p(1980), cost: p(1584) },
];

export const profitOf = (s: ModelStat) => s.revenue - s.cost;
export const marginOf = (s: ModelStat) =>
  s.revenue === 0 ? 0 : (profitOf(s) / s.revenue) * 100;

/** الراكد — فيه مخزون وآخر بيعة بقالها فترة */
export const staleModels = () =>
  models.filter(isStale).sort((a, b) => valueOf(b) - valueOf(a));

/* ============================ المصاريف ============================ */

/**
 * «سحب شخصي» مش مصروف: بيقلل الخزنة بس **مبيقللش الربح**.
 * ومصروف مربوط بأمر تصنيع بيتضاف على تكلفته، مش بيتحسب مصروف عام.
 */
export type ExpenseCategory = { id: string; label: string; personal?: boolean };

export const expenseCategories: ExpenseCategory[] = [
  { id: "food", label: "أكل وشرب" },
  { id: "transport", label: "مواصلات" },
  { id: "shipping", label: "شحن وتحميل" },
  { id: "wages", label: "يوميات" },
  { id: "bills", label: "كهربا ومياه" },
  { id: "rent", label: "إيجار" },
  { id: "other", label: "حاجات تانية" },
  { id: "personal", label: "سحب شخصي", personal: true },
];

export const categoryById = (id: string) => expenseCategories.find((c) => c.id === id);

export type Expense = {
  id: string;
  date: string;
  categoryId: string;
  amount: number;
  accountId: string;
  note?: string;
  /** لو المصروف تبع أمر تصنيع، بيتضاف على تكلفته */
  orderId?: string;
};

export const expenses: Expense[] = [
  { id: "e1", date: "2026-09-23", categoryId: "food", amount: p(150), accountId: "drawer", note: "فطار" },
  { id: "e2", date: "2026-09-23", categoryId: "shipping", amount: p(400), accountId: "drawer", note: "تحميل بضاعة لأحمد الشوا" },
  { id: "e3", date: "2026-09-23", categoryId: "personal", amount: p(2000), accountId: "drawer", note: "للبيت" },
  { id: "e4", date: "2026-09-22", categoryId: "transport", amount: p(120), accountId: "drawer" },
  { id: "e5", date: "2026-09-22", categoryId: "other", amount: p(350), accountId: "drawer", note: "أزرار", orderId: "o5" },
  { id: "e6", date: "2026-09-21", categoryId: "wages", amount: p(600), accountId: "drawer", note: "يومية شيّال" },
  { id: "e7", date: "2026-09-15", categoryId: "bills", amount: p(850), accountId: "instapay", note: "كهربا المحل" },
  { id: "e8", date: "2026-09-01", categoryId: "rent", amount: p(6000), accountId: "instapay", note: "إيجار سبتمبر" },
];

/* ============================ الإجماليات ============================ */
/* محسوبة من البيانات — مفيش رقم مكتوب بالإيد (الـ spec، قسم 8) */

export const totals = {
  get stockValue() {
    return models.reduce((s, m) => s + valueOf(m), 0);
  },
  get fabricValue() {
    return fabrics.reduce((s, f) => s + f.meters * f.costPerMeter, 0);
  },
  get fabricAtFactoriesValue() {
    return fabricAtFactories.reduce((s, f) => s + f.meters * f.costPerMeter, 0);
  },
  get liquidity() {
    return cashAccounts.reduce((s, a) => s + a.balance, 0);
  },
  get receivable() {
    return ofKind("customer").reduce((s, x) => s + Math.max(0, x.balance), 0);
  },
  get payable() {
    return parties
      .filter((x) => x.kind !== "customer")
      .reduce((s, x) => s + Math.max(0, -x.balance), 0);
  },
  /** صافي موقفي = السيولة + ليا − عليا (فلوس بس، من غير بضاعة) */
  get net() {
    return totals.liquidity + totals.receivable - totals.payable;
  },
};

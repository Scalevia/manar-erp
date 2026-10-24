/**
 * بيانات عرض تجريبية.
 *
 * الأنواع هنا مرآة لجداول Supabase الجاية (الـ spec، قسم 8)، عشان الربط
 * بعدين يبقى تبديل مصدر البيانات مش إعادة كتابة للشاشات.
 *
 * كل المبالغ **بالقروش**. الإجماليات **محسوبة** مش مكتوبة بالإيد — نفس قاعدة
 * الـ spec: مفيش رصيد متخزن.
 */

import { p, daysSince, normalizeArabic } from "./format";

export const TODAY = "2026-09-23";

/* ============================ الأطراف ============================ */

/**
 * person = شخص بينه وبين المحل سلفة (هو سلّف المحل، أو المحل سلّفه)
 * trader = تاجر بيشتري منه بضاعة جاهزة («شراء مخزون»)
 */
export type PartyKind = "customer" | "factory" | "supplier" | "person" | "trader";

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
  /** ميعاد رجوع السلفة — اختياري، ولو قرّب بيظهر تنبيه في الرئيسية */
  dueDate?: string;
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
  { id: "f1", kind: "factory", name: "مصنع النور", phone: "01020304050", balance: -p(18000), lastActivity: "2026-09-23" },
  { id: "f2", kind: "factory", name: "مصنع الأمانة", phone: "01060708090", balance: -p(14500), lastActivity: "2026-09-16" },
  { id: "f3", kind: "factory", name: "مصنع الشروق", phone: "01099887766", balance: -p(9000), lastActivity: "2026-09-12" },

  // تجار القماش — عليا ليهم
  { id: "s1", kind: "supplier", name: "حسن الأقمشة", phone: "01011223344", balance: -p(20000), lastActivity: "2026-09-23" },
  { id: "s2", kind: "supplier", name: "مورد الدلتا", phone: "01233445566", balance: -p(6500), lastActivity: "2026-08-25" },

  // تجار بضاعة جاهزة — عليا ليهم
  { id: "t1", kind: "trader", name: "الحاج محمود للجملة", phone: "01098765432", balance: -p(4500), lastActivity: "2026-09-19" },

  // السلف — سالب: استلفت منه (عليا له) · موجب: سلّفته (ليا عنده)
  { id: "p1", kind: "person", name: "حاج سيد العطار", phone: "01019876543", balance: -p(30000), lastActivity: "2026-09-10", dueDate: "2026-09-30" },
  { id: "p2", kind: "person", name: "محمد الصبي", phone: "01147654321", balance: p(1500), oldestDue: "2026-09-20", lastActivity: "2026-09-20" },
];

export const byId = (id: string) => parties.find((x) => x.id === id);
export const cashParty = parties.find((x) => x.isCash)!;
export const ofKind = (k: PartyKind) => parties.filter((x) => x.kind === k);

/** «ليا»: عملاء عليهم فلوس + ناس سلّفتهم — الأقدم الأول، ده ترتيب «مين متأخر» */
export const receivables = () =>
  parties
    .filter((x) => (x.kind === "customer" || x.kind === "person") && x.balance > 0)
    .sort((a, b) => daysSince(b.oldestDue ?? TODAY) - daysSince(a.oldestDue ?? TODAY));

/** «عليا»: مصانع وتجار (قماش أو بضاعة) ليهم فلوس + ناس استلفت منهم */
export const payables = () =>
  parties
    .filter((x) => x.kind !== "customer" && x.balance < 0)
    .sort((a, b) => a.balance - b.balance);

/** تحصيل ولا دفع؟ — العميل دايماً تحصيل، والسلفة حسب اتجاهها */
export const isCollectFrom = (x: Party) =>
  x.kind === "customer" || (x.kind === "person" && x.balance > 0);

/** السلف اللي ميعادها فات أو جاي خلال أسبوع */
export const loansDueSoon = () =>
  ofKind("person")
    .filter((x) => x.balance !== 0 && x.dueDate && daysSince(TODAY, new Date(x.dueDate)) <= 7)
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!));

/* ============================ الخزن ============================ */

export type CashAccount = { id: string; name: string; short: string; balance: number };

export const cashAccounts: CashAccount[] = [
  { id: "drawer", name: "الدرج", short: "الدرج", balance: p(15000) },
  { id: "instapay", name: "انستاباي", short: "انستاباي", balance: p(40000) },
  { id: "vcash", name: "فودافون كاش", short: "فودافون", balance: p(3200) },
];

/* ============================ الموديلات ============================ */

/**
 * دفعة بضاعة دخلت المخزن — من مصنع (استلام) أو من تاجر (شراء مخزون).
 * نفس الكود ممكن يتكرر بسعرين (الـ spec، قسم 4). من المصنع: سعر القطعة بيكتبه
 * هو وقت الاستلام، وقيمتها بتطلع من فلوس أمر التصنيع (قسم 5). من التاجر: السعر
 * اللي اشترى بيه.
 */
export type Batch = {
  receivedAt: string;
  /** المصنع (استلام) أو التاجر (شراء مخزون) */
  sourceId: string;
  pieces: number;
  unitCost: number;
  /** أمر التصنيع اللي طلعت منه — فاضي للبضاعة اللي كانت موجودة قبل البرنامج */
  jobId?: string;
};

/**
 * الموديل بالكود أو بالاسم أو الاتنين — لازم واحد منهم على الأقل (الـ spec،
 * قسم 4). فيه هدوم من غير كود بيعرفها باسمها بس. كل حاجة بتتربط بالـ id، مش
 * بالكود.
 */
export type Model = {
  id: string;
  code?: number;
  name?: string;
  batches: Batch[];
  lastSale?: string;
  soldThisMonth: number;
};

export const models: Model[] = [
  {
    id: "m214", code: 214, name: "قميص كاروهات",
    // أمر 7: وصل 300 ثم 390 — اتباع 200 من الدفعة الأولى
    batches: [
      { receivedAt: "2026-09-04", sourceId: "f1", pieces: 100, unitCost: p(82), jobId: "j7" },
      { receivedAt: "2026-09-21", sourceId: "f1", pieces: 390, unitCost: p(82), jobId: "j7" },
    ],
    lastSale: "2026-09-20", soldThisMonth: 200,
  },
  { id: "m208", code: 208, name: "بنطلون جينز", batches: [{ receivedAt: "2026-08-20", sourceId: "f2", pieces: 180, unitCost: p(78) }], lastSale: "2026-09-22", soldThisMonth: 140 },
  { id: "m221", code: 221, name: "تيشيرت قطن", batches: [{ receivedAt: "2026-09-12", sourceId: "f3", pieces: 260, unitCost: p(75), jobId: "j8" }], lastSale: "2026-09-21", soldThisMonth: 210 },
  { id: "m199", code: 199, name: "قميص سادة", batches: [{ receivedAt: "2026-07-25", sourceId: "f1", pieces: 150, unitCost: p(88) }], lastSale: "2026-09-18", soldThisMonth: 60 },
  { id: "m235", code: 235, name: "جاكيت خفيف", batches: [{ receivedAt: "2026-09-16", sourceId: "f2", pieces: 95, unitCost: p(100), jobId: "j6" }], lastSale: "2026-09-19", soldThisMonth: 25 },
  { id: "m190", code: 190, name: "جاكيت شتوي", batches: [{ receivedAt: "2026-02-20", sourceId: "f2", pieces: 45, unitCost: p(120) }], lastSale: "2026-06-02", soldThisMonth: 0 },
  { id: "m176", code: 176, name: "بلوزة صيفي", batches: [{ receivedAt: "2026-04-15", sourceId: "f3", pieces: 120, unitCost: p(86.67) }], lastSale: "2026-04-25", soldThisMonth: 0 },
  { id: "m183", code: 183, name: "شورت", batches: [{ receivedAt: "2026-05-10", sourceId: "f3", pieces: 60, unitCost: p(85) }], lastSale: "2026-05-30", soldThisMonth: 0 },
  // شراء مخزون: 100 قطعة جاهزة من الحاج محمود — اتباع منهم 12
  { id: "m240", code: 240, name: "بلوزة شتوي", batches: [{ receivedAt: "2026-09-19", sourceId: "t1", pieces: 88, unitCost: p(95) }], lastSale: "2026-09-22", soldThisMonth: 12 },
  { id: "m168", code: 168, batches: [{ receivedAt: "2026-06-12", sourceId: "f1", pieces: 70, unitCost: p(88) }], lastSale: "2026-09-14", soldThisMonth: 18 },
  // من غير كود — بيعرفها باسمها بس
  { id: "mk1", name: "طقم ولادي", batches: [{ receivedAt: "2026-04-20", sourceId: "f3", pieces: 48, unitCost: p(70) }], lastSale: "2026-09-20", soldThisMonth: 12 },
  { id: "mk2", name: "بيجامة حريمي", batches: [{ receivedAt: "2026-03-15", sourceId: "f2", pieces: 36, unitCost: p(95) }], lastSale: "2026-09-10", soldThisMonth: 6 },
];

export const modelById = (id: string) => models.find((m) => m.id === id);
export const modelByCode = (code: number) => models.find((m) => m.code === code);

/** «214 · قميص كاروهات» · «168» · «طقم ولادي» */
export const modelLabel = (m: Pick<Model, "code" | "name">) =>
  m.code !== undefined && m.name ? `${m.code} · ${m.name}` : m.code !== undefined ? String(m.code) : m.name ?? "";

/**
 * الموديل اللي اتكتب بالظبط: أرقام = كود · حروف = اسم بعد التوحيد
 * («بلوزه» تلاقي «بلوزة»). مفيش = موديل جديد أو غلطة.
 */
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

/** إجمالي القطع في المحل */
export const stockOf = (m: Model) => m.batches.reduce((s, b) => s + b.pieces, 0);

/** قيمة الموديل بالقروش — متقرّبة لأقرب جنيه (تكلفة القطعة بس اللي بتتعرض بكسور) */
export const valueOf = (m: Model) =>
  Math.round(m.batches.reduce((s, b) => s + b.pieces * b.unitCost, 0) / 100) * 100;

/** راكد = آخر بيعة بقالها أكتر من 90 يوم وفيه مخزون */
export const isStale = (m: Model) =>
  stockOf(m) > 0 && (!m.lastSale || daysSince(m.lastSale) > 90);

/** متوسط تكلفة القطعة — للعرض في تفاصيل الموديل */
export const avgCost = (m: Model) => {
  const n = stockOf(m);
  return n === 0 ? 0 : Math.round(valueOf(m) / n);
};

/* ===================== أوامر التصنيع — شنطة فلوس للشغلانة ===================== */

/**
 * الـ spec، قسم 5: كل جنيه بيتصرف على الشغلانة (قماش، مصنعية، سوست، شحن) بيدخل
 * الأمر، وكل استلام بيطلع منه بالعدد × السعر اللي هو كتبه.
 *   الفاضل = اللي اتصرف − قيمة اللي اتستلم — محسوب، مش خانة متخزنة.
 * الاستلام **مبيلمسش حساب المصنع**: المصنعية اتسجلت صرف على الأمر خلاص.
 */
export type CloseMode = "spread" | "factory" | "loss";

export type Job = {
  id: string;
  /** رقم الأمر — من sequence في الداتابيز */
  no: number;
  /**
   * إجباري: الأمر بيتفتح عند مصنع. قماش اتشرى قبل ما يقرر المصنع بيتشال في
   * المحل («القماش اللي عندي»)، ويتبعت للأمر «من عندي» لما يتفتح.
   */
  factoryId: string;
  name?: string;
  openedAt: string;
  closedAt?: string;
  /** الفاضل راح فين عند القفل — فاضي لو الأمر اتقفل على صفر */
  closeMode?: CloseMode;
};

export const jobs: Job[] = [
  { id: "j6", no: 6, factoryId: "f2", name: "235 جاكيت خفيف", openedAt: "2026-08-25", closedAt: "2026-09-17" },
  { id: "j7", no: 7, factoryId: "f1", name: "214 صيف", openedAt: "2026-08-20" },
  { id: "j8", no: 8, factoryId: "f3", name: "221 تيشيرت", openedAt: "2026-09-06", closedAt: "2026-09-13" },
  { id: "j9", no: 9, factoryId: "f1", name: "199 شتوي", openedAt: "2026-09-05" },
];

/** بنود الصرف — صفوف في جدول زي أنواع المصاريف */
export type JobCostItem = { id: string; label: string };

export const jobCostItems: JobCostItem[] = [
  { id: "fabric", label: "قماش" },
  { id: "labor", label: "مصنعية" },
  { id: "trims", label: "سوست وإكسسوار" },
  { id: "shipping", label: "شحن" },
  { id: "other", label: "تاني" },
];

export const costItemById = (id: string) => jobCostItems.find((x) => x.id === id);

/** صرف على أمر — الأمر بيزيد بالمبلغ كله، والطرف ليه اللي مندفعش */
export type JobCost = {
  id: string;
  jobId: string;
  date: string;
  itemId: string;
  /** لمين — اختياري لو مدفوع كله (شحن، يومية تحميل) */
  partyId?: string;
  amount: number;
  paid: number;
  accountId?: string;
  note?: string;
  /** قماش «من عندي» — طالع من القماش اللي في المحل، مش شراية جديدة: الخزنة متتلمسش */
  fromStock?: boolean;
};

export const jobCosts: JobCost[] = [
  // أمر 7 · مصنع النور — نفس المثال اللي في الـ spec
  { id: "jc1", jobId: "j7", date: "2026-08-20", itemId: "fabric", partyId: "s1", amount: p(21000), paid: p(21000), accountId: "drawer", note: "قطن" },
  { id: "jc2", jobId: "j7", date: "2026-08-23", itemId: "fabric", partyId: "s1", amount: p(20000), paid: 0, note: "قطن أبيض" },
  { id: "jc3", jobId: "j7", date: "2026-08-25", itemId: "trims", amount: p(3000), paid: p(3000), accountId: "drawer", note: "سوست وزراير" },
  { id: "jc4", jobId: "j7", date: "2026-09-01", itemId: "labor", partyId: "f1", amount: p(14000), paid: 0 },
  // أمر 6 · مصنع الأمانة — اتقفل على صفر
  { id: "jc5", jobId: "j6", date: "2026-08-25", itemId: "fabric", partyId: "s2", amount: p(6500), paid: 0, note: "كتان" },
  { id: "jc6", jobId: "j6", date: "2026-09-02", itemId: "labor", partyId: "f2", amount: p(14500), paid: 0 },
  // أمر 9 · مصنع النور — لسه موصلش منه حاجة
  { id: "jc7", jobId: "j9", date: "2026-09-05", itemId: "fabric", partyId: "s1", amount: p(15000), paid: p(15000), accountId: "instapay", note: "مولتون" },
  { id: "jc8", jobId: "j9", date: "2026-09-09", itemId: "trims", amount: p(1200), paid: p(1200), accountId: "drawer", note: "زراير" },
  { id: "jc9", jobId: "j9", date: "2026-09-18", itemId: "labor", partyId: "f1", amount: p(8000), paid: 0 },
  { id: "jc12", jobId: "j9", date: "2026-09-22", itemId: "fabric", amount: p(12000), paid: 0, fromStock: true, note: "قطن مصري" },
  // أمر 8 · مصنع الشروق — اتقفل على صفر
  { id: "jc10", jobId: "j8", date: "2026-09-06", itemId: "fabric", partyId: "s1", amount: p(16200), paid: 0, note: "قطن ليكرا" },
  { id: "jc11", jobId: "j8", date: "2026-09-08", itemId: "labor", partyId: "f3", amount: p(9000), paid: 0 },
];

/** استلام من المصنع — كل دفعة لوحدها، والقيمة بتطلع من الأمر */
export type JobReceipt = {
  id: string;
  jobId: string;
  date: string;
  lines: { modelId: string; qty: number; unitCost: number }[];
};

export const jobReceipts: JobReceipt[] = [
  { id: "jr1", jobId: "j7", date: "2026-09-04", lines: [{ modelId: "m214", qty: 300, unitCost: p(82) }] },
  { id: "jr2", jobId: "j7", date: "2026-09-21", lines: [{ modelId: "m214", qty: 390, unitCost: p(82) }] },
  { id: "jr3", jobId: "j6", date: "2026-09-08", lines: [{ modelId: "m235", qty: 120, unitCost: p(100) }] },
  { id: "jr4", jobId: "j6", date: "2026-09-16", lines: [{ modelId: "m235", qty: 90, unitCost: p(100) }] },
  { id: "jr5", jobId: "j8", date: "2026-09-10", lines: [{ modelId: "m221", qty: 256, unitCost: p(75) }] },
  { id: "jr6", jobId: "j8", date: "2026-09-12", lines: [{ modelId: "m221", qty: 80, unitCost: p(75) }] },
];

/* ---------------------- القماش اللي في المحل — بالفلوس بس ---------------------- */

/**
 * قماش اشتراه وشاله عنده (الـ spec، قسم 5): مفيش متر ولا كيلو ولا أنواع —
 * «قماش عندي» رقم واحد بالفلوس. بيزيد بالشراية، وبيقل لما يبعت منه لأمر
 * («صرفت · قماش · من عندي»). القماش اللي بيتشرى للأمر على طول مبيعديش هنا.
 */
export type FabricBuy = {
  id: string;
  date: string;
  supplierId: string;
  amount: number;
  paid: number;
  accountId?: string;
  note?: string;
};

export const fabricBuys: FabricBuy[] = [
  { id: "fb1", date: "2026-09-20", supplierId: "s1", amount: p(30000), paid: p(30000), accountId: "instapay", note: "قطن مصري" },
];

/** القماش اللي طلع من المحل لأوامر */
export const fabricSends = () => jobCosts.filter((c) => c.fromStock);

export const fabricOnHand = () =>
  fabricBuys.reduce((s, b) => s + b.amount, 0) - fabricSends().reduce((s, c) => s + c.amount, 0);

export const jobById = (id: string) => jobs.find((j) => j.id === id);
export const jobTitle = (j: Job) => `أمر ${j.no}`;
export const factoryOf = (j: Job) => byId(j.factoryId)!;
export const isOpen = (j: Job) => !j.closedAt;
export const openJobs = () => jobs.filter(isOpen).sort((a, b) => b.no - a.no);
export const closedJobs = () => jobs.filter((j) => !isOpen(j)).sort((a, b) => b.no - a.no);
export const jobsOfFactory = (factoryId: string) =>
  jobs.filter((j) => j.factoryId === factoryId).sort((a, b) => b.no - a.no);
export const nextJobNo = () => Math.max(...jobs.map((j) => j.no)) + 1;

export const receiptValue = (r: JobReceipt) => r.lines.reduce((s, l) => s + l.qty * l.unitCost, 0);
export const receiptPieces = (r: JobReceipt) => r.lines.reduce((s, l) => s + l.qty, 0);

/** أرقام الأمر كلها محسوبة من الصرف والاستلام */
export function jobSummary(j: Job) {
  const costs = jobCosts.filter((c) => c.jobId === j.id);
  const receipts = jobReceipts.filter((r) => r.jobId === j.id);
  const spent = costs.reduce((s, c) => s + c.amount, 0);
  const receivedValue = receipts.reduce((s, r) => s + receiptValue(r), 0);
  const receivedPieces = receipts.reduce((s, r) => s + receiptPieces(r), 0);
  // القطع اللي لسه في المخزن من الأمر ده — عليها بس بيتوزع الفاضل عند القفل
  const inStock = models
    .flatMap((m) => m.batches)
    .filter((b) => b.jobId === j.id)
    .reduce((s, b) => s + b.pieces, 0);
  const lastReceipt = receipts.map((r) => r.date).sort().pop();
  // البنود متجمعة — «اتصرف عليه إيه»
  const byItem = jobCostItems
    .map((it) => ({ ...it, amount: costs.filter((c) => c.itemId === it.id).reduce((s, c) => s + c.amount, 0) }))
    .filter((x) => x.amount > 0);
  return {
    costs, receipts, spent, receivedValue, receivedPieces, inStock, lastReceipt, byItem,
    remaining: spent - receivedValue,
  };
}

/** أمر مفتوح ومفيش استلام فيه من أكتر من 14 يوم — يمكن نسي يقفله */
export const STALE_JOB_DAYS = 14;
export const staleJobs = () =>
  openJobs().filter((j) => {
    const last = jobSummary(j).lastReceipt ?? j.openedAt;
    return daysSince(last, new Date(TODAY)) > STALE_JOB_DAYS;
  });

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
  // المصانع: المصنعية بس — الاستلام مبيلمسش حسابهم (الـ spec، قسم 5)
  f1: [
    { id: "l8", date: "2026-09-01", label: "مصنعية · أمر 7", amount: p(14000), balance: -p(14000) },
    { id: "l10", date: "2026-09-15", label: "دفعتله ← من الدرج", amount: -p(4000), balance: -p(10000) },
    { id: "l18", date: "2026-09-18", label: "مصنعية · أمر 9", amount: p(8000), balance: -p(18000) },
  ],
  f2: [
    { id: "l20", date: "2026-09-02", label: "مصنعية · أمر 6", amount: p(14500), balance: -p(14500) },
  ],
  f3: [
    { id: "l23", date: "2026-09-08", label: "مصنعية · أمر 8", amount: p(9000), balance: -p(9000) },
  ],
  p1: [
    { id: "l14", date: "2026-09-10", label: "استلفت ← دخلت انستاباي", amount: p(30000), balance: -p(30000) },
  ],
  p2: [
    { id: "l15", date: "2026-09-20", label: "سلّفته ← من الدرج", amount: p(1500), balance: p(1500) },
  ],
  s1: [
    { id: "l26", date: "2026-08-20", label: "قماش · أمر 7 · قطن", amount: p(21000), balance: -p(21000) },
    { id: "l27", date: "2026-08-20", label: "دفعتله ← من الدرج", amount: -p(21000), balance: 0 },
    { id: "l13", date: "2026-08-23", label: "قماش · أمر 7 · قطن أبيض", amount: p(20000), balance: -p(20000) },
    { id: "l29", date: "2026-09-05", label: "قماش · أمر 9 · مولتون", amount: p(15000), balance: -p(35000) },
    { id: "l30", date: "2026-09-05", label: "دفعتله ← من انستاباي", amount: -p(15000), balance: -p(20000) },
    { id: "l11", date: "2026-09-06", label: "قماش · أمر 8 · قطن ليكرا", amount: p(16200), balance: -p(36200) },
    { id: "l12", date: "2026-09-16", label: "دفعتله ← من انستاباي", amount: -p(16200), balance: -p(20000) },
    { id: "l31", date: "2026-09-20", label: "قماش · للمحل · قطن مصري", amount: p(30000), balance: -p(50000) },
    { id: "l32", date: "2026-09-20", label: "دفعتله ← من انستاباي", amount: -p(30000), balance: -p(20000) },
  ],
  s2: [
    { id: "l28", date: "2026-08-25", label: "قماش · أمر 6 · كتان", amount: p(6500), balance: -p(6500) },
  ],
  t1: [
    { id: "l33", date: "2026-09-19", label: "شراء 100 قطعة · موديل 240 × 95", amount: p(9500), balance: -p(9500) },
    { id: "l34", date: "2026-09-19", label: "دفعتله ← من الدرج", amount: -p(5000), balance: -p(4500) },
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

export type InvoiceLine = { modelId: string; qty: number; price: number };

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

const MODEL_IDS = ["m214", "m208", "m221", "m199", "m235", "m168"];

/** بيعة واحدة مقسومة على موديلين، بنفس إجمالي القطع والسعر */
function splitLines(pieces: number, seed: number): InvoiceLine[] {
  const a = MODEL_IDS[seed % MODEL_IDS.length];
  const b = MODEL_IDS[(seed + 2) % MODEL_IDS.length];
  const qa = Math.ceil(pieces * 0.6);
  const qb = pieces - qa;
  return qb > 0
    ? [{ modelId: a, qty: qa, price: PRICE }, { modelId: b, qty: qb, price: PRICE }]
    : [{ modelId: a, qty: qa, price: PRICE }];
}

function buildInvoices(): Invoice[] {
  type Draft = Omit<Invoice, "no" | "time">;
  const drafts: Draft[] = [
    // مطابقة لكشوف الحساب المكتوبة بالإيد
    {
      date: "2026-09-12", partyId: "c1", paid: 0,
      lines: [{ modelId: "m214", qty: 40, price: p(120) }, { modelId: "m208", qty: 20, price: p(120) }],
    },
    {
      date: "2026-09-03", partyId: "c2", paid: 0,
      lines: [{ modelId: "m221", qty: 70, price: p(130) }, { modelId: "m199", qty: 50, price: p(130) }],
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
    ["2026-09-23", [{ modelId: "m214", qty: 12, price: p(125) }], "drawer"],
    ["2026-09-23", [{ modelId: "m221", qty: 24, price: p(110) }], "drawer"],
    ["2026-09-23", [{ modelId: "m199", qty: 12, price: p(125) }, { modelId: "m208", qty: 12, price: p(130) }], "vcash"],
    ["2026-09-22", [{ modelId: "m221", qty: 24, price: p(110) }], "drawer"],
    ["2026-09-20", [{ modelId: "m208", qty: 12, price: p(130) }, { modelId: "m199", qty: 12, price: p(125) }, { modelId: "mk1", qty: 12, price: p(85) }], "vcash"],
    ["2026-09-18", [{ modelId: "m199", qty: 24, price: p(120) }], "drawer"],
    ["2026-09-15", [{ modelId: "m235", qty: 6, price: p(160) }], "instapay"],
    ["2026-09-09", [{ modelId: "m221", qty: 36, price: p(105) }], "drawer"],
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

/* ============================== النهاردة ============================== */

/** ملخص اليوم للرئيسية: بعت كام · مصاريف المحل */
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

/** آخر الحركات — بتطمّنه إن اللي سجّله اتحفظ، ولما ييجي بياعين: مين عمل إيه */
export function recentActivity(limit = 6): Activity[] {
  const items: Activity[] = [
    ...invoices.map((i): Activity => {
      const x = byId(i.partyId);
      return {
        key: `i${i.no}`, date: i.date, time: i.time, kind: "invoice",
        title: x?.isCash ? "بيع نقدي" : `فاتورة · ${x?.name}`,
        sub: `#${i.no}`, amount: invoiceTotal(i), href: `/invoices/${i.no}`,
      };
    }),
    ...parties
      .filter((x) => x.kind === "customer")
      .flatMap((x) =>
        statementOf(x.id)
          .filter((r) => r.label.startsWith("دفع"))
          .map((r): Activity => ({
            key: `p${r.id}`, date: r.date, kind: "payment",
            title: `تحصيل · ${x.name}`, sub: r.label.replace(/^دفع\s*/, "").replace("← ", ""),
            amount: -r.amount, href: `/accounts/${x.id}`,
          })),
      ),
    ...expenses.map((e): Activity => ({
      key: `e${e.id}`, date: e.date, kind: "expense",
      title: categoryById(e.categoryId)?.personal ? "خدته لنفسك" : `مصروف · ${categoryById(e.categoryId)?.label}`,
      sub: e.note ?? "", amount: e.amount, href: "/expenses",
    })),
    ...jobCosts.map((c): Activity => {
      const j = jobById(c.jobId)!;
      return {
        key: `b${c.id}`, date: c.date, kind: "purchase",
        title: `${costItemById(c.itemId)?.label}${c.fromStock ? " من عندي" : ""} · ${jobTitle(j)}`,
        sub: c.partyId ? byId(c.partyId)?.name ?? "" : c.note ?? "",
        amount: c.amount, href: `/jobs/${j.id}`,
      };
    }),
    ...fabricBuys.map((b): Activity => ({
      key: `f${b.id}`, date: b.date, kind: "purchase",
      title: `شراء قماش للمحل · ${byId(b.supplierId)?.name}`, sub: b.note ?? "",
      amount: b.amount, href: "/fabric",
    })),
    ...jobReceipts.map((r): Activity => {
      const j = jobById(r.jobId)!;
      return {
        key: `r${r.id}`, date: r.date, kind: "receive",
        title: `استلام · ${jobTitle(j)}`, sub: `${receiptPieces(r)} قطعة · ${factoryOf(j).name}`,
        amount: receiptValue(r), href: `/jobs/${j.id}`,
      };
    }),
  ];
  return items
    .sort((a, b) => b.date.localeCompare(a.date) || (b.time ?? "").localeCompare(a.time ?? "", undefined, { numeric: true }))
    .slice(0, limit);
}

/* ========================== أرقام البيع والربح ========================== */

/** مبيعات آخر 3 شهور لكل موديل — منها بييجي تقرير «أنهي موديل بيكسب» */
export type ModelStat = { modelId: string; sold: number; revenue: number; cost: number };

export const modelStats: ModelStat[] = [
  { modelId: "m214", sold: 340, revenue: p(40800), cost: p(29920) },
  { modelId: "m208", sold: 180, revenue: p(21600), cost: p(14040) },
  { modelId: "m221", sold: 210, revenue: p(21000), cost: p(15540) },
  { modelId: "m199", sold: 60, revenue: p(7800), cost: p(5280) },
  { modelId: "m235", sold: 25, revenue: p(3750), cost: p(2400) },
  { modelId: "m190", sold: 45, revenue: p(6750), cost: p(5400) },
  { modelId: "m168", sold: 18, revenue: p(1980), cost: p(1584) },
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
};

export const expenses: Expense[] = [
  { id: "e1", date: "2026-09-23", categoryId: "food", amount: p(150), accountId: "drawer", note: "فطار" },
  { id: "e2", date: "2026-09-23", categoryId: "shipping", amount: p(400), accountId: "drawer", note: "تحميل بضاعة لأحمد الشوا" },
  { id: "e3", date: "2026-09-23", categoryId: "personal", amount: p(2000), accountId: "drawer", note: "للبيت" },
  { id: "e4", date: "2026-09-22", categoryId: "transport", amount: p(120), accountId: "drawer" },
  { id: "e5", date: "2026-09-22", categoryId: "other", amount: p(350), accountId: "drawer", note: "أكياس تغليف" },
  { id: "e6", date: "2026-09-21", categoryId: "wages", amount: p(600), accountId: "drawer", note: "يومية شيّال" },
  { id: "e7", date: "2026-09-15", categoryId: "bills", amount: p(850), accountId: "instapay", note: "كهربا المحل" },
  { id: "e8", date: "2026-09-01", categoryId: "rent", amount: p(6000), accountId: "instapay", note: "إيجار سبتمبر" },
];

/* ========================= زيادة رأس المال ========================= */

/** فلوس جاية من بره المحل — مش ربح، ومش سلفة (السلفة فلوس عليه) */
export type CapitalIn = { id: string; date: string; amount: number; accountId: string; note?: string };

export const capitalIns: CapitalIn[] = [
  { id: "k1", date: "2026-09-05", amount: p(20000), accountId: "instapay", note: "من بيع أرض" },
];

/** البرنامج اشتغل من يوم التهيئة — قبله مفيش أرقام نقارن بيها */
export const STARTED = "2026-05-10";

/* ============================ رأس المال ============================ */

/**
 * ليه رأس المال اتغير في فترة:
 *   التغيير = ربح المحل + زيادة رأس المال − اللي خدته لنفسك
 *   ربح المحل = المبيعات − تكلفة البضاعة − مصاريف المحل − المسامحات
 * «آخر شهر» متسق مع شاشة المصاريف (خدته لنفسك 2,000 · زيادة 20,000).
 */
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
  /** أكبر بنود المصاريف — للتفسير */
  topExpenses: { label: string; amount: number }[];
};

export const capitalPeriods: CapitalPeriod[] = [
  {
    id: "1m", label: "آخر شهر", days: 30,
    sales: p(120000), cogs: p(88000), expenses: p(8120), settlements: p(1000),
    added: p(20000), withdrawn: p(2000),
    topExpenses: [
      { label: "إيجار", amount: p(6000) },
      { label: "كهربا ومياه", amount: p(850) },
      { label: "يوميات", amount: p(600) },
    ],
  },
  {
    id: "3m", label: "آخر 3 شهور", days: 91,
    sales: p(360000), cogs: p(263000), expenses: p(24600), settlements: p(3200),
    added: p(20000), withdrawn: p(18000),
    topExpenses: [
      { label: "إيجار", amount: p(18000) },
      { label: "يوميات", amount: p(3100) },
      { label: "كهربا ومياه", amount: p(2400) },
    ],
  },
  {
    id: "1y", label: "آخر سنة", days: 365,
    sales: 0, cogs: 0, expenses: 0, settlements: 0, added: 0, withdrawn: 0,
    topExpenses: [],
  },
];

export const shopProfit = (x: CapitalPeriod) => x.sales - x.cogs - x.expenses - x.settlements;
export const capitalChange = (x: CapitalPeriod) => shopProfit(x) + x.added - x.withdrawn;

/** الفترة متاحة لو البرنامج شغال من قبل بدايتها */
export const periodAvailable = (x: CapitalPeriod) => daysSince(STARTED, new Date(TODAY)) >= x.days;

/* ============================ الإجماليات ============================ */
/* محسوبة من البيانات — مفيش رقم مكتوب بالإيد (الـ spec، قسم 8) */

export const totals = {
  get stockValue() {
    return models.reduce((s, m) => s + valueOf(m), 0);
  },
  get liquidity() {
    return cashAccounts.reduce((s, a) => s + a.balance, 0);
  },
  get receivable() {
    // عملاء + ناس سلّفتهم — الاتنين فلوس ليا هترجع
    return parties
      .filter((x) => x.kind === "customer" || x.kind === "person")
      .reduce((s, x) => s + Math.max(0, x.balance), 0);
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
  /** الفاضل في الأوامر المفتوحة — فلوس اتصرفت على شغل لسه موصلش. مش سيولة. */
  get inJobs() {
    return openJobs().reduce((s, j) => s + jobSummary(j).remaining, 0);
  },
  /** القماش اللي في المحل ولسه مبعتوش لأمر — بالفلوس بس */
  get fabric() {
    return fabricOnHand();
  },
  /**
   * رأس المال = كل اللي يملكه في الشغل: بضاعة + قماش في المحل + فلوس + ليه +
   * فلوس في أوامر التصنيع − عليه. من غير القماش والأوامر، أول ما يشتري قماش
   * رأس المال يبان إنه نزل.
   */
  get capital() {
    return (
      totals.stockValue +
      totals.fabric +
      totals.liquidity +
      totals.receivable +
      totals.inJobs -
      totals.payable
    );
  },
  /** فلوس في السوق عند ناس متأخرين أكتر من 90 يوم — محسوبة في رأس المال ومش مضمونة */
  get overdueReceivable() {
    return ofKind("customer")
      .filter((x) => x.balance > 0 && x.oldestDue && daysSince(x.oldestDue, new Date(TODAY)) > 90)
      .reduce((s, x) => s + x.balance, 0);
  },
};

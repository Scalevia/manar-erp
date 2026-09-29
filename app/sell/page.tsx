"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Banknote,
  Check,
  ChevronLeft,
  Plus,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { Badge, Card, Empty, Money, Num, Page, PageHeader } from "@/components/ui";
import { formatPhone, isEgyptMobile, p } from "@/lib/format";
import {
  cashAccounts,
  cashParty,
  modelByCode,
  ofKind,
  stockOf,
  TODAY,
  type Party,
} from "@/lib/mock";

type Line = { id: number; code: number; qty: number; price: number };

export default function SellPage() {
  const [customer, setCustomer] = useState<Party | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [paid, setPaid] = useState("");
  const [account, setAccount] = useState(cashAccounts[0].id);
  const [done, setDone] = useState(false);

  /** زبون طياري: مفيش حساب، بيدفع كله على طول — السيولة تزيد والبضاعة تقل */
  const walkIn = !!customer?.isCash;

  const total = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const paidP = walkIn ? total : paid.trim() === "" ? 0 : p(Number(paid) || 0);
  const remaining = Math.max(0, total - paidP);

  if (done && customer) {
    return (
      <Saved
        customer={customer}
        total={total}
        paid={paidP}
        accountName={cashAccounts.find((a) => a.id === account)?.name ?? ""}
        onNew={() => {
          setCustomer(null);
          setLines([]);
          setPaid("");
          setAccount(cashAccounts[0].id);
          setDone(false);
        }}
      />
    );
  }

  if (!customer) return <PickCustomer onPick={setCustomer} />;

  return (
    <>
      <PageHeader
        title={walkIn ? "بيع نقدي" : "فاتورة جديدة"}
        sub={walkIn ? "زبون طياري · مفيش حساب" : customer.name}
        action={
          <button
            type="button"
            onClick={() => setCustomer(null)}
            className="press rounded-xl bg-sunken px-3 py-1.5 text-[13px] font-semibold text-ink-soft"
          >
            تغيير
          </button>
        }
      />

      <Page>
        {/* ------------------------ عليه قبل الفاتورة ------------------------ */}
        {!walkIn && (
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-sunken px-4 py-3">
            <span className="text-[13px] text-ink-soft">عليه قبل الفاتورة</span>
            <Money value={customer.balance} className="text-[15px] font-bold text-pos" />
          </div>
        )}

        {/* ------------------------------ السطور ------------------------------ */}
        <Card className="mb-3 overflow-hidden">
          {lines.length === 0 ? (
            <Empty>ابدأ بإضافة موديل</Empty>
          ) : (
            lines.map((l, i) => (
              <div key={l.id}>
                {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="num w-11 shrink-0 text-[16px] font-bold">{l.code}</span>
                  <span className="flex-1 text-[13px] text-ink-mute">
                    <span className="num">×{l.qty}</span>
                    {"  "}
                    <Money value={l.price} /> ج
                  </span>
                  <Money value={l.qty * l.price} className="text-[15px] font-bold" />
                  <button
                    type="button"
                    onClick={() => setLines((v) => v.filter((x) => x.id !== l.id))}
                    aria-label="حذف السطر"
                    className="press -me-1 grid size-8 place-items-center rounded-full text-ink-mute active:bg-sunken"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}

          <div className="border-t border-line">
            <AddLine onAdd={(l) => setLines((v) => [...v, l])} />
          </div>
        </Card>

        {/* ------------------------------ الحساب ------------------------------ */}
        <Card className="mb-4 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[14px] text-ink-soft">الإجمالي</span>
            <Money value={total} className="text-[18px] font-bold" />
          </div>

          <div className="ms-4 border-t border-line-soft" />

          <div className="px-4 py-3">
            {walkIn ? (
              <div className="text-[14px] text-ink-soft">الفلوس هتدخل</div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="text-[14px] text-ink-soft">دفع</span>
                <div className="flex items-center gap-1.5">
                  <input
                    value={paid}
                    onChange={(e) => setPaid(e.target.value.replace(/[^\d.]/g, ""))}
                    inputMode="decimal"
                    placeholder="0"
                    aria-label="المبلغ المدفوع"
                    className="num h-10 w-28 rounded-xl border border-line bg-page px-3 text-end text-[16px] font-semibold outline-none focus:border-brand"
                  />
                  <span className="text-[13px] text-ink-mute">ج</span>
                </div>
              </div>
            )}

            {(walkIn || paidP > 0) && (
              <div className="mt-3 flex gap-2">
                {cashAccounts.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAccount(a.id)}
                    className={`press flex-1 rounded-xl border px-2 py-2 text-[12px] font-semibold ${
                      account === a.id
                        ? "border-brand bg-brand-soft text-brand"
                        : "border-line bg-card text-ink-mute"
                    }`}
                  >
                    {a.short}
                  </button>
                ))}
              </div>
            )}

            {!walkIn && (
              <p className="mt-2.5 text-[11px] leading-relaxed text-ink-mute">
                سيبها فاضية = آجل بالكامل · اكتب الإجمالي = نقدي بالكامل
              </p>
            )}
          </div>

          {!walkIn && (
            <>
              <div className="ms-4 border-t border-line-soft" />

              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[14px] font-semibold">باقي على الفاتورة</span>
                <Money
                  value={remaining}
                  className={`text-[18px] font-bold ${remaining > 0 ? "text-neg" : "text-pos"}`}
                />
              </div>

              <div className="bg-sunken px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-ink-soft">حسابه دلوقتي</span>
                  <Money
                    value={customer.balance + remaining}
                    className="text-[15px] font-bold text-pos"
                  />
                </div>
              </div>
            </>
          )}
        </Card>

        <button
          type="button"
          disabled={lines.length === 0}
          onClick={() => setDone(true)}
          className="press w-full rounded-2xl bg-brand py-4 text-[16px] font-bold text-brand-ink disabled:opacity-35"
        >
          {walkIn ? "حفظ البيعة" : "حفظ الفاتورة"}
        </button>
      </Page>
    </>
  );
}

/* ====================== إضافة سطر — الكيبورد مبيقفلش ====================== */

function AddLine({ onAdd }: { onAdd: (l: Line) => void }) {
  const [code, setCode] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");

  const codeRef = useRef<HTMLInputElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);

  const model = code ? modelByCode(Number(code)) : undefined;
  const ready = !!model && Number(qty) > 0 && Number(price) > 0;

  function submit() {
    if (!ready) return;
    onAdd({
      id: Date.now(),
      code: Number(code),
      qty: Number(qty),
      price: p(Number(price)),
    });
    setCode("");
    setQty("");
    setPrice("");
    codeRef.current?.focus();
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-end gap-2">
        <Field
          ref={codeRef}
          label="موديل"
          value={code}
          onChange={setCode}
          onEnter={() => qtyRef.current?.focus()}
          width="w-20"
          placeholder="214"
        />
        <Field
          ref={qtyRef}
          label="عدد"
          value={qty}
          onChange={setQty}
          onEnter={() => priceRef.current?.focus()}
          width="w-16"
          placeholder="60"
        />
        <Field
          ref={priceRef}
          label="سعر"
          value={price}
          onChange={setPrice}
          onEnter={submit}
          width="flex-1"
          placeholder="120"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!ready}
          aria-label="إضافة السطر"
          className="press grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-brand-ink disabled:opacity-30"
        >
          <Plus size={20} strokeWidth={2.6} />
        </button>
      </div>

      {/* تأكيد بصري إن الكود موجود وفيه مخزون */}
      <div className="mt-2 min-h-[18px] text-[12px]">
        {code && !model && <span className="text-neg">مفيش موديل بالكود ده</span>}
        {model && (
          <span className="text-ink-mute">
            {model.name ? `${model.name} · ` : ""}
            <Num value={stockOf(model)} /> قطعة في المحل
            {Number(qty) > stockOf(model) && (
              <span className="text-warn"> — أكتر من اللي عندك</span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}

function Field({
  ref,
  label,
  value,
  onChange,
  onEnter,
  width,
  placeholder,
}: {
  ref: React.RefObject<HTMLInputElement | null>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter: () => void;
  width: string;
  placeholder: string;
}) {
  return (
    <label className={`${width} block`}>
      <span className="mb-1 block text-[11px] text-ink-mute">{label}</span>
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onEnter();
          }
        }}
        inputMode="decimal"
        enterKeyHint="next"
        placeholder={placeholder}
        className="num h-11 w-full rounded-xl border border-line bg-page px-2.5 text-center text-[16px] font-semibold outline-none placeholder:font-normal placeholder:text-ink-mute/50 focus:border-brand"
      />
    </label>
  );
}

/* ========================== اختيار العميل ========================== */

function PickCustomer({ onPick }: { onPick: (p: Party) => void }) {
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);

  const list = useMemo(() => {
    const all = ofKind("customer")
      .filter((x) => !x.isCash)
      .sort((a, b) => +new Date(b.lastActivity) - +new Date(a.lastActivity));
    const term = q.trim();
    return term ? all.filter((x) => x.name.includes(term)) : all;
  }, [q]);

  if (adding)
    return (
      <NewCustomer
        initialName={/\d/.test(q) ? "" : q.trim()}
        onCancel={() => setAdding(false)}
        onCreate={onPick}
      />
    );

  return (
    <>
      <PageHeader title="بيع" sub="اختار العميل" />
      <Page>
        {/* --------------------------- زبون طياري --------------------------- */}
        <button
          type="button"
          onClick={() => onPick(cashParty)}
          className="press mb-4 flex w-full items-center gap-3 rounded-2xl border border-brand/25 bg-brand-soft px-4 py-3.5 text-start"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-brand-ink">
            <Banknote size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold text-brand">بيع نقدي</span>
            <span className="mt-0.5 block text-[12px] text-ink-soft">
              زبون طياري — بيدفع كله ومفيش حساب
            </span>
          </span>
          <ChevronLeft size={18} className="shrink-0 text-brand" />
        </button>

        {/* --------------------------- عميل جديد --------------------------- */}
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="press mb-4 flex w-full items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3.5 text-start"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sunken text-ink-soft">
            <UserPlus size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold">عميل جديد</span>
            <span className="mt-0.5 block text-[12px] text-ink-mute">
              نفتحله حساب بالاسم ورقم الموبايل
            </span>
          </span>
          <ChevronLeft size={18} className="shrink-0 text-ink-mute" />
        </button>

        <div className="relative mb-4">
          <Search
            size={18}
            className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-ink-mute"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث بالاسم"
            aria-label="ابحث بالاسم"
            enterKeyHint="search"
            className="h-12 w-full rounded-2xl border border-line bg-card ps-11 pe-10 text-[16px] outline-none placeholder:text-ink-mute focus:border-brand"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="مسح"
              className="absolute end-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ink-mute active:bg-sunken"
            >
              <X size={17} />
            </button>
          )}
        </div>

        {!q && (
          <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">
            آخر العملاء
          </div>
        )}

        <Card className="overflow-hidden">
          {list.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <div className="text-[14px] text-ink-mute">مفيش عميل بالاسم ده</div>
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="press mt-3 rounded-xl bg-brand-soft px-4 py-2 text-[13px] font-semibold text-brand"
              >
                ضيف «{q.trim()}» عميل جديد
              </button>
            </div>
          ) : (
            list.map((c, i) => (
              <div key={c.id}>
                {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                <button
                  type="button"
                  onClick={() => onPick(c)}
                  className="press flex w-full items-center gap-3 px-4 py-3.5 text-start active:bg-sunken"
                >
                  <span className="flex-1 truncate text-[15px] font-semibold">
                    {c.name}
                  </span>
                  {c.balance > 0 ? (
                    <span className="text-[13px] text-ink-mute">
                      عليه <Money value={c.balance} className="font-semibold text-pos" />
                    </span>
                  ) : (
                    <Badge tone="neutral">مفيش حساب</Badge>
                  )}
                </button>
              </div>
            ))
          )}
        </Card>

        <p className="mt-3 px-1 text-[12px] leading-relaxed text-ink-mute">
          الرصيد بيبان جنب الاسم قبل ما تختار — تعرف انت داخل على مين.
        </p>
      </Page>
    </>
  );
}

/* ============================ عميل جديد ============================ */

function NewCustomer({
  initialName,
  onCancel,
  onCreate,
}: {
  initialName: string;
  onCancel: () => void;
  onCreate: (p: Party) => void;
}) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState("");

  const cleanName = name.trim().replace(/\s+/g, " ");
  const phoneOk = isEgyptMobile(phone);
  const customers = ofKind("customer").filter((x) => !x.isCash);

  // الرقم هو اللي بيميّز العميل — اسمين زي بعض في السوق عادي، رقمين لأ
  const samePhone = phoneOk ? customers.find((x) => x.phone === phone) : undefined;
  const sameName = customers.find((x) => x.name === cleanName);

  const ready = cleanName.length >= 2 && phoneOk && !samePhone;

  return (
    <>
      <PageHeader
        title="عميل جديد"
        action={
          <button
            type="button"
            onClick={onCancel}
            className="press rounded-xl bg-sunken px-3 py-1.5 text-[13px] font-semibold text-ink-soft"
          >
            رجوع
          </button>
        }
      />
      <Page>
        <Card className="mb-4 space-y-4 px-4 py-4">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">الاسم</span>
            <input
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              enterKeyHint="next"
              placeholder="مثلاً: حسام عبد الله"
              className="h-12 w-full rounded-xl border border-line bg-page px-3 text-[16px] outline-none placeholder:text-ink-mute/60 focus:border-brand"
            />
            {sameName && !samePhone && (
              <p className="mt-1.5 text-[12px] text-warn">
                فيه عميل بنفس الاسم — اتأكد إنه مش هو قبل ما تكمّل.
              </p>
            )}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">رقم الموبايل</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
              inputMode="tel"
              autoComplete="tel"
              enterKeyHint="done"
              placeholder="01xxxxxxxxx"
              className="num h-12 w-full rounded-xl border border-line bg-page px-3 text-start text-[17px] font-semibold tracking-wide outline-none placeholder:font-normal placeholder:text-ink-mute/50 focus:border-brand"
            />
            {phone.length === 11 && !phoneOk && (
              <p className="mt-1.5 text-[12px] text-neg">الرقم لازم يبدأ بـ 010 أو 011 أو 012 أو 015.</p>
            )}
            {phone.length > 0 && phone.length < 11 && (
              <p className="mt-1.5 text-[12px] text-ink-mute">
                <span className="num">{11 - phone.length}</span> أرقام كمان
              </p>
            )}
          </label>
        </Card>

        {samePhone && (
          <Card className="mb-4 px-4 py-3.5">
            <div className="text-[13px] text-warn">
              الرقم ده متسجل باسم <span className="font-bold">{samePhone.name}</span>
            </div>
            <button
              type="button"
              onClick={() => onCreate(samePhone)}
              className="press mt-3 w-full rounded-xl bg-brand-soft py-2.5 text-[14px] font-semibold text-brand"
            >
              بيع لـ {samePhone.name}
            </button>
          </Card>
        )}

        <button
          type="button"
          disabled={!ready}
          onClick={() =>
            onCreate({
              id: `new-${Date.now()}`,
              kind: "customer",
              name: cleanName,
              phone,
              balance: 0,
              lastActivity: TODAY,
            })
          }
          className="press w-full rounded-2xl bg-brand py-4 text-[16px] font-bold text-brand-ink disabled:opacity-35"
        >
          افتح الحساب وكمّل الفاتورة
        </button>

        {phoneOk && (
          <p className="mt-3 px-1 text-center text-[12px] text-ink-mute">
            هيتسجل بـ <span className="num">{formatPhone(phone)}</span> — وتقدر تتصل بيه من كشف حسابه.
          </p>
        )}
      </Page>
    </>
  );
}

/* ============================ بعد الحفظ ============================ */

function Saved({
  customer,
  total,
  paid,
  accountName,
  onNew,
}: {
  customer: Party;
  total: number;
  paid: number;
  accountName: string;
  onNew: () => void;
}) {
  const remaining = Math.max(0, total - paid);

  if (customer.isCash) {
    return (
      <>
        <PageHeader title="اتحفظت" />
        <Page>
          <Card className="px-5 py-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-pos-soft text-pos">
              <Check size={28} strokeWidth={3} />
            </div>
            <div className="mt-4 text-[17px] font-bold">بيع نقدي</div>
            <div className="mt-1 flex items-baseline justify-center gap-1.5">
              <Money value={total} className="text-[30px] font-bold text-pos" />
              <span className="text-[14px] text-ink-mute">ج</span>
            </div>
            <div className="mt-2 text-[13px] text-ink-mute">دخلت {accountName}</div>
          </Card>

          <button
            type="button"
            onClick={onNew}
            className="press mt-4 w-full rounded-2xl bg-brand py-3.5 text-[15px] font-bold text-brand-ink"
          >
            بيعة جديدة
          </button>
        </Page>
      </>
    );
  }

  return (
    <>
      <PageHeader title="اتحفظت" />
      <Page>
        <Card className="px-5 py-8 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-pos-soft text-pos">
            <Check size={28} strokeWidth={3} />
          </div>
          <div className="mt-4 text-[17px] font-bold">{customer.name}</div>
          <div className="mt-1 text-[13px] text-ink-mute">
            فاتورة بـ <Money value={total} /> ج
          </div>

          <div className="mt-5 space-y-2 border-t border-line-soft pt-5 text-[14px]">
            <div className="flex justify-between">
              <span className="text-ink-soft">دفع</span>
              <Money value={paid} className="font-semibold" />
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">باقي على الفاتورة</span>
              <Money value={remaining} className="font-semibold text-neg" />
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">حسابه دلوقتي</span>
              <Money value={customer.balance + remaining} className="font-bold text-pos" />
            </div>
          </div>
        </Card>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onNew}
            className="press rounded-2xl bg-brand py-3.5 text-[15px] font-bold text-brand-ink"
          >
            فاتورة جديدة
          </button>
          {/* العميل الجديد مش متخزن في نسخة العرض، فمالهوش كشف حساب لسه */}
          {customer.id.startsWith("new-") ? (
            <Link
              href="/accounts"
              className="press rounded-2xl border border-line bg-card py-3.5 text-center text-[15px] font-semibold text-ink-soft"
            >
              الحسابات
            </Link>
          ) : (
            <Link
              href={`/accounts/${customer.id}`}
              className="press rounded-2xl border border-line bg-card py-3.5 text-center text-[15px] font-semibold text-ink-soft"
            >
              كشف حسابه
            </Link>
          )}
        </div>
      </Page>
    </>
  );
}

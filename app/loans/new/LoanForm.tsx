"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Info, UserPlus } from "lucide-react";
import { Card, Money, Page, PageHeader } from "@/components/ui";
import { formatPhone, isEgyptMobile, p, shortDate } from "@/lib/format";
import { cashAccounts, ofKind, TODAY, type Party } from "@/lib/mock";

type Dir = "in" | "out";

/**
 * السلف — من غير فايدة.
 * in:  استلفت → الخزنة تزيد، والشخص «ليه عندي» (رصيده سالب)
 * out: سلّفت → الخزنة تقل، والشخص «عليه» (رصيده موجب). مش مصروف لأنها راجعة.
 * الاتنين مبيغيروش رأس المال — الفلوس اتنقلت بس.
 */
export default function LoanForm({ initialDir }: { initialDir: Dir }) {
  const [dir, setDir] = useState<Dir>(initialDir);
  const [person, setPerson] = useState<Party | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState(cashAccounts[0].id);
  const [due, setDue] = useState("");
  const [saved, setSaved] = useState(false);

  const isIn = dir === "in";
  const people = ofKind("person");
  const amountP = p(Number(amount) || 0);
  const account = cashAccounts.find((a) => a.id === accountId)!;

  const cleanName = name.trim().replace(/\s+/g, " ");
  const phoneOk = phone === "" || isEgyptMobile(phone);
  const samePhone = phone && isEgyptMobile(phone) ? people.find((x) => x.phone === phone) : undefined;

  // الطرف اللي هيتسجل عليه: موجود ولا جديد
  const target: Party | null = adding
    ? cleanName.length >= 2 && phoneOk && !samePhone
      ? { id: "new", kind: "person", name: cleanName, phone: phone || undefined, balance: 0, lastActivity: TODAY }
      : null
    : person;

  const before = target?.balance ?? 0;
  const after = before + (isIn ? -amountP : amountP);
  const short = !isIn && amountP > account.balance;
  const ready = !!target && amountP > 0;

  if (saved && target) {
    return (
      <>
        <PageHeader title="اتحفظت" />
        <Page>
          <Card className="px-5 py-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-pos-soft text-pos">
              <Check size={28} strokeWidth={3} />
            </div>
            <div className="mt-4 text-[15px] text-ink-soft">
              {isIn ? `استلفت من ${target.name}` : `سلّفت ${target.name}`}
            </div>
            <div className="mt-1 flex items-baseline justify-center gap-1.5">
              <Money value={amountP} className={`text-[30px] font-bold ${isIn ? "text-pos" : "text-neg"}`} />
              <span className="text-[14px] text-ink-mute">ج</span>
            </div>
            <div className="mt-2 text-[13px] text-ink-mute">
              {isIn ? "دخلت" : "طلعت من"} {account.name}
              {due && (
                <>
                  {" · "}ميعادها <span className="num">{shortDate(due)}</span>
                </>
              )}
            </div>
            <div className="mt-5 border-t border-line-soft pt-4 text-[14px] font-semibold">
              <Balance value={after} />
            </div>
          </Card>
          <Link
            href="/loans"
            className="press mt-4 block rounded-2xl bg-brand py-3.5 text-center text-[15px] font-bold text-brand-ink"
          >
            السلف
          </Link>
        </Page>
      </>
    );
  }

  return (
    <>
      <PageHeader title="سلفة" back="/loans" />
      <Page>
        {/* ------------------------------- الاتجاه ------------------------------- */}
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-2xl bg-sunken p-1">
          {(
            [
              ["in", "استلفت"],
              ["out", "سلّفت حد"],
            ] as [Dir, string][]
          ).map(([d, label]) => (
            <button
              key={d}
              type="button"
              onClick={() => setDir(d)}
              aria-pressed={dir === d}
              className={`press rounded-xl py-2.5 text-[14px] font-bold ${
                dir === d ? "bg-card text-ink shadow-sm" : "text-ink-mute"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mb-4 flex items-start gap-2 rounded-2xl bg-brand-soft px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
          <Info size={15} className="mt-0.5 shrink-0 text-brand" />
          {isIn
            ? "الفلوس دي عليك لحد — مش ربح ومش زيادة رأس مال."
            : "دي مش مصروف — هترجعلك، وهتظهر في «ليا»."}
        </div>

        {/* -------------------------------- مين -------------------------------- */}
        <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">
          {isIn ? "استلفت من مين؟" : "سلّفت مين؟"}
        </div>
        {!adding ? (
          <Card className="mb-4 overflow-hidden">
            {people.map((x, i) => (
              <div key={x.id}>
                {i > 0 && <div className="ms-4 border-t border-line-soft" />}
                <button
                  type="button"
                  onClick={() => setPerson(x)}
                  aria-pressed={person?.id === x.id}
                  className={`press flex w-full items-center gap-3 px-4 py-3 text-start ${
                    person?.id === x.id ? "bg-brand-soft" : "active:bg-sunken"
                  }`}
                >
                  <span className="flex-1 truncate text-[15px] font-semibold">{x.name}</span>
                  <span className="text-[12px] text-ink-mute">
                    <Balance value={x.balance} />
                  </span>
                  {person?.id === x.id && <Check size={17} className="text-brand" />}
                </button>
              </div>
            ))}
            <div className="border-t border-line-soft">
              <button
                type="button"
                onClick={() => {
                  setAdding(true);
                  setPerson(null);
                }}
                className="press flex w-full items-center gap-2 px-4 py-3 text-[14px] font-semibold text-brand active:bg-sunken"
              >
                <UserPlus size={17} />
                شخص جديد
              </button>
            </div>
          </Card>
        ) : (
          <Card className="mb-4 space-y-3 px-4 py-4">
            <input
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              placeholder="الاسم"
              aria-label="الاسم"
              className="h-12 w-full rounded-xl border border-line bg-page px-3 text-[16px] outline-none placeholder:text-ink-mute/60 focus:border-brand"
            />
            <div>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                inputMode="tel"
                placeholder="رقم الموبايل (اختياري)"
                aria-label="رقم الموبايل"
                className="num h-12 w-full rounded-xl border border-line bg-page px-3 text-start text-[16px] outline-none placeholder:text-[14px] placeholder:text-ink-mute/60 focus:border-brand"
              />
              {phone.length === 11 && !isEgyptMobile(phone) && (
                <p className="mt-1.5 text-[12px] text-neg">الرقم لازم يبدأ بـ 010 أو 011 أو 012 أو 015.</p>
              )}
              {samePhone && (
                <p className="mt-1.5 text-[12px] text-warn">
                  الرقم ده متسجل باسم {samePhone.name} ({formatPhone(samePhone.phone!)}).{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAdding(false);
                      setPerson(samePhone);
                    }}
                    className="font-semibold text-brand underline"
                  >
                    اختاره
                  </button>
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="text-[13px] font-semibold text-ink-mute"
            >
              ← رجوع للقايمة
            </button>
          </Card>
        )}

        {/* ------------------------------- المبلغ ------------------------------- */}
        <Card className="mb-4 px-4 py-4">
          <span className="mb-1.5 block text-[13px] font-semibold">المبلغ</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            inputMode="decimal"
            placeholder="0"
            aria-label="المبلغ"
            className="num h-16 w-full rounded-xl border border-line bg-page px-3 text-center text-[28px] font-bold outline-none placeholder:font-normal placeholder:text-ink-mute/40 focus:border-brand"
          />
        </Card>

        {/* ------------------------------- الخزنة ------------------------------- */}
        <div className="mb-2 px-1 text-[13px] font-semibold text-ink-mute">
          {isIn ? "دخلت فين؟" : "طلعت منين؟"}
        </div>
        <div className="mb-2 flex gap-2">
          {cashAccounts.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAccountId(a.id)}
              className={`press flex-1 rounded-xl border px-2 py-2.5 text-center ${
                accountId === a.id ? "border-brand bg-brand-soft text-brand" : "border-line bg-card text-ink-mute"
              }`}
            >
              <div className="text-[12px] font-semibold">{a.short}</div>
              <Money value={a.balance} className="mt-0.5 block text-[11px] opacity-80" />
            </button>
          ))}
        </div>
        {short && (
          <p className="mb-2 px-1 text-[12px] text-warn">
            {account.name} فيه <Money value={account.balance} /> ج بس.
          </p>
        )}

        {/* ------------------------------- الميعاد ------------------------------- */}
        <label className="mb-4 mt-3 block">
          <span className="mb-1.5 block px-1 text-[13px] font-semibold text-ink-mute">
            {isIn ? "هترجعها إمتى؟" : "هترجعلك إمتى؟"} <span className="font-normal">(اختياري)</span>
          </span>
          <input
            type="date"
            value={due}
            min={TODAY}
            onChange={(e) => setDue(e.target.value)}
            aria-label="ميعاد الرجوع"
            className="h-12 w-full rounded-2xl border border-line bg-card px-4 text-[16px] outline-none focus:border-brand"
          />
        </label>

        {/* ----------------------------- اللي هيحصل ----------------------------- */}
        {ready && (
          <Card className="mb-4 overflow-hidden">
            <div className="bg-sunken px-4 py-2 text-[12px] font-semibold text-ink-mute">اللي هيحصل</div>
            <div className="flex items-center justify-between border-t border-line-soft px-4 py-3 text-[14px]">
              <span className="text-ink-soft">{account.name}</span>
              <span>
                <Money value={account.balance} className="text-ink-mute" />
                {"  ←  "}
                <Money
                  value={account.balance + (isIn ? amountP : -amountP)}
                  className={`font-bold ${isIn ? "text-pos" : "text-neg"}`}
                />
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-line-soft px-4 py-3 text-[14px]">
              <span className="text-ink-soft">{target!.name}</span>
              <span className="font-bold">
                <Balance value={after} />
              </span>
            </div>
            <div className="border-t border-line-soft px-4 py-2.5 text-[11px] text-ink-mute">
              رأس مالك مش هيتغير.
            </div>
          </Card>
        )}

        <button
          type="button"
          disabled={!ready}
          onClick={() => setSaved(true)}
          className="press w-full rounded-2xl bg-brand py-4 text-[16px] font-bold text-brand-ink disabled:opacity-35"
        >
          حفظ
        </button>
      </Page>
    </>
  );
}

/** موجب = عليه (ليك عنده) · سالب = ليه عندك · صفر = خالصين */
function Balance({ value }: { value: number }) {
  if (value === 0) return <>خالصين</>;
  return value > 0 ? (
    <>
      عليه <Money value={value} />
    </>
  ) : (
    <>
      ليه عندك <Money value={-value} />
    </>
  );
}

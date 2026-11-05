"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { LogoLockup } from "@/components/Logo";
import { Card } from "@/components/ui";
import { DEMO_LOGIN, signIn, useSession } from "@/lib/auth";

/**
 * مفيش شاشة في البرنامج قبل الدخول — ولا حتى شريط التنقل. اللينك اللي اتفتح
 * (زي كشف حساب) بيكمّل عليه بعد الدخول على طول.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const session = useSession();
  // لسه بنقرا الجلسة — من غير ما شاشة الدخول تومض لحد داخل أصلاً
  if (session === undefined) return null;
  if (!session) return <LoginScreen />;
  return <>{children}</>;
}

/**
 * اسم مستخدم + كلمة سر (الـ spec، قسم 9). مفيش «حساب جديد» — الحسابات بيعملها
 * المالك — ومفيش «نسيت كلمة السر» بلينك، لأن مفيش إيميل حقيقي.
 */
function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const ready = username.trim() !== "" && password !== "" && !busy;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    setBusy(true);
    setFailed(false);
    // لو نجح، البوابة بتفتح لوحدها — الشاشة دي بتختفي
    if (!(await signIn(username, password))) {
      setFailed(true);
      setBusy(false);
    }
  }

  const input =
    "h-12 w-full rounded-xl border bg-page px-3 text-[16px] outline-none focus:border-brand";

  return (
    <div className="flex min-h-dvh flex-col justify-center px-4 pb-safe pt-safe">
      <div className="mx-auto w-full max-w-sm py-8">
        <div className="mb-8 flex justify-center">
          <LogoLockup size={52} />
        </div>

        <h1 className="mb-5 text-center text-[20px] font-bold">تسجيل الدخول</h1>

        <form onSubmit={submit}>
          <Card className="space-y-4 px-4 py-4">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold">اسم المستخدم</span>
              <input
                value={username}
                autoFocus
                onChange={(e) => {
                  setUsername(e.target.value);
                  setFailed(false);
                }}
                name="username"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="next"
                dir="ltr"
                className={`${input} ${failed ? "border-neg" : "border-line"}`}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold">كلمة السر</span>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFailed(false);
                  }}
                  type={show ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  enterKeyHint="go"
                  dir="ltr"
                  className={`${input} pe-12 ${failed ? "border-neg" : "border-line"}`}
                />
                {/* الزرار على يمين الخانة: الخانة LTR جوه صفحة RTL */}
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "خبّي كلمة السر" : "اظهر كلمة السر"}
                  className="press absolute inset-y-0 right-1 my-auto grid size-10 place-items-center rounded-lg text-ink-mute"
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
          </Card>

          {/* رسالة واحدة للاتنين — متقولش أنهي فيهم الغلط */}
          {failed && (
            <p role="alert" className="mt-3 text-center text-[13px] font-semibold text-neg">
              اسم المستخدم أو كلمة السر غلط
            </p>
          )}

          <button
            type="submit"
            disabled={!ready}
            className="press mt-4 w-full rounded-2xl bg-brand py-4 text-[16px] font-bold text-brand-ink disabled:opacity-35"
          >
            {busy ? "بيدخل..." : "دخول"}
          </button>
        </form>

        <p className="mt-4 text-center text-[12px] leading-relaxed text-ink-mute">
          نسيت كلمة السر؟ كلّمنا ونغيّرهالك.
        </p>

        {/* حساب التجربة — بيتشال مع Supabase */}
        <div className="mt-8 rounded-2xl border border-line bg-card px-4 py-3 text-center text-[12px] leading-relaxed text-ink-soft">
          نسخة تجريبية — ادخل باسم المستخدم{" "}
          <span className="num font-bold text-ink">{DEMO_LOGIN.username}</span> وكلمة السر{" "}
          <span className="num font-bold text-ink">{DEMO_LOGIN.password}</span>
        </div>
      </div>
    </div>
  );
}

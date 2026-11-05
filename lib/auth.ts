/**
 * الدخول (الـ spec، قسم 9) — **شكل بس دلوقتي، مش حماية.** حساب تجربة واحد،
 * والجلسة في المتصفح: أي حد يقدر يتخطاها من أدوات المطورين.
 *
 * مع Supabase الملف ده بس اللي بيتغير — الشاشات بتنادي signIn وsignOut وuseSession:
 *   signIn  ← signInWithPassword على `${username}@manar.local` (إيميل داخلي)
 *   الجلسة  ← بتتحفظ متشفّرة بالـ PIN في IndexedDB، مش localStorage
 */

import { useSyncExternalStore } from "react";

const KEY = "manar-erp-session";

/** حساب التجربة — بيظهر على شاشة الدخول، وبيتشال مع Supabase */
export const DEMO_LOGIN = { username: "manar", password: "123456" };

export type Session = { username: string };

// undefined = لسه متقريتش من المتصفح
let session: Session | null | undefined;
const listeners = new Set<() => void>();

function read(): Session | null {
  if (session === undefined) {
    try {
      session = JSON.parse(localStorage.getItem(KEY) ?? "null");
    } catch {
      session = null;
    }
  }
  return session ?? null;
}

function save(s: Session | null) {
  session = s;
  try {
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
  } catch {
    // وضع التصفح الخفي — الجلسة تفضل لحد ما الصفحة تتقفل
  }
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** null = مش داخل · undefined = على السيرفر، لسه مش معروف */
export const useSession = () => useSyncExternalStore(subscribe, read, () => undefined);

/** اسم المستخدم بيتكتب زي ما هو — المسافات والحروف الكبيرة مش فارقة. كلمة السر لأ */
export async function signIn(username: string, password: string): Promise<boolean> {
  const name = username.trim().toLowerCase();
  if (name !== DEMO_LOGIN.username || password !== DEMO_LOGIN.password) return false;
  save({ username: name });
  return true;
}

export function signOut() {
  save(null);
}

"use client";

import { useEffect } from "react";
import { loadStore, useLoaded } from "@/lib/mock";

/**
 * البيانات بتتحفظ في المتصفح — فمفيش شاشة تترسم قبل ما تتحمّل منه، وإلا
 * هتبان البيانات التجريبية الأصلية لحظة وبعدين تتغير.
 */
export default function StoreGate({ children }: { children: React.ReactNode }) {
  const ready = useLoaded();

  useEffect(() => {
    loadStore();
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}

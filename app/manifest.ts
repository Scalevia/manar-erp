import type { MetadataRoute } from "next";

/**
 * بيخلي التطبيق يتثبت على الشاشة الرئيسية زي تطبيق عادي.
 *
 * التثبيت **مش رفاهية** (الـ spec، قسم 9): في تبويب سفاري عادي بيمسح iOS
 * التخزين بعد 7 أيام من عدم الاستخدام، ولما يبقى متثبت بيبقى مستثنى.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Manar ERP",
    short_name: "Manar ERP",
    description: "بيع · مخزون · حسابات · أوامر تصنيع",
    lang: "ar",
    dir: "rtl",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f4f1",
    theme_color: "#f6f4f1",
    // اللوجو: «م» بإبرة وخيط — عنابي وبيج (المصدر: public/brand/manar-mark.svg)
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

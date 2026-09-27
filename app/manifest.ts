import type { MetadataRoute } from "next";

/**
 * بيخلي التطبيق يتثبت على الشاشة الرئيسية زي تطبيق عادي.
 *
 * التثبيت **مش رفاهية** (الـ spec، قسم 9): في تبويب سفاري عادي بيمسح iOS
 * التخزين بعد 7 أيام من عدم الاستخدام، ولما يبقى متثبت بيبقى مستثنى.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "منار — إدارة محل جملة ملابس",
    short_name: "منار",
    description: "بيع · مخزون · حسابات · أوامر تصنيع",
    lang: "ar",
    dir: "rtl",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f4f1",
    theme_color: "#f6f4f1",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}

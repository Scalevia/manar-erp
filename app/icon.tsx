import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * حرف لاتيني مقصود: ImageResponse مبيرسمش عربي من غير ملف خط مرفوع مع الريبو،
 * وخطوط النظام مش موجودة على سيرفرات البناء.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d7068",
          color: "#ffffff",
          fontSize: 22,
          fontWeight: 700,
        }}
      >
        M
      </div>
    ),
    size,
  );
}

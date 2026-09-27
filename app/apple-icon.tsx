import { ImageResponse } from "next/og";

/** المقاس اللي بيستعمله iOS لأيقونة الشاشة الرئيسية */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // iOS بيقص الحواف بنفسه، فالخلفية سادة بتملا الكادر
          background: "#0d7068",
          color: "#ffffff",
          fontSize: 104,
          fontWeight: 700,
          letterSpacing: -2,
        }}
      >
        M
      </div>
    ),
    size,
  );
}

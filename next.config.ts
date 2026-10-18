import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";

/**
 * التجربة على الآيفون في نفس الواي فاي (http://<عنوان الجهاز>:3000):
 * Next 16 بيمنع ملفات التطوير لأي عنوان غير localhost، فالصفحة بتظهر بس
 * الزراير متشتغلش. بنسمح بعناوين الجهاز نفسه على الشبكة — بتتحسب وقت تشغيل
 * السيرفر، فلو الراوتر غيّر العنوان، إعادة التشغيل بتظبطه.
 */
const lanAddresses = Object.values(networkInterfaces())
  .flat()
  .filter((a) => a !== undefined && a.family === "IPv4" && !a.internal)
  .map((a) => a!.address);

const nextConfig: NextConfig = {
  allowedDevOrigins: lanAddresses,
};

export default nextConfig;

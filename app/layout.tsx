import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const arabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "مكتب منار",
  description: "إدارة محل جملة ملابس",
  applicationName: "مكتب منار",
  appleWebApp: {
    capable: true,
    title: "مكتب منار",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // بيخلي الصفحة توصل لحواف الشاشة تحت الـ Dynamic Island
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f4f1" },
    { media: "(prefers-color-scheme: dark)", color: "#100f0e" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${arabic.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/* إضافات المتصفح (زي Grammarly) بتحقن خصائص في الـ body قبل React */}
      <body className="min-h-full bg-page text-ink" suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

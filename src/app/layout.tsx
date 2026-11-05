import type { Metadata } from "next";
import { Fredoka, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });
const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"], weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: {
    default: "LMS Bilingual 2028 · SMPIT Al Madany Parung Panjang",
    template: "%s · LMS Bilingual 2028",
  },
  description:
    "Learning Management System Program Akselerasi Bilingual 2028 SMPIT Al Madany Parung Panjang: monitoring Duta Inggris, ELITE English Habit, dan perkembangan siswa.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${jakarta.variable} ${fredoka.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full">
        {children}
      </body>
    </html>
  );
}

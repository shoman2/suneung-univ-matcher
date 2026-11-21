import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "수능 정시 대학 추천 플랫폼 | 수능핏(SuneungFit)",
  description:
    "수능 영역별 표준점수·백분위·등급을 입력하면 대학별 환산점수와 가·나·다군 지원 가능 대학(안정·적정·소신·상향)을 즉시 분석해 주는 정시 입시 추천 플랫폼",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}

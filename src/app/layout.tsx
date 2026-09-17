import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PBA 7-Layer Business Radar",
  description: "5분이면 현재 사업의 구조적 병목을 확인할 수 있습니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

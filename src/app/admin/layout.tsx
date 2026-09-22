import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "PBA ADMIN",
};

// The admin is operator-facing and stays Korean whatever the visitor's
// browser asks for.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}

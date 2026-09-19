"use client";

import { usePathname } from "next/navigation";

// The admin panel has its own shell; the public header/footer stay out of it.
export function PublicOnly({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return pathname.startsWith("/admin") ? null : <>{children}</>;
}

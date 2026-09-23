import { NotFoundContent } from "@/components/site/NotFoundContent";

// Covers a `notFound()` call thrown by a page inside the (site) group that
// has no more specific not-found.tsx of its own. It does NOT cover a
// mistyped/stale URL that matches no route at all -- that case needs
// src/app/global-not-found.tsx (see NotFoundContent.tsx for why).
export default function NotFound() {
  return <NotFoundContent />;
}

import { redirect } from "next/navigation";
import { getCurrentOperator, type CurrentOperator } from "./get-current-operator";

// Defence in depth for admin pages. src/middleware.ts already blocks an
// unauthenticated request before it reaches a render, but a layout-level
// redirect alone does not: Next renders sibling pages in parallel, so their
// data ends up in the response body even when the layout redirects. Every
// admin page that reads data calls this BEFORE fetching anything.
export async function requireOperator(): Promise<CurrentOperator> {
  const operator = await getCurrentOperator();

  if (!operator) {
    redirect("/admin/login");
  }

  return operator;
}

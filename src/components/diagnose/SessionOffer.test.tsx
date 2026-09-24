import { Fragment, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SessionOffer } from "./SessionOffer";
import ko from "@/i18n/messages/ko";

// next/link needs Next's router context, which doesn't exist under plain
// Vitest; the offer only cares that the CTA points at the consult page, so
// render it as the anchor Link would produce.
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// Minimal `t` / `t.rich` over the real `ko` messages, for the same reason
// ResultReport.test.tsx stubs them: next-intl's server and client APIs can't
// resolve request-scoped config outside Next's runtime. `rich` understands
// only the single-level `<b>...</b>` markup the offer copy uses.
function makeTranslator(namespace: string) {
  const messages = ko as unknown as Record<string, unknown>;
  const resolve = (key: string): unknown =>
    `${namespace}.${key}`
      .split(".")
      .reduce<unknown>(
        (acc, part) =>
          acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined,
        messages
      );

  function t(key: string): string {
    const value = resolve(key);
    if (typeof value !== "string") {
      throw new Error(`Test stub: missing string message "${namespace}.${key}"`);
    }
    return value;
  }

  t.rich = (key: string, tags: Record<string, (chunks: ReactNode) => ReactNode>): ReactNode => {
    const value = t(key);
    const parts: ReactNode[] = [];
    const pattern = /<(\w+)>([\s\S]*?)<\/\1>/g;
    let cursor = 0;
    let match: RegExpExecArray | null;
    let index = 0;
    while ((match = pattern.exec(value)) !== null) {
      if (match.index > cursor) parts.push(value.slice(cursor, match.index));
      const render = tags[match[1]];
      if (!render) throw new Error(`Test stub: unhandled tag <${match[1]}> in ${key}`);
      parts.push(<Fragment key={index++}>{render(match[2])}</Fragment>);
      cursor = match.index + match[0].length;
    }
    if (cursor < value.length) parts.push(value.slice(cursor));
    return parts;
  };

  return t;
}

vi.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => makeTranslator(namespace),
}));

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => makeTranslator(namespace),
}));

const assessmentId = "8f9fef0b-7a8d-4336-9d06-b7de6c881e3d";

async function renderSessionOffer() {
  return renderToStaticMarkup(await SessionOffer({ assessmentId }));
}

describe("SessionOffer", () => {
  it("states the price and the format before the visitor reaches the form", async () => {
    const html = await renderSessionOffer();

    expect(html).toContain(ko.result.sessionOffer.priceLine);
    expect(html).toContain("VAT");
    expect(html).toContain(ko.result.sessionOffer.format);
  });

  it("keeps the CTA pointing at the consult page", async () => {
    const html = await renderSessionOffer();

    expect(html).toContain(`href="/diagnose/result/${assessmentId}/consult"`);
    expect(html).toContain(ko.result.sessionOffer.cta);
  });

  // The PDF is a leave-behind that gets forwarded inside a company, so the
  // price has to travel with it. The rest of the result page's footer chrome
  // is `print:hidden`; this block must never pick that class up.
  it("stays in the printed result (no print:hidden anywhere in the block)", async () => {
    const html = await renderSessionOffer();

    expect(html).not.toContain("print:hidden");
  });
});

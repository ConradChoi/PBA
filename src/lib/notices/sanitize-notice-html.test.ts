import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sanitizeNoticeHtml } from "./sanitize-notice-html";

const SUPABASE_URL = "https://project.supabase.co";
const STORAGE_IMG = `${SUPABASE_URL}/storage/v1/object/public/notice-images/a.png`;

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", SUPABASE_URL);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("sanitizeNoticeHtml", () => {
  it("keeps the formatting tags the editor produces", () => {
    const html =
      "<h2>제목</h2><p><strong>굵게</strong> <em>기울임</em></p><ul><li>항목</li></ul><blockquote>인용</blockquote>";

    expect(sanitizeNoticeHtml(html)).toBe(html);
  });

  it("removes script tags and their contents", () => {
    expect(sanitizeNoticeHtml("<p>안녕</p><script>alert(1)</script>")).toBe("<p>안녕</p>");
  });

  it("removes event handler attributes", () => {
    expect(sanitizeNoticeHtml('<p onclick="alert(1)">안녕</p>')).toBe("<p>안녕</p>");
  });

  it("drops javascript: and data: links but keeps http(s) and mailto", () => {
    expect(sanitizeNoticeHtml('<a href="javascript:alert(1)">x</a>')).not.toContain("javascript:");
    expect(sanitizeNoticeHtml('<a href="data:text/html,x">x</a>')).not.toContain("data:");
    expect(sanitizeNoticeHtml('<a href="https://ylia.io">x</a>')).toContain('href="https://ylia.io"');
    expect(sanitizeNoticeHtml('<a href="mailto:info@ylia.io">x</a>')).toContain("mailto:info@ylia.io");
  });

  it("opens links in a new tab without leaking the opener", () => {
    const result = sanitizeNoticeHtml('<a href="https://ylia.io">x</a>');

    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noopener noreferrer"');
  });

  it("keeps images from our storage bucket and drops every other image", () => {
    expect(sanitizeNoticeHtml(`<img src="${STORAGE_IMG}" alt="설명" />`)).toContain(STORAGE_IMG);
    expect(sanitizeNoticeHtml('<img src="https://evil.example.com/pixel.gif" />')).toBe("");
    expect(sanitizeNoticeHtml('<img src="/local.png" />')).toBe("");
  });

  it("strips attributes we never allow", () => {
    expect(sanitizeNoticeHtml('<p class="x" style="color:red" id="y">안녕</p>')).toBe("<p>안녕</p>");
  });
});

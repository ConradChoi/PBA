// @vitest-environment jsdom
//
// NoticeBannerDismiss renders its own dismiss button and used to hardcode
// the aria-label in Korean, so every locale announced "공지 닫기" to a
// screen reader. The label must come from the caller (which sources it from
// `common.noticeClose` in the message files) instead of being baked in here.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { NoticeBannerDismiss } from "./NoticeBannerDismiss";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("NoticeBannerDismiss", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  function button() {
    return container.querySelector("button") as HTMLButtonElement;
  }

  it("uses the caller-supplied dismiss label instead of a hardcoded string", () => {
    act(() => {
      root.render(
        <NoticeBannerDismiss noticeId="n1" dismissLabel="Close notice">
          <span>notice</span>
        </NoticeBannerDismiss>
      );
    });

    expect(button().getAttribute("aria-label")).toBe("Close notice");
  });

  it("renders whatever locale label it is given, not a fixed Korean string", () => {
    act(() => {
      root.render(
        <NoticeBannerDismiss noticeId="n1" dismissLabel="お知らせを閉じる">
          <span>notice</span>
        </NoticeBannerDismiss>
      );
    });

    expect(button().getAttribute("aria-label")).toBe("お知らせを閉じる");
    expect(button().getAttribute("aria-label")).not.toBe("공지 닫기");
  });
});

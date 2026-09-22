// @vitest-environment jsdom
//
// This is the one file in the suite that needs a DOM: the outside-click and
// keyboard behaviour below can't be pinned against `renderToStaticMarkup`
// (see ResultReport.test.tsx for that approach). The per-file docblock
// keeps every other test on the fast `node` environment set in
// vitest.config.ts.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Dropdown, type DropdownItem } from "./Dropdown";

// React's act() only suppresses its "not wrapped in act" warnings when it
// knows it's in a test environment; there's no test-runner integration
// (like @testing-library's) auto-setting this here, so it's set by hand.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("Dropdown", () => {
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

  function renderDropdown(onSelect: (key: string) => void, selectedKey = "ko") {
    const keys = ["ko", "en", "ja"] as const;
    const labels: Record<(typeof keys)[number], string> = {
      ko: "한국어",
      en: "English",
      ja: "日本語",
    };
    const items: DropdownItem[] = keys.map((key) => ({
      key,
      label: labels[key],
      selected: key === selectedKey,
      onSelect: () => onSelect(key),
    }));

    act(() => {
      root.render(<Dropdown ariaLabel="언어" label={`🌐 ${labels[selectedKey as (typeof keys)[number]]}`} items={items} />);
    });
  }

  function trigger() {
    return container.querySelector("button") as HTMLButtonElement;
  }

  function listbox() {
    return container.querySelector('[role="listbox"]');
  }

  function options() {
    return Array.from(container.querySelectorAll('[role="option"]')) as HTMLLIElement[];
  }

  function click(element: Element) {
    act(() => {
      element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  }

  function keydown(element: Element | Document, key: string) {
    act(() => {
      element.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
    });
  }

  it("renders closed with listbox aria wiring on the trigger", () => {
    renderDropdown(() => {});

    expect(trigger().getAttribute("aria-haspopup")).toBe("listbox");
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(listbox()).toBeNull();
  });

  it("opens on click, lists every option, and marks the selected one", () => {
    renderDropdown(() => {}, "en");

    click(trigger());

    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(listbox()).not.toBeNull();
    const opts = options();
    expect(opts).toHaveLength(3);

    const selected = opts.find((option) => option.getAttribute("aria-selected") === "true");
    expect(selected?.textContent).toContain("English");
    expect(selected?.textContent).toContain("✓");
    const unselected = opts.filter((option) => option !== selected);
    expect(unselected.every((option) => option.getAttribute("aria-selected") === "false")).toBe(
      true
    );
  });

  it("picks an item on click, calls onSelect, closes, and refocuses the trigger", () => {
    const onSelect = vi.fn();
    renderDropdown(onSelect);
    click(trigger());

    const enOption = options().find((option) => option.textContent?.includes("English"))!;
    click(enOption);

    expect(onSelect).toHaveBeenCalledWith("en");
    expect(listbox()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it("closes on Escape and returns focus to the trigger", () => {
    renderDropdown(() => {});
    click(trigger());
    expect(listbox()).not.toBeNull();

    keydown(document, "Escape");

    expect(listbox()).toBeNull();
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger());
  });

  it("closes on an outside click", () => {
    renderDropdown(() => {});
    click(trigger());
    expect(listbox()).not.toBeNull();

    act(() => {
      document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });

    expect(listbox()).toBeNull();
  });

  it("does not close on a click inside the panel that isn't an option", () => {
    renderDropdown(() => {});
    click(trigger());
    expect(listbox()).not.toBeNull();

    act(() => {
      listbox()!.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });

    expect(listbox()).not.toBeNull();
  });

  it("moves focus with ArrowDown/ArrowUp and selects the focused item with Enter", () => {
    const onSelect = vi.fn();
    renderDropdown(onSelect, "ko");
    click(trigger());

    // Opening focuses the already-selected item first (ko, index 0).
    const opts = options();
    expect(document.activeElement).toBe(opts[0]);

    keydown(opts[0], "ArrowDown");
    expect(document.activeElement).toBe(opts[1]);

    keydown(opts[1], "ArrowDown");
    expect(document.activeElement).toBe(opts[2]);

    keydown(opts[2], "ArrowUp");
    expect(document.activeElement).toBe(opts[1]);

    keydown(opts[1], "Enter");
    expect(onSelect).toHaveBeenCalledWith("en");
    expect(listbox()).toBeNull();
  });

  it("wraps ArrowDown from the last item back to the first", () => {
    renderDropdown(() => {}, "ja");
    click(trigger());

    const opts = options();
    expect(document.activeElement).toBe(opts[2]);

    keydown(opts[2], "ArrowDown");
    expect(document.activeElement).toBe(opts[0]);
  });
});

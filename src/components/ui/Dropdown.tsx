"use client";

import { useEffect, useRef, useState } from "react";

// A reusable trigger + listbox pattern. It exists so nothing in this
// product ever falls back to a native <select> or an OS-rendered popup:
// the panel is plain DOM, anchored directly under its trigger with
// `absolute ... top-full`, and it looks identical on every platform.
export type DropdownItem = {
  key: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
};

export function Dropdown({
  label,
  ariaLabel,
  items,
}: {
  label: React.ReactNode;
  ariaLabel: string;
  items: DropdownItem[];
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  function close({ refocusTrigger = true }: { refocusTrigger?: boolean } = {}) {
    setOpen(false);
    setActiveIndex(-1);
    if (refocusTrigger) {
      // Keyboard and screen-reader users land back where they started
      // instead of losing their place when the panel disappears. This is
      // for explicit dismissals (Escape, outside click, picking an item) --
      // a Tab-out should land wherever the user tabbed to instead.
      triggerRef.current?.focus();
    }
  }

  function openMenu() {
    setOpen(true);
    const selectedIndex = items.findIndex((item) => item.selected);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }

  // Outside click closes the panel. `mousedown` (not `click`) so it fires
  // before a click elsewhere could do anything else.
  useEffect(() => {
    if (!open) return;

    function handleMouseDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        close();
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Escape closes the panel regardless of whether focus is on the trigger
  // or on one of the items.
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Move focus onto the active item whenever it changes while open.
  useEffect(() => {
    if (open && activeIndex >= 0) {
      itemRefs.current[activeIndex]?.focus();
    }
  }, [open, activeIndex]);

  function handleTriggerClick() {
    if (open) {
      close();
    } else {
      openMenu();
    }
  }

  function handleBlur(event: React.FocusEvent<HTMLDivElement>) {
    if (!open) return;

    // `relatedTarget` is the element gaining focus. Arrow-key navigation
    // moves focus between options inside this same wrapper and must not
    // close the panel; a Tab (or click, elsewhere) moves it outside the
    // wrapper -- or `relatedTarget` is null, e.g. the browser chrome takes
    // focus -- and that should close it. Not refocusing the trigger here
    // lets a keyboard user's Tab actually land where they tabbed to.
    const nextFocused = event.relatedTarget as Node | null;
    if (!nextFocused || !containerRef.current?.contains(nextFocused)) {
      close({ refocusTrigger: false });
    }
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openMenu();
      }
    }
  }

  function handleItemKeyDown(event: React.KeyboardEvent<HTMLLIElement>, index: number) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index + 1) % items.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index - 1 + items.length) % items.length);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      items[index].onSelect();
      close();
    }
  }

  return (
    <div ref={containerRef} className="relative" onBlur={handleBlur}>
      <button
        type="button"
        ref={triggerRef}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      >
        {label}
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className="absolute right-0 top-full z-40 mt-1 min-w-max rounded-md border border-slate-200 bg-white py-1 shadow-lg"
        >
          {items.map((item, index) => (
            <li
              key={item.key}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              role="option"
              aria-selected={item.selected}
              tabIndex={-1}
              onClick={() => {
                item.onSelect();
                close();
              }}
              onKeyDown={(event) => handleItemKeyDown(event, index)}
              className={`flex cursor-pointer items-center gap-2 px-4 py-2 text-sm outline-none ${
                item.selected
                  ? "bg-slate-100 font-semibold text-slate-900"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="w-4 shrink-0 text-indigo-600" aria-hidden="true">
                {item.selected ? "✓" : ""}
              </span>
              {item.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

"use client";

// Single-choice chips backed by real radio inputs, so keyboard (Tab/arrow
// keys) and screen readers work, and it looks the same on every OS — unlike
// a native <select>.
export function ChipGroup<T extends string>({
  name,
  label,
  options,
  value,
  onChange,
  size = "md",
}: {
  name: string;
  label: string;
  options: { value: T; label: string }[];
  value: T | "";
  onChange: (value: T) => void;
  size?: "sm" | "md";
}) {
  const chipSize = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm";

  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => (
        <label key={option.value} className="cursor-pointer">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="peer sr-only"
          />
          <span
            className={`block rounded-full border border-slate-200 bg-white font-medium text-slate-700 transition ${chipSize} hover:border-slate-400 peer-checked:border-slate-900 peer-checked:bg-slate-900 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-2`}
          >
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}

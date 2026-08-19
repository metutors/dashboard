"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectFilterDropdownProps {
  label: string;
  icon: LucideIcon;
  placeholder: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
  className?: string;
  selectedCountLabel?: string;
}

function formatSelectedLabel(
  selected: string[],
  options: MultiSelectOption[],
  placeholder: string,
  itemLabel = "selected",
): string {
  if (selected.length === 0) return placeholder;
  if (selected.length === 1) {
    return options.find((option) => option.value === selected[0])?.label ?? placeholder;
  }
  if (selected.length === 2) {
    const labels = selected
      .map((value) => options.find((option) => option.value === value)?.label)
      .filter(Boolean);
    return labels.join(", ");
  }
  return `${selected.length} ${itemLabel}`;
}

export function MultiSelectFilterDropdown({
  label,
  icon: Icon,
  placeholder,
  options,
  selected,
  onChange,
  disabled,
  className,
  selectedCountLabel = "selected",
}: MultiSelectFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const selectedSet = new Set(selected);
  const displayLabel = formatSelectedLabel(
    selected,
    options,
    placeholder,
    selectedCountLabel,
  );

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  function toggleValue(value: string) {
    if (selectedSet.has(value)) {
      onChange(selected.filter((item) => item !== value));
      return;
    }
    onChange([...selected, value]);
  }

  function clearAll() {
    onChange([]);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  }

  return (
    <div
      className={className ?? "min-w-0 flex-1 overflow-visible"}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-brand">
        {label}
      </p>
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          aria-label={label}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-3 text-left text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <span className="min-w-0 flex-1 truncate">{displayLabel}</span>
          <span
            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
              selected.length > 0
                ? "bg-brand-light text-brand-dark"
                : "invisible"
            }`}
            aria-hidden={selected.length === 0}
          >
            {selected.length || 0}
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </button>

        {open ? (
          <div
            id={listId}
            role="listbox"
            aria-label={label}
            aria-multiselectable="true"
            className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl"
          >
            <div className="max-h-72 overflow-y-auto py-1">
              {options.map((option) => {
                const isSelected = selectedSet.has(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggleValue(option.value)}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm outline-none transition ${
                      isSelected
                        ? "bg-brand-light text-brand-dark"
                        : "text-slate-700 hover:bg-slate-50 focus:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        isSelected
                          ? "border-brand bg-brand text-white"
                          : "border-slate-300 bg-white"
                      }`}
                      aria-hidden
                    >
                      {isSelected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2">
              <span className="text-[10px] font-medium text-slate-400">
                Select one or more
              </span>
              <button
                type="button"
                onClick={clearAll}
                disabled={selected.length === 0}
                className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand transition hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

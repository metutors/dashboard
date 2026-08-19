"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type FilterDropdownItem =
  | { kind: "heading"; id: string; label: string }
  | {
      kind: "option";
      value: string;
      label: string;
      /** Bold main rows, e.g. a main module that is selectable on its own. */
      bold?: boolean;
      /** Indented child rows, e.g. sub modules. */
      indent?: boolean;
    };

interface FilterDropdownProps {
  label: string;
  icon: LucideIcon;
  placeholder: string;
  value: string;
  selectedLabel: string | null;
  items: FilterDropdownItem[];
  onSelect: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function FilterDropdown({
  label,
  icon: Icon,
  placeholder,
  value,
  selectedLabel,
  items,
  onSelect,
  disabled,
  className,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();

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

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>('[data-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [open]);

  function moveFocus(direction: 1 | -1) {
    const options = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>("[data-option]") ??
        [],
    );
    if (options.length === 0) return;

    const current = options.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    const next =
      current === -1
        ? 0
        : (current + direction + options.length) % options.length;
    options[next].focus();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      moveFocus(event.key === "ArrowDown" ? 1 : -1);
    }
  }

  return (
    <div
      className={className ?? "min-w-0 flex-1"}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-violet-600">
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
          className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-3 text-left text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <span className="min-w-0 flex-1 truncate">
            {selectedLabel ?? placeholder}
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
            ref={listRef}
            role="listbox"
            aria-label={label}
            className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-xl"
          >
            {items.map((item, index) => {
              if (item.kind === "heading") {
                return (
                  <p
                    key={`heading-${item.id}`}
                    className={`px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 ${
                      index === 0 ? "pt-1" : "mt-1 border-t border-slate-100 pt-2"
                    }`}
                  >
                    {item.label}
                  </p>
                );
              }

              const selected = item.value === value;

              return (
                <button
                  key={item.value || "all"}
                  type="button"
                  data-option
                  data-selected={selected}
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onSelect(item.value);
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                  className={`flex w-full items-center gap-2 py-1.5 pr-3 text-left text-sm outline-none transition ${
                    item.indent ? "pl-8" : "pl-3"
                  } ${item.bold ? "font-semibold" : "font-normal"} ${
                    selected
                      ? "bg-violet-50 text-violet-700"
                      : "text-slate-700 hover:bg-slate-50 focus:bg-slate-50"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {selected ? (
                    <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

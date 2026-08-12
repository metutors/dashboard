"use client";

import { ChevronDown, Layers, RotateCcw, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface FilterSelectProps {
  label: string;
  placeholder: string;
  icon: LucideIcon;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

function FilterSelect({
  label,
  placeholder,
  icon: Icon,
  value,
  options,
  onChange,
  disabled,
}: FilterSelectProps) {
  return (
    <div className="min-w-0 flex-1">
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-violet-600">
        {label}
      </p>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <select
          aria-label={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
      </div>
    </div>
  );
}

interface DashboardFiltersProps {
  people: string;
  module: string;
  peopleOptions: string[];
  moduleOptions: string[];
  onPeopleChange: (value: string) => void;
  onModuleChange: (value: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

export function DashboardFilters({
  people,
  module,
  peopleOptions,
  moduleOptions,
  onPeopleChange,
  onModuleChange,
  onClear,
  disabled,
}: DashboardFiltersProps) {
  return (
    <section className="rounded-xl border border-dashed border-violet-300 bg-white p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <FilterSelect
          label="1. People / Ticket Source"
          placeholder="Select People / Ticket Source"
          icon={User}
          value={people}
          options={peopleOptions}
          onChange={onPeopleChange}
          disabled={disabled}
        />
        <FilterSelect
          label="2. System Area / Module"
          placeholder="Select System Area / Module"
          icon={Layers}
          value={module}
          options={moduleOptions}
          onChange={onModuleChange}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={onClear}
          disabled={disabled || (!people && !module)}
          className="inline-flex shrink-0 items-center gap-2 self-end rounded-md px-2 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 transition hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear Filters
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </section>
  );
}

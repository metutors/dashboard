"use client";

import { Layers, RotateCcw, User } from "lucide-react";
import {
  FilterDropdown,
  type FilterDropdownItem,
} from "@/components/dashboard/FilterDropdown";
import type { DashboardFilterOptions } from "@/types/jira";

const MODULE_VALUE_SEPARATOR = "::";

function encodeModuleValue(moduleId: string, subModuleId: string): string {
  if (!moduleId) return "";
  return subModuleId
    ? `${moduleId}${MODULE_VALUE_SEPARATOR}${subModuleId}`
    : moduleId;
}

function decodeModuleValue(value: string): [string, string] {
  if (!value) return ["", ""];
  const [moduleId, subModuleId = ""] = value.split(MODULE_VALUE_SEPARATOR);
  return [moduleId, subModuleId];
}

interface DashboardFiltersProps {
  people: string;
  module: string;
  subModule: string;
  options: DashboardFilterOptions;
  matchCount: number | null;
  behavior: string | null;
  onPeopleChange: (peopleId: string) => void;
  onModuleChange: (moduleId: string, subModuleId: string) => void;
  onClear: () => void;
  disabled?: boolean;
  embedded?: boolean;
}

export function DashboardFilters({
  people,
  module,
  subModule,
  options,
  matchCount,
  behavior,
  onPeopleChange,
  onModuleChange,
  onClear,
  disabled,
  embedded = false,
}: DashboardFiltersProps) {
  const reportedBy = options.people.filter((item) => item.mode === "reported");
  const working = options.people.filter((item) => item.mode === "working");

  const peopleItems: FilterDropdownItem[] = [
    { kind: "option", value: "", label: "All People / Ticket Sources" },
  ];
  if (reportedBy.length) {
    peopleItems.push({
      kind: "heading",
      id: "reported",
      label: "Reported By — all statuses",
    });
    for (const option of reportedBy) {
      peopleItems.push({
        kind: "option",
        value: option.id,
        label: option.label,
      });
    }
  }
  if (working.length) {
    peopleItems.push({
      kind: "heading",
      id: "working",
      label: "Working — active tickets assigned",
    });
    for (const option of working) {
      peopleItems.push({
        kind: "option",
        value: option.id,
        label: option.label,
      });
    }
  }

  const moduleItems: FilterDropdownItem[] = [
    { kind: "option", value: "", label: "All System Areas / Modules" },
  ];
  for (const option of options.modules) {
    moduleItems.push({
      kind: "option",
      value: option.id,
      label: option.label,
      bold: true,
    });
    for (const sub of option.subModules) {
      moduleItems.push({
        kind: "option",
        value: encodeModuleValue(option.id, sub.id),
        label: sub.label,
        indent: true,
      });
    }
  }

  const selectedPeopleLabel =
    options.people.find((option) => option.id === people)?.label ?? null;

  const selectedModule = options.modules.find(
    (option) => option.id === module,
  );
  const selectedSubModule = selectedModule?.subModules.find(
    (sub) => sub.id === subModule,
  );
  const selectedModuleLabel = selectedModule
    ? selectedSubModule
      ? `${selectedModule.label} › ${selectedSubModule.label}`
      : selectedModule.label
    : null;

  const filtersContent = (
    <>
      <div className="flex flex-col gap-4 overflow-visible lg:flex-row lg:items-end">
        <FilterDropdown
          label="1. People / Ticket Source"
          icon={User}
          placeholder="All People / Ticket Sources"
          value={people}
          selectedLabel={selectedPeopleLabel}
          items={peopleItems}
          onSelect={onPeopleChange}
          disabled={disabled}
        />

        <FilterDropdown
          label="2. System Area / Module"
          icon={Layers}
          placeholder="All System Areas / Modules"
          value={encodeModuleValue(module, subModule)}
          selectedLabel={selectedModuleLabel}
          items={moduleItems}
          onSelect={(value) => onModuleChange(...decodeModuleValue(value))}
          disabled={disabled}
        />

        <button
          type="button"
          onClick={onClear}
          disabled={disabled || (!people && !module)}
          className="inline-flex shrink-0 items-center gap-2 self-end rounded-md px-2 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 transition hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear Filters
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
        <span className="font-semibold text-slate-600">
          {matchCount === null
            ? "Loading tickets..."
            : `${matchCount} matching ${matchCount === 1 ? "ticket" : "tickets"}`}
        </span>
        {behavior ? (
          <>
            <span aria-hidden>•</span>
            <span>{behavior}</span>
          </>
        ) : null}
        <span aria-hidden>•</span>
        <span>Both filters work on their own or together.</span>
      </div>
    </>
  );

  if (embedded) {
    return (
      <div className="relative overflow-visible rounded-b-xl px-4 py-4 sm:px-5">
        {filtersContent}
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-dashed border-brand/40 bg-white p-4">
      {filtersContent}
    </section>
  );
}

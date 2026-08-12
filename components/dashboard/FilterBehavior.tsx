"use client";

import { Filter } from "lucide-react";

interface FilterBehaviorProps {
  people: string | null;
  module: string | null;
}

const behaviors = [
  {
    id: "people",
    title: "Only People Selected",
    description: "Shows In Progress tickets for selected person/category",
  },
  {
    id: "module",
    title: "Only System Area Selected",
    description: "Shows tickets for selected system area/module",
  },
  {
    id: "both",
    title: "Both Selected",
    description: "Shows tickets matching both filters",
  },
] as const;

function activeBehavior(
  people: string | null,
  module: string | null,
): (typeof behaviors)[number]["id"] | null {
  if (people && module) return "both";
  if (people) return "people";
  if (module) return "module";
  return null;
}

export function FilterBehavior({ people, module }: FilterBehaviorProps) {
  const active = activeBehavior(people, module);

  return (
    <section className="rounded-xl bg-gradient-to-r from-violet-50 via-violet-50 to-fuchsia-50 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex shrink-0 items-center gap-3 lg:w-56">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600/10">
            <Filter className="h-4 w-4 text-violet-600" aria-hidden />
          </span>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-700">
            Filter Behavior
          </p>
        </div>

        <div className="grid flex-1 gap-4 sm:grid-cols-3 sm:divide-x sm:divide-violet-200">
          {behaviors.map((behavior, index) => (
            <div
              key={behavior.id}
              className={index === 0 ? "sm:pr-4" : "sm:px-4"}
            >
              <p
                className={`text-xs font-bold ${
                  active === behavior.id ? "text-violet-700" : "text-violet-500"
                }`}
              >
                {behavior.title}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                {behavior.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

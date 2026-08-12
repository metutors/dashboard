"use client";

import { Bug, ClipboardList, Inbox } from "lucide-react";

interface KpiCardsProps {
  total: number;
  bugs: number;
  tasks: number;
  lastUpdated: string | null;
}

export function KpiCards({ total, bugs, tasks, lastUpdated }: KpiCardsProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-4">
      <article className="rounded-xl border border-orange-200 bg-orange-50/70 p-5 shadow-sm lg:col-span-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700/80">
              Total Matching Tickets
            </p>
            <p className="mt-2 text-[44px] font-extrabold leading-none tabular-nums text-orange-600">
              {total}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Inbox className="h-10 w-10 text-orange-300" aria-hidden />
            <p className="hidden text-[11px] font-medium text-orange-700/70 sm:block">
              Last updated: {lastUpdated ?? "—"}
            </p>
          </div>
        </div>
      </article>

      <article className="rounded-xl border border-rose-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-rose-600">
              Bugs
            </p>
            <p className="mt-2 text-[34px] font-extrabold leading-none tabular-nums text-rose-600">
              {bugs}
            </p>
          </div>
          <Bug className="h-8 w-8 text-rose-300" aria-hidden />
        </div>
      </article>

      <article className="rounded-xl border border-sky-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-600">
              Tasks
            </p>
            <p className="mt-2 text-[34px] font-extrabold leading-none tabular-nums text-sky-600">
              {tasks}
            </p>
          </div>
          <ClipboardList className="h-8 w-8 text-sky-300" aria-hidden />
        </div>
      </article>
    </section>
  );
}

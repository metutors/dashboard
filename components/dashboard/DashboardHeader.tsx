"use client";

import Image from "next/image";
import { RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  projectName: string;
  lastUpdated: string | null;
  loading: boolean;
  onPullLive: () => void;
}

function formatProjectLabel(name: string): string {
  return name.replace(/\s*[-–—]\s*METUTORS\s*$/i, "").trim() || name;
}

export function DashboardHeader({
  projectName,
  lastUpdated,
  loading,
  onPullLive,
}: DashboardHeaderProps) {
  const projectLabel = formatProjectLabel(projectName);

  return (
    <>
      <div className="flex items-center justify-between gap-4 rounded-t-xl border-b border-brand/10 bg-gradient-to-r from-brand-light/80 via-brand-light/40 to-white px-4 py-3 sm:px-5">
        <a
          href="https://metutors.com"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 transition hover:opacity-80"
        >
          <Image
            src="/logo/metutors-logo.png"
            alt="MEtutors"
            width={4398}
            height={732}
            priority
            className="h-6 w-auto sm:h-7"
          />
        </a>

        <button
          type="button"
          onClick={onPullLive}
          disabled={loading}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-brand-orange px-3.5 py-2 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-brand-orange-dark disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-xs"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            aria-hidden
          />
          {loading ? "Loading…" : "Pull Live"}
        </button>
      </div>

      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <h1 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
            Live Dashboard
          </h1>
          <span className="mt-1.5 inline-flex max-w-full truncate rounded-md border border-sky-200 bg-sky-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-sky-800">
            {projectLabel}
          </span>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {loading ? "Syncing…" : "Live"}
          </span>
          {lastUpdated ? (
            <time
              dateTime={lastUpdated}
              className="text-[11px] font-medium text-brand-muted sm:text-xs"
            >
              {lastUpdated}
            </time>
          ) : null}
        </div>
      </div>
    </>
  );
}

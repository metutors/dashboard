"use client";

import { Download, RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  projectName: string;
  lastUpdated: string | null;
  loading: boolean;
  exporting: boolean;
  onPullLive: () => void;
  onExport: () => void;
}

export function DashboardHeader({
  projectName,
  lastUpdated,
  loading,
  exporting,
  onPullLive,
  onExport,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {projectName}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">
          MEtutors Live Dashboard
        </h1>
        <p className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="relative flex h-2 w-2">
            {loading ? (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            ) : null}
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live — {lastUpdated ?? "—"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onPullLive}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:from-orange-600 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            aria-hidden
          />
          {loading ? "Loading..." : "Pull Live"}
        </button>

        <button
          type="button"
          onClick={onExport}
          disabled={loading || exporting}
          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          {exporting ? "Exporting..." : "Export to Excel"}
        </button>
      </div>
    </header>
  );
}

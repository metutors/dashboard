"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AverageCloseTimeCard } from "@/components/dashboard/AverageCloseTime";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DistributionCharts } from "@/components/dashboard/DistributionCharts";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { MatchingTickets } from "@/components/dashboard/MatchingTickets";
import { StatusSection } from "@/components/dashboard/StatusSection";
import { TeamSplitSection } from "@/components/dashboard/TeamSplit";
import type { DashboardData, DashboardFilterOptions } from "@/types/jira";

type DashboardResponse = DashboardData | { success: false; error: string };

const EMPTY_FILTER_OPTIONS: DashboardFilterOptions = { people: [], modules: [] };

/**
 * Cached filter requests return in well under 100ms, so the busy visuals are
 * delayed to avoid a flash of skeleton or dimmed content on every dropdown click.
 */
const BUSY_INDICATOR_DELAY_MS = 220;

type PendingKind = "filter" | "refresh";

export function DashboardClient() {
  const [people, setPeople] = useState("");
  const [module, setModule] = useState("");
  const [subModule, setSubModule] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [pending, setPending] = useState<PendingKind | null>("filter");
  const [showBusy, setShowBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const busyTimerRef = useRef<number | null>(null);

  const clearBusyTimer = useCallback(() => {
    if (busyTimerRef.current !== null) {
      window.clearTimeout(busyTimerRef.current);
      busyTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearBusyTimer, [clearBusyTimer]);

  const fetchDashboard = useCallback(
    async (options?: {
      people?: string;
      module?: string;
      subModule?: string;
      refresh?: boolean;
    }) => {
      const nextPeople = options?.people ?? people;
      const nextModule = options?.module ?? module;
      const nextSubModule = options?.subModule ?? subModule;
      const refresh = Boolean(options?.refresh);

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      setPending(refresh ? "refresh" : "filter");
      setError(null);
      if (refresh) {
        setStatusMessage("Loading...");
      }

      clearBusyTimer();
      busyTimerRef.current = window.setTimeout(() => {
        setShowBusy(true);
      }, BUSY_INDICATOR_DELAY_MS);

      try {
        const params = new URLSearchParams();
        if (nextPeople) params.set("people", nextPeople);
        if (nextModule) params.set("module", nextModule);
        if (nextModule && nextSubModule) params.set("submodule", nextSubModule);
        if (refresh) params.set("refresh", "1");

        const response = await fetch(
          `/api/jira/dashboard?${params.toString()}`,
          { cache: "no-store" },
        );
        const payload = (await response.json()) as DashboardResponse;

        // A newer request started while this one was in flight; drop the result.
        if (requestId !== requestIdRef.current) return;

        if (!response.ok || !("success" in payload) || payload.success !== true) {
          const message =
            "error" in payload && payload.error
              ? payload.error
              : "Unable to load Jira data. Please check your Jira configuration or try Pull Live again.";
          setError(message);
          setStatusMessage(null);
          return;
        }

        setData(payload);
        setStatusMessage(refresh ? "Dashboard Updated" : null);
        if (refresh) {
          window.setTimeout(() => {
            setStatusMessage((current) =>
              current === "Dashboard Updated" ? null : current,
            );
          }, 2500);
        }
      } catch {
        if (requestId !== requestIdRef.current) return;
        setError(
          "Unable to load Jira data. Please check your Jira configuration or try Pull Live again.",
        );
        setStatusMessage(null);
      } finally {
        if (requestId === requestIdRef.current) {
          clearBusyTimer();
          setShowBusy(false);
          setPending(null);
        }
      }
    },
    [clearBusyTimer, module, people, subModule],
  );

  useEffect(() => {
    // Initial load only; later loads come from filter changes and Pull Live.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePeopleChange = (value: string) => {
    setPeople(value);
    void fetchDashboard({ people: value });
  };

  const handleModuleChange = (moduleId: string, subModuleId: string) => {
    setModule(moduleId);
    setSubModule(subModuleId);
    void fetchDashboard({ module: moduleId, subModule: subModuleId });
  };

  const handleClearFilters = () => {
    setPeople("");
    setModule("");
    setSubModule("");
    void fetchDashboard({ people: "", module: "", subModule: "" });
  };

  const handlePullLive = () => {
    void fetchDashboard({ refresh: true });
  };

  const initialLoading = !data && pending !== null;
  // Pull Live refetches from Jira, so it keeps the full skeleton. Filter changes
  // update in place and only fade if the response is unusually slow.
  const showSkeleton = initialLoading || (pending === "refresh" && showBusy);
  const showFading = !showSkeleton && pending !== null && showBusy;

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <DashboardHeader
        projectName={data?.projectName ?? "ME Tutors"}
        lastUpdated={data?.lastUpdatedFormatted ?? null}
        loading={pending !== null}
        onPullLive={handlePullLive}
      />

      <DashboardFilters
        people={people}
        module={module}
        subModule={subModule}
        options={data?.filters.options ?? EMPTY_FILTER_OPTIONS}
        matchCount={showSkeleton ? null : (data?.total ?? null)}
        behavior={showSkeleton ? null : (data?.filters.behavior ?? null)}
        onPeopleChange={handlePeopleChange}
        onModuleChange={handleModuleChange}
        onClear={handleClearFilters}
        disabled={initialLoading || pending === "refresh"}
      />

      {statusMessage ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
          {statusMessage}
        </p>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <p className="font-semibold">Unable to load Jira data.</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : null}

      {!showSkeleton && data && data.total === 0 && data.filters.active ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p className="font-semibold text-slate-700">
            No tickets match the selected filters.
          </p>
          <p className="mt-1">
            {data.filters.behavior}. Try a different selection, or clear the
            filters to see the full project.
          </p>
        </div>
      ) : null}

      {showSkeleton ? (
        <LoadingState />
      ) : data ? (
        <div
          aria-busy={showFading}
          className={`flex flex-col gap-5 transition-opacity duration-300 ease-out ${
            showFading ? "opacity-50" : "opacity-100"
          }`}
        >
          <KpiCards
            total={data.total}
            bugs={data.bugs}
            tasks={data.tasks}
            lastUpdated={data.lastUpdatedFormatted}
          />

          <DistributionCharts data={data} />

          <TeamSplitSection teamSplit={data.teamSplit} />

          <MatchingTickets issues={data.issues} total={data.total} />

          <StatusSection
            title="Bug Status"
            accent="red"
            counts={data.bugStatus}
          />

          <AverageCloseTimeCard
            title="Avg Time to Close — Bug"
            tone="bug"
            days={data.averageCloseTime.bugs}
            count={data.averageCloseTime.bugsCount}
            countLabel="resolved bugs"
            issues={data.resolvedBugs}
          />

          <StatusSection
            title="Task Status"
            accent="blue"
            counts={data.taskStatus}
          />

          <AverageCloseTimeCard
            title="Avg Time to Close — Task"
            tone="task"
            days={data.averageCloseTime.tasks}
            count={data.averageCloseTime.tasksCount}
            countLabel="resolved tasks"
            issues={data.resolvedTasks}
          />
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { AverageCloseTimeCard } from "@/components/dashboard/AverageCloseTime";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DistributionCharts } from "@/components/dashboard/DistributionCharts";
import { FilterBehavior } from "@/components/dashboard/FilterBehavior";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { SectionHeading } from "@/components/dashboard/SectionHeading";
import { StatusSection } from "@/components/dashboard/StatusSection";
import { TeamSplitSection } from "@/components/dashboard/TeamSplit";
import type { DashboardData } from "@/types/jira";

type DashboardResponse = DashboardData | { success: false; error: string };

export function DashboardClient() {
  const [people, setPeople] = useState("");
  const [module, setModule] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchDashboard = useCallback(
    async (options?: {
      people?: string;
      module?: string;
      refresh?: boolean;
    }) => {
      const nextPeople = options?.people ?? people;
      const nextModule = options?.module ?? module;
      const refresh = Boolean(options?.refresh);

      setLoading(true);
      setError(null);
      if (refresh) {
        setStatusMessage("Loading...");
      }

      try {
        const params = new URLSearchParams();
        if (nextPeople) params.set("people", nextPeople);
        if (nextModule) params.set("module", nextModule);
        if (refresh) params.set("refresh", "1");

        const response = await fetch(
          `/api/jira/dashboard?${params.toString()}`,
          { cache: "no-store" },
        );
        const payload = (await response.json()) as DashboardResponse;

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
        setError(
          "Unable to load Jira data. Please check your Jira configuration or try Pull Live again.",
        );
        setStatusMessage(null);
      } finally {
        setLoading(false);
      }
    },
    [module, people],
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

  const handleModuleChange = (value: string) => {
    setModule(value);
    void fetchDashboard({ module: value });
  };

  const handleClearFilters = () => {
    setPeople("");
    setModule("");
    void fetchDashboard({ people: "", module: "" });
  };

  const handlePullLive = () => {
    void fetchDashboard({ refresh: true });
  };

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (people) params.set("people", people);
      if (module) params.set("module", module);

      const response = await fetch(`/api/jira/export?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error || "Export failed.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const disposition = response.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="(.+)"/);
      anchor.href = url;
      anchor.download = match?.[1] ?? "me-tutors-dashboard.xlsx";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setStatusMessage("Excel export ready");
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError.message
          : "Unable to export dashboard data.",
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <DashboardHeader
        projectName={data?.projectName ?? "ME Tutors"}
        lastUpdated={data?.lastUpdatedFormatted ?? null}
        loading={loading}
        exporting={exporting}
        onPullLive={handlePullLive}
        onExport={handleExport}
      />

      <DashboardFilters
        people={people}
        module={module}
        peopleOptions={data?.filters.options.people ?? []}
        moduleOptions={data?.filters.options.modules ?? []}
        onPeopleChange={handlePeopleChange}
        onModuleChange={handleModuleChange}
        onClear={handleClearFilters}
        disabled={loading && !data}
      />

      <FilterBehavior
        people={data?.filters.people ?? null}
        module={data?.filters.module ?? null}
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

      {loading && !data ? (
        <LoadingState />
      ) : data ? (
        <>
          <KpiCards
            total={data.total}
            bugs={data.bugs}
            tasks={data.tasks}
            lastUpdated={data.lastUpdatedFormatted}
          />

          <DistributionCharts data={data} />

          <StatusSection
            title="Bug Status"
            accent="red"
            counts={data.bugStatus}
          />

          <StatusSection
            title="Task Status"
            accent="blue"
            counts={data.taskStatus}
          />

          <TeamSplitSection teamSplit={data.teamSplit} />

          <section className="space-y-3">
            <SectionHeading title="Avg Time to Close" accent="slate" />

            <AverageCloseTimeCard
              title="Avg Time to Close — Bug"
              tone="bug"
              days={data.averageCloseTime.bugs}
              count={data.averageCloseTime.bugsCount}
              countLabel="resolved bugs"
              issues={data.resolvedBugs}
            />

            <AverageCloseTimeCard
              title="Avg Time to Close — Task"
              tone="task"
              days={data.averageCloseTime.tasks}
              count={data.averageCloseTime.tasksCount}
              countLabel="resolved tasks"
              issues={data.resolvedTasks}
            />
          </section>

          {data.configNotes.length ? (
            <details className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
              <summary className="cursor-pointer font-semibold">
                Configuration notes ({data.configNotes.length})
              </summary>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {data.configNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </details>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

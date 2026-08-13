"use client";

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-slate-200/70 ${className}`} />
  );
}

export function LoadingState() {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <div className="grid gap-4 lg:grid-cols-4">
        <SkeletonBlock className="h-28 lg:col-span-2" />
        <SkeletonBlock className="h-28" />
        <SkeletonBlock className="h-28" />
      </div>

      <div className="space-y-3">
        <SkeletonBlock className="h-3 w-32" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((chart) => (
            <SkeletonBlock key={chart} className="h-[250px]" />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <SkeletonBlock className="h-3 w-24" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
        </div>
      </div>

      <div className="space-y-3">
        <SkeletonBlock className="h-3 w-32" />
        <SkeletonBlock className="h-[280px] w-full" />
      </div>

      {[0, 1].map((section) => (
        <div key={section} className="space-y-3">
          <SkeletonBlock className="h-3 w-28" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[0, 1, 2, 3, 4].map((card) => (
              <SkeletonBlock key={card} className="h-[86px]" />
            ))}
          </div>
          <SkeletonBlock className="h-64 w-full" />
        </div>
      ))}
    </div>
  );
}

"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export interface PieSlice {
  name: string;
  value: number;
  color: string;
}

interface PieCardProps {
  title: string;
  centerLabel: string;
  slices: PieSlice[];
}

export function PieCard({ title, centerLabel, slices }: PieCardProps) {
  const data = slices.filter((slice) => slice.value > 0);
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
        {title}
      </p>

      {total === 0 ? (
        <p className="mt-6 mb-6 text-center text-xs text-slate-400">
          No data for the current filters.
        </p>
      ) : (
        <div className="relative mt-2 h-[210px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius={44}
                outerRadius={68}
                paddingAngle={2}
                stroke="#ffffff"
                strokeWidth={2}
              >
                {data.map((slice) => (
                  <Cell key={slice.name} fill={slice.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => {
                  const count = Number(value ?? 0);
                  const share = ((count / total) * 100).toFixed(1);
                  return [`${count} (${share}%)`, String(name ?? "")];
                }}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                  boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span className="text-[11px] text-slate-500">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-x-0 top-[45%] -translate-y-1/2 text-center">
            <p className="text-xl font-extrabold tabular-nums text-slate-800">
              {total}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
              {centerLabel}
            </p>
          </div>
        </div>
      )}
    </article>
  );
}

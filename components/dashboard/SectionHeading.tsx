interface SectionHeadingProps {
  title: string;
  accent: "red" | "blue" | "violet" | "slate";
}

const barClasses: Record<SectionHeadingProps["accent"], string> = {
  red: "bg-rose-500",
  blue: "bg-sky-500",
  violet: "bg-brand",
  slate: "bg-slate-400",
};

export function SectionHeading({ title, accent }: SectionHeadingProps) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-4 w-[3px] rounded-full ${barClasses[accent]}`} />
      <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-700">
        {title}
      </h2>
    </div>
  );
}

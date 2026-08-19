export function DashboardBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#f6f9fb]" />

      <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-transparent to-brand-light/40" />

      <div className="absolute -left-20 top-0 h-[420px] w-[420px] rounded-full bg-brand/20 blur-[120px]" />
      <div className="absolute -right-16 top-[18%] h-[360px] w-[360px] rounded-full bg-brand/12 blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[30%] h-[380px] w-[380px] rounded-full bg-brand-orange/10 blur-[110px]" />
    </div>
  );
}

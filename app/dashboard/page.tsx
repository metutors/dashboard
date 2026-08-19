import { DashboardBackground } from "@/components/dashboard/DashboardBackground";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default function DashboardPage() {
  return (
    <main className="relative min-h-screen">
      <DashboardBackground />
      <DashboardClient />
    </main>
  );
}

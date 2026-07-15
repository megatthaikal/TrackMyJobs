import { redirect } from "next/navigation";
import { Briefcase, Send, Users, Award, TrendingUp } from "lucide-react";
import { auth } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard-data";
import { StatTile } from "@/components/dashboard/stat-tile";
import { StatusChart } from "@/components/dashboard/status-chart";
import { TimelineChart } from "@/components/dashboard/timeline-chart";
import { FadeIn } from "@/components/fade-in";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { stats, statusBreakdown, timeline } = await getDashboardData(
    session.user.id
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your job search pipeline at a glance.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile
          index={0}
          label="Total Applications"
          value={stats.total}
          icon={<Briefcase />}
        />
        <StatTile
          index={1}
          label="Applied"
          value={stats.applied}
          icon={<Send />}
          accentClassName="bg-blue-500"
          iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatTile
          index={2}
          label="Interviewing"
          value={stats.interviewing}
          icon={<Users />}
          accentClassName="bg-amber-500"
          iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatTile
          index={3}
          label="Offers"
          value={stats.offers}
          icon={<Award />}
          accentClassName="bg-emerald-500"
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatTile
          index={4}
          label="Response Rate"
          value={stats.responseRate}
          suffix="%"
          icon={<TrendingUp />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FadeIn delay={0.15}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusChart data={statusBreakdown} />
            </CardContent>
          </Card>
        </FadeIn>
        <FadeIn delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Applications Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <TimelineChart data={timeline} />
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}

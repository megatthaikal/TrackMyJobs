import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@/generated/prisma/enums";

export type DashboardStats = {
  total: number;
  applied: number;
  interviewing: number;
  offers: number;
  rejected: number;
  responseRate: number;
};

export type StatusBreakdownPoint = {
  status: ApplicationStatus;
  count: number;
};

export type TimelinePoint = {
  month: string;
  count: number;
};

export async function getDashboardData(userId: string) {
  const applications = await prisma.application.findMany({
    where: { userId },
    select: { status: true, createdAt: true },
  });

  const counts: Record<ApplicationStatus, number> = {
    SAVED: 0,
    APPLIED: 0,
    INTERVIEWING: 0,
    OFFER: 0,
    REJECTED: 0,
    WITHDRAWN: 0,
  };
  for (const app of applications) {
    counts[app.status]++;
  }

  const appliedTotal =
    counts.APPLIED + counts.INTERVIEWING + counts.OFFER + counts.REJECTED;
  const responded = counts.INTERVIEWING + counts.OFFER + counts.REJECTED;

  const stats: DashboardStats = {
    total: applications.length,
    applied: appliedTotal,
    interviewing: counts.INTERVIEWING,
    offers: counts.OFFER,
    rejected: counts.REJECTED,
    responseRate: appliedTotal > 0 ? Math.round((responded / appliedTotal) * 100) : 0,
  };

  const statusBreakdown: StatusBreakdownPoint[] = (
    Object.keys(counts) as ApplicationStatus[]
  ).map((status) => ({ status, count: counts[status] }));

  const timeline = buildTimeline(applications.map((a) => a.createdAt));

  return { stats, statusBreakdown, timeline };
}

function buildTimeline(dates: Date[]): TimelinePoint[] {
  const months: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("en-US", { month: "short" }),
    });
  }

  const bucketCounts = new Map(months.map((m) => [m.key, 0]));
  for (const date of dates) {
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (bucketCounts.has(key)) {
      bucketCounts.set(key, (bucketCounts.get(key) ?? 0) + 1);
    }
  }

  return months.map((m) => ({ month: m.label, count: bucketCounts.get(m.key) ?? 0 }));
}

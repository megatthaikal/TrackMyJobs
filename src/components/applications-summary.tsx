"use client";

import { useMemo } from "react";
import { Briefcase, Send, Users, Award, TrendingUp } from "lucide-react";
import type { ApplicationModel } from "@/generated/prisma/models";
import { cn } from "@/lib/utils";

function computeSummary(rows: ApplicationModel[]) {
  const counts = { SAVED: 0, APPLIED: 0, INTERVIEWING: 0, OFFER: 0, REJECTED: 0, WITHDRAWN: 0 };
  for (const row of rows) counts[row.status]++;

  const appliedTotal =
    counts.APPLIED + counts.INTERVIEWING + counts.OFFER + counts.REJECTED;
  const responded = counts.INTERVIEWING + counts.OFFER + counts.REJECTED;

  return {
    total: rows.length,
    applied: appliedTotal,
    interviewing: counts.INTERVIEWING,
    offers: counts.OFFER,
    responseRate: appliedTotal > 0 ? Math.round((responded / appliedTotal) * 100) : 0,
  };
}

export function ApplicationsSummary({ rows }: { rows: ApplicationModel[] }) {
  const summary = useMemo(() => computeSummary(rows), [rows]);

  const items = [
    {
      label: "Total",
      value: summary.total,
      icon: Briefcase,
      className: "bg-primary/10 text-primary",
    },
    {
      label: "Applied",
      value: summary.applied,
      icon: Send,
      className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Interviewing",
      value: summary.interviewing,
      icon: Users,
      className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Offers",
      value: summary.offers,
      icon: Award,
      className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Response rate",
      value: `${summary.responseRate}%`,
      icon: TrendingUp,
      className: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5"
        >
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-md",
              item.className
            )}
          >
            <item.icon className="size-3.5" />
          </span>
          <span className="font-mono text-sm font-semibold tabular-nums">
            {item.value}
          </span>
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

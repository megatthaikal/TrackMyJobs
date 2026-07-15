import { cn } from "@/lib/utils";
import { ApplicationStatus } from "@/generated/prisma/enums";

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  INTERVIEWING: "Interviewing",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export const STATUS_STYLES: Record<ApplicationStatus, string> = {
  SAVED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  APPLIED: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  INTERVIEWING:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  OFFER:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  WITHDRAWN:
    "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

// Fixed status colors, reused across badges and dashboard charts.
export const STATUS_HEX: Record<ApplicationStatus, string> = {
  SAVED: "#64748b",
  APPLIED: "#3b82f6",
  INTERVIEWING: "#f59e0b",
  OFFER: "#10b981",
  REJECTED: "#ef4444",
  WITHDRAWN: "#a1a1aa",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        STATUS_STYLES[status]
      )}
    >
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: STATUS_HEX[status] }}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}

import { Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  iconClassName,
  showWordmark = true,
}: {
  className?: string;
  iconClassName?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-teal-600 text-primary-foreground shadow-sm dark:to-teal-400",
          iconClassName
        )}
      >
        <Briefcase className="size-4" strokeWidth={2.25} />
      </span>
      {showWordmark && (
        <span className="text-base font-semibold tracking-tight">
          Track<span className="text-primary">My</span>Job
        </span>
      )}
    </span>
  );
}

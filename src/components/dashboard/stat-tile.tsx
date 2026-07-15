"use client";

import { motion } from "motion/react";
import { AnimatedNumber } from "@/components/animated-number";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  suffix = "",
  icon,
  accentClassName,
  iconClassName,
  index = 0,
}: {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  accentClassName?: string;
  iconClassName?: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
    >
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className={cn("h-1 w-full bg-primary", accentClassName)} />
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary [&_svg]:size-4",
              iconClassName
            )}
          >
            {icon}
          </span>
        </CardHeader>
        <CardContent>
          <div className="font-mono text-3xl font-semibold tabular-nums">
            <AnimatedNumber value={value} suffix={suffix} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

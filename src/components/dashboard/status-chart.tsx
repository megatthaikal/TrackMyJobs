"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { STATUS_HEX, STATUS_LABELS } from "@/components/status-badge";
import type { StatusBreakdownPoint } from "@/lib/dashboard-data";

const chartConfig: ChartConfig = Object.fromEntries(
  Object.entries(STATUS_LABELS).map(([status, label]) => [
    status,
    { label, color: STATUS_HEX[status as keyof typeof STATUS_HEX] },
  ])
) satisfies ChartConfig;

export function StatusChart({ data }: { data: StatusBreakdownPoint[] }) {
  const chartData = data.map((d) => ({
    status: d.status,
    label: STATUS_LABELS[d.status],
    count: d.count,
    fill: STATUS_HEX[d.status],
  }));

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <BarChart data={chartData} margin={{ top: 16 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel nameKey="status" />}
        />
        <Bar dataKey="count" radius={4}>
          <LabelList
            dataKey="count"
            position="top"
            className="fill-foreground"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { startOfWeek, endOfWeek } from "date-fns";
import { useQuery } from "@tanstack/react-query";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function ModerationMetricsPage() {
  const [dateRange, setDateRange] = useState({
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date()),
  });

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["moderation-metrics", dateRange],
    queryFn: async () => {
      const response = await fetch("/api/moderation/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dateRange),
      });
      return response.json();
    },
  });

  if (isLoading) return <div>Loading metrics...</div>;

  const statusData = Object.entries(metrics.summary.byStatus).map(
    ([status, count]) => ({
      name: status,
      value: count,
    })
  );

  const reasonData = Object.entries(metrics.summary.byReason).map(
    ([reason, count]) => ({
      name: reason.replace(/_/g, " "),
      count,
    })
  );

  const moderatorData = metrics.moderatorPerformance.map((mod) => ({
    name: mod.moderator.name,
    actions: mod.totalActions,
    ...mod.actions,
  }));

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Moderation Metrics</h1>
        <DateRangePicker
          from={dateRange.from}
          to={dateRange.to}
          onSelect={(range) => {
            if (range?.from && range?.to) {
              setDateRange({ from: range.from, to: range.to });
            }
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Reports by Status</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {statusData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Reports by Reason</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reasonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS[0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Moderator Performance</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moderatorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="no_action"
                  stackId="a"
                  fill={COLORS[0]}
                  name="No Action"
                />
                <Bar
                  dataKey="warn_user"
                  stackId="a"
                  fill={COLORS[1]}
                  name="Warn User"
                />
                <Bar
                  dataKey="delete_content"
                  stackId="a"
                  fill={COLORS[2]}
                  name="Delete Content"
                />
                <Bar
                  dataKey="suspend_user"
                  stackId="a"
                  fill={COLORS[3]}
                  name="Suspend User"
                />
                <Bar
                  dataKey="ban_user"
                  stackId="a"
                  fill={COLORS[4]}
                  name="Ban User"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Resolution Times</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Average Resolution Time
              </p>
              <p className="text-2xl font-bold">
                {Math.round(
                  metrics.resolutionTimes.avgResolutionTime / 1000 / 60
                )}{" "}
                minutes
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Fastest Resolution
              </p>
              <p className="text-2xl font-bold">
                {Math.round(
                  metrics.resolutionTimes.minResolutionTime / 1000 / 60
                )}{" "}
                minutes
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Slowest Resolution
              </p>
              <p className="text-2xl font-bold">
                {Math.round(
                  metrics.resolutionTimes.maxResolutionTime / 1000 / 60
                )}{" "}
                minutes
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TotalOrders } from "@/lib/infer-type";
import { Badge } from "@/components/ui/badge";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { weeklyChart } from "./weekly-chart";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { monthlyChart } from "./monthly-chart";
export default function Earnings({
  totalOrders,
}: {
  totalOrders: TotalOrders[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "week";

  const chartItems = totalOrders
    .map((order) => ({
      date: order.order.created!,
      revenue: order.order.total,
    }))
    .filter((item) => item.date);

  const activeChart = useMemo(() => {
    const weekly = weeklyChart(chartItems);
    const monthly = monthlyChart(chartItems);
    if (filter === "week") {
      return weekly;
    }
    if (filter === "month") {
      return monthly;
    }
  }, [filter]);

  const activeTotal = useMemo(() => {
    if (filter === "month") {
      return monthlyChart(chartItems).reduce(
        (acc, item) => acc + item.revenue,
        0
      );
    }
    return weeklyChart(chartItems).reduce((acc, item) => acc + item.revenue, 0);
  }, [filter]);

  return (
    <Card className="flex-1 shrink-0 h-full">
      <CardHeader>
        <CardTitle>Your Revenue: ${activeTotal}</CardTitle>
        <CardDescription>Here are your recent earnings</CardDescription>
        <div className="flex items-center gap-2">
          <Badge
            onClick={() =>
              router.push("/dashboard/analytics/?filter=week", {
                scroll: false,
              })
            }
            className={cn(
              "cursor-pointer",
              filter === "week" ? "bg-primary/25" : ""
            )}
          >
            This Week
          </Badge>
          <Badge
            onClick={() =>
              router.push("/dashboard/analytics/?filter=month", {
                scroll: false,
              })
            }
            className={cn(
              "cursor-pointer",
              filter === "month" ? "bg-primary/25" : ""
            )}
          >
            This Month
          </Badge>
        </div>
        <CardContent className="h-96">
          <ResponsiveContainer width={"100%"} height={"100%"}>
            <BarChart data={activeChart}>
              <Tooltip
                content={(props) => (
                  <div>
                    {props.payload?.map((item) => {
                      return (
                        <div
                          className="bg-primary text-white py-2 px-4 rounded-md shadow-lg"
                          key={item.payload.date}
                        >
                          <p>Revenue: ${item.value}</p>
                          <p>Date: {item.payload.date}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              />
              <YAxis dataKey="revenue" />
              <XAxis dataKey="date" />
              <Bar dataKey="revenue" className="fill-primary" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </CardHeader>
    </Card>
  );
}

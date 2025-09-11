import React, { useEffect, useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import _ from "lodash";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";



const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"];

export default function ReportAnalysis({ report }: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("overview");

  useEffect(() => {
    if (report.status === "COMPLETED") {
      if (report.metrics?.length > 0) {
        setData(report.metrics);
      } else if (report.downloadUrl) {
        downloadReportData();
      }
    }
  }, [report]);

  const downloadReportData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/reports/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: report.id,
          url: report.downloadUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to download report");
      }

      const { data: metrics } = await response.json();
      setData(metrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process report");
    } finally {
      setLoading(false);
    }
  };

  // Data preparation functions
  const dailyMetrics = _.chain(data)
    .groupBy("date")
    .map((items, date) => ({
      date,
      totalCost: _.sumBy(items, "cost"),
      totalClicks: _.sumBy(items, "clicks"),
      totalImpressions: _.sumBy(items, "impressions"),
      ctr:
        (_.sumBy(items, "clicks") / _.sumBy(items, "impressions")) * 100 || 0,
      cpc: _.sumBy(items, "cost") / _.sumBy(items, "clicks") || 0,
    }))
    .orderBy("date")
    .value();

  const campaignMetrics = _.chain(data)
    .groupBy("campaignName")
    .map((items, campaignName) => ({
      campaignName,
      totalCost: _.sumBy(items, "cost"),
      totalClicks: _.sumBy(items, "clicks"),
      totalImpressions: _.sumBy(items, "impressions"),
      ctr:
        (_.sumBy(items, "clicks") / _.sumBy(items, "impressions")) * 100 || 0,
      cpc: _.sumBy(items, "cost") / _.sumBy(items, "clicks") || 0,
    }))
    .orderBy("totalCost", "desc")
    .value();

  console.log(campaignMetrics);

  const totalMetrics = {
    cost: _.sumBy(data, "cost"),
    clicks: _.sumBy(data, "clicks"),
    impressions: _.sumBy(data, "impressions"),
    ctr: (_.sumBy(data, "clicks") / _.sumBy(data, "impressions")) * 100 || 0,
    cpc: _.sumBy(data, "cost") / _.sumBy(data, "clicks") || 0,
  };

  const hourlyMetrics = _.chain(data)
    .map((metric) => ({
      ...metric,
      hour: new Date(metric.date).getHours(),
    }))
    .groupBy("hour")
    .map((items, hour) => ({
      hour: Number(hour),
      totalCost: _.sumBy(items, "cost"),
      totalClicks: _.sumBy(items, "clicks"),
      totalImpressions: _.sumBy(items, "impressions"),
      ctr:
        (_.sumBy(items, "clicks") / _.sumBy(items, "impressions")) * 100 || 0,
      cpc: _.sumBy(items, "cost") / _.sumBy(items, "clicks") || 0,
    }))
    .orderBy("hour")
    .value();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <Button onClick={downloadReportData} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mb-8 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Campaign Performance Analysis</h1>
          <Badge variant="secondary">
            {new Date(report.startDate).toLocaleDateString()} -{" "}
            {new Date(report.endDate).toLocaleDateString()}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ${totalMetrics.cost.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">
                Total Clicks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {totalMetrics.clicks.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {totalMetrics.ctr.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Average CPC</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ${totalMetrics.cpc.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="hourly">Hourly Analysis</TabsTrigger>
          <TabsTrigger value="data">Raw Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="totalCost"
                      stroke="#8884d8"
                      name="Cost"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="totalClicks"
                      stroke="#82ca9d"
                      name="Clicks"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Cost Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={campaignMetrics}
                        dataKey="totalCost"
                        nameKey="campaignName"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {campaignMetrics.map((entry, index) => (
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaign Click Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={campaignMetrics}
                        dataKey="totalClicks"
                        nameKey="campaignName"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {campaignMetrics.map((entry, index) => (
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campaignMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="campaignName"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalCost" fill="#8884d8" name="Total Cost" />
                    <Bar
                      dataKey="totalClicks"
                      fill="#82ca9d"
                      name="Total Clicks"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {campaignMetrics.map((campaign) => (
              <Card key={campaign.campaignName}>
                <CardHeader>
                  <CardTitle
                    className="text-sm truncate"
                    title={campaign.campaignName}
                  >
                    {campaign.campaignName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-gray-500">Cost</dt>
                      <dd className="font-medium">
                        ${campaign.totalCost.toFixed(2)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Clicks</dt>
                      <dd className="font-medium">{campaign.totalClicks}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">CTR</dt>
                      <dd className="font-medium">
                        {campaign.ctr.toFixed(2)}%
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">CPC</dt>
                      <dd className="font-medium">
                        ${campaign.cpc.toFixed(2)}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>CTR Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="ctr"
                        stroke="#8884d8"
                        fill="#8884d8"
                        name="CTR %"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CPC Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) =>
                          typeof value === "number"
                            ? `$${value.toFixed(2)}`
                            : `$${value}`
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="cpc"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        name="CPC"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Impressions vs Clicks Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="totalImpressions"
                      stroke="#8884d8"
                      name="Impressions"
                      dot={false}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="totalClicks"
                      stroke="#82ca9d"
                      name="Clicks"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hourly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Performance Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="hour"
                      tickFormatter={(hour) => `${hour}:00`}
                      domain={[0, 23]}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      labelFormatter={(hour) => `${hour}:00`}
                      formatter={(value, name) => [
                        name === "Cost"
                          ? `$${Number(value).toFixed(2)}`
                          : value,
                        name,
                      ]}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="totalCost"
                      stroke="#8884d8"
                      name="Cost"
                      dot={true}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="totalClicks"
                      stroke="#82ca9d"
                      name="Clicks"
                      dot={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Hourly CTR Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hourlyMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="hour"
                        tickFormatter={(hour) => `${hour}:00`}
                        domain={[0, 23]}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(hour) => `${hour}:00`}
                        formatter={(value) => [
                          `${Number(value).toFixed(2)}%`,
                          "CTR",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="ctr"
                        stroke="#8884d8"
                        fill="#8884d8"
                        name="CTR"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hourly CPC Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hourlyMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="hour"
                        tickFormatter={(hour) => `${hour}:00`}
                        domain={[0, 23]}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(hour) => `${hour}:00`}
                        formatter={(value) => [
                          `$${Number(value).toFixed(2)}`,
                          "CPC",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="cpc"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        name="CPC"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Raw Data</span>
                <span className="text-sm text-muted-foreground">
                  {data.length} records
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead className="text-right">Impressions</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">CTR</TableHead>
                      <TableHead className="text-right">CPC</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row, index) => {
                      const ctr = (row.clicks / row.impressions) * 100 || 0;
                      const cpc = row.cost / row.clicks || 0;

                      return (
                        <TableRow key={index}>
                          <TableCell>
                            {new Date(row.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell
                            className="max-w-[200px] truncate"
                            title={row.campaignName}
                          >
                            {row.campaignName}
                          </TableCell>
                          <TableCell className="text-right">
                            {row.impressions.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {row.clicks.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            ${row.cost.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {ctr.toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-right">
                            ${cpc.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

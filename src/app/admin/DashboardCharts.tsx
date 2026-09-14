"use client";

import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const PIE_COLORS = ["#F06104", "#F48406", "#0A0A0A", "#6B6560", "#9C948D", "#E7DCCF"];

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  const chartData = data.map((d) => ({ ...d, label: formatShortDate(d.date) }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E7DCCF" />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6B6560" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#6B6560" }} axisLine={false} tickLine={false} width={40} />
        <Tooltip
          formatter={(value) => [`€${Number(value).toFixed(2)}`, "Revenue"]}
          contentStyle={{ borderRadius: 12, borderColor: "#E7DCCF" }}
        />
        <Line type="monotone" dataKey="revenue" stroke="#F06104" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function OrdersChart({ data }: { data: { date: string; orders: number }[] }) {
  const chartData = data.map((d) => ({ ...d, label: formatShortDate(d.date) }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E7DCCF" />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6B6560" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#6B6560" }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#E7DCCF" }} />
        <Bar dataKey="orders" fill="#F48406" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TopCountriesDonut({
  data,
}: {
  data: { countryName: string; countryCode: string; orders: number }[];
}) {
  if (data.length === 0) {
    return <p className="flex h-[260px] items-center justify-center text-sm text-muted">No orders yet.</p>;
  }

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width="55%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="orders" nameKey="countryName" innerRadius={55} outerRadius={85} paddingAngle={2}>
            {data.map((entry, index) => (
              <Cell key={entry.countryCode} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#E7DCCF" }} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="flex-1 space-y-2">
        {data.map((entry, index) => (
          <li key={entry.countryCode} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
            />
            <span className="flex-1 truncate text-ink">{entry.countryName}</span>
            <span className="font-semibold text-muted">{entry.orders}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Calendar,
  CheckSquare,
  Clock,
  Phone,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/* ─── Per-tab data ─────────────────────────────────────────────── */
const tabData = {
  outbound: {
    calls:     { today: 312, week: 1840, month: 7420, trend: "+11%" },
    meetings:  { today: 34,  week: 198,  month: 812,  trend: "+9%"  },
    tasks:     { today: 58,  week: 341,  month: 1560, trend: "+6%"  },
    duration:  "4.8",
    barChart: {
      title: "Outbound Calls by Region",
      label: "Calls",
      data: [
        { x: "N. America", v: 520 },
        { x: "Europe",     v: 480 },
        { x: "Asia Pac.",  v: 390 },
        { x: "Lat. Am.",   v: 280 },
        { x: "Mid. East",  v: 180 },
      ],
    },
    donut: { title: "Call Conversion Rate", resolved: 72, label: "Converted" },
  },
  inbound: {
    calls:     { today: 156, week: 892,  month: 3245, trend: "+8%"  },
    meetings:  { today: 23,  week: 134,  month: 567,  trend: "+12%" },
    tasks:     { today: 45,  week: 267,  month: 1234, trend: "+5%"  },
    duration:  "4.5",
    barChart: {
      title: "Inbound Calls by Hour",
      label: "Calls",
      data: [
        { x: "8 AM",  v: 42  },
        { x: "9 AM",  v: 78  },
        { x: "10 AM", v: 95  },
        { x: "11 AM", v: 110 },
        { x: "12 PM", v: 88  },
        { x: "2 PM",  v: 104 },
        { x: "3 PM",  v: 91  },
        { x: "4 PM",  v: 63  },
      ],
    },
    donut: { title: "Call Resolution Rate", resolved: 68, label: "Resolved" },
  },
  email: {
    calls:     { today: 234, week: 1456, month: 5890, trend: "+15%" },
    meetings:  { today: 18,  week: 112,  month: 445,  trend: "+9%"  },
    tasks:     { today: 34,  week: 198,  month: 876,  trend: "+7%"  },
    duration:  "3.2",
    barChart: {
      title: "Email Sends by Day",
      label: "Emails",
      data: [
        { x: "Mon", v: 320 },
        { x: "Tue", v: 410 },
        { x: "Wed", v: 390 },
        { x: "Thu", v: 475 },
        { x: "Fri", v: 510 },
        { x: "Sat", v: 180 },
        { x: "Sun", v: 95  },
      ],
    },
    donut: { title: "Email Open Rate", resolved: 45, label: "Opened" },
  },
};

const tabs = [
  { key: "outbound", label: "Outbound Calls" },
  { key: "inbound",  label: "Inbound Calls"  },
  { key: "email",    label: "Email Campaign"  },
];

function normalizeTab(initialTab) {
  if (initialTab === "Inbound Calls")   return "inbound";
  if (initialTab === "Email Campaign")  return "email";
  return "outbound";
}

/* ─── Custom bar tooltip ───────────────────────────────────────── */
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 shadow-md rounded-lg px-3 py-2 text-[12px]">
      <p className="font-semibold text-gray-700 mb-0.5">{label}</p>
      <p className="text-indigo-600 font-bold">{payload[0].value}</p>
    </div>
  );
};

/* ─── Donut chart with centred label ──────────────────────────── */
function DonutChart({ resolved, label }) {
  const remaining = 100 - resolved;
  return (
    <div className="relative flex items-center justify-center">
      <ResponsiveContainer width={200} height={200}>
        <PieChart>
          <Pie
            data={[
              { name: label,    value: resolved   },
              { name: "Other",  value: remaining  },
            ]}
            cx="50%"
            cy="50%"
            innerRadius={62}
            outerRadius={88}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill="#22c55e" />
            <Cell fill="#f0fdf4" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {/* Centre text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[28px] font-bold text-gray-900 leading-none">{resolved}%</span>
        <span className="text-[12px] text-green-600 font-semibold mt-1">{label}</span>
      </div>
    </div>
  );
}

/* ─── KPI card ─────────────────────────────────────────────────── */
function KpiCard({ gradient, shadow, icon: Icon, trend, title, today, week, month }) {
  return (
    <article className={`rounded-2xl ${gradient} ${shadow} p-5 text-white`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold">
          <TrendingUp className="h-3 w-3" /> {trend}
        </span>
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70 mb-3">
        {title}
      </p>
      <div className="flex items-end gap-4">
        <div>
          <p className="text-[20px] font-bold leading-none">{today}</p>
          <p className="text-[11px] text-white/60 mt-1">Today</p>
        </div>
        <div className="w-px h-8 bg-white/25 shrink-0" />
        <div>
          <p className="text-[20px] font-bold leading-none">{week}</p>
          <p className="text-[11px] text-white/60 mt-1">Week</p>
        </div>
        <div className="w-px h-8 bg-white/25 shrink-0" />
        <div>
          <p className="text-[20px] font-bold leading-none">{month}</p>
          <p className="text-[11px] text-white/60 mt-1">Month</p>
        </div>
      </div>
    </article>
  );
}

/* ─── Main component ───────────────────────────────────────────── */
export default function ModuleDashboard({
  moduleName = "Sales",
  initialTab  = "Outbound Calls",
}) {
  const [activeTab,    setActiveTab]    = useState(normalizeTab(initialTab));
  const [isRefreshing, setIsRefreshing] = useState(false);

  const d = tabData[activeTab];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <main className="min-h-[calc(100vh-60px)] bg-[#f4f5f7] p-6">

      {/* ── Toolbar ── */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-xl bg-white border border-gray-200 p-1 shadow-sm">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                type="button"
                className={`rounded-lg px-4 py-2 text-[13px] font-medium transition-all ${
                  isActive
                    ? "bg-[#7c3aed] text-white shadow-md shadow-violet-400/30"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <select className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400/30">
            <option>This Year</option>
            <option>Last Year</option>
            <option>All Time</option>
          </select>
          <button
            type="button"
            aria-label="Refresh"
            onClick={handleRefresh}
            className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 transition shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <section className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

        {/* Calls Processed */}
        <KpiCard
          gradient="bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]"
          shadow="shadow-lg shadow-indigo-400/25"
          icon={Phone}
          trend={d.calls.trend}
          title="Calls Processed"
          today={d.calls.today}
          week={d.calls.week}
          month={d.calls.month}
        />

        {/* Meetings Scheduled */}
        <KpiCard
          gradient="bg-gradient-to-br from-[#14b8a6] to-[#0d9488]"
          shadow="shadow-lg shadow-teal-400/25"
          icon={Calendar}
          trend={d.meetings.trend}
          title="Meetings Scheduled"
          today={d.meetings.today}
          week={d.meetings.week}
          month={d.meetings.month}
        />

        {/* Tasks Created */}
        <KpiCard
          gradient="bg-gradient-to-br from-[#a855f7] to-[#7c3aed]"
          shadow="shadow-lg shadow-purple-400/25"
          icon={CheckSquare}
          trend={d.tasks.trend}
          title="Tasks Created"
          today={d.tasks.today}
          week={d.tasks.week}
          month={d.tasks.month}
        />

        {/* Avg Call Duration — single-stat variant */}
        <article className="rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-[#0891b2] shadow-lg shadow-sky-400/25 p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold">
              avg. time
            </span>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70 mb-2">
            Avg Call Duration
          </p>
          <p className="text-[48px] font-bold leading-none">{d.duration}</p>
          <p className="text-[12px] text-white/60 mt-1">Minutes per call</p>
        </article>
      </section>

      {/* ── Charts ── */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Bar chart */}
        <article className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-0.5">
            {d.barChart.title}
          </h3>
          <p className="text-[12px] text-gray-400 mb-4">
            Activity breakdown for selected period
          </p>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.barChart.data} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="x"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: "#f5f3ff" }} />
                <Bar dataKey="v" name={d.barChart.label} fill="#6366f1" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Donut chart */}
        <article className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-0.5">
            {d.donut.title}
          </h3>
          <p className="text-[12px] text-gray-400 mb-4">
            Percentage of {d.donut.label.toLowerCase()} interactions
          </p>
          <div className="flex items-center justify-around">
            <DonutChart resolved={d.donut.resolved} label={d.donut.label} />

            {/* Legend */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-gray-800">
                    {d.donut.resolved}%
                  </p>
                  <p className="text-[11px] text-gray-500">{d.donut.label}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-gray-200 shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-gray-800">
                    {100 - d.donut.resolved}%
                  </p>
                  <p className="text-[11px] text-gray-500">Unresolved</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-[11px] text-gray-400">Based on current period</p>
              </div>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}

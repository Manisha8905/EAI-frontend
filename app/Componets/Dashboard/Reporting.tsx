"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  RefreshCw,
  TrendingUp,
  FileText,
  Users,
  Target,
  DollarSign,
  Download,
  ChevronUp,
  ChevronDown,
  Minus,
} from "lucide-react";

/* ─── Static data ────────────────────────────────────────────── */
const periodData: Record<string, any> = {
  week: {
    kpis: {
      reports:    { value: 48,    trend: "+12%", up: true  },
      leads:      { value: 312,   trend: "+8%",  up: true  },
      conversion: { value: "24%", trend: "+3%",  up: true  },
      revenue:    { value: "$18K",trend: "-2%",  up: false },
    },
    bar: [
      { x: "Mon", v: 34 }, { x: "Tue", v: 52 }, { x: "Wed", v: 41 },
      { x: "Thu", v: 67 }, { x: "Fri", v: 58 }, { x: "Sat", v: 20 }, { x: "Sun", v: 14 },
    ],
    line: [
      { x: "Mon", leads: 42, converted: 10 }, { x: "Tue", leads: 58, converted: 14 },
      { x: "Wed", leads: 51, converted: 12 }, { x: "Thu", leads: 75, converted: 18 },
      { x: "Fri", leads: 63, converted: 15 }, { x: "Sat", leads: 28, converted: 6  },
      { x: "Sun", leads: 19, converted: 4  },
    ],
    donut: { rate: 24 },
    rows: [
      { id: "RPT-001", name: "Weekly Pipeline Summary",    type: "Pipeline", leads: 78,  conv: "26%", status: "ready"   },
      { id: "RPT-002", name: "Email Campaign Performance", type: "Campaign", leads: 54,  conv: "18%", status: "ready"   },
      { id: "RPT-003", name: "Outbound Call Analysis",     type: "Calls",    leads: 103, conv: "31%", status: "running" },
      { id: "RPT-004", name: "Lead Source Breakdown",      type: "Leads",    leads: 45,  conv: "22%", status: "ready"   },
      { id: "RPT-005", name: "Agent Performance Report",   type: "Agent",    leads: 32,  conv: "15%", status: "pending" },
    ],
  },
  month: {
    kpis: {
      reports:    { value: 184,   trend: "+19%", up: true },
      leads:      { value: 1245,  trend: "+11%", up: true },
      conversion: { value: "27%", trend: "+5%",  up: true },
      revenue:    { value: "$74K",trend: "+7%",  up: true },
    },
    bar: [
      { x: "W1", v: 38 }, { x: "W2", v: 56 }, { x: "W3", v: 49 }, { x: "W4", v: 71 },
    ],
    line: [
      { x: "W1", leads: 280, converted: 72  }, { x: "W2", leads: 340, converted: 95 },
      { x: "W3", leads: 310, converted: 84  }, { x: "W4", leads: 425, converted: 116 },
    ],
    donut: { rate: 27 },
    rows: [
      { id: "RPT-011", name: "Monthly Sales Pipeline",    type: "Pipeline", leads: 340, conv: "29%", status: "ready"   },
      { id: "RPT-012", name: "Campaign ROI Analysis",     type: "Campaign", leads: 210, conv: "24%", status: "ready"   },
      { id: "RPT-013", name: "Inbound Lead Quality",      type: "Leads",    leads: 398, conv: "32%", status: "running" },
      { id: "RPT-014", name: "Territory Performance",     type: "Agent",    leads: 175, conv: "21%", status: "ready"   },
      { id: "RPT-015", name: "Forecast vs Actuals",       type: "Pipeline", leads: 122, conv: "18%", status: "pending" },
    ],
  },
  year: {
    kpis: {
      reports:    { value: 2104,   trend: "+34%", up: true },
      leads:      { value: "14K",  trend: "+22%", up: true },
      conversion: { value: "29%",  trend: "+8%",  up: true },
      revenue:    { value: "$1.2M",trend: "+18%", up: true },
    },
    bar: [
      { x: "Jan", v: 128 }, { x: "Feb", v: 142 }, { x: "Mar", v: 165 }, { x: "Apr", v: 188 },
      { x: "May", v: 210 }, { x: "Jun", v: 195 }, { x: "Jul", v: 220 }, { x: "Aug", v: 245 },
      { x: "Sep", v: 198 }, { x: "Oct", v: 270 }, { x: "Nov", v: 260 }, { x: "Dec", v: 183 },
    ],
    line: [
      { x: "Jan", leads: 1050, converted: 298 }, { x: "Feb", leads: 1120, converted: 320 },
      { x: "Mar", leads: 1280, converted: 368 }, { x: "Apr", leads: 1140, converted: 330 },
      { x: "May", leads: 1320, converted: 390 }, { x: "Jun", leads: 1210, converted: 352 },
      { x: "Jul", leads: 1380, converted: 402 }, { x: "Aug", leads: 1450, converted: 425 },
      { x: "Sep", leads: 1290, converted: 375 }, { x: "Oct", leads: 1540, converted: 452 },
      { x: "Nov", leads: 1480, converted: 432 }, { x: "Dec", leads: 940,  converted: 275 },
    ],
    donut: { rate: 29 },
    rows: [
      { id: "RPT-101", name: "Annual Pipeline Review",       type: "Pipeline", leads: 3420, conv: "31%", status: "ready"   },
      { id: "RPT-102", name: "Yearly Campaign Performance",  type: "Campaign", leads: 2810, conv: "27%", status: "ready"   },
      { id: "RPT-103", name: "Regional Sales Analytics",     type: "Agent",    leads: 4120, conv: "29%", status: "ready"   },
      { id: "RPT-104", name: "Lead Source Attribution",      type: "Leads",    leads: 1980, conv: "24%", status: "running" },
      { id: "RPT-105", name: "Revenue Forecast Accuracy",    type: "Pipeline", leads: 890,  conv: "33%", status: "pending" },
    ],
  },
};

const STATUS_STYLES: Record<string, string> = {
  ready:   "bg-green-50 text-green-700 border border-green-200",
  running: "bg-blue-50 text-blue-600 border border-blue-200",
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
};

const TYPE_STYLES: Record<string, string> = {
  Pipeline: "bg-purple-50 text-purple-700",
  Campaign: "bg-indigo-50 text-indigo-700",
  Calls:    "bg-sky-50 text-sky-700",
  Leads:    "bg-teal-50 text-teal-700",
  Agent:    "bg-orange-50 text-orange-700",
};

/* ─── Custom tooltips ────────────────────────────────────────── */
const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 shadow-md rounded-lg px-3 py-2 text-[12px]">
      <p className="font-semibold text-gray-700 mb-0.5">{label}</p>
      <p className="text-indigo-600 font-bold">{payload[0].value} reports</p>
    </div>
  );
};

const LineTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 shadow-md rounded-lg px-3 py-2 text-[12px]">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-bold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

/* ─── Donut ──────────────────────────────────────────────────── */
function DonutChart({ rate }: { rate: number }) {
  return (
    <div className="relative flex items-center justify-center">
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          <Pie
            data={[{ name: "Converted", value: rate }, { name: "Other", value: 100 - rate }]}
            cx="50%" cy="50%"
            innerRadius={55} outerRadius={80}
            startAngle={90} endAngle={-270}
            dataKey="value" strokeWidth={0}
          >
            <Cell fill="#7c3aed" />
            <Cell fill="#ede9fe" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[26px] font-bold text-gray-900 leading-none">{rate}%</span>
        <span className="text-[11px] text-violet-600 font-semibold mt-1">Conversion</span>
      </div>
    </div>
  );
}

/* ─── KPI card ───────────────────────────────────────────────── */
function KpiCard({ gradient, shadow, icon: Icon, label, value, trend, up }: any) {
  const TrendIcon = up === null ? Minus : up ? ChevronUp : ChevronDown;
  const trendColor = up === null ? "text-white/60" : up ? "text-green-300" : "text-red-300";
  return (
    <article className={`rounded-2xl ${gradient} ${shadow} p-5 text-white`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <span className={`flex items-center gap-0.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold ${trendColor}`}>
          <TrendIcon className="h-3 w-3" />
          {trend}
        </span>
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70 mb-2">{label}</p>
      <p className="text-[32px] font-bold leading-none">{value}</p>
    </article>
  );
}

/* ════════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════════ */
export default function Reporting() {
  const [period, setPeriod]             = useState("month");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const d = periodData[period];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <main className="min-h-[calc(100vh-60px)] bg-[#f4f5f7] p-6">

      {/* ── Toolbar ── */}
      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 rounded-xl bg-white border border-gray-200 p-1 shadow-sm">
          {[
            { key: "week",  label: "This Week"  },
            { key: "month", label: "This Month" },
            { key: "year",  label: "This Year"  },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setPeriod(tab.key)}
              className={`rounded-lg px-4 py-2 text-[13px] font-medium transition-all ${
                period === tab.key
                  ? "bg-[#7c3aed] text-white shadow-md shadow-violet-400/30"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
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
      <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard gradient="bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]" shadow="shadow-lg shadow-indigo-400/25" icon={FileText}   label="Total Reports"      value={d.kpis.reports.value}    trend={d.kpis.reports.trend}    up={d.kpis.reports.up} />
        <KpiCard gradient="bg-gradient-to-br from-[#14b8a6] to-[#0d9488]" shadow="shadow-lg shadow-teal-400/25"   icon={Users}      label="Leads Tracked"      value={d.kpis.leads.value}      trend={d.kpis.leads.trend}      up={d.kpis.leads.up} />
        <KpiCard gradient="bg-gradient-to-br from-[#a855f7] to-[#7c3aed]" shadow="shadow-lg shadow-purple-400/25" icon={Target}     label="Conversion Rate"    value={d.kpis.conversion.value} trend={d.kpis.conversion.trend} up={d.kpis.conversion.up} />
        <KpiCard gradient="bg-gradient-to-br from-[#0ea5e9] to-[#0891b2]" shadow="shadow-lg shadow-sky-400/25"    icon={DollarSign} label="Revenue Generated"   value={d.kpis.revenue.value}    trend={d.kpis.revenue.trend}    up={d.kpis.revenue.up} />
      </section>

      {/* ── Charts row ── */}
      <section className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Bar */}
        <article className="lg:col-span-1 rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-0.5">Reports Generated</h3>
          <p className="text-[12px] text-gray-400 mb-4">Volume per period</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={d.bar} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="x" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<BarTooltip />} cursor={{ fill: "#f5f3ff" }} />
              <Bar dataKey="v" radius={[5, 5, 0, 0]}>
                {d.bar.map((_: any, i: number) => (
                  <Cell key={i} fill={i === d.bar.length - 2 ? "#7c3aed" : "#c4b5fd"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>

        {/* Line */}
        <article className="lg:col-span-1 rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-0.5">Leads vs Converted</h3>
          <p className="text-[12px] text-gray-400 mb-4">Funnel trend over time</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={d.line}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="x" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<LineTooltip />} />
              <Line name="Leads"     type="monotone" dataKey="leads"     stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: "#6366f1" }} activeDot={{ r: 5 }} />
              <Line name="Converted" type="monotone" dataKey="converted" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: "#22c55e" }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-[11px] text-gray-500"><span className="w-3 h-0.5 rounded bg-indigo-500 inline-block" /> Leads</span>
            <span className="flex items-center gap-1.5 text-[11px] text-gray-500"><span className="w-3 h-0.5 rounded bg-green-500 inline-block" /> Converted</span>
          </div>
        </article>

        {/* Donut */}
        <article className="lg:col-span-1 rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex flex-col items-center justify-center">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-0.5 self-start">Conversion Rate</h3>
          <p className="text-[12px] text-gray-400 mb-4 self-start">Overall lead-to-close ratio</p>
          <DonutChart rate={d.donut.rate} />
          <div className="mt-3 flex gap-5 text-[12px]">
            <span className="flex items-center gap-1.5 text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-violet-600 inline-block shrink-0" />Converted</span>
            <span className="flex items-center gap-1.5 text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-violet-100 inline-block shrink-0" />Remaining</span>
          </div>
        </article>
      </section>

      {/* ── Reports table ── */}
      <section className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-[14px] font-semibold text-gray-900">Recent Reports</h3>
            <p className="text-[12px] text-gray-400 mt-0.5">Latest generated &amp; running reports</p>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg bg-[#7c3aed] px-3 py-2 text-[12px] font-semibold text-white hover:bg-violet-700 transition shadow-sm shadow-violet-400/30"
          >
            <FileText className="h-3.5 w-3.5" />
            New Report
          </button>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Report ID", "Report Name", "Type", "Leads", "Conv. Rate", "Status", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-[11px] font-[600] uppercase tracking-wide text-gray-500 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.rows.map((row: any, idx: number) => (
                <tr key={row.id} className={`border-b border-gray-50 transition hover:bg-gray-50/70 ${idx % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                  <td className="px-5 py-3.5 text-[12px] font-[600] text-gray-400 font-mono">{row.id}</td>
                  <td className="px-5 py-3.5 text-[13px] font-[500] text-gray-800">{row.name}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-[600] ${TYPE_STYLES[row.type] ?? "bg-gray-100 text-gray-600"}`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] font-[600] text-gray-700">{row.leads.toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 min-w-[48px]">
                        <div className="h-1.5 rounded-full bg-violet-500" style={{ width: row.conv }} />
                      </div>
                      <span className="text-[12px] font-[600] text-gray-700 shrink-0">{row.conv}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-[600] ${STATUS_STYLES[row.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        row.status === "ready"   ? "bg-green-500" :
                        row.status === "running" ? "bg-blue-500 animate-pulse" : "bg-amber-400"
                      }`} />
                      {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {row.status === "ready" && (
                      <button type="button" className="flex items-center gap-1 text-[12px] font-[500] text-violet-600 hover:text-violet-800 transition">
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[12px] text-gray-400">Showing {d.rows.length} of {d.rows.length} reports</p>
          <button type="button" className="text-[12px] font-[500] text-violet-600 hover:text-violet-800 transition">
            View all reports →
          </button>
        </div>
      </section>

    </main>
  );
}

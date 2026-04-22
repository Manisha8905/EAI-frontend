"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "../../Redux/axiosInstance";
import {
  Mail,
  FileText,
  DollarSign,
  XCircle,
  TrendingUp,
  RefreshCw,
  ShieldOff,
  ChevronDown,
  Server,
  Database,
  HardDrive,
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/* ─── Role guard ──────────────────────────────────────────────── */
const isAllowedRole = (role) => {
  const r = (role || "").toUpperCase().replace(/[\s_-]/g, "");
  return r === "FINANCE" || r === "SUPERADMIN";
};

/* ─── Static data (replace with API calls as needed) ─────────── */
const FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Today", value: "today" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "This Quarter", value: "this_quarter" },
  { label: "This Year", value: "this_year" },
];

const KPI_DATA = {
  all: {
    jobs: { value: 156, trend: 12, freight: 89, trade: 67 },
    invoices: { value: 629, trend: 18, freight: 342, trade: 287 },
    amount: { value: "$1.65M", note: "This month" },
    failed: { value: 18, system: 8, data: 6, backend: 4 },
  },
  today: {
    jobs: { value: 14, trend: 5, freight: 8, trade: 6 },
    invoices: { value: 57, trend: 9, freight: 31, trade: 26 },
    amount: { value: "$148K", note: "Today" },
    failed: { value: 2, system: 1, data: 1, backend: 0 },
  },
  this_week: {
    jobs: { value: 38, trend: 8, freight: 22, trade: 16 },
    invoices: { value: 162, trend: 11, freight: 89, trade: 73 },
    amount: { value: "$420K", note: "This week" },
    failed: { value: 5, system: 2, data: 2, backend: 1 },
  },
  this_month: {
    jobs: { value: 156, trend: 12, freight: 89, trade: 67 },
    invoices: { value: 629, trend: 18, freight: 342, trade: 287 },
    amount: { value: "$1.65M", note: "This month" },
    failed: { value: 18, system: 8, data: 6, backend: 4 },
  },
  this_quarter: {
    jobs: { value: 421, trend: 14, freight: 240, trade: 181 },
    invoices: { value: 1840, trend: 16, freight: 998, trade: 842 },
    amount: { value: "$4.9M", note: "This quarter" },
    failed: { value: 47, system: 20, data: 15, backend: 12 },
  },
  this_year: {
    jobs: { value: 1624, trend: 22, freight: 930, trade: 694 },
    invoices: { value: 7210, trend: 19, freight: 3910, trade: 3300 },
    amount: { value: "$19.3M", note: "This year" },
    failed: { value: 183, system: 78, data: 61, backend: 44 },
  },
};

const JOB_STATUS_DATA = [
  { name: "Success", value: 91, fill: "#22c55e" },
  { name: "Failed", value: 2, fill: "#ef4444" },
  { name: "Partial", value: 7, fill: "#f97316" },
];

const PROCESSING_TREND = [
  { period: "2024", jobs: 3200, freight: 2800, trade: 2100 },
  { period: "Q1 25", jobs: 5400, freight: 4200, trade: 3000 },
  { period: "Q2 25", jobs: 7100, freight: 5800, trade: 4100 },
  { period: "Q3 25", jobs: 6800, freight: 5600, trade: 3900 },
  { period: "Q4 25", jobs: 8200, freight: 6900, trade: 5100 },
  { period: "2026", jobs: 9500, freight: 7800, trade: 5900 },
];

const FAILURE_RATE_DATA = [
  { date: "03/19", rate: 2.4 },
  { date: "03/20", rate: 1.9 },
  { date: "03/21", rate: 2.55 },
  { date: "03/22", rate: 1.95 },
  { date: "03/23", rate: 2.6 },
  { date: "03/24", rate: 1.55 },
  { date: "03/25", rate: 1.95 },
];

/* ─── Custom Tooltip – Processing Trend ──────────────────────── */
const TrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-3 text-[12px] min-w-[170px]">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-500">{entry.name}</span>
          </div>
          <span className="font-bold text-gray-800">{entry.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Custom Tooltip – Failure Rate ──────────────────────────── */
const FailureTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-2.5 text-[12px]">
      <p className="font-semibold text-gray-600 mb-1">{label}</p>
      <p className="text-red-500 font-bold text-[15px]">
        {payload[0].value}%
        <span className="text-[11px] font-normal text-gray-400 ml-1">failure rate</span>
      </p>
    </div>
  );
};

/* ─── KPI Card — Sales-style dark gradient ───────────────────── */
const CARD_GRADIENTS = {
  blue:   { grad: "from-blue-500 to-blue-600",     shadow: "shadow-indigo-400/30" },
  green:  { grad: "from-green-500 to-green-600",   shadow: "shadow-green-400/30"  },
  purple: { grad: "from-purple-500 to-purple-600", shadow: "shadow-purple-400/30" },
  teal:   { grad: "from-teal-500 to-teal-600",     shadow: "shadow-teal-400/30"   },
};

function KpiCard({ icon: Icon, tone, title, main, trend, badge, subItems }) {
  const { grad, shadow } = CARD_GRADIENTS[tone] ?? CARD_GRADIENTS.blue;
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${grad} p-6 text-white shadow-lg ${shadow} flex flex-col gap-3`}>
      {/* Row 1: icon pill + trend/badge */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center justify-center rounded-xl bg-white/20 p-3">
          <Icon className="h-5 w-5 text-white" />
        </span>
        {(trend !== undefined || badge) && (
          <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[12px] font-[600] text-white">
            {trend !== undefined && <TrendingUp className="h-3 w-3" />}
            {trend !== undefined ? `+${trend}%` : badge}
          </span>
        )}
      </div>
      {/* Row 2: uppercase label + big value */}
      <div className="mt-1">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70 mb-2">{title}</p>
        <p className="text-[42px] font-bold leading-none tracking-tight">{main}</p>
      </div>
      {/* Row 3: sub-items */}
      {subItems && subItems.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-3 border-t border-white/20">
          {subItems.map((item, i) => (
            <span key={i} className="flex items-center gap-1 text-[12px] text-white/80">
              {item.icon && <item.icon className="h-3.5 w-3.5 text-white/70" />}
              <span className="font-[700] text-white">{item.count}</span>
              {item.label && <span>{item.label}</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Jobs by Status full-pie with outside labels ─────────────── */
const RADIAN = Math.PI / 180;
function PieOutsideLabel({ cx, cy, midAngle, outerRadius, name, value, fill }) {
  const radius = outerRadius + 38;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x} y={y}
      fill={fill}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={13}
      fontWeight={700}
    >
      {name}: {value}%
    </text>
  );
}

function JobStatusChart({ data }) {
  const chartData = data ?? JOB_STATUS_DATA;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-[15px] font-[700] text-gray-900">Jobs by Status</h3>
      <p className="text-[12px] text-gray-400 mb-2">Distribution of job completion states</p>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%" cy="50%"
            outerRadius={95}
            dataKey="value"
            startAngle={90} endAngle={-270}
            strokeWidth={2} stroke="#fff"
            label={<PieOutsideLabel />}
            labelLine={{ stroke: "#d1d5db", strokeWidth: 1.2 }}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v, name) => [`${v}%`, name]}
            contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Processing Trend — grouped bar chart ───────────────────── */
function ProcessingTrendChart({ filterLabel, data }) {
  const chartData = data ?? PROCESSING_TREND;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-[15px] font-[700] text-gray-900">Processing Trend ({filterLabel})</h3>
      <p className="text-[12px] text-gray-400 mb-4">Jobs and invoices processed over time</p>
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }} barSize={12} barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
          />
          <Tooltip content={<TrendTooltip />} cursor={{ fill: "#f8fafc", radius: 6 }} />
          <Legend
            iconType="circle" iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
            formatter={(value) => <span style={{ fontSize: 11, color: "#6b7280" }}>{value}</span>}
          />
          <Bar dataKey="jobs"    name="Jobs"             fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="freight" name="Freight Invoices" fill="#06b6d4" radius={[4, 4, 0, 0]} />
          <Bar dataKey="trade"   name="Trade Invoices"   fill="#a855f7" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── System Failure Rate — area + line combo ───────────────── */
function FailureRateChart({ data }) {
  const chartData = data ?? FAILURE_RATE_DATA;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-[15px] font-[700] text-gray-900">System Failure Rate</h3>
      <p className="text-[12px] text-gray-400 mb-4">Percentage of failed processing over time</p>
      <ResponsiveContainer width="100%" height={230}>
        <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="gradFailure" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor="#ef4444" stopOpacity={0.18} />
              <stop offset="90%" stopColor="#ef4444" stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
            domain={[0, 3]} tickCount={5}
            label={{ value: "Failure Rate (%)", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "#9ca3af" }, dx: 14, dy: 55 }}
          />
          <Tooltip content={<FailureTooltip />} />
          <Area
            type="monotone" dataKey="rate"
            fill="url(#gradFailure)" stroke="none"
          />
          <Line
            type="monotone" dataKey="rate"
            stroke="#ef4444" strokeWidth={2.5}
            dot={{ r: 5, fill: "#ef4444", strokeWidth: 2.5, stroke: "#fff" }}
            activeDot={{ r: 7, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Main Finance Dashboard ──────────────────────────────────── */
export default function FinanceDashboard() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(null);
  const [filter, setFilter]   = useState("all");

  // ── Live metrics from API ──────────────────────────────────────
  const [apiMetrics,    setApiMetrics]    = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  const loadMetrics = useCallback(async () => {
    setMetricsLoading(true);
    try {
      const res = await axiosInstance.get("/invoice-processing/metrics");
      const payload = res.data?.data ?? res.data;
      setApiMetrics(payload);
    } catch (err) {
      console.error("[FinanceDashboard] metrics error:", err?.response?.data?.detail ?? err.message);
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  useEffect(() => {
    const role = typeof window !== "undefined" ? localStorage.getItem("userRole") || "" : "";
    setAllowed(isAllowedRole(role));
    loadMetrics();
  }, [loadMetrics]);

  // ── Derive KPI values: live API first, then static fallback ───
  const sc  = apiMetrics?.summary_cards;
  const sd  = apiMetrics?.status_distribution ?? [];
  const ptApi = apiMetrics?.processing_trend  ?? [];
  const frApi = apiMetrics?.failure_rate       ?? [];

  const staticKpi  = KPI_DATA[filter] ?? KPI_DATA["all"];
  const kpi = sc
    ? {
        jobs:     { value: sc.total_jobs.count,             trend: sc.total_jobs.change_pct,     freight: sc.total_jobs.freight,     trade: sc.total_jobs.trade     },
        invoices: { value: sc.total_invoices.count,         trend: sc.total_invoices.change_pct, freight: sc.total_invoices.freight, trade: sc.total_invoices.trade },
        amount:   { value: sc.total_amount_processed.formatted, note: sc.total_amount_processed.period_label },
        failed:   { value: sc.failed_invoices.count, system: sc.failed_invoices.system, data: sc.failed_invoices.data, backend: sc.failed_invoices.backend },
      }
    : staticKpi;

  // ── Job status pie — live if available ────────────────────────
  const STATUS_COLOR = { SUCCESS: "#22c55e", FAILED: "#ef4444", PARTIAL: "#f97316" };
  const jobStatusData = sd.length
    ? sd.map((d) => ({ name: d.status.charAt(0) + d.status.slice(1).toLowerCase(), value: d.pct, fill: STATUS_COLOR[d.status] ?? "#6366f1" }))
    : JOB_STATUS_DATA;

  // ── Processing trend — live if available ─────────────────────
  const processingTrend = ptApi.length
    ? ptApi.map((d) => ({ period: d.bucket, jobs: d.jobs, freight: d.freight_invoices, trade: d.trade_invoices }))
    : PROCESSING_TREND;

  // ── Failure rate — live if available ─────────────────────────
  const failureRateData = frApi.length
    ? frApi.map((d) => ({ date: d.bucket, rate: d.rate_pct }))
    : FAILURE_RATE_DATA;

  const filterLabel = FILTER_OPTIONS.find((f) => f.value === filter)?.label ?? "All";

  if (allowed === null || metricsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-2 text-[13px] text-gray-500">
        <RefreshCw className="h-4 w-4 animate-spin text-blue-500" /> Loading…
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 border border-red-100">
          <ShieldOff className="h-8 w-8 text-red-400" />
        </div>
        <div className="text-center">
          <h2 className="text-[17px] font-[700] text-gray-900">Access Restricted</h2>
          <p className="text-[13px] text-gray-500 mt-1">
            The Finance dashboard is available to <span className="font-semibold text-gray-700">Finance</span> and{" "}
            <span className="font-semibold text-gray-700">Super Admin</span> roles only.
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="rounded-xl bg-gray-900 px-5 py-2 text-[13px] font-[600] text-white hover:bg-gray-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 bg-[#f4f5f7] min-h-screen">

      {/* ── Filter bar — label left, select+chevron right ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 flex items-center justify-between">
        <div>
          <p className="text-[15px] font-[700] text-gray-900">Filter Data</p>
          <p className="text-[12px] text-gray-400 mt-0.5">Select time period for metrics</p>
        </div>
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="appearance-none rounded-xl border border-gray-200 bg-white pl-4 pr-9 py-2.5 text-[13px] text-gray-700 font-[500] focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-sm min-w-[120px]"
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* 1 — Total Jobs Processed — blue */}
        <KpiCard
          icon={Mail}
          tone="blue"
          title="Total Jobs Processed"
          main={kpi.jobs.value}
          trend={kpi.jobs.trend}
          subItems={[
            { icon: Mail,     count: kpi.jobs.freight, label: "Freight" },
            { icon: FileText, count: kpi.jobs.trade,   label: "Trade"   },
          ]}
        />

        {/* 2 — Total Invoices — green */}
        <KpiCard
          icon={FileText}
          tone="green"
          title="Total Invoices"
          main={kpi.invoices.value}
          trend={kpi.invoices.trend}
          subItems={[
            { icon: Mail,     count: kpi.invoices.freight, label: "Freight" },
            { icon: FileText, count: kpi.invoices.trade,   label: "Trade"   },
          ]}
        />

        {/* 3 — Total Amount Processed — purple */}
        <KpiCard
          icon={DollarSign}
          tone="purple"
          title="Total Amount Processed"
          main={kpi.amount.value}
          badge={kpi.amount.note}
          subItems={[]}
        />

        {/* 4 — Invoices Failed Processing — teal */}
        <KpiCard
          icon={XCircle}
          tone="teal"
          title="Invoices Failed Processing"
          main={kpi.failed.value}
          subItems={[
            { icon: Server,    count: kpi.failed.system,  label: "System"  },
            { icon: Database,  count: kpi.failed.data,    label: "Data"    },
            { icon: HardDrive, count: kpi.failed.backend, label: "Backend" },
          ]}
        />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <JobStatusChart data={jobStatusData} />
        <ProcessingTrendChart filterLabel={filterLabel} data={processingTrend} />
        <FailureRateChart data={failureRateData} />
      </div>
    </div>
  );
}

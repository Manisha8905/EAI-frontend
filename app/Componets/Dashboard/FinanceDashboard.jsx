"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
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
  Search,
  ChevronLeft,
  ChevronRight,
  Truck,
  Package,
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
  const [filter, setFilter]           = useState("all");
  const [reportingTab, setReportingTab] = useState("jobs");

  // ── Live metrics from API ──────────────────────────────────────
  const [apiMetrics,    setApiMetrics]    = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  // ── Jobs Reporting state ───────────────────────────────────────
  const [jobSearch,    setJobSearch]    = useState("");
  const [jobType,      setJobType]      = useState("");
  const [jobStatus,    setJobStatus]    = useState("");
  const [jobDateRange, setJobDateRange] = useState("last_30_days");
  const [jobPage,      setJobPage]      = useState(1);
  const PAGE_SIZE = 20;
  const [jobsData,       setJobsData]       = useState([]);
  const [jobsSummary,    setJobsSummary]    = useState(null);
  const [jobsTotal,      setJobsTotal]      = useState(0);
  const [jobsTotalPages, setJobsTotalPages] = useState(1);
  const [jobsLoading,    setJobsLoading]    = useState(false);
  const [jobsError,      setJobsError]      = useState(null);

  // Keep refs so loadJobs always reads latest filter values
  const jobSearchRef    = useRef("");
  const jobTypeRef      = useRef("");
  const jobStatusRef    = useRef("");
  const jobDateRangeRef = useRef("last_30_days");
  const jobPageRef      = useRef(1);

  const loadMetrics = useCallback(async (period) => {
    setMetricsLoading(true);
    try {
      const res = await axiosInstance.get("/invoice-processing/metrics", {
        params: { period },
      });
      const payload = res.data?.data ?? res.data;
      setApiMetrics(payload);
    } catch (err) {
      const msg = err?.response?.data?.detail ?? err?.message ?? "Failed to load finance metrics.";
      toast.error(msg, { toastId: "finance-dashboard-metrics-error" });
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  useEffect(() => {
    const role = typeof window !== "undefined" ? localStorage.getItem("userRole") || "" : "";
    setAllowed(isAllowedRole(role));
    loadMetrics(filter);
  }, [loadMetrics]);

  useEffect(() => {
    loadMetrics(filter);
  }, [filter, loadMetrics]);

  // ── Jobs Reporting loader — reads from refs, always fresh ────────
  const loadJobs = useCallback(async () => {
    const search    = jobSearchRef.current;
    const type      = jobTypeRef.current;
    const status    = jobStatusRef.current;
    const dateRange = jobDateRangeRef.current;
    const page      = jobPageRef.current;

    setJobsLoading(true);
    setJobsError(null);
    try {
      const params = {
        date_range: dateRange,
        page,
        page_size: PAGE_SIZE,
        ...(search ? { search } : {}),
        ...(type   ? { type }   : {}),
        ...(status ? { status } : {}),
      };
      const res = await axiosInstance.get("/invoice-processing/reporting/jobs", { params });
      const payload = res.data?.data ?? res.data;
      const items =
        payload?.items   ??
        payload?.jobs    ??
        payload?.results ??
        (Array.isArray(payload) ? payload : []);
      const total      = payload?.total ?? payload?.total_count ?? items.length;
      const totalPages = payload?.total_pages ?? payload?.pages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));
      setJobsData(Array.isArray(items) ? items : []);
      setJobsTotal(total);
      setJobsTotalPages(totalPages);
      // summary cards: prefer API-provided summary, else derive from items
      if (payload?.summary) {
        setJobsSummary(payload.summary);
      } else {
        const all = Array.isArray(items) ? items : [];
        setJobsSummary({
          total,
          successful: all.filter(j => (j.status||'').toLowerCase() === 'success').length,
          partial:    all.filter(j => (j.status||'').toLowerCase() === 'partial').length,
          failed:     all.filter(j => (j.status||'').toLowerCase() === 'failed').length,
        });
      }
    } catch (err) {
      const msg = err?.response?.data?.detail ?? err?.message ?? "Failed to load jobs.";
      setJobsError(msg);
      toast.error(msg);
      setJobsData([]);
    } finally {
      setJobsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => { loadJobs(); }, [loadJobs]);

  // ── Filter handlers — only update state/refs, NO auto API call ──
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setJobSearch(val);
    jobSearchRef.current = val;
  };
  const handleTypeChange = (e) => {
    const val = e.target.value;
    setJobType(val);
    jobTypeRef.current = val;
  };
  const handleStatusChange = (e) => {
    const val = e.target.value;
    setJobStatus(val);
    jobStatusRef.current = val;
  };
  const handleDateRangeChange = (e) => {
    const val = e.target.value;
    setJobDateRange(val);
    jobDateRangeRef.current = val;
  };

  // ── Apply button / Enter key — reset to page 1 and call API ────
  const handleApplyFilters = () => {
    jobPageRef.current = 1;
    setJobPage(1);
    loadJobs();
  };

  const handlePageChange = (newPage) => {
    jobPageRef.current = newPage;
    setJobPage(newPage);
    loadJobs();
  };

  // ── Freight Invoices state ──────────────────────────────────────
  const [freightSearch,     setFreightSearch]     = useState("");
  const [freightStatus,     setFreightStatus]     = useState("");
  const [freightDateRange,  setFreightDateRange]  = useState("last_30_days");
  const [freightPage,       setFreightPage]       = useState(1);
  const FREIGHT_PAGE_SIZE = 20;
  const [freightData,       setFreightData]       = useState([]);
  const [freightSummary,    setFreightSummary]    = useState(null);
  const [freightTotal,      setFreightTotal]      = useState(0);
  const [freightTotalPages, setFreightTotalPages] = useState(1);
  const [freightLoading,    setFreightLoading]    = useState(false);
  const [freightError,      setFreightError]      = useState(null);

  const freightSearchRef    = useRef("");
  const freightStatusRef    = useRef("");
  const freightDateRangeRef = useRef("last_30_days");
  const freightPageRef      = useRef(1);

  // ── Freight Invoices loader ─────────────────────────────────────
  const loadFreightInvoices = useCallback(async () => {
    const search    = freightSearchRef.current;
    const status    = freightStatusRef.current;
    const dateRange = freightDateRangeRef.current;
    const page      = freightPageRef.current;

    setFreightLoading(true);
    setFreightError(null);
    try {
      const params = {
        date_range: dateRange,
        page,
        page_size: FREIGHT_PAGE_SIZE,
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
      };
      const res = await axiosInstance.get("/invoice-processing/reporting/freight-invoices", { params });
      const payload = res.data?.data ?? res.data;
      const items =
        payload?.items    ??
        payload?.invoices ??
        payload?.results  ??
        (Array.isArray(payload) ? payload : []);
      const total      = payload?.total ?? payload?.total_count ?? items.length;
      const totalPages = payload?.total_pages ?? payload?.pages ?? Math.max(1, Math.ceil(total / FREIGHT_PAGE_SIZE));
      setFreightData(Array.isArray(items) ? items : []);
      setFreightTotal(total);
      setFreightTotalPages(totalPages);
      const summary = payload?.summary ?? null;
      setFreightSummary(summary ? summary : {
        total,
        sf_synced:    payload?.sf_synced    ?? payload?.synced ?? 0,
        sf_failed:    payload?.sf_failed    ?? payload?.failed ?? 0,
        total_amount: payload?.total_amount ?? null,
      });
    } catch (err) {
      const msg = err?.response?.data?.detail ?? err?.message ?? "Failed to load freight invoices.";
      setFreightError(msg);
      toast.error(msg);
      setFreightData([]);
    } finally {
      setFreightLoading(false);
    }
  }, []);

  useEffect(() => { loadFreightInvoices(); }, [loadFreightInvoices]);

  // ── Freight filter handlers ─────────────────────────────────────
  const handleFreightSearchChange = (e) => {
    const val = e.target.value;
    setFreightSearch(val);
    freightSearchRef.current = val;
  };
  const handleFreightStatusChange = (e) => {
    const val = e.target.value;
    setFreightStatus(val);
    freightStatusRef.current = val;
  };
  const handleFreightDateRangeChange = (e) => {
    const val = e.target.value;
    setFreightDateRange(val);
    freightDateRangeRef.current = val;
  };
  const handleApplyFreightFilters = () => {
    freightPageRef.current = 1;
    setFreightPage(1);
    loadFreightInvoices();
  };
  const handleFreightPageChange = (newPage) => {
    freightPageRef.current = newPage;
    setFreightPage(newPage);
    loadFreightInvoices();
  };

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

      {/* ── Reporting Section — Tabbed ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Tab bar */}
        <div className="flex items-end gap-0 border-b border-gray-200 px-5 pt-4 overflow-x-auto">
          {[
            { id: "jobs",      label: "Jobs",             icon: Mail      },
            { id: "freight",   label: "Freight Invoices", icon: Truck     },
            { id: "trade",     label: "Trade Invoices",   icon: Package   },
            { id: "reprocess", label: "Reprocess",        icon: RefreshCw },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setReportingTab(tab.id)}
              className={`flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-[600] whitespace-nowrap border-b-2 -mb-px transition-all ${
                reportingTab === tab.id
                  ? "text-blue-700 border-blue-500 bg-blue-50/60"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══ JOBS TAB ═══════════════════════════════════════════ */}
        {reportingTab === "jobs" && (
          <>
            {/* Mini KPI summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-b border-gray-100">
              {[
                { label: "Total Jobs",  value: jobsSummary?.total      ?? jobsTotal, color: "bg-blue-600" },
                { label: "Successful",  value: jobsSummary?.successful ?? "—",       color: "bg-green-500" },
                { label: "Partial",     value: jobsSummary?.partial    ?? "—",       color: "bg-orange-500" },
                { label: "Failed",      value: jobsSummary?.failed     ?? "—",       color: "bg-red-500" },
              ].map((card, i) => (
                <div key={i} className={`${card.color} flex flex-col justify-between p-5 text-white ${i < 3 ? "border-r border-white/20" : ""}`}>
                  <p className="text-[11px] font-[700] uppercase tracking-widest text-white/80">{card.label}</p>
                  <p className="text-[40px] font-bold leading-none mt-2">{jobsLoading ? "…" : card.value}</p>
                </div>
              ))}
            </div>

            {/* Filter bar */}
            <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search jobs…"
                  value={jobSearch}
                  onChange={handleSearchChange}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
                  className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                />
              </div>
              <div className="relative">
                <select value={jobStatus} onChange={handleStatusChange}
                  className="appearance-none rounded-xl border border-gray-200 bg-white pl-4 pr-8 py-2 text-[13px] text-gray-700 font-[500] focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-sm">
                  <option value="">All Status</option>
                  <option value="success">Success</option>
                  <option value="partial">Partial</option>
                  <option value="failed">Failed</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <div className="relative">
                <select value={jobDateRange} onChange={handleDateRangeChange}
                  className="appearance-none rounded-xl border border-gray-200 bg-white pl-4 pr-8 py-2 text-[13px] text-gray-700 font-[500] focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-sm">
                  <option value="last_7_days">Last 7 Days</option>
                  <option value="last_30_days">Last 30 Days</option>
                  <option value="last_90_days">Last 90 Days</option>
                  <option value="all">All</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <button onClick={handleApplyFilters} disabled={jobsLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 text-[13px] font-[600] transition shadow-sm">
                {jobsLoading ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Applying…</> : "Apply Filters"}
              </button>
              <button onClick={() => loadJobs()} title="Refresh"
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-gray-400">
                <RefreshCw className={`h-4 w-4 ${jobsLoading ? "animate-spin text-blue-400" : ""}`} />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Job ID","Email Subject","Sender","Type","Carrier / Vendor","Attachments","Status","Created At"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-[700] uppercase tracking-wider text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {jobsLoading ? (
                    <tr><td colSpan={8} className="px-5 py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <RefreshCw className="h-4 w-4 animate-spin text-blue-400" /> Loading jobs…
                      </div>
                    </td></tr>
                  ) : jobsError ? (
                    <tr><td colSpan={8} className="px-5 py-12 text-center text-red-400 text-[13px]">{jobsError}</td></tr>
                  ) : jobsData.length === 0 ? (
                    <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-[13px]">No jobs found for the selected filters.</td></tr>
                  ) : jobsData.map((job, idx) => {
                    const statusVal = (job.status || "").toLowerCase();
                    const statusCls =
                      statusVal === "success" ? "bg-green-50 text-green-700 border border-green-200" :
                      statusVal === "failed"  ? "bg-red-50 text-red-700 border border-red-200" :
                      statusVal === "partial" ? "bg-orange-50 text-orange-700 border border-orange-200" :
                      "bg-gray-100 text-gray-600";
                    const typeVal = (job.type || "").toLowerCase();
                    const typeCls = typeVal === "freight" ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : typeVal === "trade" ? "bg-purple-50 text-purple-700 border border-purple-200"
                      : "bg-gray-100 text-gray-600";
                    const failedAtt = job.failed_attachments ?? job.attachments_failed ?? 0;
                    const totalAtt  = job.attachments_count  ?? job.total_attachments  ?? job.attachments ?? 0;
                    return (
                      <tr key={job.id ?? job.job_id ?? idx} className="border-b border-gray-50 hover:bg-gray-50/60 transition">
                        <td className="px-4 py-3.5 font-[700] text-blue-600">#{job.id ?? job.job_id ?? idx + 1}</td>
                        <td className="px-4 py-3.5 text-gray-800 font-[500] max-w-[200px] truncate">{job.email_subject ?? job.subject ?? "—"}</td>
                        <td className="px-4 py-3.5 text-gray-500">{job.sender ?? job.sender_email ?? job.from_email ?? "—"}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-[700] capitalize ${typeCls}`}>{job.type ?? "—"}</span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-700 font-[500]">{job.carrier ?? job.vendor ?? job.carrier_vendor ?? "—"}</td>
                        <td className="px-4 py-3.5">
                          {totalAtt > 0 ? (
                            <span className="text-gray-700">{totalAtt}{failedAtt > 0 && <span className="text-red-500 font-[600] ml-1">({failedAtt} failed)</span>}</span>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-[700] capitalize ${statusCls}`}>{job.status ?? "—"}</span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-400 whitespace-nowrap">
                          {job.created_at || job.date ? new Date(job.created_at ?? job.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!jobsLoading && jobsTotalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
                <p className="text-[12px] text-gray-400">
                  Showing {((jobPage - 1) * PAGE_SIZE) + 1}–{Math.min(jobPage * PAGE_SIZE, jobsTotal)} of {jobsTotal} jobs
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => handlePageChange(Math.max(1, jobPage - 1))} disabled={jobPage === 1}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: jobsTotalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === jobsTotalPages || Math.abs(p - jobPage) <= 1)
                    .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i-1] > 1) acc.push("…"); acc.push(p); return acc; }, [])
                    .map((item, i) => item === "…"
                      ? <span key={`je${i}`} className="px-2 text-[12px] text-gray-400">…</span>
                      : <button key={item} onClick={() => handlePageChange(item)}
                          className={`min-w-[32px] h-8 rounded-lg text-[12px] font-[600] border transition ${jobPage === item ? "bg-blue-500 text-white border-blue-500" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{item}</button>
                    )}
                  <button onClick={() => handlePageChange(Math.min(jobsTotalPages, jobPage + 1))} disabled={jobPage === jobsTotalPages}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══ FREIGHT INVOICES TAB ══════════════════════════════ */}
        {reportingTab === "freight" && (
          <>
            {/* Freight KPI cards — matches screenshot */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-b border-gray-100">
              {[
                { label: "Total Freight Invoices", value: freightSummary?.total      ?? freightTotal, color: "bg-blue-600" },
                { label: "SF Synced",              value: freightSummary?.sf_synced  ?? "—",          color: "bg-green-500" },
                { label: "SF Failed",              value: freightSummary?.sf_failed  ?? "—",          color: "bg-red-500" },
                {
                  label: "Total Amount",
                  value: freightSummary?.total_amount_fmt
                    ?? (freightSummary?.total_amount != null
                      ? `$${Number(freightSummary.total_amount).toLocaleString()}`
                      : "—"),
                  color: "bg-amber-500",
                },
              ].map((card, i) => (
                <div key={i} className={`${card.color} flex flex-col justify-between p-5 text-white ${i < 3 ? "border-r border-white/20" : ""}`}>
                  <p className="text-[11px] font-[700] uppercase tracking-widest text-white/80">{card.label}</p>
                  <p className="text-[40px] font-bold leading-none mt-2">{freightLoading ? "…" : card.value}</p>
                </div>
              ))}
            </div>

            {/* Filter bar */}
            <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search freight invoices…"
                  value={freightSearch}
                  onChange={handleFreightSearchChange}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyFreightFilters()}
                  className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                />
              </div>
              <div className="relative">
                <select value={freightStatus} onChange={handleFreightStatusChange}
                  className="appearance-none rounded-xl border border-gray-200 bg-white pl-4 pr-8 py-2 text-[13px] text-gray-700 font-[500] focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-sm">
                  <option value="">All Status</option>
                  <option value="success">Success</option>
                  <option value="partial">Partial</option>
                  <option value="failed">Failed</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <div className="relative">
                <select value={freightDateRange} onChange={handleFreightDateRangeChange}
                  className="appearance-none rounded-xl border border-gray-200 bg-white pl-4 pr-8 py-2 text-[13px] text-gray-700 font-[500] focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-sm">
                  <option value="last_7_days">Last 7 Days</option>
                  <option value="last_30_days">Last 30 Days</option>
                  <option value="last_90_days">Last 90 Days</option>
                  <option value="all">All</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <button onClick={handleApplyFreightFilters} disabled={freightLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 text-[13px] font-[600] transition shadow-sm">
                {freightLoading ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Applying…</> : "Apply Filters"}
              </button>
              <button onClick={() => loadFreightInvoices()} title="Refresh"
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-gray-400">
                <RefreshCw className={`h-4 w-4 ${freightLoading ? "animate-spin text-blue-400" : ""}`} />
              </button>
            </div>

            {/* Header */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50">
                <Truck className="h-4 w-4 text-blue-500" />
              </span>
              <div>
                <p className="text-[14px] font-[700] text-gray-900">Freight Invoices</p>
                <p className="text-[11px] text-gray-400">Shipping and carrier invoices (UPS, FedEx, SAIA, etc.)</p>
              </div>
            </div>

            {/* Table — columns match reference screenshot */}
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Attachment","Vendor Name","Invoice Number","Invoice Date","Invoice Due Date","PO / SO Number","Description","Freight Amount","Status"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-[700] uppercase tracking-wider text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {freightLoading ? (
                    <tr><td colSpan={9} className="px-5 py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <RefreshCw className="h-4 w-4 animate-spin text-blue-400" /> Loading freight invoices…
                      </div>
                    </td></tr>
                  ) : freightError ? (
                    <tr><td colSpan={9} className="px-5 py-12 text-center text-red-400 text-[13px]">{freightError}</td></tr>
                  ) : freightData.length === 0 ? (
                    <tr><td colSpan={9} className="px-5 py-12 text-center text-gray-400 text-[13px]">No freight invoices found for the selected filters.</td></tr>
                  ) : freightData.map((inv, idx) => {
                    const statusVal = (inv.status || "").toLowerCase();
                    const statusCls =
                      statusVal === "success"   ? "bg-green-50 text-green-700 border border-green-200" :
                      statusVal === "failed"    ? "bg-red-50 text-red-700 border border-red-200" :
                      statusVal === "partial"   ? "bg-orange-50 text-orange-700 border border-orange-200" :
                      statusVal === "pending"   ? "bg-yellow-50 text-yellow-700 border border-yellow-200" :
                      statusVal === "processed" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                      "bg-gray-100 text-gray-600";
                    const invoiceDate   = inv.invoice_date ?? inv.date ?? inv.created_at;
                    const invoiceDueDate = inv.due_date ?? inv.invoice_due_date ?? inv.payment_due_date;
                    const freightAmt    = inv.freight_amount ?? inv.amount ?? inv.total_amount;
                    return (
                      <tr key={inv.id ?? inv.invoice_number ?? idx} className="border-b border-gray-50 hover:bg-gray-50/60 transition">
                        <td className="px-4 py-3.5 text-gray-500">
                          {inv.attachment ?? inv.file_name ?? inv.attachment_name
                            ? <span className="inline-flex items-center gap-1 text-blue-600 font-[500]">
                                <Package className="h-3.5 w-3.5" />
                                {inv.attachment ?? inv.file_name ?? inv.attachment_name}
                              </span>
                            : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3.5 text-gray-800 font-[500]">{inv.vendor_name ?? inv.vendor ?? inv.carrier ?? "—"}</td>
                        <td className="px-4 py-3.5 font-[700] text-blue-600">{inv.invoice_number ?? inv.invoice_no ?? "—"}</td>
                        <td className="px-4 py-3.5 text-gray-400 whitespace-nowrap">
                          {invoiceDate ? new Date(invoiceDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td className="px-4 py-3.5 text-gray-400 whitespace-nowrap">
                          {invoiceDueDate ? new Date(invoiceDueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td className="px-4 py-3.5 text-gray-600">{inv.po_number ?? inv.so_number ?? inv.po_so_number ?? "—"}</td>
                        <td className="px-4 py-3.5 text-gray-500 max-w-[180px] truncate">{inv.description ?? inv.invoice_description ?? "—"}</td>
                        <td className="px-4 py-3.5 text-gray-800 font-[600]">
                          {freightAmt != null
                            ? `$${Number(freightAmt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          {inv.status
                            ? <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-[700] capitalize ${statusCls}`}>{inv.status}</span>
                            : <span className="text-gray-400">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!freightLoading && freightTotalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
                <p className="text-[12px] text-gray-400">
                  Showing {((freightPage - 1) * FREIGHT_PAGE_SIZE) + 1}–{Math.min(freightPage * FREIGHT_PAGE_SIZE, freightTotal)} of {freightTotal} invoices
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleFreightPageChange(Math.max(1, freightPage - 1))} disabled={freightPage === 1}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: freightTotalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === freightTotalPages || Math.abs(p - freightPage) <= 1)
                    .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i-1] > 1) acc.push("…"); acc.push(p); return acc; }, [])
                    .map((item, i) => item === "…"
                      ? <span key={`fe${i}`} className="px-2 text-[12px] text-gray-400">…</span>
                      : <button key={item} onClick={() => handleFreightPageChange(item)}
                          className={`min-w-[32px] h-8 rounded-lg text-[12px] font-[600] border transition ${freightPage === item ? "bg-blue-500 text-white border-blue-500" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{item}</button>
                    )}
                  <button onClick={() => handleFreightPageChange(Math.min(freightTotalPages, freightPage + 1))} disabled={freightPage === freightTotalPages}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══ TRADE INVOICES TAB — placeholder ══════════════════ */}
        {reportingTab === "trade" && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
            <Package className="h-10 w-10 text-gray-200" />
            <p className="text-[14px] font-[600] text-gray-500">Trade Invoices</p>
            <p className="text-[12px]">Coming soon — API endpoint not yet wired.</p>
          </div>
        )}

        {/* ═══ REPROCESS TAB — placeholder ════════════════════════ */}
        {reportingTab === "reprocess" && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
            <RefreshCw className="h-10 w-10 text-gray-200" />
            <p className="text-[14px] font-[600] text-gray-500">Reprocess</p>
            <p className="text-[12px]">Coming soon — API endpoint not yet wired.</p>
          </div>
        )}

      </div>

    </div>
  );
}

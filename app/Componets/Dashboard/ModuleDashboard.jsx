"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  fetchOutboundCalls,
  fetchInboundCalls,
  fetchEmailCampaigns,
  fetchLinkedinCampaigns,
} from "../../Redux/actions/authActions";
import { fetchWhatsappMetrics } from "../../Redux/actions/whatsappMetricsActions";
import axiosInstance from "../../Redux/axiosInstance";
import {
  ArrowUpRight,
  Calendar,
  CheckSquare,
  Clock,
  Phone,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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
    calls: { today: 312, week: 1840, month: 7420, trend: "+11%" },
    meetings: { today: 34, week: 198, month: 812, trend: "+9%" },
    tasks: { today: 58, week: 341, month: 1560, trend: "+6%" },
    duration: "4.8",
    barChart: {
      title: "Outbound Calls by Region",
      label: "Calls",
      data: [
        { x: "N. America", v: 520 },
        { x: "Europe", v: 480 },
        { x: "Asia Pac.", v: 390 },
        { x: "Lat. Am.", v: 280 },
        { x: "Mid. East", v: 180 },
      ],
    },
    donut: { title: "Call Conversion Rate", resolved: 72, label: "Converted" },
  },
  inbound: {
    calls: { today: 156, week: 892, month: 3245, trend: "+8%" },
    meetings: { today: 23, week: 134, month: 567, trend: "+12%" },
    tasks: { today: 45, week: 267, month: 1234, trend: "+5%" },
    duration: "4.5",
    barChart: {
      title: "Inbound Calls by Hour",
      label: "Calls",
      data: [
        { x: "8 AM", v: 42 },
        { x: "9 AM", v: 78 },
        { x: "10 AM", v: 95 },
        { x: "11 AM", v: 110 },
        { x: "12 PM", v: 88 },
        { x: "2 PM", v: 104 },
        { x: "3 PM", v: 91 },
        { x: "4 PM", v: 63 },
      ],
    },
    donut: { title: "Call Resolution Rate", resolved: 68, label: "Resolved" },
  },
  email: {
    calls: { today: 234, week: 1456, month: 5890, trend: "+15%" },
    meetings: { today: 18, week: 112, month: 445, trend: "+9%" },
    tasks: { today: 34, week: 198, month: 876, trend: "+7%" },
    duration: "3.2",
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
        { x: "Sun", v: 95 },
      ],
    },
    donut: { title: "Email Open Rate", resolved: 45, label: "Opened" },
  },
  linkedin: {
    calls: { today: 78, week: 520, month: 2140, trend: "+12%" },
    meetings: { today: 24, week: 142, month: 610, trend: "+11%" },
    tasks: { today: 92, week: 560, month: 2290, trend: "+14%" },
    duration: "2.8",
    barChart: {
      title: "LinkedIn Outreach by Day",
      label: "Connections",
      data: [
        { x: "Mon", v: 210 },
        { x: "Tue", v: 240 },
        { x: "Wed", v: 280 },
        { x: "Thu", v: 300 },
        { x: "Fri", v: 320 },
        { x: "Sat", v: 120 },
        { x: "Sun", v: 85 },
      ],
    },
    donut: { title: "Connection Rate", resolved: 56, label: "Accepted" },
  },
  whatsapp: {
    calls: { today: 112, week: 820, month: 3240, trend: "+18%" },
    meetings: { today: 42, week: 288, month: 1140, trend: "+16%" },
    tasks: { today: 134, week: 490, month: 1950, trend: "+13%" },
    duration: "1.7",
    barChart: {
      title: "WhatsApp Messages by Day",
      label: "Messages",
      data: [
        { x: "Mon", v: 240 },
        { x: "Tue", v: 310 },
        { x: "Wed", v: 290 },
        { x: "Thu", v: 330 },
        { x: "Fri", v: 370 },
        { x: "Sat", v: 150 },
        { x: "Sun", v: 98 },
      ],
    },
    donut: { title: "Response Rate", resolved: 62, label: "Replies" },
  },
};

const tabs = [
  { key: "outbound", label: "Outbound Calls" },
  { key: "inbound", label: "Inbound Calls" },
  { key: "email", label: "Email Campaign" },
  { key: "linkedin", label: "LinkedIn Campaign" },
  { key: "whatsapp", label: "WhatsApp Campaign" },
];

function normalizeTab(initialTab) {
  if (initialTab === "inbound" || initialTab === "Inbound Calls")
    return "inbound";
  if (initialTab === "email" || initialTab === "Email Campaign") return "email";
  if (initialTab === "linkedin" || initialTab === "LinkedIn Campaign")
    return "linkedin";
  if (initialTab === "whatsapp" || initialTab === "WhatsApp Campaign")
    return "whatsapp";
  return "outbound";
}

function getDeliverabilityCounts(payload) {
  const pickNum = (...vals) => {
    for (const value of vals) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
    return null;
  };

  const walk = (obj, keys) => {
    if (!obj || typeof obj !== "object") return null;
    for (const key of keys) {
      const direct = pickNum(obj?.[key]);
      if (direct !== null) return direct;
    }
    for (const value of Object.values(obj)) {
      if (value && typeof value === "object") {
        const nested = walk(value, keys);
        if (nested !== null) return nested;
      }
    }
    return null;
  };

  const inbox = walk(payload, [
    "inbox",
    "inbox_count",
    "delivered",
    "inbox_emails",
    "healthy",
    "healthy_count",
    "healthy_mailboxes",
  ]);
  const spam = walk(payload, [
    "spam",
    "spam_count",
    "spam_emails",
    "junk",
    "unhealthy",
    "unhealthy_count",
    "unhealthy_mailboxes",
    "at_risk",
    "at_risk_count",
    "at_risk_mailboxes",
    "failed",
    "failed_count",
  ]);
  const total = walk(payload, [
    "total",
    "total_count",
    "emails_total",
    "mailboxes_total",
    "total_mailboxes",
    "mailboxes_count",
  ]);

  const safeInbox = inbox ?? 0;
  const safeSpam = spam ?? 0;
  const safeTotal = total ?? safeInbox + safeSpam;

  return {
    inbox: safeInbox,
    spam: safeSpam,
    total: safeTotal,
  };
}

/* ─── Custom bar tooltip ───────────────────────────────────────── */
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-2.5 text-[12px]">
      <p className="font-semibold text-gray-600 mb-1">{label}</p>
      <p className="text-indigo-600 font-bold text-[15px]">
        {payload[0].value}
        <span className="text-[11px] font-normal text-gray-400 ml-1">
          calls
        </span>
      </p>
    </div>
  );
};

const CampaignComparisonTooltip = ({
  active,
  payload,
  label,
  valueLabels = {},
  order = [],
  showTitle = true,
}) => {
  if (!active || !payload?.length) return null;

  const row = payload[0]?.payload ?? {};
  const title = row.campaignName ?? label;
  const sortedPayload = payload.slice().sort((a, b) => {
    const ia = order.indexOf(a.dataKey);
    const ib = order.indexOf(b.dataKey);
    const sa = ia === -1 ? Number.MAX_SAFE_INTEGER : ia;
    const sb = ib === -1 ? Number.MAX_SAFE_INTEGER : ib;
    return sa - sb;
  });

  return (
    <div className="bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-3 text-[12px] min-w-[180px]">
      {showTitle && (
        <p className="font-semibold text-gray-700 mb-2 break-words">{title}</p>
      )}
      <div className="space-y-1.5">
        {sortedPayload.map((entry) => (
          <div
            key={entry.dataKey}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-500 truncate">
                {valueLabels[entry.dataKey] ?? entry.name}
              </span>
            </div>
            <span className="font-bold text-gray-800">{entry.value ?? 0}</span>
          </div>
        ))}
      </div>
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
              { name: label, value: resolved },
              { name: "Other", value: remaining },
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
        <span className="text-[28px] font-bold text-gray-900 leading-none">
          {resolved}%
        </span>
        <span className="text-[12px] text-green-600 font-semibold mt-1">
          {label}
        </span>
      </div>
    </div>
  );
}

/* ─── KPI card ─────────────────────────────────────────────────── */
function KpiCard({
  gradient,
  shadow,
  icon: Icon,
  trend,
  title,
  today,
  week,
  month,
}) {
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

/* ─── Call-outcome colours ────────────────────────────────────── */
const OUTCOME_COLORS = ["#ef4444", "#f97316", "#3b82f6", "#22c55e", "#9ca3af"];

/* ─── Multi-slice outcomes pie (side legend) ────────────────────── */
function OutcomesPieChart({ data, totalOverride = null }) {
  const totalLeadsEntry = data.find((entry) => entry.name === "Total Leads");
  const chartData = data;
  const computedTotal = chartData.reduce(
    (sum, entry) => sum + Number(entry.call_count ?? 0),
    0,
  );
  const rawTotal = Number(totalOverride);
  const totalLeadsValue = Number(totalLeadsEntry?.call_count);
  const total =
    Number.isFinite(totalLeadsValue) && totalLeadsValue > 0
      ? totalLeadsValue
      : Number.isFinite(rawTotal) && rawTotal > 0
        ? rawTotal
        : computedTotal;
  const chartDataWithPct = chartData.map((entry) => {
    const count = Number(entry.call_count ?? 0);
    const pct = total > 0 ? Number(((count / total) * 100).toFixed(2)) : 0;
    return {
      ...entry,
      call_count: count,
      percentage: pct,
    };
  });
  const outsideLegendData = chartDataWithPct.filter(
    (entry) => entry.name !== "Total Leads",
  );
  return (
    <div className="flex items-center gap-4 w-full">
      {/* Donut */}
      <div className="relative shrink-0" style={{ width: 170, height: 170 }}>
        <ResponsiveContainer width={170} height={170}>
          <PieChart>
            <Pie
              data={chartDataWithPct}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={76}
              dataKey="call_count"
              nameKey="name"
              strokeWidth={0}
              stroke="none"
            >
              {chartDataWithPct.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={
                    entry.fill ?? OUTCOME_COLORS[index % OUTCOME_COLORS.length]
                  }
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} calls`, name]}
              contentStyle={{
                fontSize: 12,
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 14px rgba(0,0,0,0.07)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[22px] font-extrabold text-gray-900 leading-none">
            {total}
          </span>
          <span className="text-[9px] font-semibold text-gray-400 mt-0.5 uppercase tracking-widest">
            {totalLeadsEntry ? "Total Leads" : "Total"}
          </span>
        </div>
      </div>
      {/* Legend rows */}
      <div className="flex-1 flex flex-col gap-2.5 min-w-0">
        {outsideLegendData.map((entry, index) => {
          const color =
            entry.fill ?? OUTCOME_COLORS[index % OUTCOME_COLORS.length];
          return (
            <div key={entry.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-sm shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[11px] text-gray-500 truncate">
                    {entry.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="text-[12px] font-bold text-gray-800 tabular-nums">
                    {entry.call_count}
                  </span>
                  <span
                    className="text-[10px] font-semibold rounded-full px-2 py-0.5 tabular-nums"
                    style={{ backgroundColor: color + "1a", color }}
                  >
                    {entry.percentage}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(entry.percentage, 100)}%`,
                    backgroundColor: color,
                    transition: "width 0.7s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Sentiment colours ───────────────────────────────────────── */
const SENTIMENT_COLORS = {
  Interested: "#22c55e",
  Neutral: "#6b7280",
  "Not Interested": "#ef4444",
};

/* ─── Area tooltip ─────────────────────────────────────────────── */
const AreaTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-2.5 text-[12px]">
      <p className="font-semibold text-gray-600 mb-1">{label}</p>
      <p className="text-violet-600 font-bold text-[15px]">
        {payload[0].value}
        <span className="text-[11px] font-normal text-gray-400 ml-1">
          calls
        </span>
      </p>
    </div>
  );
};

const formatCallDuration = (valueInMinutes) => {
  const minutes = Number(valueInMinutes);
  if (!Number.isFinite(minutes) || minutes <= 0) return "0 sec";
  if (minutes < 1) {
    const rawSeconds = minutes * 60;
    const roundedSeconds = rawSeconds.toFixed(2);
    const normalizedSeconds = roundedSeconds
      .replace(/(\.\d*?[1-9])0+$/, "$1")
      .replace(/\.00$/, "");
    return `${normalizedSeconds} sec`;
  }
  const rounded = minutes.toFixed(minutes < 10 ? 2 : 1);
  const normalizedMinutes = rounded
    .replace(/(\.\d*?[1-9])0+$/, "$1")
    .replace(/\.00$/, ".0");
  return `${normalizedMinutes} min`;
};

/* ─── Shared chart card wrapper ──────────────────────────────────────── */
function ChartCard({ title, subtitle, badge, children, onClick }) {
  return (
    <article
      className={`rounded-2xl bg-white border shadow-md overflow-hidden transition-all${
        onClick
          ? " border-gray-200 hover:border-teal-300 hover:shadow-lg cursor-pointer group"
          : " border-gray-100"
      }`}
      onClick={onClick}
    >
      {/* Accent top stripe */}
      <div className="h-[3px] bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-400" />
      <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-gray-100 bg-gradient-to-r from-slate-50/60 to-white">
        <div className="min-w-0">
          <h3 className="text-[13px] font-bold text-gray-800 leading-tight tracking-tight">
            {title}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 ml-3 shrink-0">
          {badge && (
            <span className="rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-[10px] font-bold text-indigo-600 tabular-nums">
              {badge}
            </span>
          )}
          {onClick && (
            <span className="flex items-center gap-1 rounded-full bg-teal-50 border border-teal-100 px-2.5 py-1 text-[10px] font-semibold text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
              View Report <ArrowUpRight className="h-3 w-3" />
            </span>
          )}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </article>
  );
}

/* ─── Sentiment progress-bar rows ───────────────────────────────────── */
function SentimentBars({ data }) {
  const SENT_COLORS = {
    Interested: "#22c55e",
    Neutral: "#6b7280",
    "Not Interested": "#ef4444",
  };
  return (
    <div className="flex flex-col gap-5 mt-1">
      {data.map((item) => {
        const color = SENT_COLORS[item.name] ?? "#6b7280";
        return (
          <div key={item.name}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[13px] font-medium text-gray-700">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-gray-900 tabular-nums">
                  {item.value}
                </span>
                <span
                  className="text-[11px] font-semibold rounded-full px-2.5 py-0.5 tabular-nums"
                  style={{ backgroundColor: color + "15", color }}
                >
                  {item.percentage}%
                </span>
              </div>
            </div>
            <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: color,
                  transition: "width 0.8s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Ranked reasons list with progress bars ───────────────────────────── */
function ReasonsChart({ data }) {
  const REASON_COLORS = ["#8b5cf6", "#6366f1", "#3b82f6", "#14b8a6", "#f97316"];
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex flex-col gap-4 mt-1">
      {data.map((item, i) => {
        const pct = Math.round((item.count / max) * 100);
        const color = REASON_COLORS[i % REASON_COLORS.length];
        const label = item.reason === "null" ? "Others" : item.reason;
        return (
          <div key={item.reason}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {i + 1}
                </span>
                <span
                  className="text-[11px] text-gray-700 truncate"
                  title={label}
                >
                  {label}
                </span>
              </div>
              <span
                className="shrink-0 ml-2 text-[11px] font-bold tabular-nums rounded-md px-2 py-0.5"
                style={{ backgroundColor: color + "15", color }}
              >
                {item.count}
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: color,
                  transition: "width 0.8s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Filter options ────────────────────────────────────────────── */
const filterOptions = [
  { key: "this_year", label: "This Year" },
  { key: "this_quarter", label: "This Quarter" },
  { key: "this_month", label: "This Month" },
  { key: "this_week", label: "This Week" },
  { key: "today", label: "Today" },
];

/* ─── Main component ───────────────────────────────────────────── */
export default function ModuleDashboard({
  moduleName = "Sales",
  initialTab = "Outbound Calls",
}) {
  const dispatch = useDispatch();
  const {
    outboundData,
    outboundLoading,
    inboundData,
    inboundLoading,
    emailData,
    emailLoading,
    linkedinData,
    linkedinLoading,
  } = useSelector((state) => state.admin);

  const router = useRouter();

  const [activeTab, setActiveTab] = useState(normalizeTab(initialTab));
  const [activeFilter, setActiveFilter] = useState("this_year");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [emailDeliverabilityDashboard, setEmailDeliverabilityDashboard] =
    useState(null);
  const [emailDeliverabilityLoading, setEmailDeliverabilityLoading] =
    useState(false);

  const fetchEmailDeliverabilityDashboard = async () => {
    setEmailDeliverabilityLoading(true);
    try {
      const res = await axiosInstance.get(
        "/api/deliverability/smartlead/mailboxes/health-dashboard",
      );
      setEmailDeliverabilityDashboard(res.data);
    } catch (_err) {
      setEmailDeliverabilityDashboard(null);
    } finally {
      setEmailDeliverabilityLoading(false);
    }
  };

  // Fetch outbound calls whenever tab is "outbound" or filter changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const rawToken = localStorage.getItem("session_token");
    const token = (rawToken || "").trim();
    const isTokenValid = Boolean(
      token && token !== "undefined" && token !== "null",
    );

    if (!isTokenValid) {
      router.replace("/login");
      return;
    }

    if (activeTab === "outbound") {
      dispatch(fetchOutboundCalls(activeFilter));
    }
    if (activeTab === "inbound") {
      dispatch(fetchInboundCalls(activeFilter));
    }
    if (activeTab === "email") {
      dispatch(fetchEmailCampaigns(activeFilter));
      fetchEmailDeliverabilityDashboard();
    }
    if (activeTab === "linkedin") {
      dispatch(fetchLinkedinCampaigns(activeFilter));
    }
    if (activeTab === "whatsapp") {
      dispatch(fetchWhatsappMetrics({ filter: activeFilter }));
    }
  }, [activeTab, activeFilter, dispatch, router]);

  // WhatsApp metrics from Redux
  const whatsappMetrics = useSelector((state) => state.whatsappMetrics);
  const whatsappData = whatsappMetrics?.data || {};
  const whatsappLoading = whatsappMetrics?.loading;
  const whatsappError = whatsappMetrics?.error;

  // Map WhatsApp API response to UI fields
  const whatsappSm = whatsappData.summary_metrics || {};
  const whatsappKpi = {
    calls: {
      today: whatsappSm.messages_sent_today,
      week: whatsappSm.messages_sent_this_week,
      month: whatsappSm.messages_sent_this_month,
      trend: "", // You can calculate trend if available
    },
    meetings: {
      today: whatsappSm.meetings_scheduled_today,
      week: whatsappSm.meetings_scheduled_this_week,
      month: whatsappSm.meetings_scheduled_this_month,
      trend: "",
    },
    tasks: {
      today: whatsappSm.delivered_today,
      week: whatsappSm.delivered_this_week,
      month: whatsappSm.delivered_this_month,
      trend: "",
    },
    duration: whatsappSm.avg_time_to_first_reply_hours,
    donut: {
      title: "Response Rate",
      resolved: whatsappSm.reply_rate_percent || 0,
      label: "Replies",
    },
    barChart: {
      title: "WhatsApp Messages by Month",
      label: "Messages",
      data: (whatsappData.monthly_trend || []).map((item) => ({
        x: item.month,
        v: item.messages_sent,
      })),
    },
  };

  const d = activeTab === "whatsapp" ? whatsappKpi : tabData[activeTab];

  // summary_metrics from real API response
  const sm =
    activeTab === "outbound" && outboundData?.summary_metrics
      ? outboundData.summary_metrics
      : activeTab === "inbound" && inboundData?.summary_metrics
        ? inboundData.summary_metrics
        : null;

  const emailSm =
    activeTab === "email" && emailData?.summary_metrics
      ? emailData.summary_metrics
      : null;

  const linkedinSm =
    activeTab === "linkedin" && linkedinData?.summary_metrics
      ? linkedinData.summary_metrics
      : null;

  const apiTotalCalls =
    activeTab === "outbound"
      ? outboundData?.total_calls
      : activeTab === "inbound"
        ? inboundData?.total_calls
        : null;

  const emailTotalLeads = Number(
    emailSm?.total_leads ??
      emailData?.total_leads ??
      emailSm?.leads_targeted_total ??
      emailData?.leads_targeted_total ??
      emailSm?.unique_recipients ??
      emailData?.unique_recipients ??
      0,
  );

  // Loading flag
  const isLoading =
    (outboundLoading && activeTab === "outbound") ||
    (inboundLoading && activeTab === "inbound") ||
    (emailLoading && activeTab === "email") ||
    (linkedinLoading && activeTab === "linkedin");

  // ── KPI card values ────────────────────────────────────────────
  // Card 1: Calls Processed (calls) / Total Leads (email) / Connections Sent (linkedin)
  const calls = linkedinSm
    ? {
        today: linkedinSm.connections_sent_today,
        week: linkedinSm.connections_sent_this_week,
        month: linkedinSm.connections_sent_this_month,
        trend: `${linkedinSm.connections_sent_total ?? linkedinData?.total_connections ?? 0} total`,
      }
    : emailSm
      ? {
          today:
            emailSm.total_leads_today ??
            emailSm.leads_targeted_today ??
            emailSm.unique_recipients_today ??
            emailSm.emails_sent_today,
          week:
            emailSm.total_leads_this_week ??
            emailSm.leads_targeted_this_week ??
            emailSm.unique_recipients_this_week ??
            emailSm.emails_sent_this_week,
          month:
            emailSm.total_leads_this_month ??
            emailSm.leads_targeted_this_month ??
            emailSm.unique_recipients_this_month ??
            emailSm.emails_sent_this_month,
          trend: `${emailTotalLeads} total`,
        }
      : sm
        ? {
            today: sm.calls_processed_today,
            week: sm.calls_processed_this_week,
            month: sm.calls_processed_this_month,
            trend: `${apiTotalCalls} total`,
          }
        : d.calls;

  // Card 2: Meetings Scheduled / Connections Accepted (linkedin)
  const meetings = linkedinSm
    ? {
        today: linkedinSm.connections_accepted_today,
        week: linkedinSm.connections_accepted_this_week,
        month: linkedinSm.connections_accepted_this_month,
        trend: `${linkedinSm.connections_accepted_total ?? 0} total`,
      }
    : emailSm
      ? {
          today: emailSm.meetings_scheduled_today,
          week: emailSm.meetings_scheduled_this_week,
          month: emailSm.meetings_scheduled_this_month,
          trend: d.meetings.trend,
        }
      : sm
        ? {
            today: sm.meetings_scheduled_today,
            week: sm.meetings_scheduled_this_week,
            month: sm.meetings_scheduled_this_month,
            trend: d.meetings.trend,
          }
        : d.meetings;

  // Card 3: Tasks Created (calls) / Leads Engaged (email) / Meetings Scheduled (linkedin)
  const tasks = linkedinSm
    ? {
        today: linkedinSm.meetings_scheduled_today,
        week: linkedinSm.meetings_scheduled_this_week,
        month: linkedinSm.meetings_scheduled_this_month,
        trend: `${linkedinSm.meetings_scheduled_total ?? 0} total`,
      }
    : emailSm
      ? {
          today:
            emailSm.leads_engaged_today ??
            emailSm.engaged_leads_today ??
            emailSm.responses_received_today,
          week:
            emailSm.leads_engaged_this_week ??
            emailSm.engaged_leads_this_week ??
            emailSm.responses_received_this_week,
          month:
            emailSm.leads_engaged_this_month ??
            emailSm.engaged_leads_this_month ??
            emailSm.responses_received_this_month,
          trend: `${Number(emailSm.leads_engaged_total ?? emailSm.engaged_leads_total ?? emailData?.leads_engaged_total ?? emailData?.engaged_leads_total ?? 0)} total`,
        }
      : sm
        ? {
            today: sm.tasks_created_today,
            week: sm.tasks_created_this_week,
            month: sm.tasks_created_this_month,
            trend: d.tasks.trend,
          }
        : d.tasks;

  const emailSentTotal = Number(
    emailSm?.emails_sent_total ??
      emailSm?.emails_sent ??
      emailData?.emails_sent_total ??
      emailData?.total_sent ??
      (Array.isArray(emailData?.email_performance_by_month)
        ? emailData.email_performance_by_month.reduce(
            (sum, item) => sum + Number(item.email_count ?? 0),
            0,
          )
        : 0) ??
      0,
  );

  // LinkedIn-specific: replies received card data
  const linkedinReplies = linkedinSm
    ? {
        today: linkedinSm.replies_received_today,
        week: linkedinSm.replies_received_this_week,
        month: linkedinSm.replies_received_this_month,
        trend: `${linkedinSm.replies_received_total ?? 0} total`,
      }
    : null;

  // WhatsApp-specific: replies received card data
  const whatsappReplies = activeTab === "whatsapp"
    ? {
        today: whatsappSm.replies_received_today,
        week: whatsappSm.replies_received_this_week,
        month: whatsappSm.replies_received_this_month,
        trend: "",
      }
    : null;

  // LinkedIn avg time metrics
  const linkedinAvgAcceptance = linkedinSm?.avg_time_to_acceptance_hours ?? 0;
  const linkedinAvgFirstReply = linkedinSm?.avg_time_to_first_reply_hours ?? 0;

  // Card 4: Avg Call Duration / Avg Emails per Lead / Avg Response Time (linkedin)
  const duration = linkedinSm
    ? (linkedinSm.avg_response_time_hours ??
      linkedinSm.average_response_time ??
      0)
    : emailSm
      ? emailTotalLeads > 0
        ? Number((emailSentTotal / emailTotalLeads).toFixed(2))
        : Number(
            emailSm.average_emails_per_lead ??
              emailData?.average_emails_per_lead ??
              0,
          )
      : sm
        ? sm.average_call_duration
        : d.duration;
  const durationDisplay =
    activeTab === "email" || activeTab === "linkedin"
      ? duration
      : formatCallDuration(duration);
  const donut = d.donut;

  // ── Chart data ─────────────────────────────────────────────────
  const shortMonth = (m) =>
    m
      .replace("January", "Jan")
      .replace("February", "Feb")
      .replace("March", "Mar")
      .replace("April", "Apr")
      .replace("June", "Jun")
      .replace("July", "Jul")
      .replace("August", "Aug")
      .replace("September", "Sep")
      .replace("October", "Oct")
      .replace("November", "Nov")
      .replace("December", "Dec");

  const barChartData =
    activeTab === "outbound" && outboundData?.campaign_performance_by_month
      ? outboundData.campaign_performance_by_month.map((item) => ({
          x: shortMonth(item.month),
          v: item.call_count,
        }))
      : activeTab === "inbound" && inboundData?.total_calls_by_month
        ? inboundData.total_calls_by_month.map((item) => ({
            x: shortMonth(item.month),
            v: item.call_count,
          }))
        : activeTab === "email" && emailData?.email_performance_by_month
          ? emailData.email_performance_by_month.map((item) => ({
              x: shortMonth(item.month),
              v: item.email_count,
            }))
          : d.barChart.data;

  const barChartTitle =
    activeTab === "outbound"
      ? "Campaign Performance by Month"
      : activeTab === "inbound"
        ? "Total Inbound Calls by Month"
        : activeTab === "email"
          ? "Email Performance by Month"
          : d.barChart.title;

  const barChartLabel =
    activeTab === "email"
      ? "Emails"
      : activeTab === "outbound" || activeTab === "inbound"
        ? "Calls"
        : d.barChart.label;

  // Right chart: outcomes (outbound) / sentiment (inbound + email)
  const outcomesData =
    activeTab === "outbound" && outboundData?.call_outcomes_distribution
      ? outboundData.call_outcomes_distribution
      : null;

  const sentimentData =
    activeTab === "inbound" && inboundData?.sentiment_analysis
      ? inboundData.sentiment_analysis
      : activeTab === "email" && emailData?.sentiment_analysis
        ? emailData.sentiment_analysis
        : null;

  // ── Outbound-specific chart data ───────────────────────────────
  const outboundSentiment =
    outboundData?.sentiment_analysis_distribution ?? null;

  const outboundReasons = outboundData?.reason_for_interest_distribution
    ? Object.entries(outboundData.reason_for_interest_distribution)
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count)
    : null;

  const outboundMeetingCampaign = outboundData?.meeting_schedule_by_campaign
    ? outboundData.meeting_schedule_by_campaign.map((item) => ({
        name:
          item.campaign_name.length > 14
            ? item.campaign_name.slice(0, 14) + "\u2026"
            : item.campaign_name,
        calls: item.total_calls,
        meetings: item.meetings_scheduled,
      }))
    : null;

  const callDurationData = outboundData?.call_duration_distribution
    ? outboundData.call_duration_distribution.map((item) => ({
        x: item.duration,
        v: item.call_count,
      }))
    : null;

  const sentimentChartData =
    outboundSentiment?.map((s) => ({
      name: s.sentiment,
      value: s.call_count,
      percentage: s.percentage,
    })) ?? [];

  // ── Inbound-specific chart data ────────────────────────────────
  // IB chart 1: calls by month — API may return total_calls_by_month or campaign_performance_by_month
  const inboundCallsMonthly = (() => {
    const src =
      inboundData?.total_calls_by_month ??
      inboundData?.campaign_performance_by_month;
    return src
      ? src.map((item) => ({ x: shortMonth(item.month), v: item.call_count }))
      : null;
  })();

  // IB chart 2: use call_duration_distribution for the distribution donut (has {duration, call_count})
  // compute percentages on-the-fly so OutcomesPieChart receives {name, call_count, percentage}
  const inboundOutcomes = (() => {
    if (inboundData?.call_duration_distribution) {
      const total =
        inboundData.call_duration_distribution.reduce(
          (s, d) => s + d.call_count,
          0,
        ) || 1;
      return inboundData.call_duration_distribution.map((item) => ({
        name: item.duration,
        call_count: item.call_count,
        percentage: parseFloat(((item.call_count / total) * 100).toFixed(2)),
      }));
    }
    return inboundData?.call_outcomes_distribution ?? null;
  })();

  // IB chart 3: meetings by month (inbound uses meeting_schedule_by_month, not by_campaign)
  const inboundMeetingCampaign = inboundData?.meeting_schedule_by_month
    ? inboundData.meeting_schedule_by_month.map((item) => ({
        name: shortMonth(item.month),
        calls: item.total_calls,
        meetings: item.meetings_scheduled,
      }))
    : inboundData?.meeting_schedule_by_campaign
      ? inboundData.meeting_schedule_by_campaign.map((item) => ({
          name:
            item.campaign_name.length > 14
              ? item.campaign_name.slice(0, 14) + "\u2026"
              : item.campaign_name,
          calls: item.total_calls,
          meetings: item.meetings_scheduled,
        }))
      : null;

  // IB chart 4: call duration distribution
  const inboundDurationData = inboundData?.call_duration_distribution
    ? inboundData.call_duration_distribution.map((item) => ({
        x: item.duration,
        v: item.call_count,
      }))
    : null;

  // IB chart 5: sentiment — API returns `sentiment_analysis` with call_count
  const inboundSentimentArr =
    (
      inboundData?.sentiment_analysis_distribution ??
      inboundData?.sentiment_analysis
    )?.map((s) => ({
      name: s.sentiment,
      value: s.call_count,
      percentage: s.percentage,
    })) ?? [];

  // IB chart 6: top interested reasons — API returns array [{reason, count}], not an object
  const inboundReasons = inboundData?.top_interested_reasons?.length
    ? inboundData.top_interested_reasons
        .map((item) => ({ reason: item.reason, count: item.count }))
        .sort((a, b) => b.count - a.count)
    : inboundData?.reason_for_interest_distribution &&
        Object.keys(inboundData.reason_for_interest_distribution).length
      ? Object.entries(inboundData.reason_for_interest_distribution)
          .map(([reason, count]) => ({ reason, count }))
          .sort((a, b) => b.count - a.count)
      : null;

  // ── Email-specific chart data ──────────────────────────────────
  // EM chart 1: email performance by month
  const emailMonthly = emailData?.email_performance_by_month
    ? emailData.email_performance_by_month.map((item) => ({
        x: shortMonth(item.month),
        v: item.email_count,
      }))
    : null;

  // EM chart 2: email outcomes (mapped for pie chart)
  const pickCount = (...values) => {
    for (const value of values) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
    return 0;
  };

  const emailOutcomesApi =
    emailData?.email_outcomes ?? emailData?.[" "] ?? null;

  const cardTotalLeads = pickCount(
    emailOutcomesApi?.total_leads,
    emailSm?.total_leads,
    emailData?.total_leads,
    emailSm?.leads_targeted_total,
    emailData?.leads_targeted_total,
    emailSm?.unique_recipients,
    emailData?.unique_recipients,
    emailTotalLeads,
  );

  const cardSent = pickCount(
    emailOutcomesApi?.delivered,
    emailSm?.emails_sent_total,
    emailSm?.emails_sent,
    emailData?.emails_sent_total,
    emailData?.total_sent,
    emailSentTotal,
  );

  const cardSkipped = pickCount(
    emailOutcomesApi?.skipped,
    emailSm?.emails_skipped_total,
    emailSm?.skipped_total,
    emailSm?.emails_skipped,
    emailData?.emails_skipped_total,
    emailData?.skipped_total,
    emailData?.emails_skipped,
    emailData?.skipped,
  );

  const cardFailed = pickCount(
    emailOutcomesApi?.failed,
    emailSm?.emails_failed_total,
    emailSm?.failed_total,
    emailSm?.emails_failed,
    emailData?.emails_failed_total,
    emailData?.failed_total,
    emailData?.emails_failed,
    emailData?.failed,
  );

  const cardReplies = pickCount(
    emailOutcomesApi?.leads_engaged,
    emailSm?.leads_engaged_total,
    emailSm?.engaged_leads_total,
    emailSm?.responses_received_total,
    emailData?.leads_engaged_total,
    emailData?.engaged_leads_total,
    emailData?.responses_received_total,
    emailData?.total_replied,
    emailData?.total_replies,
  );

  const mappedEmailOutcomes = [
    { name: "Total Leads", value: cardTotalLeads, fill: "#6366f1" },
    { name: "Delivered", value: cardSent, fill: "#1d4ed8" },
    { name: "Skipped", value: cardSkipped, fill: "#93c5fd" },
    { name: "Failed", value: cardFailed, fill: "#3b82f6" },
    { name: "Leads Engaged", value: cardReplies, fill: "#16a34a" },
  ];

  const emailOutcomesTotal = mappedEmailOutcomes.reduce(
    (sum, item) => sum + item.value,
    0,
  );
  const emailOutcomes =
    cardTotalLeads > 0 || emailOutcomesTotal > 0
      ? mappedEmailOutcomes.map((item) => ({
          name: item.name,
          call_count: item.value,
          percentage:
            cardTotalLeads > 0
              ? Number(((item.value / cardTotalLeads) * 100).toFixed(2))
              : 0,
          fill: item.fill,
        }))
      : null;

  // EM chart 3: meetings — compare total leads vs meetings per campaign
  const emailMeetingCampaign =
    (emailData?.meeting_schedule_by_emails ??
    emailData?.meeting_schedule_by_campaign)
      ? (
          emailData.meeting_schedule_by_emails ??
          emailData.meeting_schedule_by_campaign
        ).map((item) => ({
          campaignName: item.campaign_name,
          name:
            item.campaign_name.length > 16
              ? item.campaign_name.slice(0, 16) + "\u2026"
              : item.campaign_name,
          leads:
            item.total_leads ??
            item.lead_count ??
            item.leads_targeted ??
            item.unique_recipients ??
            item.recipients_count ??
            item.contacts_count ??
            item.email_count ??
            0,
          meetings: item.meetings_scheduled,
        }))
      : null;

  // EM chart 4: avg responses per email — API returns per-campaign array
  // {campaign_name, avg_response_rate, unique_recipients_responded, emails_sent_to_responders}
  const emailResponsesData = emailData?.avg_responses_per_email?.length
    ? emailData.avg_responses_per_email.map((item) => ({
        x:
          item.campaign_name.length > 16
            ? item.campaign_name.slice(0, 16) + "\u2026"
            : item.campaign_name,
        v: item.avg_response_rate,
      }))
    : emailData?.email_performance_by_month
      ? emailData.email_performance_by_month.map((item) => ({
          x: shortMonth(item.month),
          v: item.response_count ?? item.responses_received ?? item.email_count,
        }))
      : null;

  // EM chart 5: sentiment — API returns `sentiment_analysis` with call_count
  const emailSentimentArr =
    (
      emailData?.sentiment_analysis_distribution ??
      emailData?.sentiment_analysis
    )?.map((s) => ({
      name: s.sentiment,
      value: s.call_count ?? s.email_count ?? 0,
      percentage: s.percentage,
    })) ?? [];

  // EM chart 6: top interested reasons — API returns array [{reason, count}], not an object
  const emailReasons = emailData?.top_interested_reasons?.length
    ? emailData.top_interested_reasons
        .map((item) => ({ reason: item.reason, count: item.count }))
        .sort((a, b) => b.count - a.count)
    : emailData?.reason_for_interest_distribution &&
        Object.keys(emailData.reason_for_interest_distribution ?? {}).length
      ? Object.entries(emailData.reason_for_interest_distribution)
          .map(([reason, count]) => ({ reason, count }))
          .sort((a, b) => b.count - a.count)
      : null;

  // ── LinkedIn-specific chart data ───────────────────────────────

  // LI chart 1: monthly trend (connections_sent, dms_sent, replies_received)
  const linkedinMonthly = (() => {
    const src =
      linkedinData?.monthly_trend ??
      linkedinData?.campaign_performance_by_month ??
      null;
    if (!src) return null;
    return src.map((item) => ({
      x: shortMonth(item.month),
      connections_sent:
        item.connections_sent ?? item.connection_count ?? item.count ?? 0,
      dms_sent: item.dms_sent ?? 0,
      replies_received: item.replies_received ?? 0,
    }));
  })();

  // LI chart 2: funnel stages
  const linkedinFunnel = linkedinData?.funnel?.length
    ? linkedinData.funnel.map((item) => ({
        stage: item.stage,
        count: item.count ?? 0,
      }))
    : null;

  // LI chart 3: connection status distribution (pie)
  const linkedinOutcomes = (() => {
    const src =
      linkedinData?.connection_status_distribution ??
      linkedinData?.connection_outcomes_distribution ??
      linkedinData?.outcomes_distribution ??
      null;
    if (!src || !src.length) return null;
    const total = src.reduce((s, d) => s + (d.call_count ?? d.count ?? 0), 1);
    return src.map((item) => ({
      name: item.status ?? item.name ?? item.outcome ?? "Unknown",
      call_count: item.call_count ?? item.count ?? 0,
      percentage:
        item.percentage ??
        parseFloat(
          (((item.call_count ?? item.count ?? 0) / total) * 100).toFixed(2),
        ),
    }));
  })();

  // LI chart 4: intent distribution (pie)
  const linkedinIntent = (() => {
    const src = linkedinData?.intent_distribution ?? null;
    if (!src || !src.length) return null;
    const total = src.reduce((s, d) => s + (d.count ?? 0), 1);
    return src.map((item) => ({
      name: item.intent ?? item.name ?? "Unknown",
      call_count: item.count ?? 0,
      percentage: parseFloat((((item.count ?? 0) / total) * 100).toFixed(2)),
    }));
  })();

  // LI chart 5: meetings by campaign
  const linkedinMeetingCampaign = (() => {
    const src =
      linkedinData?.meetings_by_campaign ??
      linkedinData?.meeting_schedule_by_campaign ??
      linkedinData?.meeting_schedule_by_linkedin ??
      null;
    if (!src) return null;
    return src.map((item) => {
      const raw = item.campaign_name ?? item.name ?? "";
      return {
        campaignName: raw,
        name: raw.length > 16 ? raw.slice(0, 16) + "\u2026" : raw,
        connections:
          item.total_connections ??
          item.connections_sent ??
          item.total_leads ??
          0,
        meetings: item.meetings_scheduled ?? item.count ?? 0,
      };
    });
  })();

  // LI chart 6: sentiment distribution
  const linkedinSentimentArr = (() => {
    const src =
      linkedinData?.sentiment_distribution ??
      linkedinData?.sentiment_analysis_distribution ??
      linkedinData?.sentiment_analysis ??
      null;
    if (!src || !src.length) return [];
    const total = src.reduce((s, d) => s + (d.call_count ?? d.count ?? 0), 1);
    return src.map((s) => ({
      name: s.sentiment ?? s.name ?? "Unknown",
      value: s.call_count ?? s.count ?? 0,
      percentage:
        s.percentage ??
        parseFloat((((s.call_count ?? s.count ?? 0) / total) * 100).toFixed(2)),
    }));
  })();

  // LI chart 7 (legacy): top interested reasons
  const linkedinReasons = linkedinData?.top_interested_reasons?.length
    ? linkedinData.top_interested_reasons
        .map((item) => ({ reason: item.reason, count: item.count }))
        .sort((a, b) => b.count - a.count)
    : linkedinData?.reason_for_interest_distribution &&
        Object.keys(linkedinData.reason_for_interest_distribution ?? {}).length
      ? Object.entries(linkedinData.reason_for_interest_distribution)
          .map(([reason, count]) => ({ reason, count }))
          .sort((a, b) => b.count - a.count)
      : null;

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (activeTab === "outbound") {
      dispatch(fetchOutboundCalls(activeFilter));
    }
    if (activeTab === "inbound") {
      dispatch(fetchInboundCalls(activeFilter));
    }
    if (activeTab === "email") {
      dispatch(fetchEmailCampaigns(activeFilter));
      fetchEmailDeliverabilityDashboard();
    }
    if (activeTab === "linkedin") {
      dispatch(fetchLinkedinCampaigns(activeFilter));
    }
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <main className="min-h-[calc(100vh-60px)] bg-[#f4f5f7] p-6">
      {/* ── Toolbar ── */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-xl bg-white border border-gray-200 p-1 shadow-sm">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            // const isDisabled = tab.key === "linkedin" || tab.key === "whatsapp";

            return (
              <button
                key={tab.key}
                // onClick={() => !isDisabled && setActiveTab(tab.key)}
                onClick={() => setActiveTab(tab.key)}
                type="button"
                // disabled={isDisabled}
                className={`rounded-lg px-4 py-2 text-[13px] font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-violet-400/30"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                  {/* //   isDisabled
                //     ? "text-gray-300 cursor-not-allowed"
                //     : isActive
                //       ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-violet-400/30"
                //       : "text-gray-500 hover:bg-gray-100 hover:text-gray-800" */}
               
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400/30"
          >
            {filterOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            aria-label="Refresh"
            onClick={handleRefresh}
            className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 transition shadow-sm"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <section className={`mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 ${(activeTab === "linkedin" || activeTab === "whatsapp") ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
        {/* {activeTab === "whatsapp" && whatsappLoading && <div>Loading WhatsApp metrics...</div>}
        {activeTab === "whatsapp" && whatsappError && <div className="text-red-500">{whatsappError}</div>} */}

        {/* Card 1: Calls Processed / Total Leads */}
        <KpiCard
          gradient="border bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg"
          shadow="shadow-lg shadow-indigo-400/25"
          icon={
            activeTab === "email" || activeTab === "linkedin" ? Users : Phone
          }
          trend={calls.trend}
          title={
            activeTab === "email"
              ? "Total Leads"
              : activeTab === "linkedin"
                ? "Connections Sent"
                : activeTab === "whatsapp"
                  ? "Messages Sent"
                  : "Calls Processed"
          }
          today={isLoading ? "…" : calls.today}
          week={isLoading ? "…" : calls.week}
          month={isLoading ? "…" : calls.month}
        />

        {/* Meetings / Responses */}
        <KpiCard
          gradient="border bg-gradient-to-br from-green-500 to-green-600 text-white border-none shadow-lg"
          shadow="shadow-lg shadow-teal-400/25"
          icon={Calendar}
          trend={meetings.trend}
          title={
            activeTab === "linkedin"
              ? "Connections Accepted"
              : activeTab === "whatsapp"
                ? "Meetings Scheduled"
                : "Meetings Scheduled"
          }
          today={isLoading ? "…" : meetings.today}
          week={isLoading ? "…" : meetings.week}
          month={isLoading ? "…" : meetings.month}
        />

        {/* Card 3: Tasks / Engagement / Meetings Scheduled (linkedin) */}
        <KpiCard
          gradient="border bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-lg"
          shadow="shadow-lg shadow-purple-400/25"
          icon={CheckSquare}
          trend={tasks.trend}
          title={
            activeTab === "email"
              ? "Leads Engaged"
              : activeTab === "linkedin"
                ? "Meetings Scheduled"
                : activeTab === "whatsapp"
                  ? "Delivered"
                  : "Tasks Created"
          }
          today={isLoading ? "…" : tasks.today}
          week={isLoading ? "…" : tasks.week}
          month={isLoading ? "…" : tasks.month}
        />

        {/* Card 4 (LinkedIn / WhatsApp): Replies Received */}
        {(activeTab === "linkedin" || activeTab === "whatsapp") && (
          <KpiCard
            gradient="border bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none shadow-lg"
            shadow="shadow-lg shadow-orange-400/25"
            icon={ArrowUpRight}
            trend={activeTab === "linkedin" ? (linkedinReplies?.trend ?? "0 total") : ""}
            title="Replies Received"
            today={isLoading ? "…" : (activeTab === "linkedin" ? linkedinReplies?.today : whatsappReplies?.today) ?? 0}
            week={isLoading ? "…" : (activeTab === "linkedin" ? linkedinReplies?.week : whatsappReplies?.week) ?? 0}
            month={isLoading ? "…" : (activeTab === "linkedin" ? linkedinReplies?.month : whatsappReplies?.month) ?? 0}
          />
        )}

        {/* Card 5: Avg time / Avg emails / LinkedIn avg times */}
        <article className="rounded-2xl border bg-gradient-to-br from-teal-500 to-teal-600 text-white border-none shadow-lg shadow-sky-400/25 p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold">
              {activeTab === "email" ? "per lead" : "avg. time"}
            </span>
          </div>
          {activeTab === "linkedin" ? (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70 mb-2">
                Avg Time Metrics
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] text-white/60">To Acceptance</p>
                  <p className="text-[24px] font-bold leading-none">
                    {isLoading ? "…" : `${linkedinAvgAcceptance}h`}
                  </p>
                </div>
                <div className="border-t border-white/20 pt-2">
                  <p className="text-[10px] text-white/60">To First Reply</p>
                  <p className="text-[24px] font-bold leading-none">
                    {isLoading ? "…" : `${linkedinAvgFirstReply}h`}
                  </p>
                </div>
              </div>
            </>
          ) : activeTab === "whatsapp" ? (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70 mb-2">
                Avg Time to First Reply
              </p>
              <p className="text-[36px] font-bold leading-none">
                {isLoading ? "…" : whatsappSm.avg_time_to_first_reply_hours != null
                  ? `${whatsappSm.avg_time_to_first_reply_hours}h`
                  : "N/A"}
              </p>
              <p className="text-[12px] text-white/60 mt-1">hours to first reply</p>
            </>
          ) : (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70 mb-2">
                {activeTab === "email" ? "Avg Emails / Lead" : "Avg Call Duration"}
              </p>
              <p className="text-[36px] font-bold leading-none">
                {isLoading ? "…" : durationDisplay}
              </p>
              <p className="text-[12px] text-white/60 mt-1">
                {activeTab === "email" ? "Emails per lead" : "minutes per call"}
              </p>
            </>
          )}
        </article>
      </section>

      {/* ── Charts ── */}
      {activeTab === "outbound" && outboundData ? (
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* 1 ── Campaign Performance by Month */}
          <ChartCard
            title="Campaign Performance by Month"
            subtitle="Monthly outbound call volume trend"
            badge={`${outboundData.total_calls} total`}
          >
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={barChartData}
                  margin={{ top: 8, right: 8, bottom: 0, left: -10 }}
                >
                  <defs>
                    <linearGradient
                      id="areaGradTop"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#6366f1"
                        stopOpacity={0.45}
                      />
                      <stop
                        offset="60%"
                        stopColor="#8b5cf6"
                        stopOpacity={0.15}
                      />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="x"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    dy={4}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                  />
                  <Tooltip
                    content={<AreaTooltip />}
                    cursor={{
                      stroke: "#e0e7ff",
                      strokeWidth: 1,
                      strokeDasharray: "4 2",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#areaGradTop)"
                    dot={{
                      fill: "#fff",
                      r: 4,
                      strokeWidth: 2,
                      stroke: "#6366f1",
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#6366f1",
                      stroke: "#c7d2fe",
                      strokeWidth: 3,
                    }}
                    name="Calls"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* 2 ── Call Outcomes Distribution */}
          <ChartCard
            title="Call Outcomes Distribution"
            subtitle="Breakdown of every call result"
            badge={`${outboundData.call_outcomes_distribution.reduce((s, d) => s + d.call_count, 0)} calls`}
          >
            <OutcomesPieChart data={outboundData.call_outcomes_distribution} />
          </ChartCard>

          {/* 3 ── Meetings Scheduled by Campaign */}
          <ChartCard
            title="Meetings Scheduled by Campaign"
            subtitle="Total calls vs meetings per campaign"
          >
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={outboundMeetingCampaign}
                  barGap={4}
                  barSize={14}
                  margin={{ top: 8, right: 8, bottom: 0, left: -10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                  />
                  <Tooltip
                    content={
                      <CampaignComparisonTooltip
                        valueLabels={{
                          calls: "Total Calls",
                          meetings: "Meetings",
                        }}
                        order={["calls", "meetings"]}
                        showTitle={false}
                      />
                    }
                    cursor={{ fill: "#f5f3ff" }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  />
                  <Bar
                    dataKey="calls"
                    name="Total Calls"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="meetings"
                    name="Meetings"
                    fill="#14b8a6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* 4 ── Call Duration Distribution (horizontal, with % tooltip) */}
          <ChartCard
            title="Call Duration Distribution"
            subtitle="Calls grouped by duration bucket"
          >
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={callDurationData}
                  barSize={24}
                  margin={{ top: 8, right: 48, bottom: 0, left: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="4 4"
                    horizontal={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="x"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#374151" }}
                    width={68}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const total =
                        callDurationData.reduce((s, d) => s + d.v, 0) || 1;
                      const pct = ((payload[0].value / total) * 100).toFixed(1);
                      return (
                        <div className="bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-2.5 text-[12px]">
                          <p className="font-semibold text-gray-600 mb-1 flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-sm bg-orange-400" />
                            {label}
                          </p>
                          <p className="text-orange-500 font-bold text-[15px]">
                            {payload[0].value}
                            <span className="text-[11px] font-normal text-gray-400 ml-1">
                              calls
                            </span>
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {pct}% of total
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="v" name="Calls" radius={[0, 6, 6, 0]}>
                    {(callDurationData ?? []).map((entry, i) => {
                      const palette = [
                        "#f97316",
                        "#fb923c",
                        "#fdba74",
                        "#fcd34d",
                        "#a3e635",
                      ];
                      return <Cell key={i} fill={palette[i] ?? "#d1d5db"} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* 5 ── Sentiment Analysis */}
          <ChartCard
            title="Sentiment Analysis"
            subtitle="Caller sentiment for selected period"
            badge={`${outboundSentiment?.reduce((s, d) => s + d.call_count, 0) ?? 0} analysed`}
          >
            <SentimentBars data={sentimentChartData} />
          </ChartCard>

          {/* 6 ── Top Interested Reasons */}
          <ChartCard
            title="Top Interested Reasons"
            subtitle="Most common reasons for prospect interest"
            badge={`${outboundReasons?.length ?? 0} reasons`}
          >
            <ReasonsChart data={outboundReasons ?? []} />
          </ChartCard>
        </section>
      ) : activeTab === "whatsapp" ? (
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Monthly Trend */}

          <ChartCard
            title="WhatsApp Messages by Month"
            subtitle="Monthly trend of sent, replied, and meetings"
          >
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={whatsappData.monthly_trend || []}
                  margin={{ top: 8, right: 8, bottom: 0, left: -10 }}
                >
                  <defs>
                    <linearGradient id="waAreaSent" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#6366f1"
                        stopOpacity={0.45}
                      />
                      <stop
                        offset="60%"
                        stopColor="#6366f1"
                        stopOpacity={0.15}
                      />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="waAreaReplied"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#22c55e"
                        stopOpacity={0.45}
                      />
                      <stop
                        offset="60%"
                        stopColor="#22c55e"
                        stopOpacity={0.15}
                      />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="waAreaMeetings"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#a21caf"
                        stopOpacity={0.45}
                      />
                      <stop
                        offset="60%"
                        stopColor="#a21caf"
                        stopOpacity={0.15}
                      />
                      <stop offset="100%" stopColor="#a21caf" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    dy={4}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                  />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="messages_sent"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#waAreaSent)"
                    dot={{
                      fill: "#fff",
                      r: 4,
                      strokeWidth: 2,
                      stroke: "#6366f1",
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#6366f1",
                      stroke: "#c7d2fe",
                      strokeWidth: 3,
                    }}
                    name="Sent"
                  />
                  <Area
                    type="monotone"
                    dataKey="replied"
                    stroke="#22c55e"
                    strokeWidth={2.5}
                    fill="url(#waAreaReplied)"
                    dot={{
                      fill: "#fff",
                      r: 4,
                      strokeWidth: 2,
                      stroke: "#22c55e",
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#22c55e",
                      stroke: "#bbf7d0",
                      strokeWidth: 3,
                    }}
                    name="Replied"
                  />
                  <Area
                    type="monotone"
                    dataKey="meetings_scheduled"
                    stroke="#a21caf"
                    strokeWidth={2.5}
                    fill="url(#waAreaMeetings)"
                    dot={{
                      fill: "#fff",
                      r: 4,
                      strokeWidth: 2,
                      stroke: "#a21caf",
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#a21caf",
                      stroke: "#f0abfc",
                      strokeWidth: 3,
                    }}
                    name="Meetings"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Delivery Status Distribution - Donut */}
          <ChartCard
            title="Delivery Status Distribution"
            subtitle="Delivery breakdown by status"
            badge={`${(whatsappData.delivery_status_distribution || []).reduce((s, d) => s + (d.count ?? 0), 0)} total`}
          >
            <div className="h-[240px] w-full flex items-center justify-center">
              {(whatsappData.delivery_status_distribution || []).length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={whatsappData.delivery_status_distribution || []}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      strokeWidth={2}
                      stroke="#fff"
                    >
                      {(whatsappData.delivery_status_distribution || []).map(
                        (entry, idx) => (
                          <Cell
                            key={idx}
                            fill={
                              ["#6366f1", "#22c55e", "#f59e42", "#ef4444"][
                                idx % 4
                              ]
                            }
                          />
                        ),
                      )}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} messages`, name]}
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-[13px] text-gray-400">No delivery data</div>
              )}
            </div>
          </ChartCard>

          {/* Intent Distribution - Horizontal Bar Chart */}
          <ChartCard
            title="Intent Distribution"
            subtitle="Prospect intent signals from WhatsApp conversations"
            badge={`${(whatsappData.intent_distribution || []).reduce((s, d) => s + (d.count ?? 0), 0)} total`}
          >
            <div className="h-[240px] w-full">
              {(whatsappData.intent_distribution || []).length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={whatsappData.intent_distribution || []}
                    layout="vertical"
                    margin={{ top: 5, right: 40, left: 90, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="waIntentGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                    />
                    <YAxis
                      dataKey="intent"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      width={85}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} leads`, "Count"]}
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }}
                      cursor={{ fill: "#f5f3ff" }}
                    />
                    <Bar
                      dataKey="count"
                      fill="url(#waIntentGrad)"
                      radius={[0, 6, 6, 0]}
                      label={{ position: "right", fontSize: 11, fill: "#6b7280", fontWeight: 600 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[13px] text-gray-400">No intent data</div>
              )}
            </div>
          </ChartCard>

          {/* Conversation Status Distribution - Vertical Bar Chart */}
          <ChartCard
            title="Conversation Status Distribution"
            subtitle="Active vs closed vs pending conversations"
            badge={`${(whatsappData.conversation_status_distribution || []).reduce((s, d) => s + (d.count ?? 0), 0)} total`}
          >
            <div className="h-[240px] w-full">
              {(whatsappData.conversation_status_distribution || []).length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={whatsappData.conversation_status_distribution || []}
                    barSize={28}
                    margin={{ top: 8, right: 8, bottom: 20, left: -10 }}
                  >
                    <defs>
                      <linearGradient id="waConvGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity={1} />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="status"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      angle={-20}
                      textAnchor="end"
                      dy={6}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} conversations`, "Count"]}
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }}
                      cursor={{ fill: "#f0f9ff" }}
                    />
                    <Bar
                      dataKey="count"
                      fill="url(#waConvGrad)"
                      radius={[6, 6, 0, 0]}
                      label={{ position: "top", fontSize: 11, fill: "#6b7280", fontWeight: 600 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[13px] text-gray-400">No conversation data</div>
              )}
            </div>
          </ChartCard>

          {/* Meetings by Campaign */}
          <ChartCard
            title="Meetings by Campaign"
            subtitle="Meetings scheduled per campaign"
          >
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={whatsappData.meetings_by_campaign || []}
                  barGap={4}
                  barSize={14}
                  margin={{ top: 8, right: 8, bottom: 0, left: -10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="campaign_name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="meetings_scheduled"
                    fill="#6366f1"
                    name="Meetings"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="total_sent"
                    fill="#22c55e"
                    name="Sent"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Reply Time Distribution */}
          <ChartCard
            title="Reply Time Distribution"
            subtitle="How quickly leads reply"
          >
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={whatsappData.reply_time_distribution || []}
                  barGap={6}
                  barSize={16}
                  margin={{ top: 8, right: 8, bottom: 0, left: -10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="bucket"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    fill="#6366f1"
                    name="Replies"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </section>
      ) : activeTab === "inbound" && inboundData ? (
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* IB-1 ── Campaign Performance by Month */}
          <ChartCard
            title="Inbound Calls by Month"
            subtitle="Monthly inbound call volume trend"
            badge={
              inboundData.total_calls
                ? `${inboundData.total_calls} total`
                : undefined
            }
          >
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={inboundCallsMonthly ?? []}
                  margin={{ top: 8, right: 8, bottom: 0, left: -10 }}
                >
                  <defs>
                    <linearGradient id="ibAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#14b8a6"
                        stopOpacity={0.45}
                      />
                      <stop
                        offset="60%"
                        stopColor="#0d9488"
                        stopOpacity={0.15}
                      />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="x"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    dy={4}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-2.5 text-[12px]">
                          <p className="font-semibold text-gray-600 mb-1">
                            {label}
                          </p>
                          <p className="text-teal-600 font-bold text-[15px]">
                            {payload[0].value}
                            <span className="text-[11px] font-normal text-gray-400 ml-1">
                              calls
                            </span>
                          </p>
                        </div>
                      );
                    }}
                    cursor={{
                      stroke: "#ccfbf1",
                      strokeWidth: 1,
                      strokeDasharray: "4 2",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#14b8a6"
                    strokeWidth={2.5}
                    fill="url(#ibAreaGrad)"
                    dot={{
                      fill: "#fff",
                      r: 4,
                      strokeWidth: 2,
                      stroke: "#14b8a6",
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#14b8a6",
                      stroke: "#99f6e4",
                      strokeWidth: 3,
                    }}
                    name="Calls"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* IB-2 ── Inbound Calls Distribution (by Duration) */}
          <ChartCard
            title="Inbound Calls Distribution"
            subtitle="Call volume by duration bucket"
            badge={
              inboundOutcomes
                ? `${inboundOutcomes.reduce((s, d) => s + d.call_count, 0)} calls`
                : undefined
            }
          >
            {inboundOutcomes ? (
              <OutcomesPieChart
                data={inboundOutcomes.map((item, i) => ({
                  ...item,
                  fill: ["#a860f0ed", "#06b6d4", "#a855f7", "#10b981", "#ec4899"][i % 5],
                }))}
              />
            ) : (
              <div className="h-[200px] flex items-center justify-center text-[13px] text-gray-400">
                No distribution data
              </div>
            )}
          </ChartCard>

          {/* IB-3 ── Meetings Scheduled by Campaign */}
          <ChartCard
            title="Meetings Scheduled"
            subtitle="Total calls vs meetings per campaign"
            onClick={() => router.push("/metrics/reporting?section=history")}
          >
            <div className="h-[240px] w-full">
              {inboundMeetingCampaign ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={inboundMeetingCampaign}
                    barGap={4}
                    barSize={14}
                    margin={{ top: 8, right: 8, bottom: 0, left: -10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="4 4"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                    />
                    <Tooltip
                      content={
                        <CampaignComparisonTooltip
                          valueLabels={{
                            calls: "Total Calls",
                            meetings: "Meetings",
                          }}
                          order={["calls", "meetings"]}
                          showTitle={false}
                        />
                      }
                      cursor={{ fill: "#f0fdfa" }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                    />
                    <Bar
                      dataKey="calls"
                      name="Total Calls"
                      fill="#14b8a6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="meetings"
                      name="Meetings"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[13px] text-gray-400">
                  No campaign data
                </div>
              )}
            </div>
          </ChartCard>

          {/* IB-4 ── Call Duration Distribution */}
          <ChartCard
            title="Call Duration Distribution"
            subtitle="Calls grouped by duration bucket"
          >
            <div className="h-[240px] w-full">
              {inboundDurationData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={inboundDurationData}
                    barSize={24}
                    margin={{ top: 8, right: 48, bottom: 0, left: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="4 4"
                      horizontal={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="x"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#374151" }}
                      width={68}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const tot =
                          inboundDurationData.reduce((s, d) => s + d.v, 0) || 1;
                        return (
                          <div className="bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-2.5 text-[12px]">
                            <p className="font-semibold text-gray-600 mb-1">
                              {label}
                            </p>
                            <p className="text-teal-600 font-bold text-[15px]">
                              {payload[0].value}
                              <span className="text-[11px] font-normal text-gray-400 ml-1">
                                calls
                              </span>
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {((payload[0].value / tot) * 100).toFixed(1)}% of
                              total
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="v" name="Calls" radius={[0, 6, 6, 0]}>
                      {inboundDurationData.map((_, i) => {
                        const pal = [
                          "#14b8a6",
                          "#2dd4bf",
                          "#5eead4",
                          "#99f6e4",
                          "#ccfbf1",
                        ];
                        return <Cell key={i} fill={pal[i] ?? "#d1d5db"} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[13px] text-gray-400">
                  No duration data
                </div>
              )}
            </div>
          </ChartCard>

          {/* IB-5 ── Sentiment Analysis */}
          <ChartCard
            title="Sentiment Analysis"
            subtitle="Caller sentiment for selected period"
            badge={
              inboundSentimentArr.length
                ? `${inboundSentimentArr.reduce((s, d) => s + (d.value ?? 0), 0)} analysed`
                : undefined
            }
          >
            {inboundSentimentArr.length > 0 ? (
              <SentimentBars data={inboundSentimentArr} />
            ) : (
              <div className="h-[160px] flex items-center justify-center text-[13px] text-gray-400">
                No sentiment data
              </div>
            )}
          </ChartCard>

          {/* IB-6 ── Top Interested Reasons */}
          <ChartCard
            title="Top Interested Reasons"
            subtitle="Most common reasons for prospect interest"
            badge={
              inboundReasons ? `${inboundReasons.length} reasons` : undefined
            }
          >
            {inboundReasons ? (
              <ReasonsChart data={inboundReasons} />
            ) : (
              <div className="h-[160px] flex items-center justify-center text-[13px] text-gray-400">
                No reason data
              </div>
            )}
          </ChartCard>
        </section>
      ) : activeTab === "email" && emailData ? (
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* EM-1 ── Campaign Performance by Month */}
          <ChartCard
            title="Campaign Performance by Month"
            subtitle="Monthly email volume trend"
            badge={
              emailData.total_emails
                ? `${emailData.total_emails} total`
                : undefined
            }
          >
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={emailMonthly ?? []}
                  margin={{ top: 8, right: 8, bottom: 0, left: -10 }}
                >
                  <defs>
                    <linearGradient id="emAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#a855f7"
                        stopOpacity={0.45}
                      />
                      <stop
                        offset="60%"
                        stopColor="#7c3aed"
                        stopOpacity={0.15}
                      />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="x"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    dy={4}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-2.5 text-[12px]">
                          <p className="font-semibold text-gray-600 mb-1">
                            {label}
                          </p>
                          <p className="text-purple-600 font-bold text-[15px]">
                            {payload[0].value}
                            <span className="text-[11px] font-normal text-gray-400 ml-1">
                              emails
                            </span>
                          </p>
                        </div>
                      );
                    }}
                    cursor={{
                      stroke: "#f3e8ff",
                      strokeWidth: 1,
                      strokeDasharray: "4 2",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#a855f7"
                    strokeWidth={2.5}
                    fill="url(#emAreaGrad)"
                    dot={{
                      fill: "#fff",
                      r: 4,
                      strokeWidth: 2,
                      stroke: "#a855f7",
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#a855f7",
                      stroke: "#e9d5ff",
                      strokeWidth: 3,
                    }}
                    name="Emails"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* EM-2 ── Email Outcomes Distribution */}
          <ChartCard
            title="Email Outcomes Distribution"
            subtitle="Breakdown of every email interaction result"
            badge={
              cardTotalLeads > 0 ? `${cardTotalLeads} total leads` : undefined
            }
          >
            {emailOutcomes ? (
              <OutcomesPieChart
                data={emailOutcomes}
                totalOverride={cardTotalLeads}
              />
            ) : (
              <div className="h-[200px] flex items-center justify-center text-[13px] text-gray-400">
                No outcomes data
              </div>
            )}
          </ChartCard>

          {/* EM-2b ── Email Deliverability (static: API not yet supported) */}
          {(() => {
            const deliverabilityBars = [
              { name: "Inbox", value: 98, fill: "#22c55e", bg: "#dcfce7", pct: 98 },
              { name: "Spam",  value: 2,  fill: "#dc2626", bg: "#fee2e2", pct: 2  },
            ];
            return (
              <ChartCard
                title="Email Deliverability"
                subtitle="Inbox vs spam breakdown"
                badge="98% inbox rate"
              >
                <div className="flex flex-col items-center gap-5 pt-1">
                  {/* Donut with centre stat */}
                  <div className="relative w-[180px] h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deliverabilityBars}
                          cx="50%"
                          cy="50%"
                          innerRadius={54}
                          outerRadius={82}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                          labelLine={false}
                          strokeWidth={0}
                        >
                          {deliverabilityBars.map((entry, index) => (
                            <Cell key={index} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const datum = payload[0].payload;
                            return (
                              <div className="bg-white border border-gray-200 shadow-xl rounded-xl px-3 py-2 text-[12px]">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: datum.fill }} />
                                  <span className="font-semibold text-gray-600">{datum.name}</span>
                                </div>
                                <p className="font-bold text-[15px]" style={{ color: datum.fill }}>{datum.pct}%</p>
                              </div>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Centre label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[26px] font-black text-green-500 leading-none">98%</span>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Inbox</span>
                    </div>
                  </div>

                  {/* Legend bars */}
                  <div className="w-full space-y-2.5">
                    {deliverabilityBars.map((datum) => (
                      <div key={datum.name} className="rounded-xl px-3 py-2.5" style={{ background: datum.bg }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: datum.fill }} />
                            <span className="text-[12px] font-[700] text-gray-700">{datum.name}</span>
                          </div>
                          <span className="text-[13px] font-[800]" style={{ color: datum.fill }}>{datum.pct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${datum.pct}%`, background: datum.fill }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartCard>
            );
          })()}

          {/* EM-3 ── Meetings Scheduled */}
          <ChartCard
            title="Meetings Scheduled"
            subtitle="Total leads vs meetings per campaign"
          >
            <div className="h-[240px] w-full">
              {emailMeetingCampaign ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={emailMeetingCampaign}
                    barGap={4}
                    barSize={14}
                    margin={{ top: 8, right: 8, bottom: 0, left: -10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="4 4"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                    />
                    <Tooltip
                      content={
                        <CampaignComparisonTooltip
                          valueLabels={{
                            leads: "Total Leads",
                            meetings: "Meetings",
                          }}
                          order={["leads", "meetings"]}
                          showTitle={false}
                        />
                      }
                      cursor={{ fill: "#faf5ff" }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                    />
                    <Bar
                      dataKey="leads"
                      name="Total Leads"
                      fill="#a855f7"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="meetings"
                      name="Meetings"
                      fill="#14b8a6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[13px] text-gray-400">
                  No campaign data
                </div>
              )}
            </div>
          </ChartCard>

          {/* EM-4 ── Avg Number of Responses Per Email (per-campaign bar) */}
          <ChartCard
            title="Campaign Responses Per Email"
            subtitle="Email response rate per campaign"
          >
            <div className="h-[240px] w-full">
              {emailResponsesData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={emailResponsesData}
                    barSize={28}
                    margin={{ top: 8, right: 8, bottom: 0, left: -10 }}
                  >
                    <defs>
                      <linearGradient
                        id="emRespGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#f97316" stopOpacity={1} />
                        <stop
                          offset="100%"
                          stopColor="#fb923c"
                          stopOpacity={0.6}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="x"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      dy={4}
                      interval={0}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-2.5 text-[12px]">
                            <p className="font-semibold text-gray-600 mb-1 truncate max-w-[180px]">
                              {label}
                            </p>
                            <p className="text-orange-500 font-bold text-[15px]">
                              {payload[0].value}
                              <span className="text-[11px] font-normal text-gray-400 ml-1">
                                avg responses
                              </span>
                            </p>
                          </div>
                        );
                      }}
                      cursor={{ fill: "#fff7ed" }}
                    />
                    <Bar
                      dataKey="v"
                      name="Avg Responses"
                      fill="url(#emRespGrad)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[13px] text-gray-400">
                  No response data
                </div>
              )}
            </div>
          </ChartCard>

          {/* EM-5 ── Sentiment Analysis */}
          <ChartCard
            title="Sentiment Analysis"
            subtitle="Email recipient sentiment for selected period"
            badge={
              emailSentimentArr.length
                ? `${emailSentimentArr.reduce((s, d) => s + (d.value ?? 0), 0)} analysed`
                : undefined
            }
          >
            {emailSentimentArr.length > 0 ? (
              <SentimentBars data={emailSentimentArr} />
            ) : (
              <div className="h-[160px] flex items-center justify-center text-[13px] text-gray-400">
                No sentiment data
              </div>
            )}
          </ChartCard>

          {/* EM-6 ── Top Interested Reasons */}
          <ChartCard
            title="Top Interested Reasons"
            subtitle="Most common reasons for prospect interest"
            badge={emailReasons ? `${emailReasons.length} reasons` : undefined}
          >
            {emailReasons ? (
              <ReasonsChart data={emailReasons} />
            ) : (
              <div className="h-[160px] flex items-center justify-center text-[13px] text-gray-400">
                No reason data
              </div>
            )}
          </ChartCard>
        </section>
      ) : activeTab === "linkedin" && linkedinData ? (
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* LI-1 ── Monthly Trend (3-line area) */}
          <ChartCard
            title="Monthly Trend"
            subtitle="Connections sent, DMs sent, and replies over time"
            badge={
              linkedinMonthly ? `${linkedinMonthly.length} months` : undefined
            }
          >
            <div className="h-[240px] w-full">
              {linkedinMonthly ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={linkedinMonthly}
                    margin={{ top: 8, right: 8, bottom: 0, left: -10 }}
                  >
                    <defs>
                      <linearGradient
                        id="liGradConn"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#0ea5e9"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="100%"
                          stopColor="#0ea5e9"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="liGradDms"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="100%"
                          stopColor="#8b5cf6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="liGradReply"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#22c55e"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="100%"
                          stopColor="#22c55e"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="x"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      dy={4}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const colors = {
                          connections_sent: "#0ea5e9",
                          dms_sent: "#8b5cf6",
                          replies_received: "#22c55e",
                        };
                        const labels = {
                          connections_sent: "Connections Sent",
                          dms_sent: "DMs Sent",
                          replies_received: "Replies Received",
                        };
                        return (
                          <div className="bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-2.5 text-[12px]">
                            <p className="font-semibold text-gray-600 mb-1.5">
                              {label}
                            </p>
                            {payload.map((p) => (
                              <p
                                key={p.dataKey}
                                style={{ color: colors[p.dataKey] }}
                                className="font-bold tabular-nums"
                              >
                                {p.value}{" "}
                                <span className="text-[11px] font-normal text-gray-400">
                                  {labels[p.dataKey]}
                                </span>
                              </p>
                            ))}
                          </div>
                        );
                      }}
                      cursor={{
                        stroke: "#e0f2fe",
                        strokeWidth: 1,
                        strokeDasharray: "4 2",
                      }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                      formatter={(value) =>
                        ({
                          connections_sent: "Connections Sent",
                          dms_sent: "DMs Sent",
                          replies_received: "Replies Received",
                        })[value] ?? value
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="connections_sent"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      fill="url(#liGradConn)"
                      dot={{
                        fill: "#fff",
                        r: 3,
                        strokeWidth: 2,
                        stroke: "#0ea5e9",
                      }}
                      name="connections_sent"
                    />
                    <Area
                      type="monotone"
                      dataKey="dms_sent"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="url(#liGradDms)"
                      dot={{
                        fill: "#fff",
                        r: 3,
                        strokeWidth: 2,
                        stroke: "#8b5cf6",
                      }}
                      name="dms_sent"
                    />
                    <Area
                      type="monotone"
                      dataKey="replies_received"
                      stroke="#22c55e"
                      strokeWidth={2}
                      fill="url(#liGradReply)"
                      dot={{
                        fill: "#fff",
                        r: 3,
                        strokeWidth: 2,
                        stroke: "#22c55e",
                      }}
                      name="replies_received"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[13px] text-gray-400">
                  No trend data
                </div>
              )}
            </div>
          </ChartCard>

          {/* LI-2 ── Funnel */}
          <ChartCard
            title="LinkedIn Campaign Funnel"
            subtitle="Stage-by-stage progression of LinkedIn outreach"
            badge={
              linkedinFunnel
                ? `${linkedinFunnel[0]?.count ?? 0} started`
                : undefined
            }
          >
            <div className="h-[240px] w-full">
              {linkedinFunnel ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={linkedinFunnel}
                    layout="vertical"
                    barSize={18}
                    margin={{ top: 4, right: 48, bottom: 4, left: 12 }}
                  >
                    <defs>
                      <linearGradient
                        id="liFunnelGrad"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity={1} />
                        <stop
                          offset="100%"
                          stopColor="#38bdf8"
                          stopOpacity={0.7}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      horizontal={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="stage"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      width={140}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-2.5 text-[12px]">
                            <p className="font-semibold text-gray-600 mb-1">
                              {label}
                            </p>
                            <p className="text-sky-500 font-bold text-[15px]">
                              {payload[0].value}
                            </p>
                          </div>
                        );
                      }}
                      cursor={{ fill: "#f0f9ff" }}
                    />
                    <Bar
                      dataKey="count"
                      fill="url(#liFunnelGrad)"
                      radius={[0, 4, 4, 0]}
                      label={{
                        position: "right",
                        fontSize: 11,
                        fill: "#6b7280",
                        fontWeight: 600,
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[13px] text-gray-400">
                  No funnel data
                </div>
              )}
            </div>
          </ChartCard>

          {/* LI-3 ── Connection Status Distribution */}
          <ChartCard
            title="Connection Status Distribution"
            subtitle="Breakdown of LinkedIn connection outcomes"
            badge={
              linkedinOutcomes
                ? `${linkedinOutcomes.reduce((s, d) => s + (d.call_count ?? 0), 0)} total`
                : undefined
            }
          >
            {linkedinOutcomes ? (
              <OutcomesPieChart data={linkedinOutcomes} />
            ) : (
              <div className="h-[200px] flex items-center justify-center text-[13px] text-gray-400">
                No connection status data
              </div>
            )}
          </ChartCard>

          {/* LI-4 ── Intent Distribution */}
          <ChartCard
            title="Intent Distribution"
            subtitle="Prospect intent signals from LinkedIn conversations"
            badge={
              linkedinIntent
                ? `${linkedinIntent.reduce((s, d) => s + (d.call_count ?? 0), 0)} total`
                : undefined
            }
          >
            {linkedinIntent ? (
              <OutcomesPieChart data={linkedinIntent} />
            ) : (
              <div className="h-[200px] flex items-center justify-center text-[13px] text-gray-400">
                No intent data
              </div>
            )}
          </ChartCard>

          {/* LI-5 ── Meetings by Campaign */}
          <ChartCard
            title="Meetings by Campaign"
            subtitle="Meetings scheduled per LinkedIn campaign"
          >
            <div className="h-[240px] w-full">
              {linkedinMeetingCampaign && linkedinMeetingCampaign.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={linkedinMeetingCampaign}
                    barSize={20}
                    margin={{ top: 8, right: 8, bottom: 0, left: -10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="4 4"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      dy={4}
                      interval={0}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-2.5 text-[12px]">
                            <p className="font-semibold text-gray-600 mb-1.5">
                              {label}
                            </p>
                            {payload.map((p) => (
                              <p
                                key={p.dataKey}
                                style={{ color: p.color }}
                                className="font-bold tabular-nums"
                              >
                                {p.value}{" "}
                                <span className="text-[11px] font-normal text-gray-400">
                                  {p.name}
                                </span>
                              </p>
                            ))}
                          </div>
                        );
                      }}
                      cursor={{ fill: "#f0f9ff" }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                    />
                    <Bar
                      dataKey="connections"
                      name="Connections"
                      fill="#0ea5e9"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="meetings"
                      name="Meetings"
                      fill="#14b8a6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[13px] text-gray-400">
                  No campaign meeting data
                </div>
              )}
            </div>
          </ChartCard>

          {/* LI-6 ── Sentiment Distribution */}
          <ChartCard
            title="Sentiment Distribution"
            subtitle="LinkedIn prospect sentiment for selected period"
            badge={
              linkedinSentimentArr.length
                ? `${linkedinSentimentArr.reduce((s, d) => s + (d.value ?? 0), 0)} analysed`
                : undefined
            }
          >
            {linkedinSentimentArr.length > 0 ? (
              <SentimentBars data={linkedinSentimentArr} />
            ) : (
              <div className="h-[160px] flex items-center justify-center text-[13px] text-gray-400">
                No sentiment data
              </div>
            )}
          </ChartCard>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Static fallback bar chart */}
          <ChartCard
            title={barChartTitle}
            subtitle="Activity breakdown for selected period"
          >
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  barSize={32}
                  margin={{ top: 8, right: 8, bottom: 0, left: -10 }}
                >
                  <defs>
                    <linearGradient
                      id="fallbackBarGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#a78bfa"
                        stopOpacity={0.7}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="x"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    dy={4}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                  />
                  <Tooltip
                    content={<BarTooltip />}
                    cursor={{ fill: "#f5f3ff" }}
                  />
                  <Bar
                    dataKey="v"
                    name={barChartLabel}
                    fill="url(#fallbackBarGrad)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Static fallback donut */}
          <ChartCard
            title={donut.title}
            subtitle={`Percentage of ${donut.label.toLowerCase()} interactions`}
          >
            <div className="flex items-center justify-around">
              <DonutChart resolved={donut.resolved} label={donut.label} />
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800">
                      {donut.resolved}%
                    </p>
                    <p className="text-[11px] text-gray-500">{donut.label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-gray-200 shrink-0" />
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800">
                      {100 - donut.resolved}%
                    </p>
                    <p className="text-[11px] text-gray-500">Unresolved</p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-[11px] text-gray-400">
                    Based on current period
                  </p>
                </div>
              </div>
            </div>
          </ChartCard>
        </section>
      )}
    </main>
  );
}

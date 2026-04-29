"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  MessageSquare,
  Clock3,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import axiosInstance from "../../Redux/axiosInstance";
import { toast } from "react-toastify";

const CHANNEL_DATA = {
  webchat: {
    updatedAt: "11:16:30 AM",
    cards: {
      total: 1842,
      open: 267,
      closed: 1575,
      avgMessages: 8.4,
      totalMessages: 15473,
      escalated: 217,
    },
    openClosed: [
      { name: "Open", value: 267 },
      { name: "Closed", value: 1575 },
    ],
    assignedSplit: [
      { name: "Assigned", value: 1430 },
      { name: "Unassigned", value: 412 },
    ],
    escalationTrend: [
      { month: "Oct", escalated: 42, normal: 146 },
      { month: "Nov", escalated: 38, normal: 152 },
      { month: "Dec", escalated: 47, normal: 165 },
      { month: "Jan", escalated: 51, normal: 171 },
      { month: "Feb", escalated: 44, normal: 162 },
      { month: "Mar", escalated: 58, normal: 177 },
    ],
    statusPie: [
      { name: "Resolved", value: 1274, color: "#0ea95a" },
      { name: "Waiting", value: 351, color: "#f59e0b" },
      { name: "Escalated", value: 217, color: "#7c3aed" },
    ],
    feedback: { thumbsUp: 312, thumbsDown: 89 },
    weeklyFeedback: [
      { week: "W1", positive: 48, negative: 12 },
      { week: "W2", positive: 55, negative: 10 },
      { week: "W3", positive: 43, negative: 18 },
      { week: "W4", positive: 60, negative: 8 },
      { week: "W5", positive: 52, negative: 14 },
      { week: "W6", positive: 54, negative: 9 },
    ],
  },
  whatsapp: {
    updatedAt: "11:19:10 AM",
    cards: {
      total: 1297,
      open: 194,
      closed: 1103,
      avgMessages: 6.7,
      totalMessages: 8690,
      escalated: 148,
    },
    openClosed: [
      { name: "Open", value: 194 },
      { name: "Closed", value: 1103 },
    ],
    assignedSplit: [
      { name: "Assigned", value: 998 },
      { name: "Unassigned", value: 299 },
    ],
    escalationTrend: [
      { month: "Oct", escalated: 25, normal: 102 },
      { month: "Nov", escalated: 22, normal: 98 },
      { month: "Dec", escalated: 29, normal: 113 },
      { month: "Jan", escalated: 31, normal: 117 },
      { month: "Feb", escalated: 28, normal: 109 },
      { month: "Mar", escalated: 33, normal: 121 },
    ],
    statusPie: [
      { name: "Resolved", value: 901, color: "#0ea95a" },
      { name: "Waiting", value: 248, color: "#f59e0b" },
      { name: "Escalated", value: 148, color: "#7c3aed" },
    ],
    feedback: { thumbsUp: 218, thumbsDown: 54 },
    weeklyFeedback: [
      { week: "W1", positive: 35, negative: 9 },
      { week: "W2", positive: 40, negative: 7 },
      { week: "W3", positive: 31, negative: 12 },
      { week: "W4", positive: 44, negative: 6 },
      { week: "W5", positive: 38, negative: 10 },
      { week: "W6", positive: 42, negative: 7 },
    ],
  },
};

const FILTER_OPTIONS = [
  { key: "all",          label: "All" },
  { key: "today",     label: "Today" },
  { key: "this_week", label: "This Week" },
  { key: "this_year", label: "This Year" },
];

const normalizeRole = (role) => String(role ?? "").toUpperCase().replace(/[\s_-]/g, "");

const toNum = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getFirstNumber = (obj, keys, fallback = 0) => {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return toNum(value, fallback);
    }
  }
  return fallback;
};

const mapNameValueArray = (arr, nameKeyCandidates, valueKeyCandidates) => {
  if (!Array.isArray(arr)) return [];

  return arr
    .map((item) => {
      const name =
        nameKeyCandidates.map((k) => item?.[k]).find((v) => typeof v === "string" && v.trim()) ?? "";
      const value = getFirstNumber(item, valueKeyCandidates, 0);
      if (!name) return null;
      return { name, value };
    })
    .filter(Boolean);
};

const formatWeekKey = (key) => {
  // "week2_mar_2026" → "W2 Mar"
  const parts = key.split("_");
  if (parts.length < 2) return key;
  const weekNum = parts[0].replace("week", "W");
  const month = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
  return `${weekNum} ${month}`;
};

const mapWeeklyFeedbackObject = (obj) => {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return null;
  return Object.entries(obj).map(([key, val]) => ({
    week: formatWeekKey(key),
    positive: toNum(val?.positive, 0),
    negative: toNum(val?.negative, 0),
  }));
};

const mapEscalationTrend = (arr) => {
  if (!Array.isArray(arr)) return [];

  return arr
    .map((item, index) => {
      const month =
        item?.month ?? item?.label ?? item?.period ?? item?.name ?? `P${index + 1}`;
      const escalated = getFirstNumber(item, ["escalated", "escalated_chats", "escalatedChats"], 0);
      const normal = getFirstNumber(item, ["normal", "non_escalated", "nonEscalated", "non_escalated_chats"], 0);
      return {
        month,
        escalated,
        normal,
      };
    })
    .filter((point) => point.month);
};

const mapStatusPie = (arr) => {
  const colorByLabel = {
    resolved: "#0ea95a",
    waiting: "#f59e0b",
    escalated: "#7c3aed",
  };

  if (!Array.isArray(arr)) return [];

  return arr
    .map((item) => {
      const rawName = item?.name ?? item?.label ?? item?.status ?? "";
      if (!rawName) return null;
      const name = String(rawName);
      const value = getFirstNumber(item, ["value", "count", "total"], 0);
      const normalized = name.toLowerCase();
      return {
        name,
        value,
        color: item?.color ?? colorByLabel[normalized] ?? "#94a3b8",
      };
    })
    .filter(Boolean);
};

const mapStatsResponse = (payload, fallback) => {
  // Support flat response: { total_chats, open_chats, ... } or nested under data/webchat
  const root = payload?.webchat ?? payload?.data?.webchat ?? payload?.data ?? payload ?? {};

  const total        = getFirstNumber(root, ["total_chats", "total", "totalChats", "total_conversations"], fallback.cards.total);
  const open         = getFirstNumber(root, ["open_chats", "open", "openChats"], fallback.cards.open);
  const closed       = getFirstNumber(root, ["closed_chats", "closed", "closedChats"], fallback.cards.closed);
  const avgMessages  = getFirstNumber(root, ["avg_messages_per_chat", "avgMessages", "avg_messages", "average_messages_per_chat"], fallback.cards.avgMessages);
  const totalMessages = getFirstNumber(root, ["total_messages", "totalMessages"], fallback.cards.totalMessages);
  const assigned     = getFirstNumber(root, ["assigned_chats", "assigned", "assignedChats"], 0);
  const escalated    = getFirstNumber(root, ["escalated", "escalated_chats", "escalatedChats"], fallback.cards.escalated);

  const computedOpenClosed = [
    { name: "Open",   value: open },
    { name: "Closed", value: closed },
  ];

  const computedAssignedSplit = [
    { name: "Assigned",   value: assigned },
    { name: "Unassigned", value: Math.max(total - assigned, 0) },
  ];

  const computedStatusPie = [
    { name: "Resolved",  value: closed,                       color: "#0ea95a" },
    { name: "Waiting",   value: Math.max(open - escalated, 0), color: "#f59e0b" },
    { name: "Escalated", value: escalated,                     color: "#7c3aed" },
  ];

  // Feedback — supports positive_responses / negative_responses and legacy keys
  // If API doesn't return feedback, default to 0 (no static demo data)
  const feedbackObj  = root?.feedback ?? {};
  const hasFeedback  = Object.keys(feedbackObj).length > 0;
  const thumbsUp   = hasFeedback ? getFirstNumber(feedbackObj, ["positive_responses", "thumbs_up", "positive_feedback", "thumbsUp", "positive"], 0) : 0;
  const thumbsDown = hasFeedback ? getFirstNumber(feedbackObj, ["negative_responses", "thumbs_down", "negative_feedback", "thumbsDown", "negative"], 0) : 0;

  // Weekly feedback — supports object format { week2_mar_2026: { positive, negative } } or array
  // If API doesn't return line_chart_feedback, return [] (no static demo data)
  const lineChartFeedback = root?.line_chart_feedback ?? root?.lineChartFeedback ?? null;
  const rawWeeklyObj = lineChartFeedback?.weekly_feedback ?? lineChartFeedback?.weeklyFeedback;
  const rawWeeklyArr = root?.weeklyFeedback ?? root?.weekly_feedback;

  let weeklyFeedback;
  if (rawWeeklyObj && typeof rawWeeklyObj === "object" && !Array.isArray(rawWeeklyObj)) {
    weeklyFeedback = mapWeeklyFeedbackObject(rawWeeklyObj) ?? [];
  } else if (Array.isArray(rawWeeklyArr)) {
    weeklyFeedback = rawWeeklyArr.map((item, i) => ({
      week:     item?.week ?? item?.label ?? item?.period ?? `W${i + 1}`,
      positive: getFirstNumber(item, ["positive", "thumbs_up", "thumbsUp"], 0),
      negative: getFirstNumber(item, ["negative", "thumbs_down", "thumbsDown"], 0),
    }));
  } else {
    weeklyFeedback = [];
  }

  // Escalation trend — use raw array if present, else keep fallback
  const escalationTrend = mapEscalationTrend(root?.escalationTrend ?? root?.escalation_trend ?? root?.escalation_over_time);

  return {
    updatedAt: root?.updatedAt ?? root?.updated_at ?? new Date().toLocaleTimeString(),
    cards: { total, open, closed, avgMessages, totalMessages, escalated },
    openClosed: computedOpenClosed,
    assignedSplit: computedAssignedSplit,
    escalationTrend: escalationTrend.length > 0
      ? escalationTrend
      : [{ month: "Current", escalated, normal: Math.max(total - escalated, 0) }],
    statusPie: computedStatusPie,
    feedback: { thumbsUp, thumbsDown },
    weeklyFeedback,
  };
};

/* ─── Gradient KPI Card ───────────────────────────────────────── */
function StatCard({ icon: Icon, title, value, sub, gradient, badge, glowColor, accentBar }) {
  return (
    <article
      className={`relative flex flex-col justify-between rounded-2xl p-4 text-white shadow-xl overflow-hidden ${gradient}`}
      style={{ minHeight: 116 }}
    >
      {/* Subtle radial glow in corner */}
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-30 blur-2xl"
        style={{ background: glowColor }}
      />
      {/* Top row */}
      <div className="flex items-center justify-between relative z-10">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 shadow-inner">
          <Icon className="h-4 w-4" />
        </span>
        {badge && (
          <span className="rounded-full bg-white/20 border border-white/30 px-2.5 py-0.5 text-[11px] font-[700] backdrop-blur-sm">
            {badge}
          </span>
        )}
      </div>
      {/* Bottom */}
      <div className="relative z-10 mt-2">
        <p className="text-[22px] font-[900] leading-none tracking-tight">{value}</p>
        <p className="mt-1 text-[12px] font-[700] leading-tight opacity-95">{title}</p>
        <p className="mt-0.5 text-[10px] text-white/70">{sub}</p>
      </div>
      {/* Bottom accent line */}
      {accentBar && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-2xl opacity-60" style={{ background: accentBar }} />
      )}
    </article>
  );
}

/* ─── Feedback Card ───────────────────────────────────────────── */
function FeedbackStatCard({ thumbsUp, thumbsDown, gradient }) {
  const total = thumbsUp + thumbsDown;
  const upPct = total > 0 ? Math.round((thumbsUp / total) * 100) : 0;
  return (
    <article
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl p-4 text-white shadow-xl ${gradient}`}
      style={{ minHeight: 116 }}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-25 blur-2xl bg-white" />
      <div className="relative z-10 flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 shadow-inner">
          <MessageSquare className="h-4 w-4" />
        </span>
        <span className="rounded-full bg-white/20 border border-white/30 px-2.5 py-0.5 text-[11px] font-[700]">
          {upPct}% positive
        </span>
      </div>
      <div className="relative z-10 mt-2">
        <p className="text-[12px] font-[700] mb-1.5 opacity-90">User Feedback</p>
        <div className="flex gap-1.5">
          <div className="flex flex-1 items-center gap-1.5 rounded-xl bg-white/15 border border-white/20 px-2 py-1.5">
            <ThumbsUp className="h-3 w-3 shrink-0" />
            <div>
              <p className="text-[14px] font-[900] leading-none">{thumbsUp.toLocaleString()}</p>
              <p className="text-[10px] text-white/70 mt-0.5">Positive</p>
            </div>
          </div>
          <div className="flex flex-1 items-center gap-1.5 rounded-xl bg-white/15 border border-white/20 px-2 py-1.5">
            <ThumbsDown className="h-3 w-3 shrink-0" />
            <div>
              <p className="text-[14px] font-[900] leading-none">{thumbsDown.toLocaleString()}</p>
              <p className="text-[10px] text-white/70 mt-0.5">Negative</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ─── Chart Card wrapper ──────────────────────────────────────── */
function ChartCard({ title, subtitle, accentColor, children, extra }) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="h-[3px]" style={{ background: accentColor }} />
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-[13px] font-[700] text-gray-900">{title}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>
          </div>
          {extra}
        </div>
        {children}
      </div>
    </article>
  );
}

export default function SupportChatbotMetrics() {
  const [selectedFilter, setSelectedFilter] = useState("");
  const [data, setData] = useState(CHANNEL_DATA.webchat);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const role = typeof window === "undefined" ? "" : normalizeRole(localStorage.getItem("userRole"));
  const canAccessSupportMetrics = role === "SUPPORT" || role === "MANAGER" || role === "SUPERADMIN";

  const fetchMetrics = useCallback(
    async ({ isManualRefresh = false } = {}) => {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorText("");

      try {
        const params = { channel: "webchat" };
        if (selectedFilter) params.filter = selectedFilter;

        const res = await axiosInstance.get("/api/chatbot/stats", {
          params,
        });

        setData(mapStatsResponse(res?.data, CHANNEL_DATA.webchat));
        const successMessage =
          res?.data?.message ||
          res?.data?.detail ||
          "Chatbot stats loaded successfully.";
        toast.success(successMessage);
      } catch (error) {
        setErrorText("Unable to load latest stats. Showing fallback data.");
        setData(CHANNEL_DATA.webchat);
        const apiErrorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          "Failed to load chatbot stats.";
        toast.error(apiErrorMessage);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedFilter],
  );

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const onRefresh = () => {
    fetchMetrics({ isManualRefresh: true });
  };

  if (!canAccessSupportMetrics) {
    return (
      <main className="min-h-[calc(100vh-60px)] bg-[#f4f5f7] p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-100 bg-white p-8 shadow-sm">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-[26px] font-[800] text-gray-900">Support Access Required</h1>
          <p className="mt-2 text-[15px] text-gray-500">
            Customer Support chatbot metrics can only be accessed by users with Support or Manager role.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-60px)] bg-[#f4f5f7] p-3 sm:p-4 space-y-3 sm:space-y-4">

      {/* ── Header ── */}
      <section className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-1 rounded-full bg-gradient-to-b from-violet-500 to-indigo-600" />
            <h1 className="text-[17px] font-[800] leading-none text-gray-900">Web Chat Metrics</h1>
          </div>
          <p className="ml-3 text-[13px] text-gray-400">Last updated: {data.updatedAt}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-xl border border-gray-200 bg-white p-1 shadow-sm gap-1">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSelectedFilter(opt.key)}
                className={`rounded-lg px-4 py-1.5 text-[12px] font-[600] transition ${
                  selectedFilter === opt.key
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-[13px] font-[600] text-gray-600 shadow-sm hover:bg-gray-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </section>

      {/* ── KPI Cards ── */}
      <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          icon={MessageSquare}
          title="Total Chats"
          value={data.cards.total.toLocaleString()}
          sub="Since launch"
          badge="All time"
          gradient="bg-gradient-to-br from-[#6d28d9] via-[#7c3aed] to-[#4f46e5]"
          glowColor="#a78bfa"
          accentBar="linear-gradient(to right, #c4b5fd, #818cf8)"
        />
        <StatCard
          icon={Clock3}
          title="Open Chats"
          value={data.cards.open.toLocaleString()}
          sub="Active conversations"
          badge={data.cards.total > 0 ? `${((data.cards.open / data.cards.total) * 100).toFixed(1)}%` : "—"}
          gradient="bg-gradient-to-br from-[#ea580c] via-[#f97316] to-[#fb923c]"
          glowColor="#fed7aa"
          accentBar="linear-gradient(to right, #fdba74, #fbbf24)"
        />
        <StatCard
          icon={CheckCircle2}
          title="Closed Chats"
          value={data.cards.closed.toLocaleString()}
          sub="Resolved conversations"
          badge={data.cards.total > 0 ? `${((data.cards.closed / data.cards.total) * 100).toFixed(1)}%` : "—"}
          gradient="bg-gradient-to-br from-[#047857] via-[#059669] to-[#10b981]"
          glowColor="#6ee7b7"
          accentBar="linear-gradient(to right, #6ee7b7, #34d399)"
        />
        <StatCard
          icon={BarChart3}
          title="Avg Messages / Chat"
          value={data.cards.avgMessages.toFixed(1)}
          sub="Average engagement depth"
          badge="Avg"
          gradient="bg-gradient-to-br from-[#0369a1] via-[#0ea5e9] to-[#38bdf8]"
          glowColor="#bae6fd"
          accentBar="linear-gradient(to right, #7dd3fc, #818cf8)"
        />
        <div className="col-span-2 sm:col-span-1">
          <FeedbackStatCard
            thumbsUp={data.feedback.thumbsUp}
            thumbsDown={data.feedback.thumbsDown}
            gradient="bg-gradient-to-br from-[#be185d] via-[#ec4899] to-[#f472b6]"
          />
        </div>
      </section>

      {/* ── Charts Row 1 ── */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

        {/* Open vs Closed */}
        <ChartCard
          title="Open vs Closed"
          subtitle="Current workload distribution"
          accentColor="linear-gradient(to right, #10b981, #6366f1)"
        >
          <div className="mt-3 h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.openClosed} barSize={44}>
                <defs>
                  <linearGradient id="barOpen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                  <linearGradient id="barClosed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #e5e7eb", boxShadow: "0 4px 14px rgba(0,0,0,0.07)" }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  <Cell fill="url(#barOpen)" />
                  <Cell fill="url(#barClosed)" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Mini summary */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {data.openClosed.map((item, i) => (
              <div key={item.name} className={`rounded-xl px-3 py-2 ${i === 0 ? "bg-orange-50 border border-orange-100" : "bg-indigo-50 border border-indigo-100"}`}>
                <p className={`text-[18px] font-[800] ${i === 0 ? "text-orange-600" : "text-indigo-600"}`}>{item.value.toLocaleString()}</p>
                <p className="text-[11px] text-gray-500 font-medium">{item.name}</p>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Assigned vs Unassigned */}
        <ChartCard
          title="Assigned vs Unassigned"
          subtitle="Agent ownership split"
          accentColor="linear-gradient(to right, #7c3aed, #93c5fd)"
        >
          <div className="mt-2 flex items-center justify-center">
            <div className="relative" style={{ width: 140, height: 140 }}>
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <defs>
                    <linearGradient id="pieAssigned" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={data.assignedSplit}
                    innerRadius={42}
                    outerRadius={64}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    <Cell fill="url(#pieAssigned)" stroke="none" />
                    <Cell fill="#bfdbfe" stroke="none" />
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #e5e7eb" }} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[15px] font-[900] text-violet-700 leading-none">
                  {data.assignedSplit[0]?.value?.toLocaleString() ?? 0}
                </span>
                <span className="text-[9px] font-semibold text-gray-400 mt-0.5 uppercase tracking-widest">Assigned</span>
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {data.assignedSplit.map((item, idx) => {
              const color = idx === 0 ? "#7c3aed" : "#93c5fd";
              const total = data.assignedSplit.reduce((s, d) => s + d.value, 0);
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1 text-[12px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                      <span className="text-gray-600 font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-[700] text-gray-800">{item.value.toLocaleString()}</span>
                      <span className="text-[10px] font-semibold rounded-full px-1.5 py-0.5" style={{ background: color + "20", color }}>{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        {/* Escalated vs Non-escalated */}
        <ChartCard
          title="Escalated vs Non-escalated"
          subtitle="Trend over recent months"
          accentColor="linear-gradient(to right, #7c3aed, #10b981)"
        >
          <div className="mt-3 h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.escalationTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #e5e7eb", boxShadow: "0 4px 14px rgba(0,0,0,0.07)" }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 11, color: "#6b7280" }}>{v}</span>}
                />
                <Line type="monotone" dataKey="escalated" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 3.5, fill: "#7c3aed", strokeWidth: 0 }} name="Escalated" />
                <Line type="monotone" dataKey="normal" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3.5, fill: "#10b981", strokeWidth: 0 }} name="Non-escalated" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-violet-50 border border-violet-100 px-3 py-2">
              <p className="text-[16px] font-[800] text-violet-700">{data.cards.escalated.toLocaleString()}</p>
              <p className="text-[11px] text-gray-500">Total Escalated</p>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2">
              <p className="text-[16px] font-[800] text-emerald-700">{Math.max(data.cards.total - data.cards.escalated, 0).toLocaleString()}</p>
              <p className="text-[11px] text-gray-500">Total Non Escalated</p>
            </div>
          </div>
        </ChartCard>
      </section>

      {/* ── Charts Row 2 ── */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">

        {/* Conversation Status Mix */}
        <ChartCard
          title="Conversation Status Mix"
          subtitle="Resolution health breakdown"
          accentColor="linear-gradient(to right, #0ea95a, #f59e0b, #7c3aed)"
        >
          <div className="mt-3 flex flex-col lg:flex-row items-center gap-3">
            <div className="relative shrink-0" style={{ width: 140, height: 140 }}>
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={data.statusPie}
                    dataKey="value"
                    innerRadius={42}
                    outerRadius={64}
                    startAngle={90}
                    endAngle={-270}
                    strokeWidth={0}
                  >
                    {data.statusPie.map((item) => (
                      <Cell key={item.name} fill={item.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #e5e7eb" }} />
                </PieChart>
              </ResponsiveContainer>
              {(() => {
                const top = data.statusPie.reduce((a, b) => (a.value > b.value ? a : b), data.statusPie[0] ?? {});
                return (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[15px] font-[900] leading-none" style={{ color: top?.color ?? "#374151" }}>
                      {top?.value?.toLocaleString() ?? 0}
                    </span>
                    <span className="text-[9px] font-semibold text-gray-400 mt-0.5">{top?.name ?? ""}</span>
                  </div>
                );
              })()}
            </div>
            <div className="flex-1 space-y-2.5 w-full">
              {data.statusPie.map((item) => {
                const pct = data.cards.total > 0 ? Math.max(2, Math.round((item.value / data.cards.total) * 100)) : 0;
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1 text-[12px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                        <span className="font-[600] text-gray-700">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-[700] text-gray-900">{item.value.toLocaleString()}</span>
                        <span className="text-[10px] font-semibold rounded-full px-1.5 py-0.5" style={{ background: item.color + "20", color: item.color }}>{pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ChartCard>

        {/* Weekly Feedback Trend */}
        <ChartCard
          title="Weekly Feedback Trend"
          subtitle="Positive vs Negative ratings over time"
          accentColor="linear-gradient(to right, #22c55e, #ef4444)"
          extra={
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-[11px] font-[600] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
                <ThumbsUp className="h-3 w-3" /> Positive
              </span>
              <span className="flex items-center gap-1 text-[11px] font-[600] bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100">
                <ThumbsDown className="h-3 w-3" /> Negative
              </span>
            </div>
          }
        >
          {data.weeklyFeedback.length > 0 ? (
          <div className="mt-3 h-[170px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.weeklyFeedback} margin={{ top: 4, right: 10, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradPos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradNeg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    formatter={(val, name) => [val, name === "positive" ? "👍 Positive" : "👎 Negative"]}
                  />
                  <Legend
                    formatter={(v) => <span style={{ fontSize: 11, color: "#6b7280" }}>{v === "positive" ? "👍 Positive" : "👎 Negative"}</span>}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Line type="monotone" dataKey="positive" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4, fill: "#22c55e", strokeWidth: 0 }} activeDot={{ r: 6 }} name="positive" />
                  <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4, fill: "#ef4444", strokeWidth: 0 }} activeDot={{ r: 6 }} name="negative" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[170px] items-center justify-center text-[13px] text-gray-400">
              No feedback data available
            </div>
          )}
        </ChartCard>

      </section>
    </main>
  );
}

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
  { key: "",          label: "All" },
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

  const total       = getFirstNumber(root, ["total_chats", "total", "totalChats", "total_conversations"], fallback.cards.total);
  const open        = getFirstNumber(root, ["open_chats", "open", "openChats"], fallback.cards.open);
  const closed      = getFirstNumber(root, ["closed_chats", "closed", "closedChats"], fallback.cards.closed);
  const avgMessages = getFirstNumber(root, ["avg_messages_per_chat", "avgMessages", "avg_messages", "average_messages_per_chat"], fallback.cards.avgMessages);
  const assigned    = getFirstNumber(root, ["assigned_chats", "assigned", "assignedChats"], 0);
  const escalated   = getFirstNumber(root, ["escalated", "escalated_chats", "escalatedChats"], 0);

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
    cards: { total, open, closed, avgMessages },
    openClosed: computedOpenClosed,
    assignedSplit: computedAssignedSplit,
    escalationTrend: escalationTrend.length > 0 ? escalationTrend : fallback.escalationTrend,
    statusPie: computedStatusPie,
    feedback: { thumbsUp, thumbsDown },
    weeklyFeedback,
  };
};

function StatCard({ icon: Icon, title, value, sub, gradient, badge }) {
  return (
    <article className={`flex h-[160px] flex-col justify-between rounded-2xl p-4 text-white shadow-lg ${gradient}`}>
      <div className="flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
          <Icon className="h-4 w-4" />
        </span>
        {badge ? (
          <span className="rounded-full bg-white/25 px-2 py-0.5 text-[11px] font-[600]">{badge}</span>
        ) : null}
      </div>
      <div>
        <p className="text-[24px] font-[800] leading-none">{value}</p>
        <p className="mt-1 text-[13px] font-[600] leading-tight">{title}</p>
        <p className="mt-1 text-[11px] text-white/80">{sub}</p>
      </div>
    </article>
  );
}

function FeedbackStatCard({ thumbsUp, thumbsDown, gradient }) {
  return (
    <article className={`flex h-[160px] flex-col justify-between overflow-hidden rounded-2xl p-3 text-white shadow-lg ${gradient}`}>
      {/* Top — icon */}
      <div className="flex items-start justify-start">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
          <MessageSquare className="h-4 w-4" />
        </span>
      </div>
      {/* Bottom — title, subtitle, thumb boxes */}
      <div className="flex flex-col gap-1">
        <p className="text-[13px] font-[700] leading-none">User Feedback</p>
        <p className="text-[10px] text-white/70 leading-none mb-0.5">Chatbot satisfaction</p>
        <div className="flex gap-1.5">
          <div className="flex flex-1 items-center gap-1 rounded-lg bg-white/20 px-2 py-1.5">
            <ThumbsUp className="h-3 w-3 shrink-0" />
            <div className="min-w-0">
              <p className="text-[13px] font-[800] leading-none">{thumbsUp.toLocaleString()}</p>
              <p className="mt-0.5 text-[9px] text-white/80">Positive</p>
            </div>
          </div>
          <div className="flex flex-1 items-center gap-1 rounded-lg bg-white/20 px-2 py-1.5">
            <ThumbsDown className="h-3 w-3 shrink-0" />
            <div className="min-w-0">
              <p className="text-[13px] font-[800] leading-none">{thumbsDown.toLocaleString()}</p>
              <p className="mt-0.5 text-[9px] text-white/80">Negative</p>
            </div>
          </div>
        </div>
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
        if (selectedFilter) params.range = selectedFilter;

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
    <main className="min-h-[calc(100vh-60px)] bg-[#f4f5f7] p-6">
      <section className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-[800] leading-none text-[#0b1b3b]">Web Chat Metrics</h1>
          <p className="mt-2 text-[14px] text-gray-500">Last updated: {data.updatedAt}</p>
          {/* {loading ? <p className="mt-1 text-[13px] text-slate-500">Loading latest stats...</p> : null}
          {errorText ? <p className="mt-1 text-[13px] text-amber-600">{errorText}</p> : null} */}
        </div>
        <div className="flex items-center gap-2">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSelectedFilter(opt.key)}
              className={`rounded-xl border px-4 py-2 text-[13px] font-[600] transition ${
                selectedFilter === opt.key
                  ? "border-[#6366f1] bg-[#6366f1] text-white shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-[14px] font-[600] text-gray-700"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={MessageSquare}
          title="Total Chats"
          value={data.cards.total.toLocaleString()}
          sub="Since launch"
          badge="All time"
          gradient="bg-gradient-to-br from-[#a21caf] to-[#6d28d9]"
        />
        <StatCard
          icon={Clock3}
          title="Open Chats"
          value={data.cards.open.toLocaleString()}
          sub="Active conversations"
          badge="14.5%"
          gradient="bg-gradient-to-br from-[#f97316] to-[#ea580c]"
        />
        <StatCard
          icon={CheckCircle2}
          title="Closed Chats"
          value={data.cards.closed.toLocaleString()}
          sub="Resolved conversations"
          badge="85.5%"
          gradient="bg-gradient-to-br from-[#16a34a] to-[#059669]"
        />
        <StatCard
          icon={BarChart3}
          title="Messages per Chat"
          value={data.cards.avgMessages.toFixed(1)}
          sub="Average engagement"
          badge="Avg"
          gradient="bg-gradient-to-br from-[#0ea5e9] to-[#0e7490]"
        />
        <FeedbackStatCard
          thumbsUp={data.feedback.thumbsUp}
          thumbsDown={data.feedback.thumbsDown}
          gradient="bg-gradient-to-br from-[#ec4899] to-[#db2777]"
        />
      </section>

      {/* ── Feedback Card (moved to top stat cards row) ── */}
      {/* <section className="mb-6">
        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4"> */}
          {/* <div className="grid grid-cols-2 gap-4"> */}
            {/* Thumbs Up */}
            {/* <div className="flex items-center gap-4 rounded-xl bg-green-50 border border-green-100 px-5 py-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-500 shadow-sm">
                <ThumbsUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-[30px] font-[800] leading-none text-green-700">{data.feedback.thumbsUp.toLocaleString()}</p>
                <p className="text-[12px] font-[600] text-green-600 mt-1">Positive ratings</p>
              </div>
            </div> */}
            {/* Thumbs Down */}
            {/* <div className="flex items-center gap-4 rounded-xl bg-red-50 border border-red-100 px-5 py-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500 shadow-sm">
                <ThumbsDown className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-[30px] font-[800] leading-none text-red-600">{data.feedback.thumbsDown.toLocaleString()}</p>
                <p className="text-[12px] font-[600] text-red-500 mt-1">Negative ratings</p>
              </div>
            </div> */}
       {/* Progress bar */}
          {/* {(() => {
            const total = data.feedback.thumbsUp + data.feedback.thumbsDown;
            const upPct = total > 0 ? Math.round((data.feedback.thumbsUp / total) * 100) : 0;
            return (
              <div className="mt-4">
                <div className="flex justify-between text-[11px] font-[600] text-gray-500 mb-1">
                  <span className="text-green-600">{upPct}% positive</span>
                  <span className="text-red-500">{100 - upPct}% negative</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-red-100 overflow-hidden">
                  <div className="h-full rounded-full bg-green-500 transition-all duration-500" style={{ width: `${upPct}%` }} />
                </div>
              </div>
            );
          })()}
        </article>
      </section> */}

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-[20px] font-[700] text-[#0b1b3b]">Open vs Closed</h3>
          <p className="mt-1 text-[14px] text-gray-500">Current workload distribution</p>
          <div className="mt-3 h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.openClosed} barSize={56}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  <Cell fill="#10b981" />
                  <Cell fill="#6366f1" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-[20px] font-[700] text-[#0b1b3b]">Assigned vs Unassigned</h3>
          <p className="mt-1 text-[14px] text-gray-500">Agent ownership split</p>
          <div className="mt-3 h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.assignedSplit}
                  innerRadius={52}
                  outerRadius={88}
                  dataKey="value"
                  labelLine={false}
                >
                  <Cell fill="#7c3aed" />
                  <Cell fill="#93c5fd" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2">
            {data.assignedSplit.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: idx === 0 ? "#7c3aed" : "#93c5fd" }} />
                  {item.name}
                </div>
                <span className="font-[700] text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-[20px] font-[700] text-[#0b1b3b]">Escalated vs Non-escalated</h3>
          <p className="mt-1 text-[14px] text-gray-500">Trend over recent months</p>
          <div className="mt-3 h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.escalationTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="escalated" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4 }} name="Escalated" />
                <Line type="monotone" dataKey="normal" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Non-escalated" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      {/* ── Conversation Status Mix + Weekly Feedback Trend — side by side ── */}
      <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* Card 1 — Conversation Status Mix */}
        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-[20px] font-[700] text-[#0b1b3b]">Conversation Status Mix</h3>
          <p className="mt-1 text-[14px] text-gray-500">Resolution health breakdown</p>
          <div className="mt-4 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.statusPie} dataKey="value" innerRadius={54} outerRadius={88}>
                  {data.statusPie.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-2.5">
            {data.statusPie.map((item) => (
              <div key={item.name} className="rounded-xl border border-gray-100 bg-[#f8fafc] p-3">
                <div className="mb-2 flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: item.color }} />
                    <span className="font-[600] text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-[700] text-gray-900">{item.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${data.cards.total > 0 ? Math.max(4, Math.round((item.value / data.cards.total) * 100)) : 0}%`,
                      background: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Card 2 — Weekly Feedback Trend */}
        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-[20px] font-[700] text-[#0b1b3b]">Weekly Feedback Trend</h3>
            <span className="flex items-center gap-1 text-[11px] font-[600] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
              <ThumbsUp className="h-3 w-3" /> Positive
            </span>
            <span className="flex items-center gap-1 text-[11px] font-[600] bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100">
              <ThumbsDown className="h-3 w-3" /> Negative
            </span>
          </div>
          {data.weeklyFeedback.length > 0 ? (
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.weeklyFeedback} margin={{ top: 4, right: 10, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: "none", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    formatter={(val, name) => [val, name === "positive" ? "👍 Positive" : "👎 Negative"]}
                  />
                  <Legend
                    formatter={(value) => value === "positive" ? "👍 Positive" : "👎 Negative"}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  />
                  <Line type="linear" dataKey="positive" stroke="#22c55e" strokeWidth={2.5} dot={false} activeDot={false} name="positive" />
                  <Line type="linear" dataKey="negative" stroke="#ef4444" strokeWidth={2.5} dot={false} activeDot={false} name="negative" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[340px] items-center justify-center text-[13px] text-gray-400">
              No feedback data available
            </div>
          )}
        </article>

      </section>
    </main>
  );
}

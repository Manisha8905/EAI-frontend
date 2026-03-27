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
  ResponsiveContainer,
} from "recharts";
import {
  MessageSquare,
  Clock3,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  ShieldAlert,
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
  },
};

const RANGE_OPTIONS = [
  { key: "this_year", label: "This Year" },
  { key: "this_quarter", label: "This Quarter" },
  { key: "this_month", label: "This Month" },
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
  const root = payload?.webchat ?? payload?.data?.webchat ?? payload?.stats?.webchat ?? payload?.data ?? payload?.stats ?? payload ?? {};
  const cards = root?.cards ?? root;

  const total = getFirstNumber(cards, ["total", "total_chats", "totalChats", "total_conversations"], fallback.cards.total);
  const open = getFirstNumber(cards, ["open", "open_chats", "openChats"], fallback.cards.open);
  const closed = getFirstNumber(cards, ["closed", "closed_chats", "closedChats"], fallback.cards.closed);
  const avgMessages = getFirstNumber(
    cards,
    ["avgMessages", "avg_messages", "avg_messages_per_chat", "average_messages_per_chat"],
    fallback.cards.avgMessages,
  );

  const openClosed = mapNameValueArray(
    root?.openClosed ?? root?.open_closed ?? root?.open_closed_split,
    ["name", "label", "status"],
    ["value", "count", "total"],
  );

  const assignedSplit = mapNameValueArray(
    root?.assignedSplit ?? root?.assigned_split ?? root?.assignment_split,
    ["name", "label", "status"],
    ["value", "count", "total"],
  );

  const escalationTrend = mapEscalationTrend(
    root?.escalationTrend ?? root?.escalation_trend ?? root?.escalation_over_time,
  );

  const statusPie = mapStatusPie(root?.statusPie ?? root?.status_pie ?? root?.status_mix);

  const computedOpenClosed =
    openClosed.length > 0
      ? openClosed
      : [
          { name: "Open", value: open },
          { name: "Closed", value: closed },
        ];

  const computedAssignedSplit =
    assignedSplit.length > 0
      ? assignedSplit
      : [
          {
            name: "Assigned",
            value: getFirstNumber(root, ["assigned", "assigned_chats", "assignedChats"], Math.max(total - open, 0)),
          },
          {
            name: "Unassigned",
            value: getFirstNumber(root, ["unassigned", "unassigned_chats", "unassignedChats"], open),
          },
        ];

  const computedStatusPie =
    statusPie.length > 0
      ? statusPie
      : [
          {
            name: "Resolved",
            value: getFirstNumber(root, ["resolved", "resolved_chats", "resolvedChats"], closed),
            color: "#0ea95a",
          },
          {
            name: "Waiting",
            value: getFirstNumber(root, ["waiting", "waiting_chats", "waitingChats"], open),
            color: "#f59e0b",
          },
          {
            name: "Escalated",
            value: getFirstNumber(root, ["escalated", "escalated_chats", "escalatedChats"], 0),
            color: "#7c3aed",
          },
        ];

  return {
    updatedAt: root?.updatedAt ?? root?.updated_at ?? new Date().toLocaleTimeString(),
    cards: {
      total,
      open,
      closed,
      avgMessages,
    },
    openClosed: computedOpenClosed,
    assignedSplit: computedAssignedSplit,
    escalationTrend: escalationTrend.length > 0 ? escalationTrend : fallback.escalationTrend,
    statusPie: computedStatusPie,
  };
};

function StatCard({ icon: Icon, title, value, sub, gradient, badge }) {
  return (
    <article className={`rounded-2xl p-5 text-white shadow-lg ${gradient}`}>
      <div className="mb-5 flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
          <Icon className="h-5 w-5" />
        </span>
        {badge ? (
          <span className="rounded-full bg-white/25 px-2.5 py-1 text-[12px] font-[600]">{badge}</span>
        ) : null}
      </div>
      <p className="text-[28px] font-[800] leading-none">{value}</p>
      <p className="mt-2 text-[16px] font-[600] leading-tight">{title}</p>
      <p className="mt-2 text-[13px] text-white/80">{sub}</p>
    </article>
  );
}

export default function SupportChatbotMetrics() {
  const [selectedRange, setSelectedRange] = useState("");
  const [data, setData] = useState(CHANNEL_DATA.webchat);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const role = typeof window === "undefined" ? "" : normalizeRole(localStorage.getItem("userRole"));
  const canAccessSupportMetrics = role === "SUPPORT" || role === "MANAGER";

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
        if (selectedRange) {
          params.range = selectedRange;
        }

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
    [selectedRange],
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
      <section className="mb-5 flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div>
          <h1 className="text-[24px] font-[800] leading-none text-[#0b1b3b]">Web Chat Metrics</h1>
          <p className="mt-2 text-[14px] text-gray-500">Last updated: {data.updatedAt}</p>
          {/* {loading ? <p className="mt-1 text-[13px] text-slate-500">Loading latest stats...</p> : null}
          {errorText ? <p className="mt-1 text-[13px] text-amber-600">{errorText}</p> : null} */}
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-[14px] text-gray-600"
          >
            <option value="">All Data</option>
            {RANGE_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-[14px] font-[600] text-gray-700"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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
      </section>

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

      <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-[20px] font-[700] text-[#0b1b3b]">Conversation Status Mix</h3>
        <p className="mt-1 text-[14px] text-gray-500">Pie view for resolution health</p>
        <div className="mt-4 grid grid-cols-1 items-center gap-4 md:grid-cols-3">
          <div className="md:col-span-1 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.statusPie} dataKey="value" innerRadius={58} outerRadius={95}>
                  {data.statusPie.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="md:col-span-2 space-y-3">
            {data.statusPie.map((item) => (
              <div key={item.name} className="rounded-xl border border-gray-100 bg-[#f8fafc] p-3">
                <div className="mb-2 flex items-center justify-between text-[14px]">
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
                      width: `${Math.max(4, Math.round((item.value / data.cards.total) * 100))}%`,
                      background: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

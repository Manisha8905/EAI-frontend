"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
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
  ArrowLeft,
  Phone,
  Calendar,
  Target,
  Clock,
  Eye,
  X,
} from "lucide-react";
import { fetchInboundCallHistory } from "../../Redux/actions/authActions";

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-green-50 text-green-700 border border-green-200",
  ANSWERED: "bg-green-50 text-green-700 border border-green-200",
  MISSED: "bg-red-50 text-red-600 border border-red-200",
  FAILED: "bg-red-50 text-red-600 border border-red-200",
  IN_PROGRESS: "bg-blue-50 text-blue-600 border border-blue-200",
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
};

const STATUS_DOT: Record<string, string> = {
  COMPLETED: "bg-green-500",
  ANSWERED: "bg-green-500",
  MISSED: "bg-red-500",
  FAILED: "bg-red-500",
  IN_PROGRESS: "bg-blue-500 animate-pulse",
  PENDING: "bg-amber-400",
};

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 shadow-md rounded-lg px-3 py-2 text-[12px]">
      <p className="font-semibold text-gray-700 mb-0.5">{label}</p>
      <p className="text-indigo-600 font-bold">{payload[0].value} calls</p>
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

function DonutChart({ rate }: { rate: number }) {
  return (
    <div className="relative flex items-center justify-center">
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          <Pie
            data={[
              { name: "With Meeting", value: rate },
              { name: "No Meeting", value: 100 - rate },
            ]}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill="#7c3aed" />
            <Cell fill="#ede9fe" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[26px] font-bold text-gray-900 leading-none">{rate}%</span>
        <span className="text-[11px] text-violet-600 font-semibold mt-1">Meeting Rate</span>
      </div>
    </div>
  );
}

function KpiCard({ gradient, shadow, icon: Icon, label, value }: any) {
  return (
    <article className={`rounded-2xl ${gradient} ${shadow} p-4 sm:p-5 text-white`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white/20">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </div>
      </div>
      <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-white/70 mb-2">{label}</p>
      <p className="text-[24px] sm:text-[32px] font-bold leading-none">{value}</p>
    </article>
  );
}

export default function Reporting() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<any>();

  const { inboundCallHistory = [], inboundHistoryLoading } = useSelector(
    (state: any) => state.admin,
  );

  const tableRef = useRef<HTMLElement | null>(null);
  const [selectedTranscript, setSelectedTranscript] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchInboundCallHistory());
  }, [dispatch]);

  useEffect(() => {
    if (searchParams.get("section") !== "history") return;
    const id = setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => clearTimeout(id);
  }, [searchParams]);

  const getTranscriptText = (row: any) =>
    row?.transcript ?? row?.summary ?? row?.call_summary ?? row?.notes ?? "";

  const getDurationText = (row: any) => {
    const raw = row?.duration;
    if (raw === null || raw === undefined || raw === "") return "0 min";
    const numeric = Number(raw);
    if (Number.isNaN(numeric)) return `${raw}`;
    return `${numeric} min`;
  };

  const totalCalls = inboundCallHistory.length;
  const meetingsCount = inboundCallHistory.filter((r: any) => r.meeting).length;
  const meetingRate = totalCalls ? Math.round((meetingsCount / totalCalls) * 100) : 0;
  const completedCalls = inboundCallHistory.filter(
    (r: any) => r.status === "COMPLETED" || r.status === "ANSWERED",
  ).length;

  const statusMap: Record<string, number> = {};
  for (const r of inboundCallHistory) {
    const s = r.status || "UNKNOWN";
    statusMap[s] = (statusMap[s] ?? 0) + 1;
  }
  const barData = Object.entries(statusMap).map(([x, v]) => ({ x, v }));

  const monthMap: Record<string, { calls: number; meetings: number }> = {};
  for (const r of inboundCallHistory) {
    const raw = r.dateTime;
    let label = "-";
    if (raw && raw !== "-") {
      const d = new Date(raw);
      if (!Number.isNaN(d.getTime())) {
        label = d.toLocaleString("default", { month: "short" });
      }
    }
    if (!monthMap[label]) monthMap[label] = { calls: 0, meetings: 0 };
    monthMap[label].calls += 1;
    if (r.meeting) monthMap[label].meetings += 1;
  }
  const lineData = Object.entries(monthMap).map(([x, { calls, meetings }]) => ({
    x,
    calls,
    meetings,
  }));

  return (
    <main className="min-h-[calc(100vh-60px)] bg-[#f4f5f7] p-3 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/metrics?tab=inbound")}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div>
          <h2 className="text-[16px] font-bold text-gray-900">Inbound Call Reporting</h2>
          <p className="text-[12px] text-gray-400">Live data from the inbound call history API</p>
        </div>
      </div>

      {inboundHistoryLoading && (
        <div className="flex items-center justify-center py-24 text-gray-400 text-[14px] animate-pulse">
          Loading call history...
        </div>
      )}

      {!inboundHistoryLoading && (
        <>
          <section className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <KpiCard
              gradient="bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]"
              shadow="shadow-lg shadow-indigo-400/25"
              icon={Phone}
              label="Total Calls"
              value={totalCalls}
            />
            <KpiCard
              gradient="bg-gradient-to-br from-[#14b8a6] to-[#0d9488]"
              shadow="shadow-lg shadow-teal-400/25"
              icon={Target}
              label="Completed Calls"
              value={completedCalls}
            />
            <KpiCard
              gradient="bg-gradient-to-br from-[#a855f7] to-[#7c3aed]"
              shadow="shadow-lg shadow-purple-400/25"
              icon={Calendar}
              label="Meetings Scheduled"
              value={meetingsCount}
            />
            <KpiCard
              gradient="bg-gradient-to-br from-[#0ea5e9] to-[#0891b2]"
              shadow="shadow-lg shadow-sky-400/25"
              icon={Clock}
              label="Meeting Rate"
              value={`${meetingRate}%`}
            />
          </section>

          <section className="mb-5 grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
            <article className="lg:col-span-1 rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
              <h3 className="text-[14px] font-semibold text-gray-900 mb-0.5">Calls by Status</h3>
              <p className="text-[12px] text-gray-400 mb-4">Distribution across call outcomes</p>
              {barData.length === 0 ? (
                <p className="text-[12px] text-gray-400 text-center py-16">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData} barSize={22}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="x" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: "#f5f3ff" }} />
                    <Bar dataKey="v" radius={[5, 5, 0, 0]}>
                      {barData.map((_: any, i: number) => (
                        <Cell key={i} fill={i % 2 === 0 ? "#7c3aed" : "#c4b5fd"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </article>

            <article className="lg:col-span-1 rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
              <h3 className="text-[14px] font-semibold text-gray-900 mb-0.5">Calls vs Meetings</h3>
              <p className="text-[12px] text-gray-400 mb-4">Monthly trend</p>
              {lineData.length === 0 ? (
                <p className="text-[12px] text-gray-400 text-center py-16">No data</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="x" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={28} />
                      <Tooltip content={<LineTooltip />} />
                      <Line name="Calls" type="monotone" dataKey="calls" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: "#6366f1" }} activeDot={{ r: 5 }} />
                      <Line name="Meetings" type="monotone" dataKey="meetings" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: "#22c55e" }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1.5 text-[11px] text-gray-500"><span className="w-3 h-0.5 rounded bg-indigo-500 inline-block" /> Calls</span>
                    <span className="flex items-center gap-1.5 text-[11px] text-gray-500"><span className="w-3 h-0.5 rounded bg-green-500 inline-block" /> Meetings</span>
                  </div>
                </>
              )}
            </article>

            <article className="lg:col-span-1 rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex flex-col items-center justify-center">
              <h3 className="text-[14px] font-semibold text-gray-900 mb-0.5 self-start">Meeting Conversion</h3>
              <p className="text-[12px] text-gray-400 mb-4 self-start">Calls that resulted in a meeting</p>
              <DonutChart rate={meetingRate} />
              <div className="mt-3 flex gap-5 text-[12px]">
                <span className="flex items-center gap-1.5 text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-violet-600 inline-block shrink-0" />With Meeting</span>
                <span className="flex items-center gap-1.5 text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-violet-100 inline-block shrink-0" />No Meeting</span>
              </div>
            </article>
          </section>

          <section ref={tableRef} className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-[14px] font-semibold text-gray-900">Inbound Call History</h3>
                <p className="text-[12px] text-gray-400 mt-0.5">{totalCalls} records retrieved from API</p>
              </div>
            </div>

            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Name", "Phone", "Company", "Date / Time", "Duration", "Status", "Meeting", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3 text-[11px] font-[600] uppercase tracking-wide text-gray-500 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inboundCallHistory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-[13px] text-gray-400">
                        No call history available.
                      </td>
                    </tr>
                  ) : (
                    inboundCallHistory.map((row: any, idx: number) => {
                      const statusKey = row.status?.toUpperCase() ?? "";
                      return (
                        <tr key={idx} className={`border-b border-gray-50 transition hover:bg-gray-50/70 ${idx % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                          <td className="px-5 py-3.5 text-[13px] font-[500] text-gray-800 whitespace-nowrap">{row.name}</td>
                          <td className="px-5 py-3.5 text-[12px] text-gray-600 font-mono whitespace-nowrap">{row.phone}</td>
                          <td className="px-5 py-3.5 text-[13px] text-gray-700 whitespace-nowrap">{row.company}</td>
                          <td className="px-5 py-3.5 text-[12px] text-gray-500 whitespace-nowrap">{row.dateTime}</td>
                          <td className="px-5 py-3.5 text-[12px] text-gray-600 whitespace-nowrap">{row.duration}s</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-[600] whitespace-nowrap ${STATUS_STYLES[statusKey] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${STATUS_DOT[statusKey] ?? "bg-gray-400"}`} />
                              {row.status || "-"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            {row.meeting ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-[600] text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                                <Calendar className="h-3 w-3" /> Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[11px] font-[600] text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                                No
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <button
                              type="button"
                              onClick={() => setSelectedTranscript(row)}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#1d4ed8] px-3 py-1.5 text-[11px] font-[600] text-white hover:bg-blue-700 transition"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-[12px] text-gray-400">Showing {totalCalls} records</p>
              <button
                type="button"
                onClick={() => router.push("/metrics?tab=inbound")}
                className="flex items-center gap-1.5 text-[12px] font-[500] text-violet-600 hover:text-violet-800 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Inbound Dashboard
              </button>
            </div>
          </section>

          {selectedTranscript && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
              onClick={() => setSelectedTranscript(null)}
            >
              <div
                className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 flex-shrink-0">
                  <h2 className="text-[16px] font-[700] text-gray-900">Call Transcript</h2>
                  <button
                    type="button"
                    onClick={() => setSelectedTranscript(null)}
                    className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-5 px-6 py-5 overflow-y-auto flex-1">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[
                      ["Lead Name", selectedTranscript.name ?? "-"],
                      ["Company", selectedTranscript.company ?? "-"],
                      ["Date & Time", selectedTranscript.dateTime ?? "-"],
                      ["Duration", getDurationText(selectedTranscript)],
                    ].map(([label, value]) => (
                      <div key={String(label)}>
                        <p className="mb-0.5 text-[11px] font-[600] uppercase tracking-wide text-blue-500">
                          {label}
                        </p>
                        <p className="whitespace-pre-line text-[13px] font-[500] text-gray-800">{String(value)}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="mb-2 text-[12px] font-[600] text-gray-700">Transcript</p>
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      {getTranscriptText(selectedTranscript) ? (
                        <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-gray-600">
                          {getTranscriptText(selectedTranscript)}
                        </p>
                      ) : (
                        <p className="text-[12px] italic text-gray-400">
                          No transcript available for this call.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}

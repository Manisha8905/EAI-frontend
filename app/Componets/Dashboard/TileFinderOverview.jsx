"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Search,
  Image as ImageIcon,
  Link2,
  BarChart2,
  Clock,
  TrendingUp,
} from "lucide-react";

/* ── Mock data ──────────────────────────────────────────────── */
const SEARCH_VOLUME_DATA = [
  { day: "Apr 7",  searches: 42 },
  { day: "Apr 8",  searches: 58 },
  { day: "Apr 9",  searches: 35 },
  { day: "Apr 10", searches: 70 },
  { day: "Apr 11", searches: 52 },
  { day: "Apr 12", searches: 88 },
  { day: "Apr 13", searches: 61 },
  { day: "Apr 14", searches: 74 },
  { day: "Apr 15", searches: 45 },
  { day: "Apr 16", searches: 92 },
  { day: "Apr 17", searches: 67 },
  { day: "Apr 18", searches: 50 },
  { day: "Apr 19", searches: 83 },
  { day: "Apr 20", searches: 71 },
  { day: "Apr 21", searches: 60 },
  { day: "Apr 22", searches: 95 },
  { day: "Apr 23", searches: 48 },
  { day: "Apr 24", searches: 76 },
  { day: "Apr 25", searches: 55 },
  { day: "Apr 26", searches: 80 },
  { day: "Apr 27", searches: 64 },
  { day: "Apr 28", searches: 90 },
  { day: "Apr 29", searches: 53 },
  { day: "Apr 30", searches: 68 },
  { day: "May 1",  searches: 77 },
  { day: "May 2",  searches: 44 },
  { day: "May 3",  searches: 86 },
  { day: "May 4",  searches: 59 },
  { day: "May 5",  searches: 72 },
  { day: "May 6",  searches: 48 },
];

const IMAGE_URL_DATA = [
  { week: "Week 1", image: 85,  url: 30 },
  { week: "Week 2", image: 110, url: 42 },
  { week: "Week 3", image: 95,  url: 55 },
  { week: "Week 4", image: 130, url: 38 },
  { week: "Week 5", image: 105, url: 60 },
  { week: "Week 6", image: 145, url: 48 },
  { week: "Week 7", image: 120, url: 52 },
  { week: "Week 8", image: 160, url: 55 },
];

const FILTER_OPTIONS = ["All", "Today", "This Week", "This Month", "Last 30 Days"];

/* ── KPI Card ────────────────────────────────────────────────── */
function KpiCard({ icon: Icon, gradient, badge, value, label, sub }) {
  return (
    <div
      className="relative flex flex-col justify-between rounded-2xl p-5 text-white overflow-hidden min-w-0"
      style={{ background: gradient }}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
          <Icon className="h-5 w-5 text-white" />
        </div>
        {badge && (
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-[700] text-white">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-[30px] font-[800] leading-none tracking-tight">{value}</p>
        <p className="mt-1.5 text-[13px] font-[600] text-white/90">{label}</p>
        {sub && (
          <p className="mt-1.5 text-[11px] font-[500] text-white/70 leading-snug">{sub}</p>
        )}
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────── */
export default function TileFinderOverview() {
  const [filter, setFilter] = useState("All");

  const kpiCards = [
    {
      icon: Search,
      gradient: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
      badge: "+14%",
      value: "1,620",
      label: "Total Searches",
      sub: "312 Today | 1,840 Week | 7,420 Month",
    },
    {
      icon: ImageIcon,
      gradient: "linear-gradient(135deg, #0d9488 0%, #059669 100%)",
      badge: null,
      value: "1,240",
      label: "Images Processed",
      sub: "✓ 1,198 Success | ✗ 42 Failed",
    },
    {
      icon: Link2,
      gradient: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
      badge: null,
      value: "380",
      label: "URLs Processed",
      sub: "✓ 371 Success | ✗ 9 Failed",
    },
    {
      icon: BarChart2,
      gradient: "linear-gradient(135deg, #0891b2 0%, #0d9488 100%)",
      badge: null,
      value: "0.79",
      label: "Avg Similarity (All)",
      sub: null,
    },
    {
      icon: Clock,
      gradient: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
      badge: null,
      value: "2.3s",
      label: "Avg Response Time",
      sub: "0.8s CV | 1.1s GPT | 0.4s Search",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#f4f5f7] p-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-[22px] font-[800] text-[#061a43]">Analytics - Overview</h1>
        <p className="text-[14px] text-gray-500">
          Monitor usage, performance, and catalog metrics
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div>
          <p className="text-[14px] font-[700] text-[#061a43]">Filter Data</p>
          <p className="text-[12px] text-gray-400">Select time period for analytics</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-[13px] font-[600] text-[#253b69] outline-none focus:border-[#7c3aed]"
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpiCards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Search Volume Over Time */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-[#7c3aed]" />
              <h3 className="text-[15px] font-[700] text-[#061a43]">Search Volume Over Time</h3>
            </div>
            <p className="text-[12px] text-gray-400">Daily search activity over last 30 days</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={SEARCH_VOLUME_DATA} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="searchGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                interval={4}
              />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
                labelStyle={{ fontWeight: 700, color: "#061a43" }}
              />
              <Area
                type="monotone"
                dataKey="searches"
                stroke="#7c3aed"
                strokeWidth={2.5}
                fill="url(#searchGradient)"
                dot={false}
                activeDot={{ r: 5, fill: "#7c3aed" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Image vs URL Usage */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 className="h-4 w-4 text-[#0d9488]" />
              <h3 className="text-[15px] font-[700] text-[#061a43]">Image vs URL Usage</h3>
            </div>
            <p className="text-[12px] text-gray-400">Input type trends over time</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={IMAGE_URL_DATA} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
                labelStyle={{ fontWeight: 700, color: "#061a43" }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              <Bar dataKey="image" name="Image Searches" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="url" name="URL Searches" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

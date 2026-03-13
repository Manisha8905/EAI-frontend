"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  ArrowLeft,
  Search,
  RefreshCw,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  Filter,
  Download,
  Plus,
  X,
  ChevronDown,
  FileText,
  Target,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   STATIC DATA
══════════════════════════════════════════════════════════════ */
const campaigns = [
  {
    id: 1,
    name: "Enterprise Solution Outreach",
    description: "Targeting mid-market enterprise decision makers via outbound call strategy",
    status: "ACTIVE",
    channel: "CALL",
    startDate: "Jan 15, 2026",
    endDate: "Mar 30, 2026",
    stats: { totalCalls: 1245, completed: 892, meetings: 46, convRate: "5.2%" },
    kpis: [
      { label: "Total Calls",     value: "1,245", color: "text-gray-900"   },
      { label: "Completed",       value: "892",   color: "text-green-600"  },
      { label: "Meetings",        value: "46",    color: "text-blue-600"   },
      { label: "Conversion Rate", value: "5.2%",  color: "text-violet-600" },
    ],
    callHistory: [
      { name: "Anthony Yeates",  email: "rtysson7926@gm...", phone: "+918949575172", company: "Tech Solutions Inc",   date: "Jan 30, 2026", time: "12:28 PM", status: "Voice Mail", meeting: false, tasks: 1 },
      { name: "Samantha Reed",   email: "s.reed@acme.com",   phone: "+14085551234",  company: "Acme Corp",           date: "Jan 31, 2026", time: "10:15 AM", status: "Connected",  meeting: true,  tasks: 3 },
      { name: "Marcus Liu",      email: "m.liu@nexgen.io",   phone: "+6591234567",   company: "NexGen Technologies", date: "Feb 1, 2026",  time: "03:42 PM", status: "No Answer",  meeting: false, tasks: 0 },
      { name: "Priya Sharma",    email: "priya@globalink.co",phone: "+912234567890", company: "GlobalInk Ltd",       date: "Feb 3, 2026",  time: "11:00 AM", status: "Connected",  meeting: true,  tasks: 2 },
      { name: "James Whitfield", email: "jwhit@oriongrp.com",phone: "+14155556789",  company: "Orion Group",         date: "Feb 4, 2026",  time: "02:20 PM", status: "Busy",       meeting: false, tasks: 0 },
      { name: "Lena Müller",     email: "lena@zentrix.de",   phone: "+4915901234567",company: "Zentrix GmbH",        date: "Feb 5, 2026",  time: "09:55 AM", status: "Voice Mail", meeting: false, tasks: 1 },
    ],
  },
  {
    id: 2,
    name: "Q4 Decision Makers",
    description: "Reaching senior buyers at Fortune 500 companies for Q4 pipeline acceleration",
    status: "ACTIVE",
    channel: "CALL",
    startDate: "Dec 1, 2025",
    endDate: "Mar 15, 2026",
    stats: { totalCalls: 876, completed: 642, meetings: 32, convRate: "4.8%" },
    kpis: [
      { label: "Total Calls",     value: "876",  color: "text-gray-900"   },
      { label: "Completed",       value: "642",  color: "text-green-600"  },
      { label: "Meetings",        value: "32",   color: "text-blue-600"   },
      { label: "Conversion Rate", value: "4.8%", color: "text-violet-600" },
    ],
    callHistory: [
      { name: "Caroline Drake", email: "c.drake@pinnacle.io", phone: "+12125559876",  company: "Pinnacle Ventures", date: "Feb 2, 2026", time: "01:14 PM", status: "Connected",  meeting: true,  tasks: 2 },
      { name: "Raj Patel",      email: "raj@futurewave.com",  phone: "+919876543210", company: "FutureWave Inc",    date: "Feb 3, 2026", time: "11:30 AM", status: "Voice Mail", meeting: false, tasks: 1 },
      { name: "Oliver Brooks",  email: "o.brooks@stratex.co", phone: "+447700900456", company: "Stratex Solutions", date: "Feb 5, 2026", time: "04:00 PM", status: "No Answer",  meeting: false, tasks: 0 },
      { name: "Yuki Tanaka",    email: "y.tanaka@softech.jp", phone: "+81312345678",  company: "Softech Japan",     date: "Feb 6, 2026", time: "10:45 AM", status: "Connected",  meeting: true,  tasks: 3 },
    ],
  },
  {
    id: 3,
    name: "SaaS Product Launch — APAC",
    description: "Email drip campaign targeting tech companies in APAC for new SaaS product launch",
    status: "PAUSED",
    channel: "EMAIL",
    startDate: "Feb 1, 2026",
    endDate: "Apr 30, 2026",
    stats: { totalCalls: 3200, completed: 1840, meetings: 28, convRate: "3.1%" },
    kpis: [
      { label: "Emails Sent", value: "3,200", color: "text-gray-900"   },
      { label: "Opened",      value: "1,840", color: "text-green-600"  },
      { label: "Meetings",    value: "28",    color: "text-blue-600"   },
      { label: "Click Rate",  value: "3.1%",  color: "text-violet-600" },
    ],
    callHistory: [
      { name: "Siti Aminah", email: "siti@techbridge.sg", phone: "N/A", company: "TechBridge SG", date: "Feb 8, 2026",  time: "08:00 AM", status: "Opened",  meeting: false, tasks: 0 },
      { name: "Chen Wei",    email: "c.wei@cloudnova.cn", phone: "N/A", company: "CloudNova",     date: "Feb 9, 2026",  time: "09:10 AM", status: "Clicked", meeting: true,  tasks: 2 },
      { name: "Anika Khatri",email: "anika@digitalm.in",  phone: "N/A", company: "Digital Minds", date: "Feb 10, 2026", time: "10:30 AM", status: "No Open", meeting: false, tasks: 0 },
    ],
  },
  {
    id: 4,
    name: "Renewal Outreach 2026",
    description: "Proactive renewal calls to existing customers whose contracts expire in Q2 2026",
    status: "COMPLETED",
    channel: "CALL",
    startDate: "Nov 1, 2025",
    endDate: "Jan 31, 2026",
    stats: { totalCalls: 540, completed: 480, meetings: 62, convRate: "11.5%" },
    kpis: [
      { label: "Total Calls",     value: "540",   color: "text-gray-900"   },
      { label: "Completed",       value: "480",   color: "text-green-600"  },
      { label: "Meetings",        value: "62",    color: "text-blue-600"   },
      { label: "Conversion Rate", value: "11.5%", color: "text-violet-600" },
    ],
    callHistory: [
      { name: "David Osei",     email: "d.osei@renewco.com", phone: "+233244123456", company: "RenewCo Ltd", date: "Jan 20, 2026", time: "02:00 PM", status: "Connected",  meeting: true,  tasks: 4 },
      { name: "Maria Santos",   email: "msantos@ibexa.mx",   phone: "+525544332211", company: "IBEXA Corp",  date: "Jan 22, 2026", time: "11:15 AM", status: "Connected",  meeting: true,  tasks: 2 },
      { name: "Frederic Blanc", email: "f.blanc@novafr.fr",  phone: "+33612345678",  company: "Nova FR",     date: "Jan 25, 2026", time: "03:30 PM", status: "Voice Mail", meeting: false, tasks: 1 },
    ],
  },
];

/* ── helpers ──────────────────────────────────────────────────── */
const STATUS_META = {
  ACTIVE:    { label: "Active",    bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200", dot: "bg-green-500",  Icon: PlayCircle   },
  PAUSED:    { label: "Paused",    bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200", dot: "bg-amber-400",  Icon: PauseCircle  },
  COMPLETED: { label: "Completed", bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",  dot: "bg-blue-500",   Icon: CheckCircle2 },
};

const CALL_STATUS_STYLE = {
  "Connected":  "bg-green-50 text-green-700 border border-green-200",
  "Voice Mail": "bg-violet-50 text-violet-700 border border-violet-200",
  "No Answer":  "bg-gray-100 text-gray-600 border border-gray-200",
  "Busy":       "bg-red-50 text-red-600 border border-red-200",
  "Opened":     "bg-blue-50 text-blue-700 border border-blue-200",
  "Clicked":    "bg-teal-50 text-teal-700 border border-teal-200",
  "No Open":    "bg-gray-100 text-gray-500 border border-gray-200",
};

const CHANNEL_META = {
  CALL:  { bg: "bg-sky-50",    text: "text-sky-700",    Icon: Phone },
  EMAIL: { bg: "bg-indigo-50", text: "text-indigo-700", Icon: Mail  },
};

/* ══════════════════════════════════════════════════════════════
   CAMPAIGN STATUS LIST
══════════════════════════════════════════════════════════════ */
function CampaignList({ campaigns, onViewDetails, onAddCampaign }) {
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [channelTab, setChannelTab]     = useState("CALL");
  const [period, setPeriod]             = useState("This Year");
  const [refreshing, setRefreshing]     = useState(false);
  const [showModal, setShowModal]       = useState(false);

  const visibleCampaigns = campaigns.filter((c) => c.channel === channelTab);

  const filtered = visibleCampaigns.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const periodOptions = ["This Week", "This Month", "This Year"];

  return (
    <main className="min-h-[calc(100vh-60px)] bg-[#f4f5f7]">

      {/* ── Channel tabs + period controls ── */}
      <div className="bg-white border-b border-gray-200 px-5 pt-4 pb-0 flex items-center justify-between gap-4 flex-wrap">
        {/* tabs */}
        <div className="flex items-center gap-1">
          {[
            { key: "CALL",  label: "Call Campaign",  Icon: Phone },
            { key: "EMAIL", label: "Email Campaign", Icon: Mail  },
          ].map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => { setChannelTab(key); setStatusFilter("ALL"); setSearch(""); }}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-[500] border-b-2 transition-all -mb-px ${
                channelTab === key
                  ? "border-[#6366f1] text-[#6366f1] bg-indigo-50/60"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* period + refresh */}
        <div className="flex items-center gap-2 pb-2">
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-[12px] text-gray-600 shadow-sm outline-none focus:ring-2 focus:ring-violet-400/30 cursor-pointer"
            >
              {periodOptions.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          </div>
          <button
            type="button"
            onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 700); }}
            className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 transition shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* ── section header + create button ── */}
        <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-poppins text-[17px] font-[700] text-[#0a0a0a]">
              {channelTab === "CALL" ? "Call Campaign Setup" : "Email Campaign Setup"}
            </h1>
            <p className="font-inter text-[13px] text-gray-500 mt-0.5">
              {channelTab === "CALL"
                ? "Create and manage AI SDR campaigns"
                : "Create and manage email drip campaigns"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0a0a0a] text-white text-[13px] font-[600] hover:bg-gray-800 transition shadow-md"
          >
            <Plus className="h-4 w-4" />
            Create New Campaign
          </button>
        </div>

        {/* ── search + status filter ── */}
        <div className="mb-5 flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search campaigns…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-[13px] rounded-lg border border-gray-200 bg-white shadow-sm outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-300"
            />
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-white border border-gray-200 p-1 shadow-sm shrink-0">
            {["ALL", "ACTIVE", "PAUSED", "COMPLETED"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-[12px] font-[500] transition-all ${
                  statusFilter === s
                    ? "bg-[#7c3aed] text-white shadow-md shadow-violet-400/30"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {s === "ALL" ? "All" : STATUS_META[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* ── summary KPI strip ── */}
        <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: PlayCircle,   label: "Active",          value: visibleCampaigns.filter((c) => c.status === "ACTIVE").length,    color: "text-green-600",  bg: "bg-green-50"  },
            { icon: PauseCircle,  label: "Paused",          value: visibleCampaigns.filter((c) => c.status === "PAUSED").length,    color: "text-amber-600",  bg: "bg-amber-50"  },
            { icon: CheckCircle2, label: "Completed",       value: visibleCampaigns.filter((c) => c.status === "COMPLETED").length, color: "text-blue-600",   bg: "bg-blue-50"   },
            { icon: TrendingUp,   label: "Total Campaigns", value: visibleCampaigns.length,                                         color: "text-violet-600", bg: "bg-violet-50" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <article key={label} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} shrink-0`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className={`text-[22px] font-[700] leading-none ${color}`}>{value}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
              </div>
            </article>
          ))}
        </section>

        {/* ── campaign cards grid ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Filter className="h-8 w-8 mb-3 opacity-40" />
            <p className="text-[14px] font-[500]">No campaigns match your filters</p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#7c3aed] text-white text-[13px] font-[600] hover:bg-violet-700 transition"
            >
              <Plus className="h-4 w-4" />
              Create Campaign
            </button>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filtered.map((c) => {
              const sm = STATUS_META[c.status];
              const ch = CHANNEL_META[c.channel];
              const ChIcon = ch.Icon;
              return (
                <article
                  key={c.id}
                  className="rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4"
                >
                  {/* card header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-[600] ${ch.bg} ${ch.text}`}>
                          <ChIcon className="h-3 w-3" />
                          {c.channel}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-[600] border ${sm.bg} ${sm.text} ${sm.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sm.dot}`} />
                          {sm.label}
                        </span>
                      </div>
                      <h2 className="font-poppins text-[14px] font-[700] text-[#0a0a0a] leading-snug">{c.name}</h2>
                      <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-2">{c.description}</p>
                    </div>
                  </div>

                  {/* stats row */}
                  <div className="grid grid-cols-4 gap-2 py-3 border-y border-gray-100">
                    {[
                      { label: c.channel === "EMAIL" ? "Emails Sent" : "Total Calls", value: c.stats.totalCalls.toLocaleString(), color: "text-gray-900"   },
                      { label: c.channel === "EMAIL" ? "Opened"      : "Completed",   value: c.stats.completed.toLocaleString(),  color: "text-green-600"  },
                      { label: "Meetings",                                             value: c.stats.meetings,                    color: "text-blue-600"   },
                      { label: c.channel === "EMAIL" ? "Click Rate"  : "Conv. Rate",  value: c.stats.convRate,                    color: "text-violet-600" },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <p className={`text-[16px] font-[700] leading-none ${s.color}`}>{s.value}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-1 leading-tight">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{c.startDate} → {c.endDate}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onViewDetails(c)}
                      className="px-4 py-2 rounded-lg bg-[#1d4ed8] text-white text-[12px] font-[600]
                                 hover:bg-blue-700 active:bg-blue-800 transition shadow-sm shadow-blue-400/30"
                    >
                      View Details
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>

      {/* ── Create Campaign Modal ── */}
      {showModal && (
        <CreateCampaignModal
          defaultChannel={channelTab}
          onClose={() => setShowModal(false)}
          onCreate={(newCampaign) => {
            onAddCampaign(newCampaign);
            setShowModal(false);
          }}
        />
      )}
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════
   CREATE CAMPAIGN MODAL
══════════════════════════════════════════════════════════════ */
const EMPTY_FORM = {
  name: "", description: "", channel: "CALL", status: "ACTIVE",
  startDate: "", endDate: "", targetLeads: "",
};

function CreateCampaignModal({ defaultChannel, onClose, onCreate }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, channel: defaultChannel });
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name      = "Campaign name is required";
    if (!form.startDate)          e.startDate = "Start date is required";
    if (!form.endDate)            e.endDate   = "End date is required";
    if (form.startDate && form.endDate && form.endDate < form.startDate)
                                  e.endDate   = "End date must be after start date";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const fmt = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const newCampaign = {
      id: Date.now(),
      name: form.name.trim(),
      description: form.description.trim() || `${form.channel === "CALL" ? "Outbound call" : "Email drip"} campaign`,
      status: form.status,
      channel: form.channel,
      startDate: fmt(form.startDate),
      endDate: fmt(form.endDate),
      stats: { totalCalls: 0, completed: 0, meetings: 0, convRate: "0%" },
      kpis: form.channel === "CALL"
        ? [
            { label: "Total Calls",     value: "0",   color: "text-gray-900"   },
            { label: "Completed",       value: "0",   color: "text-green-600"  },
            { label: "Meetings",        value: "0",   color: "text-blue-600"   },
            { label: "Conversion Rate", value: "0%",  color: "text-violet-600" },
          ]
        : [
            { label: "Emails Sent", value: "0",  color: "text-gray-900"   },
            { label: "Opened",      value: "0",  color: "text-green-600"  },
            { label: "Meetings",    value: "0",  color: "text-blue-600"   },
            { label: "Click Rate",  value: "0%", color: "text-violet-600" },
          ],
      callHistory: [],
    };
    onCreate(newCampaign);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#0a0a0a] to-[#1e1e2e]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
              <Target className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-[700] text-white">Create New Campaign</h2>
              <p className="text-[11px] text-white/50">Fill in the details below</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Campaign Type */}
          <div>
            <label className="block text-[12px] font-[600] text-gray-700 mb-2">Campaign Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "CALL",  label: "Call Campaign",  Icon: Phone, desc: "Outbound AI SDR calls" },
                { key: "EMAIL", label: "Email Campaign", Icon: Mail,  desc: "Email drip sequences"  },
              ].map(({ key, label, Icon, desc }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set("channel", key)}
                  className={`flex flex-col items-start gap-1 rounded-xl border-2 p-3.5 text-left transition ${
                    form.channel === key
                      ? "border-[#6366f1] bg-indigo-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className={`flex items-center gap-2 ${form.channel === key ? "text-indigo-700" : "text-gray-700"}`}>
                    <Icon className="h-4 w-4" />
                    <span className="text-[13px] font-[600]">{label}</span>
                  </div>
                  <span className="text-[11px] text-gray-400">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-[12px] font-[600] text-gray-700 mb-1.5">
              Campaign Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Q2 Enterprise Outreach"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={`w-full rounded-lg border px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-violet-400/30 ${
                errors.name ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-violet-300"
              }`}
            />
            {errors.name && <p className="mt-1 text-[11px] text-red-500">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] font-[600] text-gray-700 mb-1.5">Description</label>
            <textarea
              rows={2}
              placeholder="Brief campaign objective…"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-300 resize-none"
            />
          </div>

          {/* Status + Target Leads */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-[600] text-gray-700 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-violet-400/30"
              >
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-[600] text-gray-700 mb-1.5">Target Leads</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 500"
                value={form.targetLeads}
                onChange={(e) => set("targetLeads", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-300"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-[600] text-gray-700 mb-1.5">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className={`w-full rounded-lg border px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-violet-400/30 ${
                  errors.startDate ? "border-red-400" : "border-gray-200 focus:border-violet-300"
                }`}
              />
              {errors.startDate && <p className="mt-1 text-[11px] text-red-500">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-[12px] font-[600] text-gray-700 mb-1.5">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                className={`w-full rounded-lg border px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-violet-400/30 ${
                  errors.endDate ? "border-red-400" : "border-gray-200 focus:border-violet-300"
                }`}
              />
              {errors.endDate && <p className="mt-1 text-[11px] text-red-500">{errors.endDate}</p>}
            </div>
          </div>

          {/* actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-200 text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#0a0a0a] text-white text-[13px] font-[600] hover:bg-gray-800 transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Create Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CAMPAIGN DETAIL VIEW
══════════════════════════════════════════════════════════════ */
function CampaignDetail({ campaign, onBack }) {
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const sm     = STATUS_META[campaign.status];
  const ch     = CHANNEL_META[campaign.channel];
  const ChIcon = ch.Icon;

  const historyLabel    = campaign.channel === "EMAIL" ? "Email Activity" : "Call History";
  const uniqueStatuses  = ["ALL", ...new Set(campaign.callHistory.map((r) => r.status))];

  const rows = campaign.callHistory.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                        r.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <main className="min-h-[calc(100vh-60px)] bg-[#f4f5f7] p-4">

      {/* ── top bar ── */}
      <div className="mb-5 flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white
                     text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex-1 min-w-0 flex items-center gap-3 flex-wrap">
          <h1 className="font-poppins text-[16px] font-[700] text-[#0a0a0a] truncate">
            {campaign.name} — {campaign.channel === "EMAIL" ? "Email" : "Call"} Campaign Details
          </h1>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-[600] border shrink-0 ${sm.bg} ${sm.text} ${sm.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />
            {sm.label}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-[600] shrink-0 ${ch.bg} ${ch.text}`}>
            <ChIcon className="h-3 w-3" />
            {campaign.channel}
          </span>
        </div>

        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2
                     text-[12px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm shrink-0"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
      </div>

      {/* ── KPI cards ── */}
      <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {campaign.kpis.map((k) => (
          <article key={k.label} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
            <p className="text-[10px] font-[600] uppercase tracking-widest text-gray-400 mb-1">{k.label}</p>
            <p className={`text-[28px] font-[700] leading-none ${k.color}`}>{k.value}</p>
          </article>
        ))}
      </section>

      {/* ── progress bars ── */}
      <section className="mb-5 rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
        <h3 className="text-[14px] font-[600] text-gray-900 mb-4">Campaign Progress</h3>
        <div className="space-y-4">
          {[
            {
              label: campaign.channel === "EMAIL" ? "Delivery Rate" : "Completion Rate",
              value: Math.round((campaign.stats.completed / campaign.stats.totalCalls) * 100),
              color: "bg-green-500",
            },
            {
              label: campaign.channel === "EMAIL" ? "Open Rate" : "Meeting Rate",
              value: Math.round((campaign.stats.meetings / campaign.stats.completed) * 100),
              color: "bg-violet-500",
            },
            {
              label: "Conversion Rate",
              value: parseFloat(campaign.stats.convRate),
              color: "bg-blue-500",
            },
          ].map((bar) => (
            <div key={bar.label}>
              <div className="flex justify-between mb-1.5">
                <span className="text-[12px] font-[500] text-gray-700">{bar.label}</span>
                <span className="text-[12px] font-[600] text-gray-900">{bar.value}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`${bar.color} h-2 rounded-full transition-all`}
                  style={{ width: `${Math.min(bar.value, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── history table ── */}
      <section className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-wrap gap-3">
          <div>
            <h3 className="text-[14px] font-[600] text-gray-900">{historyLabel}</h3>
            <p className="text-[12px] text-gray-400 mt-0.5">{rows.length} result{rows.length !== 1 ? "s" : ""}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name or company…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50
                           outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-300 w-56"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[12px] text-gray-600
                         shadow-sm outline-none focus:ring-2 focus:ring-violet-400/30"
            >
              {uniqueStatuses.map((s) => (
                <option key={s} value={s}>{s === "ALL" ? "All Statuses" : s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <table className="w-full text-left" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "13%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "8%"  }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "9%"  }} />
            </colgroup>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  "Lead Name",
                  "Email",
                  "Phone",
                  "Company",
                  campaign.channel === "EMAIL" ? "Date" : "Call Date",
                  "Time",
                  "Status",
                  "Meeting",
                  "Tasks",
                ].map((h) => (
                  <th key={h} className="px-2.5 py-2.5 text-[10px] font-[600] uppercase tracking-wide text-gray-500 truncate">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-12 text-center text-[13px] text-gray-400">
                    No records match your search / filter.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-gray-50 hover:bg-gray-50/70 transition ${idx % 2 !== 0 ? "bg-gray-50/30" : ""}`}
                  >
                    <td className="px-2.5 py-2.5 font-[600] text-[12px] text-gray-800 truncate" title={row.name}>{row.name}</td>
                    <td className="px-2.5 py-2.5 text-[11px] text-gray-500 truncate" title={row.email}>{row.email}</td>
                    <td className="px-2.5 py-2.5 text-[11px] text-gray-600 truncate font-mono" title={row.phone}>{row.phone}</td>
                    <td className="px-2.5 py-2.5 text-[11px] text-blue-600 font-[500] truncate" title={row.company}>{row.company}</td>
                    <td className="px-2.5 py-2.5 text-[11px] text-gray-600 truncate">{row.date}</td>
                    <td className="px-2.5 py-2.5 text-[11px] font-[600] text-gray-700 truncate">{row.time}</td>
                    <td className="px-2.5 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-[600] ${CALL_STATUS_STYLE[row.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-2.5 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-[600] border ${
                        row.meeting
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}>
                        {row.meeting ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-2.5 py-2.5 text-[12px] font-[700] text-gray-800 text-center">{row.tasks}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[12px] text-gray-400">
            Showing {rows.length} of {campaign.callHistory.length} records
          </p>
          <div className="flex items-center gap-3 text-[12px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {campaign.callHistory.length} total leads
            </span>
            <span className="flex items-center gap-1.5 text-green-600 font-[500]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {campaign.callHistory.filter((r) => r.meeting).length} meetings booked
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════
   ROOT — manages list ↔ detail transition
══════════════════════════════════════════════════════════════ */
export default function CampaignDashboard() {
  const [allCampaigns, setAllCampaigns] = useState(campaigns);
  const [selected, setSelected]         = useState(null);

  const handleAdd = (newCampaign) => {
    setAllCampaigns((prev) => [newCampaign, ...prev]);
  };

  if (selected) {
    return <CampaignDetail campaign={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <CampaignList
      campaigns={allCampaigns}
      onViewDetails={(c) => setSelected(c)}
      onAddCampaign={handleAdd}
    />
  );
}

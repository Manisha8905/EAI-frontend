"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from "recharts";
import {
  Phone,
  Mail,
  Linkedin,
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
  ChevronUp,
  ChevronRight,
  GripVertical,
  FileText,
  Target,
  Eye,
  Clock,
  ToggleLeft,
  ToggleRight,
  Layers,
  Zap,
  Send,
  MessageCircle,
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
    allActivity: [
      { serial: 1, leadName: "John Smith",    call: true,  email: true,  linkedin: false, whatsapp: true  },
      { serial: 2, leadName: "Sarah Johnson", call: false, email: true,  linkedin: true,  whatsapp: false },
      { serial: 3, leadName: "Michael Brown", call: true,  email: false, linkedin: true,  whatsapp: true  },
      { serial: 4, leadName: "Emily Davis",   call: true,  email: true,  linkedin: true,  whatsapp: false },
      { serial: 5, leadName: "David Wilson",  call: false, email: false, linkedin: true,  whatsapp: true  },
    ],
    callHistory: [
      { name: "Anthony Yeates",  phone: "+918949575172", company: "Tech Solutions Inc",  dateTime: "Jan 30, 2026\n2:15 PM",   duration: "0.45", status: "VOICE MAIL", meeting: false, transcript: "AI: Hello, this is Sarah from Acme Corp. I'm calling about our enterprise solutions for Tech Solutions Inc. We specialize in streamlining operations for mid-market companies like yours..." },
      { name: "Michael Chen",    phone: "+918949575173", company: "StartUp Ventures",    dateTime: "Jan 30, 2026\n11:30 AM",  duration: "5.20", status: "COMPLETED",  meeting: true,  transcript: "AI: Hi Michael, this is Sarah from Acme Corp. I wanted to connect about how our platform could accelerate StartUp Ventures' growth. Do you have a few minutes?\n\nMichael: Sure, go ahead.\n\nAI: Great! We've helped similar startups increase pipeline by 40%..." },
      { name: "Sarah Johnson",   phone: "+918949575174", company: "Enterprise Co",       dateTime: "Jan 29, 2026\n3:45 PM",   duration: "8.15", status: "COMPLETED",  meeting: true,  transcript: "AI: Good afternoon Sarah, calling from Acme Corp regarding enterprise solutions tailored for your team. We noticed Enterprise Co has been expanding rapidly — our tools could help manage that growth..." },
      { name: "Robert Martinez", phone: "+918949575175", company: "Global Systems",      dateTime: "Jan 29, 2026\n10:20 AM",  duration: "0.00", status: "NO ANSWER",  meeting: false, transcript: "" },
      { name: "Emily Davis",     phone: "+918949575176", company: "Tech Innovations",    dateTime: "Jan 28, 2026\n4:10 PM",   duration: "3.50", status: "COMPLETED",  meeting: false, transcript: "AI: Hi Emily, this is Sarah from Acme Corp. I wanted to reach out about how our tech innovations platform can support your workflow at Tech Innovations..." },
    ],
    emailHistory: [
      { name: "Anthony Yeates", emailAddr: "a.yeates@techsol.com",  company: "Tech Solutions Inc",  dateTime: "Jan 31, 2026\n9:00 AM",   subject: "Enterprise Solutions — Follow Up",        status: "OPENED",  meeting: false },
      { name: "Sarah Johnson",  emailAddr: "s.johnson@entco.com",   company: "Enterprise Co",       dateTime: "Jan 30, 2026\n10:15 AM",  subject: "Ready to Schedule Your Demo?",           status: "CLICKED", meeting: true  },
      { name: "Michael Brown",  emailAddr: "m.brown@innovatech.io", company: "InnovaTech",          dateTime: "Jan 29, 2026\n8:30 AM",   subject: "Introduction to Acme Corp Platform",     status: "NO OPEN", meeting: false },
      { name: "Emily Davis",    emailAddr: "emily@techinno.com",    company: "Tech Innovations",    dateTime: "Jan 28, 2026\n2:00 PM",   subject: "Boost Your Pipeline with Acme Corp",     status: "OPENED",  meeting: false },
    ],
    linkedinHistory: [
      { name: "Emily Davis",    title: "VP of Sales",    company: "Tech Innovations",  dateTime: "Feb 1, 2026\n11:00 AM",  action: "Connection Request", status: "ACCEPTED", meeting: false },
      { name: "David Wilson",   title: "CTO",            company: "GlobalLink",         dateTime: "Jan 31, 2026\n3:00 PM",  action: "InMail Sent",        status: "REPLIED",  meeting: true  },
      { name: "Anthony Yeates", title: "Director of IT", company: "Tech Solutions Inc", dateTime: "Jan 30, 2026\n2:00 PM",  action: "InMail Sent",        status: "NO REPLY", meeting: false },
      { name: "Sarah Johnson",  title: "Head of Ops",    company: "Enterprise Co",      dateTime: "Jan 29, 2026\n9:00 AM",  action: "Connection Request", status: "ACCEPTED", meeting: true  },
    ],
    whatsappHistory: [
      { name: "John Smith",    phone: "+918949575172", company: "Tech Solutions Inc", dateTime: "Feb 2, 2026\n10:00 AM",  messagePreview: "Hi John, following up from our call today \u2014 excited to share more!",     status: "READ",      meeting: false },
      { name: "Michael Brown", phone: "+918949575175", company: "InnovaTech",         dateTime: "Feb 3, 2026\n9:00 AM",   messagePreview: "Hey Michael, Sarah from Acme Corp. Got a moment to connect?",          status: "REPLIED",   meeting: true  },
      { name: "David Wilson",  phone: "+918949575178", company: "GlobalLink",         dateTime: "Feb 4, 2026\n11:30 AM",  messagePreview: "Hi David, sharing our enterprise deck - would love your thoughts!", status: "DELIVERED", meeting: false },
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
    allActivity: [
      { serial: 1, leadName: "Caroline Drake", call: true,  email: false, linkedin: true,  whatsapp: true  },
      { serial: 2, leadName: "Raj Patel",      call: true,  email: true,  linkedin: false, whatsapp: false },
      { serial: 3, leadName: "Oliver Brooks",  call: false, email: true,  linkedin: true,  whatsapp: true  },
      { serial: 4, leadName: "Yuki Tanaka",    call: true,  email: true,  linkedin: true,  whatsapp: false },
    ],
    callHistory: [
      { name: "Caroline Drake", phone: "+12125559876",  company: "Pinnacle Ventures", dateTime: "Feb 2, 2026\n1:14 PM",  duration: "6.30", status: "COMPLETED",  meeting: true,  transcript: "AI: Hello Caroline, this is Sarah from Acme Corp calling about your Q4 targets. We work with Fortune 500 buyers to accelerate pipeline close rates. Do you have a moment?\n\nCaroline: Yes, please go ahead..." },
      { name: "Raj Patel",      phone: "+919876543210", company: "FutureWave Inc",    dateTime: "Feb 3, 2026\n11:30 AM", duration: "1.10", status: "VOICE MAIL", meeting: false, transcript: "AI: Hi Raj, this is a message from Acme Corp. I wanted to reach out about our enterprise solutions that could help FutureWave Inc hit Q4 goals. Please call us back at your earliest convenience..." },
      { name: "Oliver Brooks",  phone: "+447700900456", company: "Stratex Solutions", dateTime: "Feb 5, 2026\n4:00 PM",  duration: "0.00", status: "NO ANSWER",  meeting: false, transcript: "" },
      { name: "Yuki Tanaka",    phone: "+81312345678",  company: "Softech Japan",     dateTime: "Feb 6, 2026\n10:45 AM", duration: "9.20", status: "COMPLETED",  meeting: true,  transcript: "AI: Good morning Yuki, I'm Sarah from Acme Corp. I know mornings are busy at Softech Japan, but I wanted to connect about a platform that supports enterprise-level decision making..." },
    ],
    emailHistory: [
      { name: "Caroline Drake", emailAddr: "c.drake@pinnacle.io",  company: "Pinnacle Ventures", dateTime: "Feb 4, 2026\n9:00 AM",  subject: "Q4 Pipeline Acceleration — Acme Corp", status: "OPENED",  meeting: false },
      { name: "Raj Patel",      emailAddr: "raj@futurewave.com",   company: "FutureWave Inc",    dateTime: "Feb 4, 2026\n8:30 AM",  subject: "Innovation at Scale for FutureWave",  status: "CLICKED", meeting: true  },
      { name: "Oliver Brooks",  emailAddr: "o.brooks@stratex.co", company: "Stratex Solutions", dateTime: "Feb 5, 2026\n9:15 AM",  subject: "Let's Talk — Acme Corp Solutions",    status: "NO OPEN", meeting: false },
      { name: "Yuki Tanaka",    emailAddr: "y.tanaka@softech.jp", company: "Softech Japan",     dateTime: "Feb 6, 2026\n8:00 AM",  subject: "Enterprise Platform for Softech",     status: "OPENED",  meeting: false },
    ],
    linkedinHistory: [
      { name: "Caroline Drake", title: "CMO",    company: "Pinnacle Ventures", dateTime: "Feb 1, 2026\n10:00 AM", action: "Connection Request", status: "ACCEPTED", meeting: false },
      { name: "Yuki Tanaka",    title: "CEO",    company: "Softech Japan",     dateTime: "Jan 31, 2026\n2:00 PM", action: "InMail Sent",        status: "REPLIED",  meeting: true  },
      { name: "Oliver Brooks",  title: "CTO",    company: "Stratex Solutions", dateTime: "Jan 30, 2026\n11:00 AM",action: "InMail Sent",        status: "NO REPLY", meeting: false },
    ],
    whatsappHistory: [
      { name: "Caroline Drake", phone: "+12125559876",  company: "Pinnacle Ventures", dateTime: "Feb 5, 2026\n2:00 PM",   messagePreview: "Hi Caroline, following up on our amazing call \u2014 ready to schedule?", status: "DELIVERED", meeting: false },
      { name: "Yuki Tanaka",    phone: "+81312345678",  company: "Softech Japan",     dateTime: "Feb 7, 2026\n10:00 AM",  messagePreview: "Hi Yuki, Sarah from Acme Corp. Sharing our product overview.",       status: "REPLIED",   meeting: true  },
      { name: "Oliver Brooks",  phone: "+447700900456", company: "Stratex Solutions", dateTime: "Feb 8, 2026\n3:00 PM",   messagePreview: "Hey Oliver, wanted to follow up on our email thread!",             status: "READ",      meeting: false },
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
    allActivity: [
      { serial: 1, leadName: "Siti Aminah",  call: false, email: true,  linkedin: true,  whatsapp: true  },
      { serial: 2, leadName: "Chen Wei",     call: false, email: true,  linkedin: false, whatsapp: true  },
      { serial: 3, leadName: "Anika Khatri", call: true,  email: true,  linkedin: true,  whatsapp: false },
      { serial: 4, leadName: "James Park",   call: false, email: false, linkedin: true,  whatsapp: false },
    ],
    callHistory: [
      { name: "Anika Khatri", phone: "+912345678901", company: "Digital Minds", dateTime: "Feb 12, 2026\n10:30 AM", duration: "4.50", status: "COMPLETED", meeting: true,  transcript: "AI: Hi Anika, this is Sarah from Acme Corp. I'm calling about our APAC SaaS launch which directly addresses the challenges Digital Minds faces with scaling operations..." },
    ],
    emailHistory: [
      { name: "Siti Aminah",  emailAddr: "siti@techbridge.sg", company: "TechBridge SG",  dateTime: "Feb 8, 2026\n8:00 AM",   subject: "New SaaS Platform for APAC Teams",      status: "OPENED",  meeting: false },
      { name: "Chen Wei",     emailAddr: "c.wei@cloudnova.cn", company: "CloudNova",       dateTime: "Feb 9, 2026\n9:10 AM",   subject: "SaaS Innovation Tailored for Your Biz", status: "CLICKED", meeting: true  },
      { name: "Anika Khatri", emailAddr: "anika@digitalm.in",  company: "Digital Minds",  dateTime: "Feb 10, 2026\n10:30 AM", subject: "Scale APAC Operations with Acme Corp",  status: "NO OPEN", meeting: false },
    ],
    linkedinHistory: [
      { name: "Siti Aminah", title: "Head of IT",  company: "TechBridge SG", dateTime: "Feb 7, 2026\n10:00 AM", action: "Connection Request", status: "ACCEPTED", meeting: false },
      { name: "James Park",  title: "VP of Tech",  company: "KoreaTech",     dateTime: "Feb 8, 2026\n9:00 AM",  action: "InMail Sent",        status: "REPLIED",  meeting: true  },
    ],
    whatsappHistory: [
      { name: "Siti Aminah", phone: "+6591234567",    company: "TechBridge SG", dateTime: "Feb 10, 2026\n9:00 AM",  messagePreview: "Hi Siti, following up on our APAC launch email \u2014 keen to chat?",   status: "READ",      meeting: false },
      { name: "Chen Wei",    phone: "+8613912345678", company: "CloudNova",     dateTime: "Feb 11, 2026\n10:00 AM", messagePreview: "Hey Chen, Sarah from Acme Corp. Our SaaS platform is live!",       status: "REPLIED",   meeting: true  },
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
    allActivity: [
      { serial: 1, leadName: "David Osei",     call: true,  email: true,  linkedin: true,  whatsapp: true  },
      { serial: 2, leadName: "Maria Santos",   call: true,  email: true,  linkedin: false, whatsapp: true  },
      { serial: 3, leadName: "Frederic Blanc", call: true,  email: false, linkedin: true,  whatsapp: false },
    ],
    callHistory: [
      { name: "David Osei",     phone: "+233244123456", company: "RenewCo Ltd", dateTime: "Jan 20, 2026\n2:00 PM",  duration: "12.00", status: "COMPLETED",  meeting: true,  transcript: "AI: Hello David, this is Sarah from Acme Corp. I'm calling about your upcoming renewal — we want to make sure RenewCo Ltd continues to get maximum value from our platform...\n\nDavid: Thanks for reaching out. I'd love to discuss the renewal terms..." },
      { name: "Maria Santos",   phone: "+525544332211", company: "IBEXA Corp",  dateTime: "Jan 22, 2026\n11:15 AM", duration: "7.45",  status: "COMPLETED",  meeting: true,  transcript: "AI: Hi Maria, calling from Acme Corp about your contract renewal coming up in Q2. IBEXA Corp has been a great partner and we've prepared a special renewal package for you..." },
      { name: "Frederic Blanc", phone: "+33612345678",  company: "Nova FR",     dateTime: "Jan 25, 2026\n3:30 PM",  duration: "1.20",  status: "VOICE MAIL", meeting: false, transcript: "AI: Bonjour Frederic, this is a message from Acme Corp regarding your upcoming renewal with Nova FR. Please call us back to discuss your options..." },
    ],
    emailHistory: [
      { name: "David Osei",   emailAddr: "d.osei@renewco.com", company: "RenewCo Ltd", dateTime: "Jan 21, 2026\n9:00 AM",  subject: "Your Renewal is Coming Up — Acme Corp", status: "OPENED",  meeting: false },
      { name: "Maria Santos", emailAddr: "msantos@ibexa.mx",   company: "IBEXA Corp",  dateTime: "Jan 23, 2026\n10:00 AM", subject: "Renew Your Acme Corp License Today",    status: "CLICKED", meeting: true  },
    ],
    linkedinHistory: [
      { name: "David Osei",     title: "IT Manager", company: "RenewCo Ltd", dateTime: "Jan 19, 2026\n10:00 AM", action: "Connection Request", status: "ACCEPTED", meeting: false },
      { name: "Frederic Blanc", title: "CTO",        company: "Nova FR",     dateTime: "Jan 20, 2026\n2:00 PM",  action: "InMail Sent",        status: "NO REPLY", meeting: false },
    ],
    whatsappHistory: [
      { name: "David Osei",   phone: "+233244123456", company: "RenewCo Ltd", dateTime: "Jan 22, 2026\n3:00 PM",   messagePreview: "Hi David, just following up on your upcoming renewal \u2014 great news!", status: "READ",    meeting: false },
      { name: "Maria Santos", phone: "+525544332211", company: "IBEXA Corp",  dateTime: "Jan 24, 2026\n11:00 AM", messagePreview: "Hi Maria, your special renewal package is ready \u2014 let's connect!",  status: "REPLIED", meeting: true  },
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
  "COMPLETED":  "bg-green-500 text-white",
  "VOICE MAIL": "bg-yellow-400 text-white",
  "NO ANSWER":  "bg-gray-400 text-white",
};

const EMAIL_STATUS_STYLE = {
  "OPENED":  "bg-blue-50 text-blue-700 border border-blue-200",
  "CLICKED": "bg-teal-50 text-teal-700 border border-teal-200",
  "NO OPEN": "bg-gray-100 text-gray-500 border border-gray-200",
};

const LINKEDIN_STATUS_STYLE = {
  "ACCEPTED": "bg-green-50 text-green-700 border border-green-200",
  "REPLIED":  "bg-blue-50 text-blue-700 border border-blue-200",
  "NO REPLY": "bg-gray-100 text-gray-500 border border-gray-200",
};

const WHATSAPP_STATUS_STYLE = {
  "DELIVERED": "bg-blue-50 text-blue-700 border border-blue-200",
  "READ":      "bg-indigo-50 text-indigo-700 border border-indigo-200",
  "REPLIED":   "bg-green-50 text-green-700 border border-green-200",
  "NO REPLY":  "bg-gray-100 text-gray-500 border border-gray-200",
};

/* ══════════════════════════════════════════════════════════════
   CAMPAIGN LIST  (no channel tabs — shows all campaigns)
══════════════════════════════════════════════════════════════ */
function CampaignList({ campaigns, onViewDetails, onAddCampaign }) {
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [period, setPeriod]             = useState("This Year");
  const [refreshing, setRefreshing]     = useState(false);
  const [showModal, setShowModal]       = useState(false);

  const filtered = campaigns.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const periodOptions = ["This Week", "This Month", "This Year"];

  return (
    <main className="min-h-[calc(100vh-60px)] bg-[#f4f5f7]">

      <div className="p-5">
        {/* ── section header + controls ── */}
        <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-poppins text-[17px] font-[700] text-[#0a0a0a]">Campaign Setup</h1>
            <p className="font-inter text-[13px] text-gray-500 mt-0.5">Manage your AI SDR campaigns</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-[12px] text-gray-600 shadow-sm outline-none focus:ring-2 focus:ring-violet-400/30 cursor-pointer"
              >
                {periodOptions.map((p) => <option key={p}>{p}</option>)}
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
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0a0a0a] text-white text-[13px] font-[600] hover:bg-gray-800 transition shadow-md"
            >
              <Plus className="h-4 w-4" />
              Create New Campaign
            </button>
          </div>
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

        {/* ── summary KPI strip (all campaigns) ── */}
        <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: PlayCircle,   label: "Active",          value: campaigns.filter((c) => c.status === "ACTIVE").length,    color: "text-green-600",  bg: "bg-green-50"  },
            { icon: PauseCircle,  label: "Paused",          value: campaigns.filter((c) => c.status === "PAUSED").length,    color: "text-amber-600",  bg: "bg-amber-50"  },
            { icon: CheckCircle2, label: "Completed",       value: campaigns.filter((c) => c.status === "COMPLETED").length, color: "text-blue-600",   bg: "bg-blue-50"   },
            { icon: TrendingUp,   label: "Total Campaigns", value: campaigns.length,                                         color: "text-violet-600", bg: "bg-violet-50" },
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
              return (
                <article
                  key={c.id}
                  className="rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4"
                >
                  {/* card header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
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
          defaultChannel="CALL"
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
   CAMPAIGN ACTIVITIES  (middle page — navigate to activity type)
══════════════════════════════════════════════════════════════ */
function CampaignActivities({ campaign, onBack, onSelectActivity }) {
  const sm = STATUS_META[campaign.status];

  const activities = [
    { key: "ALL",       label: "lead list activity", Icon: TrendingUp,    desc: "Overview of all lead list  activities across campaigns" },
    { key: "CALL",     label: "Call",               Icon: Phone,          desc: "Detailed call logs and transcripts"                   },
    { key: "EMAIL",    label: "Email",              Icon: Mail,           desc: "Email open rates, clicks, and responses"              },
    { key: "LINKEDIN", label: "LinkedIn",           Icon: Linkedin,       desc: "LinkedIn connection requests and InMail activity"     },
    { key: "WHATSAPP", label: "WhatsApp",           Icon: MessageCircle,  desc: "WhatsApp message delivery, reads, and replies"        },
  ];

  return (
    <main className="min-h-[calc(100vh-60px)] bg-[#f4f5f7] p-4">
      {/* ── back button ── */}
      <div className="mb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white
                     text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaigns
        </button>
      </div>

      {/* ── header card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-poppins text-[16px] font-[700] text-[#0a0a0a]">Campaign Activities</h1>
          <p className="text-[12px] text-gray-500 mt-0.5">{campaign.name}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-[600] border ${sm.bg} ${sm.text} ${sm.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />
          {sm.label}
        </span>
      </div>

      {/* ── live mini-stats strip ── */}
      <section className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Total Calls",   value: campaign.callHistory.length,      color: "text-sky-600",    bg: "bg-sky-50"    },
          { label: "Emails Sent",   value: campaign.emailHistory.length,     color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "LinkedIn",      value: campaign.linkedinHistory.length,  color: "text-blue-600",  bg: "bg-blue-50"   },
          { label: "WhatsApp",      value: campaign.whatsappHistory.length,  color: "text-green-600", bg: "bg-green-50"  },
          { label: "Meetings",
            value: [
              ...campaign.callHistory,
              ...campaign.emailHistory,
              ...campaign.linkedinHistory,
              ...campaign.whatsappHistory,
            ].filter((r) => r.meeting).length,
            color: "text-amber-600", bg: "bg-amber-50" },
        ].map(({ label, value, color, bg }) => (
          <article key={label} className={`rounded-xl ${bg} border border-white shadow-sm px-4 py-3 flex items-center gap-3`}>
            <div>
              <p className={`text-[22px] font-[800] leading-none ${color}`}>{value}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
            </div>
          </article>
        ))}
      </section>

      {/* ── activity list ── */}
      <div className="space-y-3">
        {activities.map(({ key, label, Icon, desc }) => {
          const badge =
            key === "ALL"       ? campaign.allActivity.length
            : key === "CALL"     ? campaign.callHistory.length
            : key === "EMAIL"    ? campaign.emailHistory.length
            : key === "LINKEDIN" ? campaign.linkedinHistory.length
            : campaign.whatsappHistory.length;
          const badgeColor =
            key === "ALL"       ? "bg-gray-100 text-gray-600"
            : key === "CALL"     ? "bg-sky-100 text-sky-700"
            : key === "EMAIL"    ? "bg-indigo-100 text-indigo-700"
            : key === "LINKEDIN" ? "bg-blue-100 text-blue-700"
            : "bg-green-100 text-green-700";
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectActivity(key)}
              className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4
                         flex items-center justify-between hover:shadow-md hover:border-indigo-200 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 group-hover:bg-indigo-100 transition shrink-0">
                  <Icon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[14px] font-[700] text-[#0a0a0a]">{label}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-[700] ${badgeColor}`}>{badge}</span>
                  </div>
                  <p className="text-[12px] text-gray-400">{desc}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all shrink-0" />
            </button>
          );
        })}
      </div>
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════
   ALL CAMPAIGN ACTIVITY  (KPI + charts + checkmark table)
══════════════════════════════════════════════════════════════ */
function AllCampaignActivity({ campaign, onBack }) {
  const data = campaign.allActivity;
  const total = data.length;
  const fullCoverage    = data.filter((r) => r.call && r.email && r.linkedin && r.whatsapp).length;
  const partialCoverage = data.filter((r) => (r.call || r.email || r.linkedin || r.whatsapp) && !(r.call && r.email && r.linkedin && r.whatsapp)).length;
  const noCoverage      = data.filter((r) => !r.call && !r.email && !r.linkedin && !r.whatsapp).length;
  const callReach       = data.filter((r) => r.call).length;
  const emailReach      = data.filter((r) => r.email).length;
  const linkedinReach   = data.filter((r) => r.linkedin).length;
  const whatsappReach   = data.filter((r) => r.whatsapp).length;

  const coverageDonut = [
    { name: "Full Coverage", value: fullCoverage,    color: "#22c55e" },
    { name: "Partial",       value: partialCoverage, color: "#f59e0b" },
    { name: "Not Reached",   value: noCoverage,      color: "#e5e7eb" },
  ].filter((s) => s.value > 0);

  const channelBarData = [
    { channel: "Call",      reached: callReach,      missed: total - callReach,      fill: "#6366f1" },
    { channel: "Email",     reached: emailReach,     missed: total - emailReach,     fill: "#0ea5e9" },
    { channel: "LinkedIn",  reached: linkedinReach,  missed: total - linkedinReach,  fill: "#0284c7" },
    { channel: "WhatsApp",  reached: whatsappReach,  missed: total - whatsappReach,  fill: "#22c55e" },
  ];

  const RADIAN = Math.PI / 180;
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.08) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11, fontWeight: 700 }}>
        {`${Math.round(percent * 100)}%`}
      </text>
    );
  };

  return (
    <main className="min-h-[calc(100vh-60px)] bg-[#f4f5f7] p-4">
      <div className="mb-5">
        <button type="button" onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Campaign Activities
        </button>
      </div>

      <div className="mb-5">
        <h1 className="font-poppins text-[17px] font-[700] text-[#0a0a0a]">Lead Activity</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">Overview of all channel activities across campaigns</p>
      </div>

      {/* KPI strip */}
      <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Leads",     value: total,          color: "text-gray-900",   bg: "bg-gray-50",    ring: "ring-gray-200"    },
          { label: "Full Coverage",   value: fullCoverage,   color: "text-green-600",  bg: "bg-green-50",   ring: "ring-green-200"   },
          { label: "Partial Reach",   value: partialCoverage,color: "text-amber-600",  bg: "bg-amber-50",   ring: "ring-amber-200"   },
          { label: "Not Reached",     value: noCoverage,     color: "text-red-500",    bg: "bg-red-50",     ring: "ring-red-200"     },
        ].map((k) => (
          <article key={k.label} className={`rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col gap-1 ring-1 ${k.ring}`}>
            <p className="text-[11px] font-[600] uppercase tracking-widest text-gray-400">{k.label}</p>
            <p className={`text-[32px] font-[800] leading-none ${k.color}`}>{k.value}</p>
            <p className="text-[11px] text-gray-400">of {total} leads</p>
          </article>
        ))}
      </section>

      {/* Charts row */}
      <section className="mb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Channel reach bar chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-[14px] font-[700] text-gray-900 mb-1">Channel Reach</h3>
          <p className="text-[12px] text-gray-400 mb-4">Leads reached per channel</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={channelBarData} barSize={32} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="channel" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                formatter={(v, name) => [v, name === 'reached' ? 'Reached' : 'Missed']}
              />
              <Bar dataKey="reached" name="reached" radius={[6, 6, 0, 0]}>
                {channelBarData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
              <Bar dataKey="missed" name="missed" radius={[6, 6, 0, 0]} fill="#e2e8f0" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Coverage donut */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <h3 className="text-[14px] font-[700] text-gray-900 mb-1">Coverage Breakdown</h3>
          <p className="text-[12px] text-gray-400 mb-2">Distribution across coverage levels</p>
          <div className="flex-1 flex items-center justify-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={coverageDonut} cx="50%" cy="50%" innerRadius={45} outerRadius={72}
                  dataKey="value" labelLine={false} label={renderLabel}>
                  {coverageDonut.map((s, i) => <Cell key={i} fill={s.color} strokeWidth={0} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2.5">
              {coverageDonut.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
                  <div>
                    <p className="text-[12px] font-[600] text-gray-700">{s.name}</p>
                    <p className="text-[11px] text-gray-400">{s.value} lead{s.value !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Checkmark table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-[14px] font-[600] text-gray-900">Lead Channel Coverage</h3>
          <p className="text-[12px] text-gray-400 mt-0.5">Per-lead channel activity status</p>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#1e293b]">
              {["Serial No.","Lead Name","Call","Email","LinkedIn","WhatsApp"].map((h) => (
                <th key={h} className="px-5 py-3 text-[11px] font-[600] uppercase tracking-wide text-white">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={row.serial} className={`border-b border-gray-50 hover:bg-gray-50/60 transition ${idx % 2 !== 0 ? "bg-gray-50/30" : ""}`}>
                <td className="px-5 py-3.5 text-[13px] text-gray-500 font-[500]">{row.serial}</td>
                <td className="px-5 py-3.5 text-[13px] font-[600] text-gray-800">{row.leadName}</td>
                <td className="px-5 py-3.5">{row.call ? <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-50"><CheckCircle2 className="h-4.5 w-4.5 text-green-500" /></span> : <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50"><X className="h-4 w-4 text-red-400" /></span>}</td>
                <td className="px-5 py-3.5">{row.email ? <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-50"><CheckCircle2 className="h-4.5 w-4.5 text-green-500" /></span> : <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50"><X className="h-4 w-4 text-red-400" /></span>}</td>
                <td className="px-5 py-3.5">{row.linkedin ? <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-50"><CheckCircle2 className="h-4.5 w-4.5 text-green-500" /></span> : <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50"><X className="h-4 w-4 text-red-400" /></span>}</td>
                <td className="px-5 py-3.5">{row.whatsapp ? <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-50"><CheckCircle2 className="h-4.5 w-4.5 text-green-500" /></span> : <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50"><X className="h-4 w-4 text-red-400" /></span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════
   CALL TRANSCRIPT MODAL
══════════════════════════════════════════════════════════════ */
function CallTranscriptModal({ record, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[16px] font-[700] text-[#0a0a0a]">Call Transcript</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-[600] text-blue-500 uppercase tracking-wide mb-0.5">Lead Name</p>
              <p className="text-[13px] font-[500] text-gray-800">{record.name}</p>
            </div>
            <div>
              <p className="text-[11px] font-[600] text-blue-500 uppercase tracking-wide mb-0.5">Company</p>
              <p className="text-[13px] font-[500] text-gray-800">{record.company}</p>
            </div>
            <div>
              <p className="text-[11px] font-[600] text-blue-500 uppercase tracking-wide mb-0.5">Call Date &amp; Time</p>
              <p className="text-[13px] font-[500] text-gray-800 whitespace-pre-line">{record.dateTime}</p>
            </div>
            <div>
              <p className="text-[11px] font-[600] text-blue-500 uppercase tracking-wide mb-0.5">Duration</p>
              <p className="text-[13px] font-[500] text-gray-800">{record.duration} min</p>
            </div>
            <div>
              <p className="text-[11px] font-[600] text-blue-500 uppercase tracking-wide mb-0.5">Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-[700] ${CALL_STATUS_STYLE[record.status] ?? "bg-gray-100 text-gray-600"}`}>
                {record.status}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-[600] text-blue-500 uppercase tracking-wide mb-0.5">Meeting Scheduled</p>
              <p className="text-[13px] font-[500] text-gray-800">{record.meeting ? "Yes" : "No"}</p>
            </div>
          </div>

          <div>
            <p className="text-[12px] font-[600] text-gray-700 mb-2">Transcript</p>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 min-h-[100px]">
              {record.transcript
                ? <p className="text-[12px] text-gray-600 leading-relaxed whitespace-pre-wrap">{record.transcript}</p>
                : <p className="text-[12px] text-gray-400 italic">No transcript available for this call.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CALL HISTORY VIEW  (KPI + charts + table)
══════════════════════════════════════════════════════════════ */
function CallHistoryView({ campaign, onBack }) {
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("All Status");
  const [transcript, setTranscript] = useState(null);

  const statuses = ["All Status", ...new Set(campaign.callHistory.map((r) => r.status))];

  const rows = campaign.callHistory.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                        r.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All Status" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const ch = campaign.callHistory;
  const totalCalls   = ch.length;
  const completed    = ch.filter((r) => r.status === "COMPLETED").length;
  const voiceMail    = ch.filter((r) => r.status === "VOICE MAIL").length;
  const noAnswer     = ch.filter((r) => r.status === "NO ANSWER").length;
  const meetingBooked = ch.filter((r) => r.meeting).length;
  const avgDuration  = totalCalls > 0
    ? (ch.reduce((s, r) => s + parseFloat(r.duration), 0) / totalCalls).toFixed(1)
    : "0.0";

  const statusBarData = [
    { name: "Completed",  value: completed, fill: "#22c55e" },
    { name: "Voice Mail", value: voiceMail, fill: "#f59e0b" },
    { name: "No Answer",  value: noAnswer,  fill: "#94a3b8" },
  ];

  const meetingDonut = [
    { name: "Meeting Booked",   value: meetingBooked,             color: "#6366f1" },
    { name: "No Meeting",       value: totalCalls - meetingBooked, color: "#e2e8f0" },
  ].filter((s) => s.value > 0);

  const dayData = Object.entries(
    ch.reduce((acc, r) => {
      const day = r.dateTime.split("\n")[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {})
  ).map(([day, calls]) => ({ day: day.replace(", 2026", ""), calls }));

  const RADIAN = Math.PI / 180;
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.08) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11, fontWeight: 700 }}>
        {`${Math.round(percent * 100)}%`}
      </text>
    );
  };

  return (
    <main className="min-h-[calc(100vh-60px)] bg-[#f4f5f7] p-4">
      <div className="mb-5">
        <button type="button" onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Campaign Activities
        </button>
      </div>

      <div className="mb-5">
        <h1 className="font-poppins text-[17px] font-[700] text-[#0a0a0a]">Call History</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">Detailed call logs and transcripts</p>
      </div>

      {/* KPI strip */}
      <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {[
          { label: "Total Calls",   value: totalCalls,   sub: "all calls",        color: "text-gray-900",   ring: "ring-gray-200"    },
          { label: "Completed",     value: completed,    sub: "successful",       color: "text-green-600",  ring: "ring-green-200"   },
          { label: "Voice Mail",    value: voiceMail,    sub: "left message",     color: "text-amber-600",  ring: "ring-amber-200"   },
          { label: "No Answer",     value: noAnswer,     sub: "unreachable",      color: "text-gray-400",   ring: "ring-gray-200"    },
          { label: "Meetings",      value: meetingBooked,sub: "booked",           color: "text-violet-600", ring: "ring-violet-200"  },
          { label: "Avg Duration",  value: avgDuration,  sub: "minutes / call",   color: "text-blue-600",   ring: "ring-blue-200"    },
        ].map((k) => (
          <article key={k.label} className={`rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col gap-0.5 ring-1 ${k.ring}`}>
            <p className="text-[10px] font-[600] uppercase tracking-wider text-gray-400">{k.label}</p>
            <p className={`text-[28px] font-[800] leading-none ${k.color}`}>{k.value}</p>
            <p className="text-[11px] text-gray-400">{k.sub}</p>
          </article>
        ))}
      </section>

      {/* Charts row */}
      <section className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status distribution bar chart */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-[14px] font-[700] text-gray-900 mb-1">Call Status Distribution</h3>
          <p className="text-[12px] text-gray-400 mb-4">Outcome breakdown across all calls</p>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={statusBarData} barSize={40} margin={{ top: 0, right: 10, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Bar dataKey="value" name="Calls" radius={[8, 8, 0, 0]}>
                {statusBarData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Meeting conversion donut */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <h3 className="text-[14px] font-[700] text-gray-900 mb-1">Meeting Conversion</h3>
          <p className="text-[12px] text-gray-400 mb-2">Calls that led to a meeting</p>
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={meetingDonut} cx="50%" cy="50%" innerRadius={42} outerRadius={65}
                  dataKey="value" labelLine={false} label={renderLabel}>
                  {meetingDonut.map((s, i) => <Cell key={i} fill={s.color} strokeWidth={0} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 w-full">
              {meetingDonut.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
                    <span className="text-[11px] text-gray-600">{s.name}</span>
                  </div>
                  <span className="text-[12px] font-[700] text-gray-800">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call activity trend (day-by-day) */}
      {dayData.length > 1 && (
        <div className="mb-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-[14px] font-[700] text-gray-900 mb-1">Call Activity Trend</h3>
          <p className="text-[12px] text-gray-400 mb-4">Number of calls per day</p>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={dayData} margin={{ top: 0, right: 10, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="callGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Area type="monotone" dataKey="calls" stroke="#6366f1" strokeWidth={2.5} fill="url(#callGrad)" dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* toolbar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by lead name or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50
                         outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-300"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatus(e.target.value)}
              className="appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-[12px] text-gray-600 shadow-sm outline-none focus:ring-2 focus:ring-violet-400/30 cursor-pointer"
            >
              {statuses.map((s) => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white
                       text-[12px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ tableLayout: "fixed", minWidth: "780px" }}>
            <colgroup>
              <col style={{ width: "14%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "9%"  }} />
              <col style={{ width: "13%" }} />
            </colgroup>
            <thead>
              <tr className="bg-[#1e293b]">
                {["Lead Name","Phone","Company","Date & Time","Duration (min)","Status","Meeting","Actions"].map((h) => (
                  <th key={h} className="px-3 py-3 text-[11px] font-[600] uppercase tracking-wide text-white">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[13px] text-gray-400">
                    No records match your search / filter.
                  </td>
                </tr>
              ) : rows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-gray-50 hover:bg-gray-50/70 transition ${idx % 2 !== 0 ? "bg-[#eff6ff]/40" : ""}`}
                >
                  <td className="px-3 py-3 text-[12px] font-[600] text-gray-800 truncate bg-[#dbeafe]/30">{row.name}</td>
                  <td className="px-3 py-3 text-[12px] text-gray-600 truncate bg-[#dbeafe]/30 font-mono">{row.phone}</td>
                  <td className="px-3 py-3 text-[12px] text-gray-700 truncate bg-[#dbeafe]/30">{row.company}</td>
                  <td className="px-3 py-3 text-[11px] text-gray-600 whitespace-pre-line leading-tight">{row.dateTime}</td>
                  <td className="px-3 py-3 text-[12px] text-gray-700 text-center">{row.duration}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-[700] ${CALL_STATUS_STYLE[row.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[12px] text-gray-700 text-center">{row.meeting ? "Yes" : "No"}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setTranscript(row)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                        title="View transcript"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setTranscript(row)}
                        className="px-3 py-1.5 rounded-lg bg-[#1d4ed8] text-white text-[11px] font-[600]
                                   hover:bg-blue-700 transition"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[12px] text-gray-400">
            Showing {rows.length} of {campaign.callHistory.length} records
          </p>
          <span className="flex items-center gap-1.5 text-[12px] text-green-600 font-[500]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {campaign.callHistory.filter((r) => r.meeting).length} meetings booked
          </span>
        </div>
      </div>

      {transcript && <CallTranscriptModal record={transcript} onClose={() => setTranscript(null)} />}
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════
   EMAIL HISTORY VIEW  (KPI + charts + table)
══════════════════════════════════════════════════════════════ */
function EmailHistoryView({ campaign, onBack }) {
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("All Status");

  const statuses = ["All Status", ...new Set(campaign.emailHistory.map((r) => r.status))];

  const rows = campaign.emailHistory.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                        r.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All Status" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const eh = campaign.emailHistory;
  const totalSent     = eh.length;
  const opened        = eh.filter((r) => r.status === "OPENED" || r.status === "CLICKED").length;
  const clicked       = eh.filter((r) => r.status === "CLICKED").length;
  const noOpen        = eh.filter((r) => r.status === "NO OPEN").length;
  const meetingBooked = eh.filter((r) => r.meeting).length;
  const openRate      = totalSent > 0 ? Math.round((opened / totalSent) * 100) : 0;
  const clickRate     = totalSent > 0 ? Math.round((clicked / totalSent) * 100) : 0;

  const funnelData = [
    { stage: "Sent",    value: totalSent, fill: "#6366f1" },
    { stage: "Opened",  value: opened,    fill: "#0ea5e9" },
    { stage: "Clicked", value: clicked,   fill: "#22c55e" },
    { stage: "Meeting", value: meetingBooked, fill: "#f59e0b" },
  ];

  const statusDonut = [
    { name: "Opened",  value: opened - clicked, color: "#0ea5e9" },
    { name: "Clicked", value: clicked,           color: "#22c55e" },
    { name: "No Open", value: noOpen,            color: "#e2e8f0" },
  ].filter((s) => s.value > 0);

  const RADIAN = Math.PI / 180;
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.08) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11, fontWeight: 700 }}>
        {`${Math.round(percent * 100)}%`}
      </text>
    );
  };

  return (
    <main className="min-h-[calc(100vh-60px)] bg-[#f4f5f7] p-4">
      <div className="mb-5">
        <button type="button" onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Campaign Activities
        </button>
      </div>

      <div className="mb-5">
        <h1 className="font-poppins text-[17px] font-[700] text-[#0a0a0a]">Email Activity</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">Email open rates, clicks, and responses</p>
      </div>

      {/* KPI strip */}
      <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Emails Sent",  value: totalSent,    sub: "total outreach",   color: "text-gray-900",   ring: "ring-gray-200"   },
          { label: "Opened",       value: opened,       sub: `${openRate}% rate`,  color: "text-sky-600",    ring: "ring-sky-200"    },
          { label: "Clicked",      value: clicked,      sub: `${clickRate}% rate`, color: "text-green-600",  ring: "ring-green-200"  },
          { label: "No Open",      value: noOpen,       sub: "not engaged",      color: "text-gray-400",   ring: "ring-gray-200"   },
          { label: "Meetings",     value: meetingBooked,sub: "booked",           color: "text-violet-600", ring: "ring-violet-200" },
          { label: "Open Rate",    value: `${openRate}%`,sub: "of all sent",      color: "text-amber-600",  ring: "ring-amber-200"  },
        ].map((k) => (
          <article key={k.label} className={`rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col gap-0.5 ring-1 ${k.ring}`}>
            <p className="text-[10px] font-[600] uppercase tracking-wider text-gray-400">{k.label}</p>
            <p className={`text-[28px] font-[800] leading-none ${k.color}`}>{k.value}</p>
            <p className="text-[11px] text-gray-400">{k.sub}</p>
          </article>
        ))}
      </section>

      {/* Charts row */}
      <section className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Email funnel bar chart */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-[14px] font-[700] text-gray-900 mb-1">Email Engagement Funnel</h3>
          <p className="text-[12px] text-gray-400 mb-4">From sent to meeting booked</p>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={funnelData} barSize={38} margin={{ top: 0, right: 10, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="stage" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Bar dataKey="value" name="Count" radius={[8, 8, 0, 0]}>
                {funnelData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status donut */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <h3 className="text-[14px] font-[700] text-gray-900 mb-1">Email Status Split</h3>
          <p className="text-[12px] text-gray-400 mb-2">Opened vs clicked vs ignored</p>
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={statusDonut} cx="50%" cy="50%" innerRadius={42} outerRadius={65}
                  dataKey="value" labelLine={false} label={renderLabel}>
                  {statusDonut.map((s, i) => <Cell key={i} fill={s.color} strokeWidth={0} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 w-full">
              {statusDonut.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
                    <span className="text-[11px] text-gray-600">{s.name}</span>
                  </div>
                  <span className="text-[12px] font-[700] text-gray-800">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* toolbar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by lead name or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50
                         outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-300"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatus(e.target.value)}
              className="appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-[12px] text-gray-600 shadow-sm outline-none focus:ring-2 focus:ring-violet-400/30 cursor-pointer"
            >
              {statuses.map((s) => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white
                       text-[12px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ tableLayout: "fixed", minWidth: "700px" }}>
            <colgroup>
              <col style={{ width: "16%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "9%"  }} />
            </colgroup>
            <thead>
              <tr className="bg-[#1e293b]">
                {["Lead Name","Email","Company","Date & Time","Subject","Status","Meeting"].map((h) => (
                  <th key={h} className="px-3 py-3 text-[11px] font-[600] uppercase tracking-wide text-white">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[13px] text-gray-400">
                    No records match your search / filter.
                  </td>
                </tr>
              ) : rows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-gray-50 hover:bg-gray-50/70 transition ${idx % 2 !== 0 ? "bg-gray-50/30" : ""}`}
                >
                  <td className="px-3 py-3 text-[12px] font-[600] text-gray-800 truncate">{row.name}</td>
                  <td className="px-3 py-3 text-[11px] text-gray-500 truncate">{row.emailAddr}</td>
                  <td className="px-3 py-3 text-[12px] text-blue-600 font-[500] truncate">{row.company}</td>
                  <td className="px-3 py-3 text-[11px] text-gray-600 whitespace-pre-line leading-tight">{row.dateTime}</td>
                  <td className="px-3 py-3 text-[11px] text-gray-600 truncate" title={row.subject}>{row.subject}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-[600] ${EMAIL_STATUS_STYLE[row.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-[600] border ${
                      row.meeting ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"
                    }`}>
                      {row.meeting ? "Yes" : "No"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[12px] text-gray-400">Showing {rows.length} of {campaign.emailHistory.length} records</p>
          <span className="flex items-center gap-1.5 text-[12px] text-green-600 font-[500]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {campaign.emailHistory.filter((r) => r.meeting).length} meetings booked
          </span>
        </div>
      </div>
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════
   LINKEDIN HISTORY VIEW  (KPI + charts + table)
══════════════════════════════════════════════════════════════ */
function LinkedInHistoryView({ campaign, onBack }) {
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("All Status");

  const statuses = ["All Status", ...new Set(campaign.linkedinHistory.map((r) => r.status))];

  const rows = campaign.linkedinHistory.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                        r.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All Status" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const li = campaign.linkedinHistory;
  const totalOutreach  = li.length;
  const accepted       = li.filter((r) => r.status === "ACCEPTED").length;
  const replied        = li.filter((r) => r.status === "REPLIED").length;
  const noReply        = li.filter((r) => r.status === "NO REPLY").length;
  const meetingBooked  = li.filter((r) => r.meeting).length;
  const connRequests   = li.filter((r) => r.action === "Connection Request").length;
  const inMailSent     = li.filter((r) => r.action === "InMail Sent").length;
  const responseRate   = totalOutreach > 0 ? Math.round(((accepted + replied) / totalOutreach) * 100) : 0;

  const outcomeDonut = [
    { name: "Accepted", value: accepted, color: "#22c55e" },
    { name: "Replied",  value: replied,  color: "#6366f1" },
    { name: "No Reply", value: noReply,  color: "#e2e8f0" },
  ].filter((s) => s.value > 0);

  const actionBarData = [
    { name: "Connection\nRequests", value: connRequests, fill: "#0ea5e9" },
    { name: "InMail\nSent",        value: inMailSent,   fill: "#6366f1" },
  ];

  const engagementData = [
    { metric: "Accepted",    value: accepted,  fill: "#22c55e" },
    { metric: "Replied",     value: replied,   fill: "#6366f1" },
    { metric: "Meeting",     value: meetingBooked, fill: "#f59e0b" },
    { metric: "No Reply",    value: noReply,   fill: "#94a3b8" },
  ];

  const RADIAN = Math.PI / 180;
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.08) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11, fontWeight: 700 }}>
        {`${Math.round(percent * 100)}%`}
      </text>
    );
  };

  return (
    <main className="min-h-[calc(100vh-60px)] bg-[#f4f5f7] p-4">
      <div className="mb-5">
        <button type="button" onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Campaign Activities
        </button>
      </div>

      <div className="mb-5">
        <h1 className="font-poppins text-[17px] font-[700] text-[#0a0a0a]">LinkedIn Activity</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">LinkedIn connection requests and InMail activity</p>
      </div>

      {/* KPI strip */}
      <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Total Outreach",  value: totalOutreach, sub: "all activity",    color: "text-gray-900",   ring: "ring-gray-200"    },
          { label: "Accepted",        value: accepted,      sub: "connections",     color: "text-green-600",  ring: "ring-green-200"   },
          { label: "Replied",         value: replied,       sub: "InMail replies",  color: "text-violet-600", ring: "ring-violet-200"  },
          { label: "No Reply",        value: noReply,       sub: "no response",     color: "text-gray-400",   ring: "ring-gray-200"    },
          { label: "Meetings",        value: meetingBooked, sub: "booked",          color: "text-amber-600",  ring: "ring-amber-200"   },
          { label: "Response Rate",   value: `${responseRate}%`, sub: "of outreach", color: "text-sky-600",   ring: "ring-sky-200"     },
        ].map((k) => (
          <article key={k.label} className={`rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col gap-0.5 ring-1 ${k.ring}`}>
            <p className="text-[10px] font-[600] uppercase tracking-wider text-gray-400">{k.label}</p>
            <p className={`text-[28px] font-[800] leading-none ${k.color}`}>{k.value}</p>
            <p className="text-[11px] text-gray-400">{k.sub}</p>
          </article>
        ))}
      </section>

      {/* Charts row */}
      <section className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Engagement bar chart */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-[14px] font-[700] text-gray-900 mb-1">Engagement Breakdown</h3>
          <p className="text-[12px] text-gray-400 mb-4">Outcomes across all LinkedIn touchpoints</p>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={engagementData} barSize={38} margin={{ top: 0, right: 10, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="metric" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Bar dataKey="value" name="Count" radius={[8, 8, 0, 0]}>
                {engagementData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Outcome donut */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <h3 className="text-[14px] font-[700] text-gray-900 mb-1">Outcome Split</h3>
          <p className="text-[12px] text-gray-400 mb-2">Accepted, replied, no reply</p>
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={outcomeDonut} cx="50%" cy="50%" innerRadius={42} outerRadius={65}
                  dataKey="value" labelLine={false} label={renderLabel}>
                  {outcomeDonut.map((s, i) => <Cell key={i} fill={s.color} strokeWidth={0} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 w-full">
              {outcomeDonut.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
                    <span className="text-[11px] text-gray-600">{s.name}</span>
                  </div>
                  <span className="text-[12px] font-[700] text-gray-800">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Action type breakdown */}
      <div className="mb-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-[14px] font-[700] text-gray-900 mb-1">Action Type Mix</h3>
        <p className="text-[12px] text-gray-400 mb-4">Connection requests vs InMail sent</p>
        <div className="flex items-center gap-6 flex-wrap">
          {[
            { label: "Connection Requests", value: connRequests,  color: "#0ea5e9", bg: "bg-sky-50"    },
            { label: "InMail Sent",         value: inMailSent,    color: "#6366f1", bg: "bg-indigo-50" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="flex-1 min-w-[140px]">
              <div className="flex justify-between mb-1.5">
                <span className="text-[12px] font-[500] text-gray-600">{label}</span>
                <span className="text-[12px] font-[700] text-gray-800">{value}</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${totalOutreach > 0 ? Math.round((value / totalOutreach) * 100) : 0}%`, background: color }} />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">{totalOutreach > 0 ? Math.round((value / totalOutreach) * 100) : 0}% of outreach</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* toolbar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by lead name or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50
                         outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-300"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatus(e.target.value)}
              className="appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-[12px] text-gray-600 shadow-sm outline-none focus:ring-2 focus:ring-violet-400/30 cursor-pointer"
            >
              {statuses.map((s) => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white
                       text-[12px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ tableLayout: "fixed", minWidth: "640px" }}>
            <colgroup>
              <col style={{ width: "18%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "9%"  }} />
            </colgroup>
            <thead>
              <tr className="bg-[#1e293b]">
                {["Lead Name","Title","Company","Date & Time","Action","Status","Meeting"].map((h) => (
                  <th key={h} className="px-3 py-3 text-[11px] font-[600] uppercase tracking-wide text-white">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[13px] text-gray-400">
                    No records match your search / filter.
                  </td>
                </tr>
              ) : rows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-gray-50 hover:bg-gray-50/70 transition ${idx % 2 !== 0 ? "bg-gray-50/30" : ""}`}
                >
                  <td className="px-3 py-3 text-[12px] font-[600] text-gray-800 truncate">{row.name}</td>
                  <td className="px-3 py-3 text-[12px] text-gray-600 truncate">{row.title}</td>
                  <td className="px-3 py-3 text-[12px] text-blue-600 font-[500] truncate">{row.company}</td>
                  <td className="px-3 py-3 text-[11px] text-gray-600 whitespace-pre-line leading-tight">{row.dateTime}</td>
                  <td className="px-3 py-3 text-[11px] text-gray-700 truncate">{row.action}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-[600] ${LINKEDIN_STATUS_STYLE[row.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-[600] border ${
                      row.meeting ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"
                    }`}>
                      {row.meeting ? "Yes" : "No"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[12px] text-gray-400">Showing {rows.length} of {campaign.linkedinHistory.length} records</p>
          <span className="flex items-center gap-1.5 text-[12px] text-green-600 font-[500]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {campaign.linkedinHistory.filter((r) => r.meeting).length} meetings booked
          </span>
        </div>
      </div>
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════
   CREATE CAMPAIGN MODAL
══════════════════════════════════════════════════════════════ */
const EMPTY_FORM = {
  name: "",
  description: "",
  channel: "CALL",
  status: "ACTIVE",
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  targetLeads: "",
  // new fields matching reference UI
  communicationType: "Call",
  startTime: "10:20",
  endTime: "10:20",
  reengageDays: "7",
  maxAttempts: "3",
  channelOrder: [],          // ordered array: ["CALL","EMAIL","LINKEDIN"]
  waitHours: "24",
  waitMinutes: "0",
  campaignPrompt: "",
  modelName: "gpt-4",
  agentName: "",
  loggedInEmail: "",
  parallelCalls: "1",
  listId: "",
  smtpProvider: "default",
  templateId: "",
  fromName: "",
  fromEmail: "",
  replyToEmail: "",
  aiPersonalization: false,
  aiTone: "Professional",
  aiContext: "",
  emailsPerBatch: "100",
  batchDelay: "60",
  // LinkedIn channel config
  connectionNoteTemplate: "Hi {first name}, I'd love to connect!",
  dmBodyTemplate: "Hey {first name}, thanks for connecting!",
  linkedinMaxAttempts: "3",
  // WhatsApp channel config
  whatsappTemplate: "Hi {first name}, following up on your interest in our solution.",
  whatsappMaxAttempts: "3",
};

function CreateCampaignModal({ defaultChannel, onClose, onCreate }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, channel: defaultChannel });
  const [errors, setErrors] = useState({});
  const [channelDropOpen, setChannelDropOpen] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Campaign name is required";
    if (!form.startDate)   e.startDate = "Start date is required";
    return e;
  };

  const handleSubmit = (action) => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const fmt = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    onCreate({
      id: Date.now(),
      name: form.name.trim(),
      description: form.description.trim() || `${form.communicationType} campaign`,
      status: form.status || "ACTIVE",
      channel: form.channelOrder[0] || form.communicationType.toUpperCase() || "CALL",
      startDate: fmt(form.startDate),
      endDate: form.endDate ? fmt(form.endDate) : "—",
      stats: { totalCalls: 0, completed: 0, meetings: 0, convRate: "0%" },
      kpis: [
        { label: "Total Calls",     value: "0",  color: "text-gray-900"   },
        { label: "Completed",       value: "0",  color: "text-green-600"  },
        { label: "Meetings",        value: "0",  color: "text-blue-600"   },
        { label: "Conversion Rate", value: "0%", color: "text-violet-600" },
      ],
      allActivity: [], callHistory: [], emailHistory: [], linkedinHistory: [],
      _action: action,
    });
  };

  /* ── Channel Order helpers ── */
  const CHANNELS = [
    { key: "CALL",      label: "Call",      Icon: Phone,         color: "bg-sky-100 text-sky-700",     ring: "ring-sky-200"     },
    { key: "EMAIL",     label: "Email",     Icon: Mail,          color: "bg-indigo-100 text-indigo-700", ring: "ring-indigo-200"  },
    { key: "LINKEDIN",  label: "LinkedIn",  Icon: Linkedin,      color: "bg-blue-100 text-blue-700",   ring: "ring-blue-200"    },
    { key: "WHATSAPP",  label: "WhatsApp",  Icon: MessageCircle, color: "bg-green-100 text-green-700",  ring: "ring-green-200"   },
  ];

  const toggleChannel = (key) => {
    const cur = form.channelOrder || [];
    set("channelOrder", cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]);
  };

  const moveChannel = (i, dir) => {
    const arr = [...form.channelOrder];
    const to = i + dir;
    if (to < 0 || to >= arr.length) return;
    [arr[i], arr[to]] = [arr[to], arr[i]];
    set("channelOrder", arr);
  };

  /* drag-and-drop reorder */
  const onDragStart = (i) => setDragIdx(i);
  const onDragOver  = (e, i) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    const arr = [...form.channelOrder];
    const dragged = arr.splice(dragIdx, 1)[0];
    arr.splice(i, 0, dragged);
    setDragIdx(i);
    set("channelOrder", arr);
  };
  const onDragEnd = () => setDragIdx(null);

  /* ── Field helper ── */
  const Field = ({ label, required, error, className = "", children }) => (
    <div className={className}>
      {label && (
        <label className="block text-[12px] font-[600] text-[#1e293b] mb-1.5">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );

  const inputCls = (err) =>
    `w-full rounded-lg border px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-indigo-300/40 ${
      err ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-indigo-400"
    }`;

  const selCls = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-800 outline-none focus:ring-2 focus:ring-indigo-300/40 focus:border-indigo-400 appearance-none";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-6 px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <div>
            <h2 className="text-[18px] font-[800] text-[#0a0a0a]">Create New Campaign</h2>
            <p className="text-[12px] text-gray-400">Define campaign settings and parameters</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-5 max-h-[78vh] overflow-y-auto">

          {/* Row 1: Campaign Name + Communication Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Campaign Name" required error={errors.name}>
              <input type="text" placeholder="" value={form.name}
                onChange={(e) => set("name", e.target.value)} className={inputCls(errors.name)} />
            </Field>
            <Field label="Communication Type">
              <div className="relative">
                <select value={form.communicationType} onChange={(e) => set("communicationType", e.target.value)} className={selCls}>
                  <option>Call</option>
                  <option>Email</option>
                  <option>LinkedIn</option>
                  <option>Multi-Channel</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </Field>
          </div>

          {/* Row 2: Start Time + End Time */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Time">
              <input type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} className={inputCls()} />
            </Field>
            <Field label="End Time">
              <input type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} className={inputCls()} />
            </Field>
          </div>

          {/* Row 3: Re-engage Days + Max Attempts + Start Date */}
          <div className="grid grid-cols-3 gap-4">
            <Field label="Re-engage Days">
              <input type="number" min="1" value={form.reengageDays}
                onChange={(e) => set("reengageDays", e.target.value)} className={inputCls()} />
            </Field>
            <Field label="Max Attempts">
              <input type="number" min="1" value={form.maxAttempts}
                onChange={(e) => set("maxAttempts", e.target.value)} className={inputCls()} />
            </Field>
            <Field label="Start Date" required error={errors.startDate}>
              <input type="date" value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)} className={inputCls(errors.startDate)} />
            </Field>
          </div>

          {/* ════════════════════════ CHANNEL ORDER ════════════════════════ */}
          <Field label="Channel Order">
            <div className="relative">
              {/* Trigger pill */}
              <button
                type="button"
                onClick={() => setChannelDropOpen((o) => !o)}
                className="w-full min-h-[42px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-left flex items-center justify-between gap-2 hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300/40 transition"
              >
                {form.channelOrder.length > 0 ? (
                  <div className="flex items-center gap-1.5 flex-wrap flex-1">
                    {form.channelOrder.map((key, idx) => {
                      const ch = CHANNELS.find((c) => c.key === key);
                      return ch ? (
                        <span key={key} className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-[700] ring-1 ${ch.color} ${ch.ring}`}>
                          <span className="opacity-50 text-[10px]">#{idx + 1}</span>
                          <ch.Icon className="h-3 w-3" />
                          {ch.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <span className="text-[13px] text-gray-400 flex-1">Select channels and arrange order…</span>
                )}
                <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200 ${channelDropOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown panel */}
              {channelDropOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-30 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">

                  {/* ── Select channels ── */}
                  <div className="px-4 pt-3 pb-2 border-b border-gray-100">
                    <p className="text-[10px] font-[700] uppercase tracking-widest text-gray-400 mb-2">Select Channels</p>
                    <div className="grid grid-cols-4 gap-2">
                      {CHANNELS.map(({ key, label, Icon, color, ring }) => {
                        const active = form.channelOrder.includes(key);
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => toggleChannel(key)}
                            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition ${
                              active
                                ? `border-indigo-500 bg-indigo-50`
                                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${active ? color : "bg-gray-100"} ring-1 ${active ? ring : "ring-gray-200"}`}>
                              <Icon className={`h-4 w-4 ${active ? "" : "text-gray-400"}`} />
                            </div>
                            <span className={`text-[12px] font-[600] ${active ? "text-indigo-700" : "text-gray-600"}`}>{label}</span>
                            {active && (
                              <span className="text-[10px] font-[700] text-indigo-500">
                                #{form.channelOrder.indexOf(key) + 1}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Hierarchy ordering ── */}
                  {form.channelOrder.length > 0 && (
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-[700] uppercase tracking-widest text-gray-400">
                          Channel Hierarchy — drag or use arrows to reorder
                        </p>
                        <Layers className="h-3.5 w-3.5 text-gray-300" />
                      </div>
                      <div className="space-y-1.5">
                        {form.channelOrder.map((key, i) => {
                          const ch = CHANNELS.find((c) => c.key === key);
                          if (!ch) return null;
                          return (
                            <div
                              key={key}
                              draggable
                              onDragStart={() => onDragStart(i)}
                              onDragOver={(e) => onDragOver(e, i)}
                              onDragEnd={onDragEnd}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition select-none ${
                                dragIdx === i
                                  ? "border-indigo-400 bg-indigo-50 opacity-80 scale-[1.01]"
                                  : "border-gray-100 bg-gray-50/80 hover:border-gray-200"
                              }`}
                            >
                              {/* drag handle */}
                              <GripVertical className="h-4 w-4 text-gray-300 cursor-grab shrink-0" />

                              {/* position badge */}
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-[11px] font-[800] shrink-0">
                                {i + 1}
                              </span>

                              {/* channel icon + label */}
                              <div className={`flex h-7 w-7 items-center justify-center rounded-full ${ch.color} ring-1 ${ch.ring} shrink-0`}>
                                <ch.Icon className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-[13px] font-[600] text-gray-800 flex-1">{ch.label}</span>

                              {/* up/down */}
                              <div className="flex flex-col gap-0.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => moveChannel(i, -1)}
                                  disabled={i === 0}
                                  className="flex items-center justify-center h-5 w-5 rounded hover:bg-gray-200 disabled:opacity-25 transition"
                                >
                                  <ChevronUp className="h-3.5 w-3.5 text-gray-500" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveChannel(i, 1)}
                                  disabled={i === form.channelOrder.length - 1}
                                  className="flex items-center justify-center h-5 w-5 rounded hover:bg-gray-200 disabled:opacity-25 transition"
                                >
                                  <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                                </button>
                              </div>

                              {/* remove */}
                              <button
                                type="button"
                                onClick={() => toggleChannel(key)}
                                className="flex items-center justify-center h-6 w-6 rounded-full hover:bg-red-100 text-gray-300 hover:text-red-500 transition shrink-0"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Footer ── */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">
                      {form.channelOrder.length === 0
                        ? "No channels selected"
                        : `${form.channelOrder.length} channel${form.channelOrder.length > 1 ? "s" : ""} selected`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setChannelDropOpen(false)}
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-[12px] font-[600] hover:bg-indigo-700 transition"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Field>

          {/* Channel Steps Config — dynamic per selected channel */}
          <div>
            <p className="text-[12px] font-[700] text-[#1e293b] mb-2">Channel Steps Config</p>
            <div className="space-y-3">
              {/* Always visible: Wait Duration */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 grid grid-cols-2 gap-4">
                <Field label={<span className="text-indigo-600 font-[600]">Wait Duration Hours</span>}>
                  <input type="number" min="0" value={form.waitHours}
                    onChange={(e) => set("waitHours", e.target.value)} className={inputCls()} />
                </Field>
                <Field label={<span className="text-indigo-600 font-[600]">Wait Duration Minutes</span>}>
                  <input type="number" min="0" max="59" value={form.waitMinutes}
                    onChange={(e) => set("waitMinutes", e.target.value)} className={inputCls()} />
                </Field>
              </div>

              {/* LinkedIn-specific fields */}
              {form.channelOrder.includes("LINKEDIN") && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                      <Linkedin className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <p className="text-[12px] font-[700] text-blue-700">LinkedIn Config</p>
                  </div>
                  <Field label="Connection Note Template">
                    <textarea rows={2} value={form.connectionNoteTemplate}
                      onChange={(e) => set("connectionNoteTemplate", e.target.value)}
                      className={`${inputCls()} resize-none`} />
                  </Field>
                  <Field label="DM Body Template">
                    <textarea rows={2} value={form.dmBodyTemplate}
                      onChange={(e) => set("dmBodyTemplate", e.target.value)}
                      className={`${inputCls()} resize-none`} />
                  </Field>
                  <Field label="Max Attempts">
                    <input type="number" min="1" value={form.linkedinMaxAttempts}
                      onChange={(e) => set("linkedinMaxAttempts", e.target.value)} className={inputCls()} />
                  </Field>
                </div>
              )}

              {/* WhatsApp-specific fields */}
              {form.channelOrder.includes("WHATSAPP") && (
                <div className="rounded-xl border border-green-200 bg-green-50/40 p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                      <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <p className="text-[12px] font-[700] text-green-700">WhatsApp Config</p>
                  </div>
                  <Field label="WhatsApp Message Template">
                    <textarea rows={3} value={form.whatsappTemplate}
                      onChange={(e) => set("whatsappTemplate", e.target.value)}
                      placeholder="Hi {first name}, following up on your interest in our solution."
                      className={`${inputCls()} resize-none`} />
                  </Field>
                  <Field label="Max Attempts">
                    <input type="number" min="1" value={form.whatsappMaxAttempts}
                      onChange={(e) => set("whatsappMaxAttempts", e.target.value)} className={inputCls()} />
                  </Field>
                </div>
              )}
            </div>
          </div>

          {/* Campaign Prompt */}
          <Field label="Campaign Prompt">
            <textarea
              rows={3}
              placeholder="Enter your campaign prompt here…"
              value={form.campaignPrompt}
              onChange={(e) => set("campaignPrompt", e.target.value)}
              className={`${inputCls()} resize-none`}
            />
          </Field>

          {/* Row: Model Name + Agent Name + Logged in User Email */}
          <div className="grid grid-cols-3 gap-4">
            <Field label="Model Name">
              <div className="relative">
                <select value={form.modelName} onChange={(e) => set("modelName", e.target.value)} className={selCls}>
                  <option>gpt-4</option>
                  <option>gpt-4o</option>
                  <option>claude-3-5-sonnet</option>
                  <option>gemini-pro</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </Field>
            <Field label="Agent Name">
              <input type="text" value={form.agentName}
                onChange={(e) => set("agentName", e.target.value)} className={inputCls()} />
            </Field>
            <Field label="Logged in User Email">
              <input type="email" value={form.loggedInEmail}
                onChange={(e) => set("loggedInEmail", e.target.value)} className={inputCls()} />
            </Field>
          </div>

          {/* Row: Parallel Calls + List ID + SMTP Provider Name */}
          <div className="grid grid-cols-3 gap-4">
            <Field label="Campaign Parallel Calls">
              <input type="number" min="1" value={form.parallelCalls}
                onChange={(e) => set("parallelCalls", e.target.value)} className={inputCls()} />
            </Field>
            <Field label="List ID">
              <div className="relative">
                <select value={form.listId} onChange={(e) => set("listId", e.target.value)} className={selCls}>
                  <option value="">Select…</option>
                  <option value="550e8400-e29b-41d4-a1">550e8400-e29b-41d4-a1</option>
                  <option value="660e9500-f30c-52e5-b2">660e9500-f30c-52e5-b2</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </Field>
            <Field label="SMTP Provider Name">
              <input type="text" value={form.smtpProvider}
                onChange={(e) => set("smtpProvider", e.target.value)} className={inputCls()} />
            </Field>
          </div>

          {/* Row: Template ID + From Name + From Email */}
          <div className="grid grid-cols-3 gap-4">
            <Field label="Template ID">
              <div className="relative">
                <select value={form.templateId} onChange={(e) => set("templateId", e.target.value)} className={selCls}>
                  <option value="">Select…</option>
                  <option value="550e8400-e29b-41d4-a1">550e8400-e29b-41d4-a1</option>
                  <option value="660e9500-f30c-52e5-b2">660e9500-f30c-52e5-b2</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </Field>
            <Field label="From Name">
              <input type="text" placeholder="John from Acme Corp" value={form.fromName}
                onChange={(e) => set("fromName", e.target.value)} className={inputCls()} />
            </Field>
            <Field label="From Email">
              <input type="email" placeholder="john@acme.com" value={form.fromEmail}
                onChange={(e) => set("fromEmail", e.target.value)} className={inputCls()} />
            </Field>
          </div>

          {/* Reply to Email */}
          <Field label="Reply to Email">
            <input type="email" placeholder="support@acme.com" value={form.replyToEmail}
              onChange={(e) => set("replyToEmail", e.target.value)} className={inputCls()} />
          </Field>

          {/* Enable AI Personalization toggle */}
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-[700] text-gray-800">Enable AI Personalization</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Use AI to personalize email content</p>
            </div>
            <button
              type="button"
              onClick={() => set("aiPersonalization", !form.aiPersonalization)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.aiPersonalization ? "bg-indigo-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  form.aiPersonalization ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* AI Tone */}
          <Field label="AI Tone">
            <div className="relative">
              <select value={form.aiTone} onChange={(e) => set("aiTone", e.target.value)} className={selCls}>
                {["Professional", "Friendly", "Formal", "Casual", "Persuasive"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </Field>

          {/* AI Context */}
          <Field label="AI Context">
            <textarea
              rows={3}
              placeholder="We help SaaS companies increase revenue by 30% through AI-powered outreach"
              value={form.aiContext}
              onChange={(e) => set("aiContext", e.target.value)}
              className={`${inputCls()} resize-none`}
            />
          </Field>

          {/* Emails per Batch + Delay */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Emails per Batch">
              <input type="number" min="1" value={form.emailsPerBatch}
                onChange={(e) => set("emailsPerBatch", e.target.value)} className={inputCls()} />
            </Field>
            <Field label="Delay between Batches (Seconds)">
              <input type="number" min="0" value={form.batchDelay}
                onChange={(e) => set("batchDelay", e.target.value)} className={inputCls()} />
            </Field>
          </div>

        </div>

        {/* ── Footer actions ── */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSubmit("run")}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0a0a0a] text-white text-[13px] font-[700] hover:bg-gray-800 transition shadow-sm"
            >
              <Zap className="h-4 w-4" /> Run Campaign Now
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("schedule")}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 text-[13px] font-[700] hover:border-gray-400 hover:bg-gray-50 transition"
            >
              <Clock className="h-4 w-4" /> Schedule for Later
            </button>
          </div>
          <button
            type="button"
            onClick={() => handleSubmit("draft")}
            className="w-full py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-[13px] font-[600] hover:bg-gray-50 transition"
          >
            Save as Draft
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CAMPAIGN OVERVIEW DETAIL  (KPI + recharts + progress + table)
══════════════════════════════════════════════════════════════ */
function CampaignOverviewDetail({ campaign, onBack }) {
  const sm = STATUS_META[campaign.status];

  const compRate  = Math.round((campaign.stats.completed / campaign.stats.totalCalls) * 100);
  const meetRate  = Math.round((campaign.stats.meetings / campaign.stats.completed) * 100);
  const convRate  = parseFloat(campaign.stats.convRate);

  const progressBars = [
    { label: campaign.channel === "EMAIL" ? "Delivery Rate"  : "Completion Rate", value: compRate, color: "#22c55e", bg: "bg-green-500"  },
    { label: campaign.channel === "EMAIL" ? "Open Rate"      : "Meeting Rate",    value: meetRate, color: "#8b5cf6", bg: "bg-violet-500" },
    { label: "Conversion Rate",                                                    value: convRate, color: "#3b82f6", bg: "bg-blue-500"   },
  ];

  const radarData = progressBars.map((b) => ({ subject: b.label, A: b.value, fullMark: 100 }));

  const multiChannelData = [
    { name: "Call",      value: campaign.callHistory.length,      fill: "#6366f1" },
    { name: "Email",     value: campaign.emailHistory.length,     fill: "#0ea5e9" },
    { name: "LinkedIn",  value: campaign.linkedinHistory.length,  fill: "#0284c7" },
    { name: "WhatsApp",  value: campaign.whatsappHistory.length,  fill: "#22c55e" },
  ];

  const meetingData = [
    { name: "Meetings",   value: campaign.stats.meetings, color: "#22c55e" },
    { name: "No Meeting", value: campaign.stats.completed - campaign.stats.meetings, color: "#e2e8f0" },
  ].filter((s) => s.value > 0);

  const RADIAN = Math.PI / 180;
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.08) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11, fontWeight: 700 }}>
        {`${Math.round(percent * 100)}%`}
      </text>
    );
  };

  return (
    <main className="min-h-[calc(100vh-60px)] bg-[#f4f5f7] p-4">
      {/* top bar */}
      <div className="mb-5 flex items-center gap-3 flex-wrap">
        <button type="button" onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm shrink-0">
          <ArrowLeft className="h-4 w-4" /> Back to Campaign Activities
        </button>
        <div className="flex-1 min-w-0 flex items-center gap-3 flex-wrap">
          <h1 className="font-poppins text-[16px] font-[700] text-[#0a0a0a] truncate">{campaign.name}</h1>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-[600] border shrink-0 ${sm.bg} ${sm.text} ${sm.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />{sm.label}
          </span>
        </div>
        <button type="button"
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[12px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm shrink-0">
          <Download className="h-3.5 w-3.5" /> Export
        </button>
      </div>

      {/* KPI cards */}
      <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {campaign.kpis.map((k) => (
          <article key={k.label} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 ring-1 ring-gray-100">
            <p className="text-[10px] font-[600] uppercase tracking-widest text-gray-400 mb-1">{k.label}</p>
            <p className={`text-[32px] font-[800] leading-none ${k.color}`}>{k.value}</p>
          </article>
        ))}
      </section>

      {/* Charts row */}
      <section className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress bars + recharts */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-[14px] font-[700] text-gray-900 mb-1">Campaign Performance</h3>
          <p className="text-[12px] text-gray-400 mb-4">Key rate metrics at a glance</p>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={progressBars.map((b) => ({ name: b.label, value: b.value }))} barSize={38} margin={{ top: 0, right: 10, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Bar dataKey="value" name="Rate" radius={[8, 8, 0, 0]}>
                {progressBars.map((b, i) => <Cell key={i} fill={b.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Meeting donut */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <h3 className="text-[14px] font-[700] text-gray-900 mb-1">Meeting Conversion</h3>
          <p className="text-[12px] text-gray-400 mb-2">Contacts that booked a meeting</p>
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={meetingData} cx="50%" cy="50%" innerRadius={42} outerRadius={65}
                  dataKey="value" labelLine={false} label={renderLabel}>
                  {meetingData.map((s, i) => <Cell key={i} fill={s.color} strokeWidth={0} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 w-full">
              {meetingData.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
                    <span className="text-[11px] text-gray-600">{s.name}</span>
                  </div>
                  <span className="text-[12px] font-[700] text-gray-800">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Multi-channel reach bar */}
      <div className="mb-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-[14px] font-[700] text-gray-900 mb-1">Channel Activity Volume</h3>
        <p className="text-[12px] text-gray-400 mb-4">Number of touchpoints per channel</p>
        <div className="flex items-center gap-6 flex-wrap">
          {multiChannelData.map(({ name, value, fill }) => (
            <div key={name} className="flex-1 min-w-[120px]">
              <div className="flex justify-between mb-1.5">
                <span className="text-[12px] font-[500] text-gray-600">{name}</span>
                <span className="text-[12px] font-[700] text-gray-800">{value}</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(...multiChannelData.map((d) => d.value)) > 0 ? Math.round((value / Math.max(...multiChannelData.map((d) => d.value))) * 100) : 0}%`, background: fill }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Channel Activity Summary table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-[14px] font-[600] text-gray-900">Channel Activity Summary</h3>
          <p className="text-[12px] text-gray-400 mt-0.5">Lead-level channel coverage overview</p>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#1e293b]">
              {["Serial No.","Lead Name","Call","Email","LinkedIn","WhatsApp"].map((h) => (
                <th key={h} className="px-5 py-3 text-[11px] font-[600] uppercase tracking-wide text-white">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaign.allActivity.map((row, idx) => (
              <tr key={row.serial} className={`border-b border-gray-50 hover:bg-gray-50/60 transition ${idx % 2 !== 0 ? "bg-gray-50/30" : ""}`}>
                <td className="px-5 py-3.5 text-[13px] text-gray-500">{row.serial}</td>
                <td className="px-5 py-3.5 text-[13px] font-[600] text-gray-800">{row.leadName}</td>
                <td className="px-5 py-3.5">{row.call ? <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-50"><CheckCircle2 className="h-4 w-4 text-green-500" /></span> : <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50"><X className="h-4 w-4 text-red-400" /></span>}</td>
                <td className="px-5 py-3.5">{row.email ? <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-50"><CheckCircle2 className="h-4 w-4 text-green-500" /></span> : <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50"><X className="h-4 w-4 text-red-400" /></span>}</td>
                <td className="px-5 py-3.5">{row.linkedin ? <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-50"><CheckCircle2 className="h-4 w-4 text-green-500" /></span> : <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50"><X className="h-4 w-4 text-red-400" /></span>}</td>
                <td className="px-5 py-3.5">{row.whatsapp ? <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-50"><CheckCircle2 className="h-4 w-4 text-green-500" /></span> : <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50"><X className="h-4 w-4 text-red-400" /></span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════
   WHATSAPP HISTORY VIEW  (KPI + charts + message table)
══════════════════════════════════════════════════════════════ */
function WhatsAppHistoryView({ campaign, onBack }) {
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("All Status");

  const wa = campaign.whatsappHistory;
  const statuses = ["All Status", ...new Set(wa.map((r) => r.status))];

  const rows = wa.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                        r.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All Status" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const total      = wa.length;
  const delivered  = wa.filter((r) => r.status === "DELIVERED").length;
  const read       = wa.filter((r) => r.status === "READ").length;
  const replied    = wa.filter((r) => r.status === "REPLIED").length;
  const noReply    = wa.filter((r) => r.status === "NO REPLY").length;
  const meetings   = wa.filter((r) => r.meeting).length;
  const readRate   = total > 0 ? Math.round(((read + replied) / total) * 100) : 0;

  const statusBarData = [
    { name: "Delivered", value: delivered, fill: "#3b82f6" },
    { name: "Read",      value: read,      fill: "#6366f1" },
    { name: "Replied",   value: replied,   fill: "#22c55e" },
    { name: "No Reply",  value: noReply,   fill: "#94a3b8" },
  ];

  const outcomeDonut = [
    { name: "Replied",   value: replied,   color: "#22c55e" },
    { name: "Read",      value: read,      color: "#6366f1" },
    { name: "Delivered", value: delivered, color: "#3b82f6" },
    { name: "No Reply",  value: noReply,   color: "#e2e8f0" },
  ].filter((s) => s.value > 0);

  const engagementData = [
    { metric: "Delivered", value: delivered, fill: "#3b82f6" },
    { metric: "Read",      value: read,      fill: "#6366f1" },
    { metric: "Replied",   value: replied,   fill: "#22c55e" },
    { metric: "Meeting",   value: meetings,  fill: "#f59e0b" },
    { metric: "No Reply",  value: noReply,   fill: "#94a3b8" },
  ];

  const RADIAN = Math.PI / 180;
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.08) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11, fontWeight: 700 }}>
        {`${Math.round(percent * 100)}%`}
      </text>
    );
  };

  return (
    <main className="min-h-[calc(100vh-60px)] bg-[#f4f5f7] p-4">
      <div className="mb-5">
        <button type="button" onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Campaign Activities
        </button>
      </div>

      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 shrink-0">
          <MessageCircle className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h1 className="font-poppins text-[17px] font-[700] text-[#0a0a0a]">WhatsApp Activity</h1>
          <p className="text-[13px] text-gray-500">Message delivery, reads, and reply tracking</p>
        </div>
      </div>

      {/* KPI strip */}
      <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Total Sent",   value: total,       sub: "messages",      color: "text-gray-900",   ring: "ring-gray-200"   },
          { label: "Delivered",    value: delivered,   sub: "confirmed",     color: "text-sky-600",    ring: "ring-sky-200"    },
          { label: "Read",         value: read,        sub: "opened",        color: "text-indigo-600", ring: "ring-indigo-200" },
          { label: "Replied",      value: replied,     sub: "responses",     color: "text-green-600",  ring: "ring-green-200"  },
          { label: "Meetings",     value: meetings,    sub: "booked",        color: "text-amber-600",  ring: "ring-amber-200"  },
          { label: "Read Rate",    value: `${readRate}%`, sub: "of sent",   color: "text-violet-600", ring: "ring-violet-200" },
        ].map((k) => (
          <article key={k.label} className={`rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col gap-0.5 ring-1 ${k.ring}`}>
            <p className="text-[10px] font-[600] uppercase tracking-wider text-gray-400">{k.label}</p>
            <p className={`text-[28px] font-[800] leading-none ${k.color}`}>{k.value}</p>
            <p className="text-[11px] text-gray-400">{k.sub}</p>
          </article>
        ))}
      </section>

      {/* Charts row */}
      <section className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Engagement bar */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-[14px] font-[700] text-gray-900 mb-1">Message Engagement</h3>
          <p className="text-[12px] text-gray-400 mb-4">Delivery, read, reply and meeting outcomes</p>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={engagementData} barSize={38} margin={{ top: 0, right: 10, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="metric" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Bar dataKey="value" name="Count" radius={[8, 8, 0, 0]}>
                {engagementData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Outcome donut */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <h3 className="text-[14px] font-[700] text-gray-900 mb-1">Outcome Split</h3>
          <p className="text-[12px] text-gray-400 mb-2">Replied, read, delivered, no reply</p>
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={outcomeDonut} cx="50%" cy="50%" innerRadius={42} outerRadius={65}
                  dataKey="value" labelLine={false} label={renderLabel}>
                  {outcomeDonut.map((s, i) => <Cell key={i} fill={s.color} strokeWidth={0} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 w-full">
              {outcomeDonut.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
                    <span className="text-[11px] text-gray-600">{s.name}</span>
                  </div>
                  <span className="text-[12px] font-[700] text-gray-800">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Status progress bars */}
      <div className="mb-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-[14px] font-[700] text-gray-900 mb-1">Status Breakdown</h3>
        <p className="text-[12px] text-gray-400 mb-4">Distribution of message statuses</p>
        <div className="space-y-3">
          {statusBarData.map(({ name, value, fill }) => (
            <div key={name}>
              <div className="flex justify-between mb-1.5">
                <span className="text-[12px] font-[500] text-gray-600">{name}</span>
                <span className="text-[12px] font-[700] text-gray-800">{value} <span className="text-gray-400 font-[400]">({total > 0 ? Math.round((value / total) * 100) : 0}%)</span></span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${total > 0 ? Math.round((value / total) * 100) : 0}%`, background: fill }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input type="text" placeholder="Search by lead name or company..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-300" />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={(e) => setStatus(e.target.value)}
              className="appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-[12px] text-gray-600 shadow-sm outline-none focus:ring-2 focus:ring-green-400/30 cursor-pointer">
              {statuses.map((s) => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          </div>
          <button type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[12px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ tableLayout: "fixed", minWidth: "700px" }}>
            <colgroup>
              <col style={{ width: "16%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "5%" }} />
            </colgroup>
            <thead>
              <tr className="bg-[#1e293b]">
                {["Lead Name","Phone","Company","Date / Time","Message Preview","Status","Mtg"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[11px] font-[600] uppercase tracking-wide text-white">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-[13px] text-gray-400">No messages match your search or filter.</td>
                </tr>
              ) : rows.map((row, idx) => (
                <tr key={idx} className={`border-b border-gray-50 hover:bg-green-50/30 transition ${idx % 2 !== 0 ? "bg-gray-50/30" : ""}`}>
                  <td className="px-4 py-3.5 text-[13px] font-[600] text-gray-800 truncate">{row.name}</td>
                  <td className="px-4 py-3.5 text-[12px] text-gray-500 truncate">{row.phone}</td>
                  <td className="px-4 py-3.5 text-[12px] text-gray-600 truncate">{row.company}</td>
                  <td className="px-4 py-3.5 text-[12px] text-gray-500 whitespace-pre-line">{row.dateTime}</td>
                  <td className="px-4 py-3.5 text-[12px] text-gray-600 truncate" title={row.messagePreview}>{row.messagePreview}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-[700] whitespace-nowrap ${WHATSAPP_STATUS_STYLE[row.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {row.meeting ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100"><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /></span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100"><X className="h-3.5 w-3.5 text-gray-400" /></span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════
   DETAIL DISPATCHER — routes by activity type
══════════════════════════════════════════════════════════════ */
function CampaignDetail({ campaign, activity, onBack }) {
  if (activity === "ALL")       return <CampaignOverviewDetail  campaign={campaign} onBack={onBack} />;
  if (activity === "CALL")      return <CallHistoryView         campaign={campaign} onBack={onBack} />;
  if (activity === "EMAIL")     return <EmailHistoryView        campaign={campaign} onBack={onBack} />;
  if (activity === "LINKEDIN")  return <LinkedInHistoryView     campaign={campaign} onBack={onBack} />;
  if (activity === "WHATSAPP")  return <WhatsAppHistoryView     campaign={campaign} onBack={onBack} />;
  return <AllCampaignActivity campaign={campaign} onBack={onBack} />;
}

/* ══════════════════════════════════════════════════════════════
   ROOT — list → activities → detail navigation
══════════════════════════════════════════════════════════════ */
export default function CampaignDashboard() {
  const [allCampaigns, setAllCampaigns]   = useState(campaigns);
  const [view, setView]                   = useState("list");         // "list" | "activities" | "detail"
  const [selectedCampaign, setSelected]   = useState(null);
  const [selectedActivity, setActivity]   = useState(null);

  if (view === "activities" && selectedCampaign) {
    return (
      <CampaignActivities
        campaign={selectedCampaign}
        onBack={() => { setView("list"); setSelected(null); }}
        onSelectActivity={(act) => { setActivity(act); setView("detail"); }}
      />
    );
  }

  if (view === "detail" && selectedCampaign) {
    return (
      <CampaignDetail
        campaign={selectedCampaign}
        activity={selectedActivity}
        onBack={() => setView("activities")}
      />
    );
  }

  return (
    <CampaignList
      campaigns={allCampaigns}
      onViewDetails={(c) => { setSelected(c); setView("activities"); }}
      onAddCampaign={(newCampaign) => setAllCampaigns((prev) => [newCampaign, ...prev])}
    />
  );
}

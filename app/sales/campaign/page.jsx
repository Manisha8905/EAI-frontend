"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  listCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  toggleActivateCampaign,
  fetchCallHistory,
  fetchEmailHistory,
  fetchLinkedinHistory,
  fetchWhatsappHistory,
} from "../../Redux/actions/authActions";
import axiosInstance from "../../Redux/axiosInstance";
import { toast } from "react-toastify";
import {
  Plus,
  Search,
  RefreshCw,
  Calendar,
  Play,
  Pause,
  CheckCircle2,
  TrendingUp,
  Eye,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft,
  Phone,
  Mail,
  Linkedin,
  MessageCircle,
  Download,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

const CALL_STATUS_STYLE = {
  COMPLETED: "bg-green-500 text-white",
  "VOICE MAIL": "bg-yellow-400 text-white",
  "NO ANSWER": "bg-gray-400 text-white",
};
const EMAIL_STATUS_STYLE = {
  OPENED: "bg-blue-50 text-blue-700 border border-blue-200",
  CLICKED: "bg-teal-50 text-teal-700 border border-teal-200",
  REPLIED: "bg-green-50 text-green-700 border border-green-200",
  "NOT OPENED": "bg-gray-100 text-gray-500 border border-gray-200",
  "NO OPEN": "bg-gray-100 text-gray-500 border border-gray-200",
};
const LINKEDIN_STATUS_STYLE = {
  CONNECTED: "bg-green-50 text-green-700 border border-green-200",
  ACCEPTED: "bg-green-50 text-green-700 border border-green-200",
  PENDING: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  "MESSAGE SENT": "bg-blue-50 text-blue-700 border border-blue-200",
  REPLIED: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  "NOT CONNECTED": "bg-gray-100 text-gray-500 border border-gray-200",
  "MEETING SCHEDULED": "bg-violet-50 text-violet-700 border border-violet-200",
  "NO REPLY": "bg-gray-100 text-gray-500 border border-gray-200",
};

/* ── Stable Field component (defined at module level to prevent remount on re-render) ── */
const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[12px] font-[600] text-[#1e293b]">
      {label}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

export default function CampaignPage() {
  const dispatch = useDispatch();

  /* ── Redux state ── */
  const {
    campaignLoading: loading,
    campaigns,
    campaignTotal,
    campaignError: error,
    callHistory,
    callHistoryLoading,
    emailHistory,
    emailHistoryLoading,
    linkedinHistory,
    linkedinHistoryLoading,
    whatsappHistory,
    whatsappHistoryLoading,
  } = useSelector((state) => state.admin);

  const PAGE_SIZE = 20;

  /* ── Local UI state ── */
  const [filter, setFilter] = useState("All");
  const [commFilter, setCommFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  /* ── Detail + tab state ── */
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [activeTab, setActiveTab] = useState(null); // null = activities menu
  const [togglingId, setTogglingId] = useState(null); // campaign id currently being toggled

  /* ── Create form state ── */
  const blankForm = {
    campaign_name: "",
    // campaign_type: "CRM",
    // communication_type: "CALL",
    start_time: "",
    end_time: "",
    reengage_days: 7,
    max_attempts: 3,
    start_date: "",
    channel_order: [],
    // Per-channel step config (keyed by channel name)
    channel_steps: {},
    campaign_prompt: "",
    vapi_voice_id: "11labs-emily",
    vapi_model: "gpt-4",
    agent_name: "",
    logged_in_user_email: "",
    campaign_parallel_calls: 1,
    list_id: "",
    // Email fields
    smtp_provider_name: "default",
    template_id: "",
    from_name: "",
    from_email: "",
    reply_to_email: "",
    enable_ai_personalization: false,
    ai_tone: "professional",
    ai_context: "",
    emails_per_batch: 100,
    delay_between_batches_seconds: 60,
    // LinkedIn fields
    connection_note_template: "Hi {first_name}, I'd love to connect!",
    dm_body_template: "Hey {first_name}, thanks for connecting!",
    linkedin_max_attempts: 3,
    reply_wait_hours: 72,
    reply_wait_minutes: 0,
  };
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [creating, setCreating] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState(null); // null = create, string = edit
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // { id, name }
  const [deleting, setDeleting] = useState(false);

  /* ── Activity sub-view search/filter state (must be unconditional) ── */
  const [callSearch, setCallSearch] = useState("");
  const [callStatus, setCallStatus] = useState("All Status");
  const [transcript, setTranscript] = useState(null);
  const [emailSearch, setEmailSearch] = useState("");
  const [emailStatus, setEmailStatus] = useState("All Status");
  const [liSearch, setLiSearch] = useState("");
  const [liStatus, setLiStatus] = useState("All Status");
  const [waSearch, setWaSearch] = useState("");
  const [waStatus, setWaStatus] = useState("All Status");

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* helper: update a nested channel_steps field */
  const setChannelStep = (channel, field, value) => {
    setForm((p) => ({
      ...p,
      channel_steps: {
        ...p.channel_steps,
        [channel]: { ...(p.channel_steps[channel] || {}), [field]: value },
      },
    }));
  };

  const handleCreate = async (mode = "run") => {
    if (!form.campaign_name.trim()) return;
    setCreating(true);

    // Build channel_order as { "1": "EMAIL", "2": "CALL" }
    const channelOrderObj = {};
    form.channel_order.forEach((ch, idx) => {
      channelOrderObj[String(idx + 1)] = ch.toUpperCase();
    });

    // Build channel_steps_config per step
    const channelStepsConfig = {};
    form.channel_order.forEach((ch, idx) => {
      const key = String(idx + 1);
      const upper = ch.toUpperCase();
      const custom = form.channel_steps[ch] || {};
      if (upper === "EMAIL") {
        channelStepsConfig[key] = {
          wait_duration_hours: Number(custom.wait_duration_hours ?? 24),
          wait_duration_minutes: Number(custom.wait_duration_minutes ?? 0),
        };
      } else if (upper === "LINKEDIN") {
        channelStepsConfig[key] = {
          connection_note_template: form.connection_note_template,
          dm_body_template: form.dm_body_template,
          max_attempts: Number(form.linkedin_max_attempts),
          reply_wait_hours: Number(form.reply_wait_hours),
          reply_wait_minutes: Number(form.reply_wait_minutes),
          wait_duration_hours: Number(custom.wait_duration_hours ?? 48),
        };
      } else {
        channelStepsConfig[key] = {
          wait_duration_hours: Number(custom.wait_duration_hours ?? 24),
          wait_duration_minutes: Number(custom.wait_duration_minutes ?? 0),
        };
      }
    });

    // Format times — send as simple HH:MM (e.g. "08:00", "17:45")
    const toISODate = (d) => (d ? new Date(d).toISOString() : undefined);

    const payload = {
      campaign_name: form.campaign_name,
      // campaign_type: form.campaign_type,
      // communication_type: form.communication_type,
      start_time: form.start_time || undefined,
      end_time: form.end_time || undefined,
      reengage_days: Number(form.reengage_days),
      max_attempts: Number(form.max_attempts),
      start_date: toISODate(form.start_date),
      channel_order: channelOrderObj,
      channel_steps_config: channelStepsConfig,
      campaign_prompt: form.campaign_prompt,
      vapi_voice_id: form.vapi_voice_id,
      vapi_model: form.vapi_model,
      agent_name: form.agent_name,
      logged_in_user_email: form.logged_in_user_email,
      campaign_parallel_calls: Number(form.campaign_parallel_calls),
      list_id: form.list_id || undefined,
      smtp_provider_name: form.smtp_provider_name,
      template_id: form.template_id || undefined,
      from_name: form.from_name,
      from_email: form.from_email,
      reply_to_email: form.reply_to_email,
      enable_ai_personalization: form.enable_ai_personalization,
      ai_tone: form.ai_tone,
      ai_context: form.ai_context,
      emails_per_batch: Number(form.emails_per_batch),
      delay_between_batches_seconds: Number(form.delay_between_batches_seconds),
    };

    if (editingCampaignId) {
      await dispatch(
        updateCampaign(editingCampaignId, payload, () => {
          setShowCreate(false);
          setForm(blankForm);
          setEditingCampaignId(null);
        }),
      );
    } else {
      await dispatch(
        createCampaign(payload, () => {
          setShowCreate(false);
          setForm(blankForm);
        }),
      );
    }
    setCreating(false);
  };

  /* ── Open edit form — fetch single campaign then pre-populate ── */
  const handleEdit = async (campaignId) => {
    setLoadingEdit(true);
    try {
      const res = await axiosInstance.get(`/get-campaigns/${campaignId}`);
      const c = res.data;

      // Reverse-map channel_order: { "1": "EMAIL", "2": "CALL" } → ["Email", "Call"]
      const rawChannelOrder = c.channel_order ?? {};
      const channelOrder = Object.keys(rawChannelOrder)
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => {
          const upper = rawChannelOrder[k];
          return upper.charAt(0) + upper.slice(1).toLowerCase();
        });

      // Reverse-map channel_steps_config back into per-channel form state
      const rawSteps = c.channel_steps_config ?? {};
      const channelSteps = {};
      channelOrder.forEach((ch, idx) => {
        const key = String(idx + 1);
        if (rawSteps[key]) channelSteps[ch] = rawSteps[key];
      });

      // Extract LinkedIn step data (if present)
      const liIdx = channelOrder.indexOf("Linkedin");
      const liData = liIdx !== -1 ? (rawSteps[String(liIdx + 1)] ?? {}) : {};

      setForm({
        campaign_name: c.campaign_name ?? "",
        start_time: c.start_time ?? "",
        end_time: c.end_time ?? "",
        reengage_days: c.reengage_days ?? 7,
        max_attempts: c.max_attempts ?? 3,
        start_date: c.start_date
          ? new Date(c.start_date).toISOString().split("T")[0]
          : "",
        channel_order: channelOrder,
        channel_steps: channelSteps,
        campaign_prompt: c.campaign_prompt ?? "",
        vapi_voice_id: c.vapi_voice_id ?? "11labs-emily",
        vapi_model: c.vapi_model ?? "gpt-4",
        agent_name: c.agent_name ?? "",
        logged_in_user_email: c.logged_in_user_email ?? "",
        campaign_parallel_calls: c.campaign_parallel_calls ?? 1,
        list_id: c.list_id ?? "",
        smtp_provider_name: c.smtp_provider_name ?? "default",
        template_id: c.template_id ?? "",
        from_name: c.from_name ?? "",
        from_email: c.from_email ?? "",
        reply_to_email: c.reply_to_email ?? "",
        enable_ai_personalization: c.enable_ai_personalization ?? false,
        ai_tone: c.ai_tone ?? "professional",
        ai_context: c.ai_context ?? "",
        emails_per_batch: c.emails_per_batch ?? 100,
        delay_between_batches_seconds: c.delay_between_batches_seconds ?? 60,
        connection_note_template:
          liData.connection_note_template ??
          "Hi {first_name}, I'd love to connect!",
        dm_body_template:
          liData.dm_body_template ??
          "Hey {first_name}, thanks for connecting!",
        linkedin_max_attempts: liData.max_attempts ?? 3,
        reply_wait_hours: liData.reply_wait_hours ?? 72,
        reply_wait_minutes: liData.reply_wait_minutes ?? 0,
      });
      setEditingCampaignId(campaignId);
      setShowCreate(true);
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load campaign for editing.",
      );
    } finally {
      setLoadingEdit(false);
    }
  };

  /* ── Build API params from current filters ── */
  const buildParams = (overrides = {}) => {
    const p = { page, page_size: PAGE_SIZE, ...overrides };
    if (filter !== "All") p.status = filter.toUpperCase();
    if (commFilter !== "All") p.communication_type = commFilter.toUpperCase();
    return p;
  };

  /* ── Dispatch when filters / page change ── */
  useEffect(() => {
    dispatch(listCampaigns(buildParams()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, commFilter, page]);

  /* ── Fetch history data when a campaign activity tab is opened ── */
  useEffect(() => {
    if (!selectedCampaign) return;
    if (activeTab === "CALL") dispatch(fetchCallHistory(selectedCampaign.id));
    if (activeTab === "EMAIL") dispatch(fetchEmailHistory(selectedCampaign.id));
    if (activeTab === "LINKEDIN")
      dispatch(fetchLinkedinHistory(selectedCampaign.id));
    if (activeTab === "WHATSAPP")
      dispatch(fetchWhatsappHistory(selectedCampaign.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampaign, activeTab]);

  /* ── Refresh handler ── */
  const handleRefresh = () => {
    setRefreshing(true);
    dispatch(listCampaigns(buildParams()));
    setTimeout(() => setRefreshing(false), 800);
  };

  /* ── Client-side name search (against current page) ── */
  const filtered = (campaigns ?? []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil((campaignTotal ?? 0) / PAGE_SIZE);

  /* ── Stats ── */
  const stats = [
    {
      label: "Active",
      value: (campaigns ?? []).filter((c) => c.status === "ACTIVE").length,
      icon: Play,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-100",
    },
    {
      label: "Paused",
      value: (campaigns ?? []).filter((c) => c.status === "PAUSED").length,
      icon: Pause,
      color: "text-amber-500",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    {
      label: "Completed",
      value: (campaigns ?? []).filter((c) => c.status === "COMPLETED").length,
      icon: CheckCircle2,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      label: "Total Campaigns",
      value: (campaigns ?? []).length,
      icon: TrendingUp,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-100",
    },
  ];

  const statusBadge = (status) => {
    const map = {
      ACTIVE: "bg-green-100 text-green-700 border-green-200",
      PAUSED: "bg-amber-100 text-amber-700 border-amber-200",
      COMPLETED: "bg-blue-100 text-blue-700 border-blue-200",
      RUNNING: "bg-violet-100 text-violet-700 border-violet-200",
    };
    return map[status] ?? "bg-gray-100 text-gray-600 border-gray-200";
  };

  const statusDot = (status) => {
    const map = {
      ACTIVE: "bg-green-500",
      PAUSED: "bg-amber-400",
      COMPLETED: "bg-blue-500",
      RUNNING: "bg-violet-500 animate-pulse",
    };
    return map[status] ?? "bg-gray-400";
  };

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return d;
    }
  };

  /* ── Shared form helpers (stable references — must NOT be inside if-block) ── */
  const inputCls =
    "rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] text-gray-700 outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 w-full";
  const selectCls = inputCls + " appearance-none cursor-pointer";

  /* ── Full-page Create Campaign form ── */
  if (showCreate) {
    return (
      <main className="min-h-screen bg-[#f4f5f7]">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-[17px] font-[700] text-[#0a0a0a]">
              {editingCampaignId ? "Edit Campaign" : "Create New Campaign"}
            </h1>
            <p className="text-[12px] text-gray-400 mt-0.5">
              {editingCampaignId
                ? "Update campaign settings and parameters"
                : "Define campaign settings and parameters"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowCreate(false);
              setForm(blankForm);
              setEditingCampaignId(null);
            }}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
          {/* Section: Basic Info */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Campaign Name" required>
                <input
                  name="campaign_name"
                  value={form.campaign_name}
                  onChange={handleFormChange}
                  placeholder="e.g. Q2 Enterprise Outreach"
                  required
                  className={inputCls}
                />
              </Field>
              {/* <Field label="Campaign Type">
                <div className="relative">
                  <select
                    name="campaign_type"
                    value={form.campaign_type}
                    onChange={handleFormChange}
                    className={selectCls}
                  >
                    <option value=""></option>
                    <option value="CRM">CRM</option>
                    <option value="Excel">Excel</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </Field>
              <Field label="Communication Type">
                <div className="relative">
                  <select
                    name="communication_type"
                    value={form.communication_type}
                    onChange={handleFormChange}
                    className={selectCls}
                  >
                    <option value="CALL">Call</option>
                    <option value="EMAIL">Email</option>
                    <option value="LINKEDIN">LinkedIn</option>
                    <option value="WHATSAPP">WhatsApp</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </Field> */}
              <Field label="Start Time">
                <input
                  type="time"
                  step="1"
                  name="start_time"
                  value={form.start_time}
                  onChange={handleFormChange}
                  className={inputCls}
                />
              </Field>
              <Field label="End Time">
                <input
                  type="time"
                  step="1"
                  name="end_time"
                  value={form.end_time}
                  onChange={handleFormChange}
                  className={inputCls}
                />
              </Field>
              <Field label="Re-engage Days">
                <input
                  type="number"
                  name="reengage_days"
                  value={form.reengage_days}
                  onChange={handleFormChange}
                  min={0}
                  className={inputCls}
                />
              </Field>
              <Field label="Max Attempts">
                <input
                  type="number"
                  name="max_attempts"
                  value={form.max_attempts}
                  onChange={handleFormChange}
                  min={1}
                  className={inputCls}
                />
              </Field>
              <Field label="Start Date" required>
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleFormChange}
                  className={inputCls}
                />
              </Field>
            </div>
            {/* Channel Order — multi-select ordered chips (spans full row) */}
            <div className="mt-4">
              <label className="block text-[12px] font-[600] text-[#1e293b] mb-1">
                Channel Order
              </label>
              <div className="rounded-xl border border-gray-200 bg-white px-3.5 py-3 min-h-[52px]">
                {/* Selected chips showing step number */}
                {form.channel_order.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2.5">
                    {form.channel_order.map((ch, idx) => {
                      const chipBg =
                        {
                          Email: "#0ea5e9",
                          Call: "#6366f1",
                          LinkedIn: "#0284c7",
                          WhatsApp: "#22c55e",
                        }[ch] ?? "#6b7280";
                      return (
                        <span
                          key={ch}
                          className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full text-[12px] font-[600] text-white"
                          style={{ background: chipBg }}
                        >
                          <span className="w-5 h-5 rounded-full bg-white/25 text-[10px] font-[800] inline-flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          {ch}
                          <button
                            type="button"
                            onClick={() =>
                              setForm((p) => ({
                                ...p,
                                channel_order: p.channel_order.filter(
                                  (c) => c !== ch,
                                ),
                              }))
                            }
                            className="ml-0.5 rounded-full p-0.5 hover:bg-white/30 transition"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
                {/* Available unselected channel pills */}
                <div className="flex flex-wrap gap-2">
                  {["Email", "Call", "LinkedIn", "WhatsApp"]
                    .filter((ch) => !form.channel_order.includes(ch))
                    .map((ch) => {
                      const pillCls =
                        {
                          Email: "border-sky-200 text-sky-600 hover:bg-sky-50",
                          Call: "border-indigo-200 text-indigo-600 hover:bg-indigo-50",
                          LinkedIn:
                            "border-blue-200 text-blue-600 hover:bg-blue-50",
                          WhatsApp:
                            "border-green-200 text-green-600 hover:bg-green-50",
                        }[ch] ??
                        "border-gray-200 text-gray-600 hover:bg-gray-50";
                      return (
                        <button
                          key={ch}
                          type="button"
                          onClick={() =>
                            setForm((p) => ({
                              ...p,
                              channel_order: [...p.channel_order, ch],
                            }))
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-[600] border bg-white transition ${pillCls}`}
                        >
                          <Plus className="h-3 w-3" />
                          {ch}
                        </button>
                      );
                    })}
                  {form.channel_order.length === 0 && (
                    <span className="text-[12px] text-gray-400 self-center">
                      Click a channel to add it to the sequence
                    </span>
                  )}
                  {form.channel_order.length === 4 && (
                    <span className="text-[11px] text-gray-400 italic self-center">
                      All channels selected — remove one to reorder.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Section: Channel Steps Config — per channel */}
          {form.channel_order.length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="text-[14px] font-[700] text-[#1e3a8a]">
                Channel Steps Config
              </h2>
              {form.channel_order.map((ch, idx) => {
                const upper = ch.toUpperCase();
                const stepData = form.channel_steps[ch] || {};
                const ChIcon =
                  {
                    Email: Mail,
                    Call: Phone,
                    LinkedIn: Linkedin,
                    WhatsApp: MessageCircle,
                  }[ch] ?? Phone;
                return (
                  <div
                    key={ch}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 text-[11px] font-[800]">
                        #{idx + 1}
                      </span>
                      <ChIcon className="h-4 w-4 text-indigo-500" />
                      <span className="text-[13px] font-[700] text-gray-800">
                        {ch}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Wait Duration Hours">
                        <input
                          type="number"
                          value={
                            stepData.wait_duration_hours ??
                            (upper === "LINKEDIN" ? 48 : 24)
                          }
                          onChange={(e) =>
                            setChannelStep(
                              ch,
                              "wait_duration_hours",
                              e.target.value,
                            )
                          }
                          min={0}
                          className={inputCls}
                        />
                      </Field>
                      {upper !== "LINKEDIN" && (
                        <Field label="Wait Duration Minutes">
                          <input
                            type="number"
                            value={stepData.wait_duration_minutes ?? 0}
                            onChange={(e) =>
                              setChannelStep(
                                ch,
                                "wait_duration_minutes",
                                e.target.value,
                              )
                            }
                            min={0}
                            max={59}
                            className={inputCls}
                          />
                        </Field>
                      )}
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {/* Campaign Prompt */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <Field label="Campaign Prompt">
              <textarea
                name="campaign_prompt"
                value={form.campaign_prompt}
                onChange={handleFormChange}
                rows={4}
                placeholder="Enter your campaign prompt here..."
                className={inputCls + " resize-none"}
              />
            </Field>
          </section>

          {/* Section: Agent & Model */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-[14px] font-[700] text-[#1e3a8a] mb-4">
              Agent & Voice Config
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="VAPI Model">
                <div className="relative">
                  <select
                    name="vapi_model"
                    value={form.vapi_model}
                    onChange={handleFormChange}
                    className={selectCls}
                  >
                    {["gpt-4", "gpt-4o", "gpt-3.5-turbo"].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </Field>
              <Field label="VAPI Voice ID">
                <input
                  name="vapi_voice_id"
                  value={form.vapi_voice_id}
                  onChange={handleFormChange}
                  placeholder="e.g. 11labs-emily"
                  className={inputCls}
                />
              </Field>
              <Field label="Agent Name">
                <input
                  name="agent_name"
                  value={form.agent_name}
                  onChange={handleFormChange}
                  placeholder="e.g. Sarah"
                  className={inputCls}
                />
              </Field>
              <Field label="Logged in User Email">
                <input
                  type="email"
                  name="logged_in_user_email"
                  value={form.logged_in_user_email}
                  onChange={handleFormChange}
                  placeholder="user@company.com"
                  className={inputCls}
                />
              </Field>
              <Field label="Campaign Parallel Calls">
                <input
                  type="number"
                  name="campaign_parallel_calls"
                  value={form.campaign_parallel_calls}
                  onChange={handleFormChange}
                  min={1}
                  className={inputCls}
                />
              </Field>
              <Field label="List ID">
                <input
                  name="list_id"
                  value={form.list_id}
                  onChange={handleFormChange}
                  placeholder="e.g. 550e8400-e29b-41d4-..."
                  className={inputCls}
                />
              </Field>
            </div>
          </section>

          {/* Section: Email Config — only when Email is in channel_order */}
          {form.channel_order.map((c) => c.toUpperCase()).includes("EMAIL") && (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="h-4 w-4 text-indigo-600" />
                <h2 className="text-[14px] font-[700] text-[#1e3a8a]">
                  Email Configuration
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="SMTP Provider Name">
                  <input
                    name="smtp_provider_name"
                    value={form.smtp_provider_name}
                    onChange={handleFormChange}
                    placeholder="default"
                    className={inputCls}
                  />
                </Field>
                <Field label="Template ID">
                  <input
                    name="template_id"
                    value={form.template_id}
                    onChange={handleFormChange}
                    placeholder="e.g. 550e8400-e29b-41d4-..."
                    className={inputCls}
                  />
                </Field>
                <Field label="From Name">
                  <input
                    name="from_name"
                    value={form.from_name}
                    onChange={handleFormChange}
                    placeholder="John from Acme Corp"
                    className={inputCls}
                  />
                </Field>
                <Field label="From Email">
                  <input
                    type="email"
                    name="from_email"
                    value={form.from_email}
                    onChange={handleFormChange}
                    placeholder="john@acme.com"
                    className={inputCls}
                  />
                </Field>
                <Field label="Reply to Email">
                  <input
                    type="email"
                    name="reply_to_email"
                    value={form.reply_to_email}
                    onChange={handleFormChange}
                    placeholder="support@acme.com"
                    className={inputCls}
                  />
                </Field>
                <Field label="Emails per Batch">
                  <input
                    type="number"
                    name="emails_per_batch"
                    value={form.emails_per_batch}
                    onChange={handleFormChange}
                    min={1}
                    className={inputCls}
                  />
                </Field>
                <Field label="Delay between Batches (Seconds)">
                  <input
                    type="number"
                    name="delay_between_batches_seconds"
                    value={form.delay_between_batches_seconds}
                    onChange={handleFormChange}
                    min={0}
                    className={inputCls}
                  />
                </Field>
              </div>
            </section>
          )}

          {/* Section: LinkedIn Config — only when LinkedIn is in channel_order */}
          {form.channel_order
            .map((c) => c.toUpperCase())
            .includes("LINKEDIN") && (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Linkedin className="h-4 w-4 text-blue-600" />
                <h2 className="text-[14px] font-[700] text-[#2563eb]">
                  LinkedIn Configuration
                </h2>
              </div>
              <div className="space-y-4">
                <Field label="Connection Note Template">
                  <textarea
                    name="connection_note_template"
                    value={form.connection_note_template}
                    onChange={handleFormChange}
                    rows={2}
                    placeholder="Hi {first_name}, I'd love to connect!"
                    className={inputCls + " resize-none"}
                  />
                </Field>
                <Field label="DM Body Template">
                  <textarea
                    name="dm_body_template"
                    value={form.dm_body_template}
                    onChange={handleFormChange}
                    rows={2}
                    placeholder="Hey {first_name}, thanks for connecting!"
                    className={inputCls + " resize-none"}
                  />
                </Field>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Max Attempts">
                    <input
                      type="number"
                      name="linkedin_max_attempts"
                      value={form.linkedin_max_attempts}
                      onChange={handleFormChange}
                      min={1}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Reply Wait Hours">
                    <input
                      type="number"
                      name="reply_wait_hours"
                      value={form.reply_wait_hours}
                      onChange={handleFormChange}
                      min={0}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Reply Wait Minutes">
                    <input
                      type="number"
                      name="reply_wait_minutes"
                      value={form.reply_wait_minutes}
                      onChange={handleFormChange}
                      min={0}
                      max={59}
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>
            </section>
          )}

          {/* Section: AI Personalization */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-[14px] font-[600] text-[#0a0a0a]">
                  Enable AI Personalization
                </p>
                <p className="text-[12px] text-blue-500 mt-0.5">
                  Use AI to personalize email content
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    enable_ai_personalization: !p.enable_ai_personalization,
                  }))
                }
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${form.enable_ai_personalization ? "bg-[#1e293b]" : "bg-gray-200"}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${form.enable_ai_personalization ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
            </div>
            {form.enable_ai_personalization && (
              <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
                <Field label="AI Tone">
                  <div className="relative">
                    <select
                      name="ai_tone"
                      value={form.ai_tone}
                      onChange={handleFormChange}
                      className={selectCls}
                    >
                      {[
                        "professional",
                        "casual",
                        "friendly",
                        "formal",
                        "persuasive",
                      ].map((t) => (
                        <option key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </Field>
                <Field label="AI Context">
                  <textarea
                    name="ai_context"
                    value={form.ai_context}
                    onChange={handleFormChange}
                    rows={3}
                    placeholder="We help SaaS companies increase revenue by 30% through AI-powered outreach"
                    className={inputCls + " resize-none"}
                  />
                </Field>
              </div>
            )}
          </section>

          {/* Action buttons */}
          {editingCampaignId ? (
            /* ── Edit mode: single Update button ── */
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <button
                type="button"
                disabled={creating || !form.campaign_name.trim()}
                onClick={() => handleCreate("run")}
                className="flex w-full items-center justify-center gap-2 py-3.5 rounded-xl bg-[#6366f1] text-white text-[14px] font-[700] hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Pencil className="h-4 w-4" />
                )}
                {creating ? "Updating…" : "Update Campaign"}
              </button>
            </section>
          ) : (
            /* ── Create mode: three buttons ── */
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                disabled={creating || !form.campaign_name.trim()}
                onClick={() => handleCreate("run")}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#0a0a0a] text-white text-[14px] font-[700] hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Run Campaign Now
              </button>
              <button
                type="button"
                disabled={creating || !form.campaign_name.trim()}
                onClick={() => handleCreate("schedule")}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-gray-200 bg-white text-[14px] font-[600] text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Calendar className="h-4 w-4" />
                Schedule for Later
              </button>
              <button
                type="button"
                disabled={creating || !form.campaign_name.trim()}
                onClick={() => handleCreate("draft")}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-gray-200 bg-white text-[14px] font-[600] text-blue-600 hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save as Draft
              </button>
            </section>
          )}
        </div>
      </main>
    );
  }

  /* ── helpers for sub-views ── */
  const renderPieLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    if (percent < 0.08) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: 11, fontWeight: 700 }}
      >
        {`${Math.round(percent * 100)}%`}
      </text>
    );
  };

  const statusBadgeColor = (status) => {
    if (status === "ACTIVE")
      return "bg-green-100 text-green-700 border-green-200";
    if (status === "PAUSED")
      return "bg-amber-100 text-amber-700 border-amber-200";
    if (status === "COMPLETED")
      return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };
  const statusDotColor = (status) => {
    if (status === "ACTIVE") return "bg-green-500";
    if (status === "PAUSED") return "bg-amber-400";
    if (status === "COMPLETED") return "bg-blue-500";
    return "bg-gray-400";
  };

  /* ── Campaign Activities routing ── */
  if (selectedCampaign) {
    const c = selectedCampaign;

    /* ─── ALL CAMPAIGN ACTIVITY ─── */
    if (activeTab === "ALL") {
      const allData = c.allActivity ?? [];
      const total = allData.length || c.totalLeads;
      const fullCoverage = allData.filter(
        (r) => r.call && r.email && r.linkedin,
      ).length;
      const partialCoverage = allData.filter(
        (r) =>
          (r.call || r.email || r.linkedin) &&
          !(r.call && r.email && r.linkedin),
      ).length;
      const noCoverage = allData.filter(
        (r) => !r.call && !r.email && !r.linkedin,
      ).length;
      const channelBarData = [
        {
          channel: "Call",
          reached: allData.filter((r) => r.call).length,
          fill: "#6366f1",
        },
        {
          channel: "Email",
          reached: allData.filter((r) => r.email).length,
          fill: "#0ea5e9",
        },
        {
          channel: "LinkedIn",
          reached: allData.filter((r) => r.linkedin).length,
          fill: "#0284c7",
        },
      ];
      const coverageDonut = [
        { name: "Full", value: fullCoverage, color: "#22c55e" },
        { name: "Partial", value: partialCoverage, color: "#f59e0b" },
        { name: "None", value: noCoverage, color: "#e5e7eb" },
      ].filter((s) => s.value > 0);
      return (
        <main className="min-h-screen bg-[#f4f5f7] p-4">
          <div className="mb-5">
            <button
              type="button"
              onClick={() => setActiveTab(null)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Campaign Activities
            </button>
          </div>
          <div className="mb-5">
            <h1 className="text-[17px] font-[700] text-[#0a0a0a]">
              All Campaign Activity
            </h1>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Overview of all channel activities across campaigns
            </p>
          </div>
          {/* KPI strip */}
          <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: "Total Leads",
                value: c.totalLeads,
                color: "text-gray-900",
                ring: "ring-gray-200",
              },
              {
                label: "Completed",
                value: c.completed,
                color: "text-green-600",
                ring: "ring-green-200",
              },
              {
                label: "Meetings",
                value: c.meetings,
                color: "text-blue-600",
                ring: "ring-blue-200",
              },
              {
                label: "Conv. Rate",
                value: `${c.convRate}%`,
                color: "text-violet-600",
                ring: "ring-violet-200",
              },
            ].map((k) => (
              <article
                key={k.label}
                className={`rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col gap-1 ring-1 ${k.ring}`}
              >
                <p className="text-[11px] font-[600] uppercase tracking-widest text-gray-400">
                  {k.label}
                </p>
                <p className={`text-[32px] font-[800] leading-none ${k.color}`}>
                  {k.value}
                </p>
              </article>
            ))}
          </section>
          {/* Charts */}
          {channelBarData.some((d) => d.reached > 0) ? (
            <section className="mb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-[14px] font-[700] text-gray-900 mb-1">
                  Channel Reach
                </h3>
                <p className="text-[12px] text-gray-400 mb-4">
                  Leads reached per channel
                </p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={channelBarData}
                    barSize={32}
                    margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="channel"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: "none",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="reached" name="Reached" radius={[6, 6, 0, 0]}>
                      {channelBarData.map((e, i) => (
                        <Cell key={i} fill={e.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {coverageDonut.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
                  <h3 className="text-[14px] font-[700] text-gray-900 mb-1">
                    Coverage Breakdown
                  </h3>
                  <p className="text-[12px] text-gray-400 mb-2">
                    Distribution across coverage levels
                  </p>
                  <div className="flex-1 flex items-center justify-center gap-6">
                    <ResponsiveContainer width={160} height={160}>
                      <PieChart>
                        <Pie
                          data={coverageDonut}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={72}
                          dataKey="value"
                          labelLine={false}
                          label={renderPieLabel}
                        >
                          {coverageDonut.map((s, i) => (
                            <Cell key={i} fill={s.color} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: 10,
                            border: "none",
                            fontSize: 12,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2.5">
                      {coverageDonut.map((s) => (
                        <div key={s.name} className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ background: s.color }}
                          />
                          <div>
                            <p className="text-[12px] font-[600] text-gray-700">
                              {s.name}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {s.value} lead{s.value !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          ) : null}
          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-[14px] font-[600] text-gray-900">
                Lead Channel Coverage
              </h3>
              <p className="text-[12px] text-gray-400 mt-0.5">
                Per-lead channel activity status
              </p>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#1e293b]">
                  {["Serial No.", "Lead Name", "Call", "Email", "LinkedIn"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-[11px] font-[600] uppercase tracking-wide text-white"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {allData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-[13px] text-gray-400"
                    >
                      No activity data available for this campaign.
                    </td>
                  </tr>
                ) : (
                  allData.map((row, idx) => (
                    <tr
                      key={row.serial ?? idx}
                      className={`border-b border-gray-50 hover:bg-gray-50/60 transition ${idx % 2 !== 0 ? "bg-gray-50/30" : ""}`}
                    >
                      <td className="px-5 py-3.5 text-[13px] text-gray-500">
                        {row.serial ?? idx + 1}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] font-[600] text-gray-800">
                        {row.leadName}
                      </td>
                      <td className="px-5 py-3.5">
                        {row.call ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-50">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50">
                            <X className="h-4 w-4 text-red-400" />
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {row.email ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-50">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50">
                            <X className="h-4 w-4 text-red-400" />
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {row.linkedin ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-50">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50">
                            <X className="h-4 w-4 text-red-400" />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      );
    }

    /* ─── CALL HISTORY ─── */
    if (activeTab === "CALL") {
      const callHistory_data = callHistory ?? [];
      const callStatuses = [
        "All Status",
        ...new Set(callHistory_data.map((r) => r.status)),
      ];
      const callRows = callHistory_data.filter((r) => {
        const ms =
          r.name?.toLowerCase().includes(callSearch.toLowerCase()) ||
          r.company?.toLowerCase().includes(callSearch.toLowerCase());
        const ss = callStatus === "All Status" || r.status === callStatus;
        return ms && ss;
      });
      const totalCalls = callHistory_data.length;
      const completed = callHistory_data.filter(
        (r) => r.status === "COMPLETED",
      ).length;
      const voiceMail = callHistory_data.filter(
        (r) => r.status === "VOICE MAIL",
      ).length;
      const noAnswer = callHistory_data.filter(
        (r) => r.status === "NO ANSWER",
      ).length;
      const meetingBooked = callHistory_data.filter((r) => r.meeting).length;
      const avgDuration =
        totalCalls > 0
          ? (
              callHistory_data.reduce(
                (s, r) => s + parseFloat(r.duration || 0),
                0,
              ) / totalCalls
            ).toFixed(1)
          : "0.0";
      const statusBarData = [
        { name: "Completed", value: completed, fill: "#22c55e" },
        { name: "Voice Mail", value: voiceMail, fill: "#f59e0b" },
        { name: "No Answer", value: noAnswer, fill: "#94a3b8" },
      ];
      const meetingDonut = [
        { name: "Meeting Booked", value: meetingBooked, color: "#6366f1" },
        {
          name: "No Meeting",
          value: totalCalls - meetingBooked,
          color: "#e2e8f0",
        },
      ].filter((s) => s.value > 0);
      return (
        <main className="min-h-screen bg-[#f4f5f7] p-4">
          <div className="mb-5">
            <button
              type="button"
              onClick={() => setActiveTab(null)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Campaign Activities
            </button>
          </div>
          <div className="mb-5">
            <h1 className="text-[17px] font-[700] text-[#0a0a0a]">
              Call History
            </h1>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Detailed call logs and transcripts
            </p>
          </div>
          {callHistoryLoading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <RefreshCw className="h-5 w-5 text-violet-400 animate-spin" />
              <p className="text-[13px] text-gray-400">Loading call history…</p>
            </div>
          ) : (
            <>
              <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {[
                  {
                    label: "Total Calls",
                    value: totalCalls || c.called,
                    sub: "all calls",
                    color: "text-gray-900",
                    ring: "ring-gray-200",
                  },
                  {
                    label: "Completed",
                    value: completed || c.completed,
                    sub: "successful",
                    color: "text-green-600",
                    ring: "ring-green-200",
                  },
                  {
                    label: "Voice Mail",
                    value: voiceMail,
                    sub: "left message",
                    color: "text-amber-600",
                    ring: "ring-amber-200",
                  },
                  {
                    label: "No Answer",
                    value: noAnswer || c.noAnswer,
                    sub: "unreachable",
                    color: "text-gray-400",
                    ring: "ring-gray-200",
                  },
                  {
                    label: "Meetings",
                    value: meetingBooked || c.meetings,
                    sub: "booked",
                    color: "text-violet-600",
                    ring: "ring-violet-200",
                  },
                  {
                    label: "Avg Duration",
                    value: avgDuration,
                    sub: "min / call",
                    color: "text-blue-600",
                    ring: "ring-blue-200",
                  },
                ].map((k) => (
                  <article
                    key={k.label}
                    className={`rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col gap-0.5 ring-1 ${k.ring}`}
                  >
                    <p className="text-[10px] font-[600] uppercase tracking-wider text-gray-400">
                      {k.label}
                    </p>
                    <p
                      className={`text-[28px] font-[800] leading-none ${k.color}`}
                    >
                      {k.value}
                    </p>
                    <p className="text-[11px] text-gray-400">{k.sub}</p>
                  </article>
                ))}
              </section>
              {/* Charts */}
              {statusBarData.some((d) => d.value > 0) && (
                <section className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-[14px] font-[700] text-gray-900 mb-1">
                      Call Status Distribution
                    </h3>
                    <p className="text-[12px] text-gray-400 mb-4">
                      Outcome breakdown across all calls
                    </p>
                    <ResponsiveContainer width="100%" height={170}>
                      <BarChart
                        data={statusBarData}
                        barSize={40}
                        margin={{ top: 0, right: 10, left: -18, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#f1f5f9"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#94a3b8" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 10,
                            border: "none",
                            fontSize: 12,
                          }}
                        />
                        <Bar dataKey="value" name="Calls" radius={[8, 8, 0, 0]}>
                          {statusBarData.map((e, i) => (
                            <Cell key={i} fill={e.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {meetingDonut.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
                      <h3 className="text-[14px] font-[700] text-gray-900 mb-1">
                        Meeting Conversion
                      </h3>
                      <p className="text-[12px] text-gray-400 mb-2">
                        Calls that led to a meeting
                      </p>
                      <div className="flex-1 flex flex-col items-center justify-center gap-3">
                        <ResponsiveContainer width={140} height={140}>
                          <PieChart>
                            <Pie
                              data={meetingDonut}
                              cx="50%"
                              cy="50%"
                              innerRadius={42}
                              outerRadius={65}
                              dataKey="value"
                              labelLine={false}
                              label={renderPieLabel}
                            >
                              {meetingDonut.map((s, i) => (
                                <Cell key={i} fill={s.color} strokeWidth={0} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                borderRadius: 10,
                                border: "none",
                                fontSize: 12,
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-1.5 w-full">
                          {meetingDonut.map((s) => (
                            <div
                              key={s.name}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                                  style={{ background: s.color }}
                                />
                                <span className="text-[11px] text-gray-600">
                                  {s.name}
                                </span>
                              </div>
                              <span className="text-[12px] font-[700] text-gray-800">
                                {s.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              )}
              {/* Table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-wrap">
                  <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search by lead name or company..."
                      value={callSearch}
                      onChange={(e) => setCallSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-violet-400/30"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={callStatus}
                      onChange={(e) => setCallStatus(e.target.value)}
                      className="appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-[12px] text-gray-600 shadow-sm outline-none cursor-pointer"
                    >
                      {callStatuses.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[12px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" /> Export
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table
                    className="w-full text-left"
                    style={{ minWidth: "780px" }}
                  >
                    <thead>
                      <tr className="bg-[#1e293b]">
                        {[
                          "Lead Name",
                          "Phone",
                          "Company",
                          "Date & Time",
                          "Duration (min)",
                          "Status",
                          "Meeting",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-3 py-3 text-[11px] font-[600] uppercase tracking-wide text-white"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {callRows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-4 py-12 text-center text-[13px] text-gray-400"
                          >
                            No call records available.
                          </td>
                        </tr>
                      ) : (
                        callRows.map((row, idx) => (
                          <tr
                            key={idx}
                            className={`border-b border-gray-50 hover:bg-gray-50/70 transition ${idx % 2 !== 0 ? "bg-[#eff6ff]/40" : ""}`}
                          >
                            <td className="px-3 py-3 text-[12px] font-[600] text-gray-800">
                              {row.name}
                            </td>
                            <td className="px-3 py-3 text-[12px] text-gray-600 font-mono">
                              {row.phone}
                            </td>
                            <td className="px-3 py-3 text-[12px] text-gray-700">
                              {row.company}
                            </td>
                            <td className="px-3 py-3 text-[11px] text-gray-600 whitespace-pre-line leading-tight">
                              {row.dateTime}
                            </td>
                            <td className="px-3 py-3 text-[12px] text-gray-700 text-center">
                              {row.duration}
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-[700] ${CALL_STATUS_STYLE[row.status] ?? "bg-gray-100 text-gray-600"}`}
                              >
                                {row.status}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-[12px] text-gray-700 text-center">
                              {row.meeting ? "Yes" : "No"}
                            </td>
                            <td className="px-3 py-3">
                              <button
                                type="button"
                                onClick={() => setTranscript(row)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1d4ed8] text-white text-[11px] font-[600] hover:bg-blue-700 transition"
                              >
                                <Eye className="h-3.5 w-3.5" /> View
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-[12px] text-gray-400">
                    Showing {callRows.length} of {callHistory_data.length}{" "}
                    records
                  </p>
                  <span className="flex items-center gap-1.5 text-[12px] text-green-600 font-[500]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {c.meetings} meetings booked
                  </span>
                </div>
              </div>
            </>
          )}
          {/* Transcript modal */}
          {transcript && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              onClick={() => setTranscript(null)}
            >
              <div
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="text-[16px] font-[700] text-[#0a0a0a]">
                    Call Transcript
                  </h2>
                  <button
                    type="button"
                    onClick={() => setTranscript(null)}
                    className="rounded-lg p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      ["Lead Name", transcript.name],
                      ["Company", transcript.company],
                      ["Date & Time", transcript.dateTime],
                      ["Duration", `${transcript.duration} min`],
                    ].map(([lbl, val]) => (
                      <div key={lbl}>
                        <p className="text-[11px] font-[600] text-blue-500 uppercase tracking-wide mb-0.5">
                          {lbl}
                        </p>
                        <p className="text-[13px] font-[500] text-gray-800 whitespace-pre-line">
                          {val}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-[12px] font-[600] text-gray-700 mb-2">
                      Transcript
                    </p>
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 min-h-[100px]">
                      {transcript.transcript ? (
                        <p className="text-[12px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                          {transcript.transcript}
                        </p>
                      ) : (
                        <p className="text-[12px] text-gray-400 italic">
                          No transcript available for this call.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      );
    }

    /* ─── EMAIL HISTORY ─── */
    if (activeTab === "EMAIL") {
      const emailHistoryData = emailHistory ?? [];
      const emailStatuses = [
        "All Status",
        ...new Set(emailHistoryData.map((r) => r.status)),
      ];
      const emailRows = emailHistoryData.filter((r) => {
        const ms =
          r.name?.toLowerCase().includes(emailSearch.toLowerCase()) ||
          r.company?.toLowerCase().includes(emailSearch.toLowerCase());
        const ss = emailStatus === "All Status" || r.status === emailStatus;
        return ms && ss;
      });
      const totalSent = emailHistoryData.length || c.emailsSent;
      const opened = emailHistoryData.filter(
        (r) =>
          r.status === "OPENED" ||
          r.status === "CLICKED" ||
          r.status === "REPLIED",
      ).length;
      const clicked = emailHistoryData.filter(
        (r) => r.status === "CLICKED",
      ).length;
      const noOpen = emailHistoryData.filter(
        (r) => r.status === "NOT OPENED" || r.status === "NO OPEN",
      ).length;
      const meetingBooked =
        emailHistoryData.filter((r) => r.meeting).length || c.meetings;
      const openRate =
        totalSent > 0 ? Math.round((opened / totalSent) * 100) : 0;
      const funnelData = [
        { stage: "Sent", value: totalSent, fill: "#6366f1" },
        { stage: "Opened", value: opened, fill: "#0ea5e9" },
        { stage: "Clicked", value: clicked, fill: "#22c55e" },
        { stage: "Meeting", value: meetingBooked, fill: "#f59e0b" },
      ];
      const statusDonut = [
        { name: "Opened", value: opened - clicked, color: "#0ea5e9" },
        { name: "Clicked", value: clicked, color: "#22c55e" },
        { name: "No Open", value: noOpen, color: "#e2e8f0" },
      ].filter((s) => s.value > 0);
      return (
        <main className="min-h-screen bg-[#f4f5f7] p-4">
          <div className="mb-5">
            <button
              type="button"
              onClick={() => setActiveTab(null)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Campaign Activities
            </button>
          </div>
          <div className="mb-5">
            <h1 className="text-[17px] font-[700] text-[#0a0a0a]">
              Email History
            </h1>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Track all email campaign activity and responses
            </p>
          </div>
          {/* KPI strip */}
          <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              {
                label: "Emails Sent",
                value: c.emailsSent,
                sub: "total outreach",
                color: "text-gray-900",
                ring: "ring-gray-200",
              },
              {
                label: "Opened",
                value: opened || c.emailsSent,
                sub: `${openRate}% rate`,
                color: "text-sky-600",
                ring: "ring-sky-200",
              },
              {
                label: "Failed",
                value: c.emailsFailed,
                sub: "delivery failed",
                color: "text-red-500",
                ring: "ring-red-200",
              },
              {
                label: "Pending",
                value: c.emailsPending,
                sub: "in queue",
                color: "text-amber-500",
                ring: "ring-amber-200",
              },
              {
                label: "Meetings",
                value: c.meetings,
                sub: "booked",
                color: "text-violet-600",
                ring: "ring-violet-200",
              },
              {
                label: "Open Rate",
                value: `${openRate}%`,
                sub: "of all sent",
                color: "text-teal-600",
                ring: "ring-teal-200",
              },
            ].map((k) => (
              <article
                key={k.label}
                className={`rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col gap-0.5 ring-1 ${k.ring}`}
              >
                <p className="text-[10px] font-[600] uppercase tracking-wider text-gray-400">
                  {k.label}
                </p>
                <p className={`text-[28px] font-[800] leading-none ${k.color}`}>
                  {k.value}
                </p>
                <p className="text-[11px] text-gray-400">{k.sub}</p>
              </article>
            ))}
          </section>
          {/* Charts */}
          {funnelData.some((d) => d.value > 0) && (
            <section className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-[14px] font-[700] text-gray-900 mb-1">
                  Email Engagement Funnel
                </h3>
                <p className="text-[12px] text-gray-400 mb-4">
                  From sent to meeting booked
                </p>
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart
                    data={funnelData}
                    barSize={38}
                    margin={{ top: 0, right: 10, left: -18, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="stage"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: "none",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="value" name="Count" radius={[8, 8, 0, 0]}>
                      {funnelData.map((e, i) => (
                        <Cell key={i} fill={e.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {statusDonut.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
                  <h3 className="text-[14px] font-[700] text-gray-900 mb-1">
                    Email Status Split
                  </h3>
                  <p className="text-[12px] text-gray-400 mb-2">
                    Opened vs clicked vs ignored
                  </p>
                  <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <ResponsiveContainer width={140} height={140}>
                      <PieChart>
                        <Pie
                          data={statusDonut}
                          cx="50%"
                          cy="50%"
                          innerRadius={42}
                          outerRadius={65}
                          dataKey="value"
                          labelLine={false}
                          label={renderPieLabel}
                        >
                          {statusDonut.map((s, i) => (
                            <Cell key={i} fill={s.color} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: 10,
                            border: "none",
                            fontSize: 12,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5 w-full">
                      {statusDonut.map((s) => (
                        <div
                          key={s.name}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-sm shrink-0"
                              style={{ background: s.color }}
                            />
                            <span className="text-[11px] text-gray-600">
                              {s.name}
                            </span>
                          </div>
                          <span className="text-[12px] font-[700] text-gray-800">
                            {s.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}
          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by lead name or company..."
                  value={emailSearch}
                  onChange={(e) => setEmailSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-violet-400/30"
                />
              </div>
              <div className="relative">
                <select
                  value={emailStatus}
                  onChange={(e) => setEmailStatus(e.target.value)}
                  className="appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-[12px] text-gray-600 shadow-sm outline-none cursor-pointer"
                >
                  {emailStatuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[12px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm"
              >
                <Download className="h-3.5 w-3.5" /> Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left" style={{ minWidth: "800px" }}>
                <thead>
                  <tr className="bg-[#1e293b]">
                    {[
                      "Lead Name",
                      "Email",
                      "Company",
                      "Subject",
                      "Date & Time",
                      "Status",
                      "Clicked",
                      "Meeting",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-3 text-[11px] font-[600] uppercase tracking-wide text-white"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {emailRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-12 text-center text-[13px] text-gray-400"
                      >
                        No email records available.
                      </td>
                    </tr>
                  ) : (
                    emailRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-gray-50 hover:bg-gray-50/70 transition ${idx % 2 !== 0 ? "bg-gray-50/30" : ""}`}
                      >
                        <td className="px-3 py-3 text-[12px] font-[600] text-gray-800">
                          {row.name}
                        </td>
                        <td className="px-3 py-3 text-[11px] text-gray-500">
                          {row.emailAddr}
                        </td>
                        <td className="px-3 py-3 text-[12px] text-blue-600 font-[500]">
                          {row.company}
                        </td>
                        <td
                          className="px-3 py-3 text-[11px] text-gray-600"
                          title={row.subject}
                        >
                          {row.subject}
                        </td>
                        <td className="px-3 py-3 text-[11px] text-gray-600 whitespace-pre-line leading-tight">
                          {row.dateTime}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-[600] ${EMAIL_STATUS_STYLE[row.status] ?? "bg-gray-100 text-gray-600"}`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-[12px] text-gray-700">
                          {row.clicked ? "Yes" : "No"}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-[600] border ${row.meeting ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}
                          >
                            {row.meeting ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1d4ed8] text-white text-[11px] font-[600] hover:bg-blue-700 transition"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-[12px] text-gray-400">
                Showing {emailRows.length} of {emailHistoryData.length} records
              </p>
              <span className="flex items-center gap-1.5 text-[12px] text-green-600 font-[500]">
                <CheckCircle2 className="h-3.5 w-3.5" /> {c.meetings} meetings
                booked
              </span>
            </div>
          </div>
        </main>
      );
    }

    /* ─── LINKEDIN HISTORY ─── */
    if (activeTab === "LINKEDIN") {
      const linkedinHistoryData = linkedinHistory ?? [];
      const liStatuses = [
        "All Status",
        ...new Set(linkedinHistoryData.map((r) => r.status)),
      ];
      const liRows = linkedinHistoryData.filter((r) => {
        const ms =
          r.name?.toLowerCase().includes(liSearch.toLowerCase()) ||
          r.company?.toLowerCase().includes(liSearch.toLowerCase());
        const ss = liStatus === "All Status" || r.status === liStatus;
        return ms && ss;
      });
      const totalOutreach = linkedinHistoryData.length;
      const accepted = linkedinHistoryData.filter(
        (r) => r.status === "ACCEPTED" || r.status === "CONNECTED",
      ).length;
      const replied = linkedinHistoryData.filter(
        (r) => r.status === "REPLIED" || r.status === "MEETING SCHEDULED",
      ).length;
      const noReply = linkedinHistoryData.filter(
        (r) => r.status === "NO REPLY" || r.status === "NOT CONNECTED",
      ).length;
      const meetingBooked =
        linkedinHistoryData.filter((r) => r.meeting).length || c.meetings;
      const responseRate =
        totalOutreach > 0
          ? Math.round(((accepted + replied) / totalOutreach) * 100)
          : 0;
      const engagementData = [
        { metric: "Accepted", value: accepted, fill: "#22c55e" },
        { metric: "Replied", value: replied, fill: "#6366f1" },
        { metric: "Meeting", value: meetingBooked, fill: "#f59e0b" },
        { metric: "No Reply", value: noReply, fill: "#94a3b8" },
      ];
      const outcomeDonut = [
        { name: "Accepted", value: accepted, color: "#22c55e" },
        { name: "Replied", value: replied, color: "#6366f1" },
        { name: "No Reply", value: noReply, color: "#e2e8f0" },
      ].filter((s) => s.value > 0);
      return (
        <main className="min-h-screen bg-[#f4f5f7] p-4">
          <div className="mb-5">
            <button
              type="button"
              onClick={() => setActiveTab(null)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Campaign Activities
            </button>
          </div>
          <div className="mb-5">
            <h1 className="text-[17px] font-[700] text-[#0a0a0a]">
              LinkedIn Campaign History
            </h1>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Track all LinkedIn connection requests and messages
            </p>
          </div>
          {/* KPI strip */}
          <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              {
                label: "Total Outreach",
                value: totalOutreach || c.totalLeads,
                sub: "all activity",
                color: "text-gray-900",
                ring: "ring-gray-200",
              },
              {
                label: "Accepted",
                value: accepted,
                sub: "connections",
                color: "text-green-600",
                ring: "ring-green-200",
              },
              {
                label: "Replied",
                value: replied,
                sub: "InMail replies",
                color: "text-violet-600",
                ring: "ring-violet-200",
              },
              {
                label: "No Reply",
                value: noReply,
                sub: "no response",
                color: "text-gray-400",
                ring: "ring-gray-200",
              },
              {
                label: "Meetings",
                value: meetingBooked,
                sub: "booked",
                color: "text-amber-600",
                ring: "ring-amber-200",
              },
              {
                label: "Response Rate",
                value: `${responseRate}%`,
                sub: "of outreach",
                color: "text-sky-600",
                ring: "ring-sky-200",
              },
            ].map((k) => (
              <article
                key={k.label}
                className={`rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col gap-0.5 ring-1 ${k.ring}`}
              >
                <p className="text-[10px] font-[600] uppercase tracking-wider text-gray-400">
                  {k.label}
                </p>
                <p className={`text-[28px] font-[800] leading-none ${k.color}`}>
                  {k.value}
                </p>
                <p className="text-[11px] text-gray-400">{k.sub}</p>
              </article>
            ))}
          </section>
          {/* Charts */}
          {engagementData.some((d) => d.value > 0) && (
            <section className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-[14px] font-[700] text-gray-900 mb-1">
                  Engagement Breakdown
                </h3>
                <p className="text-[12px] text-gray-400 mb-4">
                  Outcomes across all LinkedIn touchpoints
                </p>
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart
                    data={engagementData}
                    barSize={38}
                    margin={{ top: 0, right: 10, left: -18, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="metric"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: "none",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="value" name="Count" radius={[8, 8, 0, 0]}>
                      {engagementData.map((e, i) => (
                        <Cell key={i} fill={e.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {outcomeDonut.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
                  <h3 className="text-[14px] font-[700] text-gray-900 mb-1">
                    Outcome Split
                  </h3>
                  <p className="text-[12px] text-gray-400 mb-2">
                    Accepted, replied, no reply
                  </p>
                  <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <ResponsiveContainer width={140} height={140}>
                      <PieChart>
                        <Pie
                          data={outcomeDonut}
                          cx="50%"
                          cy="50%"
                          innerRadius={42}
                          outerRadius={65}
                          dataKey="value"
                          labelLine={false}
                          label={renderPieLabel}
                        >
                          {outcomeDonut.map((s, i) => (
                            <Cell key={i} fill={s.color} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: 10,
                            border: "none",
                            fontSize: 12,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5 w-full">
                      {outcomeDonut.map((s) => (
                        <div
                          key={s.name}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-sm shrink-0"
                              style={{ background: s.color }}
                            />
                            <span className="text-[11px] text-gray-600">
                              {s.name}
                            </span>
                          </div>
                          <span className="text-[12px] font-[700] text-gray-800">
                            {s.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}
          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by lead name or company..."
                  value={liSearch}
                  onChange={(e) => setLiSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-violet-400/30"
                />
              </div>
              <div className="relative">
                <select
                  value={liStatus}
                  onChange={(e) => setLiStatus(e.target.value)}
                  className="appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-[12px] text-gray-600 shadow-sm outline-none cursor-pointer"
                >
                  {liStatuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[12px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm"
              >
                <Download className="h-3.5 w-3.5" /> Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left" style={{ minWidth: "860px" }}>
                <thead>
                  <tr className="bg-[#1e293b]">
                    {[
                      "Lead Name",
                      "Company",
                      "Connection Sent",
                      "Connection Accepted",
                      "Message Sent",
                      "Replied",
                      "Status",
                      "Date",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-3 text-[11px] font-[600] uppercase tracking-wide text-white"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {liRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-12 text-center text-[13px] text-gray-400"
                      >
                        No LinkedIn records available.
                      </td>
                    </tr>
                  ) : (
                    liRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-gray-50 hover:bg-gray-50/70 transition ${idx % 2 !== 0 ? "bg-gray-50/30" : ""}`}
                      >
                        <td className="px-3 py-3 text-[12px] font-[600] text-gray-800">
                          {row.name}
                        </td>
                        <td className="px-3 py-3 text-[12px] text-blue-600 font-[500]">
                          {row.company}
                        </td>
                        <td className="px-3 py-3 text-[12px] text-gray-700">
                          {row.connectionSent ? "Yes" : "No"}
                        </td>
                        <td className="px-3 py-3 text-[12px] text-gray-700">
                          {row.connectionAccepted ?? row.action ?? "—"}
                        </td>
                        <td className="px-3 py-3 text-[12px] text-gray-700">
                          {row.messageSent ? "Yes" : "No"}
                        </td>
                        <td className="px-3 py-3 text-[12px] text-gray-700">
                          {row.replied ? "Yes" : "No"}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-[600] ${LINKEDIN_STATUS_STYLE[row.status] ?? "bg-gray-100 text-gray-600"}`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-[11px] text-gray-600">
                          {row.dateTime ?? row.date}
                        </td>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1d4ed8] text-white text-[11px] font-[600] hover:bg-blue-700 transition"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-[12px] text-gray-400">
                Showing {liRows.length} of {linkedinHistoryData.length} records
              </p>
              <span className="flex items-center gap-1.5 text-[12px] text-green-600 font-[500]">
                <CheckCircle2 className="h-3.5 w-3.5" /> {c.meetings} meetings
                booked
              </span>
            </div>
          </div>
        </main>
      );
    }

    /* ─── WHATSAPP HISTORY ─── */
    if (activeTab === "WHATSAPP") {
      const whatsappHistoryData = whatsappHistory ?? [];
      const waStatuses = [
        "All Status",
        ...new Set(whatsappHistoryData.map((r) => r.status)),
      ];
      const waRows = whatsappHistoryData.filter((r) => {
        const ms =
          r.name?.toLowerCase().includes(waSearch.toLowerCase()) ||
          r.company?.toLowerCase().includes(waSearch.toLowerCase());
        const ss = waStatus === "All Status" || r.status === waStatus;
        return ms && ss;
      });
      const totalMessages = whatsappHistoryData.length;
      const delivered = whatsappHistoryData.filter(
        (r) => r.status === "DELIVERED",
      ).length;
      const read = whatsappHistoryData.filter(
        (r) => r.status === "READ",
      ).length;
      const replied = whatsappHistoryData.filter(
        (r) => r.status === "REPLIED",
      ).length;
      const failed = whatsappHistoryData.filter(
        (r) => r.status === "FAILED",
      ).length;
      const meetingBooked = whatsappHistoryData.filter((r) => r.meeting).length;
      const readRate =
        totalMessages > 0
          ? Math.round(((read + replied) / totalMessages) * 100)
          : 0;

      const WA_STATUS_STYLE = {
        DELIVERED: "bg-blue-50 text-blue-700 border border-blue-200",
        READ: "bg-sky-50 text-sky-700 border border-sky-200",
        REPLIED: "bg-green-50 text-green-700 border border-green-200",
        FAILED: "bg-red-50 text-red-600 border border-red-200",
        SENT: "bg-gray-100 text-gray-600 border border-gray-200",
      };

      const statusBarData = [
        { name: "Delivered", value: delivered, fill: "#3b82f6" },
        { name: "Read", value: read, fill: "#0ea5e9" },
        { name: "Replied", value: replied, fill: "#22c55e" },
        { name: "Failed", value: failed, fill: "#ef4444" },
      ];
      const outcomeDonut = [
        { name: "Read", value: read, color: "#0ea5e9" },
        { name: "Replied", value: replied, color: "#22c55e" },
        { name: "Delivered", value: delivered, color: "#3b82f6" },
        { name: "Failed", value: failed, color: "#ef4444" },
      ].filter((s) => s.value > 0);

      return (
        <main className="min-h-screen bg-[#f4f5f7] p-4">
          <div className="mb-5">
            <button
              type="button"
              onClick={() => setActiveTab(null)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Campaign Activities
            </button>
          </div>
          <div className="mb-5">
            <h1 className="text-[17px] font-[700] text-[#0a0a0a]">
              WhatsApp Campaign History
            </h1>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Track all WhatsApp message delivery, reads, and replies
            </p>
          </div>
          {/* KPI strip */}
          <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              {
                label: "Total Sent",
                value: totalMessages,
                sub: "all messages",
                color: "text-gray-900",
                ring: "ring-gray-200",
              },
              {
                label: "Delivered",
                value: delivered,
                sub: "reached",
                color: "text-blue-600",
                ring: "ring-blue-200",
              },
              {
                label: "Read",
                value: read,
                sub: "opened",
                color: "text-sky-600",
                ring: "ring-sky-200",
              },
              {
                label: "Replied",
                value: replied,
                sub: "responded",
                color: "text-green-600",
                ring: "ring-green-200",
              },
              {
                label: "Meetings",
                value: meetingBooked,
                sub: "booked",
                color: "text-violet-600",
                ring: "ring-violet-200",
              },
              {
                label: "Read Rate",
                value: `${readRate}%`,
                sub: "of all sent",
                color: "text-teal-600",
                ring: "ring-teal-200",
              },
            ].map((k) => (
              <article
                key={k.label}
                className={`rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col gap-0.5 ring-1 ${k.ring}`}
              >
                <p className="text-[10px] font-[600] uppercase tracking-wider text-gray-400">
                  {k.label}
                </p>
                <p className={`text-[28px] font-[800] leading-none ${k.color}`}>
                  {k.value}
                </p>
                <p className="text-[11px] text-gray-400">{k.sub}</p>
              </article>
            ))}
          </section>
          {/* Charts */}
          {statusBarData.some((d) => d.value > 0) && (
            <section className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-[14px] font-[700] text-gray-900 mb-1">
                  Message Status Distribution
                </h3>
                <p className="text-[12px] text-gray-400 mb-4">
                  Delivery and engagement breakdown
                </p>
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart
                    data={statusBarData}
                    barSize={38}
                    margin={{ top: 0, right: 10, left: -18, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: "none",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="value" name="Messages" radius={[8, 8, 0, 0]}>
                      {statusBarData.map((e, i) => (
                        <Cell key={i} fill={e.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {outcomeDonut.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
                  <h3 className="text-[14px] font-[700] text-gray-900 mb-1">
                    Outcome Split
                  </h3>
                  <p className="text-[12px] text-gray-400 mb-2">
                    Delivered, read, replied
                  </p>
                  <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <ResponsiveContainer width={140} height={140}>
                      <PieChart>
                        <Pie
                          data={outcomeDonut}
                          cx="50%"
                          cy="50%"
                          innerRadius={42}
                          outerRadius={65}
                          dataKey="value"
                          labelLine={false}
                          label={renderPieLabel}
                        >
                          {outcomeDonut.map((s, i) => (
                            <Cell key={i} fill={s.color} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: 10,
                            border: "none",
                            fontSize: 12,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5 w-full">
                      {outcomeDonut.map((s) => (
                        <div
                          key={s.name}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-sm shrink-0"
                              style={{ background: s.color }}
                            />
                            <span className="text-[11px] text-gray-600">
                              {s.name}
                            </span>
                          </div>
                          <span className="text-[12px] font-[700] text-gray-800">
                            {s.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}
          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by lead name or company..."
                  value={waSearch}
                  onChange={(e) => setWaSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-violet-400/30"
                />
              </div>
              <div className="relative">
                <select
                  value={waStatus}
                  onChange={(e) => setWaStatus(e.target.value)}
                  className="appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-[12px] text-gray-600 shadow-sm outline-none cursor-pointer"
                >
                  {waStatuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[12px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm"
              >
                <Download className="h-3.5 w-3.5" /> Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left" style={{ minWidth: "780px" }}>
                <thead>
                  <tr className="bg-[#1e293b]">
                    {[
                      "Lead Name",
                      "Phone",
                      "Company",
                      "Date & Time",
                      "Message Preview",
                      "Status",
                      "Meeting",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-3 text-[11px] font-[600] uppercase tracking-wide text-white"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {waRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-12 text-center text-[13px] text-gray-400"
                      >
                        No WhatsApp records available.
                      </td>
                    </tr>
                  ) : (
                    waRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-gray-50 hover:bg-gray-50/70 transition ${idx % 2 !== 0 ? "bg-gray-50/30" : ""}`}
                      >
                        <td className="px-3 py-3 text-[12px] font-[600] text-gray-800">
                          {row.name}
                        </td>
                        <td className="px-3 py-3 text-[12px] text-gray-600 font-mono">
                          {row.phone}
                        </td>
                        <td className="px-3 py-3 text-[12px] text-blue-600 font-[500]">
                          {row.company}
                        </td>
                        <td className="px-3 py-3 text-[11px] text-gray-600 whitespace-pre-line leading-tight">
                          {row.dateTime}
                        </td>
                        <td
                          className="px-3 py-3 text-[11px] text-gray-600 max-w-[200px] truncate"
                          title={row.messagePreview}
                        >
                          {row.messagePreview}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-[600] ${WA_STATUS_STYLE[row.status] ?? "bg-gray-100 text-gray-600"}`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-[600] border ${row.meeting ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}
                          >
                            {row.meeting ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1d4ed8] text-white text-[11px] font-[600] hover:bg-blue-700 transition"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-[12px] text-gray-400">
                Showing {waRows.length} of {whatsappHistoryData.length} records
              </p>
              <span className="flex items-center gap-1.5 text-[12px] text-green-600 font-[500]">
                <CheckCircle2 className="h-3.5 w-3.5" /> {meetingBooked}{" "}
                meetings booked
              </span>
            </div>
          </div>
        </main>
      );
    }

    /* ─── CAMPAIGN ACTIVITIES MENU (default) ─── */
    const activities = [
      {
        key: "ALL",
        label: "All Campaign",
        Icon: TrendingUp,
        desc: "Overview of all activities across this campaign",
      },
      {
        key: "CALL",
        label: "Call",
        Icon: Phone,
        desc: "Detailed call logs and transcripts",
      },
      {
        key: "EMAIL",
        label: "Email",
        Icon: Mail,
        desc: "Email open rates, clicks, and responses",
      },
      {
        key: "LINKEDIN",
        label: "LinkedIn",
        Icon: Linkedin,
        desc: "LinkedIn connection requests and InMail activity",
      },
      {
        key: "WHATSAPP",
        label: "WhatsApp",
        Icon: MessageCircle,
        desc: "WhatsApp message delivery, reads, and replies",
      },
    ];
    return (
      <main className="min-h-screen bg-[#f4f5f7] p-4">
        {/* Back */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => {
              setSelectedCampaign(null);
              setActiveTab(null);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Campaigns
          </button>
        </div>
        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-[16px] font-[700] text-[#0a0a0a]">
              Campaign Activities
            </h1>
            <p className="text-[12px] text-gray-500 mt-0.5">{c.name}</p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-[600] border ${statusBadgeColor(c.status)}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${statusDotColor(c.status)}`}
            />
            {c.status}
          </span>
        </div>
        {/* Stats strip */}
        <section className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Total Leads",
              value: c.totalLeads,
              color: "text-sky-600",
              bg: "bg-sky-50",
            },
            {
              label: "Completed",
              value: c.completed,
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              label: "Meetings",
              value: c.meetings,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              label: "Conv. Rate",
              value: `${c.convRate}%`,
              color: "text-violet-600",
              bg: "bg-violet-50",
            },
          ].map(({ label, value, color, bg }) => (
            <article
              key={label}
              className={`rounded-xl ${bg} border border-white shadow-sm px-4 py-3 flex items-center gap-3`}
            >
              <div>
                <p className={`text-[22px] font-[800] leading-none ${color}`}>
                  {value}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
              </div>
            </article>
          ))}
        </section>
        {/* Activity list */}
        <div className="space-y-3">
          {activities.map(({ key, label, Icon, desc }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between hover:shadow-md hover:border-indigo-200 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 group-hover:bg-indigo-100 transition shrink-0">
                  <Icon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[14px] font-[700] text-[#0a0a0a]">
                    {label}
                  </p>
                  <p className="text-[12px] text-gray-400 mt-0.5">{desc}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all shrink-0" />
            </button>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f5f7] p-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h1 className="text-[20px] font-[700] text-[#0a0a0a]">
            Campaign Setup
          </h1>
          <p className="text-[12px] text-gray-400 mt-0.5">
            Manage your AI SDR campaigns
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition shadow-sm"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing || loading ? "animate-spin" : ""}`}
            />
          </button>
          {/* Create */}
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#0a0a0a] px-4 py-2.5 text-[13px] font-[600] text-white hover:bg-gray-800 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Create New Campaign
          </button>
        </div>
      </div>

      {/* ── Filters Row ── */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {/* Name search (client-side on current page) */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[13px] text-gray-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 placeholder-gray-400 shadow-sm"
          />
        </div>

        {/* Status filter → calls API */}
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          {["All", "ACTIVE", "PAUSED", "COMPLETED"].map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-[600] transition ${
                filter === f
                  ? "bg-[#7c3aed] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {f === "All" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Communication type filter → calls API */}
        <div className="relative">
          <select
            value={commFilter}
            onChange={(e) => {
              setCommFilter(e.target.value);
              setPage(1);
            }}
            className="appearance-none rounded-xl border border-gray-200 bg-white pl-3.5 pr-8 py-2.5 text-[12px] font-[500] text-gray-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 cursor-pointer shadow-sm"
          >
            <option value="All">All Types</option>
            <option value="EMAIL">EMAIL</option>
            <option value="CALL">CALL</option>
            <option value="LINKEDIN">LINKEDIN</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div
            key={label}
            className={`bg-white rounded-2xl border ${border} shadow-sm p-4 flex items-center gap-3`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}
            >
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className={`text-[22px] font-[800] ${color}`}>{value}</p>
              <p className="text-[11px] text-gray-400 font-[500]">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Campaign Cards ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <RefreshCw className="h-6 w-6 text-violet-400 animate-spin" />
          <p className="text-[13px] text-gray-400">Loading campaigns…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <p className="text-[14px] text-red-500">{error}</p>
          <button
            onClick={() => dispatch(listCampaigns(buildParams()))}
            className="flex items-center gap-1.5 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-[13px] font-[600] text-red-600 hover:bg-red-100 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-2">
          <p className="text-[14px] font-[600] text-gray-400">
            No campaigns found
          </p>
          <p className="text-[12px] text-gray-300">
            {search || filter !== "All" || commFilter !== "All"
              ? "Try adjusting your filters"
              : "Create your first campaign to get started"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-[700] border ${statusBadge(c.status)}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${statusDot(c.status)}`}
                      />
                      {c.status}
                    </span>
                    {c.campaignType && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-[600] text-gray-500">
                        {c.campaignType}
                      </span>
                    )}
                    {c.communicationType && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-[10px] font-[600] text-indigo-600">
                        {c.communicationType}
                      </span>
                    )}
                  </div>
                  <h3 className="text-[15px] font-[700] text-[#0a0a0a] leading-snug">
                    {c.name}
                  </h3>
                  <p className="text-[12px] text-gray-400 mt-0.5">
                    Agent:{" "}
                    <span className="font-[600] text-gray-600">
                      {c.agentName}
                    </span>
                    {c.fromEmail && (
                      <>
                        {" "}
                        · <span className="text-indigo-500">{c.fromEmail}</span>
                      </>
                    )}
                  </p>
                </div>
                {/* Edit / Delete icon buttons */}
                <div className="flex items-center gap-1 ml-2 shrink-0">
                  <button
                    type="button"
                    disabled={loadingEdit}
                    onClick={() => handleEdit(c.id)}
                    title="Edit campaign"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingEdit ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Pencil className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setShowDeleteConfirm({ id: c.id, name: c.name })
                    }
                    title="Delete campaign"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  {
                    label: "TOTAL LEADS",
                    value: c.totalLeads.toLocaleString(),
                    color: "text-gray-800",
                  },
                  {
                    label: "COMPLETED",
                    value: c.completed.toLocaleString(),
                    color: "text-green-600",
                  },
                  {
                    label: "MEETINGS",
                    value: c.meetings.toLocaleString(),
                    color: "text-blue-600",
                  },
                  {
                    label: "CONV. RATE",
                    value: `${c.convRate}%`,
                    color: "text-violet-600",
                  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center">
                    <p className={`text-[15px] font-[800] ${color}`}>{value}</p>
                    <p className="text-[9px] font-[600] text-gray-400 tracking-wide mt-0.5">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Channel activity mini-graph */}
              {(() => {
                const channels = [
                  {
                    label: "Call",
                    value: c.called,
                    fill: "#6366f1",
                    icon: <Phone className="h-3 w-3" />,
                  },
                  {
                    label: "Email",
                    value: c.emailsSent,
                    fill: "#0ea5e9",
                    icon: <Mail className="h-3 w-3" />,
                  },
                  {
                    label: "LinkedIn",
                    value: c.meetings,
                    fill: "#0284c7",
                    icon: <Linkedin className="h-3 w-3" />,
                  },
                  {
                    label: "WhatsApp",
                    value: c.queued,
                    fill: "#22c55e",
                    icon: <MessageCircle className="h-3 w-3" />,
                  },
                ];
                const maxVal = Math.max(...channels.map((ch) => ch.value), 1);
                return (
                  <div className="mb-4 bg-gray-50 rounded-xl px-3 py-2.5">
                    <p className="text-[9px] font-[700] text-gray-400 uppercase tracking-widest mb-2">
                      Channel Activity
                    </p>
                    <div className="space-y-1.5">
                      {channels.map((ch) => (
                        <div key={ch.label} className="flex items-center gap-2">
                          <div
                            className="flex items-center gap-1 w-16 shrink-0"
                            style={{ color: ch.fill }}
                          >
                            {ch.icon}
                            <span className="text-[10px] font-[600]">
                              {ch.label}
                            </span>
                          </div>
                          <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${(ch.value / maxVal) * 100}%`,
                                background: ch.fill,
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-[700] text-gray-600 w-8 text-right shrink-0">
                            {ch.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(c.startDate)}
                  {c.completionPct > 0 && (
                    <span className="ml-1 text-violet-500 font-[600]">
                      {c.completionPct}% done
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* Active / Deactivate toggle */}
                  <button
                    onClick={() => {
                      setTogglingId(c.id);
                      dispatch(
                        toggleActivateCampaign(c.id, c.status, () =>
                          setTogglingId(null),
                        ),
                      );
                    }}
                    disabled={togglingId === c.id}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-[600] border transition disabled:opacity-60 disabled:cursor-not-allowed ${
                      c.status === "ACTIVE"
                        ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
                        : "bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
                    }`}
                  >
                    {togglingId === c.id ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : c.status === "ACTIVE" ? (
                      <Pause className="h-3.5 w-3.5" />
                    ) : (
                      <Play className="h-3.5 w-3.5" />
                    )}
                    {togglingId === c.id
                      ? "..."
                      : c.status === "ACTIVE"
                        ? "Deactivate"
                        : "Activate"}
                  </button>
                  <button
                    onClick={() => setSelectedCampaign(c)}
                    className="flex items-center gap-1.5 rounded-xl bg-[#0a0a0a] px-4 py-2 text-[12px] font-[600] text-white hover:bg-gray-800 transition"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer: count + pagination */}
      {!loading && !error && (campaigns ?? []).length > 0 && (
        <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
          <p className="text-[12px] text-gray-400">
            Page {page} of {totalPages || 1} ·{" "}
            {campaignTotal ?? (campaigns ?? []).length} total campaigns
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-[12px] font-[600] text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-[12px] font-[700] transition border shadow-sm ${
                      page === p
                        ? "bg-[#7c3aed] text-white border-violet-400"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-[12px] font-[600] text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Campaign Detail Modal (unused — replaced by inline view above) ── */}
      {false && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-[17px] font-[700] text-[#0a0a0a]">
                  {selectedCampaign.name}
                </h2>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  Campaign Details
                </p>
              </div>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-[700] border ${statusBadge(selectedCampaign.status)}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${statusDot(selectedCampaign.status)}`}
                  />
                  {selectedCampaign.status}
                </span>
                {selectedCampaign.campaignType && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-[600] text-gray-500">
                    {selectedCampaign.campaignType}
                  </span>
                )}
                {selectedCampaign.communicationType && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-[10px] font-[600] text-indigo-600">
                    {selectedCampaign.communicationType}
                  </span>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    label: "Total Leads",
                    value: selectedCampaign.totalLeads,
                    color: "text-gray-800",
                  },
                  {
                    label: "Completed",
                    value: selectedCampaign.completed,
                    color: "text-green-600",
                  },
                  {
                    label: "Failed",
                    value: selectedCampaign.failed,
                    color: "text-red-500",
                  },
                  {
                    label: "No Answer",
                    value: selectedCampaign.noAnswer,
                    color: "text-amber-500",
                  },
                  {
                    label: "Meetings",
                    value: selectedCampaign.meetings,
                    color: "text-blue-600",
                  },
                  {
                    label: "Conv. Rate",
                    value: `${selectedCampaign.convRate}%`,
                    color: "text-violet-600",
                  },
                  {
                    label: "Completion",
                    value: `${selectedCampaign.completionPct}%`,
                    color: "text-teal-600",
                  },
                  {
                    label: "Parallel Calls",
                    value: selectedCampaign.parallelCalls,
                    color: "text-gray-700",
                  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100"
                  >
                    <p className={`text-[18px] font-[800] ${color}`}>{value}</p>
                    <p className="text-[10px] font-[600] text-gray-400 tracking-wide mt-0.5">
                      {label.toUpperCase()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Info Rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Agent", value: selectedCampaign.agentName },
                  { label: "Owner", value: selectedCampaign.ownerEmail },
                  { label: "From Name", value: selectedCampaign.fromName },
                  { label: "From Email", value: selectedCampaign.fromEmail },
                  {
                    label: "Start Date",
                    value: formatDate(selectedCampaign.startDate),
                  },
                  {
                    label: "Last Run",
                    value: formatDate(selectedCampaign.lastRun),
                  },
                  {
                    label: "Created At",
                    value: formatDate(selectedCampaign.createdAt),
                  },
                  { label: "Campaign ID", value: selectedCampaign.id },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-[700] text-gray-400 uppercase tracking-wide">
                      {label}
                    </span>
                    <span className="text-[13px] font-[500] text-gray-700 break-all">
                      {value || "—"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Email Stats */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-[12px] font-[700] text-gray-500 uppercase tracking-wide mb-3">
                  Email Stats
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      label: "Sent",
                      value: selectedCampaign.emailsSent,
                      color: "text-green-600",
                    },
                    {
                      label: "Failed",
                      value: selectedCampaign.emailsFailed,
                      color: "text-red-500",
                    },
                    {
                      label: "Pending",
                      value: selectedCampaign.emailsPending,
                      color: "text-amber-500",
                    },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100"
                    >
                      <p className={`text-[18px] font-[800] ${color}`}>
                        {value}
                      </p>
                      <p className="text-[10px] font-[600] text-gray-400 tracking-wide mt-0.5">
                        {label.toUpperCase()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedCampaign(null)}
                className="px-5 py-2 rounded-xl bg-[#0a0a0a] text-white text-[13px] font-[600] hover:bg-gray-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Campaign is now a full-page form (early return above) ── */}

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-[15px] font-[700] text-gray-900">
                  Delete Campaign
                </h3>
                <p className="text-[12px] text-gray-400">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p className="text-[13px] text-gray-600 mb-5">
              Are you sure you want to delete{" "}
              <span className="font-[700] text-gray-900">
                &ldquo;{showDeleteConfirm.name}&rdquo;
              </span>
              ?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-[600] text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  await dispatch(
                    deleteCampaign(showDeleteConfirm.id, () => {
                      setShowDeleteConfirm(null);
                    }),
                  );
                  setDeleting(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[13px] font-[700] hover:bg-red-600 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {deleting ? "Deleting…" : "Delete Campaign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

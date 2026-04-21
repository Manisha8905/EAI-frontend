"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  listCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  toggleActivateCampaign,
  pauseCampaign,
  resumeCampaign,
  stopAllMultichannelCampaigns,
  fetchCallHistory,
  fetchEmailHistory,
  fetchLinkedinHistory,
  fetchWhatsappHistory,
  fetchEmailDrafts,
} from "../../Redux/actions/authActions";
import axiosInstance from "../../Redux/axiosInstance";
import { toast } from "react-toastify";
import EmailDeliverabilitySettings from "../EmailDeliverabilitySettings";
import WhatsAppConversationDetail from "../../Componets/Dashboard/WhatsAppConversationDetail";
import LeadAdd from "../../Componets/UserManagement/LeadAdd";
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
  StopCircle,
  GitBranch,
  Clock,
  Loader2,
  Star,
  MinusCircle,
  SkipForward,
  Users,
  Settings,
  RotateCcw,
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
import { boolean } from "yup";

const CALL_STATUS_STYLE = {
  COMPLETED:   "bg-green-500 text-white",
  "VOICE MAIL": "bg-yellow-400 text-white",
  "NO ANSWER":  "bg-gray-400 text-white",
  FAILED:      "bg-red-100 text-red-700 border border-red-200",
  BUSY:        "bg-orange-100 text-orange-700 border border-orange-200",
  CANCELLED:   "bg-gray-100 text-gray-500 border border-gray-200",
  TIMEOUT:     "bg-rose-100 text-rose-700 border border-rose-200",
  ERROR:       "bg-red-100 text-red-700 border border-red-200",
};
const EMAIL_STATUS_STYLE = {
  SENT: "bg-blue-50 text-blue-700 border border-blue-200",
  OPENED: "bg-blue-50 text-blue-700 border border-blue-200",
  CLICKED: "bg-teal-50 text-teal-700 border border-teal-200",
  REPLIED: "bg-green-50 text-green-700 border border-green-200",
  "NOT OPENED": "bg-gray-100 text-gray-500 border border-gray-200",
  "NO OPEN": "bg-gray-100 text-gray-500 border border-gray-200",
  SKIPPED: "bg-amber-50 text-amber-700 border border-amber-200",
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

/* ── Channel status config (module-level, stable reference) ── */
const CHANNEL_STATUS_CFG = {
  completed:  { icon: CheckCircle2, iconCls: "text-green-500",  bg: "bg-green-50",   badge: "bg-green-50 text-green-700 border border-green-200",     dot: "bg-green-500",  label: "Completed",  canSkip: false },
  converted:  { icon: Star,         iconCls: "text-violet-500", bg: "bg-violet-50",  badge: "bg-violet-100 text-violet-700 border border-violet-200",  dot: "bg-violet-500", label: "Converted",  canSkip: false },
  processing: { icon: Loader2,      iconCls: "text-blue-500",   bg: "bg-blue-50",    badge: "bg-blue-50 text-blue-700 border border-blue-200",          dot: "bg-blue-500",   label: "Processing", canSkip: true,  spin: true },
  waiting:    { icon: Clock,        iconCls: "text-amber-500",  bg: "bg-amber-50",   badge: "bg-amber-50 text-amber-700 border border-amber-200",       dot: "bg-amber-400",  label: "Waiting",    canSkip: true },
  not_started:{ icon: MinusCircle,  iconCls: "text-gray-400",   bg: "bg-gray-100",   badge: "bg-gray-100 text-gray-500 border border-gray-200",         dot: "bg-gray-300",   label: "Not Started",canSkip: false },
};
const getChCfg = (status) =>
  CHANNEL_STATUS_CFG[(status ?? "").toLowerCase()] ??
  { icon: X, iconCls: "text-red-500", bg: "bg-red-50", badge: "bg-red-50 text-red-600 border border-red-200", dot: "bg-red-400", label: status ?? "—", canSkip: false };

/* Helper: resolve channel status from a journey-overview lead row.
   Handles flat  { call: "processing" }  OR  nested  { channels: [{channel:"CALL",status:"processing"}] } */
const resolveChannelStatus = (row, fieldKey) => {
  const flat = row[fieldKey];
  if (typeof flat === "string") return flat;
  if (typeof flat === "boolean" || typeof flat === "number") return flat ? "completed" : null;
  const channels = row.channels ?? row.channel_steps ?? [];
  if (Array.isArray(channels)) {
    const match = channels.find(
      (ch) => (ch.channel ?? ch.type ?? "").toLowerCase() === fieldKey.toLowerCase(),
    );
    if (match) return match.status ?? null;
  }
  return null;
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

const CAMPAIGN_ACTIVITY_TABS = new Set(["ALL", "CALL", "EMAIL", "LINKEDIN", "WHATSAPP"]);

const normalizeActivityTab = (tabValue) => {
  const normalized = String(tabValue ?? "").trim().toUpperCase();
  return CAMPAIGN_ACTIVITY_TABS.has(normalized) ? normalized : null;
};

const isPreviewEligibleCampaign = (campaign) => {
  const order = Array.isArray(campaign?.channelOrder)
    ? campaign.channelOrder.map((v) => String(v ?? "").toUpperCase()).filter(Boolean)
    : [];
  const commType = String(campaign?.communicationType ?? campaign?.communication_type ?? "").toUpperCase();

  if (commType) {
    return commType === "EMAIL";
  }

  if (order.length > 0) {
    return order.includes("EMAIL");
  }

  return false;
};

const getPreviewChannelKey = (campaign) => {
  const commType = String(campaign?.communicationType ?? campaign?.communication_type ?? "").toUpperCase();
  if (commType === "EMAIL") {
    return "EMAIL";
  }

  const order = Array.isArray(campaign?.channelOrder)
    ? campaign.channelOrder.map((v) => String(v ?? "").toUpperCase()).filter(Boolean)
    : [];

  if (order.includes("EMAIL")) {
    return "EMAIL";
  }

  return "EMAIL";
};

export default function CampaignPage() {
    // Add Lead modal state
    const [showAddLead, setShowAddLead] = useState(false);
    const [addLeadLoading, setAddLeadLoading] = useState(false);

    const handleAddLeadSubmit = async (formData) => {
      if (!selectedCampaign?.id) {
        toast.error("No campaign selected.");
        return;
      }
      setAddLeadLoading(true);
      try {
        const payload = {
          name: formData.name,
          contact_number: formData.contactNumber,
          email_address: formData.email,
          company: formData.company,
          title: formData.title,
        };
        await axiosInstance.post(`/campaigns/${selectedCampaign.id}/leads/add`, payload);
        toast.success("Lead added successfully.");
        setShowAddLead(false);
        refreshCampaignJourney(selectedCampaign.id);
      } catch (err) {
        toast.error(err?.response?.data?.detail || "Failed to add lead.");
      } finally {
        setAddLeadLoading(false);
      }
    };
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* ── Redux state ── */
  const {
    campaignLoading: loading,
    campaigns,
    campaignTotal,
    campaignError: error,
    callHistory,
    callHistoryLoading,
    callHistoryTotalTasks,
    emailHistory,
    emailHistoryLoading,
    emailHistoryTotalCount,
    emailHistoryTotalReplied,
    emailHistoryTotalTasks,
    emailDrafts,
    emailDraftsLoading,
    linkedinHistory,
    linkedinHistoryLoading,
    linkedinHistoryTotal,
    whatsappHistory,
    whatsappAnalytics,
    whatsappHistoryLoading,
    liTotal,
  } = useSelector((state) => state.admin);

  const PAGE_SIZE = 20;

  /* ── Local UI state ── */
  const [filter, setFilter] = useState("All");
  const [commFilter, setCommFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [histRefreshing, setHistRefreshing] = useState(false);
  const [previewCompletedCampaignIds, setPreviewCompletedCampaignIds] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("previewCompletedCampaignIds");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });

  /* ── Detail + tab state ── */
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [activeTab, setActiveTab] = useState(null); // null = activities menu
  const [togglingId, setTogglingId] = useState(null); // campaign id currently being toggled

  /* ── Create form state ── */
  const todayDate = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
  const blankForm = {
    campaign_name: "",
    // campaign_type: "CRM",
    // communication_type: "CALL",
    start_time: "00:00:00",
    end_time: "23:23:23",
    reengage_days: 0,
    max_attempts: 0,
    start_date: todayDate,
    channel_order: [],
    // Per-channel step config (keyed by channel name)
    channel_steps: {},
    campaign_prompt: "",
    vapi_voice_id: "",
    vapi_model: "",
    agent_id: "",
    agent_name: "",
    logged_in_user_email: "",
    campaign_parallel_calls: 1,
    list_id: "",
    // Email fields
    smtp_provider_name: "",
    template_id: "",
    from_name: "",
    from_email: "",
    reply_to_email: "",
    enable_ai_personalization: true,
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
    preview_mode: false,
    campaign_prompt:""
  };
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [creating, setCreating] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState(null); // null = create, string = edit
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // { id, name }
  const [deleting, setDeleting] = useState(false);
  const [stoppingAll, setStoppingAll] = useState(false);

  /* ── Lead lists, email templates & agents for selectors ── */
  const [leadLists, setLeadLists] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [agents, setAgents] = useState([]);
  const [smtpProvidersList, setSmtpProvidersList] = useState([]);
  const [smtpProvidersOpen, setSmtpProvidersOpen] = useState(false);

  /* ── Activity sub-view search/filter state (must be unconditional) ── */
  const [callSearch, setCallSearch] = useState("");
  const [callStatus, setCallStatus] = useState("All Status");
  const [transcript, setTranscript] = useState(null);
  const [emailSearch, setEmailSearch] = useState("");
  const [emailStatus, setEmailStatus] = useState("All Status");
  const [emailTooltip, setEmailTooltip] = useState(null);
  const [liSearch, setLiSearch] = useState("");
  const [liStatus, setLiStatus] = useState("All Status");
  const [liTooltip, setLiTooltip] = useState(null);
  const [liTaskFilter, setLiTaskFilter] = useState(false);
  const [liCardFilter, setLiCardFilter] = useState(new Set()); // Multi-select: Set of "accepted"|"replied"|"no_reply"|"meetings"
  const [liConversationModal, setLiConversationModal] = useState(null); // conversation id/index
  const [liConversationLoading, setLiConversationLoading] = useState(false);
  const [liConversationData, setLiConversationData] = useState(null);
  const [waSearch, setWaSearch] = useState("");
  const [waStatus, setWaStatus] = useState("All Status");
  const [waTooltip, setWaTooltip] = useState(null);
  const [waTaskFilter, setWaTaskFilter] = useState(false);
  const [waConversationModal, setWaConversationModal] = useState(null); // conversation id
  const [waCardFilter, setWaCardFilter] = useState(new Set()); // Multi-select: Set of "sent"|"delivered"|"read"|"replied"|"meetings"

  /* ── Lead list leads for Lead Activity tab ── */
  const [leadListLeads, setLeadListLeads] = useState([]);
  const [leadListLoading, setLeadListLoading] = useState(false);
  const [leadEditModal, setLeadEditModal] = useState({ open: false, campaignId: null, lead: null, saving: false });
  const [leadDeleteConfirm, setLeadDeleteConfirm] = useState(null);


  /* ── Per-lead channel toggling (Set of "leadId_CHANNEL") ── */
  const [togglingLeadChannel, setTogglingLeadChannel] = useState(new Set());

  /* ── Tracks channels skipped by the user — survives server refreshes ── */
  const [skippedChannels, setSkippedChannels] = useState(new Set());

  /* ── Campaign Journey API Stats ── */
  const [journeyStats, setJourneyStats] = useState(null);

  /* ── Campaign Journey Panel ── */
  const [showJourneyPanel, setShowJourneyPanel] = useState(false);
  const [journeyData, setJourneyData] = useState([]);
  const [journeyLoading, setJourneyLoading] = useState(false);

  /* ── Single Lead Journey Panel ── */
  const [selectedLeadJourney, setSelectedLeadJourney] = useState(null); // { lead_id, lead_name }
  const [leadJourneyData, setLeadJourneyData] = useState([]);
  const [leadJourneyLoading, setLeadJourneyLoading] = useState(false);

  /* ── Email Sending Service (CRM / SMTP) ── */
  const [emailSendingService, setEmailSendingService] = useState("SMTP");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setEmailSendingService(localStorage.getItem("emailSendingService") || "SMTP");
    }
  }, []);

  /* ── Prevent body scroll when modals are open ── */
  useEffect(() => {
    const isModalOpen = liConversationModal != null || waConversationModal != null;
    if (typeof document !== "undefined") {
      if (isModalOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "unset";
      }
    };
  }, [liConversationModal, waConversationModal]);

  /* ── Email Config Toggle ── */
  const [showEmailConfig, setShowEmailConfig] = useState(false);
  const [emailConfigLoading, setEmailConfigLoading] = useState(false);
  const handleEmailConfigToggle = async () => {
    if (showEmailConfig) {
      setShowEmailConfig(false);
      setForm((prev) => ({
        ...prev,
        logged_in_user_email: null,
        smtp_provider_name: null,
        template_id: null,
        from_name: null,
        from_email: null,
        reply_to_email: null,
        emails_per_batch: null,
        delay_between_batches_seconds: null,
      }));
    } else {
      setShowEmailConfig(true);
      setEmailConfigLoading(true);
      try {
        const res = await axiosInstance.get("/campaign-email-settings");
        const d = res?.data ?? {};
        setForm((prev) => ({
          ...prev,
          logged_in_user_email: d.logged_in_user_email ?? d.meeting_invite_sender_email ?? prev.logged_in_user_email ?? "",
          smtp_provider_name: d.smtp_provider_name ?? prev.smtp_provider_name ?? "",
          template_id: d.template_id ?? prev.template_id ?? "",
          from_name: d.from_name ?? prev.from_name ?? "",
          from_email: d.from_email ?? prev.from_email ?? "",
          reply_to_email: d.reply_to_email ?? prev.reply_to_email ?? "",
          emails_per_batch: d.emails_per_batch ?? prev.emails_per_batch ?? 100,
          delay_between_batches_seconds: d.delay_between_batches_seconds ?? prev.delay_between_batches_seconds ?? 60,
        }));
      } catch (err) {
        console.error("Failed to fetch email config settings:", err);
      } finally {
        setEmailConfigLoading(false);
      }
    }
  };

  /* ── Settings Panel ── */
  const [showSettings, setShowSettings] = useState(false);

  /* ── Email Stats (from /campaigns/{id}/email-stats/) ── */
  const [emailStats, setEmailStats] = useState(null);
  const [emailStatsLoading, setEmailStatsLoading] = useState(false);
  const [emailCardAnalytics, setEmailCardAnalytics] = useState(null);
  const [emailCardAnalyticsLoading, setEmailCardAnalyticsLoading] = useState(false);
  const [emailDeliverabilityDashboard, setEmailDeliverabilityDashboard] = useState(null);
  const [emailDeliverabilityLoading, setEmailDeliverabilityLoading] = useState(false);

  const updateCampaignRoute = (campaign, tabKey = null) => {
    if (campaign && (campaign.id == null || String(campaign.id).trim() === "")) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    if (campaign?.id != null) {
      nextParams.set("campaign", String(campaign.id));
    } else {
      nextParams.delete("campaign");
    }

    const normalizedTab = normalizeActivityTab(tabKey);
    if (normalizedTab) {
      nextParams.set("tab", normalizedTab.toLowerCase());
    } else {
      nextParams.delete("tab");
    }

    const nextQuery = nextParams.toString();
    const currentQuery = searchParams.toString();
    if (nextQuery === currentQuery) return;
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  };

  const openCampaignDetails = (campaign, tabKey = null) => {
    setSelectedCampaign(campaign ?? null);
    setActiveTab(normalizeActivityTab(tabKey));
    updateCampaignRoute(campaign, tabKey);
  };

  const openCampaignTab = (tabKey) => {
    if (!selectedCampaign) return;
    const normalizedTab = normalizeActivityTab(tabKey);
    setActiveTab(normalizedTab);
    updateCampaignRoute(selectedCampaign, normalizedTab);
  };

  const backToCampaignActivities = () => {
    if (!selectedCampaign) return;
    setActiveTab(null);
    updateCampaignRoute(selectedCampaign, null);
  };

  const backToCampaignList = () => {
    setSelectedCampaign(null);
    setActiveTab(null);
    updateCampaignRoute(null, null);
  };

  const openCampaignPreview = (campaignId, channelKey) => {
    const nextParams = new URLSearchParams();
    nextParams.set("campaignId", String(campaignId));
    nextParams.set("channel", String(channelKey ?? "EMAIL").toUpperCase());
    router.push(`/sales/campaign/preview?${nextParams.toString()}`);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo(0, 0);
  }, [page, activeTab, selectedCampaign?.id, searchParams]);

  const getDeliverabilityCounts = (payload) => {
    const pickNum = (...vals) => {
      for (const v of vals) {
        const n = Number(v);
        if (Number.isFinite(n)) return n;
      }
      return null;
    };

    const walk = (obj, keys) => {
      if (!obj || typeof obj !== "object") return null;
      for (const key of keys) {
        const direct = pickNum(obj?.[key]);
        if (direct !== null) return direct;
      }
      for (const val of Object.values(obj)) {
        if (val && typeof val === "object") {
          const nested = walk(val, keys);
          if (nested !== null) return nested;
        }
      }
      return null;
    };

    const inbox = walk(payload, [
      "inbox", "inbox_count", "delivered", "inbox_emails",
      "healthy", "healthy_count", "healthy_mailboxes",
    ]);
    const spam = walk(payload, [
      "spam", "spam_count", "spam_emails", "junk",
      "unhealthy", "unhealthy_count", "unhealthy_mailboxes",
      "at_risk", "at_risk_count", "at_risk_mailboxes",
      "failed", "failed_count",
    ]);
    const total = walk(payload, [
      "total", "total_count", "emails_total",
      "mailboxes_total", "total_mailboxes", "mailboxes_count",
    ]);

    const safeInbox = inbox ?? 0;
    const safeSpam = spam ?? 0;
    const safeTotal = total ?? (safeInbox + safeSpam);
    return {
      inbox: safeInbox,
      spam: safeSpam,
      total: safeTotal,
    };
  };

  /* ── Email Detail Modal ── */
  const [emailDetailModal, setEmailDetailModal] = useState(null);
  const [emailDetailLoading, setEmailDetailLoading] = useState(false);
  const [emailModalView, setEmailModalView] = useState("email");

  /* ── Approve Regeneration Modal ── */
  const [approveRegenModal, setApproveRegenModal] = useState(null); // { row }
  const [approveRegenLoading, setApproveRegenLoading] = useState(false);

  const handleApproveRegen = async () => {
    if (!approveRegenModal?.row || !selectedCampaign?.id) return;
    const draftId = approveRegenModal.row.id ?? approveRegenModal.row.email_history_id;
    if (!draftId) {
      toast.error("No draft ID found.");
      return;
    }
    setApproveRegenLoading(true);
    try {
      await axiosInstance.post(
        `/api/campaigns/${selectedCampaign.id}/email-drafts/${draftId}/approve-regeneration`,
      );
      toast.success("Regeneration approved successfully.");
      setApproveRegenModal(null);
      // Refresh email drafts list to remove the processed draft
      if (selectedCampaign?.id) {
        dispatch(fetchEmailDrafts(selectedCampaign.id));
      }
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to approve regeneration.";
      toast.error(msg);
    } finally {
      setApproveRegenLoading(false);
    }
  };

  const getMergedReplies = (row) => {
    if (!row) return [];
    const rowIdKey = String(row.id ?? row.email_history_id ?? "");
    const directReplies = Array.isArray(row.replies) ? row.replies : [];
    const filteredDirectReplies = directReplies.filter((rep) => {
      const targetId = rep?.auto_response_email_id;
      if (targetId === null || targetId === undefined || targetId === "") return true;
      return String(targetId) === rowIdKey;
    });
    const repliedTo = row.replied_to_message_id && typeof row.replied_to_message_id === "object"
      ? [row.replied_to_message_id]
      : (row.repliedToMessageId && typeof row.repliedToMessageId === "object" ? [row.repliedToMessageId] : []);
    const merged = [...filteredDirectReplies, ...repliedTo].filter(Boolean);
    const seenReplyIds = new Set();

    return merged.filter((rep) => {
      const key = rep?.reply_id != null
        ? `id:${rep.reply_id}`
        : `${rep?.reply_from ?? ""}|${rep?.sent_at ?? rep?.received_datetime ?? ""}`;
      if (seenReplyIds.has(key)) return false;
      seenReplyIds.add(key);
      return true;
    });
  };

  const handleViewEmail = async (row, view = "email") => {
    if (!row) return;
    const replies = getMergedReplies(row);
    const replyData = row.replyData ?? replies[0] ?? null;
    const hasReply = !!replyData;
    setEmailModalView(view === "reply" && !hasReply ? "email" : view);

    setEmailDetailLoading(true);
    let groupedConversation = [];
    try {
      groupedConversation = await fetchGroupedConversationTimeline(row);
    } catch (_e) {
      groupedConversation = [];
    }

    setEmailDetailModal({
      ...row,
      lead_name: row.lead_name ?? row.name ?? "—",
      campaign_name: row.campaign_name ?? "",
      company_name: row.company_name ?? row.company ?? "—",
      email_subject: row.email_subject ?? row.subject ?? "—",
      email_body: row.email_body ?? row.emailBody ?? "",
      to_email: row.to_email ?? row.emailAddr ?? row.email ?? "—",
      sent_at: row.sent_at ?? row.dateTime ?? null,
      replied_to_message_id: replyData,
      replies,
      groupedConversation,
    });
    setEmailDetailLoading(false);
  };

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
    const hasEmailChannel = form.channel_order
      .map((c) => c.toUpperCase())
      .includes("EMAIL");
    const isValidEmail = (value) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? "").trim());

    if (!form.campaign_name.trim()) {
      toast.error("Campaign name is required.");
      return;
    }
    if (!form.start_time || !form.end_time) {
      toast.error("Start time and end time are required.");
      return;
    }
    if (!form.start_date) {
      toast.error("Start date is required.");
      return;
    }
    if (!form.list_id) {
      toast.error("Please select a lead list.");
      return;
    }
    if (hasEmailChannel) {
      // if (!form.logged_in_user_email?.trim()) {
      //   toast.error("Meeting invite sender email is required for Email channel.");
      //   return;
      // }
      // if (!isValidEmail(form.logged_in_user_email)) {
      //   toast.error("Please enter a valid meeting invite sender email.");
      //   return;
      // }
      // if (emailSendingService !== "CRM") {
      //   if (!form.template_id) {
      //     toast.error("Please select an email template.");
      //     return;
      //   }
      //   if (!form.from_email?.trim()) {
      //     toast.error("From Email is required.");
      //     return;
      //   }
      //   if (!isValidEmail(form.from_email)) {
      //     toast.error("Please enter a valid From Email address.");
      //     return;
      //   }
      //   if (form.reply_to_email?.trim() && !isValidEmail(form.reply_to_email)) {
      //     toast.error("Please enter a valid Reply to Email address.");
      //     return;
      //   }
      // }
    }
    setCreating(true);
    try {

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
      ...(emailSendingService !== "CRM" && {
        smtp_provider_name: form.smtp_provider_name,
        from_name: form.from_name,
        from_email: form.from_email,
        reply_to_email: form.reply_to_email,
        emails_per_batch: Number(form.emails_per_batch),
        delay_between_batches_seconds: Number(form.delay_between_batches_seconds),
      }),
      template_id: form.template_id || undefined,
      enable_ai_personalization: form.enable_ai_personalization,
      ai_tone: form.ai_tone,
      ai_context: form.ai_context,
      preview_mode: form.preview_mode,
    };

    if (editingCampaignId) {
      await dispatch(
        updateCampaign(editingCampaignId, payload, form.agent_id || undefined, () => {
          setShowCreate(false);
          setForm(blankForm);
          setEditingCampaignId(null);
        }),
      );
    } else {
      const createResult = await dispatch(
        createCampaign(payload, form.agent_id || undefined, () => {
          setShowCreate(false);
          setForm(blankForm);
        }),
      );
      if (!createResult?.success) return;
    }
    } catch (err) {
      console.error("[handleCreate] unexpected error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setCreating(false);
    }
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
        vapi_voice_id: c.vapi_voice_id ?? "",
        vapi_model: c.vapi_model ?? "",
        agent_id: c.agent_id ?? "",
        agent_name: c.agent_name ?? "",
        logged_in_user_email: c.logged_in_user_email ?? "",
        campaign_parallel_calls: c.campaign_parallel_calls ?? 1,
        list_id: c.list_id ?? "",
        smtp_provider_name: c.smtp_provider_name ?? "",
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
        preview_mode: c.preview_mode ?? true,
        campaign_prompt: c.campaign_prompt ?? "",
      });
      setEditingCampaignId(campaignId);
      setShowCreate(true);
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ||
          err?.response?.data?.detail ||
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

  // After successful create, poll list briefly so async lead generation updates card counts.
  useEffect(() => {
    if (!showCreate) return;
    // Fetch agents from backend so we always use real agent_id
    axiosInstance
      .get("/my-agents")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data.agents ?? []);
        setAgents(
          list.map((a) => ({
            id:   a.agent_id ?? a.id ?? a._id ?? "",
            name: a.agent_name ?? a.name ?? "—",
          }))
        );
      })
      .catch(() => {});
    axiosInstance
      .get("/lead-lists")
      .then((res) => {
        const d = res.data;
        setLeadLists(
          Array.isArray(d?.lists)
            ? d.lists
            : Array.isArray(d)
              ? d
              : [],
        );
      })
      .catch(() => {});
    axiosInstance
      .get("/api/email-templates")
      .then((res) => {
        const d = res.data;
        const raw = Array.isArray(d)
          ? d
          : Array.isArray(d?.results)
            ? d.results
            : Array.isArray(d?.data)
              ? d.data
              : Array.isArray(d?.items)
                ? d.items
                : Array.isArray(d?.templates)
                  ? d.templates
                  : [];
        // Normalize: map any field-name variant to { id, name }
        const normalized = raw.map((t) => ({
          id:   t.id ?? t.template_id ?? t.templateId ?? "",
          name: t.name ?? t.template_name ?? t.templateName ?? t.subject ?? t.title ?? t.id ?? "Unnamed",
        }));
        console.log("[email-templates] raw:", raw, "normalized:", normalized);
        setEmailTemplates(normalized);
      })
      .catch((err) => {
        console.error("[email-templates] fetch error:", err);
      });
    axiosInstance
      .get("/api/smtp/saved-providers")
      .then((res) => {
        const d = res.data;
        const raw = Array.isArray(d)
          ? d
          : Array.isArray(d?.saved_providers)
            ? d.saved_providers
            : Array.isArray(d?.providers)
              ? d.providers
              : Array.isArray(d?.items)
                ? d.items
                : Array.isArray(d?.data)
                  ? d.data
                  : [];
        setSmtpProvidersList(raw.map((p) => ({
          name:
            p.name ??
            p.provider_name ??
            p.smtp_provider_name ??
            p.provider ??
            String(p),
          is_current: !!(
            p.is_current ??
            p.is_active ??
            p.selected ??
            p.is_default ??
            p.default ??
            false
          ),
        })));
      })
      .catch(() => {});
  }, [showCreate]);

  // Email fields are intentionally not pre-filled from localStorage so placeholder-only behavior is preserved.
  // NOTE: selectedCampaign and activeTab are intentionally excluded from the dep array.
  // Including them causes a race: openCampaignDetails sets state before router.push updates the URL,
  // so the effect fires with the old URL (no `?campaign=`), hits the clear-branch, and causes a flash.
  // The effect is URL-driven only — state is the output, not an input.
  useEffect(() => {
    const routeCampaignId = searchParams.get("campaign");
    const routeTab = normalizeActivityTab(searchParams.get("tab"));

    if (!routeCampaignId) {
      setSelectedCampaign(null);
      setActiveTab(null);
      return;
    }

    const matchedCampaign = (campaigns ?? []).find(
      (item) => String(item.id) === String(routeCampaignId),
    );

    if (!matchedCampaign) return;

    const allowedChannels = new Set(matchedCampaign.channelOrder ?? []);
    const safeRouteTab = routeTab === "ALL" || allowedChannels.has(routeTab) ? routeTab : null;

    setSelectedCampaign((prev) =>
      !prev || String(prev.id) !== String(matchedCampaign.id) ? matchedCampaign : prev
    );
    setActiveTab((prev) => (prev !== safeRouteTab ? safeRouteTab : prev));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, campaigns]);

  useEffect(() => {
    const savedPreviewCampaignId = searchParams.get("previewSavedCampaign");
    if (!savedPreviewCampaignId) return;

    setPreviewCompletedCampaignIds((prev) => {
      const next = new Set(prev);
      next.add(String(savedPreviewCampaignId));
      return next;
    });

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("previewSavedCampaign");
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [searchParams, router, pathname]);

  // Persist preview completed campaign IDs to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("previewCompletedCampaignIds", JSON.stringify(Array.from(previewCompletedCampaignIds)));
  }, [previewCompletedCampaignIds]);

  /* ── Fetch history data when a campaign activity tab is opened ── */
  useEffect(() => {
    if (!selectedCampaign) return;
    if (activeTab === "CALL") dispatch(fetchCallHistory(selectedCampaign.id));
    if (activeTab === "EMAIL") {
      dispatch(fetchEmailHistory(selectedCampaign.id));
      setEmailStats(null);
      setEmailStatsLoading(true);
      axiosInstance
        .get(`/campaigns/${selectedCampaign.id}/email-stats/`)
        .then((res) => setEmailStats(res.data))
        .catch(() => {})
        .finally(() => setEmailStatsLoading(false));

      setEmailDeliverabilityDashboard(null);
      setEmailDeliverabilityLoading(true);
      axiosInstance
        .get("/api/deliverability/smartlead/mailboxes/health-dashboard", {
          params: { campaign_id: selectedCampaign.id },
        })
        .then((res) => setEmailDeliverabilityDashboard(res.data))
        .catch(() => {})
        .finally(() => setEmailDeliverabilityLoading(false));

      if (selectedCampaign?.isSmtp || selectedCampaign?.is_smtp) {
        setEmailCardAnalytics(null);
        setEmailCardAnalyticsLoading(true);
        axiosInstance
          .get(`/api/bulk-email/campaigns/${selectedCampaign.id}/analytics`)
          .then((res) => setEmailCardAnalytics(res.data))
          .catch(() => {})
          .finally(() => setEmailCardAnalyticsLoading(false));
      } else {
        setEmailCardAnalytics(null);
        setEmailCardAnalyticsLoading(false);
      }
    }
    if (activeTab === "LINKEDIN")
      dispatch(fetchLinkedinHistory(selectedCampaign.id));
    if (activeTab === "WHATSAPP")
      dispatch(fetchWhatsappHistory(selectedCampaign.id));
    if (activeTab === "ALL") {
      setLeadListLoading(true);
      setLeadListLeads([]);
      setJourneyStats(null);
      setSelectedLeadJourney(null);
      setLeadJourneyData([]);
      const campaignId = selectedCampaign.id;

      axiosInstance
        .get(`/api/campaigns/${campaignId}/journey`, {
          params: { page: 1, page_size: 20 },
        })
        .then((res) => {
          const d = res.data;
          // Store stats from the API response
          if (d?.stats) setJourneyStats(d.stats);
          // Leads are returned under d.leads
          const rows = Array.isArray(d)
            ? d
            : (d?.leads ?? d?.items ?? d?.data ?? d?.results ?? d?.journeys ?? []);
          setLeadListLeads(rows);
        })
        .catch(() => {})
        .finally(() => setLeadListLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampaign, activeTab]);

  /* ── Refresh handler ── */
  const handleRefresh = () => {
    setRefreshing(true);
    dispatch(listCampaigns(buildParams()));
    setTimeout(() => setRefreshing(false), 800);
  };

  /* ── History refresh handler (per-tab, no full-page blink) ── */
  const handleHistoryRefresh = () => {
    if (!selectedCampaign) return;
    setHistRefreshing(true);
    if (activeTab === "CALL")     dispatch(fetchCallHistory(selectedCampaign.id));
    if (activeTab === "EMAIL")    dispatch(fetchEmailHistory(selectedCampaign.id));
    if (activeTab === "LINKEDIN") dispatch(fetchLinkedinHistory(selectedCampaign.id));
    if (activeTab === "WHATSAPP") dispatch(fetchWhatsappHistory(selectedCampaign.id));
    setTimeout(() => setHistRefreshing(false), 800);
  };

  /* ── Fetch campaign journey (overview panel) ── */
  const fetchJourney = async (campaignId, pg = 1) => {
    setJourneyLoading(true);
    try {
      const res = await axiosInstance.get(`/api/campaigns/${campaignId}/journey`, {
        params: { status: "in_progress", page: pg, page_size: 20 },
      });
      const d = res.data;
      const rows = Array.isArray(d)
        ? d
        : (d?.items ?? d?.data ?? d?.results ?? d?.leads ?? d?.journeys ?? []);
      setJourneyData(rows);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to load campaign journey.");
    } finally {
      setJourneyLoading(false);
    }
  };

  /* ── Fetch single-lead journey ── */
  const fetchLeadJourney = async (campaignId, leadId, leadName) => {
    setSelectedLeadJourney({ lead_id: leadId, lead_name: leadName, overall_status: null });
    setLeadJourneyData([]);
    setLeadJourneyLoading(true);
    try {
      const res = await axiosInstance.get(
        `/api/campaigns/${campaignId}/leads/${leadId}/journey`,
      );
      const d = res.data;
      // Capture overall_status
      const overallStatus = d?.overall_status ?? null;
      setSelectedLeadJourney({ lead_id: leadId, lead_name: leadName, overall_status: overallStatus });
      // channels[] is the primary field per the API spec
      const steps = Array.isArray(d)
        ? d
        : (d?.channels ?? d?.steps ?? d?.journey_steps ?? d?.activities ?? []);
      setLeadJourneyData(steps);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to load lead journey.");
    } finally {
      setLeadJourneyLoading(false);
    }
  };

  /* ── Skip a channel for a lead ── */
  /* ── Re-fetch the journey overview table for the current campaign ── */
  const refreshCampaignJourney = async (campaignId) => {
    try {
      const res = await axiosInstance.get(`/api/campaigns/${campaignId}/journey`, {
        params: { page: 1, page_size: 20 },
      });
      const d = res.data;
      if (d?.stats) setJourneyStats(d.stats);
      const rows = Array.isArray(d)
        ? d
        : (d?.leads ?? d?.items ?? d?.data ?? d?.results ?? d?.journeys ?? []);
      setLeadListLeads(rows);
    } catch {
      // silent — table already showed the old state
    }
  };

  /* PATCH /campaigns/{id}/leads/{lead_id}/channel-actions  →  action: "SKIP" */
  const skipChannel = async (campaignId, leadId, channelName) => {
    const tKey = `${leadId}_${channelName}`;
    setTogglingLeadChannel((s) => new Set([...s, tKey]));
    setSkippedChannels((s) => new Set([...s, tKey])); // optimistic
    try {
      await axiosInstance.patch(
        `/campaigns/${campaignId}/leads/${leadId}/channel-actions`,
        { channel_actions: { [channelName]: "SKIP" } },
      );
      toast.success(`${channelName} skipped — next channel will start.`);
      refreshCampaignJourney(campaignId);
      if (selectedLeadJourney?.lead_id === leadId) {
        fetchLeadJourney(campaignId, leadId, selectedLeadJourney.lead_name ?? "");
      }
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to skip channel.");
      setSkippedChannels((s) => { const ns = new Set(s); ns.delete(tKey); return ns; }); // revert
      refreshCampaignJourney(campaignId);
    } finally {
      setTogglingLeadChannel((s) => { const ns = new Set(s); ns.delete(tKey); return ns; });
    }
  };

  /* PATCH /campaigns/{id}/leads/{lead_id}/channel-actions  →  action: "RUN"  (undo skip) */
  const runChannel = async (campaignId, leadId, channelName) => {
    const tKey = `${leadId}_${channelName}`;
    setTogglingLeadChannel((s) => new Set([...s, tKey]));
    setSkippedChannels((s) => { const ns = new Set(s); ns.delete(tKey); return ns; }); // optimistic
    try {
      await axiosInstance.patch(
        `/campaigns/${campaignId}/leads/${leadId}/channel-actions`,
        { channel_actions: { [channelName]: "RUN" } },
      );
      toast.success(`${channelName} re-enabled — it will run in sequence.`);
      refreshCampaignJourney(campaignId);
      if (selectedLeadJourney?.lead_id === leadId) {
        fetchLeadJourney(campaignId, leadId, selectedLeadJourney.lead_name ?? "");
      }
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to re-enable channel.");
      setSkippedChannels((s) => new Set([...s, tKey])); // revert
      refreshCampaignJourney(campaignId);
    } finally {
      setTogglingLeadChannel((s) => { const ns = new Set(s); ns.delete(tKey); return ns; });
    }
  };

  /* ── Toggle channel enable / disable for a lead in a campaign ── */
  const toggleLeadChannel = async (campaignId, leadId, channelName, currentlyEnabled) => {
    const tKey = `${leadId}_${channelName}`;
    setTogglingLeadChannel((s) => new Set([...s, tKey]));
    // Optimistic update
    setLeadListLeads((prev) =>
      prev.map((r) => {
        if ((r.lead_id ?? r.id) !== leadId) return r;
        const fieldKey = channelName.toLowerCase();
        const updated = { ...r, [`${fieldKey}_enabled`]: !currentlyEnabled };
        if (Array.isArray(r.channels)) {
          updated.channels = r.channels.map((ch) =>
            (ch.channel ?? ch.type ?? "").toUpperCase() === channelName
              ? { ...ch, enabled: !currentlyEnabled }
              : ch,
          );
        }
        return updated;
      }),
    );
    try {
      if (currentlyEnabled) {
        await axiosInstance.patch(
          `/campaigns/${campaignId}/leads/${leadId}/skip-channels`,
          { skip_channels: [channelName] },
        );
      } else {
        await axiosInstance.patch(
          `/campaigns/${campaignId}/leads/${leadId}/enable-channels`,
          { enable_channels: [channelName] },
        );
      }
      toast.success(`${channelName} ${currentlyEnabled ? "disabled" : "enabled"}.`);
      refreshCampaignJourney(campaignId);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to update channel.");
      refreshCampaignJourney(campaignId);
    } finally {
      setTogglingLeadChannel((s) => { const ns = new Set(s); ns.delete(tKey); return ns; });
    }
  };

  /* ── Lead edit/delete helpers ── */
  const resolveLeadId = (lead) => {
    const leadData = lead?.lead_data ?? {};
    return (
      lead?.lead_id ??
      lead?.id ??
      lead?.list_lead_id ??
      lead?._id ??
      leadData?.lead_id ??
      leadData?.id ??
      lead?.leadId ??
      null
    );
  };

  const safeString = (value) => {
    if (value === undefined || value === null) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const openLeadEditor = async (campaignId, lead) => {
    const leadData = lead?.lead_data ?? {};
    const targetLeadId = resolveLeadId(lead);
    if (!targetLeadId) {
      toast.error("Unable to identify this lead for editing.");
      return;
    }

    // Open modal immediately with existing data
    setLeadEditModal({
      open: true,
      campaignId,
      leadId: targetLeadId,
      lead: {
        lead_id: targetLeadId,
        name: safeString(lead.name ?? lead.lead_name ?? leadData.name ?? leadData.lead_name ?? ""),
        email_address: safeString(lead.email_address ?? lead.email ?? leadData.email_address ?? leadData.email ?? ""),
        contact_number: safeString(lead.contact_number ?? lead.phone ?? leadData.contact_number ?? leadData.phone ?? ""),
        company: safeString(lead.company ?? leadData.company ?? lead.company_name ?? leadData.company_name ?? ""),
        title: safeString(lead.title ?? leadData.title ?? ""),
        notes: safeString(lead.notes ?? leadData.notes ?? ""),
        record_prompt: safeString(lead.record_prompt ?? leadData.record_prompt ?? ""),
        ...(leadData || {}),
        ...(lead || {}),
      },
      saving: false,
    });

    // Fetch enriched lead data from review API and merge into modal
    try {
      const res = await axiosInstance.get(`/campaigns/${campaignId}/leads/review`);
      const data = res.data;
      const rows = Array.isArray(data) ? data : (data?.leads ?? data?.items ?? data?.data ?? []);
      const reviewed = rows.find((r) => {
        const rid = r.lead_id ?? r.id ?? r.lead_data?.lead_id ?? r.lead_data?.id;
        return String(rid) === String(targetLeadId);
      });
      if (reviewed) {
        const rd = reviewed.lead_data ?? reviewed;
        setLeadEditModal((s) => ({
          ...s,
          lead: {
            ...s.lead,
            name: safeString(rd.name ?? rd.lead_name ?? reviewed.lead_name ?? s.lead.name),
            email_address: safeString(rd.email_address ?? rd.email ?? s.lead.email_address),
            contact_number: safeString(rd.contact_number ?? rd.phone ?? s.lead.contact_number),
            company: safeString(rd.company ?? rd.company_name ?? s.lead.company),
            title: safeString(rd.title ?? s.lead.title),
            notes: safeString(rd.notes ?? s.lead.notes),
            record_prompt: safeString(rd.record_prompt ?? s.lead.record_prompt),
          },
        }));
      }
    } catch {
      // silently ignore — modal already has data from the table row
    }
  };

  const closeLeadEditor = () => {
    setLeadEditModal({
      open: false,
      campaignId: null,
      leadId: null,
      lead: null,
      saving: false,
    });
  };

  const saveLeadEditor = async () => {
    if (!leadEditModal.open || !leadEditModal.campaignId || !leadEditModal.lead) return;

    const campaignId = leadEditModal.campaignId;
    const leadId = leadEditModal.leadId ?? leadEditModal.lead.lead_id ?? leadEditModal.lead.id;
    if (!leadId) {
      toast.error("Missing lead ID.");
      return;
    }

    setLeadEditModal((s) => ({ ...s, saving: true }));

    const payload = {
      name: leadEditModal.lead.name ?? leadEditModal.lead.lead_name,
      email_address: leadEditModal.lead.email_address ?? leadEditModal.lead.email,
      contact_number: leadEditModal.lead.contact_number ?? leadEditModal.lead.phone,
      company: leadEditModal.lead.company,
      title: leadEditModal.lead.title,
      notes: leadEditModal.lead.notes,
      record_prompt: leadEditModal.lead.record_prompt,
    };

    try {
      await axiosInstance.put(`/campaigns/${campaignId}/leads/${leadId}`, payload);

      setLeadListLeads((prev) =>
        prev.map((r) => {
          const rowLeadData = r.lead_data ?? {};
          const curId = r.lead_id ?? r.id ?? rowLeadData.lead_id ?? rowLeadData.id;
          if (String(curId) !== String(leadId)) return r;

          const updates = {
            name: payload.name,
            lead_name: payload.name,
            email: payload.email_address,
            email_address: payload.email_address,
            phone: payload.contact_number,
            contact_number: payload.contact_number,
            company: payload.company,
            title: payload.title,
            notes: payload.notes,
            record_prompt: payload.record_prompt,
          };

          return {
            ...r,
            ...updates,
            lead_data: {
              ...rowLeadData,
              ...updates,
            },
          };
        }),
      );

      toast.success("Lead details updated successfully.");
      closeLeadEditor();
      refreshCampaignJourney(campaignId);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to save lead details.");
    } finally {
      setLeadEditModal((s) => ({ ...s, saving: false }));
    }
  };

  const deleteLead = async (campaignId, leadId, leadName) => {
    if (!campaignId || !leadId) return;
    try {
      await axiosInstance.delete(`/campaigns/${campaignId}/leads/${leadId}`);
      setLeadListLeads((prev) => prev.filter((r) => {
        const rowLeadData = r.lead_data ?? {};
        const curId = r.lead_id ?? r.id ?? rowLeadData.lead_id ?? rowLeadData.id;
        return String(curId) !== String(leadId);
      }));
      toast.success(`Lead "${leadName}" deleted.`);
      setLeadDeleteConfirm(null);
      refreshCampaignJourney(campaignId);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to delete lead.");
    }
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
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      label: "Paused",
      value: (campaigns ?? []).filter((c) => c.status === "PAUSED").length,
      icon: Pause,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
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
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
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
        timeZone: "Asia/Kolkata",
      });
    } catch {
      return d;
    }
  };

  const formatTableDateTime = (value) => {
    if (!value) return "—";
    if (typeof value !== "string") return String(value);
    if (value.includes("\n")) return value;
    const dt = new Date(value);
    if (!Number.isNaN(dt.getTime())) {
      return dt.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
      });
    }
    return value;
  };

  const formatApiDateTime = (value) => {
    if (!value) return "—";
    const str = String(value);
    const dt = new Date(str);
    if (!Number.isNaN(dt.getTime())) {
      return `${dt.toLocaleString("en-IN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
      })}`;
    }
    return formatTableDateTime(str);
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
    const normalizedMinutes = rounded.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.00$/, ".0");
    return `${normalizedMinutes} min`;
  };

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const isHtmlLike = (value) => /<\/?[a-z][\s\S]*>/i.test(String(value ?? ""));

  const sanitizeEmailHtml = (value) => {
    const html = String(value ?? "");
    return html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/<img[^>]*\bwidth=["']?1["']?[^>]*\bheight=["']?1["']?[^>]*>/gi, "")
      .replace(/<img[^>]*\bheight=["']?1["']?[^>]*\bwidth=["']?1["']?[^>]*>/gi, "")
      .replace(/(src|href)=(["'])http:\/\//gi, "$1=$2https://");
  };

  const toRenderableEmailHtml = (value) => {
    if (!value) return "";
    if (isHtmlLike(value)) return sanitizeEmailHtml(value);
    const safeText = escapeHtml(value).replace(/\r\n|\n|\r/g, "<br />");
    return `<div style="padding:20px; font-family:Arial, sans-serif; font-size:14px; line-height:1.6; color:#111827; background:#ffffff;">${safeText}</div>`;
  };

  const getReplyRecord = (detail) => {
    if (!detail) return null;
    if (detail.replyData) return detail.replyData;
    if (detail.replied_to_message_id) return detail.replied_to_message_id;
    const replies = getMergedReplies(detail);
    const rowId = detail.id != null ? String(detail.id) : null;
    if (rowId) {
      const matched = replies.find((r) => String(r?.auto_response_email_id ?? "") === rowId);
      if (matched) return matched;
    }
    return replies[0] ?? null;
  };

  const getEmailSubjectLabel = (row) => {
    const rawSubject = row?.subject ?? "";
    const normalized = rawSubject.toLowerCase();
    const isSkippedRow = row?.skippable || !!row?.skipReason || !!row?.skip_reason;
    const isSkippedSubject =
      normalized.includes("not sent - lead skipped") ||
      normalized.includes("lead skipped");
    if (isSkippedRow && (row?.status === "NOT_SENT" || isSkippedSubject)) {
      return "Skipped";
    }
    return rawSubject || "—";
  };

  const normalizeSkipReason = (reason) => {
    const value = String(reason ?? "").trim();
    if (!value) return "No reason provided";

    return value
      .replace(/\bin\s*come\s+call\s+skipped\b/gi, "Call skipped")
      .replace(/\bcome\s+call\s+skipped\b/gi, "Call skipped");
  };

  const normalizeFollowUpTasks = (value) => {
    if (Array.isArray(value)) {
      return value
        .flatMap((item) => normalizeFollowUpTasks(item))
        .filter(Boolean);
    }

    if (value == null) return [];

    if (typeof value === "object") {
      const nestedTasks =
        value.follow_up_tasks ??
        value.tasks ??
        value.items ??
        Object.values(value);
      return normalizeFollowUpTasks(nestedTasks);
    }

    if (typeof value === "string") {
      const trimmedValue = value.trim();
      if (!trimmedValue) return [];

      if (
        (trimmedValue.startsWith("[") && trimmedValue.endsWith("]")) ||
        (trimmedValue.startsWith("{") && trimmedValue.endsWith("}"))
      ) {
        try {
          return normalizeFollowUpTasks(JSON.parse(trimmedValue));
        } catch {
          // Fall back to delimiter splitting for malformed payloads.
        }
      }

      return value
        .split(/\r?\n|,(?=\s*[A-Z0-9])|;\s*/)
        .map((task) => task.replace(/[\[\]{}"]+/g, "").trim())
        .filter(Boolean);
    }

    return [];
  };

  const toPlainText = (value) =>
    String(value ?? "")
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.leads)) return payload.leads;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  };

  const normalizeGroupedTimeline = (group) => {
    const sourceItems =
      toArray(group?.timeline).length ? toArray(group.timeline)
        : toArray(group?.conversation).length ? toArray(group.conversation)
          : toArray(group?.messages).length ? toArray(group.messages)
            : toArray(group?.emails);

    const timeline = [];

    sourceItems.forEach((item, idx) => {
      const rawType = String(item?.type ?? item?.direction ?? item?.message_type ?? "").toLowerCase();
      const isReply =
        rawType.includes("reply") ||
        rawType.includes("inbound") ||
        rawType.includes("received") ||
        rawType.includes("user");

      timeline.push({
        id: String(item?.id ?? `${isReply ? "reply" : "email"}-${idx}`),
        type: isReply ? "reply" : "sent",
        timestamp:
          item?.timestamp ??
          item?.sent_at ??
          item?.received_datetime ??
          item?.created_at ??
          null,
        subject: item?.subject ?? item?.email_subject ?? item?.reply_subject ?? "",
        content:
          item?.content ??
          item?.email_body ??
          item?.reply_body ??
          item?.body_preview ??
          item?.message ??
          "",
        full_html:
          item?.full_html ??
          item?.email_body ??
          item?.reply_body ??
          item?.body_preview ??
          item?.content ??
          "",
        meta: isReply
          ? {
              from: item?.reply_from ?? item?.from ?? "—",
              name: item?.reply_from_name ?? item?.name ?? "",
            }
          : {
              to: item?.to_email ?? item?.to ?? "—",
              lead_name: item?.lead_name ?? item?.name ?? "—",
            },
      });

      const nestedReplies = toArray(item?.replies);
      nestedReplies.forEach((reply, rIdx) => {
        timeline.push({
          id: String(reply?.reply_id ?? `${item?.id ?? idx}-nested-reply-${rIdx}`),
          type: "reply",
          timestamp: reply?.sent_at ?? reply?.received_datetime ?? reply?.created_at ?? null,
          subject: reply?.reply_subject ?? "",
          content: reply?.reply_body ?? reply?.body_preview ?? "",
          full_html: reply?.reply_body ?? reply?.body_preview ?? "",
          meta: {
            from: reply?.reply_from ?? "—",
            name: reply?.reply_from_name ?? "",
            sentiment: reply?.reply_sentiment ?? "",
            intent: reply?.reply_intent ?? "",
          },
        });
      });
    });

    return timeline.sort((a, b) => {
      const ta = a?.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tb = b?.timestamp ? new Date(b.timestamp).getTime() : 0;
      return ta - tb;
    });
  };

  const fetchGroupedConversationTimeline = async (row) => {
    if (!selectedCampaign?.id || !row) return [];

    const leadId = row?.lead_id ?? null;
    const rowEmail = String(row?.to_email ?? row?.emailAddr ?? row?.email ?? "").trim().toLowerCase();
    const rowLead = String(row?.lead_name ?? row?.name ?? "").trim().toLowerCase();

    const res = await axiosInstance.get("/email-history/grouped/", {
      params: { campaign_id: selectedCampaign.id },
    });

    const groups = toArray(res?.data);

    const matchedGroup = groups.find((g) => {
      const gLeadId = g?.lead_id ?? g?.leadId ?? null;
      const gEmail = String(g?.to_email ?? g?.lead_email ?? g?.email ?? "").trim().toLowerCase();
      const gLead = String(g?.lead_name ?? g?.name ?? "").trim().toLowerCase();

      if (leadId != null && gLeadId != null && String(gLeadId) === String(leadId)) return true;
      if (rowEmail && gEmail && rowEmail === gEmail) return true;
      if (rowLead && gLead && rowLead === gLead) return true;
      return false;
    });

    if (!matchedGroup) return [];
    return normalizeGroupedTimeline(matchedGroup);
  };

  const buildConversation = (selectedRow, allRows = []) => {
    if (!selectedRow) return [];

    // Step 1: Group all emails for this lead by lead_id.
    // Fall back to matching by to_email + lead_name if lead_id is absent.
    const selectedLeadId = selectedRow?.lead_id ?? null;
    const normalizeStr = (v) => String(v ?? "").trim().toLowerCase();
    const selectedEmail = normalizeStr(selectedRow?.to_email ?? selectedRow?.emailAddr ?? selectedRow?.email);
    const selectedLead  = normalizeStr(selectedRow?.lead_name ?? selectedRow?.name);

    const group = (Array.isArray(allRows) ? allRows : []).filter((row) => {
      if (selectedLeadId) return row?.lead_id === selectedLeadId;
      const sameEmail = selectedEmail && normalizeStr(row?.to_email ?? row?.emailAddr ?? row?.email) === selectedEmail;
      const sameLead  = selectedLead  && normalizeStr(row?.lead_name ?? row?.name) === selectedLead;
      return sameEmail || sameLead;
    });

    // Ensure the selected row itself is always in the group
    const selectedId = String(selectedRow?.id ?? "");
    const hasSelected = group.some((row) => String(row?.id ?? "") === selectedId);
    const rows = hasSelected ? group : [...group, selectedRow];

    // Step 2: Sort by id ascending — smallest id = oldest (first) email in the thread
    const sorted = [...rows].sort((a, b) => (Number(a?.id) || 0) - (Number(b?.id) || 0));

    // Step 3: Build a map of reply_id → the email that was sent in response to it.
    // Each email's repliedToMessageId.reply_id tells us which user reply triggered it.
    const replyIdToEmail = new Map();
    sorted.forEach((row) => {
      const triggeredBy =
        row?.repliedToMessageId?.reply_id ??
        row?.replied_to_message_id?.reply_id ??
        null;
      if (triggeredBy != null) {
        replyIdToEmail.set(String(triggeredBy), row);
      }
    });

    // Step 4: Chain walk.
    // Start with the email that has no triggering reply (replied_to_message_id === null).
    // Then follow: email → its replies[] → next email that was triggered by that reply → ...
    const firstEmail =
      sorted.find((row) => !row?.repliedToMessageId && !row?.replied_to_message_id) ??
      sorted[0];

    const timeline = [];
    const seenEmailIds = new Set();
    const seenReplyIds = new Set();

    let current = firstEmail;
    while (current) {
      const emailId = String(current?.id ?? "");
      if (seenEmailIds.has(emailId)) break;
      seenEmailIds.add(emailId);

      // Push the outbound (system-sent) email
      timeline.push({
        id: `email-${emailId}`,
        type: "sent",
        timestamp: current?.sent_at ?? current?.dateTime ?? current?.created_at ?? null,
        subject: current?.email_subject ?? current?.subject ?? "",
        content: current?.email_body ?? "",
        full_html: current?.email_body ?? "",
        meta: {
          to: current?.to_email ?? current?.emailAddr ?? current?.email ?? "—",
          lead_name: current?.lead_name ?? current?.name ?? "—",
        },
      });

      // Push the user replies that came after this email.
      // replies[] on the email object holds the inbound replies to this specific sent email.
      const directReplies = Array.isArray(current?.replies) ? current.replies : [];
      let firstReplyId = null;

      directReplies.forEach((reply) => {
        const replyKey =
          reply?.reply_id != null
            ? String(reply.reply_id)
            : `${reply?.reply_from ?? ""}|${reply?.sent_at ?? reply?.received_datetime ?? ""}`;
        if (seenReplyIds.has(replyKey)) return;
        seenReplyIds.add(replyKey);

        timeline.push({
          id: `reply-${replyKey}`,
          type: "reply",
          timestamp: reply?.sent_at ?? reply?.received_datetime ?? null,
          subject: reply?.reply_subject ?? "",
          content: reply?.body_preview ?? reply?.reply_body ?? "",
          full_html: reply?.reply_body ?? reply?.body_preview ?? "",
          meta: {
            from: reply?.reply_from ?? "—",
            name: reply?.reply_from_name ?? "",
            sentiment: reply?.reply_sentiment ?? "",
            intent: reply?.reply_intent ?? "",
          },
        });

        // Track the first reply_id so we can follow the chain to the next system email
        if (firstReplyId === null && reply?.reply_id != null) {
          firstReplyId = String(reply.reply_id);
        }
      });

      // Follow the chain: find the next email triggered by the first reply above.
      // If none found that way, fall through to the next unseen email in sorted order.
      if (firstReplyId && replyIdToEmail.has(firstReplyId)) {
        current = replyIdToEmail.get(firstReplyId);
      } else {
        current = sorted.find((row) => !seenEmailIds.has(String(row?.id ?? ""))) ?? null;
      }
    }

    return timeline;
  };

  /* ── Shared form helpers (stable references — must NOT be inside if-block) ── */
  const inputCls =
    "rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] text-gray-700 outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 w-full";
  const selectCls = inputCls + " appearance-none cursor-pointer";

  /* ── Full-page Create Campaign form ── */
  if (showCreate) {
    return (
      <main className="flex flex-col bg-[#f4f5f7]" style={{ height: "calc(100vh - 60px)" }}>
        {/* Top bar */}
        <div className="shrink-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
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

        <div className="flex-1 overflow-y-auto">
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
              {form.channel_order.map((c) => c.toUpperCase()).includes("CALL") && (
                <>
                  <Field label="LLM Model">
                    <div className="relative">
                      <select
                        name="vapi_model"
                        value={form.vapi_model}
                        onChange={handleFormChange}
                        className={selectCls}
                      >
                        <option value="">— Select LLM model —</option>
                        {[
                          { label: "gpt-4o", value: "gpt-4o" },
                          { label: "gpt-4-turbo", value: "gpt-4-turbo" },
                          { label: "gpt-3.5-turbo", value: "gpt-3.5-turbo" },
                        ].map((model) => (
                          <option key={model.value} value={model.value}>
                            {model.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </Field>
                  <Field label="Voice ID">
                    <div className="relative">
                      <select
                        name="vapi_voice_id"
                        value={form.vapi_voice_id}
                        onChange={handleFormChange}
                        className={selectCls}
                      >
                        <option value="">— Select Voice —</option>
                        {[
                          { label: "Cassidy", value: "56AoDkrOh6qfVPDXZ7Pt", description: "Confident female podcaster" },
                          { label: "Jessica", value: "flHkNRp1BlvT73UL6gyz", description: "The Villain! Wickedly eloquent." },
                          { label: "William", value: "8Es4wFxsDlHBmFWAOWRS", description: "Neutral US English, rich depth" },
                          { label: "Dan",     value: "fvVBPXuE7f1iX3dZLKFy", description: "Warm, conversational, friendly" },
                          { label: "Eric",    value: "cjVigY5qzO86Huf0OWal", description: "Smooth tenor, man in his 40s" },
                        ].map((v) => (
                          <option key={v.value} value={v.value}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
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
                </>
              )}
              <Field label="Agent">
                <input
                  name="agent_name"
                  value={form.agent_name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, agent_name: e.target.value }))
                  }
                  placeholder="Enter agent name"
                  className={inputCls}
                />
              </Field>
          
              <Field label="Lead List">
                <div className="relative">
                  <select
                    name="list_id"
                    value={form.list_id}
                    onChange={handleFormChange}
                    className={selectCls}
                  >
                    <option value="">— Select a list —</option>
                    {(leadLists ?? []).map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </Field>
            </div>
         
          </section>




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

          {/* Section: Campaign Settings Toggles */}
          {form.channel_order.length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className={`grid gap-3 ${form.channel_order.map((c) => c.toUpperCase()).includes("EMAIL") ? "grid-cols-2" : "grid-cols-1"}`}>
                {/* Advance Campaign Setting Toggle — shows for ALL channels */}
                <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
                  <div>
                    <p className="text-[14px] font-[600] text-[#0a0a0a]">Advance Campaign Setting</p>
                    <p className="text-[12px] text-blue-500 mt-0.5">Campaign sender email, SMTP and template settings</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleEmailConfigToggle}
                    disabled={emailConfigLoading}
                    className={`ml-3 flex-shrink-0 relative inline-flex h-7 w-12 items-center rounded-full transition-colors disabled:opacity-60 ${showEmailConfig ? "bg-[#1e293b]" : "bg-gray-200"}`}
                  >
                    {emailConfigLoading ? (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg className="h-3 w-3 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                      </span>
                    ) : (
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${showEmailConfig ? "translate-x-6" : "translate-x-1"}`} />
                    )}
                  </button>
                </div>

                {/* Preview Mode toggle — only when Email is in channel_order */}
                {form.channel_order.map((c) => c.toUpperCase()).includes("EMAIL") && (
                  <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
                    <div>
                      <p className="text-[14px] font-[600] text-[#0a0a0a]">Preview Mode</p>
                      <p className="text-[12px] text-blue-500 mt-0.5">Review drafts before sending</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, preview_mode: !p.preview_mode }))}
                      className={`ml-3 flex-shrink-0 relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${form.preview_mode ? "bg-[#1e293b]" : "bg-gray-200"}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${form.preview_mode ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </div>
                )}
              </div>

            </section>
          )}

         
          {/* Section: Advance Campaign Setting Fields — shows when toggle is ON and any channel selected */}
          {showEmailConfig && form.channel_order.length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="h-4 w-4 text-indigo-600" />
                <h2 className="text-[14px] font-[700] text-[#1e3a8a]">
                  Advance Campaign Setting
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Meeting Invite Sender Email — for ALL channels */}
                <Field label="Meeting Invite Sender Email">
                  <input
                    type="email"
                    name="logged_in_user_email"
                    value={form.logged_in_user_email ?? ""}
                    onChange={handleFormChange}
                    placeholder="user@company.com"
                    className={inputCls}
                  />
                </Field>

                {/* Email Config fields — only for Email channel */}
                {form.channel_order.map((c) => c.toUpperCase()).includes("EMAIL") && emailSendingService !== "CRM" && (
                  <>
                  <Field label="SMTP Provider Name (Optional)">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setSmtpProvidersOpen((o) => !o)}
                        className={`${selectCls} flex items-center justify-between w-full text-left`}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          {form.smtp_provider_name ? (
                            <>
                              {(() => {
                                const p = smtpProvidersList.find((x) => x.name === form.smtp_provider_name);
                                return p?.is_current ? (
                                  <span className="shrink-0 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_4px_#22c55e]" />
                                ) : null;
                              })()}
                              <span className="truncate">{form.smtp_provider_name}</span>
                            </>
                          ) : (
                            <span className="text-gray-400">— Select Provider —</span>
                          )}
                        </span>
                        <ChevronDown className="shrink-0 h-4 w-4 text-gray-400 ml-2" />
                      </button>
                      {smtpProvidersOpen && (
                        <div className="absolute z-50 top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg py-1 max-h-56 overflow-y-auto">
                          <div
                            className="px-3 py-2 text-[12px] text-gray-400 hover:bg-gray-50 cursor-pointer"
                            onClick={() => { setSmtpProvidersOpen(false); setForm((f) => ({ ...f, smtp_provider_name: "" })); }}
                          >
                            — Select Provider —
                          </div>
                          {smtpProvidersList.length === 0 ? (
                            <div className="px-3 py-2 text-[12px] text-gray-400 italic">No providers found</div>
                          ) : (
                            smtpProvidersList.map((p) => (
                              <div
                                key={p.name}
                                className={`flex items-center gap-2.5 px-3 py-2 text-[13px] cursor-pointer hover:bg-gray-50 ${form.smtp_provider_name === p.name ? "bg-indigo-50 text-indigo-700 font-[600]" : "text-gray-700"}`}
                                onClick={() => { setSmtpProvidersOpen(false); setForm((f) => ({ ...f, smtp_provider_name: p.name })); }}
                              >
                                {p.is_current ? (
                                  <span className="shrink-0 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_4px_#22c55e]" />
                                ) : (
                                  <span className="shrink-0 w-2 h-2 rounded-full bg-gray-200" />
                                )}
                                <span className="truncate">{p.name}</span>
                                {p.is_current && (
                                  <span className="ml-auto text-[10px] font-[600] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-200 shrink-0">Available</span>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </Field>
                  <Field label="Email Template">
                  <div className="relative">
                    <select
                      name="template_id"
                      value={form.template_id ?? ""}
                      onChange={handleFormChange}
                      required
                      className={selectCls}
                    >
                      <option value="">— Select a template —</option>
                      {form.template_id &&
                        !(emailTemplates ?? []).some(
                          (t) => String(t.id) === String(form.template_id),
                        ) && (
                          <option value={form.template_id}>
                            Current template ({form.template_id})
                          </option>
                        )}
                      {(emailTemplates ?? []).map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </Field>
                {emailSendingService !== "CRM" && (
                  <>
                    <Field label="From Name">
                      <input
                        name="from_name"
                        value={form.from_name ?? ""}
                        onChange={handleFormChange}
                        placeholder="John from Acme Corp"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="From Email">
                      <input
                        type="email"
                        name="from_email"
                        value={form.from_email ?? ""}
                        onChange={handleFormChange}
                        placeholder="john@acme.com"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Reply to Email">
                      <input
                        type="email"
                        name="reply_to_email"
                        value={form.reply_to_email ?? ""}
                        onChange={handleFormChange}
                        placeholder="support@acme.com"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Emails per Batch">
                      <input
                        type="number"
                        name="emails_per_batch"
                        value={form.emails_per_batch ?? ""}
                        onChange={handleFormChange}
                        min={1}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Delay between Batches (Seconds)">
                      <input
                        type="number"
                        name="delay_between_batches_seconds"
                        value={form.delay_between_batches_seconds ?? ""}
                        onChange={handleFormChange}
                        min={0}
                        className={inputCls}
                      />
                    </Field>
                  </>
                )}
                  </>
                )}
              </div>

            </section>
          )}

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
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 grid grid-cols-1 md:grid-cols-1 gap-3">
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
              {/* <button
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
              </button> */}
            </section>
          )}
        </div>
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
    if (!Number.isFinite(percent) || percent < 0.08) return null;
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

  const renderEmailStatusPieLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    if (!Number.isFinite(percent) || percent < 0.08) return null;
    const RADIAN = Math.PI / 180;
    const roundedPercent = Math.round(percent * 100);

    // Keep 100% centered so it doesn't clip on a single-slice donut.
    const labelX = roundedPercent === 100
      ? cx
      : cx + (innerRadius + (outerRadius - innerRadius) * 0.4) * Math.cos(-midAngle * RADIAN);
    const labelY = roundedPercent === 100
      ? cy
      : cy + (innerRadius + (outerRadius - innerRadius) * 0.4) * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={labelX}
        y={labelY}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: 7, fontWeight: 700 }}
      >
        {`${roundedPercent}%`}
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

  const routeCampaignId = searchParams.get("campaign");
  const isRouteCampaignLoading =
    !!routeCampaignId &&
    !selectedCampaign &&
    loading;

  if (isRouteCampaignLoading) {
    return (
      <main className="min-h-screen bg-[#f4f5f7] p-6">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-violet-400" />
          <p className="text-[13px] text-gray-400">Loading campaign details...</p>
        </div>
      </main>
    );
  }

  /* ── Campaign Activities routing ── */
  if (selectedCampaign) {
    const c = selectedCampaign;

    /* ─── ALL CAMPAIGN ACTIVITY ─── */
    if (activeTab === "ALL") {
      // Data from /api/campaigns/{id}/journey
      const allData = leadListLeads.length > 0 ? leadListLeads : (c.allActivity ?? []);
      // Fixed channel columns matching the second design image
      const channelCols = [
        { label: "Call",      field: "call",      enabledField: "call_enabled" },
        { label: "Email",     field: "email",     enabledField: "email_enabled" },
        { label: "LinkedIn",  field: "linkedin",  enabledField: "linkedin_enabled" },
        { label: "WhatsApp",  field: "whatsapp",  enabledField: "whatsapp_enabled" },
      ];
      const total = allData.length || c.totalLeads;
      const fullCoverage = allData.filter(
        (r) => channelCols.every((col) => r[col.field]),
      ).length;
      const partialCoverage = allData.filter(
        (r) =>
          channelCols.some((col) => r[col.field]) &&
          !channelCols.every((col) => r[col.field]),
      ).length;
      const noCoverage = allData.filter(
        (r) => !r.call && !r.email && !r.linkedin,
      ).length;
      const channelBarData = [
        {
          channel: "Call",
          reached: allData.filter((r) => r.call).length,
          fill: "#1d4ed8",
        },
        {
          channel: "Email",
          reached: allData.filter((r) => r.email).length,
          fill: "#2563eb",
        },
        {
          channel: "LinkedIn",
          reached: allData.filter((r) => r.linkedin).length,
          fill: "#60a5fa",
        },
      ];
      const coverageDonut = [
        { name: "Full", value: fullCoverage, color: "#1d4ed8" },
        { name: "Partial", value: partialCoverage, color: "#3b82f6" },
        { name: "None", value: noCoverage, color: "#bfdbfe" },
      ].filter((s) => s.value > 0);
      /* helpers for journey modal status rendering */
      const overallStatusBadge = (s) => {
        const st = (s ?? "").toLowerCase();
        if (st === "converted")   return { label: "Converted",   cls: "bg-violet-100 text-violet-700 border border-violet-200" };
        if (st === "in_progress") return { label: "In Progress", cls: "bg-blue-100 text-blue-700 border border-blue-200" };
        if (st === "finished")    return { label: "Finished",    cls: "bg-gray-100 text-gray-600 border border-gray-200" };
        if (st === "not_started") return { label: "Not Started", cls: "bg-amber-50 text-amber-700 border border-amber-200" };
        return { label: s ?? "—", cls: "bg-gray-100 text-gray-500 border border-gray-200" };
      };
      const chIcons = { CALL: Phone, EMAIL: Mail, LINKEDIN: Linkedin, WHATSAPP: MessageCircle };

      return (
        <main className="min-h-screen bg-[#f4f5f7]">
          {/* ── Lead Journey Modal Popup ── */}
          {selectedLeadJourney && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
              onClick={() => { setSelectedLeadJourney(null); setLeadJourneyData([]); }}
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal header */}
                <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-8 h-8 rounded-xl bg-[#6366f1]/10 flex items-center justify-center shrink-0">
                      <GitBranch className="h-4 w-4 text-[#6366f1]" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-[14px] font-[700] text-gray-900 truncate">
                        {selectedLeadJourney.lead_name}
                      </h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-gray-400">Lead Journey</span>
                        {selectedLeadJourney.overall_status && (() => {
                          const b = overallStatusBadge(selectedLeadJourney.overall_status);
                          return (
                            <span className={`text-[10px] font-[600] px-1.5 py-0.5 rounded-full border ${b.cls}`}>
                              {b.label}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedLeadJourney(null); setLeadJourneyData([]); }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition shrink-0 mt-0.5"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>

                {/* Modal body */}
                <div className="flex-1 overflow-y-auto p-5">
                  {leadJourneyLoading ? (
                    <div className="py-14 text-center">
                      <RefreshCw className="h-6 w-6 text-violet-400 animate-spin mx-auto mb-2" />
                      <p className="text-[13px] text-gray-400">Loading journey…</p>
                    </div>
                  ) : leadJourneyData.length === 0 ? (
                    <div className="py-14 text-center">
                      <GitBranch className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-[13px] text-gray-400">No journey steps found.</p>
                    </div>
                  ) : (
                    <div className="relative pl-7">
                      {/* vertical timeline line */}
                      <span className="absolute left-[11px] top-3 bottom-3 w-[2px] bg-gray-100 rounded-full" />
                      <div className="flex flex-col gap-4">
                        {leadJourneyData.map((step, si) => {
                          const channel = (step.channel ?? step.type ?? step.channel_name ?? "").toUpperCase();
                          const ChIcon = chIcons[channel] ?? GitBranch;
                          const cfg = getChCfg(step.status ?? step.state ?? "");
                          const StatusIcon = cfg.icon;
                          return (
                            <div key={si} className="relative">
                              {/* timeline dot with status colour */}
                              <span className={`absolute -left-[26px] top-4 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${cfg.dot}`} />
                              <div className={`rounded-xl border shadow-sm p-3.5 ${
                                cfg.dot === "bg-green-500"  ? "bg-green-50/40 border-green-100" :
                                cfg.dot === "bg-violet-500" ? "bg-violet-50/40 border-violet-100" :
                                cfg.dot === "bg-blue-500"   ? "bg-blue-50/30 border-blue-100" :
                                cfg.dot === "bg-amber-400"  ? "bg-amber-50/30 border-amber-100" :
                                "bg-white border-gray-100"
                              }`}>
                                {/* channel label + status badge row */}
                                <div className="flex items-center justify-between gap-2 mb-2.5">
                                  <div className="flex items-center gap-2">
                                    {/* channel icon in indigo circle */}
                                    <span className="w-7 h-7 rounded-lg bg-[#6366f1]/10 flex items-center justify-center shrink-0">
                                      <ChIcon className="h-3.5 w-3.5 text-[#6366f1]" />
                                    </span>
                                    <span className="text-[13px] font-[700] text-gray-800">
                                      {channel || `Step ${si + 1}`}
                                    </span>
                                  </div>
                                  {/* status pill with matching icon */}
                                  <span className={`inline-flex items-center gap-1 text-[10px] font-[600] px-2 py-0.5 rounded-full border shrink-0 ${cfg.badge}`}>
                                    <StatusIcon className={`h-3 w-3${cfg.spin ? " animate-spin" : ""}`} />
                                    {cfg.label}
                                  </span>
                                </div>
                                {/* extra metadata */}
                                <div className="space-y-1 mb-2">
                                  {Object.entries(step)
                                    .filter(([k]) => !["channel","type","channel_name","status","state"].includes(k))
                                    .slice(0, 5)
                                    .map(([key, val]) => (
                                      <div key={key} className="flex justify-between items-start gap-2">
                                        <span className="text-[11px] text-gray-400 capitalize shrink-0">
                                          {key.replace(/_/g, " ")}
                                        </span>
                                        <span className="text-[11px] font-[500] text-gray-700 text-right max-w-[180px] truncate">
                                          {String(val ?? "—")}
                                        </span>
                                      </div>
                                    ))}
                                </div>
                                {/* Skip button — only for processing / waiting */}
                                {cfg.canSkip && (
                                  <button
                                    onClick={() => skipChannel(c.id, selectedLeadJourney.lead_id, channel)}
                                    className="mt-1 w-full py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-[11px] font-[600] hover:bg-amber-100 transition flex items-center justify-center gap-1.5"
                                  >
                                    <SkipForward className="h-3 w-3" /> Skip {channel}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* ── Main Content ── */}
          <div className="p-4 overflow-auto min-w-0">
            <div className="mb-5">
              <button
                type="button"
                onClick={backToCampaignActivities}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Campaign Activities
              </button>
            </div>
            <div className="mb-5">
              <div>
                <h1 className="text-[17px] font-[700] text-[#0a0a0a]">
                  All Campaign Activity
                </h1>
                <p className="text-[13px] text-gray-500 mt-0.5">
                  Overview of all channel activities across campaigns
                </p>
              </div>
            </div>
          {/* KPI strip — sourced from /api/campaigns/{id}/journey stats */}
          <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: "Total Leads",
                value: journeyStats?.total ?? c.totalLeads ?? 0,
                color: "text-blue-600",
                ring: "ring-blue-200",
              },
              {
                label: "In Progress",
                value: journeyStats?.in_progress ?? 0,
                color: "text-blue-600",
                ring: "ring-blue-200",
              },
              {
                label: "Converted",
                value: journeyStats?.converted ?? 0,
                color: "text-blue-600",
                ring: "ring-blue-200",
              },
              {
                label: "Finished",
                value: journeyStats?.finished ?? 0,
                color: "text-blue-600",
                ring: "ring-blue-200",
              },
            ].map((k) => (
              <article
                key={k.label}
                className={`rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col gap-1 ring-1 ${k.ring}`}
              >
                <p className="text-[11px] font-[600] uppercase tracking-widest text-gray-400">
                  {k.label}
                </p>
                <p className={`text-[22px] font-[800] leading-none ${k.color}`}>
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
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-[14px] font-[600] text-gray-900">
                    All Campaign Activity
                  </h3>
                  <p className="text-[12px] text-gray-400 mt-0.5">
                    Overview of all channel activities across campaigns
                  </p>
                </div>
                {/* Show "Add Lead" button only if no status is completed */}
                {(() => {
                  const showAddLeadButton = allData.length === 0 || !allData.some((lead) => {
                    return Array.isArray(lead.channels) && lead.channels.some((ch) => (ch.status ?? "").toLowerCase() === "completed");
                  });
                  
                  return showAddLeadButton ? (
                    <button
                      type="button"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-bold shadow transition"
                      onClick={() => setShowAddLead(true)}
                    >
                      <Plus className="w-4 h-4" />
                      Add Lead
                    </button>
                  ) : null;
                })()}
              </div>
            {leadListLoading ? (
              <div className="px-5 py-12 text-center text-[13px] text-gray-400">
                Loading leads…
              </div>
            ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#1e293b]">
                  {["Serial No.", "Lead Name", ...channelCols.map((col) => col.label), "Actions"].map(
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
                      colSpan={3 + channelCols.length}
                      className="px-5 py-12 text-center text-[13px] text-gray-400"
                    >
                      No journey data found for this campaign.
                    </td>
                  </tr>
                ) : (
                  allData.map((row, idx) => {
                    const leadData = row.lead_data ?? {};
                    const leadId = resolveLeadId(row);
                    const leadName =
                      row.lead_name ??
                      row.name ??
                      leadData.name ??
                      leadData.lead_name ??
                      (row.first_name ? `${row.first_name} ${row.last_name ?? ""}`.trim() : null) ??
                      `Lead ${idx + 1}`;
                    return (
                      <tr
                        key={leadId ?? idx}
                        className={`border-b border-gray-50 transition ${
                          idx % 2 !== 0 ? "bg-gray-50/30" : ""
                        }`}
                      >
                        <td className="px-5 py-3.5 text-[13px] text-gray-500">
                          {idx + 1}
                        </td>
                        <td
                          className="px-5 py-3.5"
                          onClick={() => fetchLeadJourney(c.id, leadId, leadName)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-[600] text-[#6366f1] cursor-pointer hover:underline">
                              {leadName}
                            </span>
                            {(row.skip_reason || row.skipReason) && (
                              <div className="relative group inline-block">
                                <span className="inline-flex items-center gap-1 px-2 h-5 rounded-md text-[10px] font-[600] border border-gray-200 bg-gray-100 text-gray-400 cursor-default select-none">
                                  <SkipForward className="h-2.5 w-2.5" />
                                  Skipped
                                </span>
                                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max max-w-[240px] rounded-lg bg-gray-800 px-3 py-2 text-[11px] text-white shadow-lg pointer-events-none">
                                  <p className="font-[600] mb-0.5">Skip Reason</p>
                                  <p className="font-[400] text-gray-300">{normalizeSkipReason(row.skip_reason || row.skipReason)}</p>
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        {channelCols.map((col) => {
                          const chName = col.label.toUpperCase() === "WHATSAPP" ? "WHATSAPP" : col.label.toUpperCase();
                          const tKey = `${leadId}_${chName}`;
                          const busy = togglingLeadChannel.has(tKey);
                          const channelEnabled = row[col.enabledField];
                          const isChannelDisabled = channelEnabled === false;
                          // skippedChannels overrides server data — prevents refresh from reverting the badge
                          const isSkipped = skippedChannels.has(tKey);
                          const chStatus = isSkipped ? "skipped" : (resolveChannelStatus(row, col.field) ?? "").toLowerCase();

                          // ── Completed / converted → green tick (not skippable)
                          if (chStatus === "completed" || chStatus === "converted") {
                            return (
                              <td key={col.field} className="px-4 py-3.5">
                                <span
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-50 border border-green-200"
                                  title={`${col.label}: ${chStatus}`}
                                >
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                </span>
                              </td>
                            );
                          }

                          // ── Explicitly disabled channel → show Disabled + Enable action
                          if (isChannelDisabled) {
                            return (
                              <td key={col.field} className="px-4 py-3.5">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    title={`${col.label}: Disabled`}
                                    className="inline-flex items-center gap-1 px-2 h-6 rounded-lg text-[10px] font-[600] border border-gray-200 bg-gray-100 text-gray-500 select-none"
                                  >
                                    <X className="h-2.5 w-2.5" />
                                    Disabled
                                  </span>
                                  <button
                                    disabled={busy}
                                    onClick={() => runChannel(c.id, leadId, chName)}
                                    title={`Enable ${col.label}`}
                                    className="inline-flex items-center gap-1 px-2 h-6 rounded-lg text-[10px] font-[600] border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition disabled:opacity-50"
                                  >
                                    {busy
                                      ? <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                                      : <Play className="h-2.5 w-2.5" />}
                                    {busy ? "…" : "Enable"}
                                  </button>
                                </div>
                              </td>
                            );
                          }

                          // ── Not in campaign (no status at all) → dash, no cross
                          if (!chStatus) {
                            return (
                              <td key={col.field} className="px-4 py-3.5 text-gray-300 text-[13px] font-[500]">—</td>
                            );
                          }

          // ── Processing → blue spinner chip (NOT skippable — actively running)
                          if (chStatus === "processing") {
                            return (
                              <td key={col.field} className="px-4 py-3.5">
                                <span
                                  title={`${col.label}: Live — cannot skip while processing`}
                                  className="inline-flex items-center gap-1 px-2.5 h-7 rounded-lg text-[10px] font-[700] border border-blue-200 bg-blue-50 text-blue-600 cursor-not-allowed select-none"
                                >
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Live
                                </span>
                              </td>
                            );
                          }

                          // ── Waiting/Queue → amber chip with Skip action
                          if (chStatus === "waiting") {
                            return (
                              <td key={col.field} className="px-4 py-3.5">
                                <div className="flex items-center gap-1.5">
                                  {/* Queue status badge */}
                                  <span className="inline-flex items-center gap-1 px-2 h-6 rounded-lg text-[10px] font-[600] border border-amber-200 bg-amber-50 text-amber-600">
                                    <Clock className="h-2.5 w-2.5" />
                                    Queue
                                  </span>
                                  {/* Skip button */}
                                  <button
                                    disabled={busy}
                                    onClick={() => skipChannel(c.id, leadId, chName)}
                                    title={`Skip ${col.label} — next channel will start`}
                                    className="inline-flex items-center gap-1 px-2 h-6 rounded-lg text-[10px] font-[600] border border-gray-200 bg-white text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                                  >
                                    {busy
                                      ? <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                                      : <SkipForward className="h-2.5 w-2.5" />}
                                    {busy ? "…" : "Skip"}
                                  </button>
                                </div>
                              </td>
                            );
                          }

                          // ── Skipped → gray badge + Run button to re-enable
                          if (chStatus === "skipped") {
                            // Resolve skip_reason: check channel-level nested data first, then row-level
                            const chKey = col.field; // e.g. "call", "email"
                            const channelObj = Array.isArray(row.channels)
                              ? row.channels.find((ch) => (ch.channel ?? "").toLowerCase() === chKey)
                              : null;
                            const skipReason =
                              channelObj?.skip_reason ??
                              channelObj?.skipReason ??
                              row[`${chKey}_skip_reason`] ??
                              row.skip_reason ??
                              row.skipReason ??
                              null;
                            return (
                              <td key={col.field} className="px-4 py-3.5">
                                <div className="flex items-center gap-1.5">
                                  <div className="relative group inline-block">
                                    <span
                                      className="inline-flex items-center gap-1 px-2.5 h-6 rounded-lg text-[10px] font-[600] border border-gray-200 bg-gray-100 text-gray-400 select-none cursor-default"
                                    >
                                      <SkipForward className="h-2.5 w-2.5" />
                                      Skipped
                                    </span>
                                    {skipReason && (
                                      <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max max-w-[220px] rounded-lg bg-gray-800 px-3 py-2 text-[11px] text-white shadow-lg pointer-events-none">
                                        <p className="font-[600] mb-0.5">Skip Reason</p>
                                        <p className="font-[400] text-gray-300">{normalizeSkipReason(skipReason)}</p>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    disabled={busy}
                                    onClick={() => runChannel(c.id, leadId, chName)}
                                    title={`Re-enable ${col.label} — it will run in sequence`}
                                    className="inline-flex items-center gap-1 px-2 h-6 rounded-lg text-[10px] font-[600] border border-green-200 bg-green-50 text-green-600 hover:bg-green-100 transition disabled:opacity-50"
                                  >
                                    {busy
                                      ? <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                                      : <Play className="h-2.5 w-2.5" />}
                                    {busy ? "…" : "Run"}
                                  </button>
                                </div>
                              </td>
                            );
                          }

                          // ── not_started → show dash (same as null)
                          if (chStatus === "not_started") {
                            return (
                              <td key={col.field} className="px-4 py-3.5 text-gray-300 text-sm">—</td>
                            );
                          }

                          // ── Fallback for any other status → show label as-is
                          return (
                            <td key={col.field} className="px-4 py-3.5">
                              <span className="inline-flex items-center px-2.5 h-7 rounded-lg text-[10px] font-[600] border border-gray-200 bg-gray-50 text-gray-500">
                                {chStatus}
                              </span>
                            </td>
                          );
                        })}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!leadId) {
                                  toast.error("Lead ID not found for edit.");
                                  return;
                                }
                                openLeadEditor(c.id, row);
                              }}
                              title="Edit lead"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!leadId) {
                                  toast.error("Lead ID not found for delete.");
                                  return;
                                }
                                setLeadDeleteConfirm({
                                  campaignId: c.id,
                                  leadId,
                                  leadName,
                                });
                              }}
                              title="Delete lead"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            )}
            {/* Add Lead Modal */}
            <LeadAdd
              isOpen={showAddLead}
              onClose={() => setShowAddLead(false)}
              onSubmit={handleAddLeadSubmit}
            />
          </div>
          </div>{/* end main content */}

          {/* ── Lead Delete Confirmation Modal ── */}
          {leadDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 max-w-sm w-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-[700] text-gray-900">Delete Lead</h3>
                    <p className="text-[12px] text-gray-400">This action cannot be undone.</p>
                  </div>
                </div>
                <p className="text-[13px] text-gray-600 mb-5">
                  Are you sure you want to delete
                  <span className="font-[700] text-gray-900"> &ldquo;{leadDeleteConfirm.leadName}&rdquo;</span>?
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setLeadDeleteConfirm(null)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-[600] text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteLead(leadDeleteConfirm.campaignId, leadDeleteConfirm.leadId, leadDeleteConfirm.leadName)}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[13px] font-[700] hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Lead Edit Modal ── */}
          {leadEditModal.open && leadEditModal.lead && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-[440px] flex flex-col" style={{ maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
                  <div>
                    <h2 className="font-poppins text-[15px] font-[700] text-[#0a0a0a] leading-tight">
                      Edit Lead Details
                    </h2>
                    <p className="font-inter text-[12px] text-gray-500 mt-0.5">
                      Update the lead information below
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeLeadEditor}
                    className="mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition shrink-0"
                  >
                    ✕
                  </button>
                </div>

                {/* Body (scrollable with hidden scrollbar) */}
                <style>{`
                  .lead-form-scrollable {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                  }
                  .lead-form-scrollable::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                <div className="flex-1 overflow-y-auto px-5 py-4 lead-form-scrollable">
                  <form id="lead-edit-form" noValidate>
                    {/* Required fields section */}
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="flex flex-col">
                        <label className="block text-[12px] font-[600] text-[#0a0a0a] mb-1.5">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter lead name"
                          value={leadEditModal.lead.name ?? leadEditModal.lead.lead_name ?? ""}
                          onChange={(e) => setLeadEditModal((s) => ({ ...s, lead: { ...s.lead, name: e.target.value, lead_name: e.target.value } }))}
                          className="w-full px-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all placeholder:text-gray-400"
                          style={{ color: "#111827", caretColor: "#111827" }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="block text-[12px] font-[600] text-[#0a0a0a] mb-1.5">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          placeholder="Enter email address"
                          value={leadEditModal.lead.email_address ?? leadEditModal.lead.email ?? ""}
                          onChange={(e) => setLeadEditModal((s) => ({ ...s, lead: { ...s.lead, email_address: e.target.value, email: e.target.value } }))}
                          className="w-full px-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all placeholder:text-gray-400"
                          style={{ color: "#111827", caretColor: "#111827" }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="block text-[12px] font-[600] text-[#0a0a0a] mb-1.5">
                          Contact Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter phone number"
                          value={leadEditModal.lead.contact_number ?? leadEditModal.lead.phone ?? ""}
                          onChange={(e) => setLeadEditModal((s) => ({ ...s, lead: { ...s.lead, contact_number: e.target.value, phone: e.target.value } }))}
                          className="w-full px-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all placeholder:text-gray-400"
                          style={{ color: "#111827", caretColor: "#111827" }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="block text-[12px] font-[600] text-[#0a0a0a] mb-1.5">
                          Company <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter company name"
                          value={leadEditModal.lead.company ?? ""}
                          onChange={(e) => setLeadEditModal((s) => ({ ...s, lead: { ...s.lead, company: e.target.value } }))}
                          className="w-full px-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all placeholder:text-gray-400"
                          style={{ color: "#111827", caretColor: "#111827" }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="block text-[12px] font-[600] text-[#0a0a0a] mb-1.5">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter job title"
                          value={leadEditModal.lead.title ?? ""}
                          onChange={(e) => setLeadEditModal((s) => ({ ...s, lead: { ...s.lead, title: e.target.value } }))}
                          className="w-full px-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all placeholder:text-gray-400"
                          style={{ color: "#111827", caretColor: "#111827" }}
                        />
                      </div>
                    </div>

                    {/* Optional fields section */}
                    <div className="mt-5 pt-4 border-t border-gray-200">
                      <p className="text-[11px] font-[600] text-gray-400 mb-3.5">Additional Information (Optional)</p>
                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="flex flex-col">
                          <label className="block text-[12px] font-[600] text-[#0a0a0a] mb-1.5">Notes</label>
                          <textarea
                            rows={3}
                            placeholder="Add notes..."
                            value={leadEditModal.lead.notes ?? ""}
                            onChange={(e) => setLeadEditModal((s) => ({ ...s, lead: { ...s.lead, notes: e.target.value } }))}
                            className="w-full px-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all placeholder:text-gray-400 resize-none"
                            style={{ color: "#111827", caretColor: "#111827" }}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="block text-[12px] font-[600] text-[#0a0a0a] mb-1.5">Record Prompt</label>
                          <textarea
                            rows={3}
                            placeholder="Add record prompt..."
                            value={leadEditModal.lead.record_prompt ?? ""}
                            onChange={(e) => setLeadEditModal((s) => ({ ...s, lead: { ...s.lead, record_prompt: e.target.value } }))}
                            className="w-full px-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all placeholder:text-gray-400 resize-none"
                            style={{ color: "#111827", caretColor: "#111827" }}
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100 shrink-0">
                  <button
                    type="button"
                    onClick={closeLeadEditor}
                    className="px-4 py-2 text-[13px] font-[500] text-gray-600 hover:text-gray-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={leadEditModal.saving}
                    onClick={saveLeadEditor}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-[13px] font-[600] text-white hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {leadEditModal.saving ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      );
    }

    /* ─── CALL HISTORY ─── */
    if (activeTab === "CALL") {
      const normalizeTaskName = (task) => {
        if (typeof task === "string") return task.trim();
        if (!task || typeof task !== "object") return "";
        return String(
          task.task_name ??
          task.name ??
          task.title ??
          task.task ??
          task.description ??
          "",
        ).trim();
      };

      const parseBooleanLike = (value) => {
        if (typeof value === "boolean") return value;
        if (typeof value === "number") return value === 1;
        const normalized = String(value ?? "").trim().toLowerCase();
        if (["true", "1", "yes", "y"].includes(normalized)) return true;
        if (["false", "0", "no", "n", ""].includes(normalized)) return false;
        return Boolean(value);
      };

      const extractTaskNames = (source) => {
        const rawTasks = source?.tasksList ?? source?.tasks_list ?? source?.task_list ?? source?.tasks ?? [];
        if (Array.isArray(rawTasks)) {
          return rawTasks.map(normalizeTaskName).filter(Boolean);
        }
        if (typeof rawTasks === "string") {
          const raw = rawTasks.trim();
          if (!raw) return [];
          if ((raw.startsWith("[") && raw.endsWith("]")) || (raw.startsWith("{") && raw.endsWith("}"))) {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) return parsed.map(normalizeTaskName).filter(Boolean);
            } catch {
              // Fallback to text splitting when payload is not valid JSON.
            }
          }
          return raw
            .split(/\r?\n|,/)
            .map((item) => item.trim())
            .filter(Boolean);
        }
        return [];
      };

      const normalizeCallStatus = (row) => {
        const raw = String(row.call_status ?? row.status ?? "")
          .toUpperCase()
          .replace(/[-_]/g, " ")
          .trim();
        if (raw === "COMPLETED") return "COMPLETED";
        if (["VOICE MAIL", "VOICEMAIL"].includes(raw)) return "VOICE MAIL";
        if (["NO ANSWER", "NOT ANSWERED"].includes(raw)) return "NO ANSWER";
        if (["SKIPPED", "SKIP"].includes(raw)) return "SKIPPED";
        if (["FAILED", "TIMEOUT", "ERROR", "CANCELLED"].includes(raw)) return "FAILED";
        if (raw === "BUSY") return "BUSY";
        return raw || "UNKNOWN";
      };

      const callHistoryRows = Array.isArray(callHistory)
        ? callHistory
        : Array.isArray(callHistory?.calls)
          ? callHistory.calls
          : Array.isArray(callHistory?.data)
            ? callHistory.data
            : [];

      const callHistory_data = callHistoryRows.map((row) => {
        const duration = Number(row.call_duration ?? row.duration ?? 0);
        const tasksList = extractTaskNames(row);
        const apiTaskCount = Number(
          row.tasks_count ??
          row.task_count ??
          row.total_tasks ??
          row.tasksCount ??
          0,
        );
        const safeTaskCount = Number.isFinite(apiTaskCount) ? apiTaskCount : 0;
        return {
          ...row,
          name: row.lead_name ?? row.name ?? "—",
          phone: row.phone_number ?? row.phone ?? "—",
          company: row.company_name ?? row.company ?? "—",
          dateTime:
            row.call_datetime ??
            row.dateTime ??
            [row.call_date, row.call_time].filter(Boolean).join("\n") ??
            "—",
          duration,
          status: normalizeCallStatus(row),
          meeting: parseBooleanLike(row.meeting_scheduled ?? row.meeting ?? row.meeting_booked),
          tasksList,
          tasksCount: Math.max(safeTaskCount, tasksList.length),
          summary: row.call_summary ?? row.summary ?? "",
          transcript: row.call_transcript ?? row.transcript ?? "",
        };
      });
      const defaultCallStatuses = [
        "COMPLETED",
        "VOICE MAIL",
        "NO ANSWER",
        "FAILED",
        "SKIPPED",
        "BUSY",
      ];
      const dynamicCallStatuses = [...new Set(callHistory_data.map((r) => r.status).filter(Boolean))]
        .filter((s) => !defaultCallStatuses.includes(s));
      const callStatuses = [
        "All Status",
        ...defaultCallStatuses,
        ...dynamicCallStatuses,
      ];
      const callRows = callHistory_data.filter((r) => {
        const ms =
          r.name?.toLowerCase().includes(callSearch.toLowerCase()) ||
          r.company?.toLowerCase().includes(callSearch.toLowerCase());
        const ss = callStatus === "All Status" || r.status === callStatus;
        return ms && ss;
      });
      const totalCalls = callHistory_data.length;
      const totalTaskFromRows = callHistory_data.reduce(
        (sum, r) =>
          sum + Number(
            r.tasksCount ??
            r.tasks_count ??
            r.task_count ??
            r.total_tasks ??
            (Array.isArray(r.tasksList) ? r.tasksList.length : 0) ??
            0,
          ),
        0,
      );
      const totalTask = Number(callHistoryTotalTasks ?? 0) || totalTaskFromRows;
      const completed = callHistory_data.filter(
        (r) => r.status === "COMPLETED",
      ).length;
      
      const voiceMail = callHistory_data.filter(
        (r) => r.status === "VOICE MAIL",
      ).length;
      const noAnswer = callHistory_data.filter(
        (r) => ["NO ANSWER", "NO-ANSWER", "NO_ANSWER"].includes((r.status ?? "").toUpperCase().replace(/-/g, " ").replace(/_/g, " ")),
      ).length;
      const failed = callHistory_data.filter(
        (r) => ["FAILED", "TIMEOUT", "ERROR", "CANCELLED"].includes((r.status ?? "").toUpperCase()),
      ).length;
      const skipped = callHistory_data.filter(
        (r) => (r.status ?? "").toUpperCase() === "SKIPPED",
      ).length;
      const busy = callHistory_data.filter(
        (r) => (r.status ?? "").toUpperCase() === "BUSY",
      ).length;
      const meetingBooked = callHistory_data.filter((r) => r.meeting).length;
      const avgCallDurationMinutes =
        totalCalls > 0
          ? callHistory_data.reduce(
              (s, r) => s + parseFloat(r.duration || 0),
              0,
            ) / totalCalls
          : 0;
      const avgCallDuration = formatCallDuration(avgCallDurationMinutes);
      const statusBarData = [
        { name: "Completed", value: completed, fill: "#1d4ed8" },
        { name: "Voice Mail", value: voiceMail, fill: "#3b82f6" },
        { name: "No Answer", value: noAnswer, fill: "#93c5fd" },
        { name: "Failed", value: failed, fill: "#ef4444" },
        { name: "Skipped", value: skipped, fill: "#94a3b8" },
        { name: "Busy", value: busy, fill: "#f59e0b" },
      ];
      const meetingDonut = [
        { name: "Meeting Booked", value: meetingBooked, color: "#22c55e" },
        {
          name: "No Meeting",
          value: totalCalls - meetingBooked,
          color: "#f59e0b",
        },
      ].filter((s) => s.value > 0);
      return (
        <main className="min-h-screen bg-[#f4f5f7] p-4">
          <div className="mb-5">
            <button
              type="button"
              onClick={backToCampaignActivities}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Campaign Activities
            </button>
          </div>
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-[17px] font-[700] text-[#0a0a0a]">
                Call History
              </h1>
              <p className="text-[13px] text-gray-500 mt-0.5">
                Detailed call logs and transcripts
              </p>
            </div>
            <button
              type="button"
              onClick={handleHistoryRefresh}
              disabled={histRefreshing || callHistoryLoading}
              className="mt-0.5 rounded-xl border border-gray-200 bg-white p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${histRefreshing || callHistoryLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
          {/* Show full-page loader only on initial empty fetch — not on manual refresh */}
          {callHistoryLoading && (callHistory ?? []).length === 0 ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <RefreshCw className="h-5 w-5 text-violet-400 animate-spin" />
              <p className="text-[13px] text-gray-400">Loading call history…</p>
            </div>
          ) : (
            <>
              <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
                {[
                  {
                    label: "Total Calls",
                    value: totalCalls || c.total_calls || 0,
                    sub: "all calls",
                    color: "text-blue-600",
                    ring: "ring-blue-200",
                  },
                  {
                    label: "Total Tasks",
                    value: totalTask,
                    sub: "tasks created",
                    color: "text-blue-600",
                    ring: "ring-blue-200",
                  },
                  {
                    label: "Meetings",
                    value: meetingBooked,
                    sub: "booked",
                    color: "text-blue-600",
                    ring: "ring-blue-200",
                  },
                  {
                    label: "Avg Call Duration",
                    value: avgCallDuration,
                    sub: "per call",
                    color: "text-blue-600",
                    ring: "ring-blue-200",
                  },
                ].map((k) => (
                  <article
                    key={k.label}
                    className={`rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col gap-0.5 ring-1 ${k.ring}`}
                    style={{ background: k.bg }}
                  >
                    <p className="text-[10px] font-[600] uppercase tracking-wider text-gray-400">
                      {k.label}
                    </p>
                    <p
                      className={`text-[28px] font-[800] leading-none ${k.color}`}>
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
                      <p className="text-[12px] text-gray-400 mb-3">
                        Calls that led to a meeting
                      </p>
                      <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                        <ResponsiveContainer width={170} height={170}>
                          <PieChart>
                            <Pie
                              data={meetingDonut}
                              cx="50%"
                              cy="50%"
                              innerRadius={48}
                              outerRadius={74}
                              dataKey="value"
                              paddingAngle={0}
                              labelLine={false}
                            >
                              {meetingDonut.map((s, i) => (
                                <Cell key={i} fill={s.color} stroke="none" strokeWidth={0} />
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
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="text-center">
                            <p className="text-[22px] font-[800] leading-none text-gray-900">{meetingBooked}</p>
                            <p className="mt-0.5 text-[10px] font-[700] text-gray-400 uppercase tracking-wide">
                              {totalCalls > 0 ? `${Math.round((meetingBooked / totalCalls) * 100)}%` : "0%"}
                            </p>
                          </div>
                        </div>
                        </div>
                        <div className="space-y-2 w-full">
                          {meetingDonut.map((s) => (
                            <div
                              key={s.name}
                              className="flex items-center justify-between rounded-lg bg-gray-50/70 px-2.5 py-1.5"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-3 h-3 rounded-full shrink-0"
                                  style={{ background: s.color }}
                                />
                                <span className="text-[11px] font-[600] text-gray-700">
                                  {s.name}
                                </span>
                              </div>
                              <span className="text-[12px] font-[800] text-gray-900">
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
                <div className="">
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
                          // "Duration (min)",
                          "Status",
                          "Tasks",         
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
                            colSpan={9}
                            className="px-4 py-6 text-center text-[13px] text-gray-400"
                          >
                            No call records available.
                          </td>
                        </tr>
                      ) : (
                        callRows.map((row, idx) => (
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
                            <td className="px-3 py-3 text-[12px] text-gray-700">
                              {row.company}
                            </td>
                            <td className="px-3 py-3 text-[11px] text-gray-600 whitespace-pre-line leading-tight">
                              {formatTableDateTime(row.dateTime)}
                            </td>
                            {/* <td className="px-3 py-3 text-[12px] text-gray-700 text-center">
                              {Number.isFinite(Number(row.duration)) ? Number(row.duration).toFixed(2) : "0.00"}
                            </td> */}
                            <td className="px-3 py-3">
                              {row.status === "SKIPPED" && (row.skip_reason || row.skipReason) ? (
                                <div className="relative group inline-block">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-[700] cursor-pointer ${CALL_STATUS_STYLE[row.status] ?? "bg-gray-100 text-gray-600"}`}
                                  >
                                    {row.status}
                                  </span>
                                  <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max max-w-[240px] rounded-lg bg-gray-800 px-3 py-2 text-[11px] text-white shadow-lg pointer-events-none">
                                    <p className="font-[600] mb-0.5">Skip Reason</p>
                                    <p className="font-[400] text-gray-300 leading-relaxed">{normalizeSkipReason(row.skip_reason || row.skipReason)}</p>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                                  </div>
                                </div>
                              ) : (
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-[700] ${CALL_STATUS_STYLE[row.status] ?? "bg-gray-100 text-gray-600"}`}
                                >
                                  {row.status}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3">
                              {(() => {
                                const taskNames = Array.isArray(row.tasksList) ? row.tasksList : extractTaskNames(row);
                                const taskCount = Math.max(Number(row.tasksCount ?? row.tasks_count ?? 0) || 0, taskNames.length);
                                const hasTasks = taskCount > 0;
                                return (
                                  <div className="relative group inline-block">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border cursor-default ${
                                      hasTasks
                                        ? "font-[700] bg-blue-50 text-blue-700 border-blue-200"
                                        : "font-[600] bg-gray-100 text-gray-500 border-gray-200"
                                    }`}>
                                      {taskCount} {taskCount > 1 ? "s" : ""}
                                    </span>
                                    {hasTasks && (
                                      <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max max-w-[320px] rounded-lg bg-gray-800 px-3 py-2 text-[11px] text-white shadow-lg pointer-events-none">
                                        <p className="font-[600] mb-1">Task List</p>
                                        {taskNames.length > 0 ? (
                                          <ul className="space-y-0.5 text-gray-200">
                                            {taskNames.map((task, ti) => (
                                              <li key={ti}>{`${ti + 1}. ${task}`}</li>
                                            ))}
                                          </ul>
                                        ) : (
                                          <p className="text-gray-300">No task names available</p>
                                        )}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
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
                    {meetingBooked} meetings booked
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
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
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
                <div className="p-6 space-y-4 overflow-y-auto">
                  {(() => {
                    const transcriptTaskNames = extractTaskNames(transcript);
                    const transcriptTaskCount = Math.max(
                      Number(transcript.tasksCount ?? transcript.tasks_count ?? 0) || 0,
                      transcriptTaskNames.length,
                    );
                    return (
                      <>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      ["Lead Name", transcript.name],
                      ["Company", transcript.company],
                      ["Date & Time", transcript.dateTime],
                      ["Duration", formatCallDuration(transcript.duration)],
                      ["Tasks", `${transcriptTaskCount} total`],
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
                  {transcriptTaskNames.length > 0 && (
                    <div>
                      <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 mb-3">
                        <p className="text-[9px] font-[700] uppercase tracking-widest text-violet-500 mb-1.5">
                          Follow up Tasks &nbsp;<span className="bg-violet-200 text-violet-700 rounded-full px-1.5 py-px text-[9px]">{transcriptTaskNames.length}</span>
                        </p>
                        <ul className="space-y-0.5">
                          {transcriptTaskNames.map((task, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-[11px] text-violet-900">
                              <span className="mt-0.5 shrink-0 w-3.5 h-3.5 rounded bg-violet-400 text-white text-[8px] font-[800] flex items-center justify-center">{idx + 1}</span>
                              <span className="leading-snug">{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                    <p className="text-[12px] font-[600] text-gray-700 mb-2">
                      Transcript
                    </p>
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      {transcript.transcript ? (
                        <p className="text-[12px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                          {transcript.transcript}
                        </p>
                      ) : transcript.summary ? (
                        <>
                          <p className="text-[10px] font-[600] uppercase tracking-wider text-gray-400 mb-1.5">Call Summary</p>
                          <p className="text-[12px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {transcript.summary}
                          </p>
                        </>
                      ) : (
                        <p className="text-[12px] text-gray-400 italic">
                          No transcript available for this call.
                        </p>
                      )}
                    </div>
                  </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </main>
      );
    }

    /* ─── EMAIL HISTORY ─── */
    if (activeTab === "EMAIL") {
      // Handle API response structure: {emails: [...], total_tasks: 2, total_count: 1, total_replied: 1}
      // OR if already an array of emails
      let emailsArray = [];
      let rootTotalTasks = 0;
      let rootTotalCount = 0;
      let rootTotalReplied = 0;
      
      if (Array.isArray(emailHistory)) {
        emailsArray = emailHistory;
        // Redux stores email history rows as array; totals are kept in sibling fields.
        rootTotalTasks = Number(emailHistoryTotalTasks ?? 0) || 0;
        rootTotalCount = Number(emailHistoryTotalCount ?? emailsArray.length) || emailsArray.length;
        rootTotalReplied = Number(emailHistoryTotalReplied ?? 0) || emailsArray.filter(e => e.total_replies > 0 || e.status === "REPLIED").length;
      } else if (emailHistory && typeof emailHistory === 'object') {
        // It's an API response object with emails, total_tasks, etc
        emailsArray = emailHistory.emails ?? [];
        rootTotalTasks = Number(emailHistory.total_tasks ?? 0) || 0;
        rootTotalCount = Number(emailHistory.total_count ?? 0) || 0;
        rootTotalReplied = Number(emailHistory.total_replied ?? 0) || 0;
      }
      
      const emailHistoryData = emailsArray.map((r) => {
        const normalizedTasks = normalizeFollowUpTasks(r.follow_up_tasks);
        return ({
        ...r,
        id: r.id,
        name: r.name ?? r.lead_name ?? "",
        email: r.email ?? r.to_email ?? r.emailAddr ?? "",
        emailAddr: r.email ?? r.to_email ?? r.emailAddr ?? "",
        company: r.company ?? r.company_name ?? "",
        subject: r.subject ?? r.email_subject ?? "",
        dateTime: r.dateTime ?? r.sent_at,
        status: r.status ?? "UNKNOWN",
        meeting: r.meeting ?? r.meeting_requested ?? !!r.meeting_link ?? false,
        follow_up_tasks: normalizedTasks,
        skippable: !!r.skippable,
        skip_reason: r.skip_reason ?? r.skipReason ?? "",
        hasReply: r.hasReply ?? (!!r.replied_to_message_id || Number(r.total_replies ?? 0) > 0),
        total_replies: r.total_replies ?? 0,
        total_tasks: Math.max(Number(r.total_tasks) || 0, normalizedTasks.length),
        replies: r.replies,
        replyData: r.replyData,
        repliedToMessageId: r.replied_to_message_id,
        clicked: r.clicked ?? false,
      });
      });
      const derivedTotalTasks = emailHistoryData.reduce((sum, row) => {
        const taskCount = Number(row.total_tasks ?? row.follow_up_tasks?.length ?? 0) || 0;
        return sum + taskCount;
      }, 0);
      const emailStatuses = ["All Status", "SENT", "FAILED", "SKIPPED", "REPLIED"];
      const emailRows = emailHistoryData.filter((r) => {
        // Search filter: match if name or company contains search term (or search is empty)
        const nameMatch = (r.name ?? "").toLowerCase().includes(emailSearch.toLowerCase());
        const companyMatch = (r.company ?? "").toLowerCase().includes(emailSearch.toLowerCase());
        const ms = emailSearch === "" || nameMatch || companyMatch;
        
        // Status filter logic
        let ss = false;
        if (emailStatus === "All Status") {
          ss = true;
        } else if (emailStatus === "REPLIED") {
          const statusUpper = String(r.status ?? "").toUpperCase();
          ss = !!r.hasReply || statusUpper === "REPLIED" || Number(r.total_replies ?? 0) > 0;
        } else if (emailStatus === "SKIPPED") {
          ss = !!r.skippable || !!r.skip_reason;
        } else if (emailStatus === "SENT") {
          const statusUpper = String(r.status ?? "").toUpperCase();
          ss = ["SENT", "REPLIED"].includes(statusUpper) && !r.skippable && !r.skip_reason;
        } else if (emailStatus === "FAILED") {
          ss = r.status === "FAILED" && !r.skippable && !r.skip_reason;
        } else {
          ss = r.status === emailStatus && !r.skippable && !r.skip_reason;
        }
        
        return ms && ss;
      });
      // ── Email Stats derived from email history data ──
      const isEmailSentStatus = (status) => {
        const s = String(status ?? "").trim().toUpperCase();
        return ["SENT", "DELIVERED", "OPENED", "CLICKED", "REPLIED"].includes(s);
      };
      const ehSent     = emailHistoryData.filter((r) => isEmailSentStatus(r.status)).length;
      const ehNotSentTotal = emailHistoryData.filter((r) => r.status === "NOT_SENT").length;
      const ehFailed   = emailHistoryData.filter((r) => r.status === "FAILED").length;
      const ehPending  = emailHistoryData.filter((r) => r.status === "PENDING").length;
      const ehClicked  = emailHistoryData.filter((r) => r.clicked).length;
      const ehOpened   = emailHistoryData.filter((r) => ["OPENED", "CLICKED"].includes(String(r.status ?? "").toUpperCase())).length;
      const ehBounced  = emailHistoryData.filter((r) => String(r.status ?? "").toUpperCase() === "BOUNCED").length;
      const ehMeetings = emailHistoryData.filter((r) => r.meeting).length;
      const ehSkipped  = emailHistoryData.filter((r) => r.skippable || !!r.skip_reason).length;
      const ehNotSentOther = emailHistoryData.filter(
        (r) => r.status === "NOT_SENT" && !(r.skippable || !!r.skip_reason),
      ).length;
      const ehReplies  = emailHistoryData.filter((r) => {
        const statusUpper = String(r.status ?? "").toUpperCase();
        return !!r.hasReply || statusUpper === "REPLIED" || Number(r.total_replies ?? 0) > 0;
      }).length;
      const ehTotal    = emailHistoryData.length;
      // Merge history + /email-stats/ API values so paginated history does not hide counts.
      const es = emailStats ?? {};
      const maxNum = (...vals) => vals.reduce((max, v) => {
        const n = Number(v);
        return Number.isFinite(n) ? Math.max(max, n) : max;
      }, 0);
      const mergeCount = (historyCount, ...apiVals) => Math.max(Number(historyCount) || 0, maxNum(...apiVals));

      const statSent = mergeCount(ehSent, es.emails_sent, es.total_sent, es.sent, es.sent_count, c.emailsSent);
      const statFailed = mergeCount(ehFailed, es.emails_failed, es.failed, es.failed_count, c.emailsFailed);
      const statPending = mergeCount(ehPending, es.emails_pending, es.pending, es.pending_count, c.emailsPending);
      const statClicked = mergeCount(ehClicked, es.emails_clicked, es.clicked, es.clicked_count);
      const statMeetings = mergeCount(ehMeetings, es.meetings_booked, es.meetings, es.meeting_count, c.meetings);
      const statSkipped = mergeCount(ehSkipped, es.emails_skipped, es.skipped, es.skipped_count);
      const statNotSentTotal = mergeCount(ehNotSentTotal, es.emails_not_sent, es.not_sent, es.not_sent_count);
      const statNotSentOther = Math.max(mergeCount(ehNotSentOther, es.emails_not_sent_other, es.not_sent_other), statNotSentTotal - statSkipped, 0);
      const statTotalEmails = mergeCount(
        ehTotal,
        es.total_emails,
        es.total,
        es.emails_total,
        es.total_count,
        statSent + statNotSentTotal + statFailed + statPending + statSkipped,
      );
      const statOpened  = mergeCount(ehOpened, es.emails_opened, es.opened, es.opened_count);
      const statOpenRate= es.open_rate != null
        ? Math.round(Number(es.open_rate))
        : (statSent > 0 ? Math.round((statOpened / statSent) * 100) : 0);

      const analyticsCampaign = (() => {
        const d = emailCardAnalytics;
        if (!d) return null;
        if (!Array.isArray(d) && (d?.campaign_id != null || d?.id != null)) {
          return d;
        }
        const rows = Array.isArray(d?.campaigns)
          ? d.campaigns
          : Array.isArray(d?.data?.campaigns)
            ? d.data.campaigns
            : Array.isArray(d?.data)
              ? d.data
              : Array.isArray(d)
                ? d
                : [];
        if (!rows.length) return null;
        return rows.find(
          (r) =>
            String(r?.campaign_id ?? r?.id ?? "") === String(c.id) ||
            String(r?.campaign_name ?? "") === String(c.name ?? ""),
        ) ?? null;
      })();
      const isSmtpCampaign = !!(c?.isSmtp || c?.is_smtp);
      const smtpSummary = emailCardAnalytics?.summary ?? emailCardAnalytics?.data?.summary ?? null;
      const smtpMetricValue = (...vals) => {
        for (const v of vals) {
          const n = Number(v);
          if (Number.isFinite(n)) return n;
        }
        return 0;
      };
      const smtpTotals = {
        total_sent: smtpMetricValue(
          analyticsCampaign?.total_sent,
          analyticsCampaign?.emails_sent,
          smtpSummary?.total_sent,
          smtpSummary?.emails_sent,
          statSent,
        ),
        delivered: smtpMetricValue(
          analyticsCampaign?.delivered,
          smtpSummary?.total_delivered,
          smtpSummary?.delivered,
          statSent,
        ),
        opened: smtpMetricValue(
          analyticsCampaign?.opened,
          smtpSummary?.total_opened,
          smtpSummary?.opened,
          statOpened,
        ),
        clicked: smtpMetricValue(
          analyticsCampaign?.clicked,
          smtpSummary?.total_clicked,
          smtpSummary?.clicked,
          statClicked,
        ),
        bounced: smtpMetricValue(
          analyticsCampaign?.bounced,
          analyticsCampaign?.bounce_count,
          smtpSummary?.total_bounced,
          smtpSummary?.bounced,
          ehBounced,
        ),
        complained: smtpMetricValue(
          analyticsCampaign?.complained,
          analyticsCampaign?.complaint_count,
          analyticsCampaign?.spam_complaints,
          smtpSummary?.complained,
          smtpSummary?.complaint_count,
          smtpSummary?.spam_complaints,
        ),
        unsubscribed: smtpMetricValue(
          analyticsCampaign?.unsubscribed,
          analyticsCampaign?.unsubscribe_count,
          analyticsCampaign?.opt_outs,
          smtpSummary?.unsubscribed,
          smtpSummary?.unsubscribe_count,
          smtpSummary?.opt_outs,
        ),
        spam: smtpMetricValue(
          analyticsCampaign?.spam,
          analyticsCampaign?.spam_count,
          analyticsCampaign?.marked_as_spam,
          analyticsCampaign?.spam_complaints,
          smtpSummary?.spam,
          smtpSummary?.spam_count,
          smtpSummary?.marked_as_spam,
        ),
      };
      const useSmtpCards = isSmtpCampaign && !!analyticsCampaign;
      const cardSent = useSmtpCards
        ? mergeCount(
            statSent,
            analyticsCampaign?.emails_sent_count,
            analyticsCampaign?.emails_sent,
            analyticsCampaign?.total_sent,
            analyticsCampaign?.sent,
          )
        : statSent;
      const cardFailed = useSmtpCards
        ? mergeCount(
            statFailed,
            analyticsCampaign?.emails_failed_count,
            analyticsCampaign?.emails_failed,
            analyticsCampaign?.failed,
          )
        : statFailed;
      const cardSkipped = useSmtpCards
        ? mergeCount(
            statSkipped,
            analyticsCampaign?.emails_skipped_count,
            analyticsCampaign?.emails_skipped,
            analyticsCampaign?.skipped,
          )
        : statSkipped;
      const apiTotalLeads = rootTotalCount || Number(emailHistoryTotalCount ?? 0) || 0;
      const apiTotalReplied = rootTotalReplied || Number(emailHistoryTotalReplied ?? 0) || 0;
      const cardTotalLeads = apiTotalLeads;
      const cardReplies = apiTotalReplied;
      // Use root-level total_tasks from API (which is 2 in your case)
      const cardTotalTasks = rootTotalTasks > 0
        ? rootTotalTasks
        : (Number(emailStats?.total_tasks ?? emailStats?.tasks_count ?? 0) || derivedTotalTasks);
      const funnelData = [
        { stage: "Total Leads",   value: cardTotalLeads, fill: "#6366f1" },
        { stage: "Delivered",     value: cardSent,       fill: "#1d4ed8" },
        { stage: "Skipped",       value: cardSkipped,    fill: "#93c5fd" },
        { stage: "Failed",        value: cardFailed,     fill: "#3b82f6" },
        { stage: "Leads Engaged", value: cardReplies,    fill: "#16a34a" },
      ];
      const statusDonut = [
        { name: "Total Leads",   value: cardTotalLeads, color: "#6366f1" },
        { name: "Delivered",     value: cardSent,       color: "#1d4ed8" },
        { name: "Skipped",       value: cardSkipped,    color: "#93c5fd" },
        { name: "Failed",        value: cardFailed,     color: "#3b82f6" },
        { name: "Leads Engaged", value: cardReplies,    color: "#16a34a" },
      ];
      return (
        <main className="min-h-screen bg-[#f4f5f7] p-4">
          <div className="mb-5">
            <button
              type="button"
              onClick={backToCampaignActivities}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Campaign Activities
            </button>
          </div>
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-[17px] font-[700] text-[#0a0a0a]">
                Email History
              </h1>
              <p className="text-[13px] text-gray-500 mt-0.5">
                Track all email campaign activity and responses
              </p>
            </div>
            <button
              type="button"
              onClick={handleHistoryRefresh}
              disabled={histRefreshing || emailHistoryLoading}
              className="mt-0.5 rounded-xl border border-gray-200 bg-white p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${histRefreshing || emailHistoryLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* KPI strip — cards are clickable to filter the table */}
          <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              {
                label: "Total Leads",
                value: emailHistoryLoading ? "…" : cardTotalLeads,
                icon: Users,
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-100",
                filter: "All Status",
              },
                 {
                label: "Total Tasks",
                value: emailHistoryLoading ? "…" : cardTotalTasks,
                icon: CheckCircle2,
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-100",
              },
              {
                label: "Delivered",
                value: (emailHistoryLoading || emailCardAnalyticsLoading) ? "…" : cardSent,
                icon: Mail,
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-100",
                filter: "SENT",
              },
              {
                label: "Skipped",
                value: (emailHistoryLoading || emailCardAnalyticsLoading) ? "…" : cardSkipped,
                icon: SkipForward,
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-100",
                filter: "SKIPPED",
              },
              {
                label: "Failed",
                value: (emailHistoryLoading || emailCardAnalyticsLoading) ? "…" : cardFailed,
                icon: MinusCircle,
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-100",
                filter: "FAILED",
              },
              {
                label: "Leads Engaged",
                value: emailHistoryLoading ? "…" : cardReplies,
                icon: TrendingUp,
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-100",
                filter: "REPLIED",
              },
            ].map((k) => {
              const isActive = emailStatus === k.filter;
              const Icon = k.icon;
              return (
                <article
                  key={k.label}
                  role="button"
                  tabIndex={0}
                  onClick={() => setEmailStatus(isActive ? "All Status" : k.filter)}
                  onKeyDown={(e) => e.key === "Enter" && setEmailStatus(isActive ? "All Status" : k.filter)}
                  className={`bg-white rounded-2xl border ${k.border} shadow-sm p-4 flex items-center gap-3 cursor-pointer transition-all select-none
                    ${isActive
                      ? "ring-2 ring-blue-300 border-blue-200 shadow-md"
                      : "hover:shadow-md hover:border-blue-200"
                    }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${k.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${k.color}`} />
                  </div>
                  <div>
                    <p className={`text-[22px] font-[800] ${k.color}`}>
                      {k.value}
                    </p>
                    <p className="text-[11px] text-gray-400 font-[500]">{k.label}</p>
                  </div>
                </article>
              );
            })}
          </section>

          {/* Charts */}
          <section className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* SMTP Analytics Bar Chart */}
            {isSmtpCampaign && (
            <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[15px] font-[700] text-gray-900">SMTP Analytics</h3>
                  <p className="text-[12px] text-gray-400 mt-0.5">Opened · Clicked · Bounced breakdown</p>
                </div>
                <div className="flex items-center gap-3">
                  {[{label:"Opened",color:"#f59e0b"},{label:"Clicked",color:"#10b981"},{label:"Bounced",color:"#ef4444"}].map((l) => (
                    <span key={l.label} className="flex items-center gap-1.5 text-[11px] font-[600] text-gray-500">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{background:l.color}} />
                      {l.label}
                    </span>
                  ))}
                </div>
              </div>
              {(() => {
                const smtpChartData = [
                  { stage: "Opened",       value: smtpTotals.opened },
                  { stage: "Clicked",      value: smtpTotals.clicked },
                  { stage: "Bounced",      value: smtpTotals.bounced },
                  { stage: "Complained",   value: smtpTotals.complained },
                  { stage: "Unsubscribed", value: smtpTotals.unsubscribed },
                ];
                const smtpColors = [
                  "#f59e0b",
                  "#10b981",
                  "#ef4444",
                  "#f43f5e",
                  "#6366f1",
                ];
                const allZero = smtpChartData.every((d) => !d.value);

                if (allZero) {
                  return (
                    <div className="flex flex-col items-center justify-center h-[180px] text-gray-400">
                      <svg className="h-10 w-10 mb-2 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                      </svg>
                      <p className="text-[13px] font-[500]">No SMTP data yet</p>
                    </div>
                  );
                }

                return (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart
                      data={smtpChartData}
                      barSize={38}
                      margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                    >
                      <defs>
                        {smtpColors.map((c, i) => (
                          <linearGradient key={i} id={`smtpG${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={c} stopOpacity={1}/>
                            <stop offset="100%" stopColor={c} stopOpacity={0.45}/>
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="stage" tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        cursor={{ fill: "#f8fafc", radius: 6 }}
                        contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }}
                      />
                      <Bar dataKey="value" name="Count" radius={[8, 8, 0, 0]}>
                        {smtpColors.map((_, i) => (
                          <Cell key={i} fill={`url(#smtpG${i})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>
            )}

            {/* Email Status Split */}
            <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 flex flex-col overflow-hidden ${isSmtpCampaign ? "" : "md:col-span-3"}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[15px] font-[700] text-gray-900">Status Split</h3>
                  <p className="text-[12px] text-gray-400 mt-0.5">Distribution by outcome</p>
                </div>
              </div>
              <div className={`flex-1 flex items-center gap-6 ${isSmtpCampaign ? "flex-col" : "flex-col md:flex-row"}`}>
                <div className={`relative shrink-0 ${isSmtpCampaign ? "w-[180px] h-[180px]" : "w-[200px] h-[200px]"}`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDonut}
                        cx="50%"
                        cy="50%"
                        innerRadius={isSmtpCampaign ? 45 : 55}
                        outerRadius={isSmtpCampaign ? 80 : 90}
                        dataKey="value"
                        paddingAngle={0}
                        labelLine={false}
                      >
                        {statusDonut.map((s, i) => (
                          <Cell key={i} fill={s.color} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p className="text-[24px] font-[800] text-gray-900 leading-none">{cardTotalLeads}</p>
                      <p className="text-[9px] font-[700] text-gray-400 uppercase tracking-wide mt-0.5">Total Leads</p>
                    </div>
                  </div>
                </div>
                <div className="w-full flex-1 space-y-1.5">
                  {statusDonut.map((s) => (
                    <div key={s.name} className="flex items-center justify-between rounded-lg px-2.5 py-1.5 bg-gray-50/70">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
                        <span className="text-[12px] text-gray-700 font-[600] truncate">{s.name}</span>
                      </div>
                      <span className="text-[13px] font-[800] text-gray-900 shrink-0 ml-2">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Email Deliverability Chart */}
          {/* <section className="mb-5 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-[14px] font-[700] text-gray-900">Email Deliverability</h3>
                <p className="text-[12px] text-gray-400 mt-0.5">Inbox vs spam</p>
              </div>
              {(() => {
                const { total: totalVal } = getDeliverabilityCounts(emailDeliverabilityDashboard ?? {});
                return (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-[700] text-violet-600 bg-violet-50 border border-violet-100">
                    {emailDeliverabilityLoading ? "…" : `${totalVal} total`}
                  </span>
                );
              })()}
            </div>
            {(() => {
              const { inbox, spam, total } = getDeliverabilityCounts(emailDeliverabilityDashboard ?? {});
              const inboxPct = total > 0 ? Math.round((inbox / total) * 100) : 0;
              const spamPct = total > 0 ? Math.round((spam / total) * 100) : 0;

              if (emailDeliverabilityLoading) {
                return (
                  <div className="flex items-center justify-center py-16 text-gray-400 text-[13px]">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Loading deliverability...
                  </div>
                );
              }

              return (
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)] gap-6 items-center">
                    <div className="mx-auto">
                      <ResponsiveContainer width={260} height={230}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Inbox", value: inbox, color: "#22c55e" },
                              { name: "Spam", value: spam, color: "#ef4444" },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={62}
                            outerRadius={92}
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                            label={({ name, percent }) => `${name === "Inbox" ? "" : ""}${Math.round((percent ?? 0) * 100)}%`}
                            labelLine={false}
                          >
                            <Cell fill="#22c55e" />
                            <Cell fill="#ef4444" />
                          </Pie>
                          <Tooltip formatter={(value, name) => [`${value}`, name]} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="-mt-24 text-center pointer-events-none">
                        <p className="text-[24px] font-[800] text-gray-900 leading-none">{inbox}</p>
                        <p className="text-[12px] font-[700] text-gray-500 mt-1">Inbox ({inboxPct}%)</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {[{ name: "Inbox", value: inbox, pct: inboxPct, color: "#22c55e" }, { name: "Spam", value: spam, pct: spamPct, color: "#ef4444" }].map((row) => (
                        <div key={row.name}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="w-3.5 h-3.5 rounded-full" style={{ background: row.color }} />
                              <span className="text-[16px] font-[700] text-gray-800">{row.name}</span>
                            </div>
                            <span className="text-[30px] font-[800] text-gray-900 leading-none">{row.value} <span className="text-[18px] font-[700] text-gray-400">({row.pct}%)</span></span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${row.pct}%`, background: row.color }} />
                          </div>
                        </div>
                      ))}
                      {total === 0 && <p className="text-[12px] text-gray-400 italic">No deliverability data available.</p>}
                    </div>
                  </div>
                </div>
              );
            })()}
          </section> */}

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible">
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
            <div className="">
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
                      // "Clicked",
                      "Meeting",
                      "Tasks",
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
                        colSpan={10}
                        className="px-4 py-6 text-center text-[13px] text-gray-400"
                      >
                        No email records available.
                      </td>
                    </tr>
                  ) : (
                    emailRows.map((row, idx) => {
                      const emailValue = row.emailAddr ?? row.to_email ?? row.email ?? "—";
                      const atIdx = emailValue.indexOf("@");
                      const emailUser = atIdx > 0 ? emailValue.slice(0, atIdx) : emailValue;
                      const emailHost = atIdx > 0 ? `@${emailValue.slice(atIdx + 1)}` : "";
                      const displaySubject = getEmailSubjectLabel(row);
                      const hasReply = !!(row.hasReply || row.repliedToMessageId || row.replyData || (Array.isArray(row.replies) && row.replies.length));
                      return (
                      <tr
                        key={idx}
                        className={`${idx % 2 !== 0 ? "bg-gray-50/30" : ""}`}
                      >
                        <td className="px-3 py-3 text-[12px] font-[600] text-gray-800">
                          {row.name}
                        </td>
                        <td
                          className="px-3 py-3 text-[11px] text-gray-500 w-[180px]"
                          title={emailValue}
                        >
                          <div className="max-w-[170px] leading-tight">
                            <p className="truncate">{emailUser}</p>
                            {emailHost ? (
                              <p className="truncate text-[10px] text-gray-400 mt-0.5">{emailHost}</p>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-[12px] text-blue-600 font-[500]">
                          {row.company}
                        </td>
                        <td
                          className="px-3 py-3 text-[11px] text-gray-600"
                          title={row.subject}
                        >
                          {displaySubject}
                        </td>
                        <td className="px-3 py-3 text-[11px] text-gray-600 whitespace-pre-line leading-tight">
                          {formatTableDateTime(row.dateTime)}
                        </td>
                        <td className="px-3 py-3">
                          {row.skippable || !!row.skip_reason ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-[600] cursor-pointer ${EMAIL_STATUS_STYLE["SKIPPED"] ?? "bg-gray-100 text-gray-600"}`}
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setEmailTooltip({ kind: "skip", reason: normalizeSkipReason(row.skipReason || row.skip_reason), rect });
                              }}
                              onMouseLeave={() => setEmailTooltip(null)}
                            >
                              SKIPPED
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-60" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-[600] ${EMAIL_STATUS_STYLE[row.status] ?? "bg-gray-100 text-gray-600"}`}
                            >
                              {row.status}
                            </span>
                          )}
                        </td>
                        {/* <td className="px-3 py-3 text-[12px] text-gray-700">
                          {row.clicked ? "Yes" : "No"}
                        </td> */}
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-[600] border ${row.meeting ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}
                          >
                            {row.meeting ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {(() => {
                            const rawTasks = Array.isArray(row.follow_up_tasks) ? row.follow_up_tasks : [];
                            const taskNames = normalizeFollowUpTasks(rawTasks);
                            const taskCount = Math.max(Number(row.total_tasks) || 0, taskNames.length, rawTasks.length);
                            const hasTasks = taskCount > 0;
                            return (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border cursor-default ${
                                  hasTasks
                                    ? "font-[700] bg-blue-50 text-blue-700 border-blue-200"
                                    : "font-[600] bg-gray-100 text-gray-500 border-gray-200"
                                }`}
                                onMouseEnter={hasTasks ? (e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setEmailTooltip({ kind: "tasks", taskNames, taskCount, rect });
                                } : undefined}
                                onMouseLeave={hasTasks ? () => setEmailTooltip(null) : undefined}
                              >
                                {hasTasks ? `${taskCount} ${taskCount !== 1 ? "" : ""}` : "0 "}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleViewEmail(row, "thread")}
                              className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
                              title="View Conversation"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleViewEmail(row, "email")}
                              className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                              title="View Email"
                            >
                              <Mail className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => hasReply && handleViewEmail(row, "reply")}
                              disabled={!hasReply}
                              className={`inline-flex items-center justify-center h-7 w-7 rounded-lg border transition ${
                                hasReply
                                  ? "border-green-200 bg-green-50 text-green-600 hover:bg-green-100"
                                  : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                              }`}
                              title={hasReply ? "View Reply" : "No Reply"}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </button>
                            {/* <button
                              type="button"
                              onClick={() => setApproveRegenModal({ row })}
                              className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 transition"
                              title="Approve Regeneration"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button> */}
                          </div>
                        </td>
                      </tr>
                      );
                    })
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
        {/* ── Email Detail Modal ── */}
        {emailDetailModal !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-3 py-2 md:px-4 md:py-3"
            onClick={() => { setEmailDetailModal(null); setEmailModalView("email"); }}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-4xl mx-4"
              style={{ height: "100%", maxHeight: "calc(100vh - 16px)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
                  </div>
                  <div>
                    <h2 className="text-[14px] font-[700] text-[#0a0a0a] leading-tight">Email Detail</h2>
                    {!emailDetailLoading && emailDetailModal.lead_name && (
                      <p className="text-[11px] text-gray-400">{emailDetailModal.lead_name} · {emailDetailModal.campaign_name ?? ""}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setEmailDetailModal(null); setEmailModalView("email"); }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
              </div>

              {emailDetailLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <svg className="animate-spin h-9 w-9 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  <p className="text-[13px] text-gray-400">Loading email…</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {(() => {
                    const replyRecord = getReplyRecord(emailDetailModal);
                    const hasReply = !!replyRecord;
                    const isReplyView = emailModalView === "reply" && hasReply;
                    const isThreadView = emailModalView === "thread";
                    const conversationTimeline =
                      Array.isArray(emailDetailModal?.groupedConversation) && emailDetailModal.groupedConversation.length
                        ? emailDetailModal.groupedConversation
                        : buildConversation(emailDetailModal, emailHistoryData ?? []);
                    return (
                      <>
                        <div className="shrink-0 border-b border-gray-100 px-6 py-2.5 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEmailModalView("thread")}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-[600] border transition ${
                              isThreadView
                                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                : "bg-white text-gray-500 border-gray-200"
                            }`}
                          >
                            <MessageCircle className="h-3.5 w-3.5" /> Conversation
                          </button>
                          <button
                            type="button"
                            onClick={() => setEmailModalView("email")}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-[600] border transition ${
                              !isReplyView && !isThreadView
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-white text-gray-500 border-gray-200"
                            }`}
                          >
                            <Mail className="h-3.5 w-3.5" /> Email
                          </button>
                          {hasReply && (
                            <button
                              type="button"
                              onClick={() => setEmailModalView("reply")}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-[600] border transition ${
                                isReplyView
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-white text-gray-500 border-gray-200"
                              }`}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Reply
                            </button>
                          )}
                        </div>

                        {/* ── Compact Meta Info (top) ── */}
                        <div className="shrink-0 border-b border-gray-100 px-6 py-2">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-600">
                            {(isReplyView
                              ? [
                                  { label: "From", value: replyRecord?.reply_from_name || replyRecord?.reply_from || "—" },
                                  { label: "Subject", value: replyRecord?.reply_subject || "—" },
                                  { label: "Received", value: formatApiDateTime(replyRecord?.received_datetime ?? replyRecord?.sent_at) },
                                ]
                              : [
                                  { label: "To", value: emailDetailModal.to_email ?? emailDetailModal.email ?? "—" },
                                  { label: "Subject", value: emailDetailModal.email_subject ?? emailDetailModal.subject ?? "—" },
                                  { label: "Sent", value: formatApiDateTime(emailDetailModal.sent_at) },
                                ]).map(({ label, value }) => (
                              <span
                                key={label}
                                className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5"
                                title={String(value ?? "—")}
                              >
                                <span className="font-[700] text-gray-500">{label}:</span>
                                <span className="max-w-[280px] truncate">{value ?? "—"}</span>
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* ── Follow-up Tasks Section ── */}
                        {(() => {
                          const modalTasks = normalizeFollowUpTasks(emailDetailModal.follow_up_tasks);
                          if (!modalTasks.length) return null;
                          return (
                            <div className="shrink-0 border-b border-violet-100 bg-violet-50 px-6 py-2">
                              <p className="text-[9px] font-[700] uppercase tracking-widest text-violet-500 mb-1.5">
                                Follow up Tasks &nbsp;<span className="bg-violet-200 text-violet-700 rounded-full px-1.5 py-px text-[9px]">{modalTasks.length}</span>
                              </p>
                              <ul className="space-y-0.5">
                                {modalTasks.map((task, ti) => (
                                  <li key={ti} className="flex items-start gap-1.5 text-[11px] text-violet-900">
                                    <span className="mt-0.5 shrink-0 w-3.5 h-3.5 rounded bg-violet-400 text-white text-[8px] font-[800] flex items-center justify-center">{ti + 1}</span>
                                    <span className="leading-snug">{task}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })()}

                        {/* ── Email/Reply Body (bottom, fills remaining) ── */}
                        {isThreadView ? (
                          <div className="flex-1 overflow-auto p-4 bg-gray-50 space-y-3">
                            {conversationTimeline.length ? conversationTimeline.map((item) => {
                              const isReplyItem = item.type === "reply";
                              return (
                                <div
                                  key={item.id}
                                  className={`rounded-xl border bg-white p-3 ${isReplyItem ? "border-green-200" : "border-blue-200"}`}
                                >
                                  <div className="flex items-center justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-[700] ${
                                        isReplyItem
                                          ? "bg-green-50 text-green-700 border border-green-200"
                                          : "bg-blue-50 text-blue-700 border border-blue-200"
                                      }`}>
                                        {isReplyItem ? "Reply" : "Sent Email"}
                                      </span>
                                      <span className="text-[11px] text-gray-500">
                                        {formatApiDateTime(item.timestamp)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 mb-2">
                                    <p className="text-[11px] text-gray-600"><span className="font-[600]">Subject:</span> {item.subject || "—"}</p>
                                    {isReplyItem ? (
                                      <p className="text-[11px] text-gray-600"><span className="font-[600]">From:</span> {item.meta?.name || item.meta?.from || "—"}</p>
                                    ) : (
                                      <p className="text-[11px] text-gray-600"><span className="font-[600]">To:</span> {item.meta?.to || "—"}</p>
                                    )}
                                  </div>

                                  {item.full_html ? (
                                    <iframe
                                      srcDoc={toRenderableEmailHtml(item.full_html)}
                                      title={`Conversation item ${item.id}`}
                                      className="w-full border border-gray-200 rounded-lg bg-white"
                                      style={{ height: "220px" }}
                                      sandbox="allow-same-origin"
                                    />
                                  ) : (
                                    <p className="text-[12px] text-gray-600 whitespace-pre-wrap">
                                      {toPlainText(item.content) || "No content"}
                                    </p>
                                  )}
                                </div>
                              );
                            }) : (
                              <p className="text-[13px] text-gray-400 italic">No conversation data available.</p>
                            )}
                          </div>
                        ) : isReplyView ? (
                          <div className="flex-1 overflow-auto p-2 bg-gray-50">
                            {(replyRecord?.reply_body || replyRecord?.body_preview) ? (
                              <iframe
                                srcDoc={toRenderableEmailHtml(replyRecord.reply_body ?? replyRecord.body_preview)}
                                title="Reply Body"
                                className="w-full border border-gray-200 rounded-xl bg-white"
                                style={{ height: "100%", minHeight: "58vh" }}
                                sandbox="allow-same-origin"
                              />
                            ) : (
                              <p className="text-[13px] text-gray-400 italic">No reply body available.</p>
                            )}
                          </div>
                        ) : emailDetailModal.email_body ? (
                          <div className="flex-1 overflow-auto p-2 bg-gray-50">
                            <iframe
                              srcDoc={toRenderableEmailHtml(emailDetailModal.email_body)}
                              title="Email Body"
                              className="w-full border border-gray-200 rounded-xl bg-white"
                              style={{ height: "100%", minHeight: "58vh" }}
                              sandbox="allow-same-origin"
                            />
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center justify-center">
                            <p className="text-[13px] text-gray-400 italic">No email body available.</p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
        {/* ── Approve Regeneration Confirmation Modal ── */}
        {approveRegenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 max-w-sm w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                  <RotateCcw className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-[15px] font-[700] text-gray-900">Approve Regeneration</h3>
                  <p className="text-[12px] text-gray-400">This will trigger a new email draft.</p>
                </div>
              </div>
              <p className="text-[13px] text-gray-600 mb-5">
                Approve regeneration for email draft sent to{" "}
                <span className="font-[700] text-gray-900">
                  &ldquo;{approveRegenModal.row?.name ?? approveRegenModal.row?.lead_name ?? "this lead"}&rdquo;
                </span>?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setApproveRegenModal(null)}
                  disabled={approveRegenLoading}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-[600] text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApproveRegen}
                  disabled={approveRegenLoading}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-[13px] font-[700] hover:bg-amber-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {approveRegenLoading ? "Approving…" : "Approve"}
                </button>
              </div>
            </div>
          </div>
        )}

        {emailTooltip && (() => {
          const { kind, rect } = emailTooltip;
          const left = Math.min(Math.max(rect.left + rect.width / 2, 10), (typeof window !== "undefined" ? window.innerWidth : 1200) - 10);
          const top = rect.top - 8;
          return (
            <div
              style={{ position: "fixed", top, left, transform: "translate(-50%, -100%)", zIndex: 9999, pointerEvents: "none" }}
              className="rounded-lg bg-gray-800 px-3 py-2 text-[11px] text-white shadow-lg"
            >
              {kind === "skip" ? (
                <>
                  <p className="font-[600] mb-0.5">Skip Reason</p>
                  <p className="font-[400] text-gray-300 whitespace-normal break-words w-[260px] max-w-[calc(100vw-2rem)]">{emailTooltip.reason}</p>
                </>
              ) : (
                <>
                  <p className="font-[600] mb-1">Follow up Tasks</p>
                  {emailTooltip.taskNames.length > 0 ? (
                    <ul className="space-y-0.5 text-gray-200 w-[340px] max-w-[calc(100vw-2rem)]">
                      {emailTooltip.taskNames.map((task, ti) => (
                        <li key={ti} className="whitespace-normal break-words">{`${ti + 1}. ${task}`}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-300 w-[340px] max-w-[calc(100vw-2rem)]"><strong>Total:</strong> {emailTooltip.taskCount} task{emailTooltip.taskCount !== 1 ? "s" : ""}</p>
                  )}
                </>
              )}
            </div>
          );
        })()}
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
      
      // First filter: Apply search + status (for card metrics calculation)
      const liBaseFiltered = linkedinHistoryData.filter((r) => {
        const ms =
          r.name?.toLowerCase().includes(liSearch.toLowerCase()) ||
          r.company?.toLowerCase().includes(liSearch.toLowerCase());
        const ss = liStatus === "All Status" || r.status === liStatus;
        return ms && ss;
      });
      
      // Second filter: Apply task filter + card filter (for table display)
      const liRows = liBaseFiltered.filter((r) => {
        if (liTaskFilter) {
          const names = normalizeFollowUpTasks(r.follow_up_tasks);
          const cnt = Math.max(Number(r.total_tasks) || 0, names.length);
          if (cnt === 0) return false;
        }
        // If no card filters selected, show all. If filters selected, record must match ANY selected filter (OR logic).
        if (liCardFilter.size > 0) {
          const matchesAny = Array.from(liCardFilter).some((filter) => {
            if (filter === "accepted") return r.connectionAccepted || r.status === "ACCEPTED" || r.status === "CONNECTED";
            if (filter === "replied") return r.replied || r.status === "REPLIED" || r.status === "MEETING SCHEDULED";
            if (filter === "no_reply") return !r.replied && (r.status === "NO REPLY" || r.status === "NOT CONNECTED" || r.status === "PENDING");
            if (filter === "meetings") return r.meeting && r.meeting_link;
            return true;
          });
          if (!matchesAny) return false;
        }
        return true;
      });
      
      // Metrics from BASE FILTERED (search + status only) - stable counts that don't change with card/task filters
      const liTotalTasks = liBaseFiltered.reduce((sum, r) => {
        const names = normalizeFollowUpTasks(r.follow_up_tasks);
        const cnt = Math.max(Number(r.total_tasks) || 0, names.length);
        return sum + cnt;
      }, 0);
      const accepted = liBaseFiltered.filter(
        (r) => r.connectionAccepted || r.status === "ACCEPTED" || r.status === "CONNECTED",
      ).length;
      const replied = liBaseFiltered.filter(
        (r) => r.replied || r.status === "REPLIED" || r.status === "MEETING SCHEDULED",
      ).length;
      const noReply = liBaseFiltered.filter(
        (r) => !r.replied && (r.status === "NO REPLY" || r.status === "NOT CONNECTED" || r.status === "PENDING"),
      ).length;
      const meetingBooked =
        liBaseFiltered.filter((r) => r.meeting).length || (liBaseFiltered.length === 0 ? 0 : c.meetings);
      // Total Outreach = total records available (search + status filtered), NOT affected by task/card filters
      const totalOutreach = liBaseFiltered.length;
      const responseRate =
        totalOutreach > 0
          ? Math.round(((accepted + replied) / totalOutreach) * 100)
          : 0;
      const engagementData = [
        { metric: "Accepted", value: accepted, fill: "#1d4ed8" },
        { metric: "Replied", value: replied, fill: "#2563eb" },
        { metric: "Meeting", value: meetingBooked, fill: "#3b82f6" },
        { metric: "No Reply", value: noReply, fill: "#93c5fd" },
      ];
      const outcomeDonut = [
        { name: "Accepted", value: accepted, color: "#1d4ed8" },
        { name: "Replied", value: replied, color: "#2563eb" },
        { name: "No Reply", value: noReply, color: "#bfdbfe" },
      ].filter((s) => s.value > 0);
      return (
        <main className="min-h-screen bg-[#f4f5f7] p-4">
          <div className="mb-5">
            <button
              type="button"
              onClick={backToCampaignActivities}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Campaign Activities
            </button>
          </div>
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-[17px] font-[700] text-[#0a0a0a]">
                LinkedIn Campaign History
              </h1>
              <p className="text-[13px] text-gray-500 mt-0.5">
                Track all LinkedIn connection requests and messages
              </p>

            </div>
            <button
              type="button"
              onClick={handleHistoryRefresh}
              disabled={histRefreshing || linkedinHistoryLoading}
              className="mt-0.5 rounded-xl border border-gray-200 bg-white p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${histRefreshing || linkedinHistoryLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
          {/* KPI strip */}
          <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            {[
              {
                label: "Total Outreach",
                value: totalOutreach,
                sub: "all activity",
                color: "text-blue-600",
                ring: "ring-blue-200",
              },
              {
                label: "Total Tasks",
                value: liTotalTasks,
                sub: "follow up tasks",
                color: liTaskFilter ? "text-blue-700" : "text-blue-600",
                ring: liTaskFilter ? "ring-blue-400" : "ring-blue-200",
                isTaskCard: true,
              },
              {
                label: "Accepted",
                value: accepted,
                sub: "connections",
                color: liCardFilter.has("accepted") ? "text-blue-700" : "text-blue-600",
                ring: liCardFilter.has("accepted") ? "ring-blue-400" : "ring-blue-200",
                filter: "accepted",
              },
              {
                label: "Replied",
                value: replied,
                sub: "InMail replies",
                color: liCardFilter.has("replied") ? "text-blue-700" : "text-blue-600",
                ring: liCardFilter.has("replied") ? "ring-blue-400" : "ring-blue-200",
                filter: "replied",
              },
              {
                label: "No Reply",
                value: noReply,
                sub: "no response",
                color: liCardFilter.has("no_reply") ? "text-blue-700" : "text-blue-600",
                ring: liCardFilter.has("no_reply") ? "ring-blue-400" : "ring-blue-200",
                filter: "no_reply",
              },
              {
                label: "Meetings",
                value: meetingBooked,
                sub: "booked",
                color: liCardFilter.has("meetings") ? "text-blue-700" : "text-blue-600",
                ring: liCardFilter.has("meetings") ? "ring-blue-400" : "ring-blue-200",
                filter: "meetings",
              },
              {
                label: "Response Rate",
                value: `${responseRate}%`,
                sub: "of outreach",
                color: "text-blue-600",
                ring: "ring-blue-200",
              },
            ].map((k) => {
              const isActive = k.isTaskCard ? liTaskFilter : (k.filter && liCardFilter.has(k.filter));
              return (
                <article
                  key={k.label}
                  onClick={
                    k.isTaskCard
                      ? () => setLiTaskFilter((v) => !v)
                      : k.filter
                      ? () => setLiCardFilter((v) => {
                          const newSet = new Set(v);
                          if (newSet.has(k.filter)) {
                            newSet.delete(k.filter);
                          } else {
                            newSet.add(k.filter);
                          }
                          return newSet;
                        })
                      : undefined
                  }
                  className={`rounded-2xl bg-white border shadow-sm p-4 flex flex-col gap-0.5 ring-1 cursor-pointer select-none hover:shadow-md transition-all ${
                    isActive
                      ? "ring-2 ring-blue-300 border-blue-200 shadow-md"
                      : `border-gray-100 ${k.ring}`
                  }`}
              >
                <p className="text-[10px] font-[600] uppercase tracking-wider text-gray-400">
                  {k.label}
                </p>
                <p className={`text-[28px] font-[800] leading-none ${k.color}`}>
                  {k.value}
                </p>
                <p className="text-[11px] text-gray-400">{k.sub}</p>
                {isActive }
              </article>
              );
            })}
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
                          paddingAngle={0}
                          labelLine={false}
                          label={renderPieLabel}
                        >
                          {outcomeDonut.map((s, i) => (
                            <Cell key={i} fill={s.color} stroke="none" strokeWidth={0} />
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
          <div className="w-full overflow-hidden">
  <table className="w-full table-fixed border-collapse text-left text-[12px]">
    
    {/* HEADER */}
    <thead>
      <tr className="bg-[#1e293b]">
        {[
          "Lead Name",
          "Company",
          "Replied",
          "Status",
          "Date",
          "Meeting",
          "Tasks",
          "Actions",
        ].map((h, i) => (
          <th
            key={h}
            className={`py-2 font-[600] uppercase tracking-wide text-white
              ${i === 0 ? "pl-4 pr-2 w-[100px]" : "px-8"}
            `}
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>

    {/* BODY */}
    <tbody>
      {liRows.length === 0 ? (
        <tr>
          <td
            colSpan={8}
            className="py-4 text-center text-gray-400"
          >
            No LinkedIn records available.
          </td>
        </tr>
      ) : (
        liRows.map((row, idx) => (
          <tr
            key={idx}
            className={`border-b border-gray-100 hover:bg-gray-50 transition ${
              idx % 2 !== 0 ? "bg-gray-50/30" : ""
            }`}
          >
            
            {/* Lead Name (less left space) */}
            <td className="pl-5 pr-2 py-2 truncate">
              {row.name}
            </td>

            {/* Company */}
            <td className="px-2 py-2 truncate">
              {row.company}
            </td>

            {/* Replied */}
            <td className="px-2 py-2 pl-10">
              <span
                className={`inline-flex  px-2 py-0.5 rounded-full text-[10px] font-[600] border ${
                  row.replied
                    ? "bg-teal-50 text-teal-700 border-teal-200"
                    : "bg-gray-100 text-gray-500 border-gray-200"
                }`}
              >
                {row.replied ? "Yes" : "No"}
              </span>
            </td>

            {/* Status */}
            <td className="px-2 py-2 pl-5 truncate">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-[600] ${
                  LINKEDIN_STATUS_STYLE[row.status] ??
                  "bg-gray-100 text-gray-600"
                }`}
              >
                {row.status || "—"}
              </span>
            </td>

            {/* Date */}
            <td className="px-2 py-2 pl-5 text-[11px] text-gray-600 whitespace-nowrap">
              {row.dateTime !== "—"
                ? new Date(row.dateTime).toLocaleDateString()
                : "—"}
            </td>

            {/* Meeting */}
            <td className="px-2 py-2 pl-10">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-[600] border ${
                  row.meeting
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-100 text-gray-500 border-gray-200"
                }`}
              >
                {row.meeting ? "Yes" : "No"}
              </span>
            </td>

            {/* Tasks */}
            <td className="px-2 py-2 pl-10">
              {(() => {
                const rawTasks = Array.isArray(row.follow_up_tasks)
                  ? row.follow_up_tasks
                  : [];
                const taskCount =
                  Math.max(
                    Number(row.total_tasks) || 0,
                    rawTasks.length
                  );

                return (
                  <span
                    className={`inline-flex items-center  px-2 py-0.5 rounded-full text-[10px] border ${
                      taskCount > 0
                        ? "font-[700] bg-blue-50 text-blue-700 border-blue-200"
                        : "font-[600] bg-gray-100 text-gray-500 border-gray-200"
                    }`}
                  >
                    {taskCount}
                  </span>
                );
              })()}
            </td>

            {/* Actions */}
            <td className="px-2 py-2 pl-8">
              <button 
                onClick={() => {
                  setLiConversationModal(idx);
                  setLiConversationData(row);
                  setLiConversationLoading(false);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-600 text-white text-[11px] font-[600] hover:bg-blue-700 transition"
              >
                View <Eye className="h-3.5 w-3.5" /> 
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
                Showing {liRows.length} of {totalOutreach} records
              </p>
              <span className="flex items-center gap-1.5 text-[12px] text-green-600 font-[500]">
                <CheckCircle2 className="h-3.5 w-3.5" /> {meetingBooked}{" "}
                meetings booked
              </span>
            </div>
          </div>

          {/* LinkedIn Conversation Detail Modal */}
          {liConversationModal != null && liConversationData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-3 py-2 md:px-4 md:py-3" onClick={() => setLiConversationModal(null)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto flex flex-col" style={{ height: "100%", maxHeight: "calc(100vh - 16px)" }} onClick={(e) => e.stopPropagation()}>
                {/* Header - LinkedIn Blue Theme */}
                <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-100 shrink-0 bg-gradient-to-r from-blue-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <Linkedin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-[15px] font-[700] text-gray-900">LinkedIn Conversation</h2>
                      <p className="text-[11px] text-gray-400 mt-0.5">Message history and details</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLiConversationModal(null)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition border border-blue-200"
                    title="Close conversation"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {/* Meta Information Grid */}
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-[700] uppercase tracking-widest text-gray-400">Lead Name</span>
                      <span className="text-[12px] font-[600] text-gray-900">{liConversationData.name ?? "—"}</span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-[700] uppercase tracking-widest text-gray-400">Company</span>
                      <span className="text-[12px] font-[600] text-blue-600">{liConversationData.company ?? "—"}</span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-[700] uppercase tracking-widest text-gray-400">Status</span>
                      <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded-full text-[10px] font-[600] border ${LINKEDIN_STATUS_STYLE[liConversationData.status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {liConversationData.status ?? "—"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-[700] uppercase tracking-widest text-gray-400">Replied</span>
                      <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded-full text-[10px] font-[600] border ${liConversationData.replied ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                        {liConversationData.replied ? "Yes" : "No"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-[700] uppercase tracking-widest text-gray-400">Meeting</span>
                      <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded-full text-[10px] font-[600] border ${liConversationData.meeting ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                        {liConversationData.meeting ? "Yes" : "No"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-[700] uppercase tracking-widest text-gray-400">Date</span>
                      <span className="text-[11px] font-[500] text-gray-700">
                        {liConversationData.dateTime ? new Date(liConversationData.dateTime).toLocaleDateString() : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Follow-up Tasks */}
                  {liConversationData.follow_up_tasks && Array.isArray(liConversationData.follow_up_tasks) && liConversationData.follow_up_tasks.length > 0 && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 mb-5">
                      <p className="text-[11px] font-[700] uppercase tracking-wide text-blue-700 mb-2.5 flex items-center gap-2">
                        <span>Follow-up Tasks</span>
                        <span className="bg-blue-200 text-blue-800 rounded-full px-2 py-0.5 text-[10px] font-[700]">{liConversationData.follow_up_tasks.length}</span>
                      </p>
                      <ul className="space-y-2">
                        {liConversationData.follow_up_tasks.map((task, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-[12px] text-gray-800 leading-relaxed">
                            <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white text-[9px] font-[800] flex items-center justify-center">{i + 1}</span>
                            <span>{typeof task === "string" ? task : task.name || JSON.stringify(task)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Messages (LinkedIn Style) */}
                  <div className="flex flex-col bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-white">
                      <p className="text-[11px] font-[700] uppercase tracking-wide text-gray-600 flex items-center gap-2">
                        <span>Conversation</span>
                        {liConversationData.messages && Array.isArray(liConversationData.messages) && (
                          <span className="bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-[10px]">{liConversationData.messages.length}</span>
                        )}
                      </p>
                    </div>
                    
                    {liConversationData.messages && Array.isArray(liConversationData.messages) && liConversationData.messages.length > 0 ? (
                      <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto p-4 pr-3 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {liConversationData.messages.map((msg, idx) => {
                          const isOutbound = msg.direction === "OUTBOUND";
                          return (
                            <div key={idx} className={`flex gap-2 ${isOutbound ? "justify-end" : "justify-start"}`}>
                              <div className={`flex flex-col max-w-xs ${isOutbound ? "items-end" : "items-start"}`}>
                                {/* Message bubble - LinkedIn professional style */}
                                <div className={`rounded-lg px-3.5 py-2 shadow-sm ${
                                  isOutbound
                                    ? "bg-blue-600 text-white rounded-tr-none"
                                    : "bg-white text-gray-900 border border-gray-300 rounded-tl-none"
                                }`}>
                                  <p className="text-[13px] font-[500] leading-relaxed break-words whitespace-pre-wrap">{msg.body}</p>
                                </div>
                                
                                {/* Timestamp */}
                                <span className={`text-[11px] font-[500] mt-1 ${isOutbound ? "text-blue-600" : "text-gray-500"}`}>
                                  {msg.sent_at ? new Date(msg.sent_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-4 py-12 text-center">
                        <p className="text-[13px] text-gray-400 italic">No messages yet.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer - LinkedIn Blue Theme */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 shrink-0 bg-blue-50">
                  <button
                    type="button"
                    onClick={() => setLiConversationModal(null)}
                    className="px-5 py-2.5 rounded-lg border-2 border-blue-400 bg-blue-600 text-[13px] font-[600] text-white hover:bg-blue-700 hover:border-blue-500 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {liTooltip && (() => {
            const { rect } = liTooltip;
            const left = Math.min(Math.max(rect.left + rect.width / 2, 10), (typeof window !== "undefined" ? window.innerWidth : 1200) - 10);
            const top = rect.top - 8;
            return (
              <div
                style={{ position: "fixed", top, left, transform: "translate(-50%, -100%)", zIndex: 9999, pointerEvents: "none" }}
                className="rounded-lg bg-gray-800 px-3 py-2 text-[11px] text-white shadow-lg"
              >
                <p className="font-[600] mb-1">Follow up Tasks</p>
                {liTooltip.taskNames.length > 0 ? (
                  <ul className="space-y-0.5 text-gray-200 w-[340px] max-w-[calc(100vw-2rem)]">
                    {liTooltip.taskNames.map((task, ti) => (
                      <li key={ti} className="whitespace-normal break-words">{`${ti + 1}. ${task}`}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-300 w-[340px] max-w-[calc(100vw-2rem)]"><strong>Total:</strong> {liTooltip.taskCount} task{liTooltip.taskCount !== 1 ? "s" : ""}</p>
                )}
              </div>
            );
          })()}
        </main>
      );
    }

    /* ─── WHATSAPP HISTORY ─── */
    if (activeTab === "WHATSAPP") {
      const whatsappHistoryData = whatsappHistory ?? [];
      const waAnalytics = whatsappAnalytics ?? null;

      // Use analytics object for KPI cards when available
      const totalSent        = waAnalytics?.total_sent           ?? whatsappHistoryData.length;
      const delivered        = waAnalytics?.delivered            ?? whatsappHistoryData.filter((r) => r.status === "delivered" || r.status === "DELIVERED").length;
      const readCount        = waAnalytics?.read                 ?? whatsappHistoryData.filter((r) => r.status === "read" || r.status === "READ").length;
      const repliedCount     = waAnalytics?.replied              ?? whatsappHistoryData.filter((r) => r.is_replied).length;
      const positiveIntent   = waAnalytics?.positive_intent      ?? 0;
      const negativeIntent   = waAnalytics?.negative_intent      ?? 0;
      const neutralIntent    = waAnalytics?.neutral_intent        ?? 0;
      const meetingBooked    = waAnalytics?.meetings_scheduled   ?? waAnalytics?.meeting_booked ?? whatsappHistoryData.filter((r) => r.meeting).length;
      const optedOut         = waAnalytics?.opted_out            ?? 0;
      const activeConvs      = waAnalytics?.active_conversations  ?? 0;
      const completedConvs   = waAnalytics?.completed_conversations ?? 0;
      const replyRatePct     = waAnalytics?.reply_rate_pct       ?? (totalSent > 0 ? Math.round((repliedCount / totalSent) * 100) : 0);
      const readRatePct      = waAnalytics?.read_rate_pct        ?? (totalSent > 0 ? Math.round((readCount / totalSent) * 100) : 0);
      const totalFollowUps   = waAnalytics?.leads_with_tasks ?? whatsappHistoryData.reduce((sum, r) => {
        const names = normalizeFollowUpTasks(r.follow_up_tasks);
        return sum + Math.max(Number(r.total_tasks) || 0, names.length);
      }, 0);
      const leadsSkipped     = waAnalytics?.leads_skipped        ?? 0;

      const waStatuses = [
        "All Status",
        "ACTIVE",
        "COMPLETED",
        "OPTED_OUT",
        ...new Set(whatsappHistoryData.map((r) => (r.status ?? "").toUpperCase()).filter(Boolean)),
      ].filter((v, i, a) => a.indexOf(v) === i);

      const waRows = whatsappHistoryData.filter((r) => {
        const phoneMatch = r.phone?.toLowerCase().includes(waSearch.toLowerCase());
        const ss = waStatus === "All Status" || (r.status ?? "").toUpperCase() === waStatus.toUpperCase();
        if (!phoneMatch || !ss) return false;
        if (waTaskFilter) {
          const names = normalizeFollowUpTasks(r.follow_up_tasks);
          const cnt = Math.max(Number(r.total_tasks) || 0, names.length);
          if (cnt === 0) return false;
        }
        // If no card filters selected, show all. If filters selected, record must match ANY selected filter (OR logic).
        if (waCardFilter.size > 0) {
          const matchesAny = Array.from(waCardFilter).some((filter) => {
            if (filter === "sent") return true; // All sent messages
            if (filter === "delivered") return (r.status ?? "").toUpperCase() === "DELIVERED";
            if (filter === "read") return (r.status ?? "").toUpperCase() === "READ";
            if (filter === "replied") return r.is_replied;
            if (filter === "meetings") return r.meeting || r.meeting_link;
            return true;
          });
          if (!matchesAny) return false;
        }
        return true;
      });

      const WA_STATUS_STYLE = {
        ACTIVE:     "bg-green-50 text-green-700 border border-green-200",
        DELIVERED:  "bg-blue-50 text-blue-700 border border-blue-200",
        READ:       "bg-indigo-100 text-indigo-700 border border-indigo-200",
        REPLIED:    "bg-violet-50 text-violet-700 border border-violet-200",
        COMPLETED:  "bg-teal-50 text-teal-700 border border-teal-200",
        FAILED:     "bg-red-50 text-red-700 border border-red-200",
        SENT:       "bg-blue-50 text-blue-700 border border-blue-200",
        OPTED_OUT:  "bg-orange-50 text-orange-700 border border-orange-200",
      };

      const INTENT_STYLE = {
        positive: "bg-green-50 text-green-700 border border-green-200",
        negative: "bg-red-50 text-red-700 border border-red-200",
        neutral:  "bg-gray-100 text-gray-600 border border-gray-200",
      };

      const statusBarData = [
        { name: "Sent",      value: totalSent,    fill: "#6366f1" },
        { name: "Delivered", value: delivered,    fill: "#1d4ed8" },
        { name: "Read",      value: readCount,    fill: "#2563eb" },
        { name: "Replied",   value: repliedCount, fill: "#3b82f6" },
      ];
      const intentDonut = [
        { name: "Positive", value: positiveIntent, color: "#22c55e" },
        { name: "Negative", value: negativeIntent, color: "#ef4444" },
        { name: "Neutral",  value: neutralIntent,  color: "#94a3b8" },
      ].filter((s) => s.value > 0);

      return (
        <main className="min-h-screen bg-[#f4f5f7] p-4">
          <div className="mb-5">
            <button
              type="button"
              onClick={backToCampaignActivities}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Campaign Activities
            </button>
          </div>
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-[17px] font-[700] text-[#0a0a0a]">
                WhatsApp Campaign History
              </h1>
              <p className="text-[13px] text-gray-500 mt-0.5">
                Track all WhatsApp message delivery, reads, and replies
              </p>
            </div>
            <button
              type="button"
              onClick={handleHistoryRefresh}
              disabled={histRefreshing || whatsappHistoryLoading}
              className="mt-0.5 rounded-xl border border-gray-200 bg-white p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${histRefreshing || whatsappHistoryLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* ── Analytics KPI Cards ── */}
          <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "Total Sent",    value: totalSent,      sub: "messages",              color: "text-indigo-600", ring: "ring-indigo-200",  filter: "sent" },
              { label: "Delivered",     value: delivered,      sub: "reached",               color: "text-blue-600",   ring: "ring-blue-200",    filter: "delivered" },
              { label: "Read",          value: readCount,      sub: `${readRatePct}% rate`,  color: "text-blue-700",   ring: "ring-blue-300",    filter: "read" },
              { label: "Replied",       value: repliedCount,   sub: `${replyRatePct}% rate`, color: "text-violet-600", ring: "ring-violet-200",  filter: "replied" },
              { label: "Meetings",      value: meetingBooked,  sub: "scheduled",             color: "text-green-600",  ring: "ring-green-200",   filter: "meetings" },
              {
                label: "Total Tasks",
                value: totalFollowUps,
                sub: "total tasks",
                color: waTaskFilter ? "text-blue-700" : "text-blue-600",
                ring: waTaskFilter ? "ring-blue-400" : "ring-blue-200",
                isTaskCard: true,
              },
            ].map((k) => {
              const isActive = k.isTaskCard ? waTaskFilter : (k.filter && waCardFilter.has(k.filter));
              return (
                <article
                  key={k.label}
                  onClick={
                    k.isTaskCard
                      ? () => setWaTaskFilter((v) => !v)
                      : k.filter
                      ? () => setWaCardFilter((v) => {
                          const newSet = new Set(v);
                          if (newSet.has(k.filter)) {
                            newSet.delete(k.filter);
                          } else {
                            newSet.add(k.filter);
                          }
                          return newSet;
                        })
                      : undefined
                  }
                  className={`rounded-2xl bg-white border shadow-sm p-4 flex flex-col gap-0.5 ring-1 cursor-pointer select-none hover:shadow-md transition-all ${
                    isActive
                      ? "ring-2 ring-indigo-400 border-indigo-100 shadow-md"
                      : `border-gray-100 ${k.ring}`
                  }`}
                >
                  <p className="text-[10px] font-[600] uppercase tracking-wider text-gray-400">{k.label}</p>
                  <p className={`text-[28px] font-[800] leading-none ${isActive && !k.isTaskCard ? "text-indigo-700" : k.color}`}>{k.value}</p>
                  <p className="text-[11px] text-gray-400">{k.sub}</p>
                  {isActive }
                </article>
              );
            })}
          </section>

          {/* ── Intent + Active/Completed row ── */}
          <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <article className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col gap-0.5 ring-1 ring-green-200">
              <p className="text-[10px] font-[600] uppercase tracking-wider text-gray-400">Positive Intent</p>
              <p className="text-[26px] font-[800] leading-none text-green-600">{positiveIntent}</p>
              <p className="text-[11px] text-gray-400">interested leads</p>
            </article>
            <article className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col gap-0.5 ring-1 ring-red-200">
              <p className="text-[10px] font-[600] uppercase tracking-wider text-gray-400">Negative Intent</p>
              <p className="text-[26px] font-[800] leading-none text-red-500">{negativeIntent}</p>
              <p className="text-[11px] text-gray-400">not interested</p>
            </article>
            <article className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col gap-0.5 ring-1 ring-blue-200">
              <p className="text-[10px] font-[600] uppercase tracking-wider text-gray-400">Active Convs.</p>
              <p className="text-[26px] font-[800] leading-none text-blue-600">{activeConvs}</p>
              <p className="text-[11px] text-gray-400">in progress</p>
            </article>
            <article className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col gap-0.5 ring-1 ring-teal-200">
              <p className="text-[10px] font-[600] uppercase tracking-wider text-gray-400">Completed</p>
              <p className="text-[26px] font-[800] leading-none text-teal-600">{completedConvs}</p>
              <p className="text-[11px] text-gray-400">conversations</p>
            </article>
          </section>

          {/* Charts */}
          {statusBarData.some((d) => d.value > 0) && (
            <section className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-[14px] font-[700] text-gray-900 mb-1">Message Status Distribution</h3>
                <p className="text-[12px] text-gray-400 mb-4">Delivery and engagement breakdown</p>
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart data={statusBarData} barSize={38} margin={{ top: 0, right: 10, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: "none", fontSize: 12 }} />
                    <Bar dataKey="value" name="Messages" radius={[8, 8, 0, 0]}>
                      {statusBarData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {intentDonut.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
                  {/* Header */}
                  <div className="mb-3">
                    <h3 className="text-[14px] font-[700] text-gray-900">Intent Split</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Lead response sentiment</p>
                  </div>

                  {/* Donut — centered with total in middle */}
                  <div className="flex items-center justify-center relative mb-4">
                    <ResponsiveContainer width={160} height={160}>
                      <PieChart>
                        <Pie
                          data={intentDonut}
                          cx="50%" cy="50%"
                          innerRadius={50} outerRadius={72}
                          dataKey="value"
                          paddingAngle={3}
                          labelLine={false}
                          label={renderPieLabel}
                          strokeWidth={0}
                        >
                          {intentDonut.map((s, i) => <Cell key={i} fill={s.color} stroke="none" />)}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: 8, border: "none", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                          formatter={(val, name) => [`${val} leads`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[22px] font-[800] text-gray-800 leading-none">{intentDonut.reduce((s, d) => s + d.value, 0)}</span>
                      <span className="text-[9px] font-[600] uppercase tracking-widest text-gray-400 mt-0.5">Total</span>
                    </div>
                  </div>

                  {/* Legend with progress bars */}
                  <div className="space-y-2">
                    {intentDonut.map((s) => {
                      const total = intentDonut.reduce((sum, d) => sum + d.value, 0);
                      const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
                      return (
                        <div key={s.name} className="flex flex-col gap-0.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                              <span className="text-[11px] font-[500] text-gray-700">{s.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-[700] text-gray-800">{s.value}</span>
                              <span className="text-[10px] font-[600] px-1.5 py-0.5 rounded-full" style={{ background: `${s.color}20`, color: s.color }}>{pct}%</span>
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: s.color }} />
                          </div>
                        </div>
                      );
                    })}
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
                  placeholder="Search by phone..."
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
                  {waStatuses.map((s) => <option key={s}>{s}</option>)}
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
            <div className="">
              <table className="w-full text-left" style={{ minWidth: "720px" }}>
                <thead>
                  <tr className="bg-[#1e293b]">
                    {["Lead Name", "Phone", "Date & Time", "Status", "Replied", "Meeting", "Tasks", "Actions"].map((h) => (
                      <th key={h} className="px-3 py-3 text-[11px] font-[600] uppercase tracking-wide text-white">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {whatsappHistoryLoading ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-6 text-center text-[13px] text-gray-400">
                        Loading conversations...
                      </td>
                    </tr>
                  ) : waRows.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-6 text-center text-[13px] text-gray-400">
                        No WhatsApp records available.
                      </td>
                    </tr>
                  ) : (
                    waRows.map((row, idx) => (
                      <tr key={row.id ?? idx} className={`border-b border-gray-50 hover:bg-gray-50/70 transition ${idx % 2 !== 0 ? "bg-gray-50/30" : ""}`}>
                        <td className="px-3 py-3 text-[12px] font-mono text-gray-700">{row.lead_name ?? "—"}</td>
                        <td className="px-3 py-3 text-[12px] text-gray-600 font-mono">{row.phone}</td>
                        <td className="px-3 py-3 text-[11px] text-gray-600 whitespace-pre-line leading-tight">
                          {formatTableDateTime(row.dateTime)}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-[600] ${WA_STATUS_STYLE[(row.status ?? "").toUpperCase()] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                            {(row.status ?? "—").toUpperCase()}
                          </span>
                        </td>
                        {/* <td className="px-3 py-3">
                          {row.intent ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-[600] ${INTENT_STYLE[row.intent.toLowerCase()] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                              {row.intent}
                            </span>
                          ) : <span className="text-[11px] text-gray-400">—</span>}
                        </td>
                        <td className="px-3 py-3">
                          {row.last_message_status ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-[600] ${WA_STATUS_STYLE[(row.last_message_status ?? "").toUpperCase()] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                              {(row.last_message_status ?? "").toUpperCase()}
                            </span>
                          ) : <span className="text-[11px] text-gray-400">—</span>}
                        </td> */}
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-[600] border ${row.is_replied ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                            {row.is_replied ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-[600] border ${row.meeting ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                            {row.meeting ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {(() => {
                            const rawTasks = Array.isArray(row.follow_up_tasks) ? row.follow_up_tasks : [];
                            const taskNames = normalizeFollowUpTasks(rawTasks);
                            const taskCount = Math.max(Number(row.total_tasks) || 0, taskNames.length, rawTasks.length);
                            const hasTasks = taskCount > 0;
                            return (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border cursor-default ${hasTasks ? "font-[700] bg-blue-50 text-blue-700 border-blue-200" : "font-[600] bg-gray-100 text-gray-500 border-gray-200"}`}
                                onMouseEnter={hasTasks ? (e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setWaTooltip({ taskNames, taskCount, rect });
                                } : undefined}
                                onMouseLeave={hasTasks ? () => setWaTooltip(null) : undefined}
                              >
                                {taskCount}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() => row.id != null && setWaConversationModal(row.id)}
                            disabled={row.id == null}
                            title={row.id == null ? "No conversation ID available" : `View conversation #${row.id}`}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-[600] transition ${row.id != null ? "bg-[#1d4ed8] text-white hover:bg-blue-700" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
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
                <CheckCircle2 className="h-3.5 w-3.5" /> {meetingBooked} meetings booked
              </span>
            </div>
          </div>

          {/* Task tooltip */}
          {waTooltip && (() => {
            const { rect } = waTooltip;
            const left = Math.min(Math.max(rect.left + rect.width / 2, 10), (typeof window !== "undefined" ? window.innerWidth : 1200) - 10);
            const top = rect.top - 8;
            return (
              <div
                style={{ position: "fixed", top, left, transform: "translate(-50%, -100%)", zIndex: 9999, pointerEvents: "none" }}
                className="rounded-lg bg-gray-800 px-3 py-2 text-[11px] text-white shadow-lg"
              >
                <p className="font-[600] mb-1">Follow up Tasks</p>
                {waTooltip.taskNames.length > 0 ? (
                  <ul className="space-y-0.5 text-gray-200 w-[340px] max-w-[calc(100vw-2rem)]">
                    {waTooltip.taskNames.map((task, ti) => (
                      <li key={ti} className="whitespace-normal break-words">{`${ti + 1}. ${task}`}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-300 w-[340px] max-w-[calc(100vw-2rem)]"><strong>Total:</strong> {waTooltip.taskCount} task{waTooltip.taskCount !== 1 ? "s" : ""}</p>
                )}
              </div>
            );
          })()}

          {/* WhatsApp Conversation Detail Modal */}
          {waConversationModal != null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-3 py-2 md:px-4 md:py-3" onClick={() => setWaConversationModal(null)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto flex flex-col" style={{ height: "100%", maxHeight: "calc(100vh - 16px)" }} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-100 shrink-0 bg-gradient-to-r from-emerald-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                      <MessageCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-[15px] font-[700] text-gray-900">WhatsApp Conversation</h2>
                      <p className="text-[11px] text-gray-400 mt-0.5">Chat history and insights</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWaConversationModal(null)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 transition border border-emerald-200"
                    title="Close conversation"
                  >
                    <X className="h-4 w-4" />
                    <span className="text-[12px] font-[600]">Close</span>
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <WhatsAppConversationDetail
                    conversationId={waConversationModal}
                    onClose={() => setWaConversationModal(null)}
                  />
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 shrink-0 bg-emerald-50">
                  <button
                    type="button"
                    onClick={() => setWaConversationModal(null)}
                    className="px-5 py-2.5 rounded-lg border-2 border-emerald-400 bg-emerald-600 text-[13px] font-[600] text-white hover:bg-emerald-700 hover:border-emerald-500 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      );
    }

    /* ─── CAMPAIGN ACTIVITIES MENU (default) ── */
    const allActivities = [
      {
        key: "ALL",
        label: "Lead Activity",
        Icon: TrendingUp,
        desc: "Overview of all activities across this campaign",
        alwaysShow: true,
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
    // Only show channel tabs that are in this campaign's channel_order
    const campaignChannels = c.channelOrder ?? [];
    const activities = campaignChannels.length > 0
      ? allActivities.filter((a) => a.alwaysShow || campaignChannels.includes(a.key))
      : allActivities;
    return (
      <main className="min-h-screen bg-[#f4f5f7] p-4">
        {/* Back */}
        <div className="mb-4">
          <button
            type="button"
            onClick={backToCampaignList}
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
              icon: Users,
              color: "text-blue-600",
              bg: "bg-blue-50",
              border: "border-blue-100",
            },
            {
              label: "Processed",
            value: c.completed ? c.completed : c.completed ?? 0,
              icon: CheckCircle2,
              color: "text-blue-600",
              bg: "bg-blue-50",
              border: "border-blue-100",
            },
               {
              label: "Total Tasks",
              value: c.total_tasks_count ? c.total_tasks_count : 0,
              icon: CheckCircle2,
              color: "text-blue-600",
              bg: "bg-blue-50",
              border: "border-blue-100",
            },
            {
              label: "Meetings",
              value: c.meetings,
              icon: Calendar,
              color: "text-blue-600",
              bg: "bg-blue-50",
              border: "border-blue-100",
            },
            // {
            //   label: "Conv. Rate",
            //   value: `${c.convRate}%`,
            //   icon: TrendingUp,
            //   color: "text-blue-600",
            //   bg: "bg-blue-50",
            //   border: "border-blue-100",
            // },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <article
              key={label}
              className={`bg-white rounded-2xl border ${border} shadow-sm p-4 flex items-center gap-3`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}
              >
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className={`text-[22px] font-[800] ${color}`}>
                  {value}
                </p>
                <p className="text-[11px] text-gray-400 font-[500]">{label}</p>
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
              onClick={() => openCampaignTab(key)}
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
          {/* Stop All Campaigns — visible only when any campaign is ACTIVE or PAUSED */}
          {campaigns.some((c) => c.status === "ACTIVE" || c.status === "PAUSED") && (
            <button
              onClick={async () => {
                setStoppingAll(true);
                await dispatch(
                  stopAllMultichannelCampaigns(() =>
                    dispatch(listCampaigns(page, PAGE_SIZE))
                  )
                );
                setStoppingAll(false);
              }}
              disabled={stoppingAll}
              className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-[13px] font-[600] text-white hover:bg-red-700 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {stoppingAll ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <StopCircle className="h-4 w-4" />
              )}
              Stop All Campaigns
            </button>
          )}
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
            <option value="WHATSAPP">WHATSAPP</option>

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((c) => {
            // ── Channel activity data (computed once per card) ──
            const countByKey = {
              CALL:     c.called      ?? 0,
              EMAIL:    c.emailsSent  ?? 0,
              LINKEDIN: c.linkedinSent ?? 0,
              WHATSAPP: c.whatsappSent ?? 0,
            };
            const allChannels = [
              { label: "Call",     key: "CALL",     fill: "#6366f1", icon: <Phone className="h-3.5 w-3.5" /> },
              { label: "Email",    key: "EMAIL",    fill: "#0ea5e9", icon: <Mail className="h-3.5 w-3.5" /> },
              { label: "LinkedIn", key: "LINKEDIN", fill: "#0284c7", icon: <Linkedin className="h-3.5 w-3.5" /> },
              { label: "WhatsApp", key: "WHATSAPP", fill: "#22c55e", icon: <MessageCircle className="h-3.5 w-3.5" /> },
            ];
            const order = c.channelOrder ?? [];
            const channels = order.length > 0
              ? order.map((key) => allChannels.find((ch) => ch.key === key)).filter(Boolean)
              : allChannels;
            const selectedCampaignMatches = selectedCampaign?.id === c.id;
            const activeCampaignTab = selectedCampaignMatches ? activeTab : null;
            const stepStatus = {};
            (c.channelSteps ?? []).forEach((s) => { stepStatus[s.channelType] = s.status; });
            const total = Math.max(c.totalLeads, 1);
            const chStepLabel = (st) => {
              if (st === "COMPLETED")   return { text: "Done",    cls: "text-emerald-700 bg-emerald-50 border-emerald-200" };
              if (st === "IN_PROGRESS") return { text: "Running", cls: "text-indigo-700 bg-indigo-50 border-indigo-200" };
              if (st === "FAILED")      return { text: "Failed",  cls: "text-red-600 bg-red-50 border-red-200" };
              return null;
            };

            return (
            <div
              key={c.id}
              className="group bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-lg hover:border-gray-300/80 transition-all duration-200 overflow-hidden"
            >
              {/* ── Top accent bar ── */}
              <div className={`h-1 w-full ${
                c.status === "ACTIVE" ? "bg-gradient-to-r from-emerald-400 to-green-500"
                : c.status === "PAUSED" ? "bg-gradient-to-r from-amber-400 to-orange-400"
                : c.status === "COMPLETED" ? "bg-gradient-to-r from-blue-400 to-indigo-500"
                : c.status === "RUNNING" ? "bg-gradient-to-r from-violet-400 to-purple-500"
                : "bg-gray-200"
              }`} />

              <div className="p-5">
                {/* ── Card Header ── */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-[700] uppercase tracking-wide border ${statusBadge(c.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot(c.status)}`} />
                        {c.status}
                      </span>
                      {/* {c.campaignType && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-[10px] font-[600] text-gray-500 uppercase tracking-wide">
                          {c.campaignType}
                        </span>
                      )} */}
                      {c.communicationType && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[10px] font-[600] text-indigo-600 uppercase tracking-wide">
                          {c.communicationType}
                        </span>
                      )}
                    </div>
                    <h3 className="text-[16px] font-[700] text-gray-900 leading-snug truncate">{c.name}</h3>
                    <p className="text-[12px] text-gray-400 mt-1 truncate">
                      Agent: <span className="font-[600] text-gray-600">{c.agentName}</span>
                      {c.fromEmail && <> · <span className="text-indigo-500">{c.fromEmail}</span></>}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 ml-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      disabled={loadingEdit}
                      onClick={(e) => { e.stopPropagation(); handleEdit(c.id); }}
                      title="Edit campaign"
                      className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingEdit ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Pencil className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm({ id: c.id, name: c.name }); }}
                      title="Delete campaign"
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-5 gap-1 mb-4 bg-gray-50/80 rounded-xl p-3">
                  {[
                    { label: "Leads",     value: c.totalLeads.toLocaleString(), color: "text-gray-900" },
                    { label: "Completed", value: c.completed.toLocaleString(),  color: "text-emerald-600" },
                    { label: "Meetings",  value: c.meetings.toLocaleString(),   color: "text-blue-600" },
                    { label: "Tasks",     value: (c.total_tasks_count ?? 0).toLocaleString(), color: "text-violet-600" },
                    { label: "Conv.",     value: `${c.convRate}%`,              color: "text-indigo-600" },
                  ].map(({ label, value, color }, idx) => (
                    <div key={label} className={`text-center ${idx < 4 ? "border-r border-gray-200" : ""}`}>
                      <p className={`text-[16px] font-[800] leading-none ${color}`}>{value}</p>
                      <p className="text-[10px] font-[500] text-gray-400 mt-1">{label}</p>
                    </div>
                  ))}
                </div>

                {/* ── Channel Tabs ── */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {channels.map((ch) => {
                      const isActive = activeCampaignTab === ch.key;
                      return (
                        <button
                          key={ch.key}
                          type="button"
                          onClick={() => openCampaignDetails(c, ch.key)}
                          className={`rounded-full border px-3 py-1.5 text-[12px] font-[600] transition ${
                            isActive
                              ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <span className="inline-flex items-center gap-1">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-100 text-[11px]" style={{ color: ch.fill }}>
                              {ch.icon}
                            </span>
                            {ch.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Channel Activity ── */}
                <div className="space-y-2.5 mb-4">
                  {channels.map((ch) => {
                    const rawCount = countByKey[ch.key] ?? 0;
                    const count = (c.status === "COMPLETED" && rawCount === 0) ? c.totalLeads : rawCount;
                    const pct   = Math.min((count / total) * 100, 100);
                    const st    = stepStatus[ch.key];
                    const badge = chStepLabel(st);
                    return (
                      <div key={ch.label} className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-50 shrink-0" style={{ color: ch.fill }}>
                          {ch.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-[600] text-gray-600">{ch.label}</span>
                            <div className="flex items-center gap-2">
                              {badge && (
                                <span className={`text-[9px] font-[700] px-1.5 py-0.5 rounded-full border ${badge.cls}`}>
                                  {badge.text}
                                </span>
                              )}
                              <span className="text-[11px] font-[700] text-gray-500 tabular-nums">
                                {count}<span className="text-gray-300">/{c.totalLeads}</span>
                              </span>
                            </div>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: c.status === "COMPLETED" ? "100%" : (pct === 0 ? "4%" : `${pct}%`),
                                background: `linear-gradient(90deg, ${ch.fill}, ${ch.fill}dd)`,
                                opacity: c.status === "COMPLETED" ? 1 : (pct === 0 ? 0.25 : 1),
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── Footer ── */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(c.startDate)}
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const eligibleForPreviewFlow = isPreviewEligibleCampaign(c);
                      const previewChannel = getPreviewChannelKey(c);
                      const hasCompletedPreview = previewCompletedCampaignIds.has(String(c.id));

                      if (!eligibleForPreviewFlow) {
                        return (
                          <>
                            {c.status === "ACTIVE" ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTogglingId(c.id);
                                  dispatch(pauseCampaign(c.id, () => setTogglingId(null)));
                                }}
                                disabled={togglingId === c.id}
                                className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-[600] border transition disabled:opacity-60 disabled:cursor-not-allowed bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
                              >
                                {togglingId === c.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Pause className="h-3.5 w-3.5" />}
                                {togglingId === c.id ? "..." : "Pause"}
                              </button>
                            ) : c.status === "PAUSED" ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTogglingId(c.id);
                                  dispatch(resumeCampaign(c.id, () => setTogglingId(null)));
                                }}
                                disabled={togglingId === c.id}
                                className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-[600] border transition disabled:opacity-60 disabled:cursor-not-allowed bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                              >
                                {togglingId === c.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                                {togglingId === c.id ? "..." : "Resume"}
                              </button>
                            ) : c.status !== "COMPLETED" ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTogglingId(c.id);
                                  dispatch(toggleActivateCampaign(c.id, c.status, () => setTogglingId(null)));
                                }}
                                disabled={togglingId === c.id}
                                className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-[600] border transition disabled:opacity-60 disabled:cursor-not-allowed bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
                              >
                                {togglingId === c.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                                {togglingId === c.id ? "..." : "Activate"}
                              </button>
                            ) : null}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openCampaignDetails(c, null);
                              }}
                              className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-[12px] font-[600] text-white hover:bg-gray-800 shadow-sm transition"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View Activity
                            </button>
                          </>
                        );
                      }

                      return (
                        <>
                          {c.status === "ACTIVE" ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTogglingId(c.id);
                                  dispatch(
                                    pauseCampaign(c.id, () => {
                                      setTogglingId(null);
                                      setPreviewCompletedCampaignIds((prev) => {
                                        const next = new Set(prev);
                                        next.delete(String(c.id));
                                        return next;
                                      });
                                    }),
                                  );
                                }}
                                disabled={togglingId === c.id}
                                className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-[600] border transition disabled:opacity-60 disabled:cursor-not-allowed bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
                              >
                                {togglingId === c.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Pause className="h-3.5 w-3.5" />}
                                {togglingId === c.id ? "..." : "Pause"}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (hasCompletedPreview) {
                                    openCampaignDetails(c, previewChannel);
                                    return;
                                  }
                                  openCampaignPreview(c.id, previewChannel);
                                }}
                                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-[600] text-white shadow-sm transition ${
                                  hasCompletedPreview
                                    ? "bg-gray-900 hover:bg-gray-800"
                                    : "bg-blue-600 hover:bg-blue-700"
                                }`}
                              >
                                <Eye className="h-3.5 w-3.5" />
                                {hasCompletedPreview ? "View Details" : "Preview"}
                              </button>
                            </>
                          ) : c.status !== "COMPLETED" ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTogglingId(c.id);
                                  const afterActivate = () => {
                                    setTogglingId(null);
                                    setPreviewCompletedCampaignIds((prev) => {
                                      const next = new Set(prev);
                                      next.delete(String(c.id));
                                      return next;
                                    });
                                  };
                                  if (c.status === "PAUSED") {
                                    dispatch(resumeCampaign(c.id, afterActivate));
                                  } else {
                                    dispatch(toggleActivateCampaign(c.id, c.status, afterActivate));
                                  }
                                }}
                                disabled={togglingId === c.id}
                                className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-[600] border transition disabled:opacity-60 disabled:cursor-not-allowed bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
                              >
                                {togglingId === c.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                                {togglingId === c.id ? "..." : c.status === "PAUSED" ? "Resume" : "Activate"}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openCampaignDetails(c, null);
                                }}
                                className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-[12px] font-[600] text-white hover:bg-gray-800 shadow-sm transition"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View Details
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openCampaignDetails(c, null);
                              }}
                              className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-[12px] font-[600] text-white hover:bg-gray-800 shadow-sm transition"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View Details
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
            );
          })}
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
                disabled={deleting}
                onClick={() => setShowDeleteConfirm(null)}
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

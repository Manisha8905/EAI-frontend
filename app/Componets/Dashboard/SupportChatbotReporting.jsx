// ...existing imports...
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  AlertCircle,
  Bot,
  CalendarDays,
  Check,
  ClipboardList,
  Download,
  MessageCircle,
  MoreVertical,
  Plus,
  Search,
  ShieldAlert,
  User,
  UserCog,
  X,
} from "lucide-react";
import axiosInstance from "../../Redux/axiosInstance";

const normalizeRole = (role) =>
  String(role ?? "")
    .toUpperCase()
    .replace(/[\s_-]/g, "");
const REPORTING_DATA = {
  webchat: {
    cards: {
      total: 7,
      escalated: 2,
      today: 0,
      avgMessages: 5.7,
    },
    conversations: [
      {
        id: "conv-1",
        lead: "Henneth - so it's not RI1?",
        email: "hennethcorado@gmail.com",
        time: "3/26/2026, 01:04 AM",
        preview: "so it's not RI1?",
        stage: "Open Chats",
      },
      {
        id: "conv-2",
        lead: "Anita - Need order update",
        email: "anita.orders@mail.com",
        time: "3/25/2026, 11:21 PM",
        preview: "Please share latest status.",
        stage: "Escalated Chats",
      },
    ],
    message:
      "Architectssa's Trade Tile Partner Program provides exclusive benefits for commercial and trade partners, including access to samples, trade pricing, and a dedicated sales team. Our team supports your specification journey across our seven East Coast showrooms.",
    thread: [
      {
        id: "t1",
        role: "USER",
        text: "Can you tell me stock availability of your products",
      },
      {
        id: "t2",
        role: "BOT",
        text: "Stock availability for products like 'Calacatta Chablis' and others in our Stock Sale is limited and items are retired after current inventory is depleted. You can view details here: https://architectssa.com/collections/stock-sale",
      },
    ],
  },
  whatsapp: {
    cards: {
      total: 5,
      escalated: 1,
      today: 1,
      avgMessages: 4.1,
    },
    conversations: [
      {
        id: "conv-wa-1",
        lead: "Ritu - Payment issue",
        email: "ritu@company.com",
        time: "3/26/2026, 09:22 AM",
        preview: "Need invoice correction",
        stage: "Open Chats",
      },
      {
        id: "conv-wa-2",
        lead: "Jason - Delivery timeline",
        email: "jason@buildsite.io",
        time: "3/25/2026, 06:02 PM",
        preview: "Any update on ETA?",
        stage: "Responded Chats",
      },
    ],
    message:
      "Hello Jason, thanks for reaching out. Your delivery timeline is currently 2 business days. We have also shared tracking details in your email.",
    thread: [
      {
        id: "wt1",
        role: "USER",
        text: "Any update on ETA?",
      },
      {
        id: "wt2",
        role: "BOT",
        text: "Your order is in transit and expected within 2 business days.",
      },
    ],
  },
};

const CONVERSATION_TABS = [
  "Open Chats",
  "Escalated Chats",
  "Responded Chats",
  "Closed Chats",
];

const STATUS_FILTER_OPTIONS = ["open", "responded", "closed", "all"];

const TAB_TO_FILTER = {
  "Open Chats": { status: "open", escalated: undefined },
  "Escalated Chats": { status: "open", escalated: true },
  "Responded Chats": { status: "responded", escalated: undefined },
  "Closed Chats": { status: "closed", escalated: undefined },
};

// const TAB_TO_FILTER = {
//   "Open Chats": { status: ["open"] },

//   "Escalated Chats": {
//     status: ["open", "responded"],
//     escalated: true
//   },

//   "Responded Chats": {
//     status: ["responded", "partial"]
//   },

//   "Closed Chats": { status: ["closed"] },
// };

const INITIAL_RULES = [
  {
    id: "rule-1",
    number: 1,
    text: "If customer asks about refund policy, always mention 30-day money-back guarantee",
    createdBy: "Sarah Chen",
    createdAt: "3/20/2026, 04:00 PM",
  },
  {
    id: "rule-2",
    number: 2,
    text: "Always greet the customer by name when available.",
    createdBy: "Mike Johnson",
    createdAt: "3/21/2026, 10:30 AM",
  },
];

const normalizeConversation = (row = {}) => {
  const isEscalated =
    row.escalated === true ||
    String(row.priority ?? "").toLowerCase() === "high" ||
    String(row.status ?? "").toLowerCase() === "escalated";

  const rawStatus = String(row.status ?? "open").toLowerCase();

  // Determine stage: status takes priority so responded/closed go to their tabs;
  // escalated flag only applies to open conversations
  const stage = rawStatus.includes("closed")
    ? "Closed Chats"
    : rawStatus.includes("respond")
      ? "Responded Chats"
      : isEscalated
        ? "Escalated Chats"
        : "Open Chats";

  return {
    id: String(row.id ?? row.chat_id ?? row.conversation_id ?? ""),
    session_id: row.session_id ?? null,
    lead:
      row.title ??
      row.lead_name ??
      row.lead ??
      row.customer_name ??
      row.user_name ??
      row.name ??
      "Unknown Lead",
    email: row.email ?? row.customer_email ?? row.user_email ?? "No email",
    preview:
      row.preview ??
      row.last_message ??
      row.message_preview ??
      row.message ??
      "No message preview",
    time:
      row.time ??
      row.last_message_at ??
      row.updated_at ??
      row.start_time ??
      row.created_at ??
      new Date().toLocaleString(),
    stage,
    status: rawStatus,
    escalated: isEscalated,
    messageCount: row.message_count ?? null,
    assignedTo: row.assigned_to ?? row.assignee ?? null,
  };
};

function SkeletonConvItem() {
  return (
    <div className="flex w-full animate-pulse border-b border-slate-200 border-l-4 border-l-transparent px-4 py-5">
      <div className="mr-3 mt-0.5 h-4 w-4 shrink-0 rounded bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/5 rounded bg-gray-200" />
        <div className="h-3 w-2/5 rounded bg-gray-200" />
        <div className="h-3 w-4/5 rounded bg-gray-200" />
      </div>
      <div className="ml-3 h-3 w-20 shrink-0 rounded bg-gray-200" />
    </div>
  );
}

function SkeletonMessage({ isBot }) {
  return (
    <div className="flex animate-pulse items-start gap-3 rounded-xl px-3 py-3">
      <span
        className={`inline-flex h-8 w-8 shrink-0 rounded-lg ${isBot ? "bg-purple-200" : "bg-blue-200"}`}
      />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-16 rounded bg-gray-200" />
        <div className="h-3 w-full rounded bg-gray-200" />
        <div className="h-3 w-4/5 rounded bg-gray-200" />
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, tone, formatter }) {
  const tones = {
    blue: "from-blue-500 to-blue-600",
    red: "from-rose-500 to-red-600",
    green: "from-emerald-500 to-green-600",
    purple: "from-violet-500 to-fuchsia-600",
  };
  return (
    <article
      className={`rounded-2xl bg-gradient-to-br px-4 py-4 text-white shadow-md flex flex-col items-stretch min-h-[110px] h-full ${tones[tone]}`}
    >
      <div className="flex flex-1 items-center justify-between gap-2 min-h-[70px]">
        <div className="flex flex-col justify-center flex-1">
          <p className="text-[12px] font-[600] text-white/80 mb-0.5">{title}</p>
          <p className="text-[24px] font-[900] leading-none tracking-tight text-white">
            {formatter ? formatter(value) : value}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white/20 p-2">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </article>
  );
}

// --- Utility functions for mapping API data (from SupportChatbotMetrics.jsx) ---
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
const mapStatsResponse = (payload, fallback) => {
  const root =
    payload?.webchat ??
    payload?.data?.webchat ??
    payload?.data ??
    payload ??
    {};
  const total = getFirstNumber(
    root,
    ["total_chats", "total", "totalChats", "total_conversations"],
    fallback.cards.total,
  );
  const escalated = getFirstNumber(
    root,
    ["escalated", "escalated_chats", "escalatedChats"],
    fallback.cards.escalated,
  );
  const today = getFirstNumber(
    root,
    ["today", "today_chats", "todayChats"],
    fallback.cards.today,
  );
  const avgMessages = getFirstNumber(
    root,
    [
      "avg_messages_per_chat",
      "avgMessages",
      "avg_messages",
      "average_messages_per_chat",
    ],
    fallback.cards.avgMessages,
  );
  return {
    cards: { total, escalated, today, avgMessages },
  };
};

export default function SupportChatbotReporting() {
  const [activeApp] = useState("webchat");
  // WhatsApp credentials state for debug/visibility
  const [whatsappCreds, setWhatsappCreds] = useState(null);
  useEffect(() => {
    const fetchWhatsappCreds = async () => {
      try {
        const res = await axiosInstance.get("/api/whatsapp/credentials");
        setWhatsappCreds(res?.data?.data ?? res?.data ?? {});
      } catch (e) {
        setWhatsappCreds({ error: "Unable to fetch WhatsApp credentials" });
      }
    };
    fetchWhatsappCreds();
  }, []);
  // ...existing code...
  const [search, setSearch] = useState("");
  const [activeConversationTab, setActiveConversationTab] =
    useState("Open Chats");
  const [selectedConversationId, setSelectedConversationId] =
    useState("conv-2");
  const [isAgentsOpen, setIsAgentsOpen] = useState(false);
  const [selectedChats, setSelectedChats] = useState(new Set());
  const [isConvPanelAssignOpen, setIsConvPanelAssignOpen] = useState(false);
  const [isRightAssignOpen, setIsRightAssignOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const agentsDropdownRef = useRef(null);
  const convAssignDropdownRef = useRef(null);
  const rightAssignDropdownRef = useRef(null);
  const statusMenuRef = useRef(null);

  // --- API-driven summary card state ---
  // WhatsApp credentials debug output (remove or style as needed)
  // This block is for demonstration/debug only
  // Place this inside your render/return if you want to see the credentials
  const [cardData, setCardData] = useState({
    cards: { total: 0, escalated: 0, today: 0, avgMessages: 0 },
  });
  const [loadingCards, setLoadingCards] = useState(false);
  const [cardError, setCardError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingCards(true);
      setCardError("");
      try {
        const res = await axiosInstance.get("/api/chatbot/stats", {
          params: { channel: "webchat" },
        });
        setCardData(mapStatsResponse(res?.data, REPORTING_DATA.webchat));
      } catch (err) {
        setCardError("Unable to load summary cards. Showing fallback data.");
        setCardData(REPORTING_DATA.webchat);
      } finally {
        setLoadingCards(false);
      }
    };
    fetchStats();
  }, []);
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [newRuleText, setNewRuleText] = useState("");
  const [selectedRuleId, setSelectedRuleId] = useState(null);
  const [isRuleDetailOpen, setIsRuleDetailOpen] = useState(false);
  const [ruleDetailData, setRuleDetailData] = useState(null);
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentEmail, setNewAgentEmail] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isAgentDetailOpen, setIsAgentDetailOpen] = useState(false);
  const [agents, setAgents] = useState([]);
  const [isAssignedToast, setIsAssignedToast] = useState(false);
  const [isRightAssignToast, setIsRightAssignToast] = useState(false);
  const [assignToastMessage, setAssignToastMessage] = useState("");
  const [assignResponseData, setAssignResponseData] = useState(null);
  const [businessRules, setBusinessRules] = useState(INITIAL_RULES);
  const [isBusinessRulesListOpen, setIsBusinessRulesListOpen] = useState(false);
  const [isRulesInlineAddOpen, setIsRulesInlineAddOpen] = useState(false);
  const [newRuleInListText, setNewRuleInListText] = useState("");

  // API States
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [conversationsError, setConversationsError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatHistoryLoading, setChatHistoryLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "open",
    escalated: false,
    startDate: null,
    endDate: null,
  });
  // Infinite scroll state
  const [pagination, setPagination] = useState({
    limit: 40, // Start with a larger batch
    offset: 0,
  });
  const [hasMoreConversations, setHasMoreConversations] = useState(true);

  const role =
    typeof window === "undefined"
      ? ""
      : normalizeRole(localStorage.getItem("userRole"));
  const canAccess =
    role === "SUPPORT" || role === "MANAGER" || role === "SUPERADMIN";

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const inTab =
        activeConversationTab === "Escalated Chats"
          ? c.escalated === true
          : activeConversationTab === "Open Chats"
            ? c.status === "open"
            : c.stage === activeConversationTab;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        c.lead.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.preview.toLowerCase().includes(q);
      return inTab && matchesSearch;
    });
  }, [conversations, activeConversationTab, search]);

  const selectedConversationCard = useMemo(() => {
    return (
      selectedConversation ??
      conversations.find(
        (c) => String(c.id) === String(selectedConversationId),
      ) ??
      null
    );
  }, [selectedConversation, conversations, selectedConversationId]);

  // API Helper Functions
  // Infinite scroll fetch
  const fetchConversations = async (params = {}, append = false) => {
    try {
      setConversationsLoading(true);
      setConversationsError(null);
      const safeStatus = STATUS_FILTER_OPTIONS.includes(filters.status)
        ? filters.status
        : "open";
      const queryParams = {
        limit: pagination.limit,
        offset: pagination.offset,
        status_filter: safeStatus,
        ...(filters.escalated !== undefined && {
          escalated: filters.escalated,
        }),
        ...(filters.startDate && { start_date: filters.startDate }),
        ...(filters.endDate && { end_date: filters.endDate }),
        ...params,
      };
      const response = await axiosInstance.get("/api/chatbot/conversations", {
        params: queryParams,
      });
      const payload = response?.data?.data ?? response?.data ?? [];
      const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload?.items)
            ? payload.items
            : [];
      const normalizedRows = rows
        .map(normalizeConversation)
        .filter((r) => r.id);
      if (append) {
        setConversations((prev) => {
          // Avoid duplicates
          const ids = new Set(prev.map((c) => c.id));
          return [...prev, ...normalizedRows.filter((c) => !ids.has(c.id))];
        });
      } else {
        setConversations(normalizedRows);
        if (normalizedRows.length && !selectedConversationId) {
          setSelectedConversationId(normalizedRows[0].id);
        }
      }
      // If less than limit returned, no more data
      setHasMoreConversations(normalizedRows.length === pagination.limit);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConversationsError(error.message);
    } finally {
      setConversationsLoading(false);
    }
  };

  const fetchConversationDetail = async (conversationId) => {
    try {
      const response = await axiosInstance.get(
        `/api/chatbot/conversations/${conversationId}`,
      );
      const payload = response?.data?.data ?? response?.data ?? {};
      setSelectedConversation(normalizeConversation(payload));
    } catch (error) {
      console.error("Error fetching conversation detail:", error);
    }
  };

  const fetchChatHistory = async (sessionId) => {
    if (!sessionId) return;
    try {
      setChatHistoryLoading(true);
      // .catch(() => null) prevents the rejected promise from surfacing
      // in the Next.js dev overlay before the try-catch can handle it
      const response = await axiosInstance
        .get(`/api/chatbot/chat/history/${sessionId}`)
        .catch(() => null);
      if (!response) {
        setChatHistory([]);
        return;
      }
      const payload = response?.data?.data ?? response?.data ?? [];
      const msgs = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.messages)
          ? payload.messages
          : Array.isArray(payload?.history)
            ? payload.history
            : [];
      setChatHistory(
        msgs.map((msg, idx) => ({
          id: msg.id ?? msg.message_id ?? `msg-${idx}`,
          role:
            String(msg.role ?? msg.sender ?? "USER").toUpperCase() ===
            "ASSISTANT"
              ? "BOT"
              : String(msg.role ?? msg.sender ?? "USER").toUpperCase(),
          text: msg.content ?? msg.text ?? msg.message ?? msg.body ?? "",
          timestamp: msg.timestamp ?? msg.created_at ?? null,
        })),
      );
    } catch {
      setChatHistory([]);
    } finally {
      setChatHistoryLoading(false);
    }
  };

  const searchConversations = async (query) => {
    try {
      setConversationsLoading(true);
      const response = await axiosInstance.post("/api/chatbot/search", {
        query,
        search_type: "all",
      });
      const payload = response?.data?.data ?? response?.data ?? [];
      const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload?.items)
            ? payload.items
            : [];
      setConversations(rows.map(normalizeConversation).filter((r) => r.id));
    } catch (error) {
      console.error("Error searching conversations:", error);
      setConversationsError(error.message);
    } finally {
      setConversationsLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await axiosInstance.get("/api/chatbot/support-agents");
      const payload = response?.data ?? [];
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
          ? payload.results
          : [];
      setAgents(list);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const handleAddAgent = async () => {
    const cleanName = newAgentName.trim();
    const cleanEmail = newAgentEmail.trim();
    if (!cleanName || !cleanEmail) return;
    try {
      const response = await axiosInstance.post("/api/chatbot/support-agents", {
        name: cleanName,
        email: cleanEmail,
      });
      const newAgent = response?.data ?? null;
      if (newAgent) {
        setAgents((prev) => [...prev, newAgent]);
      }
      setNewAgentName("");
      setNewAgentEmail("");
      setIsAddAgentOpen(false);
    } catch (error) {
      console.error("Error adding agent:", error);
    }
  };

  const assignChat = async (convIds, agentId) => {
    try {
      // API expects session_id values in chat_ids, not conversation id
      const sessionIds = convIds
        .map((convId) => {
          const conv = conversations.find(
            (c) => String(c.id) === String(convId),
          );
          return conv?.session_id ?? null;
        })
        .filter(Boolean);
      if (!sessionIds.length) {
        setAssignToastMessage(
          "Could not find session ID for selected conversation.",
        );
        setAssignResponseData(null);
        setIsAssignedToast(true);
        setTimeout(() => setIsAssignedToast(false), 3000);
        return;
      }
      const response = await axiosInstance.post("/api/chatbot/assign", {
        chat_ids: sessionIds,
        agent_id: agentId,
      });
      const apiMsg =
        response?.data?.message ||
        response?.data?.detail ||
        "Conversation assigned successfully";
      setAssignToastMessage(apiMsg);
      setAssignResponseData(response.data ?? null);
      setIsAssignedToast(true);
      setTimeout(() => {
        setIsAssignedToast(false);
        setAssignResponseData(null);
      }, 3000);
      await fetchConversations();
      return response.data;
    } catch (error) {
      console.error("Error assigning chat:", error);
      setConversationsError(
        error?.response?.data?.message ||
          error?.response?.data?.detail ||
          "Failed to assign conversation.",
      );
    }
  };

  const updateChatStatus = async (chatId, status) => {
    try {
      const response = await axiosInstance.post("/api/chatbot/update-status", {
        chat_ids: [chatId],
        status,
      });
      const apiMsg =
        response?.data?.message ||
        response?.data?.detail ||
        `Status updated to "${status}"`;
      setAssignToastMessage(apiMsg);
      setAssignResponseData(null);
      setIsAssignedToast(true);
      setTimeout(() => setIsAssignedToast(false), 3000);
      await fetchConversations();
      return response.data;
    } catch (error) {
      console.error("Error updating chat status:", error);
      setConversationsError(error.message);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedConversationId) return;
    setIsStatusMenuOpen(false);
    await updateChatStatus(selectedConversationId, status);
  };

  const exportConversations = async () => {
    try {
      const response = await axiosInstance.get("/api/chatbot/export", {
        params: {
          status_filter: filters.status,
          escalated: filters.escalated,
          ...(filters.startDate && { start_date: filters.startDate }),
          ...(filters.endDate && { end_date: filters.endDate }),
        },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "chatbot-conversations.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Error exporting conversations:", error);
      setConversationsError(error.message);
    }
  };

  // Fetch conversations on mount and when params change
  useEffect(() => {
    if (canAccess) {
      setPagination((prev) => ({ ...prev, offset: 0 }));
      fetchConversations({}, false);
      fetchAgents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, canAccess]);

  // When pagination.offset changes (for infinite scroll)
  useEffect(() => {
    if (pagination.offset === 0) return; // already loaded first batch
    if (canAccess) {
      fetchConversations({}, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.offset]);

  // Use API-driven cardData for summary cards
  const data = cardData;

  const handleAssignClick = async () => {
    if (selectedConversationId) {
      await assignChat([selectedConversationId], "current_user");
    }
  };

  const handleRightAssignToAgent = async (agentId) => {
    if (!selectedConversationId) return;
    await assignChat([selectedConversationId], agentId);
    setIsRightAssignOpen(false);
    setIsRightAssignToast(true);
    setTimeout(() => setIsRightAssignToast(false), 3000);
  };

  const handleAddRuleInList = () => {
    if (!newRuleInListText.trim()) return;
    setBusinessRules((prev) => [
      ...prev,
      {
        id: `rule-${Date.now()}`,
        number: prev.length + 1,
        text: newRuleInListText.trim(),
        createdBy: "You",
        createdAt: new Date().toLocaleString(),
      },
    ]);
    setNewRuleInListText("");
    setIsRulesInlineAddOpen(false);
  };

  const openAddRuleModal = (rule = null) => {
    setIsBusinessRulesListOpen(false);
    setIsRulesInlineAddOpen(false);
    if (rule) {
      setSelectedRuleId(rule.id);
      setNewRuleText(rule.text || "");
    } else {
      setSelectedRuleId(null);
      setNewRuleText("");
    }
    setIsAddRuleOpen(true);
  };

  const openBusinessRulesList = () => {
    setSelectedRuleId(null);
    setIsBusinessRulesListOpen(true);
  };

  const handleRuleClick = (rule) => {
    setSelectedRuleId(rule.id);
    setRuleDetailData(rule);
    setIsRuleDetailOpen(true);
    setIsBusinessRulesListOpen(false);
  };

  const createAgentInitials = (name) => {
    const parts = String(name || "")
      .trim()
      .split(/\s+/);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const handleSearch = (query) => {
    setSearch(query);
    setSearchQuery(query);
    if (query.trim()) {
      searchConversations(query);
    } else {
      fetchConversations();
    }
  };

  const handleExport = async () => {
    await exportConversations();
  };

  const handleConversationSelect = (conversationId) => {
    setSelectedConversationId(conversationId);
    setSelectedConversation(null);
    setChatHistory([]);
    setChatHistoryLoading(true);
    fetchConversationDetail(conversationId);
    const conv = conversations.find(
      (c) => String(c.id) === String(conversationId),
    );
    if (conv?.session_id) {
      fetchChatHistory(conv.session_id);
    } else {
      setChatHistoryLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveConversationTab(tab);
    setSelectedChats(new Set());
    setIsConvPanelAssignOpen(false);
    const next = TAB_TO_FILTER[tab] ?? { status: "open", escalated: undefined };
    setFilters((prev) => ({
      ...prev,
      status: next.status,
      escalated: next.escalated,
    }));
  };

  const handleAssignToAgent = async (agentId) => {
    if (!selectedConversationId) return;
    await assignChat([selectedConversationId], agentId);
    setIsAgentsOpen(false);
  };

  const handleAssignConversationToSelectedAgent = async () => {
    if (!selectedConversationId || !selectedAgent?.id) return;
    await assignChat([selectedConversationId], selectedAgent.id);
    setIsAgentDetailOpen(false);
  };

  const handleToggleSelectChat = (e, convId) => {
    e.stopPropagation();
    setSelectedChats((prev) => {
      const next = new Set(prev);
      if (next.has(convId)) next.delete(convId);
      else next.add(convId);
      return next;
    });
  };

  const handleAssignSelectedChats = async (agentId) => {
    if (!selectedChats.size) return;
    await assignChat([...selectedChats], agentId);
    setSelectedChats(new Set());
    setIsConvPanelAssignOpen(false);
  };
  const handleAddRule = () => {
    if (!newRuleText.trim()) return;

    setBusinessRules((prev) => {
      if (selectedRuleId) {
        return prev.map((rule) =>
          rule.id === selectedRuleId
            ? {
                ...rule,
                text: newRuleText.trim(),
                createdAt: new Date().toLocaleString(),
              }
            : rule,
        );
      }

      return [
        ...prev,
        {
          id: `rule-${Date.now()}`,
          number: prev.length + 1,
          text: newRuleText.trim(),
          createdBy: "You",
          createdAt: new Date().toLocaleString(),
        },
      ];
    });

    setNewRuleText("");
    setSelectedRuleId(null);
    setIsAddRuleOpen(false);
  };

  if (!canAccess) {
    return (
      <main className="min-h-[calc(100vh-60px)] bg-[#f4f5f7] p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-100 bg-white p-8 shadow-sm">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-[26px] font-[800] text-gray-900">
            Support Access Required
          </h1>
          <p className="mt-2 text-[15px] text-gray-500">
            Customer Support reporting can only be accessed by users with
            Support or Manager role.
          </p>
        </div>
      </main>
    );
  }

  // Infinite scroll handler
  const convListRef = useRef(null);
  useEffect(() => {
    const handleScroll = () => {
      const el = convListRef.current;
      if (!el || conversationsLoading || !hasMoreConversations) return;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
        // Near bottom, fetch next batch
        setPagination((prev) => ({
          ...prev,
          offset: prev.offset + prev.limit,
        }));
      }
    };
    const el = convListRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (el) el.removeEventListener("scroll", handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationsLoading, hasMoreConversations]);

  return (
    <main className="min-h-[calc(100vh-60px)] bg-[#f4f5f7] p-3 sm:p-4">
      {/* Global Assign Toast — fixed so overflow-hidden never clips it */}
      {(isRightAssignToast || isAssignedToast) && (
        <div
          className="fixed bottom-6 right-6 z-[9999] flex items-start gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-2xl"
          style={{ minWidth: 260 }}
        >
          <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#061a43]">
            <Check className="h-4 w-4 text-white" />
          </span>
          <div className="flex flex-col gap-0.5">
            <p className="text-[14px] font-[700] text-[#061a43]">
              {assignToastMessage || "Conversation assigned successfully"}
            </p>
            {assignResponseData?.assigned_to && (
              <p className="text-[12px] text-gray-500">
                <span className="font-[600] text-[#253b69]">Assigned to:</span>{" "}
                {assignResponseData.assigned_to}
              </p>
            )}
            {assignResponseData?.agent_email && (
              <p className="text-[12px] text-gray-400">
                {assignResponseData.agent_email}
              </p>
            )}
            <div className="mt-1 flex items-center gap-3">
              {assignResponseData?.count != null && (
                <span className="text-[11px] font-[600] text-[#6d28d9]">
                  {assignResponseData.count} chat
                  {assignResponseData.count !== 1 ? "s" : ""} assigned
                </span>
              )}
              {assignResponseData?.email_sent != null && (
                <span
                  className={`text-[11px] font-[600] ${assignResponseData.email_sent ? "text-green-600" : "text-gray-400"}`}
                >
                  {assignResponseData.email_sent
                    ? "Email sent"
                    : "No email sent"}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Error Display */}
      {/* {conversationsError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-[14px] text-red-600">
                <p className="font-[600]">Error loading conversations</p>
                <p className="text-sm text-red-500">{conversationsError}</p>
              </div>
            )} */}
      {/* Summary Cards */}
      <section className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4">
        <SummaryCard
          title="Total Conversations"
          value={data.cards.total}
          icon={MessageCircle}
          tone="blue"
        />
        <SummaryCard
          title="Escalated Chats"
          value={data.cards.escalated}
          icon={AlertCircle}
          tone="red"
        />
        <SummaryCard
          title="Today's Chats"
          value={data.cards.today}
          icon={CalendarDays}
          tone="green"
        />
        <SummaryCard
          title="Avg Messages/Chat"
          value={data.cards.avgMessages}
          formatter={(v) => Number(v).toFixed(1)}
          icon={MessageCircle}
          tone="purple"
        />
      </section>
      {cardError && (
        <div className="mb-2 rounded-xl border border-red-200 bg-red-50 p-2 text-[13px] text-red-600">
          {cardError}
        </div>
      )}

      {/* Toolbar */}
      <section className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative w-full min-w-0 flex-1 sm:min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search conversations"
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-[13px] text-gray-700 outline-none focus:border-[#a78bfa]"
          />
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:flex-nowrap">
          {/* <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: e.target.value,
              }))
            }
            className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-[13px] font-[600] text-[#253b69] outline-none"
            title="Status Filter"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>

          <label className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3 text-[13px] font-[600] text-[#253b69]">
            <input
              type="checkbox"
              checked={!!filters.escalated}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  escalated: e.target.checked,
                }))
              }
            />
            Escalated
          </label>

          <input
            type="date"
            value={filters.startDate ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                startDate: e.target.value || null,
              }))
            }
            className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-[13px] font-[600] text-[#253b69] outline-none"
            title="Start Date"
          />

          <input
            type="date"
            value={filters.endDate ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                endDate: e.target.value || null,
              }))
            }
            className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-[13px] font-[600] text-[#253b69] outline-none"
            title="End Date"
          /> */}

          {/* Agents button + dropdown */}
          <div className="relative flex-1 sm:flex-none" ref={agentsDropdownRef}>
            <button
              type="button"
              onClick={() => setIsAgentsOpen((p) => !p)}
              className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl border bg-white px-3 py-2 text-[12px] font-[600] text-[#253b69] sm:px-4 ${isAgentsOpen ? "border-[#7c3aed]" : "border-gray-200"}`}
            >
              <UserCog className="h-3.5 w-3.5" /> Agents
            </button>
            {isAgentsOpen && (
              <div className="absolute left-0 top-[calc(100%+8px)] z-30 w-[300px] rounded-2xl border border-gray-200 bg-white shadow-xl">
                <div className="flex items-center justify-between px-5 py-4">
                  <h3 className="text-[15px] font-[700] text-[#061a43]">
                    Team Agents
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddAgentOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#7c3aed] px-4 py-2 text-[13px] font-[600] text-white"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Agent
                  </button>
                </div>
                <div className="max-h-[260px] overflow-y-auto px-3 pb-3">
                  {agents.map((agent) => (
                    <button
                      key={agent.name}
                      type="button"
                      onClick={() => {
                        setSelectedAgent(agent);
                        setIsAgentDetailOpen(true);
                        setIsAgentsOpen(false);
                      }}
                      className="w-full text-left"
                    >
                      <div className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-[#f5f0ff]">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7c3aed] text-[13px] font-[700] text-white">
                          {createAgentInitials(agent.name)}
                        </span>
                        <div>
                          <p className="text-[14px] font-[600] text-[#061a43]">
                            {agent.name}
                          </p>
                          <p className="flex items-center gap-1.5 text-[13px] text-gray-500">
                            <span
                              className={`h-2 w-2 rounded-full ${agent.is_active ? "bg-green-500" : "bg-gray-400"}`}
                            />
                            {agent.is_active ? "Online" : "Offline"}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Business Rules List button (open list popup) */}
          <button
            type="button"
            onClick={openBusinessRulesList}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#8b5cf6] bg-white px-3 py-2 text-[12px] font-[600] text-[#6d28d9] sm:flex-none sm:px-4"
          >
            <ClipboardList className="h-3.5 w-3.5" /> Business Rules
          </button>

          {/* Export CSV */}
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#4f46e5] px-3 py-2 text-[12px] font-[700] text-white sm:flex-none sm:px-4"
            onClick={handleExport}
            disabled={conversationsLoading}
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </section>

      {/* Main grid */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Conversations Panel */}
        <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-3 py-3 sm:px-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-[800] text-[#061a43]">
                Conversations
              </h3>
              {selectedChats.size > 0 && (
                <div className="relative" ref={convAssignDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsConvPanelAssignOpen((v) => !v)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[13px] font-[600] text-white transition-colors ${isConvPanelAssignOpen ? "border-[#6d28d9] bg-[#6d28d9]" : "border-[#7c3aed] bg-[#7c3aed] hover:bg-[#6d28d9]"}`}
                  >
                    <UserCog className="h-4 w-4" />
                    Assign ({selectedChats.size})
                  </button>
                  {isConvPanelAssignOpen && (
                    <div className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                      <p className="border-b border-gray-100 px-3 py-2 text-[11px] font-[700] uppercase tracking-wide text-gray-400">
                        Assign to agent
                      </p>
                      {agents.map((agent) => (
                        <button
                          key={agent.id}
                          type="button"
                          onClick={() => handleAssignSelectedChats(agent.id)}
                          className="flex w-full items-center justify-between px-3 py-2.5 text-left text-[13px] text-[#1f365f] hover:bg-[#f7f9ff]"
                        >
                          <span className="font-[600]">{agent.name}</span>
                          <span
                            className={`text-[11px] ${agent.is_active ? "text-green-600" : "text-gray-400"}`}
                          >
                            {agent.is_active ? "Online" : "Offline"}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-100">
            <div className="flex items-center overflow-x-auto">
              {CONVERSATION_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  className={`min-w-[80px] flex-1 border-b-2 px-2 py-2.5 text-center text-[11px] font-[500] leading-snug whitespace-nowrap sm:min-w-[90px] sm:text-[12px] ${
                    activeConversationTab === tab
                      ? "border-[#7c3aed] text-[#7c3aed]"
                      : "border-transparent text-[#3c4f75]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation list */}
          <div
            className="flex-1 min-h-[200px] max-h-[calc(100vh-320px)] overflow-y-auto"
            ref={convListRef}
          >
            {" "}
            {conversationsLoading ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <SkeletonConvItem key={i} />
                ))}
              </>
            ) : filteredConversations.length === 0 ? (
              <div className="animate-fadeInUp px-6 py-10 text-center">
                <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                  <MessageCircle className="h-7 w-7 text-gray-400" />
                </div>
                <p className="text-[15px] font-[700] text-[#334e78]">
                  No conversations yet
                </p>
                <p className="mt-1 text-[13px] text-gray-400">
                  There are no chats in this category right now.
                </p>
                <button
                  type="button"
                  onClick={() => fetchConversations()}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[12px] font-[600] text-[#253b69] hover:bg-gray-100"
                >
                  <Search className="h-3.5 w-3.5" /> Refresh
                </button>
              </div>
            ) : (
              filteredConversations.map((conv, idx) => (
                <div
                  key={conv.id}
                  style={{ animationDelay: `${idx * 40}ms` }}
                  className={`animate-fadeInUp relative flex w-full border-b border-slate-200 border-l-4 transition-colors duration-200 hover:bg-[#faf8ff] ${
                    selectedConversationId === conv.id
                      ? "border-l-[#7c3aed] bg-[#eaf3ff]"
                      : "border-l-transparent"
                  }`}
                >
                  {/* Checkbox — only on Escalated Chats tab */}
                  {activeConversationTab === "Escalated Chats" && (
                    <div className="flex shrink-0 items-start pt-5 pl-4">
                      <button
                        type="button"
                        onClick={(e) => handleToggleSelectChat(e, conv.id)}
                        className={`flex h-4.5 w-4.5 items-center justify-center rounded border transition-colors ${
                          selectedChats.has(conv.id)
                            ? "border-[#7c3aed] bg-[#7c3aed]"
                            : "border-gray-300 bg-white hover:border-[#7c3aed]"
                        }`}
                        aria-label="Select conversation"
                      >
                        {selectedChats.has(conv.id) && (
                          <Check
                            className="h-3 w-3 text-white"
                            strokeWidth={3}
                          />
                        )}
                      </button>
                    </div>
                  )}
                  {/* Row content */}
                  <button
                    type="button"
                    onClick={() => handleConversationSelect(conv.id)}
                    className="flex-1 px-3 py-3 text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[13px] font-[700] leading-tight text-[#04163d]">
                          {conv.lead}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-[12px] text-[#586a8f]">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ef4444]" />
                          <span className="truncate">{conv.email}</span>
                        </p>
                        <p className="mt-1 text-[11px] text-[#2f456f]">
                          {conv.preview}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <p className="whitespace-nowrap text-[11px] text-[#60759b]">
                          {String(conv.time)}
                        </p>
                        {conv.escalated && (
                          <span className="rounded-full bg-[#ef4444] px-2 py-0.5 text-[10px] font-[600] text-white">
                            Escalated
                          </span>
                        )}
                        {conv.assignedTo && (
                          <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-[600] text-[#4a5d81]">
                            {conv.assignedTo}
                          </span>
                        )}
                        {conv.status && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-[600] ${
                              conv.status === "open"
                                ? "bg-blue-100 text-blue-700"
                                : conv.status === "responded"
                                  ? "bg-green-100 text-green-700"
                                  : conv.status === "closed"
                                    ? "bg-gray-100 text-gray-500"
                                    : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {conv.status.charAt(0).toUpperCase() +
                              conv.status.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              ))
            )}
          </div>
        </article>

        {/* Messages Panel */}
        <article className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-3 py-3 sm:px-4">
            <h3 className="text-[14px] font-[800] text-[#061a43]">Messages</h3>
            <div className="flex items-center gap-2">
              {/* Three-dots status menu */}
              <div className="relative" ref={statusMenuRef}>
                {isStatusMenuOpen && (
                  <div className="absolute right-0 z-30 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                    <p className="border-b border-gray-100 px-3 py-2 text-[11px] font-[700] uppercase tracking-wide text-gray-400">
                      Update Status
                    </p>
                    {[
                      // { label: "Mark as open", status: "open" },
                      { label: "Mark as responded", status: "responded" },
                      { label: "Mark as closed", status: "closed" },
                    ].map((item) => (
                      <button
                        key={item.status}
                        type="button"
                        onClick={() => handleUpdateStatus(item.status)}
                        className="flex w-full items-center px-3 py-2.5 text-left text-[13px] text-[#1f365f] hover:bg-[#f7f9ff]"
                      >
                        <span
                          className={`mr-2 h-2 w-2 rounded-full ${
                            item.status === "open"
                              ? "bg-blue-500"
                              : item.status === "responded"
                                ? "bg-green-500"
                                : "bg-gray-400"
                          }`}
                        />
                        <span className="font-[600]">{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative" ref={rightAssignDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsRightAssignOpen((v) => !v)}
                  disabled={!selectedConversationId}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[12px] font-[600] text-[#253b69] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 ${isRightAssignOpen ? "border-[#7c3aed] bg-[#f5f0ff]" : "border-gray-200 bg-white"}`}
                >
                  <User className="h-4 w-4" />
                  {selectedConversationCard?.assignedTo
                    ? `Assigned: ${selectedConversationCard.assignedTo}`
                    : "Assign"}
                </button>
                {isRightAssignOpen && (
                  <div className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                    <p className="border-b border-gray-100 px-3 py-2 text-[11px] font-[700] uppercase tracking-wide text-gray-400">
                      Assign to agent
                    </p>
                    {agents.length === 0 ? (
                      <p className="px-3 py-3 text-[13px] text-gray-400">
                        No agents available
                      </p>
                    ) : (
                      agents.map((agent) => (
                        <button
                          key={agent.id}
                          type="button"
                          onClick={() => handleRightAssignToAgent(agent.id)}
                          className="flex w-full items-center justify-between px-3 py-2.5 text-left text-[13px] text-[#1f365f] hover:bg-[#f7f9ff]"
                        >
                          <span className="font-[600]">{agent.name}</span>
                          <span
                            className={`text-[11px] ${agent.is_active ? "text-green-600" : "text-gray-400"}`}
                          >
                            {agent.is_active ? "Online" : "Offline"}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={openAddRuleModal}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-[12px] font-[600] text-[#253b69] hover:bg-gray-50"
              >
                <ClipboardList className="h-3.5 w-3.5" /> Add Rules
              </button>
              <button
                type="button"
                onClick={() => setIsStatusMenuOpen((v) => !v)}
                disabled={!selectedConversationId}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#253b69] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                title="Update status"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            {/* {selectedConversationCard && (
              <div className="border-b border-gray-100 bg-[#f8fbff] px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-[700] text-[#0f2a57]">{selectedConversationCard.lead}</p>
                    <p className="text-[12px] text-[#5a6f95]">{selectedConversationCard.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-[700] ${selectedConversationCard.escalated ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"}`}>
                      {selectedConversationCard.escalated ? "Escalated" : "Active"}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-[600] text-[#4a5d81] border border-gray-200">
                      {selectedConversationCard.assignedTo ? `Assigned: ${selectedConversationCard.assignedTo}` : "Unassigned"}
                    </span>
                  </div>
                </div>
              </div>
            )} */}

            <div className="overflow-y-auto" style={{ maxHeight: 320 }}>
              {chatHistoryLoading ? (
                <div className="space-y-1 bg-white px-4 py-3">
                  {[...Array(4)].map((_, i) => (
                    <SkeletonMessage key={i} isBot={i % 2 === 1} />
                  ))}
                </div>
              ) : chatHistory.length === 0 ? (
                <div className="animate-fadeInUp flex flex-col items-center justify-center py-12">
                  <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
                    <MessageCircle className="h-6 w-6 text-gray-300" />
                  </span>
                  <p className="text-[14px] font-[600] text-gray-400">
                    No messages to display
                  </p>
                  <p className="mt-1 text-[12px] text-gray-300">
                    Select a conversation to view its messages
                  </p>
                </div>
              ) : (
                <div className="animate-fadeInUp space-y-1 bg-white px-4 py-3">
                  {chatHistory.map((item) => {
                    const isBot = item.role === "BOT";
                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 rounded-xl px-3 py-3 hover:bg-[#fafafa]"
                      >
                        <span
                          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isBot ? "bg-[#9b5cf5] text-white" : "bg-[#3b82f6] text-white"}`}
                        >
                          {isBot ? (
                            <Bot className="h-4 w-4" />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[14px] font-[700] text-[#1a2d57]">
                              {isBot ? "BOT" : "USER"}
                            </p>
                            {item.timestamp && (
                              <p className="text-[11px] text-gray-400">
                                {new Date(item.timestamp).toLocaleString()}
                              </p>
                            )}
                          </div>
                          <p className="mt-1 text-[13px] leading-relaxed text-slate-700">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </article>
      </section>

      {/* Business Rules List Modal */}
      {isBusinessRulesListOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsBusinessRulesListOpen(false);
          }}
        >
          <div
            className="relative flex w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl"
            style={{ maxHeight: "85vh" }}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between border-b border-gray-100 px-8 pt-7 pb-5">
              <div className="flex-1 pr-4">
                <h2 className="text-[22px] font-[800] text-[#061a43]">
                  Business Rules List
                </h2>
                <p className="mt-1 text-[14px] text-gray-500">
                  View all business rules that have been created for the
                  chatbot.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openAddRuleModal}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#7c3aed] px-4 py-2.5 text-[13px] font-[700] text-white hover:bg-[#6d28d9]"
                >
                  <ClipboardList className="h-4 w-4" /> Add Business Rules
                </button>
                <button
                  type="button"
                  onClick={() => setIsBusinessRulesListOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            {/* Inline add form (shown when Add Business Rules clicked) */}
            {isRulesInlineAddOpen && (
              <div className="border-b border-gray-100 bg-[#faf8ff] px-8 py-4">
                <p className="mb-2 text-[13px] font-[600] text-[#061a43]">
                  New Business Rule
                </p>
                <textarea
                  value={newRuleInListText}
                  onChange={(e) => setNewRuleInListText(e.target.value)}
                  placeholder="Enter business rule here..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-300 bg-white p-3 text-[13px] text-gray-700 outline-none focus:border-[#a78bfa]"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRulesInlineAddOpen(false);
                      setNewRuleInListText("");
                    }}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-[13px] font-[600] text-[#253b69] hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddRuleInList}
                    className="rounded-xl bg-[#7c3aed] px-4 py-2 text-[13px] font-[700] text-white hover:bg-[#6d28d9]"
                  >
                    Save Rule
                  </button>
                </div>
              </div>
            )}
            {/* Rules list */}
            <div className="flex-1 overflow-y-auto px-8 py-5 space-y-4">
              {businessRules.length === 0 ? (
                <p className="py-8 text-center text-[14px] text-gray-400">
                  No business rules yet. Add your first rule above.
                </p>
              ) : (
                businessRules.map((rule) => {
                  const isSelected = selectedRuleId === rule.id;
                  return (
                    <button
                      key={rule.id}
                      type="button"
                      onClick={() => handleRuleClick(rule)}
                      className={`w-full rounded-xl border px-0 text-left transition ${isSelected ? "border-green-500 bg-green-50" : "border-gray-100 bg-white hover:bg-gray-50"}`}
                    >
                      <div
                        style={{ borderLeft: "4px solid #7c3aed" }}
                        className="px-5 py-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-[13px] font-[600] text-[#253b69]">
                            Rule #{rule.number}
                          </span>
                          <div className="text-right">
                            <p className="text-[13px] font-[500] text-gray-500">
                              Created by {rule.createdBy}
                            </p>
                            <p className="text-[12px] text-gray-400">
                              {rule.createdAt}
                            </p>
                          </div>
                        </div>
                        <p className="mt-4 text-[14px] leading-relaxed text-[#1a2d57]">
                          {rule.text}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            {/* Bottom action section */}
            <div className="border-t border-gray-100 px-8 py-4">
              <div className="flex items-center justify-end">
                {/* <button
                  type="button"
                  onClick={openAddRuleModal}
                  className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[#8b5cf6] bg-[#faf8ff] px-4 py-2.5 text-[13px] font-[600] text-[#6d28d9] hover:bg-[#f3eeff]"
                >
                  <Plus className="h-4 w-4" /> Add Business Rules
                </button> */}
                <button
                  type="button"
                  onClick={() => setIsBusinessRulesListOpen(false)}
                  className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-[14px] font-[600] text-[#253b69] hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rule Details Modal */}
      {isRuleDetailOpen && ruleDetailData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsRuleDetailOpen(false);
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setIsRuleDetailOpen(false)}
              className="absolute right-3 top-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="px-8 pb-8 pt-8">
              <h2 className="text-[22px] font-[800] text-[#061a43]">
                Rule Details
              </h2>
              <p className="mt-2 text-[14px] text-gray-500">
                View details for the selected business rule.
              </p>
              <div className="mt-6 rounded-xl border border-gray-200 bg-[#f8fbff] p-4">
                <p className="text-[13px] font-[700] text-[#253b69]">
                  Rule #{ruleDetailData.number}
                </p>
                <p className="mt-2 text-[14px] text-[#1a2d57]">
                  {ruleDetailData.text}
                </p>
                <p className="mt-3 text-[12px] text-gray-500">
                  Created by {ruleDetailData.createdBy}
                </p>
                <p className="text-[12px] text-gray-400">
                  {ruleDetailData.createdAt}
                </p>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRuleDetailOpen(false)}
                  className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-[14px] font-[600] text-[#253b69] hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRuleDetailOpen(false);
                    openAddRuleModal(ruleDetailData);
                  }}
                  className="rounded-xl bg-[#7c3aed] px-6 py-2.5 text-[14px] font-[700] text-white hover:bg-[#6d28d9]"
                >
                  Edit Rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agent Details Modal */}
      {isAgentDetailOpen && selectedAgent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAgentDetailOpen(false);
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setIsAgentDetailOpen(false)}
              className="absolute right-3 top-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="px-8 pb-8 pt-8">
              <h2 className="text-[22px] font-[800] text-[#061a43]">
                Agent Details
              </h2>
              <p className="mt-2 text-[14px] text-gray-500">
                View details for the selected agent.
              </p>
              <div className="mt-6 rounded-xl border border-gray-200 bg-[#f8fbff] p-4">
                <p className="text-[13px] font-[700] text-[#253b69]">
                  {selectedAgent.name}
                </p>
                <p className="mt-2 text-[14px] text-[#1a2d57]">
                  Email: {selectedAgent.email}
                </p>
                <p className="mt-2 text-[14px] text-[#1a2d57]">
                  Status: {selectedAgent.is_active ? "Active" : "Inactive"}
                </p>
                <p className="mt-2 text-[12px] text-gray-500">
                  ID: {selectedAgent.id ?? "N/A"}
                </p>
                <p className="mt-3 text-[12px] text-gray-500">
                  Initials: {createAgentInitials(selectedAgent.name)}
                </p>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleAssignConversationToSelectedAgent}
                  className="rounded-xl border border-blue-200 bg-blue-50 px-6 py-2.5 text-[14px] font-[600] text-[#1d4ed8] hover:bg-blue-100"
                >
                  Assign to Conversation
                </button>
                <button
                  type="button"
                  onClick={() => setIsAgentDetailOpen(false)}
                  className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-[14px] font-[600] text-[#253b69] hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Agent Modal */}
      {isAddAgentOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddAgentOpen(false);
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setIsAddAgentOpen(false)}
              className="absolute right-3 top-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="px-8 pb-8 pt-8">
              <h2 className="text-[22px] font-[800] text-[#061a43]">
                Add New Agent
              </h2>
              <p className="mt-1 text-[14px] text-gray-500">
                Enter agent name and email to add to team.
              </p>
              <input
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                placeholder="Enter agent name"
                className="mt-5 w-full rounded-xl border border-gray-300 bg-[#f6f6f6] px-3 py-2 text-[14px] text-gray-700 outline-none focus:border-[#a78bfa]"
              />
              <input
                value={newAgentEmail}
                onChange={(e) => setNewAgentEmail(e.target.value)}
                placeholder="Enter agent email"
                className="mt-3 w-full rounded-xl border border-gray-300 bg-[#f6f6f6] px-3 py-2 text-[14px] text-gray-700 outline-none focus:border-[#a78bfa]"
              />
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddAgentOpen(false)}
                  className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-[14px] font-[600] text-[#253b69] hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddAgent}
                  className="rounded-xl bg-[#7c3aed] px-6 py-2.5 text-[14px] font-[700] text-white hover:bg-[#6d28d9]"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Business Rules Modal */}
      {isAddRuleOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddRuleOpen(false);
          }}
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setIsAddRuleOpen(false)}
              className="absolute right-3 top-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="px-8 pb-8 pt-8">
              <h2 className="text-[22px] font-[800] text-[#061a43]">
                Add Business Rules
              </h2>
              <p className="mt-1 text-[14px] text-gray-500">
                Enter the business rules for this message or conversation.
              </p>
              <textarea
                value={newRuleText}
                onChange={(e) => setNewRuleText(e.target.value)}
                placeholder="Enter business rules here..."
                rows={7}
                className="mt-5 w-full resize-none rounded-xl border border-gray-300 bg-[#f6f6f6] p-4 text-[14px] text-gray-700 outline-none focus:border-[#a78bfa]"
              />
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddRuleOpen(false)}
                  className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-[14px] font-[600] text-[#253b69] hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddRule}
                  className="rounded-xl bg-[#7c3aed] px-6 py-2.5 text-[14px] font-[700] text-white hover:bg-[#6d28d9]"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

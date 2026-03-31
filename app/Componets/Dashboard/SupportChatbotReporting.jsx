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
  "Open Chats": { status: "open", escalated: false },
  "Escalated Chats": { status: "all", escalated: true },
  "Responded Chats": { status: "responded", escalated: false },
  "Closed Chats": { status: "closed", escalated: false },
};

const AGENTS = [
  { initials: "SC", name: "Sarah Chen", status: "Online" },
  { initials: "MJ", name: "Mike Johnson", status: "Online" },
  { initials: "ED", name: "Emily Davis", status: "Offline" },
  { initials: "LA", name: "Lisa Anderson", status: "Online" },
  { initials: "JW", name: "James Wilson", status: "Online" },
];

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
  const stage = isEscalated
    ? "Escalated Chats"
    : rawStatus.includes("closed")
      ? "Closed Chats"
      : "Open Chats";

  return {
    id: String(row.id ?? row.chat_id ?? row.conversation_id ?? ""),
    session_id: row.session_id ?? null,
    lead:
      row.lead_name ?? row.lead ?? row.customer_name ?? row.user_name ?? row.name ?? "Unknown Lead",
    email: row.email ?? row.customer_email ?? row.user_email ?? "No email",
    preview:
      row.preview ?? row.last_message ?? row.message_preview ?? row.message ?? "No message preview",
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
      <span className={`inline-flex h-8 w-8 shrink-0 rounded-lg ${isBot ? "bg-purple-200" : "bg-blue-200"}`} />
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
    blue: {
      card: "bg-[#e9f1ff] border-[#b8d2ff]",
      iconWrap: "bg-[#cfe2ff] text-[#2563eb]",
    },
    red: {
      card: "bg-[#ffeef0] border-[#f8b4bc]",
      iconWrap: "bg-[#ffd8dd] text-[#ef4444]",
    },
    green: {
      card: "bg-[#e9f9ef] border-[#9de3b0]",
      iconWrap: "bg-[#c8efcf] text-[#16a34a]",
    },
    purple: {
      card: "bg-[#f3ebff] border-[#dcc6ff]",
      iconWrap: "bg-[#e5d4ff] text-[#9333ea]",
    },
  };

  return (
    <article className={`rounded-2xl border px-5 py-6 ${tones[tone].card}`}>
      <div className="flex items-start justify-between">
        <div className="">
          <p className="text-[14px] font-[500] text-[#314f7d]">{title}</p>
          <p className="text-[30px] font-[800] leading-none text-[#091a44]">
            {formatter ? formatter(value) : value}
          </p>
        </div>
        <span
          className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${tones[tone].iconWrap}`}
        >
          <Icon className="h-6 w-6" />
        </span>
      </div>
    </article>
  );
}

export default function SupportChatbotReporting() {
  const [activeApp] = useState("webchat");
  const [search, setSearch] = useState("");
  const [activeConversationTab, setActiveConversationTab] =
    useState("Open Chats");
  const [selectedConversationId, setSelectedConversationId] =
    useState("conv-2");
  const [isAgentsOpen, setIsAgentsOpen] = useState(false);
  const [selectedChats, setSelectedChats] = useState(new Set());
  const [isConvPanelAssignOpen, setIsConvPanelAssignOpen] = useState(false);
  const agentsDropdownRef = useRef(null);
  const convAssignDropdownRef = useRef(null);

  // Close Agents and ConvPanel-Assign dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (agentsDropdownRef.current && !agentsDropdownRef.current.contains(e.target)) {
        setIsAgentsOpen(false);
      }
      if (convAssignDropdownRef.current && !convAssignDropdownRef.current.contains(e.target)) {
        setIsConvPanelAssignOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [newRuleText, setNewRuleText] = useState("");
  const [selectedRuleId, setSelectedRuleId] = useState(null);
  const [isRuleDetailOpen, setIsRuleDetailOpen] = useState(false);
  const [ruleDetailData, setRuleDetailData] = useState(null);
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isAgentDetailOpen, setIsAgentDetailOpen] = useState(false);
  const [agents, setAgents] = useState(AGENTS);
  const [isAssignedToast, setIsAssignedToast] = useState(false);
  const [isRightAssignToast, setIsRightAssignToast] = useState(false);
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
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
  });

  const role =
    typeof window === "undefined"
      ? ""
      : normalizeRole(localStorage.getItem("userRole"));
  const canAccess = role === "SUPPORT" || role === "MANAGER";

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const inTab = c.stage === activeConversationTab;
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
      conversations.find((c) => String(c.id) === String(selectedConversationId)) ??
      null
    );
  }, [selectedConversation, conversations, selectedConversationId]);

  // API Helper Functions
  const fetchConversations = async (params = {}) => {
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
        escalated: filters.escalated,
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
      const normalizedRows = rows.map(normalizeConversation).filter((r) => r.id);
      setConversations(normalizedRows);
      if (normalizedRows.length && !selectedConversationId) {
        setSelectedConversationId(normalizedRows[0].id);
      }
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
        `/api/chatbot/conversations/${conversationId}`
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
      const response = await axiosInstance.get(`/api/chatbot/chat/history/${sessionId}`);
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
            String(msg.role ?? msg.sender ?? "USER").toUpperCase() === "ASSISTANT"
              ? "BOT"
              : String(msg.role ?? msg.sender ?? "USER").toUpperCase(),
          text: msg.content ?? msg.text ?? msg.message ?? msg.body ?? "",
          timestamp: msg.timestamp ?? msg.created_at ?? null,
        }))
      );
    } catch (error) {
      console.error("Error fetching chat history:", error);
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

  const assignChat = async (chatIds, assignedTo) => {
    try {
      const response = await axiosInstance.post("/api/chatbot/assign", {
        chat_ids: chatIds,
        assigned_to: assignedTo,
      });
      setIsAssignedToast(true);
      setTimeout(() => setIsAssignedToast(false), 3000);
      await fetchConversations();
      return response.data;
    } catch (error) {
      console.error("Error assigning chat:", error);
      setConversationsError(error.message);
    }
  };

  const updateChatStatus = async (chatId, status) => {
    try {
      const response = await axiosInstance.post("/api/chatbot/update-status", {
        chat_id: chatId,
        status,
      });
      await fetchConversations();
      return response.data;
    } catch (error) {
      console.error("Error updating chat status:", error);
      setConversationsError(error.message);
    }
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
      fetchConversations();
    }
  }, [filters, pagination, canAccess]);

  const data = useMemo(() => REPORTING_DATA[activeApp], [activeApp]);

  const handleAssignClick = async () => {
    if (selectedConversationId) {
      await assignChat([selectedConversationId], "current_user");
    }
  };

  const handleRightAssignClick = async () => {
    if (!selectedConversationId) return;
    try {
      await axiosInstance.post("/api/chatbot/assign", {
        chat_ids: [selectedConversationId],
        assigned_to: "current_user",
      });
      setIsRightAssignToast(true);
      setTimeout(() => setIsRightAssignToast(false), 3000);
    } catch (error) {
      console.error("Error assigning chat:", error);
    }
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
    const parts = String(name || "").trim().split(/\s+/);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const handleAddAgent = () => {
    const cleanName = newAgentName.trim();
    if (!cleanName) return;
    const newAgent = {
      initials: createAgentInitials(cleanName),
      name: cleanName,
      status: "Online",
    };
    setAgents((prev) => [...prev, newAgent]);
    setNewAgentName("");
    setIsAddAgentOpen(false);
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
    const conv = conversations.find((c) => String(c.id) === String(conversationId));
    if (conv?.session_id) {
      fetchChatHistory(conv.session_id);
    } else {
      setChatHistoryLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveConversationTab(tab);
    const next = TAB_TO_FILTER[tab] ?? { status: "open", escalated: false };
    setFilters((prev) => ({
      ...prev,
      status: next.status,
      escalated: next.escalated,
    }));
  };

  const handleAssignToAgent = async (agentName) => {
    if (!selectedConversationId) return;
    await assignChat([selectedConversationId], agentName);
    setIsAgentsOpen(false);
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

  const handleAssignSelectedChats = async (agentName) => {
    if (!selectedChats.size) return;
    await assignChat([...selectedChats], agentName);
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
            : rule
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

  return (
    <main className="min-h-[calc(100vh-60px)] bg-[#f4f5f7] p-3 sm:p-6">
            {/* Error Display */}
            {/* {conversationsError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-[14px] text-red-600">
                <p className="font-[600]">Error loading conversations</p>
                <p className="text-sm text-red-500">{conversationsError}</p>
              </div>
            )} */}
      {/* Summary Cards */}
      <section className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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

      {/* Toolbar */}
      <section className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full min-w-0 flex-1 sm:min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search conversations"
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-[14px] text-gray-700 outline-none focus:border-[#a78bfa]"
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
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border bg-white px-4 py-3 text-[14px] font-[600] text-[#253b69] sm:px-5 ${isAgentsOpen ? "border-[#7c3aed]" : "border-gray-200"}`}
            >
              <UserCog className="h-4 w-4" /> Agents
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
                          {agent.initials}
                        </span>
                        <div>
                          <p className="text-[14px] font-[600] text-[#061a43]">
                            {agent.name}
                          </p>
                          <p className="flex items-center gap-1.5 text-[13px] text-gray-500">
                            <span
                              className={`h-2 w-2 rounded-full ${agent.status === "Online" ? "bg-green-500" : "bg-gray-400"}`}
                            />
                            {agent.status}
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
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#8b5cf6] bg-white px-4 py-3 text-[14px] font-[600] text-[#6d28d9] sm:flex-none sm:px-5"
          >
            <ClipboardList className="h-4 w-4" />  Business Rules List
          </button>

          {/* Export CSV */}
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#4f46e5] px-4 py-3 text-[14px] font-[700] text-white sm:flex-none sm:px-5"
                      onClick={handleExport}
                      disabled={conversationsLoading}
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </section>

      {/* Main grid */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Conversations Panel */}
        <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[18px] font-[800] text-[#061a43]">Conversations</h3>
              <div className="relative" ref={convAssignDropdownRef}>
                <button
                  type="button"
                  disabled={selectedChats.size === 0}
                  onClick={() => setIsConvPanelAssignOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-[600] text-[#253b69] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <UserCog className="h-4 w-4" />
                  Assign{selectedChats.size > 0 ? ` (${selectedChats.size})` : ""}
                </button>
                {isConvPanelAssignOpen && selectedChats.size > 0 && (
                  <div className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                    <p className="border-b border-gray-100 px-3 py-2 text-[11px] font-[700] uppercase tracking-wide text-gray-400">Assign to agent</p>
                    {AGENTS.map((agent) => (
                      <button
                        key={agent.name}
                        type="button"
                        onClick={() => handleAssignSelectedChats(agent.name)}
                        className="flex w-full items-center justify-between px-3 py-2.5 text-left text-[13px] text-[#1f365f] hover:bg-[#f7f9ff]"
                      >
                        <span className="font-[600]">{agent.name}</span>
                        <span className={`text-[11px] ${agent.status === "Online" ? "text-green-600" : "text-gray-400"}`}>{agent.status}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
                  className={`min-w-[90px] flex-1 border-b-2 px-2 py-4 text-center text-[13px] font-[500] leading-snug whitespace-nowrap sm:min-w-[100px] sm:text-[14px] ${
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
          <div className="max-h-[380px] overflow-y-auto">
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
                <p className="text-[15px] font-[700] text-[#334e78]">No conversations yet</p>
                <p className="mt-1 text-[13px] text-gray-400">There are no chats in this category right now.</p>
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
                  {/* Checkbox */}
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
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      )}
                    </button>
                  </div>
                  {/* Row content */}
                  <button
                    type="button"
                    onClick={() => handleConversationSelect(conv.id)}
                    className="flex-1 px-4 py-5 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[16px] font-[700] leading-tight text-[#04163d]">
                          {conv.lead}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-[14px] text-[#586a8f]">
                          <span className="h-2 w-2 shrink-0 rounded-full bg-[#ef4444]" />
                          <span className="truncate">{conv.email}</span>
                        </p>
                        <p className="mt-2 text-[13px] text-[#2f456f]">
                          {conv.preview}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <p className="whitespace-nowrap text-[13px] text-[#60759b]">
                          {String(conv.time)}
                        </p>
                        {conv.escalated && (
                          <span className="rounded-full bg-[#ef4444] px-3 py-1 text-[11px] font-[600] text-white">
                            Escalated
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-6">
            <h3 className="text-[16px] font-[800] text-[#061a43]">Messages</h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRightAssignClick}
                disabled={!selectedConversationId}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-[14px] font-[600] text-[#253b69] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <User className="h-4 w-4" /> Assign
              </button>
              <button
                type="button"
                onClick={openAddRuleModal}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-[14px] font-[600] text-[#253b69] hover:bg-gray-50"
              >
                <ClipboardList className="h-4 w-4" /> Add Business Rules
              </button>
            </div>
          </div>

          <div>
            {selectedConversationCard && (
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
            )}

            <div className="overflow-y-auto" style={{ maxHeight: 420 }}>
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
                  <p className="text-[14px] font-[600] text-gray-400">No messages to display</p>
                  <p className="mt-1 text-[12px] text-gray-300">Select a conversation to view its messages</p>
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

          {/* Assigned toast (right panel) */}
          {isRightAssignToast && (
            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-xl">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#061a43]">
                <Check className="h-4 w-4 text-white" />
              </span>
              <div>
                <p className="text-[14px] font-[700] text-[#061a43]">Assigned</p>
                <p className="text-[13px] text-gray-500">Conversation assigned successfully</p>
              </div>
            </div>
          )}
        </article>
      </section>

{/* Business Rules List Modal */}
      {isBusinessRulesListOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsBusinessRulesListOpen(false); }}
        >
          <div className="relative flex w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl" style={{ maxHeight: "85vh" }}>
            {/* Modal header */}
            <div className="flex items-start justify-between border-b border-gray-100 px-8 pt-7 pb-5">
              <div className="flex-1 pr-4">
                <h2 className="text-[22px] font-[800] text-[#061a43]">Business Rules List</h2>
                <p className="mt-1 text-[14px] text-gray-500">View all business rules that have been created for the chatbot.</p>
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
                <p className="mb-2 text-[13px] font-[600] text-[#061a43]">New Business Rule</p>
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
                    onClick={() => { setIsRulesInlineAddOpen(false); setNewRuleInListText(""); }}
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
                <p className="py-8 text-center text-[14px] text-gray-400">No business rules yet. Add your first rule above.</p>
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
                      <div style={{ borderLeft: "4px solid #7c3aed" }} className="px-5 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <span className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-[13px] font-[600] text-[#253b69]">Rule #{rule.number}</span>
                          <div className="text-right">
                            <p className="text-[13px] font-[500] text-gray-500">Created by {rule.createdBy}</p>
                            <p className="text-[12px] text-gray-400">{rule.createdAt}</p>
                          </div>
                        </div>
                        <p className="mt-4 text-[14px] leading-relaxed text-[#1a2d57]">{rule.text}</p>
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
                <p className="text-[13px] font-[700] text-[#253b69]">Rule #{ruleDetailData.number}</p>
                <p className="mt-2 text-[14px] text-[#1a2d57]">{ruleDetailData.text}</p>
                <p className="mt-3 text-[12px] text-gray-500">Created by {ruleDetailData.createdBy}</p>
                <p className="text-[12px] text-gray-400">{ruleDetailData.createdAt}</p>
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
                <p className="text-[13px] font-[700] text-[#253b69]">{selectedAgent.name}</p>
                <p className="mt-2 text-[14px] text-[#1a2d57]">Status: {selectedAgent.status}</p>
                <p className="mt-3 text-[12px] text-gray-500">Initials: {selectedAgent.initials}</p>
              </div>
              <div className="mt-5 flex justify-end gap-2">
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
              <h2 className="text-[22px] font-[800] text-[#061a43]">Add New Agent</h2>
              <p className="mt-1 text-[14px] text-gray-500">Enter agent name to add to team.</p>
              <input
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                placeholder="Enter agent name"
                className="mt-5 w-full rounded-xl border border-gray-300 bg-[#f6f6f6] px-3 py-2 text-[14px] text-gray-700 outline-none focus:border-[#a78bfa]"
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

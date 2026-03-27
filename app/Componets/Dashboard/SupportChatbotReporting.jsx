"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Bot,
  CalendarDays,
  ChevronDown,
  Download,
  MessageCircle,
  MoreVertical,
  Search,
  ShieldAlert,
  UserCog,
  ClipboardList,
  User,
} from "lucide-react";

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

const ASSIGNEE_OPTIONS = [
  "Kimberly Hubert-Mejia",
  "David Benson",
  "Chris Hill",
  "Tanisha Mills",
  "Eliza Chan",
];

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
  const [activeApp, setActiveApp] = useState("webchat");
  const [search, setSearch] = useState("");
  const [activeConversationTab, setActiveConversationTab] =
    useState("Open Chats");
  const [selectedConversationId, setSelectedConversationId] =
    useState("conv-2");
  const [selectedConversationIds, setSelectedConversationIds] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState("Eliza Chan");
  const [isMessageMenuOpen, setIsMessageMenuOpen] = useState(false);

  const role =
    typeof window === "undefined"
      ? ""
      : normalizeRole(localStorage.getItem("userRole"));
  const canAccess = role === "SUPPORT" || role === "MANAGER";

  const data = useMemo(() => REPORTING_DATA[activeApp], [activeApp]);
  const visibleConversations = data.conversations.filter(
    (c) =>
      c.stage === activeConversationTab &&
      c.lead.toLowerCase().includes(search.toLowerCase()),
  );

  const allVisibleSelected =
    visibleConversations.length > 0 &&
    visibleConversations.every((c) => selectedConversationIds.includes(c.id));
  const hasSelections = selectedConversationIds.length > 0;

  const toggleConversationSelection = (conversationId) => {
    setSelectedConversationIds((prev) =>
      prev.includes(conversationId)
        ? prev.filter((id) => id !== conversationId)
        : [...prev, conversationId],
    );
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedConversationIds((prev) =>
        prev.filter((id) => !visibleConversations.some((c) => c.id === id)),
      );
      return;
    }

    setSelectedConversationIds((prev) => {
      const ids = new Set(prev);
      visibleConversations.forEach((c) => ids.add(c.id));
      return Array.from(ids);
    });
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
    <main className="min-h-[calc(100vh-60px)] bg-[#f4f5f7] p-6">
      {/* <section className="mb-4 flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setActiveApp("webchat")}
            className={`rounded-lg px-5 py-2 text-[14px] font-[600] ${
              activeApp === "webchat"
                ? "bg-[#dbe4ff] text-[#1e40af]"
                : "text-gray-500"
            }`}
          >
            Web Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveApp("whatsapp")}
            className={`rounded-lg px-5 py-2 text-[14px] font-[600] ${
              activeApp === "whatsapp"
                ? "bg-[#dbe4ff] text-[#1e40af]"
                : "text-gray-500"
            }`}
          >
            WhatsApp
          </button>
        </div>
      </section> */}

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

      <section className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[320px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations"
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-[14px] text-gray-700 outline-none focus:border-[#a78bfa]"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-[14px] font-[600] text-[#253b69]">
          <UserCog className="h-4 w-4" /> Agents
        </button>
        <button className="inline-flex items-center gap-2 rounded-xl border border-[#8b5cf6] bg-white px-5 py-3 text-[14px] font-[600] text-[#6d28d9]">
          <ClipboardList className="h-4 w-4" /> Business Rules List
        </button>
        <button className="inline-flex items-center gap-2 rounded-xl bg-[#4f46e5] px-5 py-3 text-[14px] font-[700] text-white">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAllVisible}
                className="h-5 w-5 cursor-pointer rounded-md border border-slate-300 accent-[#5b6ee1] focus:ring-2 focus:ring-[#c7d2fe]"
              />
              <h3 className="text-[16px] font-[800] text-[#061a43]">
                Conversations
              </h3>
              {/* {hasSelections ? (
                <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[12px] font-[700] text-[#4f46e5]">
                  {selectedConversationIds.length} selected
                </span>
              ) : null} */}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="h-[42px] min-w-[180px] appearance-none rounded-xl border border-gray-200 bg-white pl-3 pr-10 text-[14px] text-slate-700 outline-none focus:border-[#a78bfa]"
                >
                  {ASSIGNEE_OPTIONS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>
              <button
                disabled={!hasSelections}
                className="h-[42px] rounded-xl bg-[#5b6ee1] px-6 text-[14px] font-[700] text-white transition-opacity hover:bg-[#4f46e5] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
          <div className="border-b border-gray-100">
            <div className="flex items-center gap-6 overflow-x-auto">
              {CONVERSATION_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveConversationTab(tab)}
                  className={`w-[110px] border-b-2 py-4 text-center text-[14px] leading-snug font-[500] whitespace-normal ${
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

          <div className="max-h-[380px] overflow-y-auto">
            {visibleConversations.length === 0 ? (
              <p className="px-6 py-8 text-[14px] text-gray-400">
                No conversations in this tab.
              </p>
            ) : (
              visibleConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`w-full border-b border-slate-200 px-4 py-5 transition-colors hover:bg-[#faf8ff] hover:border-slate-300 ${
                    selectedConversationId === conv.id
                      ? "border-l-4 border-l-[#7c3aed] bg-[#eaf3ff]"
                      : ""
                  }`}
                >
                  <div className="flex items-stretch gap-3">
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={selectedConversationIds.includes(conv.id)}
                        onChange={() => toggleConversationSelection(conv.id)}
                        className="h-5 w-5 cursor-pointer rounded-md border border-slate-300 accent-[#5b6ee1] focus:ring-2 focus:ring-[#c7d2fe]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedConversationId(conv.id)}
                      className="flex w-full items-stretch justify-between gap-3 text-left text-slate-600 hover:text-slate-900"
                    >
                      <div>
                        <p className="text-[16px] font-[700] leading-tight text-[#04163d]">
                          {conv.lead}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-[14px] text-[#586a8f]">
                          <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
                          {conv.email}
                        </p>
                        <p className="mt-2 text-[13px] text-[#2f456f]">
                          {conv.preview}
                        </p>
                      </div>
                      <div className="flex items-end">
                        <p className="text-[13px] text-[#60759b] whitespace-nowrap">
                          {conv.time}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="relative flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <h3 className="text-[16px] font-[800] text-[#061a43]">Messages</h3>
            <button
              type="button"
              onClick={() => setIsMessageMenuOpen((prev) => !prev)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {isMessageMenuOpen ? (
              <div className="absolute right-6 top-14 z-20 min-w-[160px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => setIsMessageMenuOpen(false)}
                  className="w-full px-3 py-2 text-left text-[14px] text-slate-700 hover:bg-slate-50"
                >
                  Mark as responded
                </button>
                <button
                  type="button"
                  onClick={() => setIsMessageMenuOpen(false)}
                  className="w-full px-3 py-2 text-left text-[14px] text-slate-700 hover:bg-slate-50"
                >
                  Mark as closed
                </button>
              </div>
            ) : null}
          </div>

          <div>
            <div className="rounded-2xl border border-[#e9ddff] bg-[#f5f0ff] px-4 py-3">
              <div className="flex items-start gap-3 rounded-xl px-3 py-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#9b5cf5] text-white ">
                  <Bot className="h-4 w-8" />
                </span>
                <div>
                  <p className="text-[14px] font-[700] text-[#1a2d57]">BOT</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-700">
                    {data.message}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1 border-t border-gray-100 bg-white px-4 py-3">
              {data.thread.map((item) => {
                const isBot = item.role === "BOT";
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-xl px-3 py-3 hover:bg-[#fafafa]"
                  >
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${isBot ? "bg-[#9b5cf5] text-white" : "bg-[#3b82f6] text-white"}`}
                    >
                      {isBot ? (
                        <Bot className="h-4 w-8" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </span>
                    <div>
                      <p className="text-[14px] font-[700] text-[#1a2d57]">
                        {item.role}
                      </p>
                      <p className="mt-1 text-[13px] leading-relaxed text-slate-700">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}

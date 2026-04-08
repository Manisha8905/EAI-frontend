import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchWhatsappConversation } from "../../Redux/actions/whatsappConversationActions";

const STATUS_BADGE = {
  active:     "bg-sky-50 text-sky-700 border-sky-200",
  completed:  "bg-teal-50 text-teal-700 border-teal-200",
  delivered:  "bg-blue-50 text-blue-700 border-blue-200",
  read:       "bg-indigo-50 text-indigo-700 border-indigo-200",
  replied:    "bg-violet-50 text-violet-700 border-violet-200",
  failed:     "bg-red-50 text-red-700 border-red-200",
};

const formatTime = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  if (isNaN(d)) return ts;
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const WhatsAppConversationDetail = ({ conversationId, onClose }) => {
  const dispatch = useDispatch();
  const { loading, data, error } = useSelector(state => state.whatsappConversation);

  useEffect(() => {
    if (conversationId) {
      dispatch(fetchWhatsappConversation(conversationId));
    }
  }, [conversationId, dispatch]);

  if (!conversationId) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-[13px] text-gray-400">
        Loading conversation…
      </div>
    );
  }

  if (error) {
    return <div className="py-6 text-center text-[12px] text-red-500">{error}</div>;
  }

  if (!data) return null;

  const statusKey = (data.status ?? "").toLowerCase();
  const messages  = Array.isArray(data.messages) ? data.messages : [];
  const tasks     = Array.isArray(data.follow_up_tasks) ? data.follow_up_tasks : [];

  return (
    <div className="flex flex-col gap-3">

      {/* ── Meta strip — 6 cols, single row ── */}
      <div className="grid grid-cols-6 divide-x divide-gray-100 rounded-xl border border-gray-200 bg-white overflow-hidden">

        <div className="flex flex-col gap-1 px-3 py-2.5">
          <span className="text-[9px] font-[700] uppercase tracking-widest text-gray-400">Phone</span>
          <span className="font-mono text-[11px] font-[600] text-gray-800 truncate">{data.phone ?? "—"}</span>
        </div>

        <div className="flex flex-col gap-1 px-3 py-2.5">
          <span className="text-[9px] font-[700] uppercase tracking-widest text-gray-400">Status</span>
          <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded-full text-[10px] font-[600] border ${STATUS_BADGE[statusKey] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
            {(data.status ?? "—").toUpperCase()}
          </span>
        </div>

        <div className="flex flex-col gap-1 px-3 py-2.5">
          <span className="text-[9px] font-[700] uppercase tracking-widest text-gray-400">Last Msg</span>
          <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded-full text-[10px] font-[600] border ${STATUS_BADGE[(data.last_message_status ?? "").toLowerCase()] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
            {(data.last_message_status ?? "—").toUpperCase()}
          </span>
        </div>

        <div className="flex flex-col gap-1 px-3 py-2.5">
          <span className="text-[9px] font-[700] uppercase tracking-widest text-gray-400">Replied</span>
          <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded-full text-[10px] font-[600] border ${data.is_replied ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
            {data.is_replied ? "Yes" : "No"}
          </span>
        </div>

        <div className="flex flex-col gap-1 px-3 py-2.5">
          <span className="text-[9px] font-[700] uppercase tracking-widest text-gray-400">Replied At</span>
          <span className="text-[11px] font-[500] text-gray-700">{data.replied_at ? formatTime(data.replied_at) : "—"}</span>
        </div>

        <div className="flex flex-col gap-1 px-3 py-2.5">
          <span className="text-[9px] font-[700] uppercase tracking-widest text-gray-400">Meeting</span>
          {data.meeting_link ? (
            <a href={data.meeting_link} target="_blank" rel="noopener noreferrer"
              className="inline-flex w-fit items-center px-2 py-0.5 rounded-full text-[10px] font-[600] border bg-emerald-50 text-emerald-700 border-emerald-200 hover:underline">
              Booked
            </a>
          ) : (
            <span className="inline-flex w-fit items-center px-2 py-0.5 rounded-full text-[10px] font-[600] border bg-gray-100 text-gray-500 border-gray-200">None</span>
          )}
        </div>

      </div>

      {/* ── Follow-up Tasks ── */}
      {tasks.length > 0 && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2">
          <p className="text-[9px] font-[700] uppercase tracking-widest text-indigo-500 mb-1.5">
            Follow-up Tasks &nbsp;<span className="bg-indigo-100 text-indigo-700 rounded-full px-1.5 py-px text-[9px]">{tasks.length}</span>
          </p>
          <ul className="space-y-0.5">
            {tasks.map((task, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-gray-800">
                <span className="mt-0.5 shrink-0 w-3.5 h-3.5 rounded bg-indigo-500 text-white text-[8px] font-[800] flex items-center justify-center">{i + 1}</span>
                <span className="leading-snug">{task}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Messages ── */}
      <div>
        <p className="text-[9px] font-[700] uppercase tracking-widest text-gray-400 mb-1.5">
          Conversation &nbsp;<span className="bg-gray-200 text-gray-600 rounded-full px-1.5 py-px text-[9px]">{messages.length}</span>
        </p>
        {messages.length === 0 ? (
          <p className="text-[12px] text-gray-400 text-center py-6 rounded-xl bg-gray-50 border border-gray-100">No messages yet.</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto rounded-xl bg-slate-50 border border-gray-200 p-3 pr-2">
            {messages.map((msg, idx) => {
              const role = (msg.direction ?? msg.role ?? "").toLowerCase();
              const isOutbound = role === "outbound" || role === "assistant" || role === "bot";
              const text = msg.text ?? msg.content ?? msg.body ?? msg.message ?? "";
              return (
                <div key={idx} className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-[12px] leading-relaxed shadow-sm ${
                    isOutbound
                      ? "bg-[#1d4ed8] text-white rounded-tr-none"
                      : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                  }`}>
                    <p className="whitespace-pre-wrap">{text}</p>
                    <p className={`text-[9px] mt-1 text-right ${isOutbound ? "text-blue-200" : "text-gray-400"}`}>
                      <span className="font-[600]">{isOutbound ? "Bot" : "Lead"}</span>
                      {" · "}{formatTime(msg.timestamp ?? msg.created_at ?? msg.sent_at)}
                      {msg.status && <span className="ml-1 opacity-60">[{msg.status}]</span>}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppConversationDetail;

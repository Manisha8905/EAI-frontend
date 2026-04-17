import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchWhatsappConversation } from "../../Redux/actions/whatsappConversationActions";
import { CheckCircle2, Check } from "lucide-react";

const STATUS_STYLE = {
  active:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed:  "bg-teal-50 text-teal-700 border-teal-200",
  delivered:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  read:       "bg-emerald-100 text-emerald-700 border-emerald-200",
  replied:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed:     "bg-red-50 text-red-700 border-red-200",
};

const formatTime = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  if (isNaN(d)) return ts;
  return d.toLocaleString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });
};

const getReadReceiptIcon = (status) => {
  const s = (status ?? "").toLowerCase();
  if (s === "read") return "✓✓";
  if (s === "delivered") return "✓✓";
  if (s === "sent") return "✓";
  return "";
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
    <div className="flex flex-col gap-4">

      {/* ── Meta Information Grid ── */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-[700] uppercase tracking-widest text-gray-400">Phone</span>
          <span className="font-mono text-[12px] font-[600] text-gray-900">{data.phone ?? "—"}</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-[700] uppercase tracking-widest text-gray-400">Status</span>
          <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded-full text-[10px] font-[600] border ${STATUS_STYLE[statusKey] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
            {(data.status ?? "—").toUpperCase()}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-[700] uppercase tracking-widest text-gray-400">Replied</span>
          <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded-full text-[10px] font-[600] border ${data.is_replied ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
            {data.is_replied ? "Yes" : "No"}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-[700] uppercase tracking-widest text-gray-400">Last Msg</span>
          <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded-full text-[10px] font-[600] border ${STATUS_STYLE[(data.last_message_status ?? "").toLowerCase()] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
            {(data.last_message_status ?? "—").toUpperCase()}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-[700] uppercase tracking-widest text-gray-400">Replied At</span>
          <span className="text-[11px] font-[500] text-gray-700">{data.replied_at ? formatTime(data.replied_at) : "—"}</span>
        </div>

        <div className="flex flex-col gap-1">
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
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-[11px] font-[700] uppercase tracking-wide text-emerald-700 mb-2.5 flex items-center gap-2">
            <span>Follow-up Tasks</span>
            <span className="bg-emerald-200 text-emerald-800 rounded-full px-2 py-0.5 text-[10px] font-[700]">{tasks.length}</span>
          </p>
          <ul className="space-y-2">
            {tasks.map((task, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[12px] text-gray-800 leading-relaxed">
                <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-[9px] font-[800] flex items-center justify-center">{i + 1}</span>
                <span>{task}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Messages (WhatsApp Style) ── */}
      <div className="flex flex-col bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-white">
          <p className="text-[11px] font-[700] uppercase tracking-wide text-gray-600 flex items-center gap-2">
            <span>Conversation</span>
            <span className="bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-[10px]">{messages.length}</span>
          </p>
        </div>
        
        {messages.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-[13px] text-gray-400 italic">No messages yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto p-4 pr-3 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {messages.map((msg, idx) => {
              const role = (msg.direction ?? msg.role ?? "").toLowerCase();
              const isOutbound = role === "outbound" || role === "sent" || role === "user" || role === "bot";
              const text = msg.text ?? msg.content ?? msg.body ?? msg.message ?? "";
              const msgStatus = msg.status ?? (isOutbound ? "sent" : "");
              
              return (
                <div key={idx} className={`flex gap-2 ${isOutbound ? "justify-end" : "justify-start"}`}>
                  <div className={`flex flex-col max-w-xs ${isOutbound ? "items-end" : "items-start"}`}>
                    {/* Message bubble */}
                    <div className={`rounded-lg px-3.5 py-2 shadow-sm ${
                      isOutbound
                        ? "bg-emerald-100 text-gray-900 rounded-br-none"
                        : "bg-white text-gray-900 border border-gray-300 rounded-bl-none"
                    }`}>
                      <p className="text-[13px] font-[500] leading-relaxed break-words whitespace-pre-wrap">{text}</p>
                    </div>
                    
                    {/* Timestamp + Read receipt */}
                    <div className={`flex items-center gap-1.5 mt-1 text-[11px] ${isOutbound ? "text-gray-500 flex-row-reverse" : "text-gray-500"}`}>
                      <span className="text-[10px]">{formatTime(msg.timestamp ?? msg.created_at ?? msg.sent_at)}</span>
                      {isOutbound && msgStatus && (
                        <span className={`text-[10px] font-[600] ${
                          msgStatus.toLowerCase() === "read" 
                            ? "text-emerald-600" 
                            : "text-gray-400"
                        }`}>
                          {getReadReceiptIcon(msgStatus)}
                        </span>
                      )}
                    </div>
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

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchWhatsappConversation } from "../../Redux/actions/whatsappConversationActions";

const WhatsAppConversationDetail = ({ conversationId, onClose }) => {
  const dispatch = useDispatch();
  const { loading, data, error } = useSelector(state => state.whatsappConversation);

  useEffect(() => {
    if (conversationId) {
      dispatch(fetchWhatsappConversation(conversationId));
    }
  }, [conversationId, dispatch]);

  if (!conversationId) return null;
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4 bg-white rounded shadow-md max-w-2xl mx-auto mt-6">
      <h3 className="text-lg font-bold mb-2">Conversation Detail</h3>
      <div className="mb-2">Status: <b>{data?.status}</b></div>
      <div className="mb-2">Intent: <b>{data?.intent}</b></div>
      <div className="mb-2">Phone: <b>{data?.phone}</b></div>
      <div className="mb-2">Lead ID: <b>{data?.lead_id}</b></div>
      <div className="mb-2">Last Message Status: <b>{data?.last_message_status}</b></div>
      <div className="mb-2">Meeting Link: <b>{data?.meeting_link}</b></div>
      <div className="mb-2">Started At: <b>{data?.started_at}</b></div>
      <div className="mb-2">Updated At: <b>{data?.updated_at}</b></div>
      <h4 className="font-semibold mt-4 mb-2">Messages:</h4>
      <ul className="space-y-2">
        {data?.messages?.map((msg, idx) => (
          <li key={idx} className="border rounded p-2 bg-gray-50">
            <div><b>{msg.role}</b>: {msg.text}</div>
            <div className="text-xs text-gray-500">{msg.timestamp} [{msg.status}]</div>
          </li>
        ))}
      </ul>
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={onClose}>Close</button>
    </div>
  );
};

export default WhatsAppConversationDetail;

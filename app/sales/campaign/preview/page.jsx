"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, RefreshCw, Send, Users, X } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../../Redux/axiosInstance";

const toRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.email_drafts)) return payload.email_drafts;
  if (Array.isArray(payload?.emailDrafts)) return payload.emailDrafts;
  if (Array.isArray(payload?.drafts)) return payload.drafts;
  if (Array.isArray(payload?.leads)) return payload.leads;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

const resolveLeadId = (lead) => {
  const leadData = lead?.lead_data ?? {};
  return (
    lead?.list_lead_id ??
    lead?.lead_id ??
    lead?.id ??
    lead?._id ??
    leadData?.lead_id ??
    leadData?.list_lead_id ??
    leadData?.id ??
    lead?.leadId ??
    lead?.lead?.lead_id ??
    lead?.lead?.id ??
    lead?.lead?.list_lead_id ??
    null
  );
};

const getPreviewText = (lead) => {
  const leadData = lead?.lead_data ?? {};
  const draft = lead?.email_draft ?? lead?.draft ?? {};

  const subject =
    lead?.subject ??
    lead?.email_subject ??
    draft?.subject ??
    draft?.email_subject ??
    leadData?.subject ??
    "";

  const body =
    lead?.body ??
    lead?.email_body ??
    lead?.body_html ??
    lead?.draft_body ??
    draft?.body ??
    draft?.email_body ??
    draft?.body_html ??
    draft?.content ??
    leadData?.body ??
    leadData?.email_body ??
    leadData?.body_html ??
    "";

  const bodyHtml =
    lead?.body_html ??
    lead?.html_body ??
    draft?.body_html ??
    draft?.html_body ??
    leadData?.body_html ??
    leadData?.html_body ??
    "";

  return {
    subject: String(subject || "No subject"),
    body: String(body || "No email preview available."),
    bodyHtml: String(bodyHtml || ""),
  };
};

const stripHtml = (value) => {
  if (!value) return "";
  return String(value)
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
};

const normalizeLead = (lead) => {
  const leadData = lead?.lead_data ?? {};
  const id = resolveLeadId(lead);
  const preview = getPreviewText(lead);

  return {
    id: id == null ? null : String(id),
    name: String(lead?.name ?? lead?.lead_name ?? leadData?.name ?? leadData?.lead_name ?? lead?.lead?.name ?? "—"),
    email: String(lead?.email_address ?? lead?.email ?? leadData?.email_address ?? lead?.lead?.email_address ?? "—"),
    toEmail: String(lead?.to_email ?? leadData?.to_email ?? lead?.recipient_email ?? leadData?.recipient_email ?? "—"),
    company: String(lead?.company ?? leadData?.company ?? lead?.company_name ?? leadData?.company_name ?? "—"),
    phone: String(lead?.contact_number ?? lead?.phone ?? leadData?.contact_number ?? leadData?.phone ?? "—"),
    previewSubject: preview.subject,
    previewBody: preview.body,
    previewBodyHtml: preview.bodyHtml,
  };
};

const fetchPreviewLeads = async (campaignId) => {
  const candidates = [
    `/api/campaigns/${campaignId}/email-drafts`,
    `/campaigns/${campaignId}/email-drafts`,
    `/campaigns/${campaignId}/leads/review`,
  ];

  let lastError = null;
  for (const url of candidates) {
    try {
      const res = await axiosInstance.get(url);
      return toRows(res.data);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
};

const approveEmailDrafts = async (campaignId, selectedLeadIds, totalLeadCount) => {
  const isAllSelected = totalLeadCount > 0 && selectedLeadIds.length === totalLeadCount;
  const payload = {
    lead_ids: isAllSelected ? [] : selectedLeadIds,
    approve_all: isAllSelected,
  };

  const candidates = [
    `/api/campaigns/${campaignId}/email-drafts/approve`,
    `/campaigns/${campaignId}/email-drafts/approve`,
  ];

  let lastError = null;
  for (const url of candidates) {
    try {
      const res = await axiosInstance.post(url, payload);
      return res?.data ?? {};
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
};

export default function CampaignPreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const campaignId = searchParams.get("campaignId");
  const channel = String(searchParams.get("channel") ?? "EMAIL").toUpperCase();

  const [loading, setLoading] = useState(false);
  const [Sending, setSending] = useState(false);
  const [leads, setLeads] = useState([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState(new Set());
  const [activePreviewLead, setActivePreviewLead] = useState(null);
  const [previewApproved, setPreviewApproved] = useState(false);
  const [previewTab, setPreviewTab] = useState("content");

  const validLeads = useMemo(() => leads.filter((l) => !!l.id), [leads]);
  const allSelected = validLeads.length > 0 && validLeads.every((l) => selectedLeadIds.has(l.id));

  const goBackToCampaign = () => {
    router.push("/sales/campaign");
  };

  useEffect(() => {
    if (!campaignId) return;

    setLoading(true);
    fetchPreviewLeads(campaignId)
      .then((res) => {
        const rows = (Array.isArray(res) ? res : [])
          .map(normalizeLead)
          .filter((lead) => !!lead.id);
        setLeads(rows);
      })
      .catch(() => {
        toast.error("Failed to load leads for preview.");
      })
      .finally(() => setLoading(false));
  }, [campaignId]);

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedLeadIds(new Set());
      return;
    }
    setSelectedLeadIds(new Set(validLeads.map((l) => l.id)));
  };

  const toggleLead = (leadId) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) next.delete(leadId);
      else next.add(leadId);
      return next;
    });
  };

  const handleSave = async () => {
    if (!campaignId) {
      toast.error("Campaign id is missing.");
      return;
    }
    const selected = Array.from(selectedLeadIds);
    if (!selected.length) {
      toast.error("Select at least one lead.");
      return;
    }

    setSending(true);
    try {
      const result = await approveEmailDrafts(campaignId, selected, validLeads.length);
      const approved = Number(result?.approved ?? 0);
      const sent = Number(result?.sent ?? 0);
      const failed = Number(result?.failed ?? 0);

      // Any successful approve request (2xx) should mark preview as completed.
      setPreviewApproved(true);

      if (failed > 0) {
        toast.warn(`Approved: ${approved}, Sent: ${sent}, Failed: ${failed}`);
      } else {
        toast.success(`Approved: ${approved}, Sent: ${sent}, Failed: ${failed}`);
      }

      // Stay on preview page after send. User can use Back button to return.
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save selected leads.");
    } finally {
      setSending(false);
    }
  };

  const openPreviewModal = (lead) => {
    setActivePreviewLead(lead);
  };

  const closePreviewModal = () => {
    setActivePreviewLead(null);
  };

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && activePreviewLead) {
        closePreviewModal();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [activePreviewLead]);

  const plainContent = useMemo(() => {
    if (!activePreviewLead) return "";
    const fromHtml = stripHtml(activePreviewLead.previewBodyHtml);
    if (fromHtml) return fromHtml;
    return stripHtml(activePreviewLead.previewBody || "");
  }, [activePreviewLead]);

  const htmlPreview = useMemo(() => {
    if (!activePreviewLead) return "";
    return activePreviewLead.previewBodyHtml || activePreviewLead.previewBody || "";
  }, [activePreviewLead]);

  return (
    <main className={`min-h-screen bg-[#f4f5f7] p-4 md:p-6 transition-all duration-300 ${activePreviewLead ? "" : ""}`}>
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <button
          type="button"
          onClick={goBackToCampaign}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Campaign
        </button>

        <button
          type="button"
          disabled={Sending || selectedLeadIds.size === 0}
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-[700] text-white hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {Sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {Sending ? "Sending..." : `Send (${selectedLeadIds.size})`}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <h1 className="text-[18px] font-[700] text-gray-900">Lead Preview</h1>
        <p className="text-[13px] text-gray-500 mt-1">
          Select leads for {channel === "CALL" ? "Call" : "Email"} campaign activation.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <label className="inline-flex items-center gap-2 text-[13px] font-[600] text-gray-700">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded border-gray-300"
            />
            Select All
          </label>
          <span className="inline-flex items-center gap-1.5 text-[12px] text-blue-600 font-[600]">
            <Users className="h-3.5 w-3.5" />
            {selectedLeadIds.size} selected
          </span>
        </div>

        {loading ? (
          <div className="py-14 flex items-center justify-center gap-2 text-gray-400 text-[13px]">
            <RefreshCw className="h-4 w-4 animate-spin" /> Loading leads...
          </div>
        ) : validLeads.length === 0 ? (
          <div className="py-14 flex items-center justify-center gap-2 text-gray-400 text-[13px]">
            <CheckCircle2 className="h-4 w-4" /> No leads available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left" style={{ minWidth: "760px" }}>
              <thead>
                <tr className="bg-[#1e293b]">
                  {["Select", "Lead Name", "From Email", "Company", "Subject", ""].map((h) => (
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
                {validLeads.map((lead, idx) => {
                  const checked = selectedLeadIds.has(lead.id);
                  return (
                    <tr
                      key={lead.id}
                      className={`border-b border-gray-50 hover:bg-gray-50/70 transition ${idx % 2 !== 0 ? "bg-gray-50/30" : ""}`}
                    >
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleLead(lead.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </td>
                      <td className="px-3 py-3 text-[12px] font-[600] text-gray-800">{lead.name}</td>
                      <td className="px-3 py-3 text-[12px] text-gray-700">{lead.toEmail}</td>
                      <td className="px-3 py-3 text-[12px] text-gray-700">{lead.company}</td>
                      <td className="px-3 py-3 text-[12px] text-gray-700 max-w-[250px]">
                        <p className="truncate" title={lead.previewSubject}>{lead.previewSubject}</p>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => openPreviewModal(lead)}
                          className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-blue-50 transition duration-200 text-gray-600 hover:text-blue-600"
                          title="Preview email content"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activePreviewLead ? (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          onClick={closePreviewModal}
          role="dialog"
          aria-label="Email preview modal"
        >
          <div 
            className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200 px-6 py-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-[18px] font-[700] text-gray-900">Email Preview</h2>
                <div className="mt-3 space-y-1">
                  <p className="text-[13px] text-gray-600">
                    <span className="font-[600] text-gray-800">From:</span> {activePreviewLead.name}
                  </p>
                  <p className="text-[13px] text-gray-600 mt-2 pb-1 border-t border-gray-200 pt-2">
                    <span className="font-[600] text-gray-800">Subject:</span>
                  </p>
                  <p className="text-[14px] font-[600] text-gray-900 bg-blue-50/50 rounded-lg px-3 py-2 border border-blue-100">
                    {activePreviewLead.previewSubject}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={closePreviewModal}
                  className="flex-shrink-0 rounded-lg p-2 text-gray-500 hover:bg-gray-300 hover:text-gray-800 transition duration-200"
                  title="Close (or press ESC)"
                >
                  <X className="h-5 w-5" />
                </button>
                {/* <span className="text-[10px] text-gray-400 px-2">Press ESC to close</span> */}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                {htmlPreview ? (
                  <iframe
                    srcDoc={htmlPreview}
                    sandbox="allow-same-origin"
                    title={`Email preview ${activePreviewLead.id}`}
                    className="w-full h-[65vh] min-h-[480px] rounded-lg border border-slate-200"
                  />
                ) : (
                  <div className="text-[14px] leading-7 text-gray-800 whitespace-pre-wrap break-words font-[400]">
                    {plainContent || (
                      <span className="text-gray-400 italic">No text content available.</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

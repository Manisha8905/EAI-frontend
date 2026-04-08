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
    lead?.draft_id ??
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
    name: String(lead?.lead_name ?? lead?.name ?? leadData?.name ?? leadData?.lead_name ?? lead?.lead?.name ?? "—"),
    email: String(lead?.email_address ?? lead?.email ?? leadData?.email_address ?? lead?.lead?.email_address ?? "—"),
    toEmail: String(lead?.to_email ?? leadData?.to_email ?? lead?.recipient_email ?? leadData?.recipient_email ?? "—"),
    company: String(lead?.company_name ?? lead?.company ?? leadData?.company ?? leadData?.company_name ?? "—"),
    phone: String(lead?.contact_number ?? lead?.phone ?? leadData?.contact_number ?? leadData?.phone ?? "—"),
    previewSubject: preview.subject,
    previewBody: preview.body,
    previewBodyHtml: preview.bodyHtml,
    availableOnSystem: lead?.available_on_system ?? null,
    fetchedByAi: lead?.fetched_by_ai ?? null,
    aiEngine: lead?.ai_engine ?? null,
  };
};

const fetchArchivedLeads = async (campaignId) => {
  const res = await axiosInstance.get(
    `/api/campaigns/${campaignId}/email-drafts`
  );
  return toRows(res.data);
};

const normalizeArchiveLead = (item) => {
  const leadData = item?.lead_data ?? {};
  return {
    id: String(
      item?.list_lead_id ?? item?.lead_id ?? item?.id ?? item?._id ??
      leadData?.lead_id ?? leadData?.id ?? Math.random()
    ),
    name: String(item?.name ?? item?.lead_name ?? leadData?.name ?? "—"),
    email: String(item?.email_address ?? item?.email ?? leadData?.email_address ?? "—"),
    company: String(item?.company ?? leadData?.company ?? item?.company_name ?? "—"),
    archivedAt: String(item?.archived_at ?? item?.updated_at ?? item?.created_at ?? ""),
    reason: String(item?.archive_reason ?? item?.reason ?? ""),
  };
};

const MOCK_ARCHIVE_LEADS = [
  {
    id: "mock-1",
    name: "Sarah Johnson",
    email: "sarah.johnson@techcorp.io",
    company: "TechCorp Solutions",
    archivedAt: "2026-03-15T10:30:00Z",
    reason: "Duplicate",
  },
  {
    id: "mock-2",
    name: "Michael Chen",
    email: "m.chen@innovate.co",
    company: "Innovate Co.",
    archivedAt: "2026-03-18T14:20:00Z",
    reason: "Not Interested",
  },
  {
    id: "mock-3",
    name: "Priya Nair",
    email: "priya.nair@globalventures.com",
    company: "Global Ventures",
    archivedAt: "2026-03-22T09:15:00Z",
    reason: "Unsubscribed",
  },
  {
    id: "mock-4",
    name: "James Whitfield",
    email: "james.w@blueridge.net",
    company: "Blue Ridge Inc.",
    archivedAt: "2026-03-28T16:45:00Z",
    reason: "",
  },
  {
    id: "mock-5",
    name: "Amina Osei",
    email: "amina.osei@nexagroup.org",
    company: "Nexa Group",
    archivedAt: "2026-04-01T08:00:00Z",
    reason: "Invalid Contact",
  },
];

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
  const [modalTab, setModalTab] = useState("preview");
  const [archiveLeads, setArchiveLeads] = useState(MOCK_ARCHIVE_LEADS);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [archiveFetched, setArchiveFetched] = useState(false);
  const [enrichmentSubTab, setEnrichmentSubTab] = useState("system");
  const [tabClickCount, setTabClickCount] = useState({});
  const [reprocessPrompt, setReprocessPrompt] = useState("");
  const [reprocessing, setReprocessing] = useState(false);
  const [reprocessResult, setReprocessResult] = useState(null);

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

      // Remove sent rows from the table and clear selection
      const sentSet = new Set(selected);
      setLeads((prev) => prev.filter((l) => !sentSet.has(l.id)));
      setSelectedLeadIds(new Set());

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
    setModalTab("preview");
    setArchiveFetched(false);
    setArchiveLeads(MOCK_ARCHIVE_LEADS);
    setEnrichmentSubTab("system");
    setTabClickCount({});
    setReprocessPrompt("");
    setReprocessing(false);
    setReprocessResult(null);
  };

  const handleReprocess = async () => {
    if (!reprocessPrompt.trim() || !campaignId) return;
    const draftId = activePreviewLead?.id;
    if (!draftId) { toast.error("Draft ID is missing."); return; }
    setReprocessing(true);
    setReprocessResult(null);
    try {
      const res = await axiosInstance.post(
        `/api/campaigns/${campaignId}/email-drafts/${draftId}/regenerate`,
        { record_prompt: reprocessPrompt.trim() }
      );
      const data = res?.data ?? {};
      setReprocessResult({
        newDraftId: data.new_draft_id,
        subject: data.subject ?? "",
        bodyHtml: data.body_html ?? "",
      });
      toast.success("Draft regenerated successfully.");
      setReprocessPrompt("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to regenerate draft.");
    } finally {
      setReprocessing(false);
    }
  };

  const closePreviewModal = () => {
    setActivePreviewLead(null);
  };

  useEffect(() => {
    if (modalTab !== "enrichment" || archiveFetched || !campaignId) return;
    setArchiveLoading(true);
    fetchArchivedLeads(campaignId)
      .then((rows) => {
        setArchiveLeads(
          (Array.isArray(rows) ? rows : []).map(normalizeArchiveLead)
        );
      })
      .catch(() => {
        toast.error("Failed to load archived leads.");
      })
      .finally(() => {
        setArchiveLoading(false);
        setArchiveFetched(true);
      });
  }, [modalTab, archiveFetched, campaignId]);

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
            {/* ── Modal Header ── */}
            <div className="bg-white border-b border-gray-100 px-6 pt-5 pb-0">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-[16px] font-[700] text-gray-900 tracking-tight">Preview</h2>
                <button
                  type="button"
                  onClick={closePreviewModal}
                  className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition duration-200"
                  title="Close (ESC)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* ── Main Tab Switcher ── */}
              <div className="flex items-end gap-0">
                {[
                  { key: "preview", label: "Preview Email" },
                  { key: "enrichment", label: "Enrichment" },
                  { key: "reprocess", label: "Reprocess" },
                ].map((tab) => {
                  const active = modalTab === tab.key;
                  const clickKey = tabClickCount[tab.key] ?? 0;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => {
                        setModalTab(tab.key);
                        setTabClickCount((prev) => ({ ...prev, [tab.key]: (prev[tab.key] ?? 0) + 1 }));
                      }}
                      className={`relative px-5 py-2.5 text-[13px] tracking-wide select-none focus:outline-none transition-colors duration-200 ${
                        active
                          ? "font-[700] text-gray-900"
                          : "font-[500] text-gray-400 hover:text-gray-700"
                      }`}
                    >
                      <span
                        key={`${tab.key}-${clickKey}`}
                        className={active ? "animate-tabLift" : "inline-block"}
                      >
                        {tab.label}
                      </span>
                      <span
                        className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-sm transition-opacity duration-200"
                        style={{
                          background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
                          opacity: active ? 1 : 0,
                        }}
                      />
                    </button>
                  );
                })}
              </div>

            </div>

            {/* ── Tab Panels ── */}
            <div className="flex-1 overflow-y-auto bg-gray-50">

              {/* Preview Email */}
              {modalTab === "preview" && (
                <div className="p-6 animate-fadeIn">
                  {/* Compact email metadata strip */}
                  <div className="mb-3 bg-white border border-gray-200 rounded-xl px-4 py-2 flex flex-wrap items-center gap-x-5 gap-y-1">
                    <span className="text-[12px] text-gray-500 whitespace-nowrap">
                      <span className="font-[600] text-gray-700 mr-1">To:</span>{activePreviewLead.name}
                    </span>
                    <span className="hidden sm:block text-gray-200 select-none">|</span>
                    <span className="text-[12px] text-gray-500 whitespace-nowrap">
                      <span className="font-[600] text-gray-700 mr-1">To:</span>{activePreviewLead.toEmail}
                    </span>
                    {/* {activePreviewLead.company && activePreviewLead.company !== "—" && (
                      <>
                        <span className="hidden sm:block text-gray-200 select-none">|</span>
                        <span className="text-[12px] text-gray-500 whitespace-nowrap">
                          <span className="font-[600] text-gray-700 mr-1">Company:</span>{activePreviewLead.company}
                        </span>
                      </>
                    )} */}
                    <span className="hidden sm:block text-gray-200 select-none">|</span>
                    <span className="text-[12px] text-gray-500 min-w-0 truncate">
                      <span className="font-[600] text-gray-700 mr-1">Subject:</span>
                      <span className="font-[600] text-gray-900">{activePreviewLead.previewSubject}</span>
                    </span>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {htmlPreview ? (
                      <iframe
                        srcDoc={htmlPreview}
                        sandbox="allow-same-origin"
                        title={`Email preview ${activePreviewLead.id}`}
                        className="w-full h-[55vh] min-h-[400px] block"
                      />
                    ) : (
                      <div className="p-6 text-[14px] leading-7 text-gray-800 whitespace-pre-wrap break-words">
                        {plainContent || (
                          <span className="text-gray-400 italic">No content available.</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Enrichment */}
              {modalTab === "enrichment" && (
                <div className="p-5 animate-fadeIn">

                  {/* ── Sub-tab segment control — centered ── */}
                  <div className="flex justify-center mb-5">
                    <div className="inline-flex items-center bg-white border border-gray-200 rounded-full p-1 shadow-sm gap-1">
                      {[
                        { key: "system", label: "Available on System" },
                        { key: "ai",     label: "Fetched by AI" },
                      ].map((st) => (
                        <button
                          key={st.key}
                          type="button"
                          onClick={() => setEnrichmentSubTab(st.key)}
                          className={`px-4 py-1.5 rounded-full text-[12px] font-[600] transition-all duration-200 whitespace-nowrap ${
                            enrichmentSubTab === st.key
                              ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-sm"
                              : "text-gray-400 hover:text-gray-700"
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Available on System — dynamic key-value ── */}
                  {enrichmentSubTab === "system" && (() => {
                    const sys = activePreviewLead?.availableOnSystem;
                    if (!sys || typeof sys !== "object") {
                      return (
                        <div className="flex items-center justify-center py-16">
                          <p className="text-[13px] text-gray-400">No data available.</p>
                        </div>
                      );
                    }
                    const entries = Object.entries(sys);
                    return (
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-fadeIn">
                        {entries.map(([key, val], idx) => {
                          const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                          const isLast = idx === entries.length - 1;
                          const renderValue = (v) => {
                            if (Array.isArray(v)) {
                              if (v.length === 0) return <span className="text-gray-400 italic text-[12px]">—</span>;
                              // array of objects (e.g. linkedin_recent_posts)
                              if (typeof v[0] === "object" && v[0] !== null) {
                                return (
                                  <div className="flex flex-col gap-2 mt-1">
                                    {v.map((item, i) => (
                                      <div key={i} className="bg-gray-50 rounded-lg px-3 py-2 text-[11px] text-gray-600">
                                        {Object.entries(item).map(([k, vv]) => (
                                          <div key={k} className="flex gap-1.5 flex-wrap">
                                            <span className="font-[600] text-gray-500 capitalize">{k.replace(/_/g, " ")}:</span>
                                            {typeof vv === "string" && vv.startsWith("http") ? (
                                              <a href={vv} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate">{vv}</a>
                                            ) : (
                                              <span className="text-gray-700">{String(vv ?? "—")}</span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                );
                              }
                              // array of primitives
                              return (
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {v.map((item, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-[500]">{String(item)}</span>
                                  ))}
                                </div>
                              );
                            }
                            if (typeof val === "string" && val.startsWith("http")) {
                              return <a href={val} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-[12px]">{val}</a>;
                            }
                            return <span className="text-gray-800 text-[12px]">{String(v ?? "—")}</span>;
                          };
                          return (
                            <div key={key} className={`px-4 py-3 flex gap-3 ${!isLast ? "border-b border-gray-50" : ""}`}>
                              <span className="text-[11px] font-[600] text-gray-400 w-36 flex-shrink-0 pt-0.5 capitalize">{label}</span>
                              <div className="flex-1 min-w-0">{renderValue(val)}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* ── Fetched by AI — dynamic key-value ── */}
                  {enrichmentSubTab === "ai" && (() => {
                    const ai = activePreviewLead?.fetchedByAi;
                    const engine = activePreviewLead?.aiEngine;
                    if (!ai || typeof ai !== "object") {
                      return (
                        <div className="flex flex-col items-center justify-center py-16 gap-2">
                          {/* {engine && (
                            <span className="px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-100 text-[11px] font-[600] mb-1">
                              Engine: {engine}
                            </span>
                          )} */}
                          <p className="text-[13px] text-gray-400">No AI enrichment data available.</p>
                        </div>
                      );
                    }
                    const entries = Object.entries(ai);
                    return (
                      <div className="flex flex-col gap-3 animate-fadeIn">
                        {/* {engine && (
                          <div className="flex justify-end">
                            <span className="px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-100 text-[11px] font-[600]">
                              Engine: {engine}
                            </span>
                          </div>
                        )} */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                          {entries.map(([key, val], idx) => {
                            const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                            const isLast = idx === entries.length - 1;
                            const renderValue = (v) => {
                              if (Array.isArray(v)) {
                                if (v.length === 0) return <span className="text-gray-400 italic text-[12px]">—</span>;
                                if (typeof v[0] === "object" && v[0] !== null) {
                                  return (
                                    <div className="flex flex-col gap-2 mt-1">
                                      {v.map((item, i) => (
                                        <div key={i} className="bg-gray-50 rounded-lg px-3 py-2 text-[11px] text-gray-600">
                                          {Object.entries(item).map(([k, vv]) => (
                                            <div key={k} className="flex gap-1.5 flex-wrap">
                                              <span className="font-[600] text-gray-500 capitalize">{k.replace(/_/g, " ")}:</span>
                                              {typeof vv === "string" && vv.startsWith("http") ? (
                                                <a href={vv} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate">{vv}</a>
                                              ) : (
                                                <span className="text-gray-700">{String(vv ?? "—")}</span>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      ))}
                                    </div>
                                  );
                                }
                                return (
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {v.map((item, i) => (
                                      <span key={i} className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 text-[11px] font-[500]">{String(item)}</span>
                                    ))}
                                  </div>
                                );
                              }
                              if (typeof val === "string" && val.startsWith("http")) {
                                return <a href={val} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-[12px]">{val}</a>;
                              }
                              return <span className="text-gray-800 text-[12px]">{String(v ?? "—")}</span>;
                            };
                            return (
                              <div key={key} className={`px-4 py-3 flex gap-3 ${!isLast ? "border-b border-gray-50" : ""}`}>
                                <span className="text-[11px] font-[600] text-gray-400 w-36 flex-shrink-0 pt-0.5 capitalize">{label}</span>
                                <div className="flex-1 min-w-0">{renderValue(val)}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                </div>
              )}

              {/* Reprocess */}
              {modalTab === "reprocess" && (
                <div className="p-6 animate-fadeIn flex flex-col gap-5">

                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <RefreshCw className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[14px] font-[700] text-gray-900 leading-tight">Reprocess Email Draft</p>
                      <p className="text-[12px] text-gray-400 mt-0.5">Describe your changes and the AI will regenerate this draft.</p>
                    </div>
                  </div>

                  {/* Regenerated result */}
                  {reprocessResult && (
                    <div className="animate-fadeIn flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] font-[700] text-emerald-600 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" /> Draft regenerated
                          {reprocessResult.newDraftId && (
                            <span className="ml-1 text-[11px] text-gray-400 font-[400]">ID: {reprocessResult.newDraftId}</span>
                          )}
                        </p>
                        <button
                          type="button"
                          onClick={() => setReprocessResult(null)}
                          className="text-[11px] text-gray-400 hover:text-gray-600 transition"
                        >
                          Dismiss
                        </button>
                      </div>
                      {reprocessResult.subject && (
                        <div className="bg-white border border-emerald-100 rounded-xl px-4 py-2 text-[12px] text-gray-700">
                          <span className="font-[600] text-gray-500 mr-1.5">Subject:</span>
                          {reprocessResult.subject}
                        </div>
                      )}
                      <div className="bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden">
                        {reprocessResult.bodyHtml ? (
                          <iframe
                            srcDoc={reprocessResult.bodyHtml}
                            sandbox="allow-same-origin"
                            title="Regenerated email preview"
                            className="w-full h-[35vh] min-h-[280px] block"
                          />
                        ) : (
                          <div className="p-4 text-[13px] text-gray-400 italic">No preview available.</div>
                        )}
                      </div>
                      <div className="border-t border-gray-100 pt-1" />
                    </div>
                  )}

                  {/* Suggestion chips */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Make it more formal",
                      "Shorten the message",
                      "Focus on product benefits",
                      "Add a sense of urgency",
                      "More friendly tone",
                    ].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        disabled={reprocessing}
                        onClick={() => setReprocessPrompt((prev) => prev ? `${prev.trimEnd()}, ${chip.toLowerCase()}` : chip)}
                        className="px-3 py-1 rounded-full border border-gray-200 bg-white text-[11px] font-[500] text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Prompt box */}
                  <div className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm overflow-hidden ${reprocessPrompt.trim() ? "border-blue-300 ring-1 ring-blue-100" : "border-gray-200"}`}>
                    <textarea
                      value={reprocessPrompt}
                      onChange={(e) => setReprocessPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleReprocess();
                      }}
                      placeholder="e.g. Make the subject line more compelling, emphasize the ROI, and end with a clear call to action…"
                      rows={5}
                      className="w-full px-4 pt-4 pb-2 text-[13px] text-gray-800 placeholder-gray-300 resize-none focus:outline-none leading-6 bg-transparent"
                      disabled={reprocessing}
                    />
                    {/* Toolbar row */}
                    <div className="flex items-center justify-between px-4 pb-3 pt-1.5">
                      <span className="text-[11px] text-gray-300 select-none">
                        {reprocessPrompt.length > 0 ? `${reprocessPrompt.length} chars` : "⌘ Enter to submit"}
                      </span>
                      <button
                        type="button"
                        onClick={handleReprocess}
                        disabled={!reprocessPrompt.trim() || reprocessing}
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[12px] font-[700] transition-all duration-200 shadow-sm disabled:cursor-not-allowed ${
                          reprocessPrompt.trim() && !reprocessing
                            ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white hover:from-blue-600 hover:to-violet-600 shadow-blue-100"
                            : "bg-gray-100 text-gray-300"
                        }`}
                      >
                        {reprocessing
                          ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Processing…</>
                          : <><Send className="h-3.5 w-3.5" /> Submit</>}
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

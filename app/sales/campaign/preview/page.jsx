"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Database, Eraser, RefreshCw, Send, Sparkles, Trash2, User, Users, X } from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
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
  const [activePanel, setActivePanel] = useState(null); // null | "enrichment" | "reprocess"
  const [archiveLeads, setArchiveLeads] = useState(MOCK_ARCHIVE_LEADS);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [archiveFetched, setArchiveFetched] = useState(false);
  const [enrichmentSubTab, setEnrichmentSubTab] = useState("system");
  const [reprocessPrompt, setReprocessPrompt] = useState("");
  const [reprocessing, setReprocessing] = useState(false);
  const [reprocessResult, setReprocessResult] = useState(null);
  const [pendingDraft, setPendingDraft] = useState(null); // temporary regenerated content, not yet accepted
  const [originalLead, setOriginalLead] = useState(null); // snapshot before reprocess, for discard
  const [accepting, setAccepting] = useState(false);
  const [lastPromptByLead, setLastPromptByLead] = useState({}); // { [leadId]: string } session memory

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
      // Step 1: Approve the selected email drafts
      const result = await approveEmailDrafts(campaignId, selected, validLeads.length);
      const approved = Number(result?.approved ?? 0);
      const sent = Number(result?.sent ?? 0);
      const failed = Number(result?.failed ?? 0);

      // Any successful approve request (2xx) should mark preview as completed.
      setPreviewApproved(true);

      // Step 2: Fetch fresh email-drafts data from server after approval
      try {
        const freshLeads = await fetchPreviewLeads(campaignId);
        const normalized = (Array.isArray(freshLeads) ? freshLeads : [])
          .map(normalizeLead)
          .filter((lead) => !!lead.id);
        setLeads(normalized);
      } catch (err) {
        // If fetch fails, fall back to local removal
        const sentSet = new Set(selected);
        setLeads((prev) => prev.filter((l) => !sentSet.has(l.id)));
      }

      // Clear selection
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
    setActivePanel(null);
    setArchiveFetched(false);
    setArchiveLeads(MOCK_ARCHIVE_LEADS);
    setEnrichmentSubTab("system");
    setReprocessPrompt("");
    setReprocessing(false);
    setReprocessResult(null);
    setPendingDraft(null);
    setOriginalLead(null);
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
      const updatedId = data.new_draft_id ? String(data.new_draft_id) : draftId;
      const updatedSubject = data.subject ?? activePreviewLead.previewSubject;
      const updatedBodyHtml = data.body_html ?? activePreviewLead.previewBodyHtml;
      const updatedBody = data.body ?? data.body_html ?? activePreviewLead.previewBody;
      const submittedPrompt = reprocessPrompt.trim();

      // Save original lead snapshot for discard (only first time)
      if (!pendingDraft) setOriginalLead(activePreviewLead);

      // Temporarily update preview
      setActivePreviewLead((prev) => ({
        ...prev,
        id: updatedId,
        previewSubject: updatedSubject,
        previewBodyHtml: updatedBodyHtml,
        previewBody: updatedBody,
      }));

      // Store pending state (not yet accepted)
      setPendingDraft({ newDraftId: updatedId, subject: updatedSubject, bodyHtml: updatedBodyHtml, body: updatedBody, prompt: submittedPrompt });

      // Remember prompt under both old and new draft id for reliable lookup
      setLastPromptByLead((prev) => ({ ...prev, [draftId]: submittedPrompt, [updatedId]: submittedPrompt }));

      setReprocessResult({ newDraftId: updatedId, subject: updatedSubject, bodyHtml: updatedBodyHtml });
      toast.success("Draft regenerated — review changes then Accept or Discard.");
      // Keep bar open so Accept/Discard buttons are visible; keep prompt text
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to regenerate draft.");
    } finally {
      setReprocessing(false);
    }
  };

  const handleAcceptDraft = async () => {
    if (!pendingDraft || !campaignId) return;
    setAccepting(true);
    try {
      await axiosInstance.post(`/api/campaigns/${campaignId}/email-drafts/${pendingDraft.newDraftId}/approve-regeneration`);
      
      // Refresh all email drafts after approval
      const rows = await fetchPreviewLeads(campaignId);
      const normalized = rows.map(normalizeLead).filter((l) => !!l.id);
      setLeads(normalized);
      
      // Update active preview with fresh data for this lead
      const fresh = normalized.find((l) => l.id === pendingDraft.newDraftId) ||
        normalized.find((l) => l.id === activePreviewLead?.id);
      if (fresh) setActivePreviewLead(fresh);
      
      setPendingDraft(null);
      setOriginalLead(null);
      
      // Clear session prompt for this lead
      setLastPromptByLead((prev) => {
        const next = { ...prev };
        delete next[activePreviewLead?.id];
        return next;
      });
      toast.success("Email template accepted and updated.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to accept draft.");
    } finally {
      setAccepting(false);
    }
  };

  const handleDiscardDraft = () => {
    if (!originalLead) return;
    setActivePreviewLead(originalLead);
    setLeads((prev) =>
      prev.map((l) => l.id === pendingDraft?.newDraftId || l.id === originalLead.id ? originalLead : l)
    );
    setPendingDraft(null);
    setOriginalLead(null);
    toast.info("Draft discarded.");
  };

  const closePreviewModal = () => {
    setActivePreviewLead(null);
  };

  useEffect(() => {
    if (activePanel !== "enrichment" || archiveFetched || !campaignId) return;
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
  }, [activePanel, archiveFetched, campaignId]);

  // Close panel on ESC, or close modal if no panel open
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (activePanel) setActivePanel(null);
        else if (activePreviewLead) closePreviewModal();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [activePreviewLead, activePanel]);

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
        <div className="px-3 py-3 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
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
                  {["Select", "Lead Name", "From Email", "Company", "Subject", "Action"].map((h) => (
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

      {/* ── Preview Modal ── */}
      <AnimatePresence>
        {activePreviewLead && (
          <motion.div
            key="preview-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
            onClick={closePreviewModal}
            role="dialog"
            aria-label="Email preview modal"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Modal Header ── */}
              <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between gap-4 flex-shrink-0">
                <h2 className="text-[16px] font-[700] text-gray-900 tracking-tight">Preview</h2>
                <div className="flex items-center gap-1.5">
                  {/* Enriched Data icon button */}
                  <button
                    type="button"
                    onClick={() => setActivePanel("enrichment")}
                    title="Enriched Data"
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150 border border-transparent hover:border-blue-100"
                  >
                    <Database className="h-4 w-4" />
                  </button>
                  {/* Reprocess icon button */}
                  <button
                    type="button"
                    onClick={() => {
                      const isOpening = activePanel !== "reprocess";
                      setActivePanel(isOpening ? "reprocess" : null);
                      if (isOpening && activePreviewLead) {
                        // Look up by current id or original lead id (in case draft id changed after regen)
                        const savedPrompt =
                          lastPromptByLead[activePreviewLead.id] ??
                          (pendingDraft ? lastPromptByLead[pendingDraft.newDraftId] : undefined) ??
                          "";
                        setReprocessPrompt(savedPrompt);
                      }
                    }}
                    title="Reprocess"
                    className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 border ${
                      activePanel === "reprocess"
                        ? "bg-violet-100 text-violet-600 border-violet-200"
                        : "text-violet-400 hover:bg-violet-50 hover:text-violet-600 border-transparent hover:border-violet-100"
                    }`}
                  >
                    <RefreshCw className={`h-4 w-4 ${activePanel === "reprocess" ? "animate-spin-slow" : ""}`} />
                  </button>
                  {/* Divider */}
                  <span className="w-px h-5 bg-gray-200 mx-1" />
                  {/* Close button */}
                  <button
                    type="button"
                    onClick={closePreviewModal}
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition duration-200"
                    title="Close (ESC)"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* ── Email Preview Content ── */}
              <div className="flex-1 overflow-y-auto bg-gray-50 relative">

                {/* ── Reprocess Overlay Bar ── */}
                <AnimatePresence initial={false}>
                  {activePanel === "reprocess" && (
                    <motion.div
                      key="reprocess-bar"
                      initial={{ y: "-100%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: "-100%", opacity: 0 }}
                      transition={{ type: "spring", stiffness: 420, damping: 38 }}
                      className="absolute top-0 left-0 right-0 z-20 px-6 pt-4 pb-3 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-md"
                    >
                      <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        {/* Textarea row */}
                        <div className="flex items-start gap-2 px-3 pt-3 pb-1">
                          <RefreshCw className="h-3.5 w-3.5 text-violet-400 flex-shrink-0 mt-1.5" />
                          <textarea
                            value={reprocessPrompt}
                            onChange={(e) => setReprocessPrompt(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReprocess(); }
                              if (e.key === "Escape") setActivePanel(null);
                            }}
                            placeholder="Describe how to reprocess this email draft…"
                            rows={4}
                            className="flex-1 min-w-0 text-[13px] text-gray-800 placeholder-gray-300 bg-transparent outline-none ring-0 border-0 resize-y min-h-[40px] max-h-[160px] leading-5"
                            style={{ boxShadow: "none" }}
                            disabled={reprocessing}
                            autoFocus
                          />
                        </div>
                        {/* Bottom action bar */}
                        <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-100">
                          {/* Clear */}
                          <button
                            type="button"
                            onClick={() => setReprocessPrompt("")}
                            disabled={!reprocessPrompt.length}
                            title="Clear"
                            className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-400 transition disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Eraser className="h-3.5 w-3.5" />
                          </button>
                          <span className="flex-1" />
                          {/* Accept — always visible */}
                          <button
                            type="button"
                            onClick={handleAcceptDraft}
                            disabled={accepting || !pendingDraft}
                            title="Accept & save"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-[700] bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {accepting ? <RefreshCw className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                            {accepting ? "Saving…" : "Accept"}
                          </button>
                          {/* Submit */}
                          <button
                            type="button"
                            onClick={handleReprocess}
                            disabled={!reprocessPrompt.trim() || reprocessing}
                            title="Submit (Enter)"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-[700] transition-all duration-200 ${
                              reprocessPrompt.trim() && !reprocessing
                                ? "bg-violet-500 text-white hover:bg-violet-600 shadow-sm"
                                : "bg-gray-100 text-gray-300 cursor-not-allowed"
                            }`}
                          >
                            {reprocessing
                              ? <RefreshCw className="h-3 w-3 animate-spin" />
                              : <Send className="h-3 w-3" />}
                            {reprocessing ? "Sending…" : "Submit"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>


                <div className="p-6">
                  <div className="mb-3 bg-white border border-gray-200 rounded-xl px-4 py-2 flex flex-wrap items-center gap-x-5 gap-y-1">
                    <span className="text-[12px] text-gray-500 whitespace-nowrap">
                      <span className="font-[600] text-gray-700 mr-1">To:</span>{activePreviewLead.name}
                    </span>
                    <span className="hidden sm:block text-gray-200 select-none">|</span>
                    <span className="text-[12px] text-gray-500 whitespace-nowrap">
                      <span className="font-[600] text-gray-700 mr-1">Email:</span>{activePreviewLead.toEmail}
                    </span>
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Panel Modal (Enrichment only) stacked on top ── */}
      <AnimatePresence>
        {activePanel === "enrichment" && activePreviewLead && (
          <motion.div
            key="panel-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={() => setActivePanel(null)}
            role="dialog"
            aria-label="Detail panel"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 36 }}
              className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Panel Header */}
              <div className="bg-white border-b border-gray-100 flex-shrink-0">
                <div className="px-5 py-3.5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActivePanel(null)}
                    className="flex items-center justify-center rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition duration-150"
                    title="Back to Preview"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-2 flex-1">
                    {activePanel === "enrichment" ? (
                      <Database className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    ) : (
                      <RefreshCw className="h-4 w-4 text-violet-500 flex-shrink-0" />
                    )}
                    <span className="text-[14px] font-[700] text-gray-900">
                      {activePanel === "enrichment" ? "Enriched Data" : "Reprocess Email Draft"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePanel(null)}
                    className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition duration-200"
                    title="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Enrichment sub-tab buttons */}
                {activePanel === "enrichment" && (
                  <div className="px-5 pb-3 flex items-center gap-2">
                    {[
                      { key: "system", label: "Prospect Information", icon: User },
                      { key: "ai", label: "Fetched by AI", icon: Sparkles },
                    ].map((st) => {
                      const subActive = enrichmentSubTab === st.key;
                      const Icon = st.icon;
                      return (
                        <button
                          key={st.key}
                          type="button"
                          onClick={() => setEnrichmentSubTab(st.key)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-[600] transition-all duration-200 border ${
                            subActive
                              ? st.key === "system"
                                ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                                : "bg-violet-50 text-violet-700 border-violet-200 shadow-sm"
                              : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-700"
                          }`}
                        >
                          <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${
                            subActive
                              ? st.key === "system" ? "text-blue-500" : "text-violet-500"
                              : "text-gray-400"
                          }`} />
                          {st.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto bg-gray-50">

                {/* ── Enrichment Panel ── */}
                {activePanel === "enrichment" && (
                  <div className="p-5">
                    <AnimatePresence mode="wait" initial={false}>
                      {enrichmentSubTab === "system" && (
                        <motion.div
                          key="system"
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 12 }}
                          transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
                          className="bg-white rounded-xl border border-gray-200 px-4 py-1"
                        >
                          {(() => {
                            const sys = activePreviewLead?.availableOnSystem;
                            if (!sys || typeof sys !== "object") {
                              return (
                                <div className="flex items-center justify-center py-8">
                                  <p className="text-[13px] text-gray-400">No data available.</p>
                                </div>
                              );
                            }
                            const expectedKeys = ["name", "email", "phone", "company", "contact_number"];
                            return expectedKeys.map((key) => {
                              const val = sys[key];
                              const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                              const renderValue = (v) => {
                                if (v === null || v === undefined) return <span className="text-gray-400 italic text-[12px]">—</span>;
                                if (Array.isArray(v)) {
                                  if (v.length === 0) return <span className="text-gray-400 italic text-[12px]">—</span>;
                                  if (typeof v[0] === "object" && v[0] !== null) {
                                    return (
                                      <div className="flex flex-col gap-1 mt-1">
                                        {v.map((item, i) => (
                                          <div key={i} className="bg-gray-50 rounded px-2 py-1 text-[11px] text-gray-600">
                                            {Object.entries(item).map(([k, vv]) => (
                                              <div key={k} className="flex gap-1 flex-wrap">
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
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {v.map((item, i) => (
                                        <span key={i} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-[500]">{String(item)}</span>
                                      ))}
                                    </div>
                                  );
                                }
                                if (typeof v === "string" && v.startsWith("http")) {
                                  return <a href={v} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-[12px]">{v}</a>;
                                }
                                return <span className="text-gray-800 text-[12px]">{String(v || "—")}</span>;
                              };
                              return (
                                <div key={key} className="flex gap-3 py-2">
                                  <span className="text-[12px] font-[600] text-gray-500 w-32 flex-shrink-0 capitalize">{label}</span>
                                  <div className="flex-1 min-w-0">{renderValue(val)}</div>
                                </div>
                              );
                            });
                          })()}
                        </motion.div>
                      )}
                      {enrichmentSubTab === "ai" && (
                        <motion.div
                          key="ai"
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -12 }}
                          transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
                          className="bg-white rounded-xl border border-gray-200 p-4 space-y-4"
                        >
                          {(() => {
                            const ai = activePreviewLead?.fetchedByAi;
                            if (!ai || typeof ai !== "object") {
                              return (
                                <div className="flex items-center justify-center py-8">
                                  <p className="text-[13px] text-gray-400">No AI enrichment data available.</p>
                                </div>
                              );
                            }
                            const renderSection = (title, data) => {
                              if (!data || typeof data !== "object") return null;
                              const entries = Object.entries(data);
                              if (entries.length === 0) return null;
                              return (
                                <div>
                                  <h3 className="text-[14px] font-[700] text-gray-900 mb-2">{title}</h3>
                                  <div className="border-b border-gray-100 mb-3" />
                                  {entries.map(([key, val]) => {
                                    const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                                    const renderValue = (v) => {
                                      if (Array.isArray(v)) {
                                        if (v.length === 0) return <span className="text-gray-400 italic text-[12px]">—</span>;
                                        if (typeof v[0] === "object" && v[0] !== null) {
                                          return (
                                            <div className="flex flex-col gap-1 mt-1">
                                              {v.map((item, i) => (
                                                <div key={i} className="bg-gray-50 rounded px-2 py-1 text-[11px] text-gray-600">
                                                  {Object.entries(item).map(([k, vv]) => (
                                                    <div key={k} className="flex gap-1 flex-wrap">
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
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {v.map((item, i) => (
                                              <span key={i} className="px-2 py-0.5 rounded bg-violet-50 text-violet-700 text-[11px] font-[500]">{String(item)}</span>
                                            ))}
                                          </div>
                                        );
                                      }
                                      if (typeof val === "string" && val.startsWith("http")) {
                                        return <a href={val} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-[12px]">{val}</a>;
                                      }
                                      return <span className="text-gray-800 text-[12px]">{String(val ?? "—")}</span>;
                                    };
                                    return (
                                      <div key={key} className="flex gap-3 py-1.5">
                                        <span className="text-[12px] font-[600] text-gray-500 w-32 flex-shrink-0 capitalize">{label}</span>
                                        <div className="flex-1 min-w-0">{renderValue(val)}</div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            };
                            return (
                              <>
                                {renderSection("Personal Details", ai.personalDetails)}
                                {renderSection("Business Details", ai.businessDetails)}
                              </>
                            );
                          })()}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

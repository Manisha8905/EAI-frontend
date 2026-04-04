"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, RefreshCw, Save, Users } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../../Redux/axiosInstance";

const toRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.leads)) return payload.leads;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

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

const normalizeLead = (lead) => {
  const leadData = lead?.lead_data ?? {};
  const id = resolveLeadId(lead);
  return {
    id: id == null ? null : String(id),
    name: String(lead?.name ?? lead?.lead_name ?? leadData?.name ?? leadData?.lead_name ?? "—"),
    email: String(lead?.email_address ?? lead?.email ?? leadData?.email_address ?? leadData?.email ?? "—"),
    company: String(lead?.company ?? leadData?.company ?? lead?.company_name ?? leadData?.company_name ?? "—"),
    phone: String(lead?.contact_number ?? lead?.phone ?? leadData?.contact_number ?? leadData?.phone ?? "—"),
  };
};

const postSelection = async (campaignId, selectedLeadIds) => {
  const payload = { lead_ids: selectedLeadIds };
  const candidates = [
    `/campaigns/${campaignId}/leads/preview-selection`,
    `/campaigns/${campaignId}/preview-selection`,
    `/campaigns/${campaignId}/leads/select`,
  ];

  let lastError = null;
  for (const url of candidates) {
    try {
      await axiosInstance.post(url, payload);
      return;
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
  const [saving, setSaving] = useState(false);
  const [leads, setLeads] = useState([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState(new Set());

  const validLeads = useMemo(() => leads.filter((l) => !!l.id), [leads]);
  const allSelected = validLeads.length > 0 && validLeads.every((l) => selectedLeadIds.has(l.id));

  const goBackToCampaign = () => {
    const nextParams = new URLSearchParams();
    if (campaignId) nextParams.set("campaign", String(campaignId));
    if (channel === "CALL" || channel === "EMAIL") {
      nextParams.set("tab", channel.toLowerCase());
    }
    const nextQuery = nextParams.toString();
    router.push(nextQuery ? `/sales/campaign?${nextQuery}` : "/sales/campaign");
  };

  useEffect(() => {
    if (!campaignId) return;

    setLoading(true);
    axiosInstance
      .get(`/campaigns/${campaignId}/leads/review`)
      .then((res) => {
        const rows = toRows(res.data).map(normalizeLead).filter((lead) => !!lead.id);
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

    setSaving(true);
    try {
      await postSelection(campaignId, selected);
      toast.success("Preview leads saved.");
      const nextParams = new URLSearchParams();
      nextParams.set("campaign", String(campaignId));
      nextParams.set("tab", (channel === "CALL" ? "call" : "email"));
      nextParams.set("previewSavedCampaign", String(campaignId));
      router.push(`/sales/campaign?${nextParams.toString()}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save selected leads.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f5f7] p-4 md:p-6">
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
          disabled={saving || selectedLeadIds.size === 0}
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-[700] text-white hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : `Save (${selectedLeadIds.size})`}
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
                  {["Select", "Lead Name", "Email", "Company", "Phone"].map((h) => (
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
                      <td className="px-3 py-3 text-[12px] text-gray-700">{lead.email}</td>
                      <td className="px-3 py-3 text-[12px] text-gray-700">{lead.company}</td>
                      <td className="px-3 py-3 text-[12px] text-gray-700">{lead.phone}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

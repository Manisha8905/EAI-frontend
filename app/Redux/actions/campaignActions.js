import axiosInstance from "../axiosInstance";
import {
  CAMPAIGN_LIST_REQUEST,
  CAMPAIGN_LIST_SUCCESS,
  CAMPAIGN_LIST_FAILURE,
  CAMPAIGN_REMOVE_REQUEST,
  CAMPAIGN_REMOVE_SUCCESS,
  CAMPAIGN_REMOVE_FAILURE,
  APPROVE_EMAIL_DRAFTS_REQUEST,
  APPROVE_EMAIL_DRAFTS_SUCCESS,
  APPROVE_EMAIL_DRAFTS_FAILURE,
} from "../types/campaignTypes";

export const listCampaigns = (page = 1, pageSize = 20) => async (dispatch) => {
  const rawToken = typeof window !== "undefined" ? localStorage.getItem("session_token") : "";
  const token = (rawToken || "").trim();
  const isTokenValid = Boolean(token && token !== "undefined" && token !== "null");
  if (!isTokenValid) {
    dispatch({ type: CAMPAIGN_LIST_FAILURE, payload: "Unauthorized - login required" });
    return;
  }
  dispatch({ type: CAMPAIGN_LIST_REQUEST });
  try {
    const res = await axiosInstance.get("/list-campaigns", {
      params: { page, page_size: pageSize },
    });
    const preview = res.data.preview === true;
    const total = res.data.total ?? (Array.isArray(res.data) ? res.data.length : (res.data.campaigns?.length ?? res.data.data?.length ?? 0));
    const raw = Array.isArray(res.data)
      ? res.data
      : (res.data.campaigns ?? res.data.data ?? []);

    const campaigns = raw.map((c) => ({
      id:                c.campaign_id                  ?? Math.random(),
      name:              c.campaign_name                ?? "—",
      // campaignType:      c.campaign_type                ?? "",
      // communicationType: c.communication_type           ?? "",
      status:            c.status                       ?? "COMPLETED",
      agentName:         c.agent_name                   ?? "—",
      ownerEmail:        c.logged_in_user_email          ?? "",
      startDate:         c.start_date                   ?? "",
      createdAt:         c.created_at                   ?? "",
      lastRun:           c.last_run_datetime             ?? "",
      totalLeads:        c.total_leads                  ?? 0,
      queued:            c.queued                       ?? 0,
      called:            c.called                       ?? 0,
      completed:         c.completed                    ?? 0,
      failed:            c.failed                       ?? 0,
      noAnswer:          c.no_answer                    ?? 0,
      completionPct:     c.completion_percentage        ?? 0,
      emailsSent:        c.emails_sent_count             ?? 0,
      emailsFailed:      c.emails_failed_count           ?? 0,
      emailsPending:     c.emails_pending_count          ?? 0,
      meetings:          c.meetings_scheduled_count      ?? 0,
      linkedinSent:      c.linkedin_sent_count           ?? 0,
      linkedinFailed:    c.linkedin_failed_count         ?? 0,
      linkedinPending:   c.linkedin_pending_count        ?? 0,
      whatsappSent:      c.whatsapp_sent_count           ?? 0,
      whatsappFailed:    c.whatsapp_failed_count         ?? 0,
      whatsappPending:   c.whatsapp_pending_count        ?? 0,
      total_tasks_count: c.total_tasks_count            ?? c.total_tasks ?? 0,
      convRate:          c.campaign_conversion_rate      ?? 0,
      agentPerf:         c.agent_performance_percentage  ?? 0,
      fromName:          c.from_name                    ?? "",
      fromEmail:         c.from_email                   ?? "",
      isSmtp:            c.is_smtp                      ?? false,
      isProcessing:      c.is_processing                ?? false,
      parallelCalls:     c.campaign_parallel_calls      ?? 1,
      preview:           c.preview          ?? false,
      preview_mode:      c.preview_mode     ?? false,
    }));

    dispatch({ type: CAMPAIGN_LIST_SUCCESS, payload: { campaigns, preview, total } });
  } catch (err) {
    dispatch({
      type: CAMPAIGN_LIST_FAILURE,
      payload:
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to load campaigns.",
    });
  }
};

export const removeCampaign = (campaignId) => async (dispatch) => {
  const rawToken = typeof window !== "undefined" ? localStorage.getItem("session_token") : "";
  const token = (rawToken || "").trim();
  const isTokenValid = Boolean(token && token !== "undefined" && token !== "null");
  if (!isTokenValid) {
    dispatch({ type: CAMPAIGN_REMOVE_FAILURE, payload: "Unauthorized - login required" });
    return;
  }
  dispatch({ type: CAMPAIGN_REMOVE_REQUEST });
  try {
    const res = await axiosInstance.delete("/remove-campaign", {
      params: { campaign_id: campaignId },
    });
    dispatch({
      type: CAMPAIGN_REMOVE_SUCCESS,
      payload: res.data ?? { success: true, message: "Campaign removed successfully" },
    });
  } catch (err) {
    dispatch({
      type: CAMPAIGN_REMOVE_FAILURE,
      payload:
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to remove campaign.",
    });
  }
};

/**
 * Approve email drafts and fetch fresh data
 * Flow: POST approve → GET fresh email-drafts
 */
export const approveEmailDrafts = (campaignId, selectedLeadIds = [], totalLeadCount = 0) => async (dispatch) => {
  const rawToken = typeof window !== "undefined" ? localStorage.getItem("session_token") : "";
  const token = (rawToken || "").trim();
  const isTokenValid = Boolean(token && token !== "undefined" && token !== "null");
  if (!isTokenValid) {
    dispatch({ type: APPROVE_EMAIL_DRAFTS_FAILURE, payload: "Unauthorized - login required" });
    return;
  }

  dispatch({ type: APPROVE_EMAIL_DRAFTS_REQUEST });

  try {
    // Step 1: Approve the email drafts
    const isAllSelected = totalLeadCount > 0 && selectedLeadIds.length === totalLeadCount;
    const payload = {
      lead_ids: isAllSelected ? [] : selectedLeadIds,
      approve_all: isAllSelected,
    };

    const approveUrl = `/api/campaigns/${campaignId}/email-drafts/approve`;
    const approveRes = await axiosInstance.post(approveUrl, payload);
    const approvalData = approveRes?.data ?? {};

    // Step 2: Fetch fresh email-drafts data after approval
    const fetchUrl = `/api/campaigns/${campaignId}/email-drafts`;
    const fetchRes = await axiosInstance.get(fetchUrl);
    const freshDrafts = fetchRes?.data ?? [];

    dispatch({
      type: APPROVE_EMAIL_DRAFTS_SUCCESS,
      payload: {
        approvalResult: approvalData,
        freshDrafts: freshDrafts,
        approvedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    dispatch({
      type: APPROVE_EMAIL_DRAFTS_FAILURE,
      payload:
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to approve email drafts.",
    });
  }
};

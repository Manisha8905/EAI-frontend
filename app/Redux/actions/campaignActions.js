import axiosInstance from "../axiosInstance";
import {
  CAMPAIGN_LIST_REQUEST,
  CAMPAIGN_LIST_SUCCESS,
  CAMPAIGN_LIST_FAILURE,
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
      convRate:          c.campaign_conversion_rate      ?? 0,
      agentPerf:         c.agent_performance_percentage  ?? 0,
      fromName:          c.from_name                    ?? "",
      fromEmail:         c.from_email                   ?? "",
      isSmtp:            c.is_smtp                      ?? false,
      isProcessing:      c.is_processing                ?? false,
      parallelCalls:     c.campaign_parallel_calls      ?? 1,
    }));

    dispatch({ type: CAMPAIGN_LIST_SUCCESS, payload: campaigns });
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

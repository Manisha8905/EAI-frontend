import axios from "axios";
import {
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  USERS_REQUEST,
  USERS_SUCCESS,
  USERS_FAILURE,
  CREATE_USER_REQUEST,
  CREATE_USER_SUCCESS,
  CREATE_USER_FAILURE,
  SINGLE_USER_REQUEST,
  LOGIN_REQUEST,
  DELETE_USER_FAIL,
  DELETE_USER_SUCCESS,
  DELETE_USER_REQUEST,
  EDIT_USER_FAIL,
  EDIT_USER_SUCCESS,
  EDIT_USER_REQUEST,
  SINGLE_USER_FAIL,
  SINGLE_USER_SUCCESS,
  LOGOUT_REQUEST,
  OUTBOUND_CALLS_REQUEST,
  OUTBOUND_CALLS_SUCCESS,
  OUTBOUND_CALLS_FAILURE,
  INBOUND_CALLS_REQUEST,
  INBOUND_CALLS_SUCCESS,
  INBOUND_CALLS_FAILURE,
  EMAIL_CAMPAIGNS_REQUEST,
  EMAIL_CAMPAIGNS_SUCCESS,
  EMAIL_CAMPAIGNS_FAILURE,
  CAMPAIGN_LIST_REQUEST,
  CAMPAIGN_LIST_SUCCESS,
  CAMPAIGN_LIST_FAILURE,
  ACTIVATE_CAMPAIGN_SUCCESS,
  CALL_HISTORY_REQUEST,
  CALL_HISTORY_SUCCESS,
  CALL_HISTORY_FAILURE,
  EMAIL_HISTORY_REQUEST,
  EMAIL_HISTORY_SUCCESS,
  EMAIL_HISTORY_FAILURE,
  LINKEDIN_HISTORY_REQUEST,
  LINKEDIN_HISTORY_SUCCESS,
  LINKEDIN_HISTORY_FAILURE,
  WHATSAPP_HISTORY_REQUEST,
  WHATSAPP_HISTORY_SUCCESS,
  WHATSAPP_HISTORY_FAILURE,
  UPDATE_CAMPAIGN_REQUEST,
  UPDATE_CAMPAIGN_SUCCESS,
  UPDATE_CAMPAIGN_FAILURE,
  DELETE_CAMPAIGN_REQUEST,
  DELETE_CAMPAIGN_SUCCESS,
  DELETE_CAMPAIGN_FAILURE,
  INBOUND_HISTORY_REQUEST,
  INBOUND_HISTORY_SUCCESS,
  INBOUND_HISTORY_FAILURE,
} from "../types/userTypes";

import axiosInstance from "../axiosInstance";
import { toast } from "react-toastify";

export const loginUser = (values, router) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });

  try {
    const params = new URLSearchParams();
    params.append("email", values.email);
    params.append("password", values.password);

    const response = await axiosInstance.post("/login", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    console.log()

    // ✅ SAVE TOKEN + ROLE + USER INFO
    localStorage.setItem("session_token", response.data.session_token);
    if (response.data.role)
      localStorage.setItem("userRole", response.data.role.toUpperCase());
    if (response.data.name || response.data.username)
      localStorage.setItem("userName", response.data.name ?? response.data.username ?? "");
    if (response.data.role_display || response.data.role)
      localStorage.setItem("userRoleDisplay", response.data.role_display ?? response.data.role ?? "");

    dispatch({
      type: LOGIN_SUCCESS,
      payload: response.data,
    });
    toast.success(response?.data?.message ?? "Login Successful");

    // Redirect based on role
    const role = (response.data.role || "").toUpperCase().replace(/[\s_-]/g, "");
    if (role === "ADMIN" || role === "SUPERADMIN") {
      router.push("/user-management");
    } else if (role === "FINANCE") {
      router.push("/finance");
    } else if (role === "SUPPORT") {
      router.push("/support");
    } else {
      // SALES, MANAGER, or any other role → Sales module
      router.push("/sales");
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "login failed");
  }
};

export const logoutUser = () => async (dispatch) => {
  dispatch({ type: LOGOUT_REQUEST});

  try {
    const response = await axiosInstance.post("/logout");

    // remove token
    localStorage.removeItem("session_token");



    toast.success(response?.data?.message ?? "Logout Successful");

  } catch (error) {
    localStorage.removeItem("session_token");

    dispatch({
      type: "LOGOUT_FAIL",
    });

    toast.error(error.response?.data?.message || "Logout failed");
  }
};

export const fetchUsers = () => async (dispatch) => {
  dispatch({ type: USERS_REQUEST });

  try {
    const response = await axiosInstance.get("/api/users");

    dispatch({
      type: USERS_SUCCESS,
      payload: response.data,
    });
    // toast.success(response?.data?.message ?? " User Successfully");
    toast.success(response?.data?.message ?? "Users fetched successfully!");
  } catch (error) {
    toast.error(error.response?.data?.message ?? " User Failed");
  }
};
export const createUser = (userData) => async (dispatch) => {
  dispatch({ type: CREATE_USER_REQUEST });

  try {
    // 🔥 Convert to x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append("username", userData.username);
    params.append("email", userData.email);
    params.append("password", userData.password);
    params.append("user_role", userData.role);

    const response = await axiosInstance.post("/register", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    dispatch({
      type: CREATE_USER_SUCCESS,
      payload: response.data,
    });
    toast.success(response?.data?.message ?? "Create User Successfully");
  } catch (error) {
    toast.error(error.response?.data?.message ?? "Create User Failed");
  }
};

export const getSingleUser = (user_id) => async (dispatch) => {
  dispatch({ type: SINGLE_USER_REQUEST });

  try {
    const response = await axiosInstance.get(`/api/users/${user_id}`);

    dispatch({
      type: SINGLE_USER_SUCCESS,
      payload: response.data,
    });

    // toast.success(response?.data?.message ?? "User Fetched Successfully");
  } catch (error) {
    dispatch({
      type: SINGLE_USER_FAIL,
      payload: error.response?.data?.message,
    });

    toast.error(error.response?.data?.message ?? "Fetch User Failed");
  }
};
export const editUser = (userData) => async (dispatch) => {
  dispatch({ type: "EDIT_USER_REQUEST" });
console.log("id", userData)
  try {
    const response = await axiosInstance.put(
      `/admin/users/update`,
      null,  // 👈 no body
      {
        params: {
          user_id: userData.user_id,
          username: userData.username,
          email: userData.email,
          role: userData.role,
          ...(userData.password && { password: userData.password }),
        },
          headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      }
    );

    dispatch({
      type: "EDIT_USER_SUCCESS",
      payload: response.data,
    });
    toast.success(response?.data?.message ?? "User updated successfully!");

  } catch (error) {
    console.log("EDIT ERROR:", error.response);

    dispatch({
      type: "EDIT_USER_FAIL",
      payload: error.response?.data?.message || "Something went wrong",
    });
    toast.error(error.response?.data?.message || "Failed to update user.");
  }
};
export const deleteUser = (target_email) => async (dispatch) => {
  dispatch({ type: DELETE_USER_REQUEST });

  try {
    const response = await axiosInstance.delete(
      `/admin/users/purge?target_email=${target_email}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    dispatch({
      type: DELETE_USER_SUCCESS,
      payload: response.data,
    });

    toast.success(response?.data?.message ?? "User Deleted Successfully");
  } catch (error) {
    dispatch({
      type: DELETE_USER_FAIL,
      payload: error.response?.data?.message,
    });

    toast.error(error.response?.data?.message ?? "Delete Failed");
  }
};

// 📊 Outbound Calls Metrics
// filter: "this_year" | "this_quarter" | "this_month" | "this_week" | "today"
export const fetchOutboundCalls = (filter = "this_year") => async (dispatch) => {
  dispatch({ type: OUTBOUND_CALLS_REQUEST });

  try {
    const response = await axiosInstance.post(
      `/api/metrics/outbound-calls`,
      { filter },
      { headers: { "Content-Type": "application/json" } }
    );

    dispatch({
      type: OUTBOUND_CALLS_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: OUTBOUND_CALLS_FAILURE,
      payload: error.response?.data?.message || "Failed to fetch outbound calls",
    });

    toast.error(error.response?.data?.message || "Failed to fetch outbound calls");
  }
};

// 📊 Inbound Calls Metrics
// filter: "this_year" | "this_quarter" | "this_month" | "this_week" | "today"
export const fetchInboundCalls = (filter = "this_year") => async (dispatch) => {
  dispatch({ type: INBOUND_CALLS_REQUEST });

  try {
    const response = await axiosInstance.post(
      `/api/metrics/inbound-calls`,
      { filter },
      { headers: { "Content-Type": "application/json" } }
    );

    dispatch({
      type: INBOUND_CALLS_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: INBOUND_CALLS_FAILURE,
      payload: error.response?.data?.message || "Failed to fetch inbound calls",
    });

    toast.error(error.response?.data?.message || "Failed to fetch inbound calls");
  }
};

// 📊 Email Campaigns Metrics
// filter: "this_year" | "this_quarter" | "this_month" | "this_week" | "today"
export const fetchEmailCampaigns = (filter = "this_year") => async (dispatch) => {
  dispatch({ type: EMAIL_CAMPAIGNS_REQUEST });

  try {
    const response = await axiosInstance.post(
      `/api/metrics/email-campaigns`,
      { filter },
      { headers: { "Content-Type": "application/json" } }
    );

    dispatch({
      type: EMAIL_CAMPAIGNS_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: EMAIL_CAMPAIGNS_FAILURE,
      payload: error.response?.data?.message || "Failed to fetch email campaigns",
    });

    toast.error(error.response?.data?.message || "Failed to fetch email campaigns");
  }
};

// 📋 Campaign List
// params: { page, page_size, status, communication_type }  — all optional
export const listCampaigns = (params = {}) => async (dispatch) => {
  dispatch({ type: CAMPAIGN_LIST_REQUEST });
  try {
    // Build query string from only the params that have a value
    const query = {};
    if (params.page)               query.page               = params.page;
    if (params.page_size)          query.page_size          = params.page_size;
    if (params.status)             query.status             = params.status;
    if (params.communication_type) query.communication_type = params.communication_type;

    const res = await axiosInstance.get("/list-campaigns", { params: query });

    // Handle all common response shapes
    let raw;
    if (Array.isArray(res.data)) {
      raw = res.data;
    } else if (Array.isArray(res.data?.campaigns)) {
      raw = res.data.campaigns;
    } else if (Array.isArray(res.data?.data)) {
      raw = res.data.data;
    } else if (Array.isArray(res.data?.result)) {
      raw = res.data.result;
    } else if (Array.isArray(res.data?.campaign_list)) {
      raw = res.data.campaign_list;
    } else {
      const firstArr = Object.values(res.data ?? {}).find(Array.isArray);
      raw = firstArr ?? [];
    }

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
      listId:            c.list_id                      ?? null,
      channelOrder:      Object.keys(c.channel_order ?? {})
                           .sort((a, b) => Number(a) - Number(b))
                           .map((k) => (c.channel_order[k] ?? "").toUpperCase()),
      // channel_steps: [{ step_order, channel_type, status, ... }]
      channelSteps:      (c.channel_steps ?? []).map((s) => ({
                           order:       s.step_order,
                           channelType: (s.channel_type ?? "").toUpperCase(),
                           status:      (s.status ?? "NOT_STARTED").toUpperCase(),
                         })),
    }));

    // store total count if API returns it (for pagination display)
    const total = res.data?.total ?? res.data?.total_count ?? raw.length;
    dispatch({ type: CAMPAIGN_LIST_SUCCESS, payload: { campaigns, total } });
  } catch (err) {
    dispatch({
      type: CAMPAIGN_LIST_FAILURE,
      payload:
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to load campaigns.",
    });
    toast.error(err?.response?.data?.message || "Failed to load campaigns.");
  }
};

// 📋 Create Campaign
export const createCampaign = (formData, agent_id, onSuccess) => async (dispatch) => {
  try {
    const headers = {};
    if (agent_id) headers["X-Agent-ID"] = agent_id;
    const res = await axiosInstance.post("/create-campaign", formData, { headers });
    toast.success(res?.data?.message ?? "Campaign created successfully!");
    dispatch(listCampaigns({ page: 1, page_size: 20 }));
    if (onSuccess) onSuccess();
  } catch (err) {
    toast.error(err?.response?.data?.detail || err?.response?.data?.message || "Failed to create campaign.");
  }
};

// ▶️ Activate Campaign  —  POST /activate-campaign
export const toggleActivateCampaign = (campaignId, currentStatus, onDone) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("/activate-campaign", { campaign_id: campaignId });
    toast.success(res?.data?.message ?? "Campaign activated!");
    dispatch({ type: ACTIVATE_CAMPAIGN_SUCCESS, payload: { id: campaignId, status: "ACTIVE" } });
    if (onDone) onDone();
  } catch (err) {
    toast.error(err?.response?.data?.detail || err?.response?.data?.message || "Failed to activate campaign.");
  }
};

// ⏸️ Pause Campaign  —  POST /pause-campaign
export const pauseCampaign = (campaignId, onDone) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("/pause-campaign", { campaign_id: campaignId });
    toast.success(res?.data?.message ?? "Campaign paused!");
    dispatch({ type: ACTIVATE_CAMPAIGN_SUCCESS, payload: { id: campaignId, status: "PAUSED" } });
    if (onDone) onDone();
  } catch (err) {
    toast.error(err?.response?.data?.detail || err?.response?.data?.message || "Failed to pause campaign.");
  }
};

// ▶️ Resume Campaign  —  POST /resume-campaign
export const resumeCampaign = (campaignId, onDone) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("/resume-campaign", { campaign_id: campaignId });
    toast.success(res?.data?.message ?? "Campaign resumed!");
    dispatch({ type: ACTIVATE_CAMPAIGN_SUCCESS, payload: { id: campaignId, status: "ACTIVE" } });
    if (onDone) onDone();
  } catch (err) {
    toast.error(err?.response?.data?.detail || err?.response?.data?.message || "Failed to resume campaign.");
  }
};

// 🛑 Stop All Multichannel Campaigns  —  POST /campaigns/stop-all-multichannel
export const stopAllMultichannelCampaigns = (onDone) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("/campaigns/stop-all-multichannel");
    toast.success(res?.data?.message ?? "All campaigns stopped!");
    if (onDone) onDone();
  } catch (err) {
    toast.error(err?.response?.data?.detail || err?.response?.data?.message || "Failed to stop all campaigns.");
  }
};

// ─── Helper: extract an array from any common response shape ───────────────
const extractArray = (data) => {
  if (Array.isArray(data)) return data;
  const keys = ["data", "result", "results", "records", "history", "conversations", "items", "list"];
  for (const k of keys) {
    if (Array.isArray(data?.[k])) return data[k];
  }
  const first = Object.values(data ?? {}).find(Array.isArray);
  return first ?? [];
};

// 📞 Call History  —  GET /users/call-history/?campaign_id=<id>
export const fetchCallHistory = (campaignId) => async (dispatch) => {
  dispatch({ type: CALL_HISTORY_REQUEST });
  try {
    const res = await axiosInstance.get(`/campaigns/${campaignId}/call-history/`);
    const raw = extractArray(res.data);
    const normalized = raw.map((r) => ({
      name:       r.lead_name       ?? r.name         ?? r.contact_name  ?? "—",
      phone:      r.phone_number    ?? r.phone         ?? r.contact_phone ?? "—",
      company:    r.campaign_name    ?? r.company       ?? r.organization  ?? "—",
      dateTime:   r.call_time       ?? r.created_at    ?? r.date          ?? "—",
      duration:   r.duration        ?? r.call_duration ?? "0",
      status:     (r.call_status    ?? r.status        ?? "").toUpperCase(),
      meeting:    r.meeting_scheduled ?? r.meeting     ?? r.is_meeting_scheduled ?? false,
      transcript: r.transcript      ?? r.call_transcript ?? "",
    }));
    dispatch({ type: CALL_HISTORY_SUCCESS, payload: normalized });
    toast.success(`Call history loaded (${normalized.length} records)`);
  } catch (err) {
    dispatch({ type: CALL_HISTORY_FAILURE, payload: err?.response?.data?.message || "Failed to load call history." });
    toast.error(err?.response?.data?.message || "Failed to load call history.");
  }
};

// 📧 Email History  —  GET /email-history/?campaign_id=<id>
export const fetchEmailHistory = (campaignId) => async (dispatch) => {
  dispatch({ type: EMAIL_HISTORY_REQUEST });
  try {
    const res = await axiosInstance.get("/email-history/", {
      params: { campaign_id: campaignId },
    });
    const raw = extractArray(res.data);
    const normalized = raw.map((r) => ({
      id:        r.id           ?? r.email_history_id ?? null,
      name:      r.lead_name    ?? r.name          ?? r.contact_name  ?? "—",
      emailAddr: r.to_email     ?? r.email        ?? r.email_address  ?? r.contact_email ?? "—",
      company:   (r.company_name && r.company_name.trim()) ? r.company_name : (r.company ?? r.organization ?? "—"),
      subject:   r.subject      ?? r.email_subject  ?? "—",
      dateTime:  r.sent_at      ?? r.created_at     ?? r.date          ?? "—",
      status:    (r.status      ?? r.email_status   ?? "").toUpperCase(),
      clicked:   r.clicked      ?? r.is_clicked     ?? false,
      meeting:   r.meeting_scheduled ?? r.meeting   ?? r.is_meeting_scheduled ?? false,
      skippable: r.skippable    ?? false,
      skipReason: r.skip_reason ?? null,
    }));
    dispatch({ type: EMAIL_HISTORY_SUCCESS, payload: normalized });
    toast.success(`Email history loaded (${normalized.length} records)`);
  } catch (err) {
    dispatch({ type: EMAIL_HISTORY_FAILURE, payload: err?.response?.data?.message || "Failed to load email history." });
    toast.error(err?.response?.data?.message || "Failed to load email history.");
  }
};

// 💼 LinkedIn History  —  GET /api/admin/linkedin/conversations?campaign_id=<id>
export const fetchLinkedinHistory = (campaignId) => async (dispatch) => {
  dispatch({ type: LINKEDIN_HISTORY_REQUEST });
  try {
    const res = await axiosInstance.get("/api/admin/linkedin/conversations", {
      params: { campaign_id: campaignId },
    });
    const raw = extractArray(res.data);
    const normalized = raw.map((r) => ({
      name:               r.lead_name           ?? r.name              ?? r.contact_name  ?? "—",
      company:            r.campaign_name         ?? r.company           ?? r.organization  ?? "—",
      connectionSent:     r.connection_sent      ?? r.is_connection_sent ?? false,
      connectionAccepted: r.connection_accepted  ?? r.is_connection_accepted ?? r.action  ?? "—",
      messageSent:        r.message_sent         ?? r.is_message_sent   ?? false,
      replied:            r.replied              ?? r.is_replied        ?? false,
      status:             (r.status              ?? r.linkedin_status   ?? "").toUpperCase(),
      dateTime:           r.created_at           ?? r.date              ?? r.sent_at       ?? "—",
      meeting:            r.meeting_scheduled    ?? r.meeting           ?? false,
    }));
    dispatch({ type: LINKEDIN_HISTORY_SUCCESS, payload: normalized });
    toast.success(`LinkedIn history loaded (${normalized.length} records)`);
  } catch (err) {
    dispatch({ type: LINKEDIN_HISTORY_FAILURE, payload: err?.response?.data?.message || "Failed to load LinkedIn history." });
    toast.error(err?.response?.data?.message || "Failed to load LinkedIn history.");
  }
};

// 📱 WhatsApp History  —  GET /api/whatsapp/conversations?campaign_id=<id>
export const fetchWhatsappHistory = (campaignId) => async (dispatch) => {
  dispatch({ type: WHATSAPP_HISTORY_REQUEST });
  try {
    const res = await axiosInstance.get("/api/whatsapp/conversations", {
      params: { campaign_id: campaignId },
    });
    const raw = extractArray(res.data);
    const normalized = raw.map((r) => ({
      name:           r.lead_name      ?? r.name         ?? r.contact_name  ?? "—",
      phone:          r.phone_number   ?? r.phone         ?? r.contact_phone ?? "—",
      company:        r.campaign_name   ?? r.company       ?? r.organization  ?? "—",
      dateTime:       r.sent_at        ?? r.created_at    ?? r.date          ?? "—",
      messagePreview: r.message_preview ?? r.message      ?? r.content       ?? "—",
      status:         (r.status        ?? r.message_status ?? "").toUpperCase(),
      meeting:        r.meeting_scheduled ?? r.meeting    ?? r.is_meeting_scheduled ?? false,
    }));
    dispatch({ type: WHATSAPP_HISTORY_SUCCESS, payload: normalized });
    toast.success(`WhatsApp history loaded (${normalized.length} records)`);
  } catch (err) {
    dispatch({ type: WHATSAPP_HISTORY_FAILURE, payload: err?.response?.data?.message || "Failed to load WhatsApp history." });
    toast.error(err?.response?.data?.message || "Failed to load WhatsApp history.");
  }
};

// 📞 Inbound Call History  —  GET /api/inbound/calls/history
export const fetchInboundCallHistory = () => async (dispatch) => {
  dispatch({ type: INBOUND_HISTORY_REQUEST });
  try {
    const res = await axiosInstance.get("/api/inbound/calls/history");
    const raw = extractArray(res.data);
    const normalized = raw.map((r) => ({
      name:     r.lead_name       ?? r.name         ?? r.contact_name  ?? "—",
      phone:    r.phone_number    ?? r.phone         ?? r.contact_phone ?? "—",
      company:  r.campaign_name    ?? r.company       ?? r.organization  ?? "—",
      dateTime: r.call_time       ?? r.created_at    ?? r.date          ?? "—",
      duration: r.duration        ?? r.call_duration ?? "0",
      status:   (r.call_status    ?? r.status        ?? "").toUpperCase(),
      meeting:  r.meeting_scheduled ?? r.meeting     ?? r.is_meeting_scheduled ?? false,
    }));
    dispatch({ type: INBOUND_HISTORY_SUCCESS, payload: normalized });
  } catch (err) {
    dispatch({ type: INBOUND_HISTORY_FAILURE, payload: err?.response?.data?.message || "Failed to load inbound call history." });
    toast.error(err?.response?.data?.message || "Failed to load inbound call history.");
  }
};

// ✏️ Update Campaign  —  PATCH /update-campaign/{campaign_id}
export const updateCampaign = (campaignId, formData, agent_id, onSuccess) => async (dispatch) => {
  dispatch({ type: UPDATE_CAMPAIGN_REQUEST });
  try {
    const headers = {};
    if (agent_id) headers["X-Agent-ID"] = agent_id;
    const res = await axiosInstance.patch(`/update-campaign/${campaignId}`, formData, { headers });
    dispatch({ type: UPDATE_CAMPAIGN_SUCCESS });
    toast.success(res?.data?.message ?? "Campaign updated successfully!");
    dispatch(listCampaigns({ page: 1, page_size: 20 }));
    if (onSuccess) onSuccess();
  } catch (err) {
    dispatch({ type: UPDATE_CAMPAIGN_FAILURE, payload: err?.response?.data?.detail || err?.response?.data?.message || "Failed to update campaign." });
    toast.error(err?.response?.data?.detail || err?.response?.data?.message || "Failed to update campaign.");
  }
};

// 🗑️ Delete Campaign  —  DELETE /remove-campaign/{campaign_id}
export const deleteCampaign = (campaignId, onSuccess) => async (dispatch) => {
  dispatch({ type: DELETE_CAMPAIGN_REQUEST });
  try {
    const res = await axiosInstance.delete(`/remove-campaign/${campaignId}`);
    dispatch({ type: DELETE_CAMPAIGN_SUCCESS, payload: campaignId });
    toast.success(res?.data?.message ?? "Campaign deleted successfully!");
    if (onSuccess) onSuccess();
  } catch (err) {
    dispatch({ type: DELETE_CAMPAIGN_FAILURE, payload: err?.response?.data?.detail || err?.response?.data?.message || "Failed to delete campaign." });
    toast.error(err?.response?.data?.detail || err?.response?.data?.message || "Failed to delete campaign.");
  }
};

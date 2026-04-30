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
  LINKEDIN_CAMPAIGNS_REQUEST,
  LINKEDIN_CAMPAIGNS_SUCCESS,
  LINKEDIN_CAMPAIGNS_FAILURE,
  CAMPAIGN_LIST_REQUEST,
  CAMPAIGN_LIST_SUCCESS,
  CAMPAIGN_LIST_FAILURE,
  CAMPAIGN_PATCH_SUCCESS,
  ACTIVATE_CAMPAIGN_SUCCESS,
  CALL_HISTORY_REQUEST,
  CALL_HISTORY_SUCCESS,
  CALL_HISTORY_FAILURE,
  EMAIL_HISTORY_REQUEST,
  EMAIL_HISTORY_SUCCESS,
  EMAIL_HISTORY_FAILURE,
  EMAIL_DRAFTS_REQUEST,
  EMAIL_DRAFTS_SUCCESS,
  EMAIL_DRAFTS_FAILURE,
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
    localStorage.setItem("userEmail", values.email);
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
    toast.success(response?.data?.detail ?? "Login Successful", { toastId: "login-success" });

    // Notify backend of the current frontend base URL
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      if (baseUrl) {
        await axiosInstance.post("/api/globalsetting/base-url", { base_url: baseUrl });
      }
    } catch (_) {
      // Non-critical — ignore errors silently
    }

    // If the user was redirected to login from a specific page, return them there
    const returnUrl = typeof window !== "undefined" ? sessionStorage.getItem("returnUrl") : null;
    if (returnUrl && returnUrl !== "/login") {
      sessionStorage.removeItem("returnUrl");
      router.push(returnUrl);
      return;
    }

    // Default redirect based on role
    const role = (response.data.role || "").toUpperCase().replace(/[\s_-]/g, "");
    if (role === "SUPERADMIN" || role === "SALES") {
      router.push("/metrics");
    } else if (role === "ADMIN") {
      router.push("/user-management");
    } else if (role === "FINANCE") {
      router.push("/finance");
    } else if (role === "SUPPORT") {
      router.push("/support");
    } else {
      router.push("/metrics");
    }
  } catch (error) {
    dispatch({
      type: LOGIN_FAILURE,
      payload: error.response?.data?.detail || "Login failed",
    });
    toast.error(error.response?.data?.detail || "login failed");
  }
};

export const logoutUser = () => async (dispatch) => {
  dispatch({ type: LOGOUT_REQUEST});

  try {
    const response = await axiosInstance.post("/logout");

    // remove token
    localStorage.removeItem("session_token");



    toast.success(response?.data?.detail ?? "Logout Successful");

  } catch (error) {
    localStorage.removeItem("session_token");

    dispatch({
      type: "LOGOUT_FAIL",
    });

    toast.error(error.response?.data?.detail || "Logout failed");
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
    // toast.success(response?.data?.detail ?? " User Successfully");
    toast.success(response?.data?.detail ?? "Users fetched successfully!");
  } catch (error) {
    toast.error(error.response?.data?.detail ?? " User Failed");
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
    toast.success(response?.data?.detail ?? "Create User Successfully");
  } catch (error) {
    toast.error(error.response?.data?.detail ?? "Create User Failed");
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

    // toast.success(response?.data?.detail ?? "User Fetched Successfully");
  } catch (error) {
    dispatch({
      type: SINGLE_USER_FAIL,
      payload: error.response?.data?.detail,
    });

    toast.error(error.response?.data?.detail ?? "Fetch User Failed");
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
    toast.success(response?.data?.detail ?? "User updated successfully!");

  } catch (error) {
    console.log("EDIT ERROR:", error.response);

    dispatch({
      type: "EDIT_USER_FAIL",
      payload: error.response?.data?.detail || "Something went wrong",
    });
    toast.error(error.response?.data?.detail || "Failed to update user.");
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

    toast.success(response?.data?.detail ?? "User Deleted Successfully");
  } catch (error) {
    dispatch({
      type: DELETE_USER_FAIL,
      payload: error.response?.data?.detail,
    });

    toast.error(error.response?.data?.detail ?? "Delete Failed");
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
    const errorMsg = error.response?.data?.detail || 
                     error.response?.data?.detail || 
                     error.detail || 
                     "Failed to fetch outbound calls";
    dispatch({
      type: OUTBOUND_CALLS_FAILURE,
      payload: errorMsg,
    });

    if (errorMsg && errorMsg !== "") {
      toast.error(errorMsg);
    }
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
    const errorMsg = error.response?.data?.detail || 
                     error.response?.data?.detail || 
                     error.detail || 
                     "Failed to fetch inbound calls";
    dispatch({
      type: INBOUND_CALLS_FAILURE,
      payload: errorMsg,
    });

    if (errorMsg && errorMsg !== "") {
      toast.error(errorMsg);
    }
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
    const errorMsg = error.response?.data?.detail || 
                     error.response?.data?.detail || 
                     error.detail || 
                     "Failed to fetch email campaigns";
    dispatch({
      type: EMAIL_CAMPAIGNS_FAILURE,
      payload: errorMsg,
    });

    if (errorMsg && errorMsg !== "") {
      toast.error(errorMsg);
    }
  }
};

// LinkedIn Campaigns Metrics
// filter: "this_year" | "this_quarter" | "this_month" | "this_week" | "today"
export const fetchLinkedinCampaigns = (filter = "this_year") => async (dispatch) => {
  dispatch({ type: LINKEDIN_CAMPAIGNS_REQUEST });

  try {
    const response = await axiosInstance.post(
      `/api/metrics/linkedin`,
      { filter },
      { headers: { "Content-Type": "application/json" } }
    );

    dispatch({
      type: LINKEDIN_CAMPAIGNS_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    const errorMsg = error.response?.data?.detail || 
                     error.response?.data?.detail || 
                     error.detail || 
                     "Failed to fetch LinkedIn campaigns";
    dispatch({
      type: LINKEDIN_CAMPAIGNS_FAILURE,
      payload: errorMsg,
    });

    if (errorMsg && errorMsg !== "") {
      toast.error(errorMsg);
    }
  }
};

// �📋 Campaign List
// params: { page, page_size, status, communication_type }  — all optional
export const listCampaigns = (params = {}) => async (dispatch) => {
  dispatch({ type: CAMPAIGN_LIST_REQUEST });
  try {
    const toNumber = (value, fallback = 0) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    const parseChannelOrder = (campaign) => {
      const raw = campaign?.channel_order;

      if (Array.isArray(raw)) {
        return raw
          .map((value) => String(value ?? "").trim().toUpperCase())
          .filter(Boolean);
      }

      if (raw && typeof raw === "object") {
        return Object.keys(raw)
          .sort((a, b) => Number(a) - Number(b))
          .map((key) => String(raw[key] ?? "").trim().toUpperCase())
          .filter(Boolean);
      }

      if (typeof raw === "string" && raw.trim()) {
        return raw
          .split(",")
          .map((value) => value.trim().toUpperCase())
          .filter(Boolean);
      }

      const communicationType = String(campaign?.communication_type ?? "").trim().toUpperCase();
      return communicationType ? [communicationType] : [];
    };

    // Build query string from only the params that have a value
    const query = {};
    if (params.page)               query.page               = params.page;
    if (params.page_size)          query.page_size          = params.page_size;
    if (params.status)             query.status             = params.status;
    if (params.communication_type) query.communication_type = params.communication_type;
    if (params.search)             query.search             = params.search;

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
      campaignType:      c.campaign_type                ?? "",
      communicationType: c.communication_type           ?? "",
      status:            c.status                       ?? "COMPLETED",
      agentName:         c.agent_name                   ?? "—",
      ownerEmail:        c.logged_in_user_email          ?? "",
      startDate:         c.start_date                   ?? "",
      createdAt:         c.created_at                   ?? "",
      lastRun:           c.last_run_datetime             ?? "",
      totalLeads:        toNumber(c.total_leads),
      queued:            toNumber(c.queued),
      called:            toNumber(c.called),
      completed:         toNumber(c.completed),
      failed:            toNumber(c.failed),
      noAnswer:          toNumber(c.no_answer),
      completionPct:     toNumber(c.completion_percentage),
      emailsSent:        toNumber(c.emails_sent_count),
      emailsFailed:      toNumber(c.emails_failed_count),
      emailsPending:     toNumber(c.emails_pending_count),
      meetings:          toNumber(c.meetings_scheduled_count),
      total_tasks_count: toNumber(c.total_tasks_count ?? c.total_tasks),
      convRate:          toNumber(c.campaign_conversion_rate),
      agentPerf:         toNumber(c.agent_performance_percentage),
      fromName:          c.from_name                    ?? "",
      fromEmail:         c.email                        ?? c.from_email ?? "",
      isSmtp:            c.is_smtp                      ?? false,
      isProcessing:      c.is_processing                ?? false,
      parallelCalls:     toNumber(c.campaign_parallel_calls, 1),
      listId:            c.list_id                      ?? null,
      channelOrder:      parseChannelOrder(c),
      // channel_steps: [{ step_order, channel_type, status, ... }]
      channelSteps:      (c.channel_steps ?? []).map((s) => ({
                           order:       s.step_order,
                           channelType: (s.channel_type ?? "").toUpperCase(),
                           status:      (s.status ?? "NOT_STARTED").toUpperCase(),
                         })),
      preview:           c.preview          ?? false,
      preview_mode:      c.preview_mode     ?? false,
    }));

    // store total count if API returns it (for pagination display)
    const total = res.data?.total ?? res.data?.total_count ?? raw.length;
    dispatch({ type: CAMPAIGN_LIST_SUCCESS, payload: { campaigns, total } });
  } catch (err) {
    dispatch({
      type: CAMPAIGN_LIST_FAILURE,
      payload:
        err?.response?.data?.detail ||
        err?.response?.data?.detail ||
        "Failed to load campaigns.",
    });
    toast.error(err?.response?.data?.detail || "Failed to load campaigns.");
  }
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseChannelOrder = (campaign) => {
  const raw = campaign?.channel_order;

  if (Array.isArray(raw)) {
    return raw
      .map((value) => String(value ?? "").trim().toUpperCase())
      .filter(Boolean);
  }

  if (raw && typeof raw === "object") {
    return Object.keys(raw)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => String(raw[key] ?? "").trim().toUpperCase())
      .filter(Boolean);
  }

  if (typeof raw === "string" && raw.trim()) {
    return raw
      .split(",")
      .map((value) => value.trim().toUpperCase())
      .filter(Boolean);
  }

  const communicationType = String(campaign?.communication_type ?? "").trim().toUpperCase();
  return communicationType ? [communicationType] : [];
};

const normalizeCampaign = (c) => ({
  id:                c.campaign_id                  ?? c.id ?? Math.random(),
  name:              c.campaign_name                ?? c.name ?? "—",
  campaignType:      c.campaign_type                ?? "",
  communicationType: c.communication_type           ?? "",
  status:            c.status                       ?? "COMPLETED",
  agentName:         c.agent_name                   ?? "—",
  ownerEmail:        c.logged_in_user_email         ?? "",
  startDate:         c.start_date                   ?? "",
  createdAt:         c.created_at                   ?? "",
  lastRun:           c.last_run_datetime            ?? "",
  totalLeads:        toNumber(c.total_leads),
  queued:            toNumber(c.queued),
  called:            toNumber(c.called),
  completed:         toNumber(c.completed),
  failed:            toNumber(c.failed),
  noAnswer:          toNumber(c.no_answer),
  completionPct:     toNumber(c.completion_percentage),
  emailsSent:        toNumber(c.emails_sent_count),
  emailsFailed:      toNumber(c.emails_failed_count),
  emailsPending:     toNumber(c.emails_pending_count),
  meetings:          toNumber(c.meetings_scheduled_count),
  linkedinSent:      toNumber(c.linkedin_sent_count),
  linkedinFailed:    toNumber(c.linkedin_failed_count),
  linkedinPending:   toNumber(c.linkedin_pending_count),
  whatsappSent:      toNumber(c.whatsapp_sent_count),
  whatsappFailed:    toNumber(c.whatsapp_failed_count),
  whatsappPending:   toNumber(c.whatsapp_pending_count),
  total_tasks_count: toNumber(c.total_tasks_count ?? c.total_tasks),
  convRate:          toNumber(c.campaign_conversion_rate),
  agentPerf:         toNumber(c.agent_performance_percentage),
  fromName:          c.from_name                    ?? "",
  fromEmail:         c.email                        ?? c.from_email ?? "",
  isSmtp:            c.is_smtp                      ?? false,
  isProcessing:      c.is_processing                ?? false,
  parallelCalls:     toNumber(c.campaign_parallel_calls, 1),
  listId:            c.list_id                      ?? null,
  channelOrder:      parseChannelOrder(c),
  channelSteps:      (c.channel_steps ?? []).map((s) => ({
                     order:       s.step_order,
                     channelType: (s.channel_type ?? "").toUpperCase(),
                     status:      (s.status ?? "NOT_STARTED").toUpperCase(),
                   })),
  preview:           c.preview          ?? false,
  preview_mode:      c.preview_mode     ?? false,
  campaign_prompt
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const patchCreatedCampaignUntilLeads = async (dispatch, campaignId) => {
  const id = String(campaignId ?? "").trim();
  if (!id) return;

  const maxAttempts = 8;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const detail = await axiosInstance.get(`/get-campaigns/${id}`);
      const normalized = normalizeCampaign(detail?.data ?? {});
      dispatch({ type: CAMPAIGN_PATCH_SUCCESS, payload: normalized });

      const leadCount = Number(detail?.data?.total_leads ?? 0);
      if (leadCount > 0) break;
    } catch (_err) {
      // Retry until max attempts is reached.
    }

    if (attempt < maxAttempts - 1) {
      await wait(2000);
    }
  }
};

// � Poll campaign detail after activation to pick up async lead count changes
const patchCampaignAfterActivation = async (dispatch, campaignId) => {
  const id = String(campaignId ?? "").trim();
  if (!id) return;

  const maxAttempts = 5;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const detail = await axiosInstance.get(`/get-campaigns/${id}`);
      const normalized = normalizeCampaign(detail?.data ?? {});
      dispatch({ type: CAMPAIGN_PATCH_SUCCESS, payload: normalized });
    } catch (_err) {
      // Retry silently
    }
    if (attempt < maxAttempts - 1) {
      await wait(2000);
    }
  }
};

// �📋 Create Campaign
export const createCampaign = (formData, agent_id, onSuccess) => async (dispatch) => {
  try {
    const headers = {};
    if (agent_id) headers["X-Agent-ID"] = agent_id;
    const res = await axiosInstance.post("/create-campaign", formData, { headers });
    const createdCampaignId =
      res?.data?.campaign_id ??
      res?.data?.id ??
      res?.data?.data?.campaign_id ??
      res?.data?.data?.id ??
      null;
    toast.success(res?.data?.detail ?? "Campaign created successfully!");
    dispatch(listCampaigns({ page: 1, page_size: 20 }));
    if (createdCampaignId) {
      patchCreatedCampaignUntilLeads(dispatch, createdCampaignId);
    }
    if (onSuccess) onSuccess(res?.data);
    return { success: true, campaignId: createdCampaignId, data: res?.data };
  } catch (err) {
    toast.error(err?.response?.data?.detail || err?.response?.data?.detail || "Failed to create campaign.");
    return { success: false, error: err };
  }
};

// ▶️ Activate Campaign  —  POST /activate-campaign
export const toggleActivateCampaign = (campaignId, currentStatus, onDone) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("/activate-campaign", { campaign_id: campaignId });
    toast.success(res?.data?.detail ?? "Campaign activated!");
    dispatch({ type: ACTIVATE_CAMPAIGN_SUCCESS, payload: { id: campaignId, status: "ACTIVE" } });
    if (onDone) onDone();
    patchCampaignAfterActivation(dispatch, campaignId);
  } catch (err) {
    toast.error(err?.response?.data?.detail || err?.response?.data?.detail || "Failed to activate campaign.");
  }
};

// ⏸️ Pause Campaign  —  POST /pause-campaign
export const pauseCampaign = (campaignId, onDone) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("/pause-campaign", { campaign_id: campaignId });
    toast.success(res?.data?.detail ?? "Campaign paused!");
    dispatch({ type: ACTIVATE_CAMPAIGN_SUCCESS, payload: { id: campaignId, status: "PAUSED" } });
    if (onDone) onDone();
  } catch (err) {
    toast.error(err?.response?.data?.detail || err?.response?.data?.detail || "Failed to pause campaign.");
  }
};

// ▶️ Resume Campaign  —  POST /resume-campaign
export const resumeCampaign = (campaignId, onDone) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("/resume-campaign", { campaign_id: campaignId });
    toast.success(res?.data?.detail ?? "Campaign resumed!");
    dispatch({ type: ACTIVATE_CAMPAIGN_SUCCESS, payload: { id: campaignId, status: "ACTIVE" } });
    if (onDone) onDone();
    patchCampaignAfterActivation(dispatch, campaignId);
  } catch (err) {
    toast.error(err?.response?.data?.detail || err?.response?.data?.detail || "Failed to resume campaign.");
  }
};

// 🛑 Stop All Multichannel Campaigns  —  POST /campaigns/stop-all-multichannel
export const stopAllMultichannelCampaigns = (onDone) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("/campaigns/stop-all-multichannel");
    toast.success(res?.data?.detail ?? "All campaigns stopped!");
    if (onDone) onDone();
  } catch (err) {
    toast.error(err?.response?.data?.detail || err?.response?.data?.detail || "Failed to stop all campaigns.");
  }
};

// ─── Helper: extract an array from any common response shape ───────────────
const extractArray = (data) => {
  if (Array.isArray(data)) return data;
  const keys = ["emails", "data", "result", "results", "records", "history", "conversations", "items", "list"];
  for (const k of keys) {
    if (Array.isArray(data?.[k])) return data[k];
  }
  const first = Object.values(data ?? {}).find(Array.isArray);
  return first ?? [];
};

const normalizeBooleanish = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "yes", "y", "1"].includes(normalized)) return true;
    if (["false", "no", "n", "0", "", "null", "none"].includes(normalized)) return false;
  }
  return Boolean(value);
};

const normalizeFollowUpTasks = (value) => {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => normalizeFollowUpTasks(item))
      .filter(Boolean);
  }

  if (value == null) return [];

  if (typeof value === "object") {
    const nestedTasks =
      value.follow_up_tasks ??
      value.tasks ??
      value.items ??
      Object.values(value);
    return normalizeFollowUpTasks(nestedTasks);
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();
    if (!trimmedValue) return [];

    if (
      (trimmedValue.startsWith("[") && trimmedValue.endsWith("]")) ||
      (trimmedValue.startsWith("{") && trimmedValue.endsWith("}"))
    ) {
      try {
        return normalizeFollowUpTasks(JSON.parse(trimmedValue));
      } catch {
        // Fall back to delimiter splitting for malformed payloads.
      }
    }

    return value
      .split(/\r?\n|,(?=\s*[A-Z0-9])|;\s*/)
      .map((task) => task.replace(/[\[\]{}"]+/g, "").trim())
      .filter(Boolean);
  }

  return [];
};

// 📞 Call History  —  GET /api/campaigns/:id/call-history/
// Uses a same-origin Next.js proxy route so Node.js follows any backend
// redirects server-side. This prevents the browser from following a
// cross-origin redirect that would silently strip the Authorization header.
export const fetchCallHistory = (campaignId) => async (dispatch) => {
  dispatch({ type: CALL_HISTORY_REQUEST });
  try {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const res = await axiosInstance.get(`${origin}/api/campaigns/${campaignId}/call-history/`);
    const raw = extractArray(res.data);
    const totalTasks = Number(res.data?.total_tasks ?? 0) || 0;
    const normalized = raw.map((r) => {
      /* ── date+time ── prefer full ISO datetime, fall back to date+time combo */
      let dateTime = "—";
      if (r.call_datetime) {
        const d = new Date(r.call_datetime);
        const datePart = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const timePart = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        dateTime = `${datePart}\n${timePart}`;
      } else if (r.call_date && r.call_time) {
        const d = new Date(r.call_date);
        const datePart = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        dateTime = `${datePart}\n${r.call_time}`;
      } else if (r.created_at) {
        const d = new Date(r.created_at);
        dateTime = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + "\n" + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      }

      const rawTasks = r.tasks_list ?? r.task_list ?? r.tasks ?? [];
      const tasks_list = Array.isArray(rawTasks)
        ? rawTasks
        : typeof rawTasks === "string"
          ? rawTasks
          : [];
      const tasks_count = Number(
        r.tasks_count ??
        r.task_count ??
        r.total_tasks ??
        (Array.isArray(tasks_list) ? tasks_list.length : 0) ??
        0,
      );

      return {
        name:       r.lead_name          ?? r.name             ?? r.contact_name  ?? "—",
        phone:      r.phone_number       ?? r.phone            ?? r.contact_phone ?? "—",
        company:    r.company_name       ?? r.company          ?? r.organization  ?? r.campaign_name ?? "—",
        dateTime,
        duration:   r.call_duration      ?? r.duration         ?? "0",
        status:     (r.call_status       ?? r.status           ?? "").toUpperCase(),
        call_status: r.call_status       ?? r.status           ?? "",
        meeting_scheduled: r.meeting_scheduled ?? r.meeting ?? r.is_meeting_scheduled,
        meeting:    normalizeBooleanish(r.meeting_scheduled ?? r.meeting ?? r.is_meeting_scheduled),
        tasks_count,
        tasks_list,
        transcript: r.call_transcript    ?? r.transcript       ?? "",
        recording:  r.recording_url      ?? null,
        skippable:  normalizeBooleanish(r.skippable ?? r.is_skippable),
        skip_reason: r.skip_reason       ?? r.skipReason       ?? null,
        skipReason: r.skipReason         ?? r.skip_reason      ?? null,
      };
    });
    dispatch({ type: CALL_HISTORY_SUCCESS, payload: { data: normalized, total_tasks: totalTasks } });
    toast.success(`Call history loaded (${normalized.length} records)`);
  } catch (err) {
    dispatch({ type: CALL_HISTORY_FAILURE, payload: err?.response?.data?.detail || "Failed to load call history." });
    toast.error(err?.response?.data?.detail || "Failed to load call history.");
  }
};

// 📧 Email History  —  GET /api/email-history/?campaign_id=<id>
// Uses a same-origin Next.js proxy route so Node.js follows any backend
// redirects server-side. This prevents the browser from following a
// cross-origin redirect that would silently strip the Authorization header.
export const fetchEmailHistory = (campaignId) => async (dispatch) => {
  dispatch({ type: EMAIL_HISTORY_REQUEST });
  try {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const res = await axiosInstance.get(`${origin}/api/email-history/`, {
      params: { campaign_id: campaignId },
    });
    const raw = extractArray(res.data);
    const totalCount = Number(res.data?.total_count ?? res.data?.total ?? raw.length) || 0;
    const totalReplied = Number(
      res.data?.total_replied ?? res.data?.replied ?? res.data?.total_replies ?? 0,
    ) || 0;
    const totalTasks = Number(res.data?.total_tasks ?? 0) || 0;

    // Build reply map by email id from this same email-history payload only.
    const toKey = (id) => (id === null || id === undefined ? null : String(id));
    const replyByEmailId = new Map();
    raw.forEach((r) => {
      const rowIdKey = toKey(r.id ?? r.email_history_id);
      if (rowIdKey && r.replied_to_message_id && !replyByEmailId.has(rowIdKey)) {
        replyByEmailId.set(rowIdKey, r.replied_to_message_id);
      }

      const replies = Array.isArray(r.replies) ? r.replies : [];
      replies.forEach((rep) => {
        const targetKey = toKey(rep?.auto_response_email_id ?? r.id ?? r.email_history_id);
        if (targetKey && rep && !replyByEmailId.has(targetKey)) {
          replyByEmailId.set(targetKey, rep);
        }
      });
    });

    const getMergedReplies = (row) => {
      const rowIdKey = toKey(row?.id ?? row?.email_history_id);
      const directReplies = Array.isArray(row?.replies) ? row.replies : [];
      const filteredDirectReplies = directReplies.filter((rep) => {
        const targetKey = toKey(rep?.auto_response_email_id);
        if (!targetKey) return true;
        return targetKey === rowIdKey;
      });
      const repliedTo = row?.replied_to_message_id && typeof row.replied_to_message_id === "object"
        ? [row.replied_to_message_id]
        : [];
      const merged = [...filteredDirectReplies, ...repliedTo].filter(Boolean);
      const seenReplyIds = new Set();

      return merged.filter((rep) => {
        const key = rep?.reply_id != null
          ? `id:${rep.reply_id}`
          : `${rep?.reply_from ?? ""}|${rep?.sent_at ?? rep?.received_datetime ?? ""}`;
        if (seenReplyIds.has(key)) return false;
        seenReplyIds.add(key);
        return true;
      });
    };

    const normalized = raw.map((r) => {
      const rowIdKey = toKey(r.id ?? r.email_history_id);
      const replies = getMergedReplies(r);
      const replyData = replyByEmailId.get(rowIdKey) ?? replies[0] ?? null;
      const followUpTasks = normalizeFollowUpTasks(r.follow_up_tasks);
      const totalTasksForRow = Number(r.total_tasks ?? followUpTasks.length) || 0;
      return ({
      id:        r.id           ?? r.email_history_id ?? null,
      name:      r.lead_name    ?? r.name          ?? r.contact_name  ?? "—",
      emailAddr: r.to_email     ?? r.email        ?? r.email_address  ?? r.contact_email ?? "—",
      to_email:  r.to_email     ?? r.email        ?? r.email_address  ?? r.contact_email ?? "—",
      company:   (r.company_name && r.company_name.trim()) ? r.company_name : (r.company ?? r.organization ?? "—"),
      subject:   r.subject      ?? r.email_subject  ?? "—",
      dateTime:  r.sent_at      ?? r.created_at     ?? r.date          ?? "—",
      status:    (r.status      ?? r.email_status   ?? "").toUpperCase(),
      clicked:   r.clicked      ?? r.is_clicked     ?? false,
      meeting:   normalizeBooleanish(r.meeting_requested ?? r.meeting_scheduled ?? r.meeting ?? r.is_meeting_scheduled),
      follow_up_tasks: followUpTasks,
      total_tasks: totalTasksForRow,
      skippable: r.skippable    ?? false,
      skipReason: r.skip_reason ?? null,
      campaign_name: r.campaign_name ?? "",
      lead_name: r.lead_name ?? r.name ?? r.contact_name ?? "—",
      company_name: r.company_name ?? r.company ?? r.organization ?? "—",
      email_subject: r.email_subject ?? r.subject ?? "—",
      email_body: r.email_body ?? "",
      sent_at: r.sent_at ?? r.created_at ?? null,
      replies,
      replyData,
      reply_preview: replyData?.body_preview ?? replyData?.reply_body ?? "",
      total_replies: Number(r.total_replies ?? 0) || 0,
      hasReply:
        !!(
          replyData ||
          r.reply_id ||
          r.reply_body ||
          String(r.status ?? r.email_status ?? "").toUpperCase() === "REPLIED" ||
          Number(r.total_replies ?? 0) > 0
        ),
      repliedToMessageId: r.replied_to_message_id ?? null,
    });
    });
    dispatch({
      type: EMAIL_HISTORY_SUCCESS,
      payload: {
        data: normalized,
        total_count: totalCount,
        total_replied: totalReplied,
        total_tasks: totalTasks,
      },
    });
    toast.success(`Email history loaded (${normalized.length} records)`);
  } catch (err) {
    dispatch({ type: EMAIL_HISTORY_FAILURE, payload: err?.response?.data?.detail || "Failed to load email history." });
    toast.error(err?.response?.data?.detail || "Failed to load email history.");
  }
};

// 💼 LinkedIn History  —  GET /api/admin/linkedin/conversations?campaign_id=<id>
export const fetchLinkedinHistory = (campaignId) => async (dispatch) => {
  console.log('fetchLinkedinHistory called with campaignId:', campaignId);
  dispatch({ type: LINKEDIN_HISTORY_REQUEST });
  try {
    const res = await axiosInstance.get("/api/admin/linkedin/conversations", {
      params: { campaign_id: campaignId },
    });
    console.log('LinkedIn API response:', res);
    const data = res.data ?? {};
    const apiTotal = Number(data.total ?? 0);
    const raw = Array.isArray(data.results)
      ? data.results
      : extractArray(data);
    const normalized = raw.map((r) => {
      const info = r.lead_info ?? {};
      const connectionStatus = (r.connection_status ?? r.status ?? r.linkedin_status ?? "").toUpperCase();
      const replied = !!(r.last_reply_at ?? r.replied ?? r.is_replied);
      const meetingBooked = !!(r.meeting_start_datetime ?? r.meeting_link ?? r.meeting_scheduled ?? r.meeting);
      const followUpTasks = normalizeFollowUpTasks(r.follow_up_tasks);
      const totalTasksForRow = Number(r.total_tasks ?? followUpTasks.length) || 0;
      return {
        name:                   info.name               ?? r.lead_name          ?? r.name           ?? "—",
        company:                info.company             ?? r.company            ?? r.organization    ?? "—",
        title:                  info.title               ?? r.title              ?? "—",
        email:                  info.email               ?? r.email              ?? "—",
        connectionSent:         !!(r.connection_requested_at ?? r.connection_sent ?? r.is_connection_sent),
        connectionAccepted:     !!(r.connection_accepted_at  ?? r.connection_accepted ?? r.is_connection_accepted),
        messageSent:            !!(r.dm_sent                 ?? r.message_sent       ?? r.is_message_sent),
        replied,
        status:                 connectionStatus,
        journeyStatus:          r.journey_status         ?? "",
        lastReplyIntent:        r.last_reply_intent      ?? "—",
        lastReplySentiment:     r.last_reply_sentiment   ?? "—",
        dateTime:               r.connection_requested_at ?? r.created_at ?? r.date ?? r.sent_at ?? "—",
        lastReplyAt:            r.last_reply_at          ?? null,
        meeting:                meetingBooked,
        meetingLink:            r.meeting_link           ?? null,
        recipientPublicId:      r.recipient_public_id    ?? null,
        messages:               Array.isArray(r.messages) ? r.messages : [],
        follow_up_tasks:        followUpTasks,
        total_tasks:            totalTasksForRow,
      };
    });
    dispatch({
      type: LINKEDIN_HISTORY_SUCCESS,
      payload: { data: normalized, total: apiTotal || normalized.length },
    });
    toast.success(`LinkedIn history loaded (${normalized.length} records)`);
  } catch (err) {
    console.error('LinkedIn API error:', err.response);
    dispatch({ type: LINKEDIN_HISTORY_FAILURE, payload: err?.response?.data?.detail || "Failed to load LinkedIn history." });
    toast.error(err?.response?.data?.detail || "Failed to load LinkedIn history.");
  }
};

// 📱 WhatsApp History  —  GET /api/whatsapp/conversations?campaign_id=<id>
export const fetchWhatsappHistory = (campaignId) => async (dispatch) => {
  dispatch({ type: WHATSAPP_HISTORY_REQUEST });
  try {
    const res = await axiosInstance.get("/api/whatsapp/conversations", {
      params: { campaign_id: campaignId },
    });
    const data = res.data ?? {};
    // Support paginated response: { conversations: [...], analytics: {...} }
    const conversations = Array.isArray(data.conversations) ? data.conversations : extractArray(data);
    const analytics = data.analytics ?? null;
    const normalized = conversations.map((r) => ({
      id:              r.id             ?? r.conversation_id ?? null,
      lead_id:         r.lead_id        ?? null,
      phone:           r.phone          ?? r.phone_number   ?? r.contact_phone ?? "—",
      status:          (r.status        ?? r.message_status ?? "").toLowerCase(),
      intent:          r.intent         ?? null,
      last_message_status: r.last_message_status ?? null,
      is_replied:      r.is_replied     ?? false,
      replied_at:      r.replied_at     ?? null,
      seen_at:         r.seen_at        ?? null,
      follow_up_tasks: r.follow_up_tasks ?? [],
      skippable:       r.skippable      ?? false,
      meeting_link:    r.meeting_link   ?? null,
      meeting_start_datetime: r.meeting_start_datetime ?? null,
      meeting_duration_minutes: r.meeting_duration_minutes ?? null,
      started_at:      r.started_at     ?? null,
      updated_at:      r.updated_at     ?? null,
      // keep raw for backward compat
      dateTime:        r.started_at     ?? r.sent_at ?? r.created_at ?? "—",
      meeting:         normalizeBooleanish(r.meeting_link ? true : (r.meeting_scheduled ?? r.meeting ?? false)),
    }));
    dispatch({ type: WHATSAPP_HISTORY_SUCCESS, payload: { conversations: normalized, analytics } });
    toast.success(`WhatsApp history loaded (${normalized.length} records)`);
  } catch (err) {
    dispatch({ type: WHATSAPP_HISTORY_FAILURE, payload: err?.response?.data?.detail || "Failed to load WhatsApp history." });
    toast.error(err?.response?.data?.detail || "Failed to load WhatsApp history.");
  }
};

// 📞 Inbound Call History  —  GET /api/inbound/calls/history
export const fetchInboundCallHistory = (page = 1, pageSize = 10) => async (dispatch) => {
  dispatch({ type: INBOUND_HISTORY_REQUEST });
  try {
    const res = await axiosInstance.get("/api/inbound/calls/history", {
      params: { page, page_size: pageSize },
    });
    const d = res.data;
    // The API returns { calls: [...], total_count, page, page_size, total_pages, has_next, has_previous, summary }
    const raw = Array.isArray(d?.calls) ? d.calls : extractArray(d);
    const normalized = raw.map((r) => {
      let dateTime = "—";
      if (r.created_at) {
        const d = new Date(r.created_at);
        if (!Number.isNaN(d.getTime())) {
          const datePart = d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          const timePart = d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });
          dateTime = `${datePart}\n${timePart}`;
        }
      } else if (r.call_date && r.call_time) {
        const d = new Date(r.call_date);
        const datePart = !Number.isNaN(d.getTime())
          ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : r.call_date;
        dateTime = `${datePart}\n${r.call_time}`;
      } else {
        dateTime = r.call_time ?? r.date ?? "—";
      }

      return {
        name:     r.lead_name       ?? r.name         ?? r.contact_name  ?? "—",
        phone:    r.phone_number    ?? r.phone         ?? r.contact_phone ?? "—",
        company:  r.campaign_name    ?? r.company       ?? r.organization  ?? "—",
        dateTime,
        duration: r.duration        ?? r.call_duration ?? "0",
        status:   (r.call_status    ?? r.status        ?? "").toUpperCase(),
        meeting:  normalizeBooleanish(r.meeting_scheduled ?? r.meeting ?? r.is_meeting_scheduled),
        transcript: r.call_transcript ?? r.transcript ?? "",
        transcript: r.call_transcript ?? r.transcript ?? "",
        recording: r.recording_url ?? null,
      };
    });
    dispatch({
      type: INBOUND_HISTORY_SUCCESS,
      payload: {
        calls: normalized,
        total_count: d?.total_count ?? normalized.length,
        page: d?.page ?? page,
        page_size: d?.page_size ?? pageSize,
        total_pages: d?.total_pages ?? 1,
        has_next: d?.has_next ?? false,
        has_previous: d?.has_previous ?? false,
        summary: d?.summary ?? null,
      },
    });
  } catch (err) {
    dispatch({ type: INBOUND_HISTORY_FAILURE, payload: err?.response?.data?.detail || "Failed to load inbound call history." });
    toast.error(err?.response?.data?.detail || "Failed to load inbound call history.");
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
    toast.success(res?.data?.detail ?? "Campaign updated successfully!");
    dispatch(listCampaigns({ page: 1, page_size: 20 }));
    if (onSuccess) onSuccess();
  } catch (err) {
    dispatch({ type: UPDATE_CAMPAIGN_FAILURE, payload: err?.response?.data?.detail || err?.response?.data?.detail || "Failed to update campaign." });
    toast.error(err?.response?.data?.detail || err?.response?.data?.detail || "Failed to update campaign.");
  }
};

// 🗑️ Delete Campaign  —  DELETE /remove-campaign/{campaign_id}
export const deleteCampaign = (campaignId, onSuccess) => async (dispatch) => {
  dispatch({ type: DELETE_CAMPAIGN_REQUEST });
  try {
    const res = await axiosInstance.delete(`/remove-campaign/${campaignId}`);
    dispatch({ type: DELETE_CAMPAIGN_SUCCESS, payload: campaignId });
    toast.success(res?.data?.detail ?? "Campaign deleted successfully!");
    if (onSuccess) onSuccess();
  } catch (err) {
    dispatch({ type: DELETE_CAMPAIGN_FAILURE, payload: err?.response?.data?.detail || err?.response?.data?.detail || "Failed to delete campaign." });
    toast.error(err?.response?.data?.detail || err?.response?.data?.detail || "Failed to delete campaign.");
  }
};

// 📧 Email Drafts — GET /api/campaigns/{id}/email-drafts
export const fetchEmailDrafts = (campaignId) => async (dispatch) => {
  dispatch({ type: EMAIL_DRAFTS_REQUEST });
  try {
    const res = await axiosInstance.get(`/api/campaigns/${campaignId}/email-drafts`);
    const raw = Array.isArray(res.data) ? res.data : (res.data?.drafts ?? res.data?.data ?? res.data?.items ?? res.data?.results ?? []);

    const normalizeAvailableOnSystem = (availableOnSystem) => {
      if (!availableOnSystem || typeof availableOnSystem !== "object" || Array.isArray(availableOnSystem)) {
        return null;
      }

      return Object.entries(availableOnSystem).reduce((acc, [key, rawValue]) => {
        if (rawValue && typeof rawValue === "object" && !Array.isArray(rawValue) && "value" in rawValue) {
          acc[key] = rawValue.value;
        } else {
          acc[key] = rawValue;
        }
        return acc;
      }, {});
    };
    
    const normalized = raw.map((r) => ({
      id: r.id ?? r.email_draft_id ?? r.draft_id ?? null,
      email_history_id: r.email_history_id ?? r.id ?? null,
      lead_name: r.lead_name ?? r.name ?? r.contact_name ?? "—",
      to_email: r.to_email ?? r.email ?? r.email_address ?? r.contact_email ?? "—",
      company_name: r.company_name ?? r.company ?? r.organization ?? "—",
      email_subject: r.email_subject ?? r.subject ?? "—",
      email_body: r.email_body ?? r.body ?? "",
      subject: r.subject ?? r.email_subject ?? "—",
      status: (r.status ?? r.email_status ?? "").toUpperCase(),
      sent_at: r.sent_at ?? r.created_at ?? r.date ?? null,
      campaign_name: r.campaign_name ?? "",
      replies: r.replies ?? [],
      follow_up_tasks: r.follow_up_tasks ?? [],
      total_tasks: Number(r.total_tasks ?? 0) || 0,
      ...r,
      available_on_system: normalizeAvailableOnSystem(r?.available_on_system),
    }));

    dispatch({
      type: EMAIL_DRAFTS_SUCCESS,
      payload: normalized,
    });
  } catch (err) {
    dispatch({ type: EMAIL_DRAFTS_FAILURE, payload: err?.response?.data?.detail || "Failed to load email drafts." });
  }
};

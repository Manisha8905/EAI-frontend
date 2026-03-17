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

    // ✅ SAVE TOKEN HERE
    localStorage.setItem("session_token", response.data.session_token);

    dispatch({
      type: LOGIN_SUCCESS,
      payload: response.data,
    });
    toast.success(response?.data?.message ?? "Login Successful");
    router.push("/user-management");
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

  } catch (error) {
    console.log("EDIT ERROR:", error.response);

    dispatch({
      type: "EDIT_USER_FAIL",
      payload: error.response?.data?.message || "Something went wrong",
    });
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
      campaignType:      c.campaign_type                ?? "",
      communicationType: c.communication_type           ?? "",
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
export const createCampaign = (formData, onSuccess) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("/create-campaign", formData);
    toast.success(res?.data?.message ?? "Campaign created successfully!");
    dispatch(listCampaigns({ page: 1, page_size: 20 }));
    if (onSuccess) onSuccess();
  } catch (err) {
    toast.error(err?.response?.data?.detail || err?.response?.data?.message || "Failed to create campaign.");
  }
};

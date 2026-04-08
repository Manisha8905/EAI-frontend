import {
  USERS_REQUEST,
  USERS_SUCCESS,
  USERS_FAILURE,

  CREATE_USER_REQUEST,
  CREATE_USER_SUCCESS,
  CREATE_USER_FAILURE,

  SINGLE_USER_REQUEST,
  SINGLE_USER_SUCCESS,
  SINGLE_USER_FAIL,

  EDIT_USER_REQUEST,
  EDIT_USER_SUCCESS,
  EDIT_USER_FAIL,

  DELETE_USER_REQUEST,
  DELETE_USER_SUCCESS,
  DELETE_USER_FAIL,

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

const initialState = {
  admin: [],
  singleUser: null,
  loading: false,
  error: null,
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
  // 📊 Outbound Calls
  outboundData: null,
  outboundLoading: false,
  outboundError: null,
  // 📊 Inbound Calls
  inboundData: null,
  inboundLoading: false,
  inboundError: null,
  // 📊 Email Campaigns
  emailData: null,
  emailLoading: false,
  emailError: null,
  // � LinkedIn Campaigns
  linkedinData: null,
  linkedinLoading: false,
  linkedinError: null,
  // �📋 Campaign List
  campaigns: [],
  campaignTotal: 0,
  campaignLoading: false,
  campaignError: null,
  // 📞 Call History
  callHistory: [],
  callHistoryLoading: false,
  callHistoryError: null,
  callHistoryTotalTasks: 0,
  // 📧 Email History
  emailHistory: [],
  emailHistoryLoading: false,
  emailHistoryError: null,
  emailHistoryTotalCount: 0,
  emailHistoryTotalReplied: 0,
  emailHistoryTotalTasks: 0,
  // 💼 LinkedIn History
  linkedinHistory: [],
  linkedinHistoryTotal: 0,
  linkedinHistoryLoading: false,
  linkedinHistoryError: null,
  // 📱 WhatsApp History
  whatsappHistory: [],
  whatsappAnalytics: null,
  whatsappHistoryLoading: false,
  whatsappHistoryError: null,
  // ✏️ Update Campaign
  updatingCampaign: false,
  // 🗑️ Delete Campaign
  deletingCampaign: false,
  // 📞 Inbound Call History
  inboundCallHistory: [],
  inboundHistoryLoading: false,
  inboundHistoryError: null,
  inboundCallHistoryMeta: { total_count: 0, page: 1, page_size: 10, total_pages: 1, has_next: false, has_previous: false, summary: null },
};

const adminReducers = (state = initialState, action) => {
  switch (action.type) {

    // 🔹 All Loading Requests
    case USERS_REQUEST:
    case CREATE_USER_REQUEST:
    case SINGLE_USER_REQUEST:
    case EDIT_USER_REQUEST:
    case DELETE_USER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        createSuccess: false,
        updateSuccess: false,
        deleteSuccess: false,
      };

    // 🔹 Get All Users
    case USERS_SUCCESS:
      return {
        ...state,
        loading: false,
        admin: action.payload,
      };

    // 🔹 Get Single User
    case SINGLE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        singleUser: action.payload,
      };

    // 🔹 Create User
    case CREATE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        createSuccess: true,
      };

    // 🔹 Edit User
    case EDIT_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        updateSuccess: true,
      };

    // 🔹 Delete User
    case DELETE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        deleteSuccess: true,
      };

    // 🔹 All Failures
    case USERS_FAILURE:
    case CREATE_USER_FAILURE:
    case SINGLE_USER_FAIL:
    case EDIT_USER_FAIL:
    case DELETE_USER_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // 📊 Outbound Calls
    case OUTBOUND_CALLS_REQUEST:
      return {
        ...state,
        outboundLoading: true,
        outboundError: null,
      };

    case OUTBOUND_CALLS_SUCCESS:
      return {
        ...state,
        outboundLoading: false,
        outboundData: action.payload,
      };

    case OUTBOUND_CALLS_FAILURE:
      return {
        ...state,
        outboundLoading: false,
        outboundError: action.payload,
      };

    // 📊 Inbound Calls
    case INBOUND_CALLS_REQUEST:
      return {
        ...state,
        inboundLoading: true,
        inboundError: null,
      };

    case INBOUND_CALLS_SUCCESS:
      return {
        ...state,
        inboundLoading: false,
        inboundData: action.payload,
      };

    case INBOUND_CALLS_FAILURE:
      return {
        ...state,
        inboundLoading: false,
        inboundError: action.payload,
      };

    // 📊 Email Campaigns
    case EMAIL_CAMPAIGNS_REQUEST:
      return {
        ...state,
        emailLoading: true,
        emailError: null,
      };

    case EMAIL_CAMPAIGNS_SUCCESS:
      return {
        ...state,
        emailLoading: false,
        emailData: action.payload,
      };

    case EMAIL_CAMPAIGNS_FAILURE:
      return {
        ...state,
        emailLoading: false,
        emailError: action.payload,
      };

    // � LinkedIn Campaigns
    case LINKEDIN_CAMPAIGNS_REQUEST:
      return {
        ...state,
        linkedinLoading: true,
        linkedinError: null,
      };

    case LINKEDIN_CAMPAIGNS_SUCCESS:
      return {
        ...state,
        linkedinLoading: false,
        linkedinData: action.payload,
      };

    case LINKEDIN_CAMPAIGNS_FAILURE:
      return {
        ...state,
        linkedinLoading: false,
        linkedinError: action.payload,
      };

    // �📋 Campaign List
    case CAMPAIGN_LIST_REQUEST:
      return { ...state, campaignLoading: true, campaignError: null };
    case CAMPAIGN_LIST_SUCCESS:
      return {
        ...state,
        campaignLoading: false,
        campaigns: action.payload.campaigns,
        campaignTotal: action.payload.total,
        preview: action.payload.preview,
      };
    case CAMPAIGN_LIST_FAILURE:
      return { ...state, campaignLoading: false, campaignError: action.payload };
    case CAMPAIGN_PATCH_SUCCESS: {
      const incoming = action.payload;
      const incomingId = String(incoming?.id ?? "");
      const existingIndex = state.campaigns.findIndex((c) => String(c.id) === incomingId);

      if (existingIndex === -1) {
        return {
          ...state,
          campaigns: [incoming, ...state.campaigns],
          campaignTotal: (state.campaignTotal ?? 0) + 1,
        };
      }

      const nextCampaigns = [...state.campaigns];
      nextCampaigns[existingIndex] = {
        ...nextCampaigns[existingIndex],
        ...incoming,
      };

      return {
        ...state,
        campaigns: nextCampaigns,
      };
    }

    // ▶️ Optimistic status patch after activate/deactivate
    case "ACTIVATE_CAMPAIGN_SUCCESS":
      return {
        ...state,
        campaigns: state.campaigns.map((c) =>
          c.id === action.payload.id ? { ...c, status: action.payload.status } : c
        ),
      };

    // 📞 Call History
    case CALL_HISTORY_REQUEST:
      return {
        ...state,
        callHistoryLoading: true,
        callHistoryError: null,
        callHistory: [],
        callHistoryTotalTasks: 0,
      };
    case CALL_HISTORY_SUCCESS:
      return {
        ...state,
        callHistoryLoading: false,
        callHistory: action.payload?.data || action.payload,
        callHistoryTotalTasks: Number(action.payload?.total_tasks ?? 0) || 0,
      };
    case CALL_HISTORY_FAILURE:
      return {
        ...state,
        callHistoryLoading: false,
        callHistoryError: action.payload,
        callHistoryTotalTasks: 0,
      };

    // 📧 Email History
    case EMAIL_HISTORY_REQUEST:
      return {
        ...state,
        emailHistoryLoading: true,
        emailHistoryError: null,
        emailHistory: [],
        emailHistoryTotalCount: 0,
        emailHistoryTotalReplied: 0,
        emailHistoryTotalTasks: 0,
      };
    case EMAIL_HISTORY_SUCCESS:
      return {
        ...state,
        emailHistoryLoading: false,
        emailHistory: action.payload.data || action.payload,
        emailHistoryTotalCount: action.payload.total_count || 0,
        emailHistoryTotalReplied: action.payload.total_replied || 0,
        emailHistoryTotalTasks: Number(action.payload.total_tasks ?? 0) || 0,
      };
    case EMAIL_HISTORY_FAILURE:
      return {
        ...state,
        emailHistoryLoading: false,
        emailHistoryError: action.payload,
        emailHistoryTotalReplied: 0,
        emailHistoryTotalTasks: 0,
      };

    // 💼 LinkedIn History
    case LINKEDIN_HISTORY_REQUEST:
      return { ...state, linkedinHistoryLoading: true, linkedinHistoryError: null, linkedinHistory: [], linkedinHistoryTotal: 0 };
    case LINKEDIN_HISTORY_SUCCESS: {
      const liPayload = action.payload;
      const liData = Array.isArray(liPayload) ? liPayload : (liPayload?.data ?? []);
      const liTotal = liPayload?.total ?? liData.length;
      return { ...state, linkedinHistoryLoading: false, linkedinHistory: liData, linkedinHistoryTotal: liTotal };
    }
    case LINKEDIN_HISTORY_FAILURE:
      return { ...state, linkedinHistoryLoading: false, linkedinHistoryError: action.payload };

    // 📱 WhatsApp History
    case WHATSAPP_HISTORY_REQUEST:
      return { ...state, whatsappHistoryLoading: true, whatsappHistoryError: null, whatsappHistory: [], whatsappAnalytics: null };
    case WHATSAPP_HISTORY_SUCCESS:
      return { ...state, whatsappHistoryLoading: false, whatsappHistory: action.payload.conversations ?? [], whatsappAnalytics: action.payload.analytics ?? null };
    case WHATSAPP_HISTORY_FAILURE:
      return { ...state, whatsappHistoryLoading: false, whatsappHistoryError: action.payload };

    // ✏️ Update Campaign
    case UPDATE_CAMPAIGN_REQUEST:
      return { ...state, updatingCampaign: true };
    case UPDATE_CAMPAIGN_SUCCESS:
      return { ...state, updatingCampaign: false };
    case UPDATE_CAMPAIGN_FAILURE:
      return { ...state, updatingCampaign: false };

    // 🗑️ Delete Campaign
    case DELETE_CAMPAIGN_REQUEST:
      return { ...state, deletingCampaign: true };
    case DELETE_CAMPAIGN_SUCCESS:
      return {
        ...state,
        deletingCampaign: false,
        campaigns: state.campaigns.filter((c) => c.id !== action.payload),
        campaignTotal: Math.max(0, (state.campaignTotal ?? 0) - 1),
      };
    case DELETE_CAMPAIGN_FAILURE:
      return { ...state, deletingCampaign: false };

    // 📞 Inbound Call History
    case INBOUND_HISTORY_REQUEST:
      return { ...state, inboundHistoryLoading: true, inboundHistoryError: null };
    case INBOUND_HISTORY_SUCCESS:
      return {
        ...state,
        inboundHistoryLoading: false,
        inboundCallHistory: action.payload.calls ?? action.payload,
        inboundCallHistoryMeta: {
          total_count: action.payload.total_count ?? 0,
          page: action.payload.page ?? 1,
          page_size: action.payload.page_size ?? 10,
          total_pages: action.payload.total_pages ?? 1,
          has_next: action.payload.has_next ?? false,
          has_previous: action.payload.has_previous ?? false,
          summary: action.payload.summary ?? null,
        },
      };
    case INBOUND_HISTORY_FAILURE:
      return { ...state, inboundHistoryLoading: false, inboundHistoryError: action.payload };

    default:
      return state;
  }
};

export default adminReducers;
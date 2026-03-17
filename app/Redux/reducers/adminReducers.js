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

  CAMPAIGN_LIST_REQUEST,
  CAMPAIGN_LIST_SUCCESS,
  CAMPAIGN_LIST_FAILURE,

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
  // 📋 Campaign List
  campaigns: [],
  campaignTotal: 0,
  campaignLoading: false,
  campaignError: null,
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

    // 📋 Campaign List
    case CAMPAIGN_LIST_REQUEST:
      return { ...state, campaignLoading: true, campaignError: null };
    case CAMPAIGN_LIST_SUCCESS:
      return {
        ...state,
        campaignLoading: false,
        campaigns: action.payload.campaigns,
        campaignTotal: action.payload.total,
      };
    case CAMPAIGN_LIST_FAILURE:
      return { ...state, campaignLoading: false, campaignError: action.payload };

    default:
      return state;
  }
};

export default adminReducers;
import {
  CAMPAIGN_LIST_REQUEST,
  CAMPAIGN_LIST_SUCCESS,
  CAMPAIGN_LIST_FAILURE,
  CAMPAIGN_LIST_RESET,
  APPROVE_EMAIL_DRAFTS_REQUEST,
  APPROVE_EMAIL_DRAFTS_SUCCESS,
  APPROVE_EMAIL_DRAFTS_FAILURE,
  APPROVE_EMAIL_DRAFTS_RESET,
} from "../types/campaignTypes";

const initialState = {
  loading:   false,
  campaigns: [],
  error:     "",
};

export const campaignListReducer = (state = initialState, action) => {
  switch (action.type) {
    case CAMPAIGN_LIST_REQUEST:
      return { ...state, loading: true, error: "" };
    case CAMPAIGN_LIST_SUCCESS:
      return { ...state, loading: false, campaigns: action.payload, error: "" };
    case CAMPAIGN_LIST_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case CAMPAIGN_LIST_RESET:
      return initialState;
    default:
      return state;
  }
};

// Email Draft Approval Reducer
const emailDraftInitialState = {
  loading: false,
  approvalResult: null,
  freshDrafts: [],
  approvedAt: null,
  error: "",
};

export const emailDraftApprovalReducer = (state = emailDraftInitialState, action) => {
  switch (action.type) {
    case APPROVE_EMAIL_DRAFTS_REQUEST:
      return { ...state, loading: true, error: "" };
    case APPROVE_EMAIL_DRAFTS_SUCCESS:
      return {
        ...state,
        loading: false,
        approvalResult: action.payload.approvalResult,
        freshDrafts: action.payload.freshDrafts,
        approvedAt: action.payload.approvedAt,
        error: "",
      };
    case APPROVE_EMAIL_DRAFTS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case APPROVE_EMAIL_DRAFTS_RESET:
      return emailDraftInitialState;
    default:
      return state;
  }
};

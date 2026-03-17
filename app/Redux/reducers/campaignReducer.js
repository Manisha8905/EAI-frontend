import {
  CAMPAIGN_LIST_REQUEST,
  CAMPAIGN_LIST_SUCCESS,
  CAMPAIGN_LIST_FAILURE,
  CAMPAIGN_LIST_RESET,
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

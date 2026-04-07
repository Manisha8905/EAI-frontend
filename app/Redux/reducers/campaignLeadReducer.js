import {
  ADD_CAMPAIGN_LEAD_REQUEST,
  ADD_CAMPAIGN_LEAD_SUCCESS,
  ADD_CAMPAIGN_LEAD_FAILURE,
} from "../actions/campaignLeadActions";

const initialState = {
  loading: false,
  data: null,
  error: null,
};

const campaignLeadReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_CAMPAIGN_LEAD_REQUEST:
      return { ...state, loading: true, error: null };
    case ADD_CAMPAIGN_LEAD_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case ADD_CAMPAIGN_LEAD_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default campaignLeadReducer;

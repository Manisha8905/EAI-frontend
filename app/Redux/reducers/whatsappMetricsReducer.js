import {
  FETCH_WHATSAPP_METRICS_REQUEST,
  FETCH_WHATSAPP_METRICS_SUCCESS,
  FETCH_WHATSAPP_METRICS_FAILURE,
} from "../types/campaignTypes";

const initialState = {
  loading: false,
  data: null,
  error: null,
};

const whatsappMetricsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_WHATSAPP_METRICS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_WHATSAPP_METRICS_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case FETCH_WHATSAPP_METRICS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default whatsappMetricsReducer;

import {
  INVOICE_METRICS_REQUEST,
  INVOICE_METRICS_SUCCESS,
  INVOICE_METRICS_FAILURE,
} from "../types/invoiceMetricsTypes";

const initialState = {
  loading: false,
  data: null,   // shape: res.data.data  (summary_cards, status_distribution, processing_trend, failure_rate)
  error: null,
};

export default function invoiceMetricsReducer(state = initialState, action) {
  switch (action.type) {
    case INVOICE_METRICS_REQUEST:
      return { ...state, loading: true, error: null };
    case INVOICE_METRICS_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case INVOICE_METRICS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

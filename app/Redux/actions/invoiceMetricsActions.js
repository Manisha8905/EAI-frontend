import axiosInstance from "../axiosInstance";
import {
  INVOICE_METRICS_REQUEST,
  INVOICE_METRICS_SUCCESS,
  INVOICE_METRICS_FAILURE,
} from "../types/invoiceMetricsTypes";

export const fetchInvoiceMetrics = () => async (dispatch) => {
  dispatch({ type: INVOICE_METRICS_REQUEST });
  try {
    const res = await axiosInstance.get("/invoice-processing/metrics");
    dispatch({ type: INVOICE_METRICS_SUCCESS, payload: res.data.data });
  } catch (err) {
    dispatch({
      type: INVOICE_METRICS_FAILURE,
      payload:err?.response?.data?.detail ?? err.detail ?? "An error occurred while fetching invoice metrics.",

    });
  }
};

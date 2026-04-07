import axiosInstance from "../axiosInstance";
import {
  FETCH_WHATSAPP_METRICS_REQUEST,
  FETCH_WHATSAPP_METRICS_SUCCESS,
  FETCH_WHATSAPP_METRICS_FAILURE,
} from "../types/campaignTypes";

export const fetchWhatsappMetrics = (payload) => async (dispatch) => {
  dispatch({ type: FETCH_WHATSAPP_METRICS_REQUEST });
  try {
    const response = await axiosInstance.post("/api/metrics/whatsapp-campaigns", payload);
    dispatch({
      type: FETCH_WHATSAPP_METRICS_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_WHATSAPP_METRICS_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

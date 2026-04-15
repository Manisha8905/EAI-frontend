import axiosInstance from "../axiosInstance";
import { toast } from "react-toastify";
import {
  FETCH_WHATSAPP_METRICS_REQUEST,
  FETCH_WHATSAPP_METRICS_SUCCESS,
  FETCH_WHATSAPP_METRICS_FAILURE,
} from "../types/campaignTypes";

export const fetchWhatsappMetrics = (payload) => async (dispatch) => {
  dispatch({ type: FETCH_WHATSAPP_METRICS_REQUEST });
  try {
    const response = await axiosInstance.post("/api/metrics/whatsapp", payload);
    dispatch({
      type: FETCH_WHATSAPP_METRICS_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    const errorMsg = error.response?.data?.detail || 
                     error.response?.data?.message || 
                     error.message || 
                     "Failed to fetch WhatsApp metrics";
    dispatch({
      type: FETCH_WHATSAPP_METRICS_FAILURE,
      payload: errorMsg,
    });

    if (errorMsg && errorMsg !== "") {
      toast.error(errorMsg);
    }
  }
};

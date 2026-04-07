import axiosInstance from "../axiosInstance";

export const FETCH_WHATSAPP_CONVERSATION_REQUEST = "FETCH_WHATSAPP_CONVERSATION_REQUEST";
export const FETCH_WHATSAPP_CONVERSATION_SUCCESS = "FETCH_WHATSAPP_CONVERSATION_SUCCESS";
export const FETCH_WHATSAPP_CONVERSATION_FAILURE = "FETCH_WHATSAPP_CONVERSATION_FAILURE";

export const fetchWhatsappConversation = (conversation_id) => async (dispatch) => {
  dispatch({ type: FETCH_WHATSAPP_CONVERSATION_REQUEST });
  try {
    const res = await axiosInstance.get(`/api/whatsapp/conversations/${conversation_id}`);
    dispatch({
      type: FETCH_WHATSAPP_CONVERSATION_SUCCESS,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_WHATSAPP_CONVERSATION_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

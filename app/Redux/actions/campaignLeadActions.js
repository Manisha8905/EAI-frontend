import axiosInstance from "../axiosInstance";

export const ADD_CAMPAIGN_LEAD_REQUEST = "ADD_CAMPAIGN_LEAD_REQUEST";
export const ADD_CAMPAIGN_LEAD_SUCCESS = "ADD_CAMPAIGN_LEAD_SUCCESS";
export const ADD_CAMPAIGN_LEAD_FAILURE = "ADD_CAMPAIGN_LEAD_FAILURE";

export const addCampaignLead = (campaign_id, leadData) => async (dispatch) => {
  dispatch({ type: ADD_CAMPAIGN_LEAD_REQUEST });
  try {
    const res = await axiosInstance.post(`/campaigns/${campaign_id}/leads/add`, leadData);
    dispatch({
      type: ADD_CAMPAIGN_LEAD_SUCCESS,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: ADD_CAMPAIGN_LEAD_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

import axiosInstance from "../axiosInstance";
import {
  FETCH_BUSINESS_RULES_REQUEST,
  FETCH_BUSINESS_RULES_SUCCESS,
  FETCH_BUSINESS_RULES_FAILURE,
  DELETE_BUSINESS_RULE_REQUEST,
  DELETE_BUSINESS_RULE_OPTIMISTIC,
  DELETE_BUSINESS_RULE_SUCCESS,
  DELETE_BUSINESS_RULE_FAILURE,
} from "../types/businessRulesTypes";

const normalizeRules = (payload) => {
  const data = payload?.data ?? payload ?? [];
  return Array.isArray(data) ? data : [];
};

const isDeleteSuccessStatus = (status) =>
  status === 200 || status === 204 || status === 404;

export const fetchBusinessRules = () => async (dispatch) => {
  dispatch({ type: FETCH_BUSINESS_RULES_REQUEST });
  try {
    const res = await axiosInstance.get("/api/chatbot/business-rules/");
    const rawRules = normalizeRules(res?.data);
    const rules = [...rawRules].reverse();
    dispatch({ type: FETCH_BUSINESS_RULES_SUCCESS, payload: rules });
    return rules;
  } catch (error) {
    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to load business rules.";
    dispatch({ type: FETCH_BUSINESS_RULES_FAILURE, payload: message });
    throw error;
  }
};

export const deleteBusinessRule = (ruleId) => async (dispatch, getState) => {
  if (!ruleId) return { ok: false };

  const deletingById = getState()?.businessRules?.deletingById ?? {};
  if (deletingById[ruleId]) return { ok: false, duplicate: true };

  dispatch({ type: DELETE_BUSINESS_RULE_REQUEST, payload: ruleId });
  dispatch({ type: DELETE_BUSINESS_RULE_OPTIMISTIC, payload: ruleId });

  try {
    const res = await axiosInstance.delete(
      `/api/chatbot/business-rules/${ruleId}/`,
      { validateStatus: isDeleteSuccessStatus },
    );

    dispatch({
      type: DELETE_BUSINESS_RULE_SUCCESS,
      payload: { ruleId, status: res?.status ?? 200 },
    });
    dispatch(fetchBusinessRules());
    return { ok: true, status: res?.status ?? 200 };
  } catch {
    try {
      const res = await axiosInstance.delete(`/chatbot/business-rules/${ruleId}/`, {
        validateStatus: isDeleteSuccessStatus,
      });

      dispatch({
        type: DELETE_BUSINESS_RULE_SUCCESS,
        payload: { ruleId, status: res?.status ?? 200 },
      });
      dispatch(fetchBusinessRules());
      return { ok: true, status: res?.status ?? 200, fallbackPath: true };
    } catch (error) {
      try {
        const verify = await axiosInstance.get("/api/chatbot/business-rules/");
        const rules = normalizeRules(verify?.data);
        dispatch({ type: FETCH_BUSINESS_RULES_SUCCESS, payload: rules });
        const deleted = !rules.some((r) => String(r?.id) === String(ruleId));
        if (deleted) {
          dispatch({
            type: DELETE_BUSINESS_RULE_SUCCESS,
            payload: { ruleId, status: 404 },
          });
          return { ok: true, status: 404, verifiedDeleted: true };
        }
      } catch {
        // Ignore verify error and fail below.
      }

      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete business rule.";
      dispatch({
        type: DELETE_BUSINESS_RULE_FAILURE,
        payload: { ruleId, error: message },
      });
      dispatch(fetchBusinessRules());
      throw error;
    }
  }
};

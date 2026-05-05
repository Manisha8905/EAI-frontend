import {
  FETCH_BUSINESS_RULES_REQUEST,
  FETCH_BUSINESS_RULES_SUCCESS,
  FETCH_BUSINESS_RULES_FAILURE,
  DELETE_BUSINESS_RULE_REQUEST,
  DELETE_BUSINESS_RULE_OPTIMISTIC,
  DELETE_BUSINESS_RULE_SUCCESS,
  DELETE_BUSINESS_RULE_FAILURE,
} from "../types/businessRulesTypes";

const initialState = {
  list: [],
  loading: false,
  error: "",
  deletingById: {},
};

const businessRulesReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_BUSINESS_RULES_REQUEST:
      return {
        ...state,
        loading: true,
        error: "",
      };

    case FETCH_BUSINESS_RULES_SUCCESS:
      return {
        ...state,
        loading: false,
        error: "",
        list: action.payload,
      };

    case FETCH_BUSINESS_RULES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload || "Failed to load business rules.",
      };

    case DELETE_BUSINESS_RULE_REQUEST:
      return {
        ...state,
        deletingById: {
          ...state.deletingById,
          [action.payload]: true,
        },
      };

    case DELETE_BUSINESS_RULE_OPTIMISTIC:
      return {
        ...state,
        list: state.list.filter(
          (rule) => String(rule?.id) !== String(action.payload),
        ),
      };

    case DELETE_BUSINESS_RULE_SUCCESS: {
      const nextDeleting = { ...state.deletingById };
      delete nextDeleting[action.payload?.ruleId];
      return {
        ...state,
        deletingById: nextDeleting,
      };
    }

    case DELETE_BUSINESS_RULE_FAILURE: {
      const nextDeleting = { ...state.deletingById };
      delete nextDeleting[action.payload?.ruleId];
      return {
        ...state,
        deletingById: nextDeleting,
        error: action.payload?.error || "Failed to delete business rule.",
      };
    }

    default:
      return state;
  }
};

export default businessRulesReducer;

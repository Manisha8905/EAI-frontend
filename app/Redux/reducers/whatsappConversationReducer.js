import {
  FETCH_WHATSAPP_CONVERSATION_REQUEST,
  FETCH_WHATSAPP_CONVERSATION_SUCCESS,
  FETCH_WHATSAPP_CONVERSATION_FAILURE,
} from "../actions/whatsappConversationActions";

const initialState = {
  loading: false,
  data: null,
  error: null,
};

const whatsappConversationReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_WHATSAPP_CONVERSATION_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_WHATSAPP_CONVERSATION_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case FETCH_WHATSAPP_CONVERSATION_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default whatsappConversationReducer;

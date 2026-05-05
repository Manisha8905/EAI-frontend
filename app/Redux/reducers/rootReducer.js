import { combineReducers } from "redux";

import authReducer from "./authReducers";
import adminReducer from "./adminReducers";

import whatsappMetricsReducer from "./whatsappMetricsReducer";

import campaignLeadReducer from "./campaignLeadReducer";
import whatsappConversationReducer from "./whatsappConversationReducer";
import invoiceMetricsReducer from "./invoiceMetricsReducer";
import businessRulesReducer from "./businessRulesReducer";

const rootReducer = combineReducers({
  auth: authReducer,
  admin: adminReducer,
  whatsappMetrics: whatsappMetricsReducer,
  whatsappConversation: whatsappConversationReducer,
  campaignLead: campaignLeadReducer,
  invoiceMetrics: invoiceMetricsReducer,
  businessRules: businessRulesReducer,
});

export default rootReducer;
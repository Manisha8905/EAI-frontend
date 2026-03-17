import { combineReducers } from "redux";
import authReducer from "./authReducers";
import adminReducer from "./adminReducers";

const rootReducer = combineReducers({
  auth: authReducer,
  admin: adminReducer,
});

export default rootReducer;
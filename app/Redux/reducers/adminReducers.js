import {
  USERS_REQUEST,
  USERS_SUCCESS,
  USERS_FAILURE,

  CREATE_USER_REQUEST,
  CREATE_USER_SUCCESS,
  CREATE_USER_FAILURE,

  SINGLE_USER_REQUEST,
  SINGLE_USER_SUCCESS,
  SINGLE_USER_FAIL,

  EDIT_USER_REQUEST,
  EDIT_USER_SUCCESS,
  EDIT_USER_FAIL,

  DELETE_USER_REQUEST,
  DELETE_USER_SUCCESS,
  DELETE_USER_FAIL,

} from "../types/userTypes";

const initialState = {
  admin: [],
  singleUser: null,
  loading: false,
  error: null,
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
};

const adminReducers = (state = initialState, action) => {
  switch (action.type) {

    // 🔹 All Loading Requests
    case USERS_REQUEST:
    case CREATE_USER_REQUEST:
    case SINGLE_USER_REQUEST:
    case EDIT_USER_REQUEST:
    case DELETE_USER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        createSuccess: false,
        updateSuccess: false,
        deleteSuccess: false,
      };

    // 🔹 Get All Users
    case USERS_SUCCESS:
      return {
        ...state,
        loading: false,
        admin: action.payload,
      };

    // 🔹 Get Single User
    case SINGLE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        singleUser: action.payload,
      };

    // 🔹 Create User
    case CREATE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        createSuccess: true,
      };

    // 🔹 Edit User
    case EDIT_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        updateSuccess: true,
      };

    // 🔹 Delete User
    case DELETE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        deleteSuccess: true,
      };

    // 🔹 All Failures
    case USERS_FAILURE:
    case CREATE_USER_FAILURE:
    case SINGLE_USER_FAIL:
    case EDIT_USER_FAIL:
    case DELETE_USER_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default adminReducers;
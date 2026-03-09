import axios from "axios";
import {
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  USERS_REQUEST,
  USERS_SUCCESS,
  USERS_FAILURE,
  CREATE_USER_REQUEST,
  CREATE_USER_SUCCESS,
  CREATE_USER_FAILURE,
  SINGLE_USER_REQUEST,
  LOGIN_REQUEST,
  DELETE_USER_FAIL,
  DELETE_USER_SUCCESS,
  DELETE_USER_REQUEST,
  EDIT_USER_FAIL,
  EDIT_USER_SUCCESS,
  EDIT_USER_REQUEST,
  SINGLE_USER_FAIL,
  SINGLE_USER_SUCCESS,
  LOGOUT_REQUEST,
} from "../types/userTypes";

import axiosInstance from "../axiosInstance";
import { toast } from "react-toastify";

export const loginUser = (values, router) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });

  try {
    const params = new URLSearchParams();
    params.append("email", values.email);
    params.append("password", values.password);

    const response = await axiosInstance.post("/login", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // ✅ SAVE TOKEN HERE
    localStorage.setItem("session_token", response.data.session_token);

    dispatch({
      type: LOGIN_SUCCESS,
      payload: response.data,
    });
    toast.success(response?.data?.message ?? "Login Successful");
    router.push("/user-management");
  } catch (error) {
    toast.error(error.response?.data?.message || "login failed");
  }
};

export const logoutUser = () => async (dispatch) => {
  dispatch({ type: LOGOUT_REQUEST});

  try {
    const response = await axiosInstance.post("/logout");

    // remove token
    localStorage.removeItem("session_token");



    toast.success(response?.data?.message ?? "Logout Successful");

  } catch (error) {
    localStorage.removeItem("session_token");

    dispatch({
      type: "LOGOUT_FAIL",
    });

    toast.error(error.response?.data?.message || "Logout failed");
  }
};

export const fetchUsers = () => async (dispatch) => {
  dispatch({ type: USERS_REQUEST });

  try {
    const response = await axiosInstance.get("/api/users");

    dispatch({
      type: USERS_SUCCESS,
      payload: response.data,
    });
    // toast.success(response?.data?.message ?? " User Successfully");
  } catch (error) {
    toast.error(error.response?.data?.message ?? " User Failed");
  }
};
export const createUser = (userData) => async (dispatch) => {
  dispatch({ type: CREATE_USER_REQUEST });

  try {
    // 🔥 Convert to x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append("username", userData.username);
    params.append("email", userData.email);
    params.append("password", userData.password);
    params.append("user_role", userData.role);

    const response = await axiosInstance.post("/register", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    dispatch({
      type: CREATE_USER_SUCCESS,
      payload: response.data,
    });
    toast.success(response?.data?.message ?? "Create User Successfully");
  } catch (error) {
    toast.error(error.response?.data?.message ?? "Create User Failed");
  }
};

export const getSingleUser = (user_id) => async (dispatch) => {
  dispatch({ type: SINGLE_USER_REQUEST });

  try {
    const response = await axiosInstance.get(`/api/users/${user_id}`);

    dispatch({
      type: SINGLE_USER_SUCCESS,
      payload: response.data,
    });

    // toast.success(response?.data?.message ?? "User Fetched Successfully");
  } catch (error) {
    dispatch({
      type: SINGLE_USER_FAIL,
      payload: error.response?.data?.message,
    });

    toast.error(error.response?.data?.message ?? "Fetch User Failed");
  }
};
export const editUser = (userData) => async (dispatch) => {
  dispatch({ type: "EDIT_USER_REQUEST" });
console.log("id", userData)
  try {
    const response = await axiosInstance.put(
      `/admin/users/update`,
      null,  // 👈 no body
      {
        params: {
          user_id: userData.user_id,
          username: userData.username,
          email: userData.email,
          role: userData.role,
          ...(userData.password && { password: userData.password }),
        },
          headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      }
    );

    dispatch({
      type: "EDIT_USER_SUCCESS",
      payload: response.data,
    });

  } catch (error) {
    console.log("EDIT ERROR:", error.response);

    dispatch({
      type: "EDIT_USER_FAIL",
      payload: error.response?.data?.message || "Something went wrong",
    });
  }
};
export const deleteUser = (target_email) => async (dispatch) => {
  dispatch({ type: DELETE_USER_REQUEST });

  try {
    const response = await axiosInstance.delete(
      `/admin/users/purge?target_email=${target_email}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    dispatch({
      type: DELETE_USER_SUCCESS,
      payload: response.data,
    });

    toast.success(response?.data?.message ?? "User Deleted Successfully");
  } catch (error) {
    dispatch({
      type: DELETE_USER_FAIL,
      payload: error.response?.data?.message,
    });

    toast.error(error.response?.data?.message ?? "Delete Failed");
  }
};

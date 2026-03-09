"use client";
import React, { useEffect } from "react";
import Modal from "react-modal";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { editUser, getSingleUser } from "../../Redux/actions/authActions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

Modal.setAppElement("body");

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    borderRadius: "12px",
    width: "450px",
    height: "85%",
    padding: "24px 20px 20px 20px",
  },
};


const roleOptions = [
  { label: "Super Admin", value: "SUPER_ADMIN" },
  { label: "Admin", value: "MANAGER" },
  { label: "Sales", value: "SALES" },
  { label: "Finance", value: "FINANCE" },
  { label: "Customer Support", value: "CUSTOMER_SUPPORT" },
];

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string(), // optional
  role: Yup.string().required("Please select a role"),
});

const UserEdit = ({ isOpen, onClose, user }) => {
  const dispatch = useDispatch();
  const { singleUser, loading } = useSelector((state) => state.admin);

  // ✅ Fetch single user by id
  useEffect(() => {
    if (isOpen && user?.id) {
      dispatch(getSingleUser(user.id)); // ✅ pass id only
    }
  }, [dispatch, isOpen, user]);

  // ✅ Formik
  const formik = useFormik({
    initialValues: {
      name: singleUser?.username || "",
      email: singleUser?.email || "",
      password: "",
      role: singleUser?.role || "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      const updatedData = {
        user_id: user.id,
        username: values.name,
        email: values.email,
        role: values.role,
      };

      if (values.password) {
        updatedData.password = values.password;
      }

      await dispatch(editUser(updatedData)); // ✅ only pass updatedData
      onClose();
    },
  });

  if (!singleUser) {
    return null; // Optional: show loader here
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={customStyles}>
      <h2 className="font-poppins text-[15px] font-[600] text-[#0a0a0a]">
        Edit User
      </h2>
      <p className="font-inter text-[13px] text-gray-600 leading-relaxed mb-2">
        Update user information and roles{" "}
      </p>
      <form onSubmit={formik.handleSubmit}>
        {/* Name */}
        <label className="block text-[14px] text-[#0a0a0a] font-inter font-[400] ">
          Name
        </label>
        <input
          type="text"
          name="name"
          className="w-full px-2 py-[6px] mt-1 mb-2 bg-[#ececf0] text-[13px] text-[#0a0a0a] rounded-lg border-1 border-gray-400 outline-none transition focus:ring-3 focus:ring-gray-400/40"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.name}
        />

        {/* Email */}
        <label className="block text-[13px] text-[#0a0a0a] font-inter font-[400] ">
          Email
        </label>
        <input
          type="email"
          name="email"
          className="w-full px-2 py-[6px] mt-1 mb-2 bg-[#ececf0] text-[13px] text-[#0a0a0a] rounded-lg border-1 border-gray-400 outline-none transition focus:ring-3 focus:ring-gray-400/40"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.email}
        />

        {/* Password */}
        <label className="block text-[13px] text-[#0a0a0a] font-inter font-[400] ">
          Password
        </label>
        <input
          type="password"
          name="password"
          className="w-full px-2 py-[6px] mt-1 mb-2 bg-[#ececf0] text-[13px] text-[#0a0a0a] rounded-lg border-1 border-gray-400 outline-none transition focus:ring-3 focus:ring-gray-400/40"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.password}
        />

        {/* Role */}
<label className="block text-[14px] text-[#0a0a0a] font-inter font-[400] pb-2">
  Role
</label>

{roleOptions.map((role) => (
  <label
    key={role.value}
    className="flex cursor-pointer items-center mb-1 gap-2 text-[14px] text-[#0a0a0a] font-inter font-[400]"
  >
    <input
      type="checkbox"
      checked={formik.values.role === role.value}
      onChange={() => formik.setFieldValue("role", role.value)}
      className="sr-only"
    />

    <div
      className={`relative w-4 h-4 rounded-[4px] border flex items-center justify-center
      ${
        formik.values.role === role.value
          ? "bg-[#0a0a0a] border-[#0a0a0a]"
          : "bg-[#ececf0] border-gray-400"
      }`}
    >
      {formik.values.role === role.value && (
        <FontAwesomeIcon
          icon={faCheck}
          className="w-2.5 h-2.5 text-white"
        />
      )}
    </div>

    {role.label}
  </label>
))}
       
        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 border-2 border-gray-300  rounded-[8px] text-[12px] font-medium text-[#0a0a0a]"
          >
            Cancel
          </button>

          <button
            type="submit"
            // disabled={loading}
            className="px-5 py-2 bg-black text-white rounded-[8px] text-[12px] font-medium"
          >
            <h4> Save</h4>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserEdit;

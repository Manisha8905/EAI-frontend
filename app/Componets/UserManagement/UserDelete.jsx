"use client";

import React from "react";
import Modal from "react-modal";
import { deleteUser } from "../../Redux/actions/authActions";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

Modal.setAppElement("body");

const customDeleteStyles = {
  content: {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    borderRadius: "12px",
    width: "350px",
    padding: "30px 20px 30px 20px",
    Height: "100%",
  },
};

const UserDelete = ({ isOpen, onClose, user }) => {
  const dispatch = useDispatch();

  const handleDelete = () => {
    dispatch(deleteUser(user?.email));
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white rounded-xl w-[350px] p-[30px_20px_10px] outline-none"
      overlayClassName="fixed inset-0 bg-black/40 flex items-center justify-center"
    >
      {" "}
      <h2 className="font-poppins text-[15px] text-center font-[600] text-[#0a0a0a]">
        Delete User
      </h2>
      <p className="font-inter text-[13px] text-center  text-gray-600 leading-relaxed mt-1 mb-4">
        Are you sure you want to delete this user? This action cannot be undone.
      </p>
      {/* <div className="p-1 rounded-md hover:bg-red-50 cursor-pointer transition">
  <FontAwesomeIcon
    icon={faTrash}
    className="text-[14px] text-gray-400 hover:text-red-600 transition"
  />
</div> */}
      <div className="flex justify-center gap-4 mt-6 pb-4">
        <button
          onClick={onClose}
          className="px-3 py-2 border-2 border-gray-300 rounded-[8px] text-[12px] font-medium text-[#0a0a0a]  hover:shadow-md hover:scale-[1.05]"
        >
          Cancel
        </button>

        <button
          onClick={handleDelete}
          className="px-5 py-2 bg-red-700 text-white rounded-[8px] text-[12px] font-medium
   hover:shadow-md hover:scale-[1.05]
 "
        >
          <span>Delete</span>
        </button>
      </div>
    </Modal>
  );
};

export default UserDelete;

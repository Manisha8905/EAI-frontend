"use client";

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faPenToSquare,
  faTrashCan,
} from "@fortawesome/free-regular-svg-icons";
import UserAdd from "./UserAdd";
import UserDelete from "./UserDelete";
import UserEdit from "./UserEdit";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../Redux/actions/authActions";
import Spinner from "../Spinner";


const Usertable = () => {
  const dispatch = useDispatch();

  const { admin, deleteSuccess, updateSuccess, createSuccess, loading } =
    useSelector((state) => state.admin);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch, deleteSuccess, updateSuccess, createSuccess]);

  const handleEditClick = (user) => {
    console.log("first", user);
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };
  const toCapitalize = (text) => {
  if (!text) return "";
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
};

  return (
    <div className="p-12 bg-gray-100  ">
      <div className="bg-white  rounded-2xl p-6 border border-gray-200">
        {/* Header */}
        <div className="flex justify-between">
          <div>
            <h2 className="font-poppins text-[15px] font-[600] text-[#0a0a0a]">
              User Management
            </h2>
<p className="font-inter text-[13px] text-gray-600">
              Manage user accounts and role assignments
            </p>
          </div>
          <div className="">
            <button
              className="flex items-center text-[13px] gap-1 bg-black text-white font-[500] px-2 py-2 rounded-[8px]  transition"
              onClick={() => setIsAddModalOpen(true)}
            >
              <FontAwesomeIcon
                icon={faUser}
                className="text-xs text-black border border-black py-1  text-white transition"
              />{" "}
              Add User
            </button>
          </div>
        </div>

        {/* Spinner OR Table */}
        {loading ? (
          <Spinner loading={loading} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-gray-200 hover:bg-gray-50 transition border-b border-gray-200">
                <tr>
                  <th
                    className="px-3 py-4 text-left text-sm font-semibold text-[#0a0a0a]
"
                  >
                    Name
                  </th>
                  <th
                    className="px-3 py-4 text-left text-sm font-semibold text-[#0a0a0a]
"
                  >
                    Email
                  </th>
                  <th
                    className="px-3 py-4 text-left text-sm font-semibold text-[#0a0a0a]
"
                  >
                    Role

                  </th>
                  <th
                    className="px-3 py-4 text-left text-sm font-semibold text-[#0a0a0a]
"
                  >
                    Created
                  </th>
                  <th
                    className="px-3 py-4 text-center text-sm font-semibold text-[#0a0a0a]
"
                  >
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {admin?.users?.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition border-b border-gray-200"
                  >
                    <td
                      className="px-3 py-1 text-[#0a0a0a] text-[12px]"
                    >
                       {toCapitalize(user.username)}

                    </td>
                    <td
                      className="px-3 py-1 text-[#0a0a0a] text-[12px]"
                    >
                      {toCapitalize(user.email)}
                    </td>
                    <td className="px-3 py-1 font-inter">
                      <span className="px-3 py-1 text-[12px] font-[400] rounded-[9px] bg-[#a1a1a129] text-[#0a0a0a]">
                        {toCapitalize(user.role)}
                      </span>
                    </td>
                    <td className="px-3 py-1 text-[12px] text-[#0a0a0a] font-inter">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-3 py-1 text-center space-x-2">
                      <button onClick={() => handleEditClick(user)}>
                        <FontAwesomeIcon
                          icon={faPenToSquare}
                          className="text-medium text-black border-b border-gray-300 border-1 px-2 py-2 rounded-[8px] hover:bg-[#e9ebef]  transition"
                        />
                      </button>

                      <button onClick={() => handleDeleteClick(user)}>
                        <FontAwesomeIcon
                          icon={faTrashCan}
                          className="text-medium text-black border-b border-gray-300 border-1 p-2 rounded-[8px] hover:bg-[#e9ebef]  transition"
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <UserAdd
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <UserEdit
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
      />

      <UserDelete
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        user={selectedUser}
      />
    </div>
  );
};

export default Usertable;

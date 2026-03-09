// "use client";

// import React from "react";
// import Modal from "react-modal";
// import { useFormik } from "formik";
// import * as Yup from "yup";

// Modal.setAppElement("body");

// const customStyles = {
//   content: {
//     top: "50%",
//     left: "50%",
//     transform: "translate(-50%, -50%)",
//     borderRadius: "12px",
//         borderstyle: "solid",

//     padding: "20px",
//     width: "500px",
//     maxHeight: "80vh",
//     overflowY: "auto",
//   },
// };

// // 🔥 Department Permission Structure
// // const departmentPermissions = {
// //   Sales: ["AI SDR", "CRM Integration", "Excel Integration"],
// //   Finance: ["Invoice Processing", "OCR Engine", "Payment Validation"],
// //   "Customer Support": ["AI Chatbot", "RAG System", "Ticket Management"],
// // };

// const roleOptions = [
//   "Super Admin",
//   "Admin",
//   "Sales",
//   "Finance",
//   "Customer Support",
// ];

// // ✅ Validation Schema
// const validationSchema = Yup.object({
//   name: Yup.string().required("Name is required"),
//   email: Yup.string()
//     .email("Invalid email format")
//     .required("Email is required"),
//   roles: Yup.array().min(1, "Select at least one role"),
//   permissions: Yup.array(),
// });

// const UserAdd = ({ isOpen, onClose }) => {
//   const formik = useFormik({
//     initialValues: {
//       name: "",
//       email: "",
//       roles: [],
//       permissions: [],
//     },
//     validationSchema,
//     onSubmit: (values, { resetForm }) => {
//       console.log(values);
//       resetForm();
//       onClose();
//     },
//   });

//   // 🎯 Visible Departments Based On Role
// //   const getVisibleDepartments = () => {
// //     if (formik.values.roles.includes("Super Admin")) {
// //       return Object.keys(departmentPermissions);
// //     }
// //     if (formik.values.roles.includes("Sales")) return ["Sales"];
// //     if (formik.values.roles.includes("Finance")) return ["Finance"];
// //     if (formik.values.roles.includes("Customer Support"))
// //       return ["Customer Support"];
// //     return [];
// //   };

//   return (
//     <Modal isOpen={isOpen} onRequestClose={onClose} style={customStyles}>
//       <h2 className="text-xl font-bold mb-3">Create New User</h2>

//       <form onSubmit={formik.handleSubmit}>
        
//         {/* Name */}
//         <label className="block font-medium">Name</label>
//         <input
//           type="text"
//           name="name"
//           className="w-full border p-2 rounded"
//           onChange={formik.handleChange}
//           onBlur={formik.handleBlur}
//           value={formik.values.name}
//         />
//         {formik.touched.name && formik.errors.name && (
//           <p className="text-red-500 text-sm mb-2">
//             {formik.errors.name}
//           </p>
//         )}

//         {/* Email */}
//         <label className="block font-medium mt-3">Email</label>
//         <input
//           type="email"
//           name="email"
//           className="w-full border p-2 rounded"
//           onChange={formik.handleChange}
//           onBlur={formik.handleBlur}
//           value={formik.values.email}
//         />
//         {formik.touched.email && formik.errors.email && (
//           <p className="text-red-500 text-sm mb-2">
//             {formik.errors.email}
//           </p>
//         )}

//         {/* Roles Checkbox */}
//         <label className="block font-medium mt-3 mb-2">Roles</label>

//         {roleOptions.map((role) => (
//           <label key={role} className="flex items-center gap-2">
//             <input
//               type="checkbox"
//               value={role}
//               checked={formik.values.roles.includes(role)}
//               onChange={(e) => {
//                 if (e.target.checked) {
//                   formik.setFieldValue("roles", [
//                     ...formik.values.roles,
//                     role,
//                   ]);
//                 } else {
//                   formik.setFieldValue(
//                     "roles",
//                     formik.values.roles.filter((r) => r !== role)
//                   );
//                 }
//                 formik.setFieldValue("permissions", []); // reset permissions
//               }}
//             />
//             {role}
//           </label>
//         ))}

//         {formik.touched.roles && formik.errors.roles && (
//           <p className="text-red-500 text-sm mb-2">
//             {formik.errors.roles}
//           </p>
//         )}

//         {/* Permissions Section */}
//         {/* {getVisibleDepartments().map((dept) => (
//           <div key={dept} className="mt-4">
//             <h3 className="font-semibold mb-2">
//               {dept} Department - App Permissions
//             </h3>

//             {departmentPermissions[dept].map((perm) => (
//               <label key={perm} className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   checked={formik.values.permissions.includes(perm)}
//                   onChange={(e) => {
//                     if (e.target.checked) {
//                       formik.setFieldValue("permissions", [
//                         ...formik.values.permissions,
//                         perm,
//                       ]);
//                     } else {
//                       formik.setFieldValue(
//                         "permissions",
//                         formik.values.permissions.filter(
//                           (p) => p !== perm
//                         )
//                       );
//                     }
//                   }}
//                 />
//                 {perm}
//               </label>
//             ))}
//           </div>
//         ))} */}

//         {/* Buttons */}
//         <div className="flex justify-end gap-2 mt-5">
//           <button
//             type="button"
//             onClick={onClose}
//             className="px-4 py-2 border rounded"
//           >
//             Cancel
//           </button>

//           <button
//             type="submit"
//             className="px-4 py-2 bg-[#000] text-white rounded"
//           >
//             Save
//           </button>
//         </div>

//       </form>
//     </Modal>
//   );
// };

// export default UserAdd;
"use client";
// import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const modules = [
  { name: "Sales", path: "/sales" },
  { name: "Customer Support", path: "/support" },
  { name: "General", path: "/general" },
  { name: "Finance", path: "/finance" },
  { name: "HR", path: "/hr" },
  { name: "Marketing", path: "/marketing" },
  { name: "Legal", path: "/legal" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="w-full bg-white border-b  bosierder-b  border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section - Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg font-bold">
            AI
          </div>
          <div>
            <h1 className="font-poppins text-[15px] font-[600] text-[#0a0a0a]">
              Enterprise AI Portal
            </h1>
            <p className="font-inter text-[13px] text-gray-600"> Admin User</p>
          </div>
        </div>

        {/* Center Section - Module Navigation */}
        <nav className="hidden md:flex gap-3">
          {modules.map((module) => {
            const isActive = pathname.startsWith(module.path);

            return (
              <Link
                key={module.name}
                href={module.path}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap
  text-sm font-[600] transition-colors
  ${
    isActive
      ? "bg-slate-100 text-blue-600"
      : "text-slate-600 hover:bg-slate-50"
  }`}
              >
              {/* <Link
                key={module.name}
                href={module.path}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap
  text-sm font-[600] transition-colors
  ${
    isActive
      ? "bg-slate-100 text-slate-900"
      : "text-slate-600 hover:bg-slate-50"
  }`}
              > */}
                <span>{module.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* <button className="text-gray-500 hover:text-gray-700">
            ?
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
            Share
          </button> */}
        </div>
      </div>
    </header>
  );
}
// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import React from "react";

// const Navbar = () => {
//   const modules = [
//     { name: "Sales", path: "/sales" },
//     { name: "Customer Support", path: "/support" },
//     { name: "General", path: "/general" },
//     { name: "Finance", path: "/finance" },
//     { name: "HR", path: "/hr" },
//     { name: "Marketing", path: "/marketing" },
//     { name: "Legal", path: "/legal" },
//   ];

//   const pathname = usePathname();

//   return (
//     <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b shadow-sm z-50 flex items-center">
//       {" "}
//       <div className="flex items-center justify-between px-6 py-4">
//         {/* Left Section - Logo & Title */}
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg font-bold">
//             AI
//           </div>
//           <div>
//             <h1 className="text-lg font-semibold text-gray-800">
//               Enterprise AI Portal
//             </h1>
//             <p className="text-sm text-gray-500">Super Admin</p>
//           </div>
//         </div>

//         {/* Center Section - Module Navigation */}
//         <nav className="hidden md:flex gap-6">
//           {modules.map((module) => {
//             const isActive = pathname.startsWith(module.path);

//             return (
//               <Link
//                 key={module.name}
//                 href={module.path}
//                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
//                   ${
//                     isActive
//                       ? "bg-blue-100 text-blue-600"
//                       : "text-gray-600 hover:bg-gray-100"
//                   }`}
//               >
//                 {module.name}
//               </Link>
//             );
//           })}
//         </nav>

//         {/* Right Section */}
//         <div className="flex items-center gap-4">
//           <button className="text-gray-500 hover:text-gray-700">?</button>
//           <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
//             Share
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Navbar;

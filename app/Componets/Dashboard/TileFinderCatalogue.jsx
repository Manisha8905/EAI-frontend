// "use client";

// import { useState } from "react";
// import { Search, Image as ImageIcon, Link2, Star, Layers } from "lucide-react";

// /* ── Mock catalogue data ───────────────────────────────────────── */
// const CATALOGUE_ITEMS = [
//   {
//     id: 1,
//     name: "Marble Arabescato 60x60",
//     sku: "TF-001",
//     category: "Natural Stone",
//     similarity: 0.94,
//     imageSearches: 312,
//     urlSearches: 88,
//     status: "active",
//     thumbnail: null,
//   },
//   {
//     id: 2,
//     name: "Porcelain Wood Plank 20x120",
//     sku: "TF-002",
//     category: "Porcelain",
//     similarity: 0.89,
//     imageSearches: 245,
//     urlSearches: 54,
//     status: "active",
//     thumbnail: null,
//   },
//   {
//     id: 3,
//     name: "Terracotta Hex 15x17",
//     sku: "TF-003",
//     category: "Terracotta",
//     similarity: 0.76,
//     imageSearches: 198,
//     urlSearches: 67,
//     status: "active",
//     thumbnail: null,
//   },
//   {
//     id: 4,
//     name: "Slate Graphite 45x90",
//     sku: "TF-004",
//     category: "Natural Stone",
//     similarity: 0.82,
//     imageSearches: 176,
//     urlSearches: 41,
//     status: "active",
//     thumbnail: null,
//   },
//   {
//     id: 5,
//     name: "Zellige Moroccan White 10x10",
//     sku: "TF-005",
//     category: "Handmade",
//     similarity: 0.91,
//     imageSearches: 143,
//     urlSearches: 29,
//     status: "active",
//     thumbnail: null,
//   },
//   {
//     id: 6,
//     name: "Cement Encaustic 20x20",
//     sku: "TF-006",
//     category: "Cement",
//     similarity: 0.71,
//     imageSearches: 120,
//     urlSearches: 38,
//     status: "inactive",
//     thumbnail: null,
//   },
//   {
//     id: 7,
//     name: "Travertine Noce 60x120",
//     sku: "TF-007",
//     category: "Natural Stone",
//     similarity: 0.87,
//     imageSearches: 109,
//     urlSearches: 22,
//     status: "active",
//     thumbnail: null,
//   },
//   {
//     id: 8,
//     name: "Glass Mosaic Aqua 30x30",
//     sku: "TF-008",
//     category: "Glass",
//     similarity: 0.65,
//     imageSearches: 88,
//     urlSearches: 19,
//     status: "inactive",
//     thumbnail: null,
//   },
// ];

// const CATEGORIES = ["All", "Natural Stone", "Porcelain", "Terracotta", "Handmade", "Cement", "Glass"];

// function SimilarityBadge({ value }) {
//   const pct = Math.round(value * 100);
//   const color =
//     pct >= 90 ? "bg-emerald-100 text-emerald-700" :
//     pct >= 75 ? "bg-blue-100 text-blue-700" :
//     "bg-amber-100 text-amber-700";
//   return (
//     <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-[700] ${color}`}>
//       <Star className="h-3 w-3" />
//       {pct}%
//     </span>
//   );
// }

// export default function TileFinderCatalogue() {
//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("All");

//   const filtered = CATALOGUE_ITEMS.filter((item) => {
//     const q = search.toLowerCase();
//     const matchesSearch =
//       !q ||
//       item.name.toLowerCase().includes(q) ||
//       item.sku.toLowerCase().includes(q) ||
//       item.category.toLowerCase().includes(q);
//     const matchesCat = category === "All" || item.category === category;
//     return matchesSearch && matchesCat;
//   });

//   return (
//     <div className="min-h-[calc(100vh-60px)] bg-[#f4f5f7] p-6">
//       {/* Header */}
//       <div className="mb-6">
//         <h1 className="text-[22px] font-[800] text-[#061a43]">Analytics - Catalogue</h1>
//         <p className="mt-1 text-[14px] text-gray-500">
//           Browse and analyze tile catalogue search performance
//         </p>
//       </div>

//       {/* Stats bar */}
//       <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
//         {[
//           { label: "Total Tiles", value: CATALOGUE_ITEMS.length, icon: Layers, color: "text-violet-600 bg-violet-50" },
//           { label: "Active", value: CATALOGUE_ITEMS.filter(i => i.status === "active").length, icon: Star, color: "text-emerald-600 bg-emerald-50" },
//           { label: "Image Searches", value: CATALOGUE_ITEMS.reduce((a, i) => a + i.imageSearches, 0).toLocaleString(), icon: ImageIcon, color: "text-teal-600 bg-teal-50" },
//           { label: "URL Searches", value: CATALOGUE_ITEMS.reduce((a, i) => a + i.urlSearches, 0).toLocaleString(), icon: Link2, color: "text-blue-600 bg-blue-50" },
//         ].map(({ label, value, icon: Icon, color }) => (
//           <div key={label} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
//             <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color.split(" ")[1]}`}>
//               <Icon className={`h-4 w-4 ${color.split(" ")[0]}`} />
//             </div>
//             <div>
//               <p className="text-[18px] font-[800] text-[#061a43]">{value}</p>
//               <p className="text-[11px] text-gray-400">{label}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Toolbar */}
//       <div className="mb-4 flex flex-wrap items-center gap-3">
//         <div className="relative flex-1 min-w-[200px]">
//           <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
//           <input
//             type="text"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search tiles, SKU, category..."
//             className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-[13px] text-gray-700 outline-none focus:border-[#7c3aed]"
//           />
//         </div>
//         <select
//           value={category}
//           onChange={(e) => setCategory(e.target.value)}
//           className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-[13px] font-[600] text-[#253b69] outline-none focus:border-[#7c3aed]"
//         >
//           {CATEGORIES.map((c) => (
//             <option key={c} value={c}>{c}</option>
//           ))}
//         </select>
//       </div>

//       {/* Table */}
//       <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="border-b border-gray-100 bg-[#f8fafc]">
//                 <th className="px-5 py-3 text-left text-[11px] font-[700] uppercase tracking-wide text-gray-400">Tile</th>
//                 <th className="px-5 py-3 text-left text-[11px] font-[700] uppercase tracking-wide text-gray-400">SKU</th>
//                 <th className="px-5 py-3 text-left text-[11px] font-[700] uppercase tracking-wide text-gray-400">Category</th>
//                 <th className="px-5 py-3 text-left text-[11px] font-[700] uppercase tracking-wide text-gray-400">Similarity</th>
//                 <th className="px-5 py-3 text-left text-[11px] font-[700] uppercase tracking-wide text-gray-400 whitespace-nowrap">
//                   <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3" /> Image</span>
//                 </th>
//                 <th className="px-5 py-3 text-left text-[11px] font-[700] uppercase tracking-wide text-gray-400 whitespace-nowrap">
//                   <span className="flex items-center gap-1"><Link2 className="h-3 w-3" /> URL</span>
//                 </th>
//                 <th className="px-5 py-3 text-left text-[11px] font-[700] uppercase tracking-wide text-gray-400">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.length === 0 ? (
//                 <tr>
//                   <td colSpan={7} className="py-10 text-center text-[13px] text-gray-400">
//                     No tiles match your search.
//                   </td>
//                 </tr>
//               ) : (
//                 filtered.map((item, idx) => (
//                   <tr
//                     key={item.id}
//                     className={`border-b border-gray-50 transition-colors hover:bg-[#faf8ff] ${idx === filtered.length - 1 ? "border-b-0" : ""}`}
//                   >
//                     <td className="px-5 py-3.5">
//                       <div className="flex items-center gap-3">
//                         <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400 to-indigo-500 text-white">
//                           <Layers className="h-4 w-4" />
//                         </div>
//                         <p className="text-[13px] font-[600] text-[#061a43]">{item.name}</p>
//                       </div>
//                     </td>
//                     <td className="px-5 py-3.5 text-[12px] font-[600] text-gray-400">{item.sku}</td>
//                     <td className="px-5 py-3.5">
//                       <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-[600] text-gray-600">
//                         {item.category}
//                       </span>
//                     </td>
//                     <td className="px-5 py-3.5">
//                       <SimilarityBadge value={item.similarity} />
//                     </td>
//                     <td className="px-5 py-3.5 text-[13px] font-[600] text-gray-700">{item.imageSearches}</td>
//                     <td className="px-5 py-3.5 text-[13px] font-[600] text-gray-700">{item.urlSearches}</td>
//                     <td className="px-5 py-3.5">
//                       <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-[700] ${item.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
//                         {item.status === "active" ? "Active" : "Inactive"}
//                       </span>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

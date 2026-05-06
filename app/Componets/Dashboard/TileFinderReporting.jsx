// "use client";

// import { useState } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   Legend,
// } from "recharts";
// import { Download, FileText, TrendingUp, Search, CheckCircle, XCircle } from "lucide-react";

// /* ── Mock data ─────────────────────────────────────────────────── */
// const CATEGORY_PERFORMANCE = [
//   { category: "Natural Stone", searches: 597, successRate: 91 },
//   { category: "Porcelain",     searches: 299, successRate: 88 },
//   { category: "Terracotta",    searches: 265, successRate: 82 },
//   { category: "Handmade",      searches: 172, successRate: 94 },
//   { category: "Cement",        searches: 158, successRate: 76 },
//   { category: "Glass",         searches: 107, successRate: 69 },
// ];

// const INPUT_TYPE_PIE = [
//   { name: "Image Searches", value: 1240 },
//   { name: "URL Searches",   value: 380  },
// ];
// const PIE_COLORS = ["#7c3aed", "#0d9488"];

// const RECENT_EXPORTS = [
//   { id: 1, name: "Full Catalogue Report - May 2026",   date: "May 6, 2026",  size: "1.2 MB", type: "CSV" },
//   { id: 2, name: "Top Tiles by Similarity - Apr 2026", date: "Apr 30, 2026", size: "340 KB", type: "CSV" },
//   { id: 3, name: "Image Search Failures - Apr 2026",   date: "Apr 28, 2026", size: "88 KB",  type: "CSV" },
//   { id: 4, name: "Monthly Analytics Summary",          date: "Apr 1, 2026",  size: "210 KB", type: "PDF" },
// ];

// export default function TileFinderReporting() {
//   const [exporting, setExporting] = useState(false);

//   const handleExport = () => {
//     setExporting(true);
//     setTimeout(() => setExporting(false), 1500);
//   };

//   return (
//     <div className="min-h-[calc(100vh-60px)] bg-[#f4f5f7] p-6">
//       {/* Header */}
//       <div className="mb-6 flex items-start justify-between gap-4">
//         <div>
//           <h1 className="text-[22px] font-[800] text-[#061a43]">Reporting</h1>
//           <p className="mt-1 text-[14px] text-gray-500">
//             Export and analyze Tile Finder performance reports
//           </p>
//         </div>
//         <button
//           type="button"
//           onClick={handleExport}
//           disabled={exporting}
//           className="inline-flex items-center gap-2 rounded-xl bg-[#7c3aed] px-5 py-2.5 text-[13px] font-[700] text-white shadow-sm hover:bg-[#6d28d9] disabled:opacity-60 transition"
//         >
//           <Download className="h-4 w-4" />
//           {exporting ? "Exporting..." : "Export Report"}
//         </button>
//       </div>

//       {/* Summary Stats */}
//       <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
//         {[
//           { label: "Total Searches",  value: "1,620", icon: Search,       color: "from-violet-500 to-indigo-500" },
//           { label: "Success Rate",    value: "96.5%", icon: CheckCircle,   color: "from-emerald-500 to-teal-500" },
//           { label: "Failed Searches", value: "51",    icon: XCircle,       color: "from-red-400 to-rose-500"     },
//           { label: "Avg Similarity",  value: "0.79",  icon: TrendingUp,    color: "from-cyan-500 to-blue-500"    },
//         ].map(({ label, value, icon: Icon, color }) => (
//           <div
//             key={label}
//             className={`flex flex-col justify-between rounded-2xl bg-gradient-to-br ${color} p-5 text-white`}
//           >
//             <Icon className="h-5 w-5 text-white/80" />
//             <div className="mt-4">
//               <p className="text-[28px] font-[800] leading-none">{value}</p>
//               <p className="mt-1 text-[12px] text-white/80">{label}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Charts Row */}
//       <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
//         {/* Category Performance */}
//         <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
//           <h3 className="mb-1 text-[15px] font-[700] text-[#061a43]">Searches by Category</h3>
//           <p className="mb-4 text-[12px] text-gray-400">Total search volume per tile category</p>
//           <ResponsiveContainer width="100%" height={220}>
//             <BarChart data={CATEGORY_PERFORMANCE} layout="vertical" margin={{ top: 0, right: 16, left: 10, bottom: 0 }}>
//               <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
//               <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
//               <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: "#475569" }} width={90} tickLine={false} axisLine={false} />
//               <Tooltip
//                 contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
//                 labelStyle={{ fontWeight: 700 }}
//               />
//               <Bar dataKey="searches" name="Searches" fill="#7c3aed" radius={[0, 4, 4, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Input Type Distribution */}
//         <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
//           <h3 className="mb-1 text-[15px] font-[700] text-[#061a43]">Input Type Distribution</h3>
//           <p className="mb-4 text-[12px] text-gray-400">Image vs URL search breakdown</p>
//           <ResponsiveContainer width="100%" height={220}>
//             <PieChart>
//               <Pie
//                 data={INPUT_TYPE_PIE}
//                 cx="50%"
//                 cy="50%"
//                 innerRadius={60}
//                 outerRadius={90}
//                 paddingAngle={4}
//                 dataKey="value"
//               >
//                 {INPUT_TYPE_PIE.map((_, index) => (
//                   <Cell key={index} fill={PIE_COLORS[index]} />
//                 ))}
//               </Pie>
//               <Tooltip
//                 contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
//                 formatter={(value) => [value.toLocaleString(), ""]}
//               />
//               <Legend
//                 iconType="circle"
//                 iconSize={8}
//                 wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
//               />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Recent Exports */}
//       <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
//         <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
//           <div className="flex items-center gap-2">
//             <FileText className="h-4 w-4 text-[#7c3aed]" />
//             <h3 className="text-[15px] font-[700] text-[#061a43]">Recent Exports</h3>
//           </div>
//         </div>
//         <div className="divide-y divide-gray-50">
//           {RECENT_EXPORTS.map((exp) => (
//             <div key={exp.id} className="flex items-center justify-between px-6 py-4 hover:bg-[#faf8ff] transition-colors">
//               <div className="flex items-center gap-3">
//                 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50">
//                   <FileText className="h-4 w-4 text-violet-600" />
//                 </div>
//                 <div>
//                   <p className="text-[13px] font-[600] text-[#061a43]">{exp.name}</p>
//                   <p className="text-[11px] text-gray-400">{exp.date} · {exp.size}</p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-3">
//                 <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-[700] text-gray-500">
//                   {exp.type}
//                 </span>
//                 <button
//                   type="button"
//                   className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-[12px] font-[600] text-[#253b69] hover:bg-gray-50 transition"
//                 >
//                   <Download className="h-3.5 w-3.5" /> Download
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

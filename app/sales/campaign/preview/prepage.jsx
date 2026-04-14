//    {activePreviewLead ? (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
//           onClick={closePreviewModal}
//           role="dialog"
//           aria-label="Email preview modal"
//         >
//           <div
//             className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col h-[90vh]"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* ── Modal Header ── */}
//             <div className="bg-white border-b border-gray-100 px-6 pt-5 pb-0">
//               <div className="flex items-center justify-between gap-4">
//                 <h2 className="text-[16px] font-[700] text-gray-900 tracking-tight">Preview</h2>
//                 <button
//                   type="button"
//                   onClick={closePreviewModal}
//                   className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition duration-200"
//                   title="Close (ESC)"
//                 >
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>

//               {/* ── Main Tab Switcher ── */}
//               <LayoutGroup id="modal-tabs">
//                 <div className="relative flex items-end" style={{ minHeight: 48 }}>
//                   {(() => {
//                     const isEnrichmentActive = modalTab === "enrichment";
//                     const tabs = [
//                       { key: "preview", label: "Preview Email" },
//                       { key: "enrichment", label: "Enriched Data" },
//                       { key: "reprocess", label: "Reprocess" },
//                     ];
//                     return tabs.map((tab) => {
//                       const active = modalTab === tab.key;
//                       const isLeft = tab.key === "preview";
//                       const isRight = tab.key === "reprocess";
//                       const isCenter = tab.key === "enrichment";

//                       // Compute x offset: side tabs spread out when enrichment is active
//                       let xOffset = 0;
//                       if (isEnrichmentActive && isLeft) xOffset = -18;
//                       if (isEnrichmentActive && isRight) xOffset = 18;

//                       // Compute scale & y for enrichment tab
//                       let yOffset = active ? -2 : 0;
//                       let scale = 1;
//                       if (isCenter && isEnrichmentActive) {
//                         yOffset = -12;
//                         scale = 0.92;
//                       }

//                       // Opacity: fade side tabs when enrichment is active
//                       let opacity = 1;
//                       if (isEnrichmentActive && !isCenter) opacity = 0.45;
//                       if (!isEnrichmentActive && !active) opacity = 0.55;

//                       return (
//                         <motion.button
//                           key={tab.key}
//                           type="button"
//                           onClick={() => setModalTab(tab.key)}
//                           animate={{
//                             x: xOffset,
//                             y: yOffset,
//                             scale,
//                             opacity,
//                             color: active ? "#111827" : "#9ca3af",
//                           }}
//                           whileHover={{ color: active ? "#111827" : "#374151", opacity: Math.max(opacity, 0.75) }}
//                           transition={{ type: "spring", stiffness: 400, damping: 32 }}
//                           className="relative px-5 py-2.5 select-none focus:outline-none origin-bottom"
//                           style={{ fontSize: active ? "13px" : "12.5px", fontWeight: active ? 700 : 500 }}
//                         >
//                           {tab.label}
//                           {active && (
//                             <motion.span
//                               layoutId="tab-underline"
//                               className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-sm"
//                               style={{ background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)" }}
//                               transition={{ type: "spring", stiffness: 500, damping: 40 }}
//                             />
//                           )}
//                         </motion.button>
//                       );
//                     });
//                   })()}
//                 </div>
//               </LayoutGroup>

//               {/* ── Enrichment Sub-tabs (underline style) ── */}
//               <AnimatePresence>
//                 {modalTab === "enrichment" && (
//                   <motion.div
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: "auto" }}
//                     exit={{ opacity: 0, height: 0 }}
//                     transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
//                     className="overflow-hidden"
//                   >
//                     {/* <div className="border-t border-gray-200" /> */}
//                     <LayoutGroup id="enrichment-sub">
//                       <div className="flex items-center justify-start gap-0 ">
//                         {[
//                           { key: "system", label: "Prospect Information" },
//                           { key: "ai", label: "Fetched by AI" },
//                         ].map((st) => {
//                           const subActive = enrichmentSubTab === st.key;
//                           return (
//                             <motion.button
//                               key={st.key}
//                               type="button"
//                               onClick={() => setEnrichmentSubTab(st.key)}
//                               animate={{
//                                 color: subActive ? "#1d4ed8" : "#9ca3af",
//                               }}
//                               whileHover={{ color: subActive ? "#1d4ed8" : "#374151" }}
//                               transition={{ duration: 0.18 }}
//                               className="relative px-5 py-2 text-[8px] font-[600] select-none focus:outline-none whitespace-nowrap"
//                             >
//                               {st.label}
//                               {subActive && (
//                                 <motion.span
//                                   layoutId="sub-underline"
//                                   className="absolute bottom-0 left-2 right-2 h-[2px] rounded-t-sm bg-blue-600"
//                                   transition={{ type: "spring", stiffness: 500, damping: 38 }}
//                                 />
//                               )}
//                             </motion.button>
//                           );
//                         })}
//                       </div>
//                     </LayoutGroup>
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//             </div>

//             {/* ── Tab Panels ── */}
//             <div className="flex-1 overflow-y-auto bg-gray-50 relative">
//               <AnimatePresence mode="wait" initial={false}>

//               {/* Preview Email */}
//               {modalTab === "preview" && (
//                 <motion.div
//                   key="preview"
//                   initial={{ opacity: 0, x: -18 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: 18 }}
//                   transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
//                   className="p-6"
//                 >
//                   {/* Compact email metadata strip */}
//                   <div className="mb-3 bg-white border border-gray-200 rounded-xl px-4 py-2 flex flex-wrap items-center gap-x-5 gap-y-1">
//                     <span className="text-[12px] text-gray-500 whitespace-nowrap">
//                       <span className="font-[600] text-gray-700 mr-1">To:</span>{activePreviewLead.name}
//                     </span>
//                     <span className="hidden sm:block text-gray-200 select-none">|</span>
//                     <span className="text-[12px] text-gray-500 whitespace-nowrap">
//                       <span className="font-[600] text-gray-700 mr-1">To:</span>{activePreviewLead.toEmail}
//                     </span>
//                     {/* {activePreviewLead.company && activePreviewLead.company !== "—" && (
//                       <>
//                         <span className="hidden sm:block text-gray-200 select-none">|</span>
//                         <span className="text-[12px] text-gray-500 whitespace-nowrap">
//                           <span className="font-[600] text-gray-700 mr-1">Company:</span>{activePreviewLead.company}
//                         </span>
//                       </>
//                     )} */}
//                     <span className="hidden sm:block text-gray-200 select-none">|</span>
//                     <span className="text-[12px] text-gray-500 min-w-0 truncate">
//                       <span className="font-[600] text-gray-700 mr-1">Subject:</span>
//                       <span className="font-[600] text-gray-900">{activePreviewLead.previewSubject}</span>
//                     </span>
//                   </div>
//                   <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//                     {htmlPreview ? (
//                       <iframe
//                         srcDoc={htmlPreview}
//                         sandbox="allow-same-origin"
//                         title={`Email preview ${activePreviewLead.id}`}
//                         className="w-full h-[55vh] min-h-[400px] block"
//                       />
//                     ) : (
//                       <div className="p-6 text-[14px] leading-7 text-gray-800 whitespace-pre-wrap break-words">
//                         {plainContent || (
//                           <span className="text-gray-400 italic">No content available.</span>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 </motion.div>
//               )}

//               {/* Enrichment */}
//               {modalTab === "enrichment" && (
//                 <motion.div
//                   key="enrichment"
//                   initial={{ opacity: 0, x: 18 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -18 }}
//                   transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
//                   className="p-5"
//                 >

//                   {/* Sub-tab content rendered below — sub-tabs are now in the header */}

//                   {/* ── Sub-tab Content with Animation ── */}
//                   <AnimatePresence mode="wait" initial={false}>
//                     {/* Available on System */}
//                     {enrichmentSubTab === "system" && (
//                       <motion.div
//                         key="system"
//                         initial={{ opacity: 0, x: -12 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         exit={{ opacity: 0, x: 12 }}
//                         transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
//                         className="bg-white rounded-xl border border-gray-200 px-4 py-1"
//                       >
//                         {(() => {
//                           const sys = activePreviewLead?.availableOnSystem;
//                           if (!sys || typeof sys !== "object") {
//                             return (
//                               <div className="flex items-center justify-center py-8">
//                                 <p className="text-[13px] text-gray-400">No data available.</p>
//                               </div>
//                             );
//                           }

//                           // Define expected keys for Available on System
//                           const expectedKeys = ["name", "email", "phone", "company", "contact_number"];

//                           return expectedKeys.map((key) => {
//                             const val = sys[key];
//                             const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
//                             const renderValue = (v) => {
//                               if (v === null || v === undefined) return <span className="text-gray-400 italic text-[12px]">—</span>;
//                               if (Array.isArray(v)) {
//                                 if (v.length === 0) return <span className="text-gray-400 italic text-[12px]">—</span>;
//                                 if (typeof v[0] === "object" && v[0] !== null) {
//                                   return (
//                                     <div className="flex flex-col gap-1 mt-1">
//                                       {v.map((item, i) => (
//                                         <div key={i} className="bg-gray-50 rounded px-2 py-1 text-[11px] text-gray-600">
//                                           {Object.entries(item).map(([k, vv]) => (
//                                             <div key={k} className="flex gap-1 flex-wrap">
//                                               <span className="font-[600] text-gray-500 capitalize">{k.replace(/_/g, " ")}:</span>
//                                               {typeof vv === "string" && vv.startsWith("http") ? (
//                                                 <a href={vv} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate">{vv}</a>
//                                               ) : (
//                                                 <span className="text-gray-700">{String(vv ?? "—")}</span>
//                                               )}
//                                             </div>
//                                           ))}
//                                         </div>
//                                       ))}
//                                     </div>
//                                   );
//                                 }
//                                 return (
//                                   <div className="flex flex-wrap gap-1 mt-1">
//                                     {v.map((item, i) => (
//                                       <span key={i} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-[500]">{String(item)}</span>
//                                     ))}
//                                   </div>
//                                 );
//                               }
//                               if (typeof v === "string" && v.startsWith("http")) {
//                                 return <a href={v} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-[12px]">{v}</a>;
//                               }
//                               return <span className="text-gray-800 text-[12px]">{String(v || "—")}</span>;
//                             };
//                             return (
//                               <div key={key} className="flex gap-3 py-2">
//                                 <span className="text-[12px] font-[600] text-gray-500 w-32 flex-shrink-0 capitalize">{label}</span>
//                                 <div className="flex-1 min-w-0">{renderValue(val)}</div>
//                               </div>
//                             );
//                           });
//                         })()}
//                       </motion.div>
//                     )}

//                     {/* Fetched by AI */}
//                     {enrichmentSubTab === "ai" && (
//                       <motion.div
//                         key="ai"
//                         initial={{ opacity: 0, x: 12 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         exit={{ opacity: 0, x: -12 }}
//                         transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
//                         className="bg-white rounded-xl border border-gray-200 p-4 space-y-4"
//                       >
//                         {(() => {
//                           const ai = activePreviewLead?.fetchedByAi;
//                           if (!ai || typeof ai !== "object") {
//                             return (
//                               <div className="flex items-center justify-center py-8">
//                                 <p className="text-[13px] text-gray-400">No AI enrichment data available.</p>
//                               </div>
//                             );
//                           }

//                           const renderSection = (title, data) => {
//                             if (!data || typeof data !== "object") return null;
//                             const entries = Object.entries(data);
//                             if (entries.length === 0) return null;
//                             return (
//                               <div>
//                                 <h3 className="text-[14px] font-[700] text-gray-900 mb-2">{title}</h3>
//                                 <div className="border-b border-gray-100 mb-3" />
//                                 {entries.map(([key, val]) => {
//                                   const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
//                                   const renderValue = (v) => {
//                                     if (Array.isArray(v)) {
//                                       if (v.length === 0) return <span className="text-gray-400 italic text-[12px]">—</span>;
//                                       if (typeof v[0] === "object" && v[0] !== null) {
//                                         return (
//                                           <div className="flex flex-col gap-1 mt-1">
//                                             {v.map((item, i) => (
//                                               <div key={i} className="bg-gray-50 rounded px-2 py-1 text-[11px] text-gray-600">
//                                                 {Object.entries(item).map(([k, vv]) => (
//                                                   <div key={k} className="flex gap-1 flex-wrap">
//                                                     <span className="font-[600] text-gray-500 capitalize">{k.replace(/_/g, " ")}:</span>
//                                                     {typeof vv === "string" && vv.startsWith("http") ? (
//                                                       <a href={vv} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate">{vv}</a>
//                                                     ) : (
//                                                       <span className="text-gray-700">{String(vv ?? "—")}</span>
//                                                     )}
//                                                   </div>
//                                                 ))}
//                                               </div>
//                                             ))}
//                                           </div>
//                                         );
//                                       }
//                                       return (
//                                         <div className="flex flex-wrap gap-1 mt-1">
//                                           {v.map((item, i) => (
//                                             <span key={i} className="px-2 py-0.5 rounded bg-violet-50 text-violet-700 text-[11px] font-[500]">{String(item)}</span>
//                                           ))}
//                                         </div>
//                                       );
//                                     }
//                                     if (typeof val === "string" && val.startsWith("http")) {
//                                       return <a href={val} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-[12px]">{val}</a>;
//                                     }
//                                     return <span className="text-gray-800 text-[12px]">{String(val ?? "—")}</span>;
//                                   };
//                                   return (
//                                     <div key={key} className="flex gap-3 py-1.5">
//                                       <span className="text-[12px] font-[600] text-gray-500 w-32 flex-shrink-0 capitalize">{label}</span>
//                                       <div className="flex-1 min-w-0">{renderValue(val)}</div>
//                                     </div>
//                                   );
//                                 })}
//                               </div>
//                             );
//                           };

//                           return (
//                             <>
//                               {renderSection("Personal Details", ai.personalDetails)}
//                               {renderSection("Business Details", ai.businessDetails)}
//                             </>
//                           );
//                         })()}
//                       </motion.div>
//                     )}
//                   </AnimatePresence>

//                 </motion.div>
//               )}

//               {/* Reprocess */}
//               {modalTab === "reprocess" && (
//                 <motion.div
//                   key="reprocess"
//                   initial={{ opacity: 0, x: 18 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -18 }}
//                   transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
//                   className="p-6 flex flex-col gap-5"
//                 >

//                   {/* Header */}
//                   <div className="flex items-start gap-3">
//                     <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-sm">
//                       <RefreshCw className="h-4 w-4 text-white" />
//                     </div>
//                     <div>
//                       <p className="text-[14px] font-[700] text-gray-900 leading-tight">Reprocess Email Draft</p>
//                       <p className="text-[12px] text-gray-400 mt-0.5">Describe your changes and the AI will regenerate this draft.</p>
//                     </div>
//                   </div>

//                   {/* Regenerated result */}
//                   {reprocessResult && (
//                     <div className="animate-fadeIn flex flex-col gap-3">
//                       <div className="flex items-center justify-between">
//                         <p className="text-[12px] font-[700] text-emerald-600 flex items-center gap-1.5">
//                           <CheckCircle2 className="h-4 w-4" /> Draft regenerated
//                           {reprocessResult.newDraftId && (
//                             <span className="ml-1 text-[11px] text-gray-400 font-[400]">ID: {reprocessResult.newDraftId}</span>
//                           )}
//                         </p>
//                         <button
//                           type="button"
//                           onClick={() => setReprocessResult(null)}
//                           className="text-[11px] text-gray-400 hover:text-gray-600 transition"
//                         >
//                           Dismiss
//                         </button>
//                       </div>
//                       {reprocessResult.subject && (
//                         <div className="bg-white border border-emerald-100 rounded-xl px-4 py-2 text-[12px] text-gray-700">
//                           <span className="font-[600] text-gray-500 mr-1.5">Subject:</span>
//                           {reprocessResult.subject}
//                         </div>
//                       )}
//                       <div className="bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden">
//                         {reprocessResult.bodyHtml ? (
//                           <iframe
//                             srcDoc={reprocessResult.bodyHtml}
//                             sandbox="allow-same-origin"
//                             title="Regenerated email preview"
//                             className="w-full h-[35vh] min-h-[280px] block"
//                           />
//                         ) : (
//                           <div className="p-4 text-[13px] text-gray-400 italic">No preview available.</div>
//                         )}
//                       </div>
//                       <div className="border-t border-gray-100 pt-1" />
//                     </div>
//                   )}

//                   {/* Suggestion chips */}
//                   <div className="flex flex-wrap gap-2">
//                     {[
//                       "Make it more formal",
//                       "Shorten the message",
//                       "Focus on product benefits",
//                       "Add a sense of urgency",
//                       "More friendly tone",
//                     ].map((chip) => (
//                       <button
//                         key={chip}
//                         type="button"
//                         disabled={reprocessing}
//                         onClick={() => setReprocessPrompt((prev) => prev ? `${prev.trimEnd()}, ${chip.toLowerCase()}` : chip)}
//                         className="px-3 py-1 rounded-full border border-gray-200 bg-white text-[11px] font-[500] text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
//                       >
//                         {chip}
//                       </button>
//                     ))}
//                   </div>

//                   {/* Prompt box */}
//                   <div className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm overflow-hidden ${reprocessPrompt.trim() ? "border-blue-300 ring-1 ring-blue-100" : "border-gray-200"}`}>
//                     <textarea
//                       value={reprocessPrompt}
//                       onChange={(e) => setReprocessPrompt(e.target.value)}
//                       onKeyDown={(e) => {
//                         if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleReprocess();
//                       }}
//                       placeholder="e.g. Make the subject line more compelling, emphasize the ROI, and end with a clear call to action…"
//                       rows={5}
//                       className="w-full px-4 pt-4 pb-2 text-[13px] text-gray-800 placeholder-gray-300 resize-none focus:outline-none leading-6 bg-transparent"
//                       disabled={reprocessing}
//                     />
//                     {/* Toolbar row */}
//                     <div className="flex items-center justify-between px-4 pb-3 pt-1.5">
//                       <span className="text-[11px] text-gray-300 select-none">
//                         {reprocessPrompt.length > 0 ? `${reprocessPrompt.length} chars` : "⌘ Enter to submit"}
//                       </span>
//                       <button
//                         type="button"
//                         onClick={handleReprocess}
//                         disabled={!reprocessPrompt.trim() || reprocessing}
//                         className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[12px] font-[700] transition-all duration-200 shadow-sm disabled:cursor-not-allowed ${
//                           reprocessPrompt.trim() && !reprocessing
//                             ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white hover:from-blue-600 hover:to-violet-600 shadow-blue-100"
//                             : "bg-gray-100 text-gray-300"
//                         }`}
//                       >
//                         {reprocessing
//                           ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Processing…</>
//                           : <><Send className="h-3.5 w-3.5" /> Submit</>}
//                       </button>
//                     </div>
//                   </div>

//                 </motion.div>
//               )}

//               </AnimatePresence>
//             </div>
//           </div>
//         </div>
//       ) : null}
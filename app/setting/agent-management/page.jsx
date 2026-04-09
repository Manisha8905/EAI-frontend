"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Trash2, CheckCircle2, XCircle, Users } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../Redux/axiosInstance";

const fetchAgents = async () => {
  const res = await axiosInstance.get("/my-agents");
  const data = res?.data;
  const list = Array.isArray(data) ? data : (data?.agents ?? data?.data ?? data?.results ?? []);
  return list.map((a) => ({
    id: String(a.agent_id ?? a.id ?? a._id ?? ""),
    name: a.agent_name ?? a.name ?? "—",
    email: a.email ?? a.email_address ?? "—",
    is_active: a.is_active ?? false,
    is_current: a.is_current ?? false,
    created_at: a.created_at ?? "",
    created_at_display: a.created_at
      ? new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "—",
  }));
};

const bulkToggle = async (agentIds) => {
  await axiosInstance.post("/switch-agent", { agent_ids: agentIds });
};

const bulkDelete = async (agentIds) => {
  const res = await axiosInstance.post("/api/agents/bulk-delete", {
    agent_ids: agentIds,
  });
  return res?.data;
};

export default function AgentManagementPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [busyRow, setBusyRow] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchAgents()
      .then((rows) => setAgents(rows))
      .catch(() => toast.error("Failed to load agents."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const validAgents = useMemo(
    () => agents.filter((a) => !!a.id),
    [agents]
  );

  const allSelected =
    validAgents.length > 0 &&
    validAgents.every((a) => selectedIds.has(a.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(validAgents.map((a) => a.id)));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Single row action
  const handleRowToggle = async (agent) => {
    const newActive = !agent.is_active;
    setBusyRow(agent.id);
    try {
      await bulkToggle([agent.id], newActive);
      setAgents((prev) =>
        prev.map((a) =>
          a.id === agent.id ? { ...a, is_active: newActive } : a
        )
      );
      toast.success(
        `${agent.name} ${newActive ? "activated" : "deactivated"}.`
      );
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setBusyRow(null);
    }
  };

  // Bulk actions
  const handleBulkAction = async (action) => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    setBulkBusy(true);
    try {
      if (action === "delete") {
        await bulkDelete(ids);
        setAgents((prev) =>
          prev.filter((a) => !selectedIds.has(a.id))
        );
        toast.success(`${ids.length} agent(s) deleted.`);
      } else {
        const isActive = action === "activate";
        await bulkToggle(ids, isActive);
        setAgents((prev) =>
          prev.map((a) =>
            selectedIds.has(a.id) ? { ...a, is_active: isActive } : a
          )
        );
        toast.success(
          `${ids.length} agent(s) ${isActive ? "activated" : "deactivated"}.`
        );
      }
      setSelectedIds(new Set());
    } catch {
      toast.error("Bulk action failed. Please try again.");
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f5f7] p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-[18px] font-[700] text-gray-900">
              Agent Management
            </h1>
            <p className="text-[13px] text-gray-500 mt-1">
              Manage your agents — activate, deactivate, or remove them.
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -12, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto", marginBottom: 16 }}
            exit={{ opacity: 0, y: -12, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm px-5 py-3 flex items-center justify-between flex-wrap gap-3">
              <span className="flex items-center gap-2 text-[13px] font-[600] text-blue-700">
                <Users className="h-4 w-4" />
                {selectedIds.size} selected
              </span>
              {/* <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={bulkBusy}
                  onClick={() => handleBulkAction("activate")}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[12px] font-[600] text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkBusy ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  Activate
                </button>
                <button
                  type="button"
                  disabled={bulkBusy}
                  onClick={() => handleBulkAction("deactivate")}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[12px] font-[600] text-amber-700 hover:bg-amber-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkBusy ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  Deactivate
                </button>
                <button
                  type="button"
                  disabled={bulkBusy}
                  onClick={() => handleBulkAction("delete")}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-50 border border-red-200 text-[12px] font-[600] text-red-600 hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkBusy ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Delete
                </button>
              </div> */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Select All header */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <label className="inline-flex items-center gap-2 text-[13px] font-[600] text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded border-gray-300 accent-blue-600"
            />
            Select All
          </label>
          <span className="text-[12px] text-gray-400 font-[500]">
            {validAgents.length} agent{validAgents.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-gray-400 text-[13px]">
            <RefreshCw className="h-4 w-4 animate-spin" /> Loading agents...
          </div>
        ) : validAgents.length === 0 ? (
          <div className="py-16 flex items-center justify-center gap-2 text-gray-400 text-[13px]">
            No agents found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left" style={{ minWidth: 640 }}>
              <thead>
                <tr className="bg-[#1e293b]">
                  {["", "Agent Name", "Email", "Created", "Status", "Action"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-[11px] font-[600] uppercase tracking-wide text-white"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {validAgents.map((agent, idx) => {
                  const checked = selectedIds.has(agent.id);
                  const rowBusy = busyRow === agent.id;

                  return (
                    <tr
                      key={agent.id}
                      className={`border-b border-gray-50 transition-colors duration-150 ${
                        checked
                          ? "bg-blue-50/60"
                          : idx % 2 !== 0
                          ? "bg-gray-50/30"
                          : ""
                      } hover:bg-gray-50/70`}
                    >
                      <td className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSelect(agent.id)}
                          className="h-4 w-4 rounded border-gray-300 accent-blue-600"
                        />
                      </td>
                      <td className="px-4 py-3 text-[12px] font-[600] text-gray-800">
                        {agent.name}
                        {agent.is_current && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-[600] border border-blue-100">
                            Current
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">
                        {agent.email}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-500">
                        {agent.created_at_display}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-[600] ${
                            agent.is_active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-gray-100 text-gray-500 border border-gray-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              agent.is_active ? "bg-emerald-500" : "bg-gray-400"
                            }`}
                          />
                          {agent.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          disabled={rowBusy}
                          onClick={() => handleRowToggle(agent)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-[600] transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                            agent.is_active
                              ? "bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100"
                              : "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {rowBusy ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : agent.is_active ? (
                            <XCircle className="h-3 w-3" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3" />
                          )}
                          {agent.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

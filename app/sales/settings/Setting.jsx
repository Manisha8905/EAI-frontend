"use client";
import { useState, useRef, useEffect } from "react";
import axiosInstance from "../../Redux/axiosInstance";
import { toast } from "react-toastify";
import {
  Settings,
  ArrowLeft,
  Plus,
  X,
  Eye,
  Trash2,
  Database,
  Mail,
  Server,
  Users,
  FileText,
  Map,
  Key,
  Globe,
  AtSign,
  Shield,
  Search,
  Link2,
  Link2Off,
  ChevronDown,
  RefreshCw,
  Upload,
  CheckCircle2,
  Circle,
  Wrench,
  MoreVertical,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Zap,
} from "lucide-react";

/* ═══════════════════════ SHARED INPUT ═══════════════════════ */
function Field({
  label,
  required,
  type = "text",
  placeholder,
  value,
  onChange,
  hint,
  icon: Icon,
}) {
  const [showPass, setShowPass] = useState(false);
  return (
    <div>
      <label className="block text-[12px] font-[600] text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        )}
        <input
          type={type === "password" ? (showPass ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full rounded-xl border border-gray-200 bg-gray-50/60 py-2.5 text-[13px] text-gray-800 placeholder-gray-400
            outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-400/20
            ${Icon ? "pl-10 pr-3" : "px-3.5"}
            ${type === "password" ? "pr-10" : ""}`}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPass((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {hint && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

function SelectField({ label, required, value, onChange, options }) {
  return (
    <div>
      <label className="block text-[12px] font-[600] text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 pr-9 cursor-pointer"
        >
          {options.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>
              {o.label ?? o}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
      </div>
    </div>
  );
}

/* ═══════════════════════ MODAL SHELL ═══════════════════════ */
function Modal({ title, onClose, children, width = "max-w-lg" }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${width} bg-white rounded-2xl shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-[700] text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════ PAGE HEADER ═══════════════════════ */
function PageHeader({ title, subtitle, onBack, action }) {
  return (
    <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition shadow-sm shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}
        <div>
          <h1 className="font-poppins text-[18px] font-[700] text-[#0a0a0a]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[12px] text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   SUB-PAGES
════════════════════════════════════════════════════════════ */

/* ── Shared animation styles ── */
function AnimStyles() {
  return (
    <style>{`
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(18px); }
        to   { opacity: 1; transform: translateY(0);    }
      }
      @keyframes popIn {
        0%   { opacity: 0; transform: scale(0.94); }
        65%  { transform: scale(1.02); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes arrowPulse {
        0%, 100% { transform: translateX(0);  opacity: 1; }
        50%       { transform: translateX(5px); opacity: 0.7; }
      }
      @keyframes shimmer {
        0%   { background-position: -200% center; }
        100% { background-position:  200% center; }
      }
      .anim-fade  { animation: fadeSlideIn 0.42s cubic-bezier(0.22,1,0.36,1) both; }
      .anim-pop   { animation: popIn 0.32s cubic-bezier(0.22,1,0.36,1) both; }
      .map-row    { transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease; }
      .map-row:hover { transform: translateX(6px); box-shadow: 0 4px 18px rgba(0,0,0,0.07); background: #faf9ff; }
      .map-row:hover .arrow-anim { animation: arrowPulse 0.6s ease infinite; color: #7c3aed; }
      .crm-hover  { transition: border-color 0.25s, box-shadow 0.25s; }
      .crm-hover:hover { border-color: #a78bfa; box-shadow: 0 6px 24px rgba(124,58,237,0.09); }
      .action-btn { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
      .action-btn:not(:disabled):hover  { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.18); }
      .action-btn:not(:disabled):active { transform: scale(0.97); }
      .info-card  { transition: transform 0.2s ease, box-shadow 0.2s ease; }
      .info-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(0,0,0,0.08); }
      .svc-row    { transition: background 0.18s, border-color 0.18s; }
      .svc-row:hover { background: #eff6ff; border-color: #93c5fd; }
      .del-btn    { transition: opacity 0.15s, background 0.15s; }
    `}</style>
  );
}

/* ── CRM Integration ── */
function CRMPage({ onBack }) {
  const [form, setForm] = useState({
    clientId: "",
    clientSecret: "",
    authUrl: "",
    tokenUrl: "https://test.salesforce.com/services/oauth2/token",
  });
  const [saved, setSaved] = useState(false);
  const [connecting, setConn] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setConn(true);
    setTimeout(() => {
      setConn(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    }, 1600);
  };

  return (
    <div className="anim-fade">
      <AnimStyles />
      <PageHeader
        title="CRM Integration"
        subtitle="Connect your CRM via OAuth 2.0 for full pipeline synchronisation"
        onBack={onBack}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden crm-hover">
            <div className="relative bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 px-7 py-6 overflow-hidden">
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />
              <div className="absolute right-24 bottom-0 h-24 w-24 rounded-full bg-white/10 pointer-events-none" />
              <div className="relative flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-[16px] font-[700] text-white">
                    OAuth 2.0 Configuration
                  </h3>
                  <p className="text-[12px] text-indigo-200 mt-0.5">
                    Secure handshake — credentials are AES-256 encrypted at rest
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-7 space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field
                  label="Client ID"
                  required
                  placeholder="Enter your CRM client ID"
                  value={form.clientId}
                  onChange={set("clientId")}
                  icon={Key}
                />
                <Field
                  label="Client Secret"
                  required
                  type="password"
                  placeholder="••••••••••"
                  value={form.clientSecret}
                  onChange={set("clientSecret")}
                  icon={Shield}
                />
              </div>
              <Field
                label="Authorize URL"
                required
                placeholder="https://login.salesforce.com/services/oauth2/authorize"
                value={form.authUrl}
                onChange={set("authUrl")}
                icon={Globe}
              />
              <Field
                label="Token URL"
                required
                placeholder="https://test.salesforce.com/services/oauth2/token"
                value={form.tokenUrl}
                onChange={set("tokenUrl")}
                icon={Globe}
                hint="Sandbox URL pre-filled — use login.salesforce.com for production."
              />
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={connecting}
                  className={`action-btn w-full rounded-xl py-3.5 text-[14px] font-[600] text-white flex items-center justify-center gap-2 shadow-lg
                    ${
                      saved
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-200/70"
                        : connecting
                          ? "bg-gradient-to-r from-indigo-400 to-violet-400 shadow-indigo-200/60 cursor-wait"
                          : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-indigo-200/60"
                    }`}
                >
                  {connecting ? (
                    <><RefreshCw className="h-4 w-4 animate-spin" />Connecting…</>
                  ) : saved ? (
                    <><CheckCircle2 className="h-4 w-4" />Connected Successfully!</>
                  ) : (
                    <><Link2 className="h-4 w-4" />Connect to CRM</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className={`info-card rounded-2xl border p-5 ${saved ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50" : "border-gray-100 bg-white shadow-sm"}`}>
            <p className="text-[11px] font-[700] uppercase tracking-widest text-gray-400 mb-3">
              Connection Status
            </p>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${saved ? "bg-green-100" : "bg-amber-50"}`}>
                {saved ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <div>
                <span className={`block text-[14px] font-[700] ${saved ? "text-green-700" : "text-amber-700"}`}>
                  {saved ? "Connected" : "Not Connected"}
                </span>
                <span className="text-[11px] text-gray-400">
                  {saved ? "CRM sync active" : "Configure & connect"}
                </span>
              </div>
            </div>
            {saved && (
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-green-600">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Live data sync enabled
              </div>
            )}
          </div>

          <div className="info-card rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
            <p className="text-[12px] font-[700] text-gray-800 mb-3 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-100 text-[10px] font-[800] text-indigo-600">?</span>
              Where to find credentials
            </p>
            <ol className="space-y-2">
              {[
                "Open Salesforce Setup",
                "Navigate to App Manager",
                "Select your Connected App",
                "Copy Consumer Key → Client ID",
                "Reveal Consumer Secret → Client Secret",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[11px] text-gray-500">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-[700] text-indigo-600 mt-px">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="info-card rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[12px] font-[700] text-blue-800 mb-1">Security Notice</p>
                <p className="text-[11px] text-blue-600 leading-relaxed">
                  Credentials encrypted with AES-256. Never share your Client Secret. Tokens auto-refresh via OAuth 2.0 flow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Agents ── */
function AgentsPage({ onBack }) {
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [newName, setNewName] = useState("");
  const [parallelCalls, setPC] = useState(0);
  const [pcLoading, setPcLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pcSaved, setPcSaved] = useState(false);
  const [pcSaving, setPcSaving] = useState(false);
  const [pcError, setPcError] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [switchingId, setSwitchingId] = useState(null);

  const fetchAgents = async () => {
    setLoadingAgents(true);
    setFetchError("");
    try {
      const res = await axiosInstance.get("/my-agents");
      const list = Array.isArray(res.data) ? res.data : (res.data.agents ?? []);
      setAgents(
        list.map((a) => ({
          id: a.agent_id ?? a.id ?? a._id ?? Math.random(),
          name: a.agent_name ?? a.name ?? "—",
          created_at: a.created_at ?? "—",
          created_at_display: a.created_at
            ? new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "—",
          is_active: a.is_active ?? false,
          is_current: a.is_current ?? false,
        }))
      );
    } catch (err) {
      setFetchError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to load agents."
      );
    } finally {
      setLoadingAgents(false);
    }
  };

  const fetchParallelCalls = async () => {
    setPcLoading(true);
    try {
      const res = await axiosInstance.get("/api/settings/global-parallel-calls");
      const val = res.data?.global_parallel_calls ?? res.data?.value ?? res.data?.parallel_calls ?? 0;
      setPC(Number(val));
    } catch {
      // silently ignore — keep default 0
    } finally {
      setPcLoading(false);
    }
  };

  useEffect(() => { fetchAgents(); fetchParallelCalls(); }, []);

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.created_at !== "—" && a.created_at.toLowerCase().includes(search.toLowerCase())),
  );

  const switchAgent = async (id) => {
    setSwitchingId(id);
    try {
      await axiosInstance.post("/switch-agent", { agent_id: id });
      toast.success("Agent switched successfully.");
      await fetchAgents();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to switch agent.");
    } finally {
      setSwitchingId(null);
    }
  };

  const createAgent = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError("");
    try {
      await axiosInstance.post("/create-agent", {
        agent_name: newName.trim(),
      });
      setNewName("");
      await fetchAgents();
    } catch (err) {
      setCreateError(
        err?.response?.data?.message ||
        "Failed to create agent. Please try again."
      );
    } finally {
      setCreating(false);
    }
  };

  const del = (id) => setAgents((p) => p.filter((a) => a.id !== id));

  const savePC = async () => {
    setPcSaving(true);
    setPcError("");
    setPcSaved(false);
    try {
      await axiosInstance.put("/api/settings/global-parallel-calls", {
        global_parallel_calls: parallelCalls,
      });
      setPcSaved(true);
      setTimeout(() => setPcSaved(false), 2500);
    } catch (err) {
      setPcError(
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to save. Please try again."
      );
    } finally {
      setPcSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Agents"
        subtitle="Manage AI SDR agents and parallel call settings"
        onBack={onBack}
      />

      {/* Create agent bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <p className="text-[12px] font-[600] text-gray-500 uppercase tracking-wider mb-3">
          New Agent
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-[11px] font-[600] text-gray-600 mb-1">
              Agent Name <span className="text-red-500">*</span>
            </label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter agent name"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
            />
          </div>
      
          <button
            onClick={createAgent}
            disabled={creating}
            className="rounded-xl bg-[#0a0a0a] px-5 py-2.5 text-[13px] font-[600] text-white hover:bg-gray-800 transition shadow-sm flex items-center gap-1.5 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            {creating ? "Creating…" : "Create"}
          </button>
        </div>
        {createError && (
          <p className="mt-2 text-[12px] text-red-500 font-[500]">{createError}</p>
        )}
      </div>

      {/* Agents table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <span className="text-[13px] font-[600] text-gray-900">Agent List</span>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agents…"
              className="pl-7 pr-7 py-1.5 text-[12px] border border-gray-200 rounded-lg
                           bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30
                           focus:border-blue-400 focus:bg-white transition w-[190px]
                           placeholder:text-gray-400"
            />
          </div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Agent Name", "Date", "Status", "Action"].map((h) => (
                <th key={h} className="px-5 py-3 text-[11px] font-[600] uppercase tracking-wide text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loadingAgents ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-[13px] text-gray-400">
                  Loading agents…
                </td>
              </tr>
            ) : fetchError ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-[13px] text-red-500">
                  {fetchError}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-[13px] text-gray-400">
                  No agents found
                </td>
              </tr>
            ) : (
              filtered.map((a, i) => (
                <tr
                  key={a.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/60 transition ${i % 2 !== 0 ? "bg-gray-50/30" : ""}`}
                >
                  <td className="px-5 py-3.5 text-[13px] font-[500] text-gray-900">{a.name}</td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-500">{a.created_at_display}</td>
                  <td className="px-5 py-3.5">
                    {(() => {
                      const isCurrent = a.is_active && a.is_current;
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-[600] border ${
                          isCurrent
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-green-50 text-green-700 border-green-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? "bg-green-500" : "bg-green-500"}`} />
                          {isCurrent ? "Active" : "Active"}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {a.is_current ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-green-50 border border-green-200 text-[11px] font-[600] text-green-700">
                          Current
                        </span>
                      ) : (
                        <button
                          onClick={() => switchAgent(a.id)}
                          disabled={switchingId === a.id}
                          className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[12px] font-[600] text-indigo-700 hover:bg-indigo-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {switchingId === a.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : null}
                          {switchingId === a.id ? "Switching…" : (a.is_active ? "Switch" : "Activate")}
                        </button>
                      )}
                      <button onClick={() => del(a.id)} className="rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5 text-[12px] text-red-600 hover:bg-red-100 transition">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-gray-100 text-[12px] text-gray-400">
          {agents.length} agents total
        </div>
      </div>

      {/* Global Parallel Calls */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 max-w-md">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
            <Zap className="h-4 w-4 text-violet-600" />
          </div>
          <div>
            <p className="text-[13px] font-[600] text-gray-900">Global Parallel Calls</p>
            <p className="text-[11px] text-gray-400">Max simultaneous calls across all agents</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="0"
            max="100"
            value={parallelCalls}
            onChange={(e) => setPC(Number(e.target.value))}
            disabled={pcLoading}
            className="w-24 rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[14px] font-[600] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 text-center disabled:opacity-50"
          />
          <button
            onClick={savePC}
            disabled={pcSaving || pcLoading}
            className="rounded-xl bg-[#0a0a0a] px-5 py-2.5 text-[13px] font-[600] text-white hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {pcSaving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
            {pcLoading ? "Loading…" : pcSaving ? "Saving…" : pcSaved ? "✓ Saved!" : "Submit"}
          </button>
        </div>
        {pcError && (
          <p className="mt-2 text-[12px] text-red-500 font-[500]">{pcError}</p>
        )}
      </div>
    </div>
  );
}

/* ── Email Templates ── */
const INIT_TEMPLATES = [
  {
    id: 1,
    name: "Enterprise Intro",
    subject: "Grow Your Revenue by 30% with AI SDR",
    preview: "Hi {{first_name}}, I wanted to reach out...",
  },
  {
    id: 2,
    name: "Follow-up Sequence",
    subject: "Quick follow-up — {{company}}",
    preview: "Just wanted to circle back on my last message...",
  },
  {
    id: 3,
    name: "Demo Invite",
    subject: "Can we show you something impressive?",
    preview: "We'd love to give you a personalized demo...",
  },
];

function EmailTemplatesPage({ onBack }) {
  const [templates, setTemplates] = useState(INIT_TEMPLATES);
  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({ name: "", subject: "", body: "" });
  const [fileName, setFileName] = useState("No file selected");
  const fileRef = useRef(null);

  const create = () => {
    if (!form.name || !form.subject) return;
    setTemplates((p) => [
      ...p,
      {
        id: Date.now(),
        name: form.name,
        subject: form.subject,
        preview: form.body || "(no body)",
      },
    ]);
    setForm({ name: "", subject: "", body: "" });
    setFileName("No file selected");
    setShowModal(false);
  };

  return (
    <div>
      <PageHeader
        title="Email Templates"
        subtitle="Manage reusable email templates for your campaigns"
        onBack={onBack}
        action={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#0a0a0a] px-4 py-2.5 text-[13px] font-[600] text-white hover:bg-gray-800 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Create New
          </button>
        }
      />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Name", "Subject", "Preview", "View", "Delete"].map((h, i) => (
                <th key={i} className="px-5 py-3 text-[11px] font-[600] uppercase tracking-wide text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {templates.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-[13px] text-gray-400">
                  No templates yet
                </td>
              </tr>
            ) : (
              templates.map((t, i) => (
                <tr
                  key={t.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/60 transition ${i % 2 !== 0 ? "bg-gray-50/30" : ""}`}
                >
                  <td className="px-5 py-3.5 text-[13px] font-[600] text-gray-900">{t.name}</td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-600">{t.subject}</td>
                  <td className="px-5 py-3.5 text-[12px] text-gray-400 max-w-[220px] truncate">{t.preview}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setPreview(t)}
                      className="flex items-center gap-1 text-[12px] font-[500] text-indigo-600 hover:text-indigo-800 transition"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setTemplates((p) => p.filter((x) => x.id !== t.id))}
                      className="text-red-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-gray-100 text-[12px] text-gray-400">
          {templates.length} templates
        </div>
      </div>

      {showModal && (
        <Modal title="Create Template" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <Field
              label="Name"
              required
              placeholder="e.g. Enterprise Intro"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <Field
              label="Subject"
              required
              placeholder="Email subject line…"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            />
            <div>
              <label className="block text-[12px] font-[600] text-gray-700 mb-1.5">
                Body / File <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Write your email body, or upload an HTML file below…"
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 resize-none mb-2"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[12px] font-[500] text-gray-600 hover:bg-gray-50 transition"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Browse
                </button>
                <span className="text-[12px] text-gray-400">{fileName}</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".html,.htm,.txt"
                  className="hidden"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "No file selected")}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-[500] text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={create}
                className="px-5 py-2 rounded-xl bg-[#0a0a0a] text-[13px] font-[600] text-white hover:bg-gray-800 transition"
              >
                Submit
              </button>
            </div>
          </div>
        </Modal>
      )}

      {preview && (
        <Modal title={preview.name} onClose={() => setPreview(null)} width="max-w-xl">
          <p className="text-[12px] font-[600] text-gray-500 uppercase tracking-wide mb-1">Subject</p>
          <p className="text-[14px] font-[500] text-gray-800 mb-4">{preview.subject}</p>
          <p className="text-[12px] font-[600] text-gray-500 uppercase tracking-wide mb-1">Body</p>
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-[13px] text-gray-700 whitespace-pre-line">
            {preview.preview}
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Graph Configuration ── */
function GraphConfigPage({ onBack }) {
  const [form, setForm] = useState({
    clientId: "",
    clientSecret: "",
    tenantId: "",
    targetEmail: "",
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    }, 1400);
  };

  const services = [
    { icon: Mail, label: "Mail Sync", desc: "Read & send emails via Graph", color: "bg-sky-50", iconColor: "text-sky-600" },
    { icon: Globe, label: "Calendar", desc: "Calendar event read/write", color: "bg-violet-50", iconColor: "text-violet-600" },
    { icon: Users, label: "Contacts", desc: "Sync Azure contact directory", color: "bg-teal-50", iconColor: "text-teal-600" },
  ];

  return (
    <div className="anim-fade">
      <AnimStyles />
      <PageHeader
        title="Graph Configuration"
        subtitle="Microsoft Graph API credentials for calendar & email sync"
        onBack={onBack}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden crm-hover">
            <div className="relative bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 px-7 py-6 overflow-hidden">
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />
              <div className="absolute right-24 bottom-0 h-24 w-24 rounded-full bg-white/10 pointer-events-none" />
              <div className="relative flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-[16px] font-[700] text-white">Microsoft Azure AD App</h3>
                  <p className="text-[12px] text-sky-200 mt-0.5">Azure Active Directory app credentials for Graph API access</p>
                </div>
              </div>
            </div>

            <form onSubmit={submit} className="p-7 space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Graph Client ID" required placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value={form.clientId} onChange={set("clientId")} icon={Key} />
                <Field label="Graph Client Secret" required type="password" placeholder="••••••••••••••••••" value={form.clientSecret} onChange={set("clientSecret")} icon={Shield} />
              </div>
              <Field label="Graph Tenant ID" required placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value={form.tenantId} onChange={set("tenantId")} icon={Globe} hint="Azure Portal → Azure Active Directory → Overview → Directory (tenant) ID" />
              <Field label="Graph Target Email" required type="email" placeholder="calendar-sync@yourcompany.com" value={form.targetEmail} onChange={set("targetEmail")} icon={AtSign} hint="Mailbox used for calendar and mail synchronisation." />

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className={`action-btn w-full rounded-xl py-3.5 text-[14px] font-[600] text-white flex items-center justify-center gap-2 shadow-lg
                    ${saved ? "bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-200/70"
                      : saving ? "bg-gradient-to-r from-blue-400 to-sky-400 shadow-blue-200/60 cursor-wait"
                      : "bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 shadow-blue-200/60"}`}
                >
                  {saving ? <><RefreshCw className="h-4 w-4 animate-spin" />Saving…</>
                    : saved ? <><CheckCircle2 className="h-4 w-4" />Configuration Saved!</>
                    : <><Zap className="h-4 w-4" />Save Configuration</>}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="info-card rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
            <p className="text-[11px] font-[700] uppercase tracking-widest text-gray-400 mb-4">API Permissions</p>
            <div className="space-y-2.5">
              {services.map(({ icon: Icon, label, desc, color, iconColor }) => (
                <div key={label} className="svc-row flex items-center gap-3 rounded-xl border border-gray-100 p-3 cursor-default">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${color}`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-[600] text-gray-800">{label}</p>
                    <p className="text-[11px] text-gray-400 truncate">{desc}</p>
                  </div>
                  <CheckCircle2 className={`h-4 w-4 shrink-0 transition-colors duration-300 ${saved ? "text-green-500" : "text-gray-200"}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="info-card rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
            <p className="text-[12px] font-[700] text-gray-800 mb-3 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 text-[10px] font-[800] text-blue-600">?</span>
              How to find credentials
            </p>
            <ol className="space-y-2">
              {[
                "Open portal.azure.com",
                "Go to Azure Active Directory",
                "App registrations → New registration",
                "Copy Application (client) ID",
                "Certificates & secrets → New secret",
                "Copy Directory (tenant) ID",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[11px] text-gray-500">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-[700] text-blue-600 mt-px">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="info-card rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-100">
                <Globe className="h-4 w-4 text-sky-600" />
              </div>
              <div>
                <p className="text-[12px] font-[700] text-sky-800 mb-1">Required API Scopes</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {["Mail.ReadWrite", "Calendars.ReadWrite", "Contacts.Read"].map((s) => (
                    <span key={s} className="inline-block rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-[600] text-sky-700">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── SMTP Providers ── */
const INIT_SMTP = [
  { id: 1, name: "Mailgun Production", provider: "Mailgun", domain: "mg.mycompany.com", ready: true },
  { id: 2, name: "SendGrid Backup", provider: "SendGrid", domain: "sg.mycompany.com", ready: false },
];
const SMTP_PROVIDERS = ["Mailgun", "SendGrid", "Amazon SES", "Postmark", "Custom SMTP"];
const EMPTY_SMTP = { name: "", provider: SMTP_PROVIDERS[0], apiKey: "", domain: "", fromEmail: "", fromName: "" };

function SMTPProvidersPage({ onBack }) {
  const [list, setList] = useState(INIT_SMTP);
  const [showModal, setShow] = useState(false);
  const [form, setForm] = useState(EMPTY_SMTP);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const create = () => {
    if (!form.name || !form.apiKey || !form.domain) return;
    setList((p) => [...p, { id: Date.now(), name: form.name, provider: form.provider, domain: form.domain, ready: false }]);
    setForm(EMPTY_SMTP);
    setShow(false);
  };
  const del = (id) => setList((p) => p.filter((x) => x.id !== id));
  const toggle = (id) => setList((p) => p.map((x) => (x.id === id ? { ...x, ready: !x.ready } : x)));

  return (
    <div>
      <PageHeader
        title="SMTP Providers"
        subtitle="Configure email delivery providers for campaigns"
        onBack={onBack}
        action={
          <button
            onClick={() => setShow(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#0a0a0a] px-4 py-2.5 text-[13px] font-[600] text-white hover:bg-gray-800 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Provider
          </button>
        }
      />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Name", "Provider", "Domain", "Ready to Use", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3 text-[11px] font-[600] uppercase tracking-wide text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-[13px] text-gray-400">No SMTP providers yet</td></tr>
            ) : (
              list.map((s, i) => (
                <tr key={s.id} className={`border-b border-gray-50 hover:bg-gray-50/60 transition ${i % 2 !== 0 ? "bg-gray-50/30" : ""}`}>
                  <td className="px-5 py-3.5 text-[13px] font-[600] text-gray-900">{s.name}</td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-600">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-[600]">{s.provider}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-500 font-mono text-[12px]">{s.domain}</td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => toggle(s.id)}>
                      {s.ready ? (
                        <span className="inline-flex items-center gap-1.5 text-[12px] font-[600] text-green-700"><CheckCircle2 className="h-4 w-4 text-green-500" />Ready</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-400"><Circle className="h-4 w-4" />Not ready</span>
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => del(s.id)} className="text-red-400 hover:text-red-600 transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-gray-100 text-[12px] text-gray-400">
          {list.length} providers configured
        </div>
      </div>

      {showModal && (
        <Modal title="Create SMTP Configuration" onClose={() => setShow(false)}>
          <div className="space-y-4">
            <Field label="Configuration Name" required placeholder="e.g. Mailgun Production" value={form.name} onChange={set("name")} />
            <SelectField label="Provider" options={SMTP_PROVIDERS} value={form.provider} onChange={set("provider")} />
            <Field label="API Key" required placeholder="Enter your provider API key" type="password" value={form.apiKey} onChange={set("apiKey")} icon={Key} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Domain" required placeholder="mg.yourdomain.com" value={form.domain} onChange={set("domain")} icon={Globe} />
              <Field label="From Email" placeholder="noreply@yourdomain.com" value={form.fromEmail} onChange={set("fromEmail")} icon={AtSign} />
            </div>
            <Field label="From Name" placeholder="Your Company Name" value={form.fromName} onChange={set("fromName")} />
            <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
              <button onClick={() => setShow(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-[500] text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={create} className="px-5 py-2 rounded-xl bg-[#0a0a0a] text-[13px] font-[600] text-white hover:bg-gray-800 transition">Submit</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Leads ── */
function LeadsPage({ onBack }) {
  const fileRef = useRef(null);

  /* ── All lists ── */
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  /* ── Create list wizard ── */
  const wizardFileRef = useRef(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", sourceType: "" });
  const [creating, setCreating] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);   // 1 = name+source, 2 = upload
  const [createdListId, setCreatedListId] = useState(null);
  const [wizardExcelFile, setWizardExcelFile] = useState(null);  // selected file (not yet uploaded)
  const [wizardExcelUploading, setWizardExcelUploading] = useState(false);
  const [wizardCrmImporting, setWizardCrmImporting] = useState(false);

  /* ── Detail view ── */
  const [viewList, setViewList] = useState(null);
  const [listLeads, setListLeads] = useState([]);
  const [listLeadsLoading, setListLeadsLoading] = useState(false);
  const [leadSearch, setLeadSearch] = useState("");

  /* ── Upload / import ── */
  const [excelUploading, setExcelUploading] = useState(false);
  const [crmImporting, setCrmImporting] = useState(false);
  const [deletingLeadId, setDeletingLeadId] = useState(null);

  /* ── GET /lead-lists ── */
  const fetchLists = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/lead-lists");
      const d = res.data;
      const raw = Array.isArray(d) ? d
        : Array.isArray(d?.lists) ? d.lists
        : Array.isArray(d?.data)  ? d.data
        : [];
      setLists(raw);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load lead lists.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLists(); }, []);

  /* ── Wizard helpers ── */
  const closeWizard = () => {
    setShowCreate(false);
    setForm({ name: "", sourceType: "" });
    setWizardStep(1);
    setCreatedListId(null);
    setWizardExcelFile(null);
    if (wizardFileRef.current) wizardFileRef.current.value = "";
  };

  /* ── POST /lead-lists (wizard step 1 — Continue button) ── */
  const handleCreate = async () => {
    if (!form.name.trim() || !form.sourceType) return;
    setCreating(true);
    try {
      const res = await axiosInstance.post("/lead-lists", {
        name: form.name.trim(),
        source_type: form.sourceType,
      });
      const id = res.data?.id ?? res.data?.list_id ?? res.data?.data?.id ?? null;
      setCreatedListId(id);
      toast.success("Lead list created.");
      setWizardStep(2); // always advance to step 2; user clicks Create there
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create lead list.");
    } finally {
      setCreating(false);
    }
  };

  /* ── POST /lead-lists/{id}/upload-excel (wizard step 2 Create button) ── */
  const handleWizardExcelUpload = async () => {
    if (!wizardExcelFile || !createdListId) return;
    setWizardExcelUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", wizardExcelFile);
      await axiosInstance.post(`/lead-lists/${createdListId}/upload-excel`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Leads uploaded successfully.");
      closeWizard();
      fetchLists();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Excel upload failed.");
    } finally {
      setWizardExcelUploading(false);
    }
  };

  /* ── POST /lead-lists/{id}/import-crm (wizard step 2 Create button) ── */
  const handleWizardCRMImport = async (listId) => {
    setWizardCrmImporting(true);
    try {
      await axiosInstance.post(`/lead-lists/${listId}/import-crm`);
      toast.success("CRM import started successfully.");
      closeWizard();
      fetchLists();
    } catch (err) {
      toast.error(err?.response?.data?.message || "CRM import failed.");
    } finally {
      setWizardCrmImporting(false);
    }
  };

  /* ── GET /lead-lists/{id} ── */
  const openDetail = async (list) => {
    setViewList(list);
    setListLeads([]);
    setLeadSearch("");
    setListLeadsLoading(true);
    try {
      const res = await axiosInstance.get(`/lead-lists/${list.id}`);
      const d = res.data;
      // Actual API: { list: {...}, leads: [...], total_leads, page, page_size }
      // Update viewList with the richer detail response (has total_leads, etc.)
      if (d?.list && typeof d.list === "object") setViewList(d.list);
      const raw = Array.isArray(d?.leads)   ? d.leads
        : Array.isArray(d?.data)            ? d.data
        : Array.isArray(d?.items)           ? d.items
        : Array.isArray(d?.results)         ? d.results
        : Array.isArray(d)                  ? d
        : [];
      setListLeads(raw);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load leads.");
    } finally {
      setListLeadsLoading(false);
    }
  };

  /* ── POST /lead-lists/{id}/upload-excel ── */
  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !viewList) return;
    setExcelUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await axiosInstance.post(`/lead-lists/${viewList.id}/upload-excel`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Excel uploaded successfully.");
      openDetail(viewList);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Excel upload failed.");
    } finally {
      setExcelUploading(false);
      e.target.value = "";
    }
  };

  /* ── POST /lead-lists/{id}/import-crm ── */
  const handleCRMImport = async () => {
    if (!viewList) return;
    setCrmImporting(true);
    try {
      await axiosInstance.post(`/lead-lists/${viewList.id}/import-crm`);
      toast.success("CRM import started. Refreshing leads…");
      openDetail(viewList);
    } catch (err) {
      toast.error(err?.response?.data?.message || "CRM import failed.");
    } finally {
      setCrmImporting(false);
    }
  };

  /* ── DELETE /lead-lists/{list_id}/leads/{list_lead_id} ── */
  const handleDeleteLead = async (leadId) => {
    if (!viewList) return;
    setDeletingLeadId(leadId);
    try {
      await axiosInstance.delete(`/lead-lists/${viewList.id}/leads/${leadId}`);
      setListLeads((p) => p.filter((l) => (l.id ?? l._id ?? l.list_lead_id) !== leadId));
      toast.success("Lead removed from list.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove lead.");
    } finally {
      setDeletingLeadId(null);
    }
  };

  const filteredLists = lists.filter((l) =>
    (l.name ?? "").toLowerCase().includes(search.toLowerCase())
  );
  const filteredLeads = listLeads.filter((l) => {
    const q = leadSearch.toLowerCase();
    const ld = l.lead_data ?? {};
    return (
      (ld.name ?? "").toLowerCase().includes(q) ||
      (ld.email_address ?? "").toLowerCase().includes(q) ||
      (ld.contact_number ?? "").toLowerCase().includes(q) ||
      (ld.company ?? "").toLowerCase().includes(q)
    );
  });

  /* ════ DETAIL VIEW ════ */
  if (viewList) {
    return (
      <div>
        <PageHeader
          title={viewList.name ?? "Lead List"}
          subtitle={`${viewList.total_leads ?? listLeads.length} lead${(viewList.total_leads ?? listLeads.length) !== 1 ? "s" : ""}`}
          onBack={() => { setViewList(null); setListLeads([]); setLeadSearch(""); }}
          action={
            <div className="flex items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleExcelUpload}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={excelUploading}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-[12px] font-[600] text-gray-700 hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
              >
                {excelUploading
                  ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  : <Upload className="h-3.5 w-3.5" />}
                {excelUploading ? "Uploading…" : "Upload Excel"}
              </button>
              <button
                onClick={handleCRMImport}
                disabled={crmImporting}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-[12px] font-[600] text-indigo-700 hover:bg-indigo-100 transition shadow-sm disabled:opacity-50"
              >
                {crmImporting
                  ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  : <Database className="h-3.5 w-3.5" />}
                {crmImporting ? "Importing…" : "Import from CRM"}
              </button>
            </div>
          }
        />

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <span className="text-[13px] font-[600] text-gray-900">Leads in &quot;{viewList.name}&quot;</span>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <input
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                placeholder="Search leads…"
                className="pl-7 pr-3 py-1.5 text-[12px] border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition w-[190px] placeholder:text-gray-400"
              />
            </div>
          </div>

          {listLeadsLoading ? (
            <div className="flex items-center justify-center py-20 text-[13px] text-gray-400 animate-pulse">Loading leads…</div>
          ) : (
            <>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["#", "Name", "Email", "Phone", "Company", "Status", "Channels", ""].map((h) => (
                        <th key={h} className="px-5 py-3 text-[11px] font-[600] uppercase tracking-wide text-gray-500 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.length === 0 ? (
                      <tr><td colSpan={8} className="px-5 py-12 text-center text-[13px] text-gray-400">No leads found</td></tr>
                    ) : (
                      filteredLeads.map((lead, i) => {
                        const leadId = lead.id ?? lead._id ?? lead.list_lead_id ?? i;
                        const ld = lead.lead_data ?? {};
                        const fullName = ld.name ?? "—";
                        const email   = ld.email_address ?? "—";
                        const phone   = ld.contact_number ?? "—";
                        const company = ld.company ?? "—";
                        const status  = ld.lead_status ?? ld.lead_rating ?? null;
                        const statusCls =
                          status === "dead"      ? "bg-red-50 text-red-600 border-red-200" :
                          status === "active"    ? "bg-green-50 text-green-700 border-green-200" :
                          status === "converted" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          "bg-gray-100 text-gray-600 border-gray-200";
                        return (
                          <tr key={leadId} className={`border-b border-gray-50 hover:bg-gray-50/60 transition ${i % 2 !== 0 ? "bg-gray-50/30" : ""}`}>
                            <td className="px-5 py-3.5 text-[12px] text-gray-400">{i + 1}</td>
                            <td className="px-5 py-3.5 text-[13px] font-[500] text-gray-800 whitespace-nowrap max-w-[160px] truncate">{fullName}</td>
                            <td className="px-5 py-3.5 text-[12px] text-gray-600 whitespace-nowrap">{email}</td>
                            <td className="px-5 py-3.5 text-[12px] text-gray-600 font-mono whitespace-nowrap">{phone}</td>
                            <td className="px-5 py-3.5 text-[12px] text-gray-600 whitespace-nowrap">{company}</td>
                            <td className="px-5 py-3.5">
                              {status ? (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-[700] capitalize border ${statusCls}`}>
                                  {status}
                                </span>
                              ) : <span className="text-gray-300">—</span>}
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1.5">
                                {lead.call_enabled && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-[700] border border-indigo-100">Call</span>
                                )}
                                {lead.email_enabled && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-600 text-[10px] font-[700] border border-sky-100">Email</span>
                                )}
                                {lead.whatsapp_enabled && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-green-50 text-green-600 text-[10px] font-[700] border border-green-100">WA</span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <button
                                onClick={() => handleDeleteLead(leadId)}
                                disabled={deletingLeadId === leadId}
                                className="text-red-400 hover:text-red-600 transition disabled:opacity-40"
                                title="Remove lead from list"
                              >
                                {deletingLeadId === leadId
                                  ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                  : <Trash2 className="h-4 w-4" />}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-gray-100 text-[12px] text-gray-400">
                {filteredLeads.length} of {viewList.total_leads ?? listLeads.length} leads
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ════ LISTS VIEW ════ */
  return (
    <div>
      <PageHeader
        title="Lead Lists"
        subtitle="Manage lead sources and lists for your campaigns"
        onBack={onBack}
        action={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#0a0a0a] px-4 py-2.5 text-[13px] font-[600] text-white hover:bg-gray-800 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />Create
          </button>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <span className="text-[13px] font-[600] text-gray-900">All Lead Lists</span>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLists}
              disabled={loading}
              className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition"
              title="Refresh"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search lists…"
                className="pl-7 pr-3 py-1.5 text-[12px] border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition w-[190px] placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-[13px] text-gray-400 animate-pulse">Loading lead lists…</div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Name", "Total Leads", "Created", "Action"].map((h) => (
                    <th key={h} className="px-5 py-3 text-[11px] font-[600] uppercase tracking-wide text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLists.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-12 text-center text-[13px] text-gray-400">No lead lists found</td></tr>
                ) : (
                  filteredLists.map((l, i) => (
                    <tr key={l.id ?? i} className={`border-b border-gray-50 hover:bg-gray-50/60 transition ${i % 2 !== 0 ? "bg-gray-50/30" : ""}`}>
                      <td className="px-5 py-3.5 text-[13px] font-[600] text-gray-900">{l.name}</td>
                      <td className="px-5 py-3.5 text-[13px] font-[700] text-indigo-700">
                        {(l.total_leads ?? l.total ?? l.lead_count ?? l.count ?? 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-gray-500">
                        {l.created_at
                          ? new Date(l.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => openDetail(l)}
                          className="flex items-center gap-1 text-[12px] font-[500] text-indigo-600 hover:text-indigo-800 transition"
                        >
                          <Eye className="h-3.5 w-3.5" />View Leads
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-gray-100 text-[12px] text-gray-400">{lists.length} lists</div>
          </>
        )}
      </div>

      {showCreate && (
        <Modal
          title={wizardStep === 1 ? "Create Lead List" : form.sourceType === "excel" ? "Upload Excel" : "Import from CRM"}
          onClose={closeWizard}
        >
          {/* ── Step indicator ── */}
          <div className="flex items-center gap-2 mb-5">
            {["Details", form.sourceType === "crm" ? "Import CRM" : "Upload Excel"].map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <div className={`h-px w-8 ${wizardStep > i ? "bg-indigo-400" : "bg-gray-200"}`} />}
                <div className={`flex items-center gap-1.5 text-[11px] font-[600] px-2.5 py-1 rounded-full border transition ${
                  wizardStep === i + 1
                    ? "bg-[#6366f1] text-white border-[#6366f1]"
                    : wizardStep > i + 1
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-100 text-gray-400 border-gray-200"
                }`}>
                  <span>{i + 1}</span> <span>{label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ══ STEP 1: Name + Source Type ══ */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <Field
                label="List Name" required
                placeholder="e.g. Q2 Enterprise Targets"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <div>
                <label className="block text-[12px] font-[600] text-gray-700 mb-2">
                  Source Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "excel", label: "Excel / CSV", icon: Upload, desc: "Upload a spreadsheet file" },
                    { value: "crm",   label: "CRM",         icon: Database, desc: "Import directly from CRM" },
                  ].map(({ value, label, icon: Icon, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, sourceType: value }))}
                      className={`flex flex-col items-start gap-1 rounded-xl border-2 px-4 py-3.5 text-left transition ${
                        form.sourceType === value
                          ? "border-[#6366f1] bg-[#6366f1]/5"
                          : "border-gray-200 bg-gray-50/60 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className={`flex items-center gap-2 font-[700] text-[13px] ${
                        form.sourceType === value ? "text-[#6366f1]" : "text-gray-800"
                      }`}>
                        <Icon className="h-4 w-4" />{label}
                      </div>
                      <p className="text-[11px] text-gray-400">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
                <button
                  onClick={closeWizard}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !form.name.trim() || !form.sourceType}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0a0a0a] text-[13px] font-[600] text-white hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {creating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
                  {creating ? "Creating…" : "Continue →"}
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 2 — EXCEL ══ */}
          {wizardStep === 2 && form.sourceType === "excel" && (
            <div className="space-y-5">
              <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/60 p-6">
                <p className="text-[13px] font-[600] text-gray-700 mb-1 text-center">Select your Excel / CSV file</p>
                <p className="text-[11px] text-gray-400 mb-4 text-center">.xlsx, .xls or .csv — leads will be imported into <span className="font-[600] text-gray-600">{form.name}</span></p>
                <input
                  ref={wizardFileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setWizardExcelFile(f);
                  }}
                />
                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={() => wizardFileRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-[12px] font-[600] text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {wizardExcelFile ? "Change File" : "Choose File"}
                  </button>
                  {wizardExcelFile && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                      <span className="text-[12px] font-[500] text-green-700 truncate max-w-[220px]">{wizardExcelFile.name}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                <button
                  onClick={() => { setWizardStep(1); setWizardExcelFile(null); if (wizardFileRef.current) wizardFileRef.current.value = ""; }}
                  className="text-[12px] text-gray-500 hover:text-gray-700 transition"
                >
                  ← Back
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={closeWizard}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleWizardExcelUpload}
                    disabled={wizardExcelUploading || !wizardExcelFile}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0a0a0a] text-[13px] font-[600] text-white hover:bg-gray-800 transition disabled:opacity-50"
                  >
                    {wizardExcelUploading
                      ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Uploading…</>
                      : <><Plus className="h-3.5 w-3.5" />Create</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══ STEP 2 — CRM ══ */}
          {wizardStep === 2 && form.sourceType === "crm" && (
            <div className="space-y-5">
              <div className="rounded-xl border border-gray-100 bg-indigo-50/60 p-6 text-center">
                <Database className="mx-auto h-8 w-8 text-indigo-300 mb-3" />
                <p className="text-[13px] font-[600] text-gray-700 mb-1">Import from CRM</p>
                <p className="text-[11px] text-gray-400">
                  All CRM contacts will be pulled into{" "}
                  <span className="font-[600] text-gray-600">{form.name}</span>
                </p>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                <button
                  onClick={() => setWizardStep(1)}
                  disabled={wizardCrmImporting}
                  className="text-[12px] text-gray-500 hover:text-gray-700 transition disabled:opacity-40"
                >
                  ← Back
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={closeWizard}
                    disabled={wizardCrmImporting}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWizardCRMImport(createdListId)}
                    disabled={wizardCrmImporting}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0a0a0a] text-[13px] font-[600] text-white hover:bg-gray-800 transition disabled:opacity-50"
                  >
                    {wizardCrmImporting
                      ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Importing…</>
                      : <><Plus className="h-3.5 w-3.5" />Create</>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

/* ── Mappings ── */
const SYSTEM_FIELD_KEYS = [
  { key: "name",                      label: "Name" },
  { key: "contact_number",            label: "Contact Number" },
  { key: "email_address",             label: "Email Address" },
  { key: "company",                   label: "Company" },
  { key: "title",                     label: "Title" },
  { key: "lead_status",               label: "Lead Status" },
  { key: "lead_rating",               label: "Lead Rating" },
  { key: "lead_source",               label: "Lead Source" },
  { key: "lead_owner_email",          label: "Lead Owner Email" },
  { key: "notes",                     label: "Notes" },
  { key: "description",              label: "Description" },
  { key: "activities",               label: "Activities" },
  { key: "comments",                 label: "Comments" },
  { key: "attachments",              label: "Attachments" },
  { key: "tasks",                    label: "Tasks" },
  { key: "address_street",           label: "Address Street" },
  { key: "address_city",             label: "Address City" },
  { key: "address_state",            label: "Address State" },
  { key: "address_zip_code",         label: "Address Zip Code" },
  { key: "address_country",          label: "Address Country" },
  { key: "client_type",              label: "Client Type" },
  { key: "business_area",            label: "Business Area" },
  { key: "reason_not_interested",    label: "Reason Not Interested" },
  { key: "reason_not_interested_other", label: "Reason Not Interested (Other)" },
  { key: "project_name",             label: "Project Name" },
  { key: "project_type",             label: "Project Type" },
  { key: "website",                  label: "Website" },
  { key: "industry",                 label: "Industry" },
  { key: "no_of_employees",          label: "No. of Employees" },
  { key: "annual_revenue",           label: "Annual Revenue" },
  { key: "add_prompt",               label: "Add Prompt" },
  { key: "last_follow_up_date",      label: "Last Follow-up Date" },
  { key: "last_modified_date",       label: "Last Modified Date" },
  { key: "linkedin_url",             label: "LinkedIn URL" },
];

function MappingsPage({ onBack }) {
  const [loading, setLoading]         = useState(false);
  const [saving,  setSaving]          = useState(false);
  const [saved,   setSaved]           = useState(false);
  const [saveError, setSaveError]     = useState("");
  const [search,  setSearch]          = useState("");
  const [showAdd, setShowAdd]         = useState(false);
  const [newMap,  setNewMap]          = useState({ sysKey: "", crmField: "" });

  /* Integration URL config */
  const [config, setConfig] = useState({
    integration_mode: "rest",
    crm_type: "",
    fetch_leads_url: "",
    fetch_details_url: "",
    update_results_url: "",
    send_email_url: "",
  });

  /* Rows: { id, apiKey, crmField }
     apiKey  = system key used in POST payload (e.g. "name")
     crmField = what the CRM calls this field (editable, e.g. "first_name") */
  const [mappings, setMappings] = useState(
    SYSTEM_FIELD_KEYS.map((f) => ({ id: f.key, apiKey: f.key, label: f.label, crmField: "", isCustom: false }))
  );

  /* ── Load existing config on mount ── */
  useEffect(() => {
    setLoading(true);
    axiosInstance.get("/get-integration-config")
      .then((res) => {
        const d = res.data ?? {};
        setConfig({
          integration_mode: d.integration_mode ?? "rest",
          crm_type:         d.crm_type         ?? "",
          fetch_leads_url:    d.fetch_leads_url    ?? "",
          fetch_details_url:  d.fetch_details_url  ?? "",
          update_results_url: d.update_results_url ?? "",
          send_email_url:     d.send_email_url     ?? "",
        });
        const fm = d.field_mappings ?? {};
        /* Populate predefined rows with API values */
        setMappings((prev) =>
          prev.map((m) => ({
            ...m,
            crmField: fm[m.apiKey] !== undefined ? String(fm[m.apiKey]) : m.crmField,
          }))
        );
        /* Append any extra custom keys from API not in predefined list */
        const knownKeys = new Set(SYSTEM_FIELD_KEYS.map((f) => f.key));
        const extras = Object.entries(fm)
          .filter(([k]) => !knownKeys.has(k))
          .map(([k, v]) => ({ id: k, apiKey: k, label: k, crmField: String(v ?? ""), isCustom: true }));
        if (extras.length > 0) setMappings((prev) => [...prev, ...extras]);
      })
      .catch(() => {}) /* silently ignore — user fills manually */
      .finally(() => setLoading(false));
  }, []);

  const updateCrmField = (id, val) =>
    setMappings((p) => p.map((m) => (m.id === id ? { ...m, crmField: val } : m)));

  const remove = (id) => setMappings((p) => p.filter((m) => m.id !== id));

  const addMapping = () => {
    if (!newMap.sysKey.trim()) return;
    const key = newMap.sysKey.trim();
    setMappings((p) => [
      ...p,
      { id: `custom_${Date.now()}`, apiKey: key, label: key, crmField: newMap.crmField.trim(), isCustom: true },
    ]);
    setNewMap({ sysKey: "", crmField: "" });
    setShowAdd(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      const field_mappings = {};
      mappings.forEach((m) => { field_mappings[m.apiKey] = m.crmField; });
      await axiosInstance.post("/save-integration-config", { ...config, field_mappings });
      setSaved(true);
      toast.success("Integration config saved.");
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save. Please try again.";
      setSaveError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const filtered = mappings.filter(
    (m) =>
      m.apiKey.includes(search.toLowerCase()) ||
      m.label.toLowerCase().includes(search.toLowerCase()) ||
      m.crmField.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)]">
      <PageHeader
        title="Field Mappings"
        subtitle="Map CRM fields to system fields for data sync"
        onBack={onBack}
        action={
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 rounded-xl bg-[#0a0a0a] px-4 py-2.5 text-[13px] font-[600] text-white hover:bg-gray-800 active:scale-95 transition shadow-sm">
            <Plus className="h-4 w-4" />Add Field
          </button>
        }
      />

      <form onSubmit={submit} className="flex flex-col flex-1 gap-4">

        {/* ── Integration Config Section ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-[13px] font-[700] text-gray-800 mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4 text-indigo-500" />
            Integration Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-[600] text-gray-600 mb-1">Integration Mode</label>
              <div className="relative">
                <select
                  value={config.integration_mode}
                  onChange={(e) => setConfig((p) => ({ ...p, integration_mode: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 appearance-none cursor-pointer"
                >
                  <option value="rest">REST</option>
                  <option value="graphql">GraphQL</option>
                  <option value="webhook">Webhook</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-[600] text-gray-600 mb-1">CRM Type</label>
              <input
                value={config.crm_type}
                onChange={(e) => setConfig((p) => ({ ...p, crm_type: e.target.value }))}
                placeholder="e.g. salesforce, hubspot, zoho"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-[600] text-gray-600 mb-1">Fetch Leads URL</label>
              <input
                value={config.fetch_leads_url}
                onChange={(e) => setConfig((p) => ({ ...p, fetch_leads_url: e.target.value }))}
                placeholder="https://your-crm.com/api/leads"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-[600] text-gray-600 mb-1">Fetch Details URL</label>
              <input
                value={config.fetch_details_url}
                onChange={(e) => setConfig((p) => ({ ...p, fetch_details_url: e.target.value }))}
                placeholder="https://your-crm.com/api/leads/{id}"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-[600] text-gray-600 mb-1">Update Results URL</label>
              <input
                value={config.update_results_url}
                onChange={(e) => setConfig((p) => ({ ...p, update_results_url: e.target.value }))}
                placeholder="https://your-crm.com/api/leads/{id}/update"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-[600] text-gray-600 mb-1">Send Email URL</label>
              <input
                value={config.send_email_url}
                onChange={(e) => setConfig((p) => ({ ...p, send_email_url: e.target.value }))}
                placeholder="https://your-crm.com/api/send-email"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
              />
            </div>
          </div>
        </div>

        {/* ── Field Mappings Table ── */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-[600] text-gray-800">All Mappings</span>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-[600] text-gray-500">{mappings.length} fields</span>
              {loading && <span className="text-[11px] text-violet-400 animate-pulse">Loading…</span>}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search fields…"
                className="pl-7 pr-7 py-1.5 text-[12px] border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition w-[190px] placeholder:text-gray-400" />
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left table-fixed">
              <colgroup>
                <col style={{ width: "4%" }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "50%" }} />
                <col style={{ width: "8%" }} />
              </colgroup>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-[11px] font-[600] uppercase tracking-wide text-gray-400">#</th>
                  <th className="px-5 py-3 text-[11px] font-[600] uppercase tracking-wide text-gray-400">
                    <span className="flex items-center gap-1.5"><Database className="h-3 w-3" />CRM Field</span>
                  </th>
                  <th className="px-2 py-3" />
                  <th className="px-5 py-3 text-[11px] font-[600] uppercase tracking-wide text-gray-400">System Field</th>
                  <th className="px-5 py-3 text-[11px] font-[600] uppercase tracking-wide text-gray-400 text-center">Del</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center text-[13px] text-gray-400">
                      {search ? "No matching fields." : 'No mappings found.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((m, i) => (
                    <tr key={m.id} className="border-b border-gray-50 hover:bg-violet-50/40 transition-colors group">
                      <td className="px-5 py-3.5 text-[12px] text-gray-400 font-mono">{i + 1}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-block rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-[12px] text-gray-600 font-mono">{m.apiKey}</span>
                      </td>
                      <td className="px-2 py-3.5 text-center text-gray-300 group-hover:text-violet-400 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 8h12M9 4l4 4-4 4" />
                        </svg>
                      </td>
                      <td className="px-5 py-3">
                        <input
                          value={m.crmField}
                          onChange={(e) => updateCrmField(m.id, e.target.value)}
                          placeholder={`Enter your CRM field name…`}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2 text-[13px] text-gray-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-400/20 hover:border-gray-300"
                        />
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => remove(m.id)}
                          className="rounded-lg p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 active:scale-90 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 w-full">
          <p className="text-[12px] text-gray-400">
            {saveError
              ? <span className="text-red-500 font-[500]">{saveError}</span>
              : <><span className="font-[600] text-gray-700">{mappings.length}</span> mappings configured</>}
          </p>
          <button
            type="submit"
            disabled={saving || loading}
            className="flex items-center gap-2 rounded-xl bg-[#0a0a0a] px-7 py-2.5 text-[13px] font-[600] text-white hover:bg-gray-800 active:scale-95 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
            {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Mappings"}
          </button>
        </div>
      </form>

      {showAdd && (
        <Modal title="Add Custom Field Mapping" onClose={() => setShowAdd(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-[600] text-gray-600 mb-1">System Field Key <span className="text-red-500">*</span></label>
              <input
                placeholder="e.g. custom_field"
                value={newMap.sysKey}
                onChange={(e) => setNewMap((p) => ({ ...p, sysKey: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-[600] text-gray-600 mb-1">CRM Field Value</label>
              <input
                placeholder="e.g. custom_crm_field"
                value={newMap.crmField}
                onChange={(e) => setNewMap((p) => ({ ...p, crmField: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={addMapping} className="px-5 py-2 rounded-xl bg-[#0a0a0a] text-[13px] font-[600] text-white hover:bg-gray-800 active:scale-95 transition">Add</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN SETTINGS DASHBOARD
════════════════════════════════════════════════════════════ */
export default function Setting() {
  const [activePage, setActivePage] = useState(null);
  const [emailPlatform, setEP] = useState("SMTP");
  const [smtpProvider, setSMTP] = useState("");
  const [smtpProviderList, setSmtpProviderList] = useState([]); // [{name, description, ready}]
  const [smtpProviderLoading, setSmtpProviderLoading] = useState(false);
  const [smtpSelectSaving, setSmtpSelectSaving] = useState(false);
  const [crmConnected, setCRM] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch available SMTP providers + currently selected provider on mount
  useEffect(() => {
    const fetchSmtpProviders = async () => {
      setSmtpProviderLoading(true);
      try {
        const [availableRes, configuredRes] = await Promise.allSettled([
          axiosInstance.get("/api/smtp/available-providers"),
          axiosInstance.get("/api/smtp/providers"),
        ]);

        // Build provider list from available-providers
        // Response shape: { available_providers: [{ name, ready, description, ... }] }
        let providers = [];
        if (availableRes.status === "fulfilled") {
          const d = availableRes.value.data;
          const raw = d?.available_providers ?? d?.providers ?? (Array.isArray(d) ? d : []);
          providers = raw.map((p) =>
            typeof p === "string"
              ? { name: p, description: "", ready: true }
              : { name: p.name ?? p.provider ?? String(p), description: p.description ?? "", ready: p.ready ?? true }
          );
        }
        if (providers.length === 0) {
          providers = [
            { name: "mailgun", description: "Mailgun SMTP/API", ready: true },
            { name: "sendgrid", description: "SendGrid", ready: true },
          ];
        }
        setSmtpProviderList(providers);

        // Determine the currently active provider from /api/smtp/providers
        if (configuredRes.status === "fulfilled") {
          const d = configuredRes.value.data;
          const activeProvider = Array.isArray(d)
            ? d.find((p) => p.is_active ?? p.selected ?? p.is_default)
            : (d?.active_provider ?? d?.selected_provider ?? d?.provider ?? null);
          if (activeProvider) {
            const name = typeof activeProvider === "string" ? activeProvider : (activeProvider.name ?? activeProvider.provider ?? "");
            if (name) setSMTP(name);
          } else if (providers.length > 0) {
            setSMTP(providers[0].name);
          }
        } else if (providers.length > 0) {
          setSMTP(providers[0].name);
        }
      } catch {
        // silently ignore
      } finally {
        setSmtpProviderLoading(false);
      }
    };
    fetchSmtpProviders();
  }, []);

  const handleSelectSmtpProvider = async (providerName) => {
    setSMTP(providerName);
    setSmtpSelectSaving(true);
    try {
      await axiosInstance.post("/api/smtp/select-provider", { provider: providerName });
      toast.success(`SMTP provider set to ${providerName}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.response?.data?.detail || "Failed to set SMTP provider.");
    } finally {
      setSmtpSelectSaving(false);
    }
  };

  if (activePage === "crm") return <div className="p-6 bg-[#f4f5f7] min-h-[calc(100vh-60px)]"><CRMPage onBack={() => setActivePage(null)} /></div>;
  if (activePage === "agents") return <div className="p-6 bg-[#f4f5f7] min-h-[calc(100vh-60px)]"><AgentsPage onBack={() => setActivePage(null)} /></div>;
  if (activePage === "email-templates") return <div className="p-6 bg-[#f4f5f7] min-h-[calc(100vh-60px)]"><EmailTemplatesPage onBack={() => setActivePage(null)} /></div>;
  if (activePage === "graph-config") return <div className="p-6 bg-[#f4f5f7] min-h-[calc(100vh-60px)]"><GraphConfigPage onBack={() => setActivePage(null)} /></div>;
  if (activePage === "smtp-providers") return <div className="p-6 bg-[#f4f5f7] min-h-[calc(100vh-60px)]"><SMTPProvidersPage onBack={() => setActivePage(null)} /></div>;
  if (activePage === "leads") return <div className="p-6 bg-[#f4f5f7] min-h-[calc(100vh-60px)]"><LeadsPage onBack={() => setActivePage(null)} /></div>;
  if (activePage === "mappings") return <div className="p-6 bg-[#f4f5f7] min-h-[calc(100vh-60px)]"><MappingsPage onBack={() => setActivePage(null)} /></div>;

  const SettingCard = ({ icon: Icon, iconBg, iconColor, title, desc, action }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-[700] text-gray-900 leading-snug">{title}</p>
          <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{desc}</p>
        </div>
      </div>
      <div className="mt-auto">{action}</div>
    </div>
  );

  const GearBtn = ({ page }) => (
    <button
      type="button"
      onClick={() => setActivePage(page)}
      className="flex items-center gap-1.5 w-full justify-center rounded-xl border border-gray-200 bg-gray-50
                 py-2 text-[12px] font-[500] text-gray-600 hover:bg-white hover:border-violet-300 hover:text-violet-700
                 transition group"
    >
      <Settings className="h-3.5 w-3.5 group-hover:rotate-45 transition-transform duration-300" />
      Configure
    </button>
  );

  return (
    <main className="min-h-[calc(100vh-60px)] bg-[#f4f5f7] p-6">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7c3aed] shadow-md shadow-violet-400/30">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-poppins text-[20px] font-[700] text-[#0a0a0a]">Settings</h1>
            <p className="text-[12px] text-gray-400 mt-0.5">Manage integrations, agents, email, and system preferences</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 700); }}
          className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* ═══ SECTION 1 — CONNECTION ═══ */}
      <div className="mb-2">
        <p className="text-[11px] font-[700] uppercase tracking-widest text-gray-400 mb-3 px-1">Connection & Integration</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <SettingCard
          icon={Database} iconBg="bg-indigo-50" iconColor="text-indigo-600"
          title="Configure CRM" desc="Connect & authorise your CRM via OAuth2 credentials"
          action={
            <div className="flex flex-col gap-2">
              <button onClick={() => setActivePage("crm")} className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-[#0a0a0a] py-2 text-[12px] font-[600] text-white hover:bg-gray-800 transition">
                <Link2 className="h-3.5 w-3.5" />
                {crmConnected ? "Manage CRM" : "+ Connect CRM"}
              </button>
              {crmConnected ? (
                <button onClick={() => setCRM(false)} className="w-full rounded-xl bg-red-500 py-2 text-[12px] font-[600] text-white hover:bg-red-600 transition flex items-center justify-center gap-1.5">
                  <Link2Off className="h-3.5 w-3.5" />Disconnect
                </button>
              ) : (
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                  <AlertCircle className="h-3 w-3 text-amber-400" />Not connected
                </div>
              )}
            </div>
          }
        />
        <SettingCard icon={Users} iconBg="bg-violet-50" iconColor="text-violet-600" title="Leads" desc="Manage lead lists and data sources for your campaigns" action={<GearBtn page="leads" />} />
        <SettingCard icon={Map} iconBg="bg-orange-50" iconColor="text-orange-600" title="Field Mappings" desc="Map CRM fields to internal system fields for data sync" action={<GearBtn page="mappings" />} />
      </div>

      {/* ═══ SECTION 2 — AI & AUTOMATION ═══ */}
      <div className="mb-2">
        <p className="text-[11px] font-[700] uppercase tracking-widest text-gray-400 mb-3 px-1">AI & Automation</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <SettingCard icon={Zap} iconBg="bg-amber-50" iconColor="text-amber-600" title="Agent" desc="Manage AI SDR agents, switching, and parallel call limits" action={<GearBtn page="agents" />} />
      </div>

      {/* ═══ SECTION 3 — EMAIL DELIVERY ═══ */}
      <div className="mb-2">
        <p className="text-[11px] font-[700] uppercase tracking-widest text-gray-400 mb-3 px-1">Email Delivery</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SettingCard
          icon={Mail} iconBg="bg-sky-50" iconColor="text-sky-600"
          title="Email Sender Platform" desc="Choose whether email is sent via SMTP or your CRM"
          action={
            <div>
              <label className="block text-[11px] font-[600] text-gray-500 mb-1.5">Platform</label>
              <div className="relative">
                <select value={emailPlatform} onChange={(e) => setEP(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 pr-9 cursor-pointer">
                  <option>SMTP</option>
                  <option>CRM</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              </div>
            </div>
          }
        />

        {emailPlatform === "SMTP" && (
          <SettingCard
            icon={Server} iconBg="bg-teal-50" iconColor="text-teal-600"
            title="Default SMTP Provider" desc="Select the active provider for outbound email delivery"
            action={
              <div>
                <label className="block text-[11px] font-[600] text-gray-500 mb-1.5">Provider</label>
                <div className="relative">
                  {smtpProviderLoading ? (
                    <div className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-400">
                      Loading providers…
                    </div>
                  ) : (
                    <select
                      value={smtpProvider}
                      onChange={(e) => handleSelectSmtpProvider(e.target.value)}
                      disabled={smtpSelectSaving}
                      className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 pr-9 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {smtpProviderList.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.description ? `${p.name} — ${p.description}` : p.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                </div>
                {smtpSelectSaving && (
                  <p className="mt-1.5 text-[11px] text-violet-500 font-[500]">Saving…</p>
                )}
              </div>
            }
          />
        )}

        <SettingCard icon={Server} iconBg="bg-green-50" iconColor="text-green-600" title="SMTP Providers Configuration" desc="Add, configure and test your SMTP delivery providers" action={<GearBtn page="smtp-providers" />} />
        <SettingCard icon={FileText} iconBg="bg-pink-50" iconColor="text-pink-600" title="Email Templates" desc="Create and manage reusable email templates for automation" action={<GearBtn page="email-templates" />} />
        <SettingCard icon={Shield} iconBg="bg-blue-50" iconColor="text-blue-600" title="Graph Configuration" desc="Microsoft Graph API credentials for calendar and mail sync" action={<GearBtn page="graph-config" />} />
      </div>
    </main>
  );
}
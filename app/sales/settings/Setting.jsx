"use client";
import { useState, useRef, useEffect } from "react";
import axiosInstance from "../../Redux/axiosInstance";
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
          className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-400/20 pr-9 cursor-pointer"
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

/* ── Shared animation styles (injected once per sub-page render) ── */
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
        {/* ── Main form (2/3 on xl) ── */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden crm-hover">
            {/* Gradient banner */}
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
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Connecting…
                    </>
                  ) : saved ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Connected Successfully!
                    </>
                  ) : (
                    <>
                      <Link2 className="h-4 w-4" />
                      Connect to CRM
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Sidebar info (1/3 on xl) ── */}
        <div className="flex flex-col gap-4">
          {/* Status card */}
          <div
            className={`info-card rounded-2xl border p-5 ${
              saved
                ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
                : "border-gray-100 bg-white shadow-sm"
            }`}
          >
            <p className="text-[11px] font-[700] uppercase tracking-widest text-gray-400 mb-3">
              Connection Status
            </p>
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  saved ? "bg-green-100" : "bg-amber-50"
                }`}
              >
                {saved ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <div>
                <span
                  className={`block text-[14px] font-[700] ${
                    saved ? "text-green-700" : "text-amber-700"
                  }`}
                >
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

          {/* How to find credentials */}
          <div className="info-card rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
            <p className="text-[12px] font-[700] text-gray-800 mb-3 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-100 text-[10px] font-[800] text-indigo-600">
                ?
              </span>
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
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-[11px] text-gray-500"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-[700] text-indigo-600 mt-px">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Security notice */}
          <div className="info-card rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[12px] font-[700] text-blue-800 mb-1">
                  Security Notice
                </p>
                <p className="text-[11px] text-blue-600 leading-relaxed">
                  Credentials encrypted with AES-256. Never share your Client
                  Secret. Tokens auto-refresh via OAuth 2.0 flow.
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
  const [newEmail, setNewEmail] = useState("");
  const [parallelCalls, setPC] = useState(0);
  const [search, setSearch] = useState("");
  const [pcSaved, setPcSaved] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const fetchAgents = async () => {
    setLoadingAgents(true);
    setFetchError("");
    try {
      const res = await axiosInstance.get("/my-agents");
      // API returns array or { agents: [...] } — normalise both shapes
      const list = Array.isArray(res.data) ? res.data : (res.data.agents ?? []);
      console.log("[my-agents] raw response:", res.data); // inspect fields in browser console
      setAgents(
        list.map((a) => ({
          id: a.agent_id ?? a.id ?? a._id ?? Math.random(),
          name: a.agent_name ?? a.name ?? "—",
          email: a.email ?? "—",
          active: a.is_active ?? a.active ?? false,
        }))
      );
    } catch (err) {
      setFetchError(err?.response?.data?.detail || err?.response?.data?.message || "Failed to load agents.");
    } finally {
      setLoadingAgents(false);
    }
  };

  useEffect(() => { fetchAgents(); }, []);

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.email !== "—" && a.email.toLowerCase().includes(search.toLowerCase())),
  );

  const createAgent = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError("");
    try {
      await axiosInstance.post("/create-agent", {
        agent_name: newName.trim(),
      });
      setNewName("");
      setNewEmail("");
      await fetchAgents(); // refresh list from server after creation
    } catch (err) {
      setCreateError(err?.response?.data?.message || "Failed to create agent. Please try again.");
    } finally {
      setCreating(false);
    }
  };
  const del = (id) => setAgents((p) => p.filter((a) => a.id !== id));
  const swit = (id) =>
    setAgents((p) => p.map((a) => ({ ...a, active: a.id === id })));
  const [pcSaving, setPcSaving] = useState(false);
  const [pcError, setPcError] = useState("");

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
      setPcError(err?.response?.data?.message || err?.response?.data?.detail || "Failed to save. Please try again.");
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
              className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-[11px] font-[600] text-gray-600 mb-1">
              Email
            </label>
            <input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="agent@company.com"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
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
          <span className="text-[13px] font-[600] text-gray-900">
            Agent List
          </span>
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
              {["Agent Name", "Email", "Status", "Action"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-[11px] font-[600] uppercase tracking-wide text-gray-500"
                >
                  {h}
                </th>
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
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-[13px] text-gray-400"
                >
                  No agents found
                </td>
              </tr>
            ) : (
              filtered.map((a, i) => (
                <tr
                  key={a.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/60 transition ${i % 2 !== 0 ? "bg-gray-50/30" : ""}`}
                >
                  <td className="px-5 py-3.5 text-[13px] font-[500] text-gray-900">
                    {a.name}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-indigo-600 font-[500]">
                    {a.email}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-[600] border ${a.active ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${a.active ? "bg-green-500" : "bg-gray-400"}`}
                      />
                      {a.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {!a.active && (
                        <button
                          onClick={() => swit(a.id)}
                          className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[12px] font-[600] text-indigo-700 hover:bg-indigo-100 transition"
                        >
                          Switch
                        </button>
                      )}
                      <button
                        onClick={() => del(a.id)}
                        className="rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5 text-[12px] text-red-600 hover:bg-red-100 transition"
                      >
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
            <p className="text-[13px] font-[600] text-gray-900">
              Global Parallel Calls
            </p>
            <p className="text-[11px] text-gray-400">
              Max simultaneous calls across all agents
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="0"
            max="100"
            value={parallelCalls}
            onChange={(e) => setPC(Number(e.target.value))}
            className="w-24 rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[14px] font-[600] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 text-center"
          />
          <button
            onClick={savePC}
            disabled={pcSaving}
            className="rounded-xl bg-[#0a0a0a] px-5 py-2.5 text-[13px] font-[600] text-white hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pcSaving ? "Saving…" : pcSaved ? "✓ Saved!" : "Submit"}
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
              {["Name", "Subject", "Preview", "Preview", "Delete"].map(
                (h, i) => (
                  <th
                    key={i}
                    className="px-5 py-3 text-[11px] font-[600] uppercase tracking-wide text-gray-500"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {templates.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-[13px] text-gray-400"
                >
                  No templates yet
                </td>
              </tr>
            ) : (
              templates.map((t, i) => (
                <tr
                  key={t.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/60 transition ${i % 2 !== 0 ? "bg-gray-50/30" : ""}`}
                >
                  <td className="px-5 py-3.5 text-[13px] font-[600] text-gray-900">
                    {t.name}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-600">
                    {t.subject}
                  </td>
                  <td className="px-5 py-3.5 text-[12px] text-gray-400 max-w-[220px] truncate">
                    {t.preview}
                  </td>
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
                      onClick={() =>
                        setTemplates((p) => p.filter((x) => x.id !== t.id))
                      }
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
              onChange={(e) =>
                setForm((f) => ({ ...f, subject: e.target.value }))
              }
            />
            <div>
              <label className="block text-[12px] font-[600] text-gray-700 mb-1.5">
                Body / File <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Write your email body, or upload an HTML file below…"
                value={form.body}
                onChange={(e) =>
                  setForm((f) => ({ ...f, body: e.target.value }))
                }
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
                  onChange={(e) =>
                    setFileName(e.target.files?.[0]?.name ?? "No file selected")
                  }
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
        <Modal
          title={preview.name}
          onClose={() => setPreview(null)}
          width="max-w-xl"
        >
          <p className="text-[12px] font-[600] text-gray-500 uppercase tracking-wide mb-1">
            Subject
          </p>
          <p className="text-[14px] font-[500] text-gray-800 mb-4">
            {preview.subject}
          </p>
          <p className="text-[12px] font-[600] text-gray-500 uppercase tracking-wide mb-1">
            Body
          </p>
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
    {
      icon: Mail,
      label: "Mail Sync",
      desc: "Read & send emails via Graph",
      color: "bg-sky-50",
      iconColor: "text-sky-600",
    },
    {
      icon: Globe,
      label: "Calendar",
      desc: "Calendar event read/write",
      color: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      icon: Users,
      label: "Contacts",
      desc: "Sync Azure contact directory",
      color: "bg-teal-50",
      iconColor: "text-teal-600",
    },
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
        {/* ── Main form (2/3 on xl) ── */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden crm-hover">
            {/* Azure-themed gradient banner */}
            <div className="relative bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 px-7 py-6 overflow-hidden">
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />
              <div className="absolute right-24 bottom-0 h-24 w-24 rounded-full bg-white/10 pointer-events-none" />
              <div className="relative flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-[16px] font-[700] text-white">
                    Microsoft Azure AD App
                  </h3>
                  <p className="text-[12px] text-sky-200 mt-0.5">
                    Azure Active Directory app credentials for Graph API access
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={submit} className="p-7 space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field
                  label="Graph Client ID"
                  required
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={form.clientId}
                  onChange={set("clientId")}
                  icon={Key}
                />
                <Field
                  label="Graph Client Secret"
                  required
                  type="password"
                  placeholder="••••••••••••••••••"
                  value={form.clientSecret}
                  onChange={set("clientSecret")}
                  icon={Shield}
                />
              </div>
              <Field
                label="Graph Tenant ID"
                required
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={form.tenantId}
                onChange={set("tenantId")}
                icon={Globe}
                hint="Azure Portal → Azure Active Directory → Overview → Directory (tenant) ID"
              />
              <Field
                label="Graph Target Email"
                required
                type="email"
                placeholder="calendar-sync@yourcompany.com"
                value={form.targetEmail}
                onChange={set("targetEmail")}
                icon={AtSign}
                hint="Mailbox used for calendar and mail synchronisation."
              />

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className={`action-btn w-full rounded-xl py-3.5 text-[14px] font-[600] text-white flex items-center justify-center gap-2 shadow-lg
                    ${
                      saved
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-200/70"
                        : saving
                          ? "bg-gradient-to-r from-blue-400 to-sky-400 shadow-blue-200/60 cursor-wait"
                          : "bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 shadow-blue-200/60"
                    }`}
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : saved ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Configuration Saved!
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Save Configuration
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Sidebar (1/3 on xl) ── */}
        <div className="flex flex-col gap-4">
          {/* API permissions granted */}
          <div className="info-card rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
            <p className="text-[11px] font-[700] uppercase tracking-widest text-gray-400 mb-4">
              API Permissions
            </p>
            <div className="space-y-2.5">
              {services.map(({ icon: Icon, label, desc, color, iconColor }) => (
                <div
                  key={label}
                  className="svc-row flex items-center gap-3 rounded-xl border border-gray-100 p-3 cursor-default"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${color}`}
                  >
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-[600] text-gray-800">
                      {label}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">{desc}</p>
                  </div>
                  <CheckCircle2
                    className={`h-4 w-4 shrink-0 transition-colors duration-300 ${
                      saved ? "text-green-500" : "text-gray-200"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* How to find */}
          <div className="info-card rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
            <p className="text-[12px] font-[700] text-gray-800 mb-3 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 text-[10px] font-[800] text-blue-600">
                ?
              </span>
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
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-[11px] text-gray-500"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-[700] text-blue-600 mt-px">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Scope note */}
          <div className="info-card rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-100">
                <Globe className="h-4 w-4 text-sky-600" />
              </div>
              <div>
                <p className="text-[12px] font-[700] text-sky-800 mb-1">
                  Required API Scopes
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {[
                    "Mail.ReadWrite",
                    "Calendars.ReadWrite",
                    "Contacts.Read",
                  ].map((s) => (
                    <span
                      key={s}
                      className="inline-block rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-[600] text-sky-700"
                    >
                      {s}
                    </span>
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
  {
    id: 1,
    name: "Mailgun Production",
    provider: "Mailgun",
    domain: "mg.mycompany.com",
    ready: true,
  },
  {
    id: 2,
    name: "SendGrid Backup",
    provider: "SendGrid",
    domain: "sg.mycompany.com",
    ready: false,
  },
];
const SMTP_PROVIDERS = [
  "Mailgun",
  "SendGrid",
  "Amazon SES",
  "Postmark",
  "Custom SMTP",
];
const EMPTY_SMTP = {
  name: "",
  provider: SMTP_PROVIDERS[0],
  apiKey: "",
  domain: "",
  fromEmail: "",
  fromName: "",
};

function SMTPProvidersPage({ onBack }) {
  const [list, setList] = useState(INIT_SMTP);
  const [showModal, setShow] = useState(false);
  const [form, setForm] = useState(EMPTY_SMTP);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const create = () => {
    if (!form.name || !form.apiKey || !form.domain) return;
    setList((p) => [
      ...p,
      {
        id: Date.now(),
        name: form.name,
        provider: form.provider,
        domain: form.domain,
        ready: false,
      },
    ]);
    setForm(EMPTY_SMTP);
    setShow(false);
  };
  const del = (id) => setList((p) => p.filter((x) => x.id !== id));
  const toggle = (id) =>
    setList((p) => p.map((x) => (x.id === id ? { ...x, ready: !x.ready } : x)));

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
              {["Name", "Provider", "Domain", "Ready to Use", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-[11px] font-[600] uppercase tracking-wide text-gray-500"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-[13px] text-gray-400"
                >
                  No SMTP providers yet
                </td>
              </tr>
            ) : (
              list.map((s, i) => (
                <tr
                  key={s.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/60 transition ${i % 2 !== 0 ? "bg-gray-50/30" : ""}`}
                >
                  <td className="px-5 py-3.5 text-[13px] font-[600] text-gray-900">
                    {s.name}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-600">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-[600]">
                      {s.provider}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-500 font-mono text-[12px]">
                    {s.domain}
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => toggle(s.id)}>
                      {s.ready ? (
                        <span className="inline-flex items-center gap-1.5 text-[12px] font-[600] text-green-700">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-400">
                          <Circle className="h-4 w-4" />
                          Not ready
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => del(s.id)}
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
          {list.length} providers configured
        </div>
      </div>

      {showModal && (
        <Modal title="Create SMTP Configuration" onClose={() => setShow(false)}>
          <div className="space-y-4">
            <Field
              label="Configuration Name"
              required
              placeholder="e.g. Mailgun Production"
              value={form.name}
              onChange={set("name")}
            />
            <SelectField
              label="Provider"
              options={SMTP_PROVIDERS}
              value={form.provider}
              onChange={set("provider")}
            />
            <Field
              label="API Key"
              required
              placeholder="Enter your provider API key"
              type="password"
              value={form.apiKey}
              onChange={set("apiKey")}
              icon={Key}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Domain"
                required
                placeholder="mg.yourdomain.com"
                value={form.domain}
                onChange={set("domain")}
                icon={Globe}
              />
              <Field
                label="From Email"
                placeholder="noreply@yourdomain.com"
                value={form.fromEmail}
                onChange={set("fromEmail")}
                icon={AtSign}
              />
            </div>
            <Field
              label="From Name"
              placeholder="Your Company Name"
              value={form.fromName}
              onChange={set("fromName")}
            />
            <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
              <button
                onClick={() => setShow(false)}
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
    </div>
  );
}

/* ── Leads ── */
const INIT_LEADS = [
  { id: 1, name: "Q1 Enterprise Targets", type: "CRM", total: 412 },
  { id: 2, name: "SaaS Warm Leads", type: "Manual", total: 87 },
  { id: 3, name: "APAC Director List", type: "CRM", total: 234 },
];
const LEAD_TYPES = ["CRM", "Manual", "CSV Import", "API"];
function LeadsPage({ onBack }) {
  const [leads, setLeads] = useState(INIT_LEADS);
  const [showModal, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", type: "CRM" });
  const [search, setSearch] = useState("");
  const [viewItem, setView] = useState(null);

  const filtered = leads.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()),
  );
  const create = () => {
    if (!form.name.trim()) return;
    setLeads((p) => [
      ...p,
      { id: Date.now(), name: form.name.trim(), type: form.type, total: 0 },
    ]);
    setForm({ name: "", type: "CRM" });
    setShow(false);
  };
  const del = (id) => setLeads((p) => p.filter((l) => l.id !== id));

  return (
    <div>
      <PageHeader
        title="Lead Lists"
        subtitle="Manage lead sources and lists for your campaigns"
        onBack={onBack}
        action={
          <button
            onClick={() => setShow(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#0a0a0a] px-4 py-2.5 text-[13px] font-[600] text-white hover:bg-gray-800 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Create
          </button>
        }
      />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <span className="text-[13px] font-[600] text-gray-900">
            All Lead Lists
          </span>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads…"
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
              {["Name", "Source Type", "Total Leads", "View", "Delete"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-[11px] font-[600] uppercase tracking-wide text-gray-500"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-[13px] text-gray-400"
                >
                  No lead lists found
                </td>
              </tr>
            ) : (
              filtered.map((l, i) => (
                <tr
                  key={l.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/60 transition ${i % 2 !== 0 ? "bg-gray-50/30" : ""}`}
                >
                  <td className="px-5 py-3.5 text-[13px] font-[600] text-gray-900">
                    {l.name}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-[600] ${l.type === "CRM" ? "bg-blue-50 text-blue-700" : l.type === "Manual" ? "bg-amber-50 text-amber-700" : "bg-teal-50 text-teal-700"}`}
                    >
                      {l.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] font-[700] text-gray-800">
                    {l.total.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setView(l)}
                      className="flex items-center gap-1 text-[12px] font-[500] text-indigo-600 hover:text-indigo-800 transition"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => del(l.id)}
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
          {leads.length} results
        </div>
      </div>

      {showModal && (
        <Modal title="Create Lead List" onClose={() => setShow(false)}>
          <div className="space-y-4">
            <Field
              label="Name"
              required
              placeholder="e.g. Q2 Enterprise Targets"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <SelectField
              label="Type"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              options={LEAD_TYPES}
            />
            <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
              <button
                onClick={() => setShow(false)}
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

      {viewItem && (
        <Modal title={viewItem.name} onClose={() => setView(null)}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-[11px] font-[600] uppercase tracking-wide text-gray-400 mb-1">
                  Source Type
                </p>
                <p className="text-[16px] font-[700] text-gray-800">
                  {viewItem.type}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-[11px] font-[600] uppercase tracking-wide text-gray-400 mb-1">
                  Total Leads
                </p>
                <p className="text-[16px] font-[700] text-indigo-700">
                  {viewItem.total.toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-[13px] text-gray-500 text-center py-4">
              Detailed lead records will display here when connected to a live
              data source.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Mappings ── */
const DEFAULT_MAPPINGS = [
  { id: 1, crm: "first_name", local: "First Name" },
  { id: 2, crm: "last_name", local: "Last Name" },
  { id: 3, crm: "email", local: "Email Address" },
  { id: 4, crm: "company", local: "Company" },
  { id: 5, crm: "phone", local: "Phone" },
  { id: 6, crm: "title", local: "Job Title" },
  { id: 7, crm: "industry", local: "Industry" },
  { id: 8, crm: "lead_source", local: "Lead Source" },
  { id: 9, crm: "annual_revenue", local: "Annual Revenue" },
];

function MappingsPage({ onBack }) {
  const [mappings, setMappings] = useState(DEFAULT_MAPPINGS);
  const [saved, setSaved] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newMap, setNewMap] = useState({ crm: "", local: "" });
  const [search, setSearch] = useState("");

  const filtered = mappings.filter(
    (m) =>
      m.crm.includes(search.toLowerCase()) ||
      m.local.toLowerCase().includes(search.toLowerCase()),
  );

  const update = (id, val) =>
    setMappings((p) => p.map((m) => (m.id === id ? { ...m, local: val } : m)));
  const remove = (id) => setMappings((p) => p.filter((m) => m.id !== id));
  const addMapping = () => {
    if (!newMap.crm.trim() || !newMap.local.trim()) return;
    setMappings((p) => [
      ...p,
      { id: Date.now(), crm: newMap.crm.trim(), local: newMap.local.trim() },
    ]);
    setNewMap({ crm: "", local: "" });
    setShowAdd(false);
  };
  const submit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)]">
      <PageHeader
        title="Field Mappings"
        subtitle="Map CRM fields to system fields for data sync"
        onBack={onBack}
        action={
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#0a0a0a] px-4 py-2.5 text-[13px] font-[600] text-white hover:bg-gray-800 active:scale-95 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Field
          </button>
        }
      />

      <form onSubmit={submit} className="flex flex-col flex-1 gap-4">
        {/* ── Full-width table card ── */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full">
          {/* Table toolbar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-[600] text-gray-800">
                All Mappings
              </span>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-[600] text-gray-500">
                {mappings.length} fields
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search fields…"
                className="pl-7 pr-7 py-1.5 text-[12px] border border-gray-200 rounded-lg
                           bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30
                           focus:border-blue-400 focus:bg-white transition w-[190px]
                           placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Table */}
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
                  <th className="px-5 py-3 text-[11px] font-[600] uppercase tracking-wide text-gray-400">
                    #
                  </th>
                  <th className="px-5 py-3 text-[11px] font-[600] uppercase tracking-wide text-gray-400 flex items-center gap-1.5">
                    <Database className="h-3 w-3" />
                    CRM Field
                  </th>
                  <th className="px-2 py-3" />
                  <th className="px-5 py-3 text-[11px] font-[600] uppercase tracking-wide text-gray-400">
                    System Field
                  </th>
                  <th className="px-5 py-3 text-[11px] font-[600] uppercase tracking-wide text-gray-400 text-center">
                    Del
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-14 text-center text-[13px] text-gray-400"
                    >
                      {search
                        ? "No matching fields."
                        : 'No mappings yet. Click "Add Field" to get started.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((m, i) => (
                    <tr
                      key={m.id}
                      className="border-b border-gray-50 hover:bg-violet-50/40 transition-colors group"
                    >
                      {/* # */}
                      <td className="px-5 py-3.5 text-[12px] text-gray-400 font-mono">
                        {i + 1}
                      </td>

                      {/* CRM field — read-only */}
                      <td className="px-5 py-3.5">
                        <span className="inline-block rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-[12px] text-gray-600 font-mono">
                          {m.crm}
                        </span>
                      </td>

                      {/* Arrow */}
                      <td className="px-2 py-3.5 text-center text-gray-300 group-hover:text-violet-400 transition-colors">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 8h12M9 4l4 4-4 4" />
                        </svg>
                      </td>

                      {/* System field — editable */}
                      <td className="px-5 py-3">
                        <input
                          value={m.local}
                          onChange={(e) => update(m.id, e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2 text-[13px] text-gray-800 outline-none transition
                          focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-400/20
                          hover:border-gray-300"
                        />
                      </td>

                      {/* Delete */}
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

        {/* ── Sticky save footer ── */}
        <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 w-full">
          <p className="text-[12px] text-gray-400">
            <span className="font-[600] text-gray-700">{mappings.length}</span>{" "}
            mappings configured
          </p>
          <button
            type="submit"
            className="rounded-xl bg-[#0a0a0a] px-7 py-2.5 text-[13px] font-[600] text-white hover:bg-gray-800 active:scale-95 transition shadow-sm"
          >
            {saved ? "✓ Saved!" : "Save Mappings"}
          </button>
        </div>
      </form>

      {showAdd && (
        <Modal title="Add Field Mapping" onClose={() => setShowAdd(false)}>
          <div className="space-y-4">
            <Field
              label="CRM Field Key"
              required
              placeholder="e.g. lead_owner"
              value={newMap.crm}
              onChange={(e) =>
                setNewMap((p) => ({ ...p, crm: e.target.value }))
              }
              icon={Database}
            />
            <Field
              label="System Field Label"
              required
              placeholder="e.g. Lead Owner"
              value={newMap.local}
              onChange={(e) =>
                setNewMap((p) => ({ ...p, local: e.target.value }))
              }
            />
            <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={addMapping}
                className="px-5 py-2 rounded-xl bg-[#0a0a0a] text-[13px] font-[600] text-white hover:bg-gray-800 active:scale-95 transition"
              >
                Add
              </button>
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
  const [smtpProvider, setSMTP] = useState("Mailgun");
  const [crmConnected, setCRM] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /* render sub-page */
  if (activePage === "crm")
    return (
      <div className="p-6 bg-[#f4f5f7] min-h-[calc(100vh-60px)]">
        <CRMPage onBack={() => setActivePage(null)} />
      </div>
    );
  if (activePage === "agents")
    return (
      <div className="p-6 bg-[#f4f5f7] min-h-[calc(100vh-60px)]">
        <AgentsPage onBack={() => setActivePage(null)} />
      </div>
    );
  if (activePage === "email-templates")
    return (
      <div className="p-6 bg-[#f4f5f7] min-h-[calc(100vh-60px)]">
        <EmailTemplatesPage onBack={() => setActivePage(null)} />
      </div>
    );
  if (activePage === "graph-config")
    return (
      <div className="p-6 bg-[#f4f5f7] min-h-[calc(100vh-60px)]">
        <GraphConfigPage onBack={() => setActivePage(null)} />
      </div>
    );
  if (activePage === "smtp-providers")
    return (
      <div className="p-6 bg-[#f4f5f7] min-h-[calc(100vh-60px)]">
        <SMTPProvidersPage onBack={() => setActivePage(null)} />
      </div>
    );
  if (activePage === "leads")
    return (
      <div className="p-6 bg-[#f4f5f7] min-h-[calc(100vh-60px)]">
        <LeadsPage onBack={() => setActivePage(null)} />
      </div>
    );
  if (activePage === "mappings")
    return (
      <div className="p-6 bg-[#f4f5f7] min-h-[calc(100vh-60px)]">
        <MappingsPage onBack={() => setActivePage(null)} />
      </div>
    );

  /* setting card component */
  const SettingCard = ({
    icon: Icon,
    iconBg,
    iconColor,
    title,
    desc,
    action,
  }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-[700] text-gray-900 leading-snug">
            {title}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">
            {desc}
          </p>
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
      {/* ── page header ── */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7c3aed] shadow-md shadow-violet-400/30">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-poppins text-[20px] font-[700] text-[#0a0a0a]">
              Settings
            </h1>
            <p className="text-[12px] text-gray-400 mt-0.5">
              Manage integrations, agents, email, and system preferences
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setRefreshing(true);
            setTimeout(() => setRefreshing(false), 700);
          }}
          className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition shadow-sm"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* ═══════════ SECTION 1 — CONNECTION ═══════════ */}
      <div className="mb-2">
        <p className="text-[11px] font-[700] uppercase tracking-widest text-gray-400 mb-3 px-1">
          Connection & Integration
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Configure CRM */}
        <SettingCard
          icon={Database}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          title="Configure CRM"
          desc="Connect & authorise your CRM via OAuth2 credentials"
          action={
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setActivePage("crm")}
                className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-[#0a0a0a] py-2 text-[12px] font-[600] text-white hover:bg-gray-800 transition"
              >
                <Link2 className="h-3.5 w-3.5" />
                {crmConnected ? "Manage CRM" : "+ Connect CRM"}
              </button>
              {crmConnected ? (
                <button
                  onClick={() => setCRM(false)}
                  className="w-full rounded-xl bg-red-500 py-2 text-[12px] font-[600] text-white hover:bg-red-600 transition flex items-center justify-center gap-1.5"
                >
                  <Link2Off className="h-3.5 w-3.5" />
                  Disconnect
                </button>
              ) : (
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                  <AlertCircle className="h-3 w-3 text-amber-400" />
                  Not connected
                </div>
              )}
            </div>
          }
        />

        {/* Leads */}
        <SettingCard
          icon={Users}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          title="Leads"
          desc="Manage lead lists and data sources for your campaigns"
          action={<GearBtn page="leads" />}
        />

        {/* Mappings */}
        <SettingCard
          icon={Map}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          title="Field Mappings"
          desc="Map CRM fields to internal system fields for data sync"
          action={<GearBtn page="mappings" />}
        />
      </div>

      {/* ═══════════ SECTION 2 — AI & AUTOMATION ═══════════ */}
      <div className="mb-2">
        <p className="text-[11px] font-[700] uppercase tracking-widest text-gray-400 mb-3 px-1">
          AI & Automation
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Agent */}
        <SettingCard
          icon={Zap}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          title="Agent"
          desc="Manage AI SDR agents, switching, and parallel call limits"
          action={<GearBtn page="agents" />}
        />
      </div>

      {/* ═══════════ SECTION 3 — EMAIL DELIVERY ═══════════ */}
      <div className="mb-2">
        <p className="text-[11px] font-[700] uppercase tracking-widest text-gray-400 mb-3 px-1">
          Email Delivery
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Email Sender Platform */}
        <SettingCard
          icon={Mail}
          iconBg="bg-sky-50"
          iconColor="text-sky-600"
          title="Email Sender Platform"
          desc="Choose whether email is sent via SMTP or your CRM"
          action={
            <div>
              <label className="block text-[11px] font-[600] text-gray-500 mb-1.5">
                Platform
              </label>
              <div className="relative">
                <select
                  value={emailPlatform}
                  onChange={(e) => setEP(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 pr-9 cursor-pointer"
                >
                  <option>SMTP</option>
                  <option>CRM</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              </div>
            </div>
          }
        />

        {/* Default SMTP Provider */}
        {emailPlatform === "SMTP" && (
          <SettingCard
            icon={Server}
            iconBg="bg-teal-50"
            iconColor="text-teal-600"
            title="Default SMTP Provider"
            desc="Select the active provider for outbound email delivery"
            action={
              <div>
                <label className="block text-[11px] font-[600] text-gray-500 mb-1.5">
                  Provider
                </label>
                <div className="relative">
                  <select
                    value={smtpProvider}
                    onChange={(e) => setSMTP(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 pr-9 cursor-pointer"
                  >
                    {["Mailgun", "SendGrid", "Amazon SES", "Postmark"].map(
                      (o) => (
                        <option key={o}>{o}</option>
                      ),
                    )}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                </div>
              </div>
            }
          />
        )}
        {/* SMTP Providers */}
        <SettingCard
          icon={Server}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          title="SMTP Providers Configuration"
          desc="Add, configure and test your SMTP delivery providers"
          action={<GearBtn page="smtp-providers" />}
        />
        {/* Email Templates */}
        <SettingCard
          icon={FileText}
          iconBg="bg-pink-50"
          iconColor="text-pink-600"
          title="Email Templates"
          desc="Create and manage reusable email templates for automation"
          action={<GearBtn page="email-templates" />}
        />

        {/* Graph Configuration */}
        <SettingCard
          icon={Shield}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          title="Graph Configuration"
          desc="Microsoft Graph API credentials for calendar and mail sync"
          action={<GearBtn page="graph-config" />}
        />
      </div>
    </main>
  );
}

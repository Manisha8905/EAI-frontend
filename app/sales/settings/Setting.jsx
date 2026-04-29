"use client";
import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import axiosInstance from "../../Redux/axiosInstance";
import EmailDeliverabilitySettings from "../EmailDeliverabilitySettings";
import { toast } from "react-toastify";
import {
  Pencil,
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
  Copy,
  Phone,
  MessageCircle,
  Linkedin,
  XCircle,
  Power,
  ShieldCheck,
  ShieldOff,
  FileDown,
  Check,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const appBaseUrl = typeof window !== "undefined" ? window.location.origin : "";

const absoluteApiBaseUrl = `${appBaseUrl}/backend`;

const isAdminRole = (role) => {
  const normalizedRole = String(role || "")
    .toUpperCase()
    .replace(/[\s_-]/g, "");
  return normalizedRole === "ADMIN" || normalizedRole === "SUPERADMIN";
};

const isSuperAdminRole = (role) => {
  return (
    String(role || "")
      .toUpperCase()
      .replace(/[\s_-]/g, "") === "SUPERADMIN"
  );
};

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
          onChange={(e) => onChange?.(e.target.value)}
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

function TextareaField({
  label,
  required,
  placeholder,
  value,
  onChange,
  hint,
}) {
  return (
    <div>
      <label className="block text-[12px] font-[600] text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-400/20 resize-vertical min-h-[80px]"
      />
      {hint && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
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
        className={`relative w-full ${width} bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-[15px] font-[700] text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════ DELETE CONFIRM MODAL ═══════════════════════ */
function DeleteConfirmModal({ label, onCancel, onConfirm, loading }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-[3px] w-full bg-gradient-to-r from-red-500 to-red-700" />
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 border border-red-100 text-red-500">
            <Trash2 className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h3 className="text-[14px] font-[700] text-gray-900">
              Confirm Delete
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              This action cannot be undone
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-5">
          <div className="flex items-start gap-2.5 px-3.5 py-3 bg-red-50 border border-red-100 rounded-xl">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-[12px] text-red-700 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-[700]">&quot;{label}&quot;</span>? This
              action is <span className="font-[700]">irreversible</span>.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-gray-100 bg-gray-50/60">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-[12px] font-[500] text-gray-600 border border-gray-200 rounded-lg bg-white hover:border-gray-300 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-[600] text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700 transition shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            {loading ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ PAGE HEADER ═══════════════════════ */
function PageHeader({ title, subtitle, onBack, action }) {
  return (
    <div className="flex items-start justify-between mb-2 flex-wrap gap-3">
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
// const OAUTH_REDIRECT_URI = "https://ai-sdr-campaign-management-elevenlabs-1.technologymindz.com/oauth/callback";
const OAUTH_REDIRECT_URI = `${appBaseUrl}/oauth/callback`;

function CRMPage({ onBack, onConnectionChange }) {
  const [form, setForm] = useState({
    clientId: "",
    clientSecret: "",
    authUrl: "",
    tokenUrl: "https://test.salesforce.com/services/oauth2/token",
  });
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [connecting, setConn] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connError, setConnError] = useState("");

  /* ── OAuth status — no loading spinner; fetched silently in background ── */
  const [isOAuthConnected, setIsOAuthConnected] = useState(false);
  const [oauthInfo, setOauthInfo] = useState(null);
  const [disconnecting, setDisconnecting] = useState(false);

  /* Fetch /oauth/status silently on mount (no popup, no spinner) */
  useEffect(() => {
    axiosInstance
      .get("/oauth/status")
      .then((res) => {
        const d = res.data;
        const isConn =
          d?.has_credentials === true &&
          d?.has_tokens === true &&
          d?.token_expired !== true;
        setIsOAuthConnected(isConn);
        setOauthInfo(d);
        onConnectionChange?.(isConn);
      })
      .catch(() => {
        setIsOAuthConnected(false);
        onConnectionChange?.(false);
      });
  }, []);

  /* Disconnect — DELETE /oauth/tokens, then verify via GET /oauth/status */
  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await axiosInstance.delete("/oauth/tokens");
      // Verify disconnect succeeded
      try {
        const res = await axiosInstance.get("/oauth/status");
        const d = res.data;
        const stillConn =
          d?.has_credentials === true &&
          d?.has_tokens === true &&
          d?.token_expired !== true;
        setIsOAuthConnected(stillConn);
        setOauthInfo(stillConn ? d : null);
        onConnectionChange?.(!stillConn ? false : true);
        if (!stillConn) toast.success("CRM disconnected successfully.");
        else
          toast.error("Disconnect may not have completed. Please try again.");
      } catch {
        setIsOAuthConnected(false);
        setOauthInfo(null);
        onConnectionChange?.(false);
        toast.success("CRM disconnected successfully.");
      }
    } catch (err) {
      toast.error(getApiError(err) || "Failed to disconnect CRM.");
    } finally {
      setDisconnecting(false);
    }
  };

  const set = (k) => (input) =>
    setForm((f) => ({
      ...f,
      [k]: input?.target?.value ?? input ?? "",
    }));

  /* Build full_oauth_url → POST all 5 fields to /auth_cred → check status → redirect if needed */
  const handleSave = async (e) => {
    e.preventDefault();
    const userEmail =
      (typeof window !== "undefined"
        ? localStorage.getItem("userEmail")
        : "") || "";
    const fullOauthUrl =
      `${form.authUrl}?response_type=code` +
      `&client_id=${encodeURIComponent(form.clientId)}` +
      `&redirect_uri=${encodeURIComponent(OAUTH_REDIRECT_URI)}` +
      (userEmail ? `&state=${encodeURIComponent(userEmail)}` : "");
    setGeneratedUrl(fullOauthUrl);
    setConn(true);
    setConnError("");
    try {
      await axiosInstance.post("/auth_cred", {
        client_id: form.clientId,
        client_secret: form.clientSecret,
        authorize_url: form.authUrl,
        token_url: form.tokenUrl,
        full_oauth_url: fullOauthUrl,
      });
      // Check if backend already completed the connection
      try {
        const statusRes = await axiosInstance.get("/oauth/status");
        const d = statusRes.data;
        const isConn =
          d?.has_credentials === true &&
          d?.has_tokens === true &&
          d?.token_expired !== true;
        if (isConn) {
          setIsOAuthConnected(true);
          setOauthInfo(d);
          setConnected(true);
          onConnectionChange?.(true);
          return; // already connected — no redirect needed
        }
      } catch {
        /* status check failed — proceed with OAuth redirect */
      }
      // Not connected yet — redirect browser to Salesforce OAuth
      setConnected(true);
      window.location.href = fullOauthUrl;
    } catch (err) {
      setConnError(
        getApiError(err) || "Failed to connect. Please check your credentials.",
      );
    } finally {
      setConn(false);
    }
  };

  /* Copy generated URL to clipboard */
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            {/* Header banner */}
            <div className="relative bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 px-7 py-6 overflow-hidden">
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />
              <div className="absolute right-24 bottom-0 h-24 w-24 rounded-full bg-white/10 pointer-events-none" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-[700] text-white">
                      OAuth 2.0 Configuration
                    </h3>
                    <p className="text-[12px] text-indigo-200 mt-0.5">
                      Secure handshake — credentials are AES-256 encrypted at
                      rest
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Already Connected ── */}
            {isOAuthConnected && (
              <div className="p-7 space-y-5">
                <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-2xl">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-[700] text-green-800">
                      CRM Connected
                    </p>
                    <p className="text-[12px] text-green-600 mt-0.5">
                      {oauthInfo?.message ||
                        "Your CRM is successfully connected via OAuth 2.0."}
                    </p>
                    {oauthInfo?.instance_url && (
                      <p className="text-[11px] text-green-700 font-mono mt-1 truncate">
                        {oauthInfo.instance_url}
                      </p>
                    )}
                    {oauthInfo?.token_expires_at && (
                      <p className="text-[10px] text-green-500 mt-1">
                        Token expires:{" "}
                        {new Date(oauthInfo.token_expires_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                </div>

                <div className="rounded-xl border border-red-100 bg-red-50/60 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[12px] font-[700] text-red-700 mb-0.5">
                        Disconnect CRM
                      </p>
                      <p className="text-[11px] text-red-600 leading-relaxed">
                        This will revoke the OAuth tokens and disconnect your
                        CRM. You will need to re-authenticate to reconnect.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      disabled={disconnecting}
                      className="action-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-[600] text-white bg-red-600 hover:bg-red-700 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {disconnecting ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Disconnecting…
                        </>
                      ) : (
                        <>
                          <Link2Off className="h-4 w-4" />
                          Disconnect CRM
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Credential form (only when not connected) ── */}
            {!isOAuthConnected && (
              <form onSubmit={handleSave} className="p-7 space-y-5">
                <p className="text-[12px] font-[600] text-gray-500 uppercase tracking-wider">
                  Enter your CRM credentials
                </p>
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
                {connError && (
                  <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {connError}
                  </p>
                )}

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={connecting}
                    className={`action-btn w-full rounded-xl py-3.5 text-[14px] font-[600] text-white flex items-center justify-center gap-2 shadow-lg
                      ${
                        connected
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
                    ) : connected ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Connected Successfully!
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4" />
                        Save &amp; Connect
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div
            className={`info-card rounded-2xl border p-5 ${
              isOAuthConnected || connected
                ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
                : "border-gray-100 bg-white shadow-sm"
            }`}
          >
            <p className="text-[11px] font-[700] uppercase tracking-widest text-gray-400 mb-3">
              Connection Status
            </p>
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isOAuthConnected || connected ? "bg-green-100" : "bg-amber-50"}`}
              >
                {isOAuthConnected || connected ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <div>
                <span
                  className={`block text-[14px] font-[700] ${isOAuthConnected || connected ? "text-green-700" : "text-amber-700"}`}
                >
                  {isOAuthConnected || connected
                    ? "Connected"
                    : "Not Connected"}
                </span>
                <span className="text-[11px] text-gray-400">
                  {isOAuthConnected || connected
                    ? "CRM sync active"
                    : "Configure & connect"}
                </span>
              </div>
            </div>
            {(isOAuthConnected || connected) && (
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-green-600">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Live data sync enabled
              </div>
            )}
          </div>

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

/* ── Agent toggle — defined outside AgentsPage so React.memo prevents sibling re-renders ── */
const AgentToggle = memo(function AgentToggle({
  agentId,
  agentName,
  isOn,
  onToggle,
  onRefresh,
  onDelete,
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (onToggle) {
        await onToggle(agentId, isOn);
      } else {
        await axiosInstance.post("/switch-agent", { agent_ids: [agentId] });
        toast.success("Agent switched successfully.");
        await onRefresh();
      }
    } catch (err) {
      toast.error(getApiError(err) || "Failed to switch agent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={isOn}
        onClick={handleClick}
        disabled={loading}
        title={isOn ? "Active agent" : "Click to activate this agent"}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-60 ${
          isOn
            ? "bg-green-500 cursor-pointer"
            : loading
              ? "bg-indigo-400 cursor-wait"
              : "bg-gray-300 hover:bg-indigo-500 cursor-pointer"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
            isOn ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span
        className={`text-[11px] font-[600] w-16 ${isOn ? "text-green-600" : loading ? "text-indigo-500" : "text-gray-400"}`}
      >
        {isOn ? "Active" : loading ? "Switching…" : "Inactive"}
      </span>
      <button
        onClick={() => onDelete({ id: agentId, name: agentName })}
        className="rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5 text-[12px] text-red-600 hover:bg-red-100 transition"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
});

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
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const selectedOverrideRef = useRef(null);

  // Ref keeps handleRefresh stable while always calling the latest fetchAgents
  const fetchAgentsRef = useRef(null);

  const fetchAgents = async () => {
    setLoadingAgents(true);
    setFetchError("");
    try {
      const res = await axiosInstance.get("/my-agents");
      const list = Array.isArray(res.data) ? res.data : (res.data.agents ?? []);
      const normalized = list.map((a) => ({
        id: a.agent_id ?? a.id ?? a._id ?? Math.random(),
        name: a.agent_name ?? a.name ?? "—",
        username: a.username ?? "—",
        created_at: a.created_at ?? "—",
        created_at_display: a.created_at
          ? new Date(a.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "—",
        is_active: a.is_active ?? false,
        is_current: a.is_current ?? false,
      }));
      setAgents(normalized);
      // If we have a fresh override from switch-agent response, use that instead of is_current
      if (selectedOverrideRef.current) {
        setSelectedIds(selectedOverrideRef.current);
        selectedOverrideRef.current = null;
      } else {
        setSelectedIds(
          new Set(
            normalized
              .filter((a) => a.is_current || a.is_active)
              .map((a) => a.id),
          ),
        );
      }
    } catch (err) {
      setFetchError(
        err?.response?.data?.detail ||
          getApiError(err) ||
          "Failed to load agents.",
      );
    } finally {
      setLoadingAgents(false);
    }
  };

  // Keep ref up-to-date every render so handleRefresh never captures a stale closure
  useEffect(() => {
    fetchAgentsRef.current = fetchAgents;
  });

  // Stable callback passed to AgentToggle — no parent-state change during loading
  const handleRefresh = useCallback(async () => {
    if (fetchAgentsRef.current) await fetchAgentsRef.current();
  }, []);

  // Toggle a single agent: add/remove from selected set, send full array
  const handleToggleRef = useRef(null);
  handleToggleRef.current = async (agentId, isCurrentlyOn) => {
    const newSelected = new Set(selectedIds);
    if (isCurrentlyOn) {
      newSelected.delete(agentId);
    } else {
      newSelected.add(agentId);
    }
    const res = await axiosInstance.post("/switch-agent", {
      agent_ids: Array.from(newSelected),
    });
    const data = res?.data;
    const freshIds = data?.selected_agent_ids?.length
      ? new Set(data.selected_agent_ids)
      : newSelected;
    setSelectedIds(freshIds);
    selectedOverrideRef.current = freshIds;
    toast.success(data?.message || "Agent switched successfully.");
    await fetchAgents();
  };
  const handleToggle = useCallback(async (agentId, isCurrentlyOn) => {
    if (handleToggleRef.current)
      await handleToggleRef.current(agentId, isCurrentlyOn);
  }, []);

  const fetchParallelCalls = async () => {
    setPcLoading(true);
    try {
      const res = await axiosInstance.get(
        "/api/settings/global-parallel-calls",
      );
      const val =
        res.data?.global_parallel_calls ??
        res.data?.value ??
        res.data?.parallel_calls ??
        0;
      setPC(Number(val));
    } catch {
      // silently ignore — keep default 0
    } finally {
      setPcLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    fetchParallelCalls();
  }, []);

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.created_at !== "—" &&
        a.created_at.toLowerCase().includes(search.toLowerCase())),
  );

  const allChecked =
    filtered.length > 0 && filtered.every((a) => checkedIds.has(a.id));

  const toggleCheckAll = () => {
    if (allChecked) setCheckedIds(new Set());
    else setCheckedIds(new Set(filtered.map((a) => a.id)));
  };

  const toggleCheck = (id) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkAction = async (action) => {
    const ids = Array.from(checkedIds);
    if (!ids.length) return;
    setBulkBusy(true);
    try {
      if (action === "delete") {
        for (const id of ids) {
          await axiosInstance.delete(`/delete-agent/${encodeURIComponent(id)}`);
        }
        toast.success(`${ids.length} agent(s) deleted.`);
      } else {
        const currentSelected = new Set(selectedIds);
        if (action === "activate") {
          ids.forEach((id) => currentSelected.add(id));
        } else {
          ids.forEach((id) => currentSelected.delete(id));
        }
        const res = await axiosInstance.post("/switch-agent", {
          agent_ids: Array.from(currentSelected),
        });
        const data = res?.data;
        const freshIds = data?.selected_agent_ids?.length
          ? new Set(data.selected_agent_ids)
          : currentSelected;
        setSelectedIds(freshIds);
        selectedOverrideRef.current = freshIds;
        toast.success(
          data?.message ||
            `${ids.length} agent(s) ${action === "activate" ? "activated" : "deactivated"}.`,
        );
      }
      setCheckedIds(new Set());
      await fetchAgents();
    } catch (err) {
      toast.error(getApiError(err) || "Bulk action failed.");
    } finally {
      setBulkBusy(false);
    }
  };

  const [busyRowId, setBusyRowId] = useState(null);

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
        getApiError(err) || "Failed to create agent. Please try again.",
      );
    } finally {
      setCreating(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingAgentId, setDeletingAgentId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [editAgentTarget, setEditAgentTarget] = useState(null);
  const [editAgentName, setEditAgentName] = useState("");
  const [editingAgent, setEditingAgent] = useState(false);
  const [editAgentError, setEditAgentError] = useState("");

  const deleteAgent = async (agent) => {
    if (!agent?.id) return;
    setDeletingAgentId(agent.id);
    setDeleteError("");
    try {
      await axiosInstance.delete(
        `/delete-agent/${encodeURIComponent(agent.id)}`,
      );
      toast.success(`Agent "${agent.name}" deleted successfully.`);
      await fetchAgents();
    } catch (err) {
      const msg =
        getApiError(err) ||
        err?.response?.data?.detail ||
        "Failed to delete agent.";
      setDeleteError(msg);
      toast.error(msg);
    } finally {
      setDeletingAgentId(null);
      setDeleteTarget(null);
    }
  };

  const handleEditAgent = async () => {
    if (!editAgentTarget?.id || !editAgentName.trim()) return;
    setEditingAgent(true);
    setEditAgentError("");
    try {
      await axiosInstance.put(
        `/agents/${encodeURIComponent(editAgentTarget.id)}`,
        {
          agent_name: editAgentName.trim(),
        },
      );
      toast.success(`Agent renamed to "${editAgentName.trim()}" successfully.`);
      setEditAgentTarget(null);
      await fetchAgents();
    } catch (err) {
      const msg =
        getApiError(err) ||
        err?.response?.data?.detail ||
        "Failed to update agent.";
      setEditAgentError(msg);
      toast.error(msg);
    } finally {
      setEditingAgent(false);
    }
  };

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
        getApiError(err) ||
          err?.response?.data?.detail ||
          "Failed to save. Please try again.",
      );
    } finally {
      setPcSaving(false);
    }
  };

  // Smartlead Integration state
  const [smartleadApiKey, setSmartleadApiKey] = useState("");
  const [smartleadLoading, setSmartleadLoading] = useState(false);
  const [smartleadSaved, setSmartleadSaved] = useState(false);
  const [smartleadError, setSmartleadError] = useState("");

  return (
    <div>
      <PageHeader
        title="Agents"
        subtitle="Manage AI SDR agents and parallel call settings"
        onBack={onBack}
        action={
          <button
            onClick={handleRefresh}
            disabled={loadingAgents}
            className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition shadow-sm"
            title="Refresh"
          >
            <RefreshCw
              className={`h-4 w-4 ${loadingAgents ? "animate-spin" : ""}`}
            />
          </button>
        }
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
          <p className="mt-2 text-[12px] text-red-500 font-[500]">
            {createError}
          </p>
        )}
      </div>

      {/* Selected Agents Indicator */}
      {selectedIds.size > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 shadow-sm px-5 py-3.5 mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-[13px] font-[700] text-emerald-800">
                {selectedIds.size} Active Agent
                {selectedIds.size !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {agents
                .filter((a) => selectedIds.has(a.id))
                .map((a) => (
                  <span
                    key={a.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-[600] border border-emerald-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {a.name}
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {checkedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto", marginBottom: 16 }}
            exit={{ opacity: 0, y: -10, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-50 via-white to-blue-50 rounded-2xl border border-blue-200 shadow-sm px-5 py-3.5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <span className="text-[14px] font-[700] text-blue-800">
                    {checkedIds.size}
                  </span>
                  <span className="text-[12px] font-[500] text-blue-600 ml-1">
                    agent{checkedIds.size !== 1 ? "s" : ""} selected
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={bulkBusy}
                  onClick={() => handleBulkAction("activate")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-[12px] font-[600] hover:bg-emerald-600 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkBusy ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-3.5 w-3.5" />
                  )}
                  Activate
                </button>
                <button
                  type="button"
                  disabled={bulkBusy}
                  onClick={() => handleBulkAction("deactivate")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-white text-[12px] font-[600] hover:bg-amber-600 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkBusy ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ShieldOff className="h-3.5 w-3.5" />
                  )}
                  Deactivate
                </button>
                {/* <button
                  type="button"
                  disabled={bulkBusy}
                  onClick={() => handleBulkAction("delete")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 text-white text-[12px] font-[600] hover:bg-red-600 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkBusy ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  Delete
                </button> */}
                <button
                  type="button"
                  onClick={() => setCheckedIds(new Set())}
                  className="ml-1 p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                  title="Clear selection"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agents table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleCheckAll}
              className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-150 ${
                allChecked
                  ? "bg-blue-600 border-blue-600"
                  : checkedIds.size > 0
                    ? "bg-blue-100 border-blue-400"
                    : "border-gray-300 hover:border-blue-400"
              }`}
            >
              {allChecked ? (
                <svg
                  className="h-3 w-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : checkedIds.size > 0 ? (
                <span className="block h-0.5 w-2.5 rounded bg-blue-500" />
              ) : null}
            </button>
            <span className="text-[13px] font-[600] text-gray-900">
              Agent List
            </span>
            {checkedIds.size > 0 && (
              <span className="text-[11px] font-[500] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {checkedIds.size} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loadingAgents}
              className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition"
              title="Refresh"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loadingAgents ? "animate-spin" : ""}`}
              />
            </button>
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
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-5 py-3 w-10">
                <span className="sr-only">Select</span>
              </th>
              {["Agent Name", "User Name", "Date", "Status", "Action"].map(
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
            {loadingAgents ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-[13px] text-gray-400"
                >
                  Loading agents…
                </td>
              </tr>
            ) : fetchError ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-[13px] text-red-500"
                >
                  {fetchError}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-[13px] text-gray-400"
                >
                  No agents found
                </td>
              </tr>
            ) : (
              filtered.map((a, i) => {
                const checked = checkedIds.has(a.id);
                const isActive = selectedIds.has(a.id);
                const rowBusy = busyRowId === a.id;
                return (
                  <tr
                    key={a.id}
                    className={`border-b border-gray-50 transition-all duration-150 ${
                      checked
                        ? "bg-blue-50/70 border-l-2 border-l-blue-500"
                        : i % 2 !== 0
                          ? "bg-gray-50/30"
                          : ""
                    } hover:bg-gray-50/70`}
                  >
                    <td className="px-5 py-3.5 w-10">
                      <button
                        type="button"
                        onClick={() => toggleCheck(a.id)}
                        className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-150 ${
                          checked
                            ? "bg-blue-600 border-blue-600 shadow-sm"
                            : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                        }`}
                      >
                        {checked && (
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-[12px] font-[700] ${
                            isActive
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : "bg-gray-100 text-gray-500 border border-gray-200"
                          }`}
                        >
                          {a.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-[500] text-gray-900">
                            {a.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-500">
                      {a.username}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-500">
                      {a.created_at_display}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-[600] border ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        }`}
                      >
                        {isActive ? (
                          <ShieldCheck className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <ShieldOff className="h-3 w-3 text-gray-400" />
                        )}
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditAgentTarget({ id: a.id, name: a.name });
                            setEditAgentName(a.name);
                            setEditAgentError("");
                          }}
                          className="rounded-xl border border-blue-100 bg-blue-50 p-2 text-blue-500 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-200 hover:shadow-md"
                          title="Edit agent name"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({ id: a.id, name: a.name })
                          }
                          className="rounded-xl border border-red-100 bg-red-50 p-2 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 hover:shadow-md"
                          title="Delete agent"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-gray-100 text-[12px] text-gray-400">
          {agents.length} agent{agents.length !== 1 ? "s" : ""} total
        </div>
      </div>

      {/* Global Parallel Calls (TM Own Solution) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 max-w-md mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
            <Zap className="h-4 w-4 text-violet-600" />
          </div>
          <div>
            <p className="text-[13px] font-[600] text-gray-900">
              TM Own Solution
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
            disabled={pcLoading}
            className="w-24 rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[14px] font-[600] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 text-center disabled:opacity-50"
          />
          <button
            onClick={savePC}
            disabled={pcSaving || pcLoading}
            className="rounded-xl bg-[#0a0a0a] px-5 py-2.5 text-[13px] font-[600] text-white hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {pcSaving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
            {pcLoading
              ? "Loading…"
              : pcSaving
                ? "Saving…"
                : pcSaved
                  ? "✓ Saved!"
                  : "Submit"}
          </button>
        </div>
        {pcError && (
          <p className="mt-2 text-[12px] text-red-500 font-[500]">{pcError}</p>
        )}
      </div>

      {/* Smartlead Integration Card (below TM Own Solution) */}
      {/* <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-5 max-w-md mb-6">
        <h3 className="text-[13px] font-[700] text-green-700 mb-3 flex items-center gap-2">
          <Key className="h-4 w-4" /> Smartlead Integration
        </h3>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setSmartleadLoading(true);
            setSmartleadError("");
            try {
              await axiosInstance.put(
                "/api/deliverability/smartlead/settings",
                { smartlead_api_key: smartleadApiKey }
              );
              toast.success("Smartlead API key saved successfully!");
              setSmartleadSaved(true);
              setTimeout(() => setSmartleadSaved(false), 2500);
            } catch (err) {
              setSmartleadError(
                getApiError(err) ||
                  err?.response?.data?.detail ||
                  "Failed to save Smartlead API key."
              );
              toast.error(
                getApiError(err) ||
                  err?.response?.data?.detail ||
                  "Failed to save Smartlead API key."
              );
            } finally {
              setSmartleadLoading(false);
            }
          }}
        >
          <input
            type="text"
            placeholder="Smartlead API Key"
            value={smartleadApiKey}
            onChange={(e) => setSmartleadApiKey(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[14px] font-[600] text-gray-800 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 mb-3"
            required
          />
          <button
            type="submit"
            disabled={smartleadLoading}
            className="rounded-xl bg-green-600 px-5 py-2.5 text-[13px] font-[600] text-white hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {smartleadLoading ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : smartleadSaved ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Key className="h-3.5 w-3.5" />
            )}
            {smartleadLoading
              ? "Saving…"
              : smartleadSaved
                ? "✓ Saved!"
                : "Save API Key"}
          </button>
          {smartleadError && (
            <p className="mt-2 text-[12px] text-red-500 font-[500]">{smartleadError}</p>
          )}
        </form>
      </div> */}
      {deleteTarget && (
        <DeleteConfirmModal
          label={deleteTarget.name}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => deleteAgent(deleteTarget)}
          loading={deletingAgentId === deleteTarget.id}
        />
      )}
      {deleteError && (
        <p className="mt-2 text-[12px] text-red-500 font-[500]">
          {deleteError}
        </p>
      )}
      {editAgentTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setEditAgentTarget(null)}
        >
          <div
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-[3px] w-full bg-gradient-to-r from-blue-500 to-violet-600" />
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                  <Pencil className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-[14px] font-[700] text-gray-900">
                  Edit Agent Name
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditAgentTarget(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-5 space-y-4">
              <div>
                <label className="block text-[11px] font-[600] text-gray-600 mb-1.5">
                  Agent Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={editAgentName}
                  onChange={(e) => setEditAgentName(e.target.value)}
                  placeholder="Enter new agent name"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                  onKeyDown={(e) => e.key === "Enter" && handleEditAgent()}
                />
              </div>
              {editAgentError && (
                <p className="text-[12px] text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {editAgentError}
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-gray-100 bg-gray-50/60">
              <button
                type="button"
                onClick={() => setEditAgentTarget(null)}
                className="px-4 py-2 text-[12px] font-[500] text-gray-600 border border-gray-200 rounded-lg bg-white hover:border-gray-300 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditAgent}
                disabled={editingAgent || !editAgentName.trim()}
                className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-[600] text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingAgent ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Pencil className="h-3.5 w-3.5" />
                )}
                {editingAgent ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── User Management ── */
const ROLE_OPTIONS = [
  { label: "Manager", value: "MANAGER", color: "amber" },
  { label: "Admin", value: "ADMIN", color: "blue" },
  { label: "Sales", value: "SALES", color: "violet" },
  { label: "Finance", value: "FINANCE", color: "green" },
  { label: "Customer Support", value: "SUPPORT", color: "gray" },
];

const ROLE_STYLES = {
  MANAGER: "bg-amber-50 text-amber-700 border-amber-200",
  ADMIN: "bg-blue-50 text-blue-700 border-blue-200",
  SALES: "bg-violet-50 text-violet-700 border-violet-200",
  FINANCE: "bg-green-50 text-green-700 border-green-200",
  SUPPORT: "bg-gray-100 text-gray-600 border-gray-200",
};

function UsersPage({ onBack, isSuperAdmin }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  // Pagination
  const USERS_PER_PAGE = 8;
  const [userPage, setUserPage] = useState(1);

  // Add user form
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [addErrors, setAddErrors] = useState({});
  const [creating, setCreating] = useState(false);

  // Edit user
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [editErrors, setEditErrors] = useState({});
  const [editing, setEditing] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Metrics (superadmin only)
  const [metricsSending, setMetricsSending] = useState(false);
  const [metricsSent, setMetricsSent] = useState(false);

  const handleSendMetrics = async () => {
    const selectedEmails = users
      .filter((u) => checkedIds.has(u.id))
      .map((u) => u.email);
    if (!selectedEmails.length) return;
    setMetricsSending(true);
    setMetricsSent(false);
    try {
      await axiosInstance.post("/api/superadmin/metrics", {
        emails: selectedEmails,
      });
      toast.success(`Metrics sent for ${selectedEmails.length} user(s).`);
      setMetricsSent(true);
    } catch (err) {
      toast.error(
        getApiError(err) ||
          err?.response?.data?.detail ||
          "Failed to send metrics.",
      );
    } finally {
      setMetricsSending(false);
    }
  };

  const handleUnselectUser = async (userId) => {
    const newChecked = new Set(checkedIds);
    newChecked.delete(userId);
    setCheckedIds(newChecked);
    setMetricsSent(false);
    if (newChecked.size > 0) {
      const remainingEmails = users
        .filter((u) => newChecked.has(u.id))
        .map((u) => u.email);
      try {
        await axiosInstance.post("/api/superadmin/metrics", {
          emails: remainingEmails,
        });
        toast.success(`Updated selection: ${remainingEmails.length} user(s).`);
      } catch (err) {
        toast.error(
          getApiError(err) ||
            err?.response?.data?.detail ||
            "Failed to update selection.",
        );
      }
    }
  };

  // Per-row Select / Unselect — same pattern as agent activate/deactivate
  const [busyRowId, setBusyRowId] = useState(null);

  const handleToggleUser = async (user, isCurrentlySelected) => {
    if (busyRowId === user.id) return;
    setBusyRowId(user.id);
    setMetricsSent(false);
    try {
      const newChecked = new Set(checkedIds);
      if (isCurrentlySelected) {
        newChecked.delete(user.id);
      } else {
        newChecked.add(user.id);
      }
      setCheckedIds(newChecked);
      const emails = users
        .filter((u) => newChecked.has(u.id))
        .map((u) => u.email);
      await axiosInstance.post("/api/superadmin/metrics", { emails });
      toast.success(
        isCurrentlySelected
          ? `${user.username} unselected.`
          : `${user.username} selected.`,
      );
      if (!isCurrentlySelected) setMetricsSent(true);
    } catch (err) {
      // Rollback on failure
      setCheckedIds((prev) => {
        const rollback = new Set(prev);
        isCurrentlySelected ? rollback.add(user.id) : rollback.delete(user.id);
        return rollback;
      });
      toast.error(
        getApiError(err) || err?.response?.data?.detail || "Failed to update.",
      );
    } finally {
      setBusyRowId(null);
    }
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/users");
      const list = Array.isArray(res.data)
        ? res.data
        : (res.data?.users ?? res.data?.data ?? []);
      const mapped = list.map((u) => ({
        id: u.id ?? u.user_id ?? u._id,
        username: u.username ?? u.name ?? "—",
        email: u.email ?? u.email_address ?? "—",
        role: (u.role ?? "").toUpperCase(),
        created_at: u.created_at ?? "",
        created_at_display: u.created_at
          ? new Date(u.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "—",
        is_selected: !!(u.is_selected ?? u.selected ?? false),
      }));
      setUsers(mapped);
      // Restore previously selected users from the API response field
      const preSelected = new Set(
        list
          .filter((u) => u.is_selected || u.selected || u.is_active)
          .map((u) => u.id ?? u.user_id ?? u._id),
      );
      if (preSelected.size > 0) setCheckedIds(preSelected);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset to page 1 whenever search or role filter changes
  useEffect(() => {
    setUserPage(1);
  }, [search, roleFilter]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const allChecked =
    filtered.length > 0 && filtered.every((u) => checkedIds.has(u.id));

  // Pagination derived values
  const totalUserPages = Math.max(
    1,
    Math.ceil(filtered.length / USERS_PER_PAGE),
  );
  const safeUserPage = Math.min(userPage, totalUserPages);
  const pageStart = (safeUserPage - 1) * USERS_PER_PAGE;
  const pageUsers = filtered.slice(pageStart, pageStart + USERS_PER_PAGE);
  const goToUserPage = (p) =>
    setUserPage(Math.max(1, Math.min(totalUserPages, p)));
  const userPageNums = Array.from(
    { length: totalUserPages },
    (_, i) => i + 1,
  ).filter(
    (p) => p === 1 || p === totalUserPages || Math.abs(p - safeUserPage) <= 1,
  );

  const toggleCheckAll = () => {
    setMetricsSent(false);
    if (allChecked) setCheckedIds(new Set());
    else setCheckedIds(new Set(filtered.map((u) => u.id)));
  };
  const toggleCheck = (id) => {
    setMetricsSent(false);
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    const ids = Array.from(checkedIds);
    if (!ids.length) return;
    setBulkBusy(true);
    try {
      const targets = users.filter((u) => checkedIds.has(u.id));
      for (const u of targets) {
        await axiosInstance.delete(
          `/admin/users/purge?target_email=${encodeURIComponent(u.email)}`,
        );
      }
      toast.success(`${ids.length} user(s) deleted.`);
      setCheckedIds(new Set());
      await fetchUsers();
    } catch (err) {
      toast.error(getApiError(err) || "Bulk delete failed.");
    } finally {
      setBulkBusy(false);
    }
  };

  // Create user
  const validateAdd = () => {
    const e = {};
    if (!addForm.name.trim()) e.name = "Required";
    if (!addForm.email.trim()) e.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(addForm.email)) e.email = "Invalid email";
    if (!addForm.password || addForm.password.length < 6)
      e.password = "Min 6 chars";
    if (!addForm.role) e.role = "Select a role";
    setAddErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validateAdd()) return;
    setCreating(true);
    try {
      const params = new URLSearchParams();
      params.append("username", addForm.name.trim());
      params.append("email", addForm.email.trim());
      params.append("password", addForm.password);
      params.append("role", addForm.role);
      await axiosInstance.post("/register", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      toast.success("User created.");
      setShowAdd(false);
      setAddForm({ name: "", email: "", password: "", role: "" });
      setAddErrors({});
      await fetchUsers();
    } catch (err) {
      toast.error(
        getApiError(err) ||
          err?.response?.data?.detail ||
          "Failed to create user.",
      );
    } finally {
      setCreating(false);
    }
  };

  // Edit user
  const openEdit = (user) => {
    setEditTarget(user);
    setEditForm({
      name: user.username,
      email: user.email,
      password: "",
      role: user.role,
    });
    setEditErrors({});
  };

  const validateEdit = () => {
    const e = {};
    if (!editForm.name.trim()) e.name = "Required";
    if (!editForm.email.trim()) e.email = "Required";
    if (editForm.password && editForm.password.length < 6)
      e.password = "Min 6 chars";
    if (!editForm.role) e.role = "Select a role";
    setEditErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleEdit = async () => {
    if (!validateEdit()) return;
    setEditing(true);
    try {
      const params = new URLSearchParams();
      params.append("user_id", editTarget.id);
      params.append("username", editForm.name.trim());
      params.append("email", editForm.email.trim());
      params.append("role", editForm.role);
      if (editForm.password) params.append("password", editForm.password);
      await axiosInstance.put(`/admin/users/update?${params.toString()}`);
      toast.success("User updated.");
      setEditTarget(null);
      await fetchUsers();
    } catch (err) {
      toast.error(getApiError(err) || "Failed to update user.");
    } finally {
      setEditing(false);
    }
  };

  // Delete single user
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(
        `/admin/users/purge?target_email=${encodeURIComponent(deleteTarget.email)}`,
      );
      toast.success(`User "${deleteTarget.username}" deleted.`);
      setDeleteTarget(null);
      await fetchUsers();
    } catch (err) {
      toast.error(getApiError(err) || "Failed to delete user.");
    } finally {
      setDeleting(false);
    }
  };

  const RoleSelector = ({ value, onChange, error }) => (
    <div>
      <label className="block text-[11px] font-[600] text-gray-500 mb-1.5">
        Role
      </label>
      <div className="flex flex-wrap gap-1.5">
        {ROLE_OPTIONS.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => onChange(r.value)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-[600] border transition-all duration-150 ${
              value === r.value
                ? ROLE_STYLES[r.value] +
                  " ring-2 ring-offset-1 ring-current shadow-sm"
                : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Manage users, roles, and permissions"
        onBack={onBack}
      />

      {/* Add User Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-[600] text-gray-500 uppercase tracking-wider">
            {showAdd ? "New User" : "Users"}
          </p>
          <button
            type="button"
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-[600] transition shadow-sm bg-[#0a0a0a] text-white hover:bg-gray-800"
          >
            {showAdd ? (
              <X className="h-3.5 w-3.5" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            {showAdd ? "Cancel" : "Add User"}
          </button>
        </div>
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[11px] font-[600] text-gray-500 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={addForm.name}
                    onChange={(e) =>
                      setAddForm({ ...addForm, name: e.target.value })
                    }
                    placeholder="Full name"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
                  />
                  {addErrors.name && (
                    <p className="mt-1 text-[11px] text-red-500">
                      {addErrors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-[600] text-gray-500 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={addForm.email}
                    onChange={(e) =>
                      setAddForm({ ...addForm, email: e.target.value })
                    }
                    placeholder="user@company.com"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
                  />
                  {addErrors.email && (
                    <p className="mt-1 text-[11px] text-red-500">
                      {addErrors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-[600] text-gray-500 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={addForm.password}
                    onChange={(e) =>
                      setAddForm({ ...addForm, password: e.target.value })
                    }
                    placeholder="Min 6 characters"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
                  />
                  {addErrors.password && (
                    <p className="mt-1 text-[11px] text-red-500">
                      {addErrors.password}
                    </p>
                  )}
                </div>
                <RoleSelector
                  value={addForm.role}
                  onChange={(r) => setAddForm({ ...addForm, role: r })}
                  error={addErrors.role}
                />
              </div>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="rounded-xl bg-[#0a0a0a] px-5 py-2.5 text-[13px] font-[600] text-white hover:bg-gray-800 transition shadow-sm flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                {creating ? "Creating…" : "Create User"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Users Indicator */}
      <AnimatePresence>
        {checkedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto", marginBottom: 16 }}
            exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div
              className={`rounded-2xl border shadow-sm px-5 py-3.5 ${
                metricsSent
                  ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200"
                  : "bg-gradient-to-r from-violet-50 to-blue-50 border-violet-200"
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${metricsSent ? "bg-emerald-100" : "bg-violet-100"}`}
                    >
                      {metricsSent ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Users className="h-4 w-4 text-violet-600" />
                      )}
                    </div>
                    <div>
                      <span
                        className={`text-[14px] font-[700] ${metricsSent ? "text-emerald-800" : "text-violet-800"}`}
                      >
                        {checkedIds.size}
                      </span>
                      <span
                        className={`text-[12px] font-[500] ml-1 ${metricsSent ? "text-emerald-600" : "text-violet-600"}`}
                      >
                        user{checkedIds.size !== 1 ? "s" : ""}{" "}
                        {metricsSent ? "sent successfully" : "selected"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {users
                      .filter((u) => checkedIds.has(u.id))
                      .map((u) => (
                        <span
                          key={u.id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-[600] border ${
                            metricsSent
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : "bg-violet-100 text-violet-700 border-violet-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full animate-pulse ${metricsSent ? "bg-emerald-500" : "bg-violet-500"}`}
                          />
                          {u.username}
                          <span
                            className={`ml-0.5 px-1.5 py-0 rounded text-[9px] font-[700] ${ROLE_STYLES[u.role] || "bg-gray-100 text-gray-500"}`}
                          >
                            {u.role}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUnselectUser(u.id)}
                            className="ml-0.5 rounded-full p-0.5 hover:bg-red-100 hover:text-red-600 transition"
                            title={`Remove ${u.username}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={metricsSending}
                    onClick={handleSendMetrics}
                    className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-white text-[12px] font-[600] transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                      metricsSent
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {metricsSending ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : metricsSent ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <Zap className="h-3.5 w-3.5" />
                    )}
                    {metricsSending
                      ? "Sending…"
                      : metricsSent
                        ? "Sent ✓"
                        : "Send"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCheckedIds(new Set());
                      setMetricsSent(false);
                    }}
                    className="ml-1 p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                    title="Clear selection"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleCheckAll}
              className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-150 ${
                allChecked
                  ? "bg-blue-600 border-blue-600"
                  : checkedIds.size > 0
                    ? "bg-blue-100 border-blue-400"
                    : "border-gray-300 hover:border-blue-400"
              }`}
            >
              {allChecked ? (
                <svg
                  className="h-3 w-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : checkedIds.size > 0 ? (
                <span className="block h-0.5 w-2.5 rounded bg-blue-500" />
              ) : null}
            </button>
            <span className="text-[13px] font-[600] text-gray-900">
              User List
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition"
              title="Refresh"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="appearance-none pl-3 pr-7 py-1.5 text-[12px] border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition cursor-pointer"
              >
                <option value="">All Roles</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users…"
                className="pl-7 pr-3 py-1.5 text-[12px] border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition w-[170px] placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-5 py-3 w-10">
                <span className="sr-only">Select</span>
              </th>
              {["Name", "Email", "Role", "Created", ""].map((h) => (
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
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-[13px] text-gray-400"
                >
                  <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                  Loading users…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-[13px] text-gray-400"
                >
                  No users found
                </td>
              </tr>
            ) : (
              pageUsers.map((u, i) => {
                const checked = checkedIds.has(u.id);
                return (
                  <tr
                    key={u.id}
                    className={`border-b border-gray-50 transition-all duration-150 ${
                      checked
                        ? "bg-blue-50/70 border-l-2 border-l-blue-500"
                        : i % 2 !== 0
                          ? "bg-gray-50/30"
                          : ""
                    } hover:bg-gray-50/70`}
                  >
                    <td className="px-5 py-3.5 w-10">
                      <button
                        type="button"
                        onClick={() => toggleCheck(u.id)}
                        className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-150 ${
                          checked
                            ? "bg-blue-600 border-blue-600 shadow-sm"
                            : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                        }`}
                      >
                        {checked && (
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600 text-[12px] font-[700] border border-violet-100">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[13px] font-[500] text-gray-900">
                          {u.username}
                        </span>
                        {/* {u.is_selected && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-[700]">
                            <svg
                              className="h-2.5 w-2.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Selected
                          </span>
                        )} */}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-gray-600">
                      {u.email}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-[600] border ${ROLE_STYLES[u.role] || "bg-gray-100 text-gray-500 border-gray-200"}`}
                      >
                        {u.role || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[11px] text-gray-500">
                      {u.created_at_display}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {/* ── Select / Unselect toggle — same pattern as agent activate/deactivate ── */}
                        <button
                          type="button"
                          disabled={busyRowId === u.id}
                          onClick={() => handleToggleUser(u, checked)}
                          title={
                            checked
                              ? `Unselect ${u.username}`
                              : `Select ${u.username}`
                          }
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-[600] border transition-all duration-200 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed ${
                            checked
                              ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-500 hover:text-white hover:border-amber-500"
                              : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-500 hover:text-white hover:border-emerald-500"
                          }`}
                        >
                          {busyRowId === u.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : checked ? (
                            <ShieldOff className="h-3 w-3" />
                          ) : (
                            <ShieldCheck className="h-3 w-3" />
                          )}
                          {busyRowId === u.id
                            ? "…"
                            : checked
                              ? "Unselect"
                              : "Select"}
                        </button>
                        <button
                          onClick={() => openEdit(u)}
                          className="rounded-xl border border-gray-200 bg-gray-50 p-2 text-gray-500 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-200 hover:shadow-md"
                          title="Edit user"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="rounded-xl border border-red-100 bg-red-50 p-2 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 hover:shadow-md"
                          title="Delete user"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <span className="text-[12px] text-gray-400">
            Showing {filtered.length === 0 ? 0 : pageStart + 1}–
            {Math.min(pageStart + USERS_PER_PAGE, filtered.length)} of{" "}
            {filtered.length} user{filtered.length !== 1 ? "s" : ""}
          </span>
          {totalUserPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToUserPage(safeUserPage - 1)}
                disabled={safeUserPage === 1}
                className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none transition text-[13px]"
              >
                ‹
              </button>
              {userPageNums.map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="text-[12px] text-gray-400 px-1">…</span>
                  )}
                  <button
                    onClick={() => goToUserPage(p)}
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border text-[12px] font-[500] transition ${
                      safeUserPage === p
                        ? "bg-black text-white border-black"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))}
              <button
                onClick={() => goToUserPage(safeUserPage + 1)}
                disabled={safeUserPage === totalUserPages}
                className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none transition text-[13px]"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setEditTarget(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-[700] text-gray-900">
                Edit User
              </h3>
              <button
                onClick={() => setEditTarget(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[11px] font-[600] text-gray-500 mb-1">
                  Name
                </label>
                <input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
                />
                {editErrors.name && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {editErrors.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-[600] text-gray-500 mb-1">
                  Email
                </label>
                <input
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
                />
                {editErrors.email && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {editErrors.email}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-[600] text-gray-500 mb-1">
                  Password{" "}
                  <span className="text-[10px] text-gray-400">
                    (leave blank to keep current)
                  </span>
                </label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) =>
                    setEditForm({ ...editForm, password: e.target.value })
                  }
                  placeholder="Optional"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
                />
                {editErrors.password && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {editErrors.password}
                  </p>
                )}
              </div>
              <RoleSelector
                value={editForm.role}
                onChange={(r) => setEditForm({ ...editForm, role: r })}
                error={editErrors.role}
              />
              <button
                onClick={handleEdit}
                disabled={editing}
                className="mt-2 w-full rounded-xl bg-[#0a0a0a] py-2.5 text-[13px] font-[600] text-white hover:bg-gray-800 transition flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {editing ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Pencil className="h-3.5 w-3.5" />
                )}
                {editing ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <DeleteConfirmModal
          label={deleteTarget.username}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </div>
  );
}

/* ── Superadmin Metrics ── */
function SuperAdminMetricsPage({ onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [sending, setSending] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/users");
      const list = Array.isArray(res.data)
        ? res.data
        : (res.data?.users ?? res.data?.data ?? []);
      setUsers(
        list.map((u) => ({
          id: u.id ?? u.user_id ?? u._id,
          username: u.username ?? u.name ?? "—",
          email: u.email ?? u.email_address ?? "—",
          role: (u.role ?? "").toUpperCase(),
        })),
      );
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const allChecked =
    filtered.length > 0 && filtered.every((u) => checkedIds.has(u.id));
  const toggleCheckAll = () => {
    if (allChecked) setCheckedIds(new Set());
    else setCheckedIds(new Set(filtered.map((u) => u.id)));
  };
  const toggleCheck = (id) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSendMetrics = async () => {
    const selectedEmails = users
      .filter((u) => checkedIds.has(u.id))
      .map((u) => u.email);
    if (!selectedEmails.length) {
      toast.error("Select at least one user.");
      return;
    }
    setSending(true);
    try {
      await axiosInstance.post("/api/superadmin/metrics", {
        emails: selectedEmails,
      });
      toast.success(`Metrics sent for ${selectedEmails.length} user(s).`);
      setCheckedIds(new Set());
    } catch (err) {
      toast.error(
        getApiError(err) ||
          err?.response?.data?.detail ||
          "Failed to send metrics.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Superadmin Metrics"
        subtitle="Select users and send metrics data"
        onBack={onBack}
      />

      {/* Top Action Bar */}
      <AnimatePresence>
        {checkedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto", marginBottom: 16 }}
            exit={{ opacity: 0, y: -10, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-r from-indigo-50 via-white to-indigo-50 rounded-2xl border border-indigo-200 shadow-sm px-5 py-3.5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                  <Users className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <span className="text-[14px] font-[700] text-indigo-800">
                    {checkedIds.size}
                  </span>
                  <span className="text-[12px] font-[500] text-indigo-600 ml-1">
                    user{checkedIds.size !== 1 ? "s" : ""} selected
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={sending}
                  onClick={handleSendMetrics}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 text-white text-[12px] font-[600] hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Zap className="h-3.5 w-3.5" />
                  )}
                  {sending ? "Sending…" : "Send"}
                </button>
                <button
                  type="button"
                  onClick={() => setCheckedIds(new Set())}
                  className="ml-1 p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                  title="Clear selection"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleCheckAll}
              className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-150 ${
                allChecked
                  ? "bg-indigo-600 border-indigo-600"
                  : checkedIds.size > 0
                    ? "bg-indigo-100 border-indigo-400"
                    : "border-gray-300 hover:border-indigo-400"
              }`}
            >
              {allChecked ? (
                <svg
                  className="h-3 w-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : checkedIds.size > 0 ? (
                <span className="block h-0.5 w-2.5 rounded bg-indigo-500" />
              ) : null}
            </button>
            <span className="text-[13px] font-[600] text-gray-900">
              Select Users
            </span>
            {checkedIds.size > 0 && (
              <span className="text-[11px] font-[500] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {checkedIds.size} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition"
              title="Refresh"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users…"
                className="pl-7 pr-3 py-1.5 text-[12px] border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white transition w-[170px] placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-5 py-3 w-10">
                <span className="sr-only">Select</span>
              </th>
              {["Name", "Email", "Role"].map((h) => (
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
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-[13px] text-gray-400"
                >
                  <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                  Loading users…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-[13px] text-gray-400"
                >
                  No users found
                </td>
              </tr>
            ) : (
              filtered.map((u, i) => {
                const checked = checkedIds.has(u.id);
                return (
                  <tr
                    key={u.id}
                    className={`border-b border-gray-50 transition-all duration-150 cursor-pointer ${
                      checked
                        ? "bg-indigo-50/70 border-l-2 border-l-indigo-500"
                        : i % 2 !== 0
                          ? "bg-gray-50/30"
                          : ""
                    } hover:bg-gray-50/70`}
                    onClick={() => toggleCheck(u.id)}
                  >
                    <td className="px-5 py-3.5 w-10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCheck(u.id);
                        }}
                        className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-150 ${
                          checked
                            ? "bg-indigo-600 border-indigo-600 shadow-sm"
                            : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50"
                        }`}
                      >
                        {checked && (
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 text-[12px] font-[700] border border-indigo-100">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[13px] font-[500] text-gray-900">
                          {u.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-gray-600">
                      {u.email}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-[600] border ${ROLE_STYLES[u.role] || "bg-gray-100 text-gray-500 border-gray-200"}`}
                      >
                        {u.role || "—"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-gray-100 text-[12px] text-gray-400">
          {users.length} user{users.length !== 1 ? "s" : ""} total
        </div>
      </div>
    </div>
  );
}

/* ── Email Templates ── */
function EmailTemplatesPage({ onBack }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  /* Create modal */
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    subject: "",
    body: "",
    category: "",
    ai_tone: "",
    ai_context: "",
  });
  const [htmlFile, setHtmlFile] = useState(null);
  const [fileName, setFileName] = useState("No file selected");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  /* View modal — GET /api/email-templates/{id} */
  const [viewModal, setViewModal] = useState(null); // null | template object
  const [viewLoading, setViewLoading] = useState(false);
  const [viewTab, setViewTab] = useState("rendered"); // "rendered" | "html"
  const [htmlOnly, setHtmlOnly] = useState(""); // raw html from GET …/preview/html
  const [htmlOnlyLoading, setHtmlOnlyLoading] = useState(false);

  /* Edit modal — PUT /api/email-templates/{id} */
  const [editModal, setEditModal] = useState(null); // null | template object
  const [editForm, setEditForm] = useState({
    name: "",
    subject: "",
    body: "",
    category: "",
    ai_tone: "",
    ai_context: "",
  });
  const [editFile, setEditFile] = useState(null);
  const [editFileName, setEditFileName] = useState("No file selected");
  const [editSaving, setEditSaving] = useState(false);
  const editFileRef = useRef(null);

  /* Preview with custom fields — POST /api/email-templates/{id}/preview */
  const [previewModal, setPreviewModal] = useState(null); // null | template object
  const [previewFields, setPreviewFields] = useState({}); // { placeholder: value }
  const [previewResult, setPreviewResult] = useState(null); // { subject, html_content }
  const [previewLoading, setPreviewLoading] = useState(false);

  /* Delete */
  const [deleting, setDeleting] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* ── GET /api/email-templates ── */
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/email-templates");
      const raw = res.data ?? [];
      const list = Array.isArray(raw)
        ? raw
        : (raw.data ?? raw.templates ?? raw.results ?? []);
      setTemplates(
        list.map((t) => ({
          id: t.template_id ?? t.id ?? t._id ?? Math.random(),
          name: t.name ?? t.template_name ?? "",
          subject: t.subject ?? t.email_subject ?? "",
          body: t.html_content ?? t.body ?? t.content ?? t.html ?? "",
          placeholders: t.placeholders ?? [
            ...(t.standard_placeholders ?? []),
            ...(t.ai_placeholders ?? []),
            ...(t.custom_placeholders ?? []),
          ],
          originalFilename: t.original_filename ?? "",
          category: t.category ?? "",
          ai_tone: t.ai_tone ?? "",
          ai_context: t.ai_context ?? "",
        })),
      );
    } catch {
      /* silently ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  /* ── POST /api/email-templates/upload ── */
  const create = async () => {
    if (!form.name.trim() || !form.subject.trim()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("subject", form.subject.trim());
      if (form.category.trim()) fd.append("category", form.category.trim());
      if (form.ai_tone.trim()) fd.append("ai_tone", form.ai_tone.trim());
      if (form.ai_context.trim())
        fd.append("ai_context", form.ai_context.trim());
      if (htmlFile) {
        fd.append("file", htmlFile, htmlFile.name);
      } else {
        const htmlContent =
          form.body.trim() ||
          "<!DOCTYPE html><html><body><p>Email Template</p></body></html>";
        fd.append(
          "file",
          new Blob([htmlContent], { type: "text/html" }),
          "template.html",
        );
      }
      const res = await axiosInstance.post("/api/email-templates/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const r = res.data ?? {};
      toast.success(r.message ?? "Template created successfully.");
      setTemplates((prev) => [
        ...prev,
        {
          id: r.template_id ?? Math.random(),
          name: r.name ?? form.name.trim(),
          subject: r.subject ?? form.subject.trim(),
          body: r.html_content ?? form.body,
          placeholders: r.placeholders ?? [],
          originalFilename: r.original_filename ?? htmlFile?.name ?? "",
        },
      ]);
      setForm({
        name: "",
        subject: "",
        body: "",
        category: "",
        ai_tone: "",
        ai_context: "",
      });
      setHtmlFile(null);
      setFileName("No file selected");
      setShowModal(false);
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ??
          getApiError(err) ??
          "Failed to create template.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* ── shared: fetch single template from GET /api/email-templates/{id} ── */
  const fetchSingle = async (t) => {
    try {
      const res = await axiosInstance.get(`/api/email-templates/${t.id}`);
      /* unwrap nested wrapper if present: { template: {...} } or { data: {...} } */
      const raw = res.data ?? {};
      const d = raw.template ?? raw.data ?? raw;
      return {
        id: d.template_id ?? d.id ?? t.id,
        name: d.name ?? d.template_name ?? t.name,
        subject: d.subject ?? d.email_subject ?? t.subject,
        body: d.html_content ?? d.body ?? d.content ?? d.html ?? t.body ?? "",
        placeholders: d.placeholders ?? [
          ...(d.standard_placeholders ?? []),
          // ...existing code...
          ...(d.standard_placeholders ?? []),
          ...(d.ai_placeholders ?? []),
          ...(d.custom_placeholders ?? []),
        ],
        originalFilename: d.original_filename ?? t.originalFilename ?? "",
        category: d.category ?? t.category ?? "",
        ai_tone: d.ai_tone ?? t.ai_tone ?? "",
        ai_context: d.ai_context ?? t.ai_context ?? "",
      };
    } catch {
      return t; /* fallback to local data */
    }
  };

  /* ── GET /api/email-templates/{id} ── */
  const openView = async (t) => {
    setViewTab("rendered");
    setHtmlOnly("");
    setViewModal(t);
    setViewLoading(true);
    const full = await fetchSingle(t);
    setViewModal(full);
    setViewLoading(false);
  };

  /* ── GET /api/email-templates/{id}/preview/html ── */
  const loadHtmlOnly = async (id) => {
    setHtmlOnlyLoading(true);
    setHtmlOnly("");
    try {
      const res = await axiosInstance.get(
        `/api/email-templates/${id}/preview/html`,
      );
      const html =
        typeof res.data === "string"
          ? res.data
          : (res.data?.html_content ??
            res.data?.html ??
            res.data?.content ??
            "");
      setHtmlOnly(html);
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ??
          getApiError(err) ??
          "Failed to load HTML.",
      );
    } finally {
      setHtmlOnlyLoading(false);
    }
  };

  /* ── PUT /api/email-templates/{id} ── */
  const openEdit = async (t) => {
    /* show modal immediately with local data, then hydrate from API */
    setEditFile(null);
    setEditFileName("No file selected");
    setEditModal(t);
    setEditForm({
      name: t.name ?? "",
      subject: t.subject ?? "",
      body: t.body ?? "",
      category: t.category ?? "",
      ai_tone: t.ai_tone ?? "",
      ai_context: t.ai_context ?? "",
    });
    const full = await fetchSingle(t);
    setEditModal(full);
    setEditForm({
      name: full.name ?? "",
      subject: full.subject ?? "",
      body: full.body ?? "",
      category: full.category ?? "",
      ai_tone: full.ai_tone ?? "",
      ai_context: full.ai_context ?? "",
    });
  };

  const submitEdit = async () => {
    if (!editForm.name.trim() || !editForm.subject.trim()) return;
    setEditSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", editForm.name.trim());
      fd.append("subject", editForm.subject.trim());
      if (editForm.category.trim())
        fd.append("category", editForm.category.trim());
      if (editForm.ai_tone.trim())
        fd.append("ai_tone", editForm.ai_tone.trim());
      if (editForm.ai_context.trim())
        fd.append("ai_context", editForm.ai_context.trim());
      if (editFile) {
        fd.append("file", editFile, editFile.name);
      } else {
        const htmlContent =
          editForm.body.trim() ||
          "<!DOCTYPE html><html><body><p>Email Template</p></body></html>";
        fd.append(
          "file",
          new Blob([htmlContent], { type: "text/html" }),
          "template.html",
        );
      }
      const res = await axiosInstance.put(
        `/api/email-templates/${editModal.id}`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      const r = res.data ?? {};
      toast.success(r.message ?? "Template updated successfully.");
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editModal.id
            ? {
                ...t,
                name: editForm.name.trim(),
                subject: editForm.subject.trim(),
                body: r.html_content ?? editForm.body,
                category: editForm.category.trim(),
                ai_tone: editForm.ai_tone.trim(),
                ai_context: editForm.ai_context.trim(),
                placeholders: r.placeholders ?? t.placeholders,
              }
            : t,
        ),
      );
      setEditModal(null);
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ??
          getApiError(err) ??
          "Failed to update template.",
      );
    } finally {
      setEditSaving(false);
    }
  };

  /* ── POST /api/email-templates/{id}/preview ── */
  const openPreview = (t) => {
    const placeholders = Array.isArray(t.placeholders) ? t.placeholders : [];
    const initial = Object.fromEntries(placeholders.map((p) => [p, ""]));
    setPreviewFields(initial);
    setPreviewResult(null);
    setPreviewModal(t);
  };

  const submitPreview = async () => {
    if (!previewModal) return;
    setPreviewLoading(true);
    try {
      const res = await axiosInstance.post(
        `/api/email-templates/${previewModal.id}/preview`,
        { custom_fields: previewFields },
      );
      const d = res.data ?? {};
      const preview = d.preview ?? {};
      setPreviewResult({
        subject:
          preview.subject ??
          d.subject ??
          d.rendered_subject ??
          previewModal.subject,
        html:
          preview.body_html ??
          d.html_content ??
          d.rendered_html ??
          d.html ??
          d.body ??
          "",
      });
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ?? getApiError(err) ?? "Preview failed.",
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  /* ── DELETE /api/email-templates/{id} ── */
  const del = async (id) => {
    setDeleting(id);
    try {
      await axiosInstance.delete(`/api/email-templates/${id}`);
      setTemplates((p) => p.filter((t) => t.id !== id));
      toast.success("Template deleted.");
    } catch {
      setTemplates((p) => p.filter((t) => t.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const closeCreateModal = () => {
    setShowModal(false);
    setForm({
      name: "",
      subject: "",
      body: "",
      category: "",
      ai_tone: "",
      ai_context: "",
    });
    setHtmlFile(null);
    setFileName("No file selected");
  };

  return (
    <div>
      <PageHeader
        title="Email Templates"
        subtitle="Manage reusable email templates for your campaigns"
        onBack={onBack}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchTemplates}
              disabled={loading}
              className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition shadow-sm"
              title="Refresh"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#0a0a0a] px-4 py-2.5 text-[13px] font-[600] text-white hover:bg-gray-800 transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Create New
            </button>
          </div>
        }
      />

      {/* ── Templates Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[13px] text-gray-400 animate-pulse">
            Loading templates…
          </div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Name", "Subject", "Placeholders", "Actions"].map(
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
                      colSpan={4}
                      className="px-5 py-12 text-center text-[13px] text-gray-400"
                    >
                      No templates yet — click{" "}
                      <span className="font-[600] text-gray-600">
                        Create New
                      </span>{" "}
                      to add one.
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
                      <td className="px-5 py-3.5 text-[13px] text-gray-600 max-w-[200px] truncate">
                        {t.subject}
                      </td>
                      <td className="px-5 py-3.5">
                        {Array.isArray(t.placeholders) &&
                        t.placeholders.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {t.placeholders.slice(0, 3).map((p) => (
                              <span
                                key={p}
                                className="inline-block rounded-md bg-violet-50 px-1.5 py-0.5 text-[10px] font-[600] text-violet-700"
                              >
                                {`{{${p}}}`}
                              </span>
                            ))}
                            {t.placeholders.length > 3 && (
                              <span className="text-[10px] text-gray-400">
                                +{t.placeholders.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[12px] text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {/* View */}
                          <button
                            onClick={() => openView(t)}
                            title="View template"
                            className="flex items-center gap-1 rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 text-[11px] font-[600] text-indigo-700 hover:bg-indigo-100 transition"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => openEdit(t)}
                            title="Edit template"
                            className="flex items-center gap-1 rounded-lg border border-amber-100 bg-amber-50 px-2.5 py-1.5 text-[11px] font-[600] text-amber-700 hover:bg-amber-100 transition"
                          >
                            <Wrench className="h-3.5 w-3.5" />
                            {/* <FileText className="h-3.5 w-3.5" /> */}
                            Edit
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() =>
                              !deleting &&
                              setDeleteTarget({ id: t.id, name: t.name })
                            }
                            disabled={deleting === t.id}
                            title="Delete template"
                            className="rounded-lg border border-red-100 bg-red-50 p-1.5 text-red-500 hover:bg-red-100 transition disabled:opacity-40"
                          >
                            {deleting === t.id ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-gray-100 text-[12px] text-gray-400">
              {templates.length} template{templates.length !== 1 ? "s" : ""}
            </div>
          </>
        )}
      </div>

      {/* ── Create Modal ── */}
      {showModal && (
        <Modal
          title="Create Email Template"
          onClose={closeCreateModal}
          width="max-w-2xl"
        >
          <div className="space-y-5">
            {/* ── Section 1: Basic Info ── */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-4">
              <p className="text-[11px] font-[700] uppercase tracking-widest text-gray-400">
                Basic Info
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Name"
                  required
                  placeholder="e.g. Enterprise Intro"
                  value={form.name}
                  onChange={(value) => setForm((f) => ({ ...f, name: value }))}
                />
                <Field
                  label="Subject"
                  required
                  placeholder="Email subject line…"
                  value={form.subject}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, subject: value }))
                  }
                />
              </div>
            </div>

            {/* ── Section 2: AI Settings ── */}
            <div className="rounded-xl border border-violet-100 bg-violet-50/30 p-4 space-y-4">
              <p className="text-[11px] font-[700] uppercase tracking-widest text-violet-400">
                AI Settings{" "}
                <span className="normal-case font-[400] text-gray-400">
                  (optional)
                </span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Category"
                  placeholder="e.g. onboarding, follow-up"
                  value={form.category}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, category: value }))
                  }
                />
                <Field
                  label="AI Tone"
                  placeholder="e.g. professional, friendly"
                  value={form.ai_tone}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, ai_tone: value }))
                  }
                />
              </div>
              <div>
                <label className="block text-[12px] font-[600] text-gray-700 mb-1.5">
                  AI Context
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional context for AI personalisation…"
                  value={form.ai_context}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ai_context: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] text-gray-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 resize-none"
                />
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3">
              <p className="text-[11px] font-[700] uppercase tracking-widest text-gray-400">
                HTML Content <span className="text-red-400">*</span>
              </p>

              {/* File upload zone */}
              <div
                onClick={() => fileRef.current?.click()}
                className={`flex items-center gap-3 cursor-pointer rounded-xl border-2 border-dashed px-4 py-3 transition
                  ${htmlFile ? "border-violet-300 bg-violet-50/60" : "border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50/30"}`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${htmlFile ? "bg-violet-100" : "bg-gray-100"}`}
                >
                  <Upload
                    className={`h-4 w-4 ${htmlFile ? "text-violet-600" : "text-gray-400"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[13px] font-[500] ${htmlFile ? "text-violet-700 font-[600]" : "text-gray-700"} truncate`}
                  >
                    {htmlFile ? fileName : "Browse HTML File"}
                  </p>
                  <p
                    className={`text-[11px] ${htmlFile ? "text-violet-400" : "text-gray-400"}`}
                  >
                    {htmlFile ? (
                      "Click to change file"
                    ) : (
                      <>
                        Click to upload a{" "}
                        <code className="bg-gray-100 px-1 rounded">.html</code>{" "}
                        or{" "}
                        <code className="bg-gray-100 px-1 rounded">.htm</code>{" "}
                        file
                      </>
                    )}
                  </p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".html,.htm"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setHtmlFile(f);
                    setFileName(f?.name ?? "No file selected");
                    if (f) {
                      const reader = new FileReader();
                      reader.onload = (ev) =>
                        setForm((frm) => ({
                          ...frm,
                          body: ev.target.result ?? "",
                        }));
                      reader.readAsText(f);
                    }
                  }}
                />
              </div>

              {/* Selected file row with clear button */}
              {htmlFile && (
                <div className="flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2">
                  <FileText className="h-4 w-4 text-violet-500 shrink-0" />
                  <span className="flex-1 text-[12px] font-[500] text-violet-700 truncate">
                    {fileName}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setHtmlFile(null);
                      setFileName("No file selected");
                      setForm((f) => ({ ...f, body: "" }));
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="shrink-0 flex items-center gap-1 rounded-lg border border-violet-200 bg-white px-2 py-1 text-[11px] font-[600] text-red-500 hover:bg-red-50 hover:border-red-200 transition"
                  >
                    <X className="h-3 w-3" />
                    Remove
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[11px] text-gray-400 font-[500]">
                  or paste HTML below
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <textarea
                rows={6}
                placeholder="<html>…paste your email HTML here…</html>"
                value={form.body}
                onChange={(e) =>
                  setForm((f) => ({ ...f, body: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[12px] text-gray-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 resize-none font-mono"
              />
            </div>

            {/* ── Footer ── */}
            <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
              <button
                onClick={closeCreateModal}
                className="px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={create}
                disabled={saving || !form.name.trim() || !form.subject.trim()}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0a0a0a] text-[13px] font-[600] text-white hover:bg-gray-800 transition disabled:opacity-50 shadow-sm"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    Create Template
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── View Modal — GET /api/email-templates/{id} + GET …/preview/html ── */}
      {viewModal && (
        <Modal
          title={viewModal.name}
          onClose={() => setViewModal(null)}
          width="max-w-2xl"
        >
          {viewLoading ? (
            <div className="flex items-center justify-center py-12 text-[13px] text-gray-400 gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
              Loading template…
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                  <p className="text-[10px] font-[700] uppercase tracking-widest text-gray-400 mb-1">
                    Subject
                  </p>
                  <p className="text-[13px] font-[500] text-gray-800">
                    {viewModal.subject || "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                  <p className="text-[10px] font-[700] uppercase tracking-widest text-gray-400 mb-1">
                    File
                  </p>
                  <p className="text-[13px] text-gray-600 truncate">
                    {viewModal.originalFilename || "—"}
                  </p>
                </div>
              </div>
              {Array.isArray(viewModal.placeholders) &&
                viewModal.placeholders.length > 0 && (
                  <div className="rounded-xl bg-violet-50 border border-violet-100 p-3">
                    <p className="text-[10px] font-[700] uppercase tracking-widest text-violet-400 mb-2">
                      Placeholders
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {viewModal.placeholders.map((p) => (
                        <span
                          key={p}
                          className="inline-block rounded-md bg-white border border-violet-200 px-2 py-0.5 text-[11px] font-[600] text-violet-700"
                        >
                          {`{{${p}}}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              {/* Tabs: Rendered | HTML Source */}
              <div>
                <div className="flex gap-1 mb-3 p-1 bg-gray-100 rounded-xl w-fit">
                  {[
                    { key: "rendered", label: "Rendered" },
                    { key: "html", label: "HTML Source" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setViewTab(tab.key);
                        if (
                          tab.key === "html" &&
                          !htmlOnly &&
                          !htmlOnlyLoading
                        ) {
                          loadHtmlOnly(viewModal.id);
                        }
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-[12px] font-[600] transition ${
                        viewTab === tab.key
                          ? "bg-white shadow-sm text-gray-900"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                {viewTab === "rendered" ? (
                  viewModal.body && /<[a-z]/i.test(viewModal.body) ? (
                    <div
                      className="rounded-xl border border-gray-200 bg-white overflow-auto max-h-[380px] p-4 text-[13px]"
                      dangerouslySetInnerHTML={{ __html: viewModal.body }}
                    />
                  ) : (
                    <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-[13px] text-gray-700 whitespace-pre-line max-h-[380px] overflow-auto">
                      {viewModal.body || "(no body)"}
                    </div>
                  )
                ) : htmlOnlyLoading ? (
                  <div className="flex items-center justify-center py-10 text-[13px] text-gray-400 gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
                    Loading HTML…
                  </div>
                ) : (
                  <pre className="rounded-xl bg-gray-900 text-green-300 p-4 text-[11px] font-mono overflow-auto max-h-[380px] whitespace-pre-wrap break-all">
                    {htmlOnly || viewModal.body || "(empty)"}
                  </pre>
                )}
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* ── Edit Modal — PUT /api/email-templates/{id} ── */}
      {editModal && (
        <Modal
          title={`Edit Template — ${editModal.name}`}
          onClose={() => setEditModal(null)}
          width="max-w-2xl"
        >
          <div className="space-y-5">
            {/* ── Basic Info ── */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-4">
              <p className="text-[11px] font-[700] uppercase tracking-widest text-gray-400">
                Basic Info
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Name"
                  required
                  placeholder="Template name"
                  value={editForm.name}
                  onChange={(value) =>
                    setEditForm((f) => ({ ...f, name: value }))
                  }
                />
                <Field
                  label="Subject"
                  required
                  placeholder="Email subject line…"
                  value={editForm.subject}
                  onChange={(value) =>
                    setEditForm((f) => ({ ...f, subject: value }))
                  }
                />
              </div>
            </div>

            {/* ── AI Settings ── */}
            <div className="rounded-xl border border-violet-100 bg-violet-50/30 p-4 space-y-4">
              <p className="text-[11px] font-[700] uppercase tracking-widest text-violet-400">
                AI Settings{" "}
                <span className="normal-case font-[400] text-gray-400">
                  (optional)
                </span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Category"
                  placeholder="e.g. onboarding, follow-up"
                  value={editForm.category}
                  onChange={(value) =>
                    setEditForm((f) => ({ ...f, category: value }))
                  }
                />
                <Field
                  label="AI Tone"
                  placeholder="e.g. professional, friendly"
                  value={editForm.ai_tone}
                  onChange={(value) =>
                    setEditForm((f) => ({ ...f, ai_tone: value }))
                  }
                />
              </div>
              <div>
                <label className="block text-[12px] font-[600] text-gray-700 mb-1.5">
                  AI Context
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional context for AI personalisation…"
                  value={editForm.ai_context}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, ai_context: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] text-gray-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 resize-none"
                />
              </div>
            </div>

            {/* ── HTML Content ── */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3">
              <p className="text-[11px] font-[700] uppercase tracking-widest text-gray-400">
                HTML Content
              </p>
              <div
                onClick={() => editFileRef.current?.click()}
                className={`flex items-center gap-3 cursor-pointer rounded-xl border-2 border-dashed px-4 py-3 transition
                  ${editFile ? "border-violet-300 bg-violet-50/60" : "border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50/30"}`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${editFile ? "bg-violet-100" : "bg-gray-100"}`}
                >
                  <Upload
                    className={`h-4 w-4 ${editFile ? "text-violet-600" : "text-gray-400"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[13px] font-[500] ${editFile ? "text-violet-700 font-[600]" : "text-gray-700"} truncate`}
                  >
                    {editFile ? editFileName : "Replace HTML File"}
                  </p>
                  <p
                    className={`text-[11px] ${editFile ? "text-violet-400" : "text-gray-400"}`}
                  >
                    {editFile ? (
                      "Click to change file"
                    ) : (
                      <>
                        Click to upload a{" "}
                        <code className="bg-gray-100 px-1 rounded">.html</code>{" "}
                        or{" "}
                        <code className="bg-gray-100 px-1 rounded">.htm</code>{" "}
                        file
                      </>
                    )}
                  </p>
                </div>
                <input
                  ref={editFileRef}
                  type="file"
                  accept=".html,.htm"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setEditFile(f);
                    setEditFileName(f?.name ?? "No file selected");
                    if (f) {
                      const reader = new FileReader();
                      reader.onload = (ev) =>
                        setEditForm((frm) => ({
                          ...frm,
                          body: ev.target.result ?? "",
                        }));
                      reader.readAsText(f);
                    }
                  }}
                />
              </div>
              {editFile && (
                <div className="flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2">
                  <FileText className="h-4 w-4 text-violet-500 shrink-0" />
                  <span className="flex-1 text-[12px] font-[500] text-violet-700 truncate">
                    {editFileName}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditFile(null);
                      setEditFileName("No file selected");
                      if (editFileRef.current) editFileRef.current.value = "";
                    }}
                    className="shrink-0 flex items-center gap-1 rounded-lg border border-violet-200 bg-white px-2 py-1 text-[11px] font-[600] text-red-500 hover:bg-red-50 hover:border-red-200 transition"
                  >
                    <X className="h-3 w-3" />
                    Remove
                  </button>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[11px] text-gray-400 font-[500]">
                  or paste HTML below
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <textarea
                rows={6}
                placeholder="<html>…paste your email HTML here…</html>"
                value={editForm.body}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, body: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[12px] text-gray-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 resize-none font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
              <button
                onClick={() => setEditModal(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-[500] text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={submitEdit}
                disabled={
                  editSaving ||
                  !editForm.name.trim() ||
                  !editForm.subject.trim()
                }
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0a0a0a] text-[13px] font-[600] text-white hover:bg-gray-800 transition disabled:opacity-50 shadow-sm"
              >
                {editSaving ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>Save Changes</>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Preview Modal — POST /api/email-templates/{id}/preview ── */}
      {previewModal && (
        <Modal
          title={`Preview — ${previewModal.name}`}
          onClose={() => {
            setPreviewModal(null);
            setPreviewResult(null);
          }}
          width="max-w-2xl"
        >
          <div className="space-y-4">
            {Array.isArray(previewModal.placeholders) &&
            previewModal.placeholders.length > 0 ? (
              <>
                <p className="text-[12px] text-gray-500">
                  Fill in custom values for each placeholder, then click{" "}
                  <span className="font-[600] text-gray-700">
                    Generate Preview
                  </span>
                  .
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {previewModal.placeholders.map((p) => (
                    <div key={p}>
                      <label className="block text-[11px] font-[600] text-gray-700 mb-1">
                        {`{{${p}}}`}
                      </label>
                      <input
                        type="text"
                        placeholder={`Value for ${p}`}
                        value={previewFields[p] ?? ""}
                        onChange={(e) =>
                          setPreviewFields((prev) => ({
                            ...prev,
                            [p]: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2 text-[13px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-[12px] text-gray-400">
                No placeholders detected — a direct preview will be generated.
              </p>
            )}
            <button
              onClick={submitPreview}
              disabled={previewLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0a0a0a] py-2.5 text-[13px] font-[600] text-white hover:bg-gray-800 transition disabled:opacity-60"
            >
              {previewLoading && (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              )}
              {previewLoading ? "Generating…" : "Generate Preview"}
            </button>
            {previewResult && (
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="rounded-xl bg-teal-50 border border-teal-100 px-4 py-2.5">
                  <p className="text-[10px] font-[700] uppercase tracking-widest text-teal-400 mb-0.5">
                    Subject
                  </p>
                  <p className="text-[13px] font-[500] text-teal-900">
                    {previewResult.subject}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-[700] uppercase tracking-widest text-gray-400 mb-2">
                    Rendered Email
                  </p>
                  {previewResult.html && /<[a-z]/i.test(previewResult.html) ? (
                    <div
                      className="rounded-xl border border-gray-200 bg-white overflow-auto max-h-[360px] p-4 text-[13px]"
                      dangerouslySetInnerHTML={{ __html: previewResult.html }}
                    />
                  ) : (
                    <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-[13px] text-gray-700 whitespace-pre-line max-h-[360px] overflow-auto">
                      {previewResult.html || "(no content)"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          label={deleteTarget.name}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            del(deleteTarget.id);
            setDeleteTarget(null);
          }}
          loading={deleting === deleteTarget?.id}
        />
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
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [loadedFromServer, setLoadedFromServer] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  /* ── Fetch existing credentials on mount ── */
  useEffect(() => {
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await axiosInstance.get("/api/globalsetting/graph");
        /* Handle { credentials: { GRAPH_CLIENT_ID, ... } } as well as flat shapes */
        const raw = res.data ?? {};
        const d = raw.credentials ?? raw.data ?? raw;
        const mapped = {
          clientId: d.GRAPH_CLIENT_ID ?? d.client_id ?? d.clientId ?? "",
          clientSecret:
            d.GRAPH_CLIENT_SECRET ?? d.client_secret ?? d.clientSecret ?? "",
          tenantId: d.GRAPH_TENANT_ID ?? d.tenant_id ?? d.tenantId ?? "",
          targetEmail:
            d.GRAPH_TARGET_EMAIL ?? d.target_email ?? d.targetEmail ?? "",
        };
        setForm(mapped);
        /* Mark as loaded only if at least one field has a value */
        if (Object.values(mapped).some(Boolean)) setLoadedFromServer(true);
      } catch (err) {
        const msg = getApiError(err) ?? null;
        if (err?.response?.status !== 404)
          setLoadError(msg || "Failed to load Graph credentials.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Save / update credentials ── */
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosInstance.put("/api/globalsetting/graph", {
        credentials: {
          GRAPH_CLIENT_ID: form.clientId,
          GRAPH_CLIENT_SECRET: form.clientSecret,
          GRAPH_TENANT_ID: form.tenantId,
          GRAPH_TARGET_EMAIL: form.targetEmail,
        },
      });
      setSaved(true);
      toast.success("Graph credentials saved.");
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        getApiError(err) ||
        err?.response?.data?.error ||
        "Failed to save Graph credentials.";
      toast.error(detail);
    } finally {
      setSaving(false);
    }
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
              {loadError && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[12px] text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {loadError}
                </div>
              )}
              {loadedFromServer && !loadError && (
                <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-[12px] text-green-700 flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                  Credentials loaded from server — fields pre-filled below.
                </div>
              )}
              {loading ? (
                <div className="flex items-center justify-center py-10 text-[13px] text-gray-400 gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
                  Loading credentials…
                </div>
              ) : (
                <>
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
                </>
              )}
            </form>
          </div>
        </div>

        <div className="flex flex-col gap-4">
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
                    className={`h-4 w-4 shrink-0 transition-colors duration-300 ${saved ? "text-green-500" : "text-gray-200"}`}
                  />
                </div>
              ))}
            </div>
          </div>

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
/* ── SMTP provider definitions ── */
const SMTP_PROVIDER_LIST = [
  { value: "mailgun", label: "Mailgun" },
  { value: "sendgrid", label: "SendGrid" },
  { value: "ses", label: "Amazon SES" },
  { value: "gmail", label: "Gmail" },
  { value: "outlook", label: "Outlook / Office365" },
  { value: "custom", label: "Custom SMTP" },
  { value: "outlook_graph", label: "Outlook Graph" },
  { value: "mailercloud", label: "Mailercloud" },
  { value: "mailersend", label: "MailerSend" },
  { value: "sparkpost", label: "SparkPost" },
  { value: "brevo", label: "Brevo (Sendinblue)" },
  { value: "postmark", label: "Postmark" },
];

/* Fields per provider — { key, label, placeholder, type, icon, required } */
const SMTP_FIELDS = {
  mailgun: [
    {
      key: "MAILGUN_API_KEY",
      label: "API Key",
      placeholder: "key-xxxxxxxxxxxx",
      type: "password",
      icon: "key",
      required: true,
    },
    {
      key: "MAILGUN_WEBHOOK_SIGNING_KEY",
      label: "Webhook Signing Key",
      placeholder: "your-webhook-signing-key",
      type: "password",
      icon: "shield",
      required: true,
    },
    {
      key: "MAILGUN_DOMAIN",
      label: "Domain",
      placeholder: "mg.yourdomain.com",
      type: "text",
      icon: "globe",
      required: true,
    },
    {
      key: "MAILGUN_FROM_EMAIL",
      label: "From Email",
      placeholder: "noreply@yourdomain.com",
      type: "email",
      icon: "at",
      required: false,
    },
    {
      key: "MAILGUN_FROM_NAME",
      label: "From Name",
      placeholder: "Your Company",
      type: "text",
      icon: null,
      required: false,
    },
  ],
  sendgrid: [
    {
      key: "SENDGRID_API_KEY",
      label: "API Key",
      placeholder: "SG.xxxxxxxxxxxx",
      type: "password",
      icon: "key",
      required: true,
    },
    {
      key: "SENDGRID_FROM_EMAIL",
      label: "From Email",
      placeholder: "noreply@yourdomain.com",
      type: "email",
      icon: "at",
      required: false,
    },
    {
      key: "SENDGRID_FROM_NAME",
      label: "From Name",
      placeholder: "Your Company",
      type: "text",
      icon: null,
      required: false,
    },
  ],
  ses: [
    {
      key: "AWS_ACCESS_KEY_ID",
      label: "Access Key ID",
      placeholder: "AKIAxxxxxxxxxxxx",
      type: "text",
      icon: "key",
      required: true,
    },
    {
      key: "AWS_SECRET_ACCESS_KEY",
      label: "Secret Access Key",
      placeholder: "xxxxxxxxxxxx",
      type: "password",
      icon: "key",
      required: true,
    },
    {
      key: "AWS_REGION",
      label: "AWS Region",
      placeholder: "us-east-1",
      type: "text",
      icon: "globe",
      required: true,
    },
    {
      key: "SES_FROM_EMAIL",
      label: "From Email",
      placeholder: "noreply@yourdomain.com",
      type: "email",
      icon: "at",
      required: false,
    },
    {
      key: "SES_FROM_NAME",
      label: "From Name",
      placeholder: "Your Company",
      type: "text",
      icon: null,
      required: false,
    },
  ],
  gmail: [
    {
      key: "GMAIL_EMAIL",
      label: "Gmail Address",
      placeholder: "yourname@gmail.com",
      type: "email",
      icon: "at",
      required: true,
    },
    {
      key: "GMAIL_APP_PASSWORD",
      label: "App Password",
      placeholder: "xxxx xxxx xxxx xxxx",
      type: "password",
      icon: "key",
      required: true,
    },
    {
      key: "GMAIL_FROM_NAME",
      label: "From Name",
      placeholder: "Your Name",
      type: "text",
      icon: null,
      required: false,
    },
  ],
  outlook: [
    {
      key: "OUTLOOK_EMAIL",
      label: "Outlook Email",
      placeholder: "yourname@outlook.com",
      type: "email",
      icon: "at",
      required: true,
    },
    {
      key: "OUTLOOK_PASSWORD",
      label: "Password",
      placeholder: "your-password",
      type: "password",
      icon: "key",
      required: true,
    },
    {
      key: "OUTLOOK_FROM_NAME",
      label: "From Name",
      placeholder: "Your Name",
      type: "text",
      icon: null,
      required: false,
    },
  ],
  custom: [
    {
      key: "SMTP_HOST",
      label: "SMTP Host",
      placeholder: "smtp.yourdomain.com",
      type: "text",
      icon: "globe",
      required: true,
    },
    {
      key: "SMTP_PORT",
      label: "Port",
      placeholder: "587",
      type: "text",
      icon: null,
      required: true,
    },
    {
      key: "SMTP_USERNAME",
      label: "Username",
      placeholder: "your-username",
      type: "text",
      icon: "at",
      required: true,
    },
    {
      key: "SMTP_PASSWORD",
      label: "Password",
      placeholder: "your-password",
      type: "password",
      icon: "key",
      required: true,
    },
    {
      key: "SMTP_USE_TLS",
      label: "Use TLS",
      placeholder: "true",
      type: "text",
      icon: null,
      required: false,
    },
    {
      key: "SMTP_USE_SSL",
      label: "Use SSL",
      placeholder: "false",
      type: "text",
      icon: null,
      required: false,
    },
    {
      key: "SMTP_FROM_EMAIL",
      label: "From Email",
      placeholder: "noreply@yourdomain.com",
      type: "email",
      icon: "at",
      required: false,
    },
    {
      key: "SMTP_FROM_NAME",
      label: "From Name",
      placeholder: "Your Company",
      type: "text",
      icon: null,
      required: false,
    },
  ],
  outlook_graph: [
    {
      key: "GRAPH_CLIENT_ID",
      label: "Client ID",
      placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      type: "text",
      icon: "key",
      required: true,
    },
    {
      key: "GRAPH_CLIENT_SECRET",
      label: "Client Secret",
      placeholder: "your-client-secret",
      type: "password",
      icon: "key",
      required: true,
    },
    {
      key: "GRAPH_TENANT_ID",
      label: "Tenant ID",
      placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      type: "text",
      icon: "globe",
      required: true,
    },
    {
      key: "GRAPH_TARGET_EMAIL",
      label: "Target Mailbox",
      placeholder: "mailbox@yourcompany.com",
      type: "email",
      icon: "at",
      required: true,
    },
    {
      key: "WEBHOOK_BASE_URL",
      label: "Webhook Base URL",
      placeholder: "https://yourapp.com",
      type: "text",
      icon: "globe",
      required: false,
    },
  ],
  mailercloud: [
    {
      key: "MAILERCLOUD_API_KEY",
      label: "API Key",
      placeholder: "mc-xxxxxxxxxxxx",
      type: "password",
      icon: "key",
      required: true,
    },
    {
      key: "MAILERCLOUD_FROM_EMAIL",
      label: "From Email",
      placeholder: "noreply@yourdomain.com",
      type: "email",
      icon: "at",
      required: false,
    },
    {
      key: "MAILERCLOUD_FROM_NAME",
      label: "From Name",
      placeholder: "Your Company",
      type: "text",
      icon: null,
      required: false,
    },
  ],
  mailersend: [
    {
      key: "MAILERSEND_API_KEY",
      label: "API Key",
      placeholder: "mlsn.xxxxxxxxxxxx",
      type: "password",
      icon: "key",
      required: true,
    },
    {
      key: "MAILERSEND_FROM_EMAIL",
      label: "From Email",
      placeholder: "noreply@yourdomain.com",
      type: "email",
      icon: "at",
      required: false,
    },
    {
      key: "MAILERSEND_FROM_NAME",
      label: "From Name",
      placeholder: "Your Company",
      type: "text",
      icon: null,
      required: false,
    },
  ],
  sparkpost: [
    {
      key: "SPARKPOST_API_KEY",
      label: "API Key",
      placeholder: "xxxxxxxxxxxx",
      type: "password",
      icon: "key",
      required: true,
    },
    {
      key: "SPARKPOST_FROM_EMAIL",
      label: "From Email",
      placeholder: "noreply@yourdomain.com",
      type: "email",
      icon: "at",
      required: false,
    },
    {
      key: "SPARKPOST_FROM_NAME",
      label: "From Name",
      placeholder: "Your Company",
      type: "text",
      icon: null,
      required: false,
    },
  ],
  brevo: [
    {
      key: "BREVO_API_KEY",
      label: "API Key",
      placeholder: "xkeysib-xxxxxxxxxxxx",
      type: "password",
      icon: "key",
      required: true,
    },
    {
      key: "BREVO_FROM_EMAIL",
      label: "From Email",
      placeholder: "noreply@yourdomain.com",
      type: "email",
      icon: "at",
      required: false,
    },
    {
      key: "BREVO_FROM_NAME",
      label: "From Name",
      placeholder: "Your Company",
      type: "text",
      icon: null,
      required: false,
    },
  ],
  postmark: [
    {
      key: "POSTMARK_API_KEY",
      label: "Server API Token",
      placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      type: "password",
      icon: "key",
      required: true,
    },
    {
      key: "POSTMARK_FROM_EMAIL",
      label: "From Email",
      placeholder: "noreply@yourdomain.com",
      type: "email",
      icon: "at",
      required: false,
    },
    {
      key: "POSTMARK_FROM_NAME",
      label: "From Name",
      placeholder: "Your Company",
      type: "text",
      icon: null,
      required: false,
    },
  ],
};

const EMPTY_SMTP_FORM = { name: "", provider: "mailgun", credentials: {} };

function smtpIconFor(iconName) {
  if (iconName === "key")
    return (
      <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
    );
  if (iconName === "globe")
    return (
      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
    );
  if (iconName === "at")
    return (
      <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
    );
  return null;
}

function CredInput({ field, value, error, onChange }) {
  const [show, setShow] = useState(false);
  const isPass = field.type === "password";
  return (
    <div>
      <label className="block text-[12px] font-[600] text-gray-700 mb-1.5">
        {field.label}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {field.icon && smtpIconFor(field.icon)}
        <input
          type={isPass ? (show ? "text" : "password") : "text"}
          inputMode={field.type === "email" ? "email" : undefined}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={`w-full rounded-xl border py-2.5 text-[13px] text-gray-800 placeholder-gray-400 outline-none transition
            focus:ring-2 focus:ring-violet-400/20
            ${error ? "border-red-300 bg-red-50 focus:border-red-400" : "border-gray-200 bg-gray-50/60 focus:border-violet-400 focus:bg-white"}
            ${field.icon ? "pl-10 pr-3" : "px-3.5"}
            ${isPass ? "pr-10" : ""}`}
        />
        {isPass && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

function SMTPProvidersPage({ onBack }) {
  const [list, setList] = useState([]); // available/configured providers (table)
  const [allProviderOpts, setAllProviderOpts] = useState([]); // all supported types (modal dropdown)
  const [configuredMap, setConfiguredMap] = useState({}); // provider key → configured record
  const [loadingList, setLoadingList] = useState(false);
  const [showModal, setShow] = useState(false);
  const [form, setForm] = useState(EMPTY_SMTP_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* fetch available providers + configured status in parallel */
  const fetchList = async () => {
    setLoadingList(true);
    try {
      const [providersRes, savedRes] = await Promise.allSettled([
        axiosInstance.get("/api/smtp/providers"),
        axiosInstance.get("/api/smtp/saved-providers"),
      ]);

      const labelMap = Object.fromEntries(
        SMTP_PROVIDER_LIST.map((p) => [p.value, p.label]),
      );

      const rawSaved =
        savedRes.status === "fulfilled"
          ? (() => {
              const d = savedRes.value.data;
              if (Array.isArray(d)) return d;
              if (Array.isArray(d?.saved_providers)) return d.saved_providers;
              if (Array.isArray(d?.providers)) return d.providers;
              if (Array.isArray(d?.items)) return d.items;
              if (Array.isArray(d?.data)) return d.data;
              return [];
            })()
          : [];

      const normalizedSaved = rawSaved.map((p) => {
        const providerKey = String(
          p.provider ??
            p.provider_name ??
            p.smtp_provider_name ??
            p.type ??
            p.name ??
            "",
        ).trim();
        return {
          id:
            p.credential_id ??
            p.id ??
            p.provider_id ??
            p.config_id ??
            providerKey,
          provider: providerKey,
          name:
            p.display_name ??
            p.name ??
            p.configuration_name ??
            labelMap[providerKey] ??
            providerKey,
          is_current: !!(
            p.is_current ??
            p.is_active ??
            p.selected ??
            p.is_default ??
            p.default ??
            false
          ),
          raw: p,
        };
      });

      /* ── Provider type options for create modal from /api/smtp/providers ── */
      if (providersRes.status === "fulfilled") {
        const d = providersRes.value.data;
        const rawProviders = Array.isArray(d)
          ? d
          : Array.isArray(d?.providers)
            ? d.providers
            : Array.isArray(d?.items)
              ? d.items
              : Array.isArray(d?.data)
                ? d.data
                : Array.isArray(d?.results)
                  ? d.results
                  : [];

        const opts = rawProviders
          .map((p) => {
            const key =
              typeof p === "string"
                ? p
                : (p.name ?? p.provider ?? p.value ?? p.provider_name ?? "");
            return {
              value: key,
              label:
                labelMap[key] ??
                (typeof p === "string"
                  ? p
                  : (p.display_name ?? p.label ?? p.name ?? p.provider ?? key)),
            };
          })
          .filter((p) => p.value);

        setAllProviderOpts(opts);
      }

      /* ── Configured map + fallback table rows from /saved-providers ── */
      const savedMap = {};
      normalizedSaved.forEach((p) => {
        const key = String(p.provider ?? "").toLowerCase();
        if (key) savedMap[key] = p.raw;
      });
      setConfiguredMap(savedMap);

      setList((prev) => {
        if (prev.length > 0) return prev;
        return normalizedSaved.map((p) => ({
          provider: p.provider,
          name: p.name,
          ready: true,
          description: "",
        }));
      });
    } catch {
      // silently ignore
    } finally {
      setLoadingList(false);
    }
  };
  useEffect(() => {
    fetchList();
  }, []);


  // Default Smartlead API Key
  const DEFAULT_SMARTLEAD_API_KEY = "2ba82289-d15e-47ae-974b-10661a97a7e2_h7b77q0";

  const setCred = (key, val) =>
    setForm((f) => ({ ...f, credentials: { ...f.credentials, [key]: val } }));

  // Always set Smartlead API Key when provider is selected (hidden from UI)
  useEffect(() => {
    if (form.provider === "smartlead") {
      setForm((f) => ({
        ...f,
        credentials: {
          ...f.credentials,
          SMARTLEAD_API_KEY: DEFAULT_SMARTLEAD_API_KEY,
        },
      }));
    }
  }, [form.provider]);

  const openCreate = async () => {
    let providerOpts = allProviderOpts;

    try {
      const res = await axiosInstance.get("/api/smtp/providers");
      const d = res.data;
      const labelMap = Object.fromEntries(
        SMTP_PROVIDER_LIST.map((p) => [p.value, p.label]),
      );
      const rawProviders = Array.isArray(d)
        ? d
        : Array.isArray(d?.providers)
          ? d.providers
          : Array.isArray(d?.items)
            ? d.items
            : Array.isArray(d?.data)
              ? d.data
              : Array.isArray(d?.results)
                ? d.results
                : [];

      providerOpts = rawProviders
        .map((p) => {
          const key =
            typeof p === "string"
              ? p
              : (p.name ?? p.provider ?? p.value ?? p.provider_name ?? "");
          return {
            value: key,
            label:
              labelMap[key] ??
              (typeof p === "string"
                ? p
                : (p.display_name ?? p.label ?? p.name ?? p.provider ?? key)),
          };
        })
        .filter((p) => p.value);

      if (providerOpts.length > 0) {
        setAllProviderOpts(providerOpts);
      }
    } catch {
      // Keep existing options if fetch fails.
    }

    const firstProvider = providerOpts[0]?.value ?? "mailgun";
    setForm({ name: "", provider: firstProvider, credentials: {} });
    setErrors({});
    setShow(true);
  };

  /* validate required fields for current provider */
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Configuration name is required.";
    const fields = SMTP_FIELDS[form.provider] ?? [];
    fields.forEach((f) => {
      if (f.required && !form.credentials[f.key]?.trim()) {
        errs[f.key] = `${f.label} is required.`;
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* build payload and POST */
  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        provider: form.provider,
        credentials: { ...form.credentials },
      };
      const res = await axiosInstance.post(
        "/api/smtp/validate-and-save-credentials",
        payload,
      );
      const msg = res?.data?.message || "SMTP credentials validated and saved.";
      toast.success(msg);
      setShow(false);
      fetchList();
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        getApiError(err) ||
        err?.response?.data?.error ||
        "Validation failed. Please check your credentials.";
      toast.error(detail);
    } finally {
      setSaving(false);
    }
  };

  const del = async (providerKey) => {
    const cfg = configuredMap[providerKey?.toLowerCase()];
    const apiId =
      cfg?.credential_id ??
      cfg?.id ??
      cfg?.provider_id ??
      cfg?.config_id ??
      cfg?.provider ??
      providerKey;
    try {
      await axiosInstance.delete(`/api/smtp/saved-providers/${apiId}`);
      setConfiguredMap((m) => {
        const n = { ...m };
        delete n[providerKey?.toLowerCase()];
        return n;
      });
      toast.success("Provider removed.");
    } catch {
      setConfiguredMap((m) => {
        const n = { ...m };
        delete n[providerKey?.toLowerCase()];
        return n;
      });
    }
  };

  const fields = SMTP_FIELDS[form.provider] ?? [];
  /* group fields in pairs for 2-col grid */
  const fieldRows = [];
  for (let i = 0; i < fields.length; i += 2)
    fieldRows.push(fields.slice(i, i + 2));

  return (
    <div>
      <PageHeader
        title="SMTP Providers"
        subtitle="Configure email delivery providers for campaigns"
        onBack={onBack}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchList}
              disabled={loadingList}
              className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition shadow-sm"
              title="Refresh"
            >
              <RefreshCw
                className={`h-4 w-4 ${loadingList ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 rounded-xl bg-[#0a0a0a] px-4 py-2.5 text-[13px] font-[600] text-white hover:bg-gray-800 transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Provider
            </button>
          </div>
        }
      />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Provider", "Name", "Status", "Actions"].map((h) => (
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
            {loadingList ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-[13px] text-gray-400"
                >
                  Loading…
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-[13px] text-gray-400"
                >
                  No SMTP providers available
                </td>
              </tr>
            ) : (
              list.map((s, i) => {
                const provKey = (s.provider ?? s.name ?? "").toLowerCase();
                const cfgEntry = configuredMap[provKey];
                const isConfigured = Boolean(cfgEntry) || s.ready;
                return (
                  <tr
                    key={s.provider ?? i}
                    className={`border-b border-gray-50 hover:bg-gray-50/60 transition ${i % 2 !== 0 ? "bg-gray-50/30" : ""}`}
                  >
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-indigo-50 text-[11px] font-[600] text-indigo-700">
                        {s.provider}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] font-[600] text-gray-900">
                      {s.name}
                    </td>
                    <td className="px-5 py-3.5">
                      {isConfigured ? (
                        <span className="inline-flex items-center gap-1.5 text-[12px] font-[600] text-green-700">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Configured
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-400">
                          <Circle className="h-4 w-4" />
                          Not configured
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {isConfigured && (
                        <button
                          onClick={() =>
                            setDeleteTarget({
                              key: s.provider ?? s.name,
                              name: s.name ?? s.provider,
                            })
                          }
                          className="text-red-400 hover:text-red-600 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-gray-100 text-[12px] text-gray-400">
          {list.length} provider{list.length !== 1 ? "s" : ""} available ·{" "}
          {Object.keys(configuredMap).length} configured
        </div>
      </div>

      {showModal && (
        <Modal
          title="Create SMTP Configuration"
          onClose={() => setShow(false)}
          width="max-w-xl"
        >
          <div className="space-y-4">
            {/* Config name */}
            <div>
              <label className="block text-[12px] font-[600] text-gray-700 mb-1.5">
                Configuration Name<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                placeholder="e.g. Mailgun Production"
                value={form.name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, name: e.target.value }));
                  setErrors((e2) => ({ ...e2, name: undefined }));
                }}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-violet-400/20
                  ${errors.name ? "border-red-300 bg-red-50 focus:border-red-400" : "border-gray-200 bg-gray-50/60 focus:border-violet-400 focus:bg-white"}`}
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-red-500">{errors.name}</p>
              )}
            </div>
            {/* Provider selector — populated from available-providers API */}
            <div>
              <label className="block text-[12px] font-[600] text-gray-700 mb-1.5">
                Provider
              </label>
              {/* Provider selector — populated from /providers API (all supported types) */}
              <div className="relative">
                <select
                  value={form.provider}
                  onChange={(e) =>
                    setForm({
                      name: form.name,
                      provider: e.target.value,
                      credentials: {},
                    })
                  }
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 pr-9 cursor-pointer"
                >
                  {(allProviderOpts.length > 0
                    ? allProviderOpts
                    : SMTP_PROVIDER_LIST.map((p) => ({
                        value: p.value,
                        label: p.label,
                      }))
                  ).map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              </div>
            </div>
            {/* Dynamic credential fields */}
            {fieldRows.map((row, ri) => (
              <div
                key={ri}
                className={row.length === 2 ? "grid grid-cols-2 gap-3" : ""}
              >
                {row.map((field) => (
                  <CredInput
                    key={field.key}
                    field={field}
                    value={form.credentials[field.key] ?? ""}
                    error={errors[field.key]}
                    onChange={setCred}
                  />
                ))}
              </div>
            ))}
            {/* Smartlead API Key field is hidden from UI, but always passed in credentials */}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setShow(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-[500] text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-[#0a0a0a] text-[13px] font-[600] text-white hover:bg-gray-800 transition disabled:opacity-60 flex items-center gap-2"
              >
                {saving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                {saving ? "Validating & Saving…" : "Validate & Save"}
              </button>
            </div>
          </div>
        </Modal>
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          label={deleteTarget.name}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            del(deleteTarget.key);
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}

/* ── Leads page channel definitions ── */
const LEAD_CHANNELS = [
  {
    key: "call_enabled",
    label: "Call",
    icon: Phone,
    pillClass: "bg-violet-600 text-white border-violet-700",
  },
  {
    key: "email_enabled",
    label: "Email",
    icon: Mail,
    pillClass: "bg-sky-500 text-white border-sky-600",
  },
  {
    key: "linkedin_enabled",
    label: "LinkedIn",
    icon: Linkedin,
    pillClass: "bg-blue-800 text-white border-blue-900",
  },
  {
    key: "whatsapp_enabled",
    label: "WhatsApp",
    icon: MessageCircle,
    pillClass: "bg-green-600 text-white border-green-700",
  },
];

/* ── Shared API error extractor ── */
const getApiError = (err, fallback = "Something went wrong.") =>
  err?.response?.data?.detail || err?.message || fallback;

/* ── Leads ── */
function LeadsPage({ onBack }) {
  const fileRef = useRef(null);

  /* ── All lists ── */
  const LISTS_PER_PAGE = 10;
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [listsPage, setListsPage] = useState(1);
  const [listsTotal, setListsTotal] = useState(0);

  /* ── Create list wizard ── */
  const wizardFileRef = useRef(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", sourceType: "" });
  const [creating, setCreating] = useState(false);
  const [wizardStep, setWizardStep] = useState(1); // 1 = name+source, 2 = upload
  const [createdListId, setCreatedListId] = useState(null);
  const [wizardExcelFile, setWizardExcelFile] = useState(null); // selected file (not yet uploaded)
  const [wizardExcelUploading, setWizardExcelUploading] = useState(false);
  const [wizardCrmImporting, setWizardCrmImporting] = useState(false);

  /* ── Apollo wizard ── */
  const apolloEmptyFilters = {
    company_sizes: [],
    industries: [],
    job_titles: [],
    keywords: [],
    locations: [],
    seniorities: [],
    technologies: [],
  };
  const [apolloFilters, setApolloFilters] = useState({ ...apolloEmptyFilters });
  const [apolloTagInputs, setApolloTagInputs] = useState({
    company_sizes: "",
    industries: "",
    job_titles: "",
    keywords: "",
    locations: "",
    seniorities: "",
    technologies: "",
  });
  const [apolloPreview, setApolloPreview] = useState(null);
  const [apolloPreviewing, setApolloPreviewLoading] = useState(false);
  const [apolloFetching, setApolloFetching] = useState(false);

  /* ── Detail view ── */
  const [viewList, setViewList] = useState(null);
  const [listLeads, setListLeads] = useState([]);
  const [listLeadsLoading, setListLeadsLoading] = useState(false);
  const [leadSearch, setLeadSearch] = useState("");
  const [leadsPage, setLeadsPage] = useState(1);
  const LEADS_PER_PAGE = 10;

  /* ── Upload / import ── */
  const [excelUploading, setExcelUploading] = useState(false);
  const [crmImporting, setCrmImporting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  /* ── List-level selection & download (lists view) ── */
  const [checkedListIds, setCheckedListIds] = useState(new Set());
  const [downloadingListId, setDownloadingListId] = useState(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  /* ── Lead-level selection & download (detail view) ── */
  const [checkedLeadIds, setCheckedLeadIds] = useState(new Set());
  const [downloadingLeads, setDownloadingLeads] = useState(false);

  /* ── Lead info popup ── */
  const [leadInfoModal, setLeadInfoModal] = useState({
    open: false,
    lead: null,
  });
  const [systemData, setSystemData] = useState(null);
  const [systemLoading, setSystemLoading] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  /* ── Export leads to CSV ── */
  const handleDownloadLeads = () => {
    if (!listLeads.length) {
      toast.error("No leads to download.");
      return;
    }
    setDownloading(true);
    try {
      const headers = [
        "Name",
        "Email",
        "Phone",
        "Company",
        "Title",
        "Lead Source",
        "Lead Status",
        "Lead Rating",
        "Street",
        "City",
        "State",
        "Zip",
        "Country",
        "Website",
        "Industry",
        "LinkedIn",
        "Notes",
        "Description",
      ];
      // Standard escape for text fields
      const escape = (v) => {
        const s = String(v ?? "");
        if (s === "") return "";
        return s.includes(",") || s.includes('"') || s.includes("\n")
          ? `"${s.replace(/"/g, '""')}"`
          : s;
      };
      // Force numeric-looking strings (phone, zip, IDs) to display as text in Excel — prevents E+09 scientific notation
      const escapeNum = (v) => {
        const s = String(v ?? "");
        if (s === "") return "";
        // Wrap purely numeric / phone-formatted strings with ="..." so Excel treats them as text
        if (/^[+\d\s\-(). ]+$/.test(s) && /\d/.test(s)) return `="${s}"`;
        return escape(s);
      };
      const rows = listLeads.map((l) => {
        const ld = l.lead_data ?? l;
        return [
          escape(ld.name),
          escape(ld.email_address ?? ld.email),
          escapeNum(ld.contact_number ?? ld.phone), // phone — prevent E notation
          escape(ld.company),
          escape(ld.title),
          escape(ld.lead_source),
          escape(ld.lead_status),
          escape(ld.lead_rating),
          escape(ld.address_street),
          escape(ld.address_city),
          escape(ld.address_state),
          escapeNum(ld.address_zip_code), // zip — preserve leading zeros
          escape(ld.address_country),
          escape(ld.website),
          escape(ld.industry),
          escape(ld.linkedin_url),
          escape(ld.notes),
          escape(ld.description),
        ].join(",");
      });
      const csv = [headers.join(","), ...rows].join("\n");
      // BOM (\uFEFF) ensures Excel opens the file with UTF-8 encoding
      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${viewList?.name ?? "leads"}_leads.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Leads exported successfully.");
    } catch {
      toast.error("Failed to export leads.");
    } finally {
      setDownloading(false);
    }
  };

  /* ── post /lead-lists/{list_id}/download ── */
  const handleApiDownload = async (listId, leadIds = [], selectAll = false) => {
    try {
      const res = await axiosInstance.post(
        `/lead-lists/${listId}/download`,
        { lead_ids: leadIds, select_all: selectAll },
        { responseType: "blob" },
      );
      const blob = new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cd = res.headers?.["content-disposition"] ?? "";
      const match = cd.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      const filename =
        match?.[1]?.replace(/['"]/g, "") ?? `leads_${listId}.csv`;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Leads downloaded successfully.");
    } catch (err) {
      toast.error(getApiError(err, "Failed to download leads."));
    }
  };

  const [deletingLeadId, setDeletingLeadId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const emptyLeadForm = {
    name: "",
    contact_number: "",
    email_address: "",
    company: "",
    title: "",
    lead_source: "",
    lead_status: "",
    lead_rating: "",
    address_street: "",
    address_city: "",
    address_state: "",
    address_zip_code: "",
    address_country: "",
    website: "",
    industry: "",
    linkedin_url: "",
    notes: "",
    description: "",
  };
  const [leadCreateModal, setLeadCreateModal] = useState({
    open: false,
    saving: false,
    data: { ...emptyLeadForm },
  });
  const [leadEditModal, setLeadEditModal] = useState({
    open: false,
    leadId: null,
    data: { ...emptyLeadForm },
    saving: false,
  });

  /* ── Delete entire list ── */
  const [deletingListId, setDeletingListId] = useState(null);
  const [deleteListTarget, setDeleteListTarget] = useState(null); // { id, name }

  const handleDeleteList = async (listId) => {
    setDeletingListId(listId);
    try {
      await axiosInstance.delete(`/lead-lists/${listId}`);
      setLists((p) => p.filter((l) => l.id !== listId));
      toast.success("Lead list deleted.");
    } catch (err) {
      toast.error(getApiError(err) || "Failed to delete lead list.");
    } finally {
      setDeletingListId(null);
    }
  };

  /* ── GET /lead-lists ── */
  const fetchLists = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/lead-lists", {
        params: { page, page_size: LISTS_PER_PAGE },
      });
      const d = res.data;
      const raw = Array.isArray(d)
        ? d
        : Array.isArray(d?.lists)
          ? d.lists
          : Array.isArray(d?.data)
            ? d.data
            : [];
      setLists(raw);
      setListsTotal(d?.total ?? raw.length);
    } catch (err) {
      toast.error(getApiError(err) || "Failed to load lead lists.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists(listsPage);
  }, [listsPage]);

  /* ── Wizard helpers ── */
  const closeWizard = () => {
    setShowCreate(false);
    setForm({ name: "", sourceType: "" });
    setWizardStep(1);
    setCreatedListId(null);
    setWizardExcelFile(null);
    if (wizardFileRef.current) wizardFileRef.current.value = "";
    setApolloFilters({ ...apolloEmptyFilters });
    setApolloTagInputs({
      company_sizes: "",
      industries: "",
      job_titles: "",
      keywords: "",
      locations: "",
      seniorities: "",
      technologies: "",
    });
    setApolloPreview(null);
  };

  /* ── POST /lead-lists (wizard step 1 — Continue button) ── */
  const handleCreate = async () => {
    if (!form.name.trim() || !form.sourceType) return;
    // Apollo creates the list via /apollo/fetch — no pre-create needed
    if (form.sourceType === "apollo") {
      setWizardStep(2);
      return;
    }
    setCreating(true);
    try {
      const res = await axiosInstance.post("/lead-lists", {
        name: form.name.trim(),
        source_type: form.sourceType,
      });
      const id =
        res.data?.id ?? res.data?.list_id ?? res.data?.data?.id ?? null;
      setCreatedListId(id);
      toast.success("Lead list created.");
      setWizardStep(2);
    } catch (err) {
      toast.error(getApiError(err) || "Failed to create lead list.");
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
      await axiosInstance.post(
        `/lead-lists/${createdListId}/upload-excel`,
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      toast.success("Leads uploaded successfully.");
      closeWizard();
      fetchLists();
    } catch (err) {
      toast.error(getApiError(err) || "Excel upload failed.");
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
      toast.error(getApiError(err) || "CRM import failed.");
    } finally {
      setWizardCrmImporting(false);
    }
  };

  /* ── POST /apollo/preview ── */
  const handleApolloPreview = async () => {
    setApolloPreviewLoading(true);
    try {
      const filters = {
        ...apolloFilters,
        keywords: apolloFilters.keywords.join(" "),
      };
      const res = await axiosInstance.post("/apollo/preview", { filters });
      setApolloPreview(res.data?.data ?? res.data);
    } catch (err) {
      toast.error(getApiError(err) || "Apollo preview failed.");
    } finally {
      setApolloPreviewLoading(false);
    }
  };

  /* ── POST /apollo/fetch ── */
  const handleApolloFetch = async () => {
    if (!form.name.trim()) {
      toast.error("List name is required.");
      return;
    }
    setApolloFetching(true);
    try {
      const filters = {
        ...apolloFilters,
        keywords: apolloFilters.keywords.join(" "),
      };
      await axiosInstance.post("/apollo/fetch", {
        confirmed: true,
        estimated_count:
          apolloPreview?.estimated_count ??
          apolloPreview?.count ??
          apolloPreview?.total ??
          0,
        filters,
        list_name: form.name.trim(),
      });
      toast.success("Apollo fetch started! Leads are being imported.");
      closeWizard();
      fetchLists();
    } catch (err) {
      toast.error(getApiError(err) || "Apollo fetch failed.");
    } finally {
      setApolloFetching(false);
    }
  };

  /* ── GET /lead-lists/{id} ── */
  const openDetail = async (list) => {
    setViewList(list);
    setListLeads([]);
    setLeadSearch("");
    setLeadsPage(1);
    setListLeadsLoading(true);
    try {
      const res = await axiosInstance.get(`/lead-lists/${list.id}`);
      const d = res.data;
      // Actual API: { list: {...}, leads: [...], total_leads, page, page_size }
      // Update viewList with the richer detail response (has total_leads, etc.)
      if (d?.list && typeof d.list === "object") setViewList(d.list);
      const raw = Array.isArray(d?.leads)
        ? d.leads
        : Array.isArray(d?.data)
          ? d.data
          : Array.isArray(d?.items)
            ? d.items
            : Array.isArray(d?.results)
              ? d.results
              : Array.isArray(d)
                ? d
                : [];
      setListLeads(raw);
    } catch (err) {
      toast.error(getApiError(err) || "Failed to load leads.");
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
      toast.error(getApiError(err) || "Excel upload failed.");
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
      toast.error(getApiError(err) || "CRM import failed.");
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
      setListLeads((p) =>
        p.filter((l) => (l.id ?? l._id ?? l.list_lead_id) !== leadId),
      );
      toast.success("Lead removed from list.");
    } catch (err) {
      toast.error(getApiError(err) || "Failed to remove lead.");
    } finally {
      setDeletingLeadId(null);
    }
  };

  const openLeadEditor = (lead) => {
    const ld = lead.lead_data ?? lead;
    const safeString = (value) => {
      if (value === undefined || value === null) return "";
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
    };

    setLeadEditModal({
      open: true,
      leadId: lead.id ?? lead._id ?? lead.list_lead_id,
      data: {
        name: safeString(ld.name ?? ld.lead_name ?? ld.full_name ?? ""),
        contact_number: safeString(ld.contact_number ?? ld.phone ?? ""),
        email_address: safeString(ld.email_address ?? ld.email ?? ""),
        company: safeString(ld.company ?? ""),
        title: safeString(ld.title ?? ""),
        lead_source: safeString(ld.lead_source ?? ""),
        lead_status: safeString(ld.lead_status ?? ""),
        lead_rating: safeString(ld.lead_rating ?? ""),
        address_street: safeString(ld.address_street ?? ""),
        address_city: safeString(ld.address_city ?? ""),
        address_state: safeString(ld.address_state ?? ""),
        address_zip_code: safeString(ld.address_zip_code ?? ""),
        address_country: safeString(ld.address_country ?? ""),
        website: safeString(ld.website ?? ""),
        industry: safeString(ld.industry ?? ""),
        linkedin_url: safeString(ld.linkedin_url ?? ""),
        notes: safeString(ld.notes ?? ""),
        description: safeString(ld.description ?? ""),
      },
      saving: false,
    });
  };

  const closeLeadEditor = () => {
    setLeadEditModal({
      open: false,
      leadId: null,
      data: { ...emptyLeadForm },
      saving: false,
    });
  };

  const openLeadCreateModal = () => {
    setLeadCreateModal({
      open: true,
      saving: false,
      data: { ...emptyLeadForm },
    });
  };

  const closeLeadCreateModal = () => {
    setLeadCreateModal({
      open: false,
      saving: false,
      data: { ...emptyLeadForm },
    });
  };

  const saveLeadCreate = async () => {
    if (!viewList?.id) return;

    const payload = {
      name: (leadCreateModal.data.name ?? "").trim(),
      contact_number: (leadCreateModal.data.contact_number ?? "").trim(),
      email_address: (leadCreateModal.data.email_address ?? "").trim(),
      company: (leadCreateModal.data.company ?? "").trim(),
      title: (leadCreateModal.data.title ?? "").trim(),
      lead_source: (leadCreateModal.data.lead_source ?? "").trim(),
      lead_status: (leadCreateModal.data.lead_status ?? "").trim(),
      lead_rating: (leadCreateModal.data.lead_rating ?? "").trim(),
      address_street: (leadCreateModal.data.address_street ?? "").trim(),
      address_city: (leadCreateModal.data.address_city ?? "").trim(),
      address_state: (leadCreateModal.data.address_state ?? "").trim(),
      address_zip_code: (leadCreateModal.data.address_zip_code ?? "").trim(),
      address_country: (leadCreateModal.data.address_country ?? "").trim(),
      website: (leadCreateModal.data.website ?? "").trim(),
      industry: (leadCreateModal.data.industry ?? "").trim(),
      linkedin_url: (leadCreateModal.data.linkedin_url ?? "").trim(),
      notes: (leadCreateModal.data.notes ?? "").trim(),
      description: (leadCreateModal.data.description ?? "").trim(),
    };

    // if (!payload.name || !payload.email_address || !payload.contact_number) {
    //   toast.error("Name, Email Address and Contact Number are required.");
    //   return;
    // }

    setLeadCreateModal((s) => ({ ...s, saving: true }));
    try {
      await axiosInstance.post(`/lead-lists/${viewList.id}/leads`, payload);
      toast.success("Lead added successfully.");
      closeLeadCreateModal();
      await openDetail(viewList);
    } catch (err) {
      toast.error(getApiError(err) || "Failed to add lead.");
      setLeadCreateModal((s) => ({ ...s, saving: false }));
    }
  };

  const saveLeadEditor = async () => {
    if (!leadEditModal.open || !leadEditModal.leadId || !viewList) return;

    const leadId = leadEditModal.leadId;

    setLeadEditModal((s) => ({ ...s, saving: true }));

    const payload = {
      name: leadEditModal.data.name,
      contact_number: leadEditModal.data.contact_number,
      email_address: leadEditModal.data.email_address,
      company: leadEditModal.data.company,
      title: leadEditModal.data.title,
      lead_source: leadEditModal.data.lead_source,
      lead_status: leadEditModal.data.lead_status,
      lead_rating: leadEditModal.data.lead_rating,
      address_street: leadEditModal.data.address_street,
      address_city: leadEditModal.data.address_city,
      address_state: leadEditModal.data.address_state,
      address_zip_code: leadEditModal.data.address_zip_code,
      address_country: leadEditModal.data.address_country,
      website: leadEditModal.data.website,
      industry: leadEditModal.data.industry,
      linkedin_url: leadEditModal.data.linkedin_url,
      notes: leadEditModal.data.notes,
      description: leadEditModal.data.description,
    };

    try {
      await axiosInstance.patch(
        `/lead-lists/${viewList.id}/leads/${leadId}`,
        payload,
      );

      setListLeads((prev) =>
        prev.map((l) => {
          const id = l.id ?? l._id ?? l.list_lead_id;
          if (String(id) !== String(leadId)) return l;
          return {
            ...l,
            lead_data: {
              ...l.lead_data,
              name: payload.name,
              contact_number: payload.contact_number,
              email_address: payload.email_address,
              company: payload.company,
              title: payload.title,
              lead_source: payload.lead_source,
              lead_status: payload.lead_status,
              lead_rating: payload.lead_rating,
              address_street: payload.address_street,
              address_city: payload.address_city,
              address_state: payload.address_state,
              address_zip_code: payload.address_zip_code,
              address_country: payload.address_country,
              website: payload.website,
              industry: payload.industry,
              linkedin_url: payload.linkedin_url,
              notes: payload.notes,
              description: payload.description,
            },
          };
        }),
      );

      toast.success("Lead details updated successfully.");
      closeLeadEditor();
    } catch (err) {
      toast.error(getApiError(err) || "Failed to save lead details.");
    } finally {
      setLeadEditModal((s) => ({ ...s, saving: false }));
    }
  };

  /* ── PATCH /lead-lists/{listId}/leads/{leadId}/channel-flags ── */
  const [togglingChannel, setTogglingChannel] = useState(new Set());
  const handleToggleLeadChannel = async (leadId, channelKey, currentValue) => {
    if (!viewList) return;
    const tKey = `${leadId}_${channelKey}`;
    setTogglingChannel((s) => new Set([...s, tKey]));
    // Capture current channel flags before optimistic update
    const currentLead = listLeads.find(
      (l) => (l.id ?? l._id ?? l.list_lead_id) === leadId,
    );
    const newFlags = {
      call_enabled: !!currentLead?.call_enabled,
      email_enabled: !!currentLead?.email_enabled,
      linkedin_enabled: !!currentLead?.linkedin_enabled,
      whatsapp_enabled: !!currentLead?.whatsapp_enabled,
      [channelKey]: !currentValue,
    };
    // Optimistic update
    setListLeads((prev) =>
      prev.map((l) => {
        const id = l.id ?? l._id ?? l.list_lead_id;
        return id === leadId ? { ...l, [channelKey]: !currentValue } : l;
      }),
    );
    try {
      await axiosInstance.put(
        `/lead-lists/${viewList.id}/leads/${leadId}/channel-flags`,
        newFlags,
      );
    } catch (err) {
      // Revert on failure
      setListLeads((prev) =>
        prev.map((l) => {
          const id = l.id ?? l._id ?? l.list_lead_id;
          return id === leadId ? { ...l, [channelKey]: currentValue } : l;
        }),
      );
      toast.error(getApiError(err) || "Failed to update channel flags.");
    } finally {
      setTogglingChannel((s) => {
        const ns = new Set(s);
        ns.delete(tKey);
        return ns;
      });
    }
  };

  /* ── Lead info popup: fetch system data ── */
  const fetchLeadSystemData = async (lead) => {
    if (!viewList) return;
    const leadId = lead.id ?? lead._id ?? lead.list_lead_id;
    setSystemLoading(true);
    setSystemData(null);
    try {
      const res = await axiosInstance.get(
        `/lead-lists/${viewList.id}/leads/${leadId}`,
      );
      setSystemData(res.data?.data ?? res.data?.lead ?? res.data);
    } catch {
      setSystemData(null);
      toast.error("Failed to fetch system data.");
    } finally {
      setSystemLoading(false);
    }
  };

  /* ── Lead info popup: enrich lead via AI (POST) ── */
  const fetchLeadAiData = async (lead) => {
    if (!viewList) return;
    const listId = viewList.id;
    const listLeadId = lead.list_lead_id ?? lead.id ?? lead._id;
    setAiLoading(true);
    try {
      const res = await axiosInstance.post(
        `/lead-lists/${listId}/leads/${listLeadId}/enrich`,
      );
      const payload = res.data?.data ?? res.data?.lead ?? res.data;
      // enrichment object lives either at top-level or inside the lead payload
      const enrichment = payload?.enrichment ?? payload;
      setAiData(enrichment);
      // Patch the lead in listLeads so reopening the modal reflects new data
      setListLeads((prev) =>
        prev.map((l) => {
          const id = l.list_lead_id ?? l.id ?? l._id;
          if (id === listLeadId) {
            return {
              ...l,
              enrichment,
              lead_data: payload?.lead_data ?? l.lead_data,
            };
          }
          return l;
        }),
      );
      // Keep modal's own lead reference in sync
      setLeadInfoModal((prev) => ({
        ...prev,
        lead: prev.lead
          ? {
              ...prev.lead,
              enrichment,
              lead_data: payload?.lead_data ?? prev.lead.lead_data,
            }
          : prev.lead,
      }));
      toast.success("Lead enriched successfully.");
    } catch {
      toast.error("Failed to enrich lead via AI.");
    } finally {
      setAiLoading(false);
    }
  };

  const openLeadInfoModal = (lead) => {
    setLeadInfoModal({ open: true, lead });
    // Populate directly from the lead object — no extra API call
    setSystemData(lead.lead_data ?? null);
    setAiData(lead.enrichment ?? null);
  };

  const closeLeadInfoModal = () => {
    setLeadInfoModal({ open: false, lead: null });
    setSystemData(null);
    setAiData(null);
  };

  const filteredLists = lists.filter((l) =>
    (l.name ?? "").toLowerCase().includes(search.toLowerCase()),
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
          onBack={() => {
            setViewList(null);
            setListLeads([]);
            setLeadSearch("");
            setLeadsPage(1);
            setCheckedLeadIds(new Set());
          }}
          action={
            <div className="flex items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleExcelUpload}
              />
              {/* Upload Excel — icon only, expands with label on hover */}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={excelUploading}
                title="Upload Excel"
                className="group flex items-center rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-[12px] font-[600] text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm disabled:opacity-50"
              >
                {excelUploading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin shrink-0" />
                ) : (
                  <Upload className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="overflow-hidden max-w-0 group-hover:max-w-[80px] opacity-0 group-hover:opacity-100 ml-0 group-hover:ml-1.5 transition-all duration-200 whitespace-nowrap">
                  Upload
                </span>
              </button>
              {/* CRM Import — icon only, expands on hover */}
              <button
                onClick={handleCRMImport}
                disabled={crmImporting}
                title="Import from CRM"
                className="group flex items-center rounded-xl border border-indigo-200 bg-indigo-50 px-2.5 py-2 text-[12px] font-[600] text-indigo-700 hover:bg-indigo-100 transition-all duration-200 shadow-sm disabled:opacity-50"
              >
                {crmImporting ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin shrink-0" />
                ) : (
                  <Database className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="overflow-hidden max-w-0 group-hover:max-w-[80px] opacity-0 group-hover:opacity-100 ml-0 group-hover:ml-1.5 transition-all duration-200 whitespace-nowrap">
                  CRM Import
                </span>
              </button>
              {/* Refresh — icon only, expands on hover */}
              <button
                onClick={() => openDetail(viewList)}
                disabled={listLeadsLoading}
                title="Refresh leads"
                className="group flex items-center rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 shrink-0 ${listLeadsLoading ? "animate-spin" : ""}`}
                />
                <span className="overflow-hidden max-w-0 group-hover:max-w-[60px] opacity-0 group-hover:opacity-100 ml-0 group-hover:ml-1.5 transition-all duration-200 whitespace-nowrap text-[12px] font-[600]">
                  Refresh
                </span>
              </button>
              {/* Download — icon only, expands on hover */}
              <button
                onClick={async () => {
                  setDownloading(true);
                  await handleApiDownload(viewList.id, [], true);
                  setDownloading(false);
                }}
                disabled={downloading || !listLeads.length}
                title=""
                className="group flex items-center rounded-xl border border-teal-200 bg-teal-50 px-2.5 py-2 text-[12px] font-[600] text-teal-700 hover:bg-teal-100 transition-all duration-200 shadow-sm disabled:opacity-50"
              >
                {downloading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin shrink-0" />
                ) : (
                  <FileDown className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="overflow-hidden max-w-0 group-hover:max-w-[80px] opacity-0 group-hover:opacity-100 ml-0 group-hover:ml-1.5 transition-all duration-200 whitespace-nowrap">
                  Download
                </span>
              </button>
              {/* Add Lead — icon only, expands on hover */}
              <button
                onClick={openLeadCreateModal}
                title="Add Lead"
                className="group flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-[12px] font-[600] text-emerald-700 hover:bg-emerald-100 transition-all duration-200 shadow-sm"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span className="overflow-hidden max-w-0 group-hover:max-w-[80px] opacity-0 group-hover:opacity-100 ml-0 group-hover:ml-1.5 transition-all duration-200 whitespace-nowrap">
                  Add Lead
                </span>
              </button>
            </div>
          }
        />

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Lead selection bulk bar */}
          <AnimatePresence>
            {checkedLeadIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
                className="overflow-hidden"
              >
                <div className="bg-gradient-to-r from-teal-50 via-white to-teal-50 border-b border-teal-200 px-5 py-3 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100">
                      <FileDown className="h-3.5 w-3.5 text-teal-600" />
                    </div>
                    {/* <span className="text-[13px] font-[700] text-teal-800">
                      {checkedLeadIds.size}
                    </span> */}
                    {/* <span className="text-[12px] font-[500] text-teal-600">
                      lead{checkedLeadIds.size !== 1 ? "s" : ""} selected
                    </span> */}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={downloadingLeads}
                      onClick={async () => {
                        setDownloadingLeads(true);
                        // Map list_lead UUIDs → actual lead_id values that the download API expects
                        const downloadLeadIds = Array.from(checkedLeadIds).map(
                          (id) => {
                            const found = listLeads.find(
                              (l) => (l.id ?? l._id ?? l.list_lead_id) === id,
                            );
                            return found?.lead_id ?? id;
                          },
                        );
                        await handleApiDownload(
                          viewList.id,
                          downloadLeadIds,
                          false,
                        );
                        setDownloadingLeads(false);
                        setCheckedLeadIds(new Set());
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-2.5 rounded-xl bg-teal-600 text-white text-[12px] font-[600] hover:bg-teal-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadingLeads ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <FileDown className="h-3.5 w-3.5" />
                      )}
                      {downloadingLeads ? "" : ""}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckedLeadIds(new Set())}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                      title="Clear selection"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {/* Select all checkbox */}
              <button
                type="button"
                onClick={() => {
                  const allIds = filteredLeads.map(
                    (l) => l.id ?? l._id ?? l.list_lead_id,
                  );
                  const allChecked =
                    allIds.length > 0 &&
                    allIds.every((id) => checkedLeadIds.has(id));
                  if (allChecked) setCheckedLeadIds(new Set());
                  else setCheckedLeadIds(new Set(allIds));
                }}
                className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-150 ${
                  filteredLeads.length > 0 &&
                  filteredLeads.every((l) =>
                    checkedLeadIds.has(l.id ?? l._id ?? l.list_lead_id),
                  )
                    ? "bg-teal-600 border-teal-600"
                    : checkedLeadIds.size > 0
                      ? "bg-teal-100 border-teal-400"
                      : "border-gray-300 hover:border-teal-400"
                }`}
              >
                {filteredLeads.length > 0 &&
                filteredLeads.every((l) =>
                  checkedLeadIds.has(l.id ?? l._id ?? l.list_lead_id),
                ) ? (
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : checkedLeadIds.size > 0 ? (
                  <span className="block h-0.5 w-2.5 rounded bg-teal-500" />
                ) : null}
              </button>
              <span className="text-[13px] font-[600] text-gray-900">
                Leads in &quot;{viewList.name}&quot;
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <input
                value={leadSearch}
                onChange={(e) => {
                  setLeadSearch(e.target.value);
                  setLeadsPage(1);
                }}
                placeholder="Search leads…"
                className="pl-7 pr-3 py-1.5 text-[12px] border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition w-[190px] placeholder:text-gray-400"
              />
            </div>
          </div>

          {listLeadsLoading ? (
            <div className="flex items-center justify-center py-20 text-[13px] text-gray-400 animate-pulse">
              Loading leads…
            </div>
          ) : (
            <>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-5 py-3 w-10">
                        <span className="sr-only">Select</span>
                      </th>
                      {[
                        "#",
                        "Name",
                        "Email",
                        "Phone",
                        "Company",
                        "Status",
                        "Channels",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-[11px] font-[600] uppercase tracking-wide text-gray-500 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-5 py-12 text-center text-[13px] text-gray-400"
                        >
                          No leads found
                        </td>
                      </tr>
                    ) : (
                      filteredLeads
                        .slice(
                          (leadsPage - 1) * LEADS_PER_PAGE,
                          leadsPage * LEADS_PER_PAGE,
                        )
                        .map((lead, i) => {
                          const leadId =
                            lead.id ?? lead._id ?? lead.list_lead_id ?? i;
                          const ld = lead.lead_data ?? {};
                          const fullName = ld.name ?? "—";
                          const email = ld.email_address ?? "—";
                          const phone = ld.contact_number ?? "—";
                          const company = ld.company ?? "—";
                          const status =
                            ld.lead_status ?? ld.lead_rating ?? null;
                          const normalizedStatus = String(status ?? "")
                            .trim()
                            .toLowerCase()
                            .replace(/\s+/g, "_");
                          // Keep this status compact in badges.
                          const statusLabel =
                            normalizedStatus === "open_not_contacted"
                              ? "Not Contacted"
                              : status
                                ? String(status)
                                    .replace(/[_-]+/g, " ")
                                    .split(" ")
                                    .filter(Boolean)
                                    .map(
                                      (w) =>
                                        w.charAt(0).toUpperCase() + w.slice(1),
                                    )
                                    .join(" ")
                                : null;
                          const statusCls =
                            normalizedStatus === "dead"
                              ? "bg-red-50 text-red-600 border-red-200"
                              : normalizedStatus === "active"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : normalizedStatus === "converted"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-gray-100 text-gray-600 border-gray-200";
                          return (
                            <tr
                              key={leadId}
                              className={`border-b border-gray-50 hover:bg-gray-50/60 transition ${
                                checkedLeadIds.has(leadId)
                                  ? "bg-teal-50/60 border-l-2 border-l-teal-500"
                                  : i % 2 !== 0
                                    ? "bg-gray-50/30"
                                    : ""
                              }`}
                            >
                              <td className="px-5 py-3.5 w-10">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCheckedLeadIds((prev) => {
                                      const next = new Set(prev);
                                      if (next.has(leadId)) next.delete(leadId);
                                      else next.add(leadId);
                                      return next;
                                    })
                                  }
                                  className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-150 ${
                                    checkedLeadIds.has(leadId)
                                      ? "bg-teal-600 border-teal-600 shadow-sm"
                                      : "border-gray-300 hover:border-teal-400 hover:bg-teal-50"
                                  }`}
                                >
                                  {checkedLeadIds.has(leadId) && (
                                    <svg
                                      className="h-3 w-3 text-white"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={3}
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  )}
                                </button>
                              </td>
                              <td className="px-5 py-3.5 text-[12px] text-gray-400">
                                {(leadsPage - 1) * LEADS_PER_PAGE + i + 1}
                              </td>
                              <td className="px-5 py-3.5 text-[13px] font-[500] text-gray-800 whitespace-nowrap max-w-[160px]">
                                <div className="relative group/name inline-block max-w-full">
                                  <span className="block truncate cursor-default max-w-[150px]">
                                    {fullName}
                                  </span>
                                  {fullName !== "—" && (
                                    <div
                                      className="pointer-events-none absolute bottom-full left-0 mb-1.5 z-50
                                                  hidden group-hover/name:flex
                                                  items-center gap-1.5 px-2.5 py-1.5
                                                  bg-gray-900 text-white text-[11px] font-[500]
                                                  rounded-lg shadow-lg whitespace-nowrap"
                                    >
                                      {fullName}
                                      <span className="absolute top-full left-4 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-3.5 text-[12px] text-gray-600 whitespace-nowrap max-w-[160px]">
                                <div className="relative group/email inline-block max-w-full">
                                  <span className="block truncate cursor-default max-w-[150px]">
                                    {email}
                                  </span>
                                  {email !== "—" && (
                                    <div
                                      className="pointer-events-none absolute bottom-full left-0 mb-1.5 z-50
                                                  hidden group-hover/email:flex
                                                  items-center gap-1.5 px-2.5 py-1.5
                                                  bg-gray-900 text-white text-[11px] font-[500]
                                                  rounded-lg shadow-lg whitespace-nowrap"
                                    >
                                      <Mail className="h-3 w-3 text-gray-400 shrink-0" />
                                      {email}
                                      <span className="absolute top-full left-4 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-3.5 text-[12px] text-gray-600 font-mono whitespace-nowrap">
                                {phone}
                              </td>
                              <td className="px-5 py-3.5 text-[12px] text-gray-600 whitespace-nowrap max-w-[180px]">
                                <div className="relative group/company inline-block max-w-full">
                                  <span className="block truncate cursor-default max-w-[170px]">
                                    {company}
                                  </span>
                                  {company !== "—" && (
                                    <div
                                      className="pointer-events-none absolute bottom-full left-0 mb-1.5 z-50
                                                  hidden group-hover/company:flex
                                                  items-center gap-1.5 px-2.5 py-1.5
                                                  bg-gray-900 text-white text-[11px] font-[500]
                                                  rounded-lg shadow-lg whitespace-nowrap max-w-[320px]"
                                    >
                                      <span className="block truncate">
                                        {company}
                                      </span>
                                      <span className="absolute top-full left-4 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-3.5">
                                {status ? (
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full font-[700] capitalize border ${
                                      statusLabel === "Not Contacted"
                                        ? "text-[9px]"
                                        : "text-[10px]"
                                    } ${statusCls}`}
                                  >
                                    {statusLabel}
                                  </span>
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-1.5">
                                  {/* Show all channels so disabled ones can be enabled quickly */}
                                  {LEAD_CHANNELS.map(
                                    ({ key, label, icon: Icon, pillClass }) => {
                                      const tKey = `${leadId}_${key}`;
                                      const busy = togglingChannel.has(tKey);
                                      const isEnabled = !!lead[key];
                                      return (
                                        <div
                                          key={key}
                                          className="relative group/ch"
                                        >
                                          <button
                                            disabled={busy}
                                            onClick={() =>
                                              handleToggleLeadChannel(
                                                leadId,
                                                key,
                                                isEnabled,
                                              )
                                            }
                                            className={`inline-flex items-center justify-center h-6 w-6 rounded-full border transition disabled:opacity-60 hover:scale-110 hover:shadow-md ${
                                              isEnabled
                                                ? pillClass
                                                : "bg-white text-gray-400 border-gray-300"
                                            }`}
                                          >
                                            {busy ? (
                                              <RefreshCw className="h-3 w-3 animate-spin" />
                                            ) : (
                                              <Icon className="h-3 w-3" />
                                            )}
                                          </button>
                                          {/* Custom tooltip */}
                                          <div
                                            className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50
                                                      hidden group-hover/ch:flex
                                                      items-center px-2 py-1
                                                      bg-gray-900 text-white text-[10px] font-[600]
                                                      rounded-md shadow-lg whitespace-nowrap"
                                          >
                                            {isEnabled
                                              ? `Disable ${label}`
                                              : `Enable ${label}`}
                                            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                                          </div>
                                        </div>
                                      );
                                    },
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => openLeadInfoModal(lead)}
                                    className="text-violet-500 hover:text-violet-700 transition"
                                    title="View lead intelligence"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => openLeadEditor(lead)}
                                    className="text-blue-500 hover:text-blue-700 transition"
                                    title="Edit lead details"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      !deletingLeadId &&
                                      setDeleteTarget({
                                        id: leadId,
                                        name: fullName,
                                      })
                                    }
                                    disabled={deletingLeadId === leadId}
                                    className="text-red-400 hover:text-red-600 transition disabled:opacity-40"
                                    title="Remove lead from list"
                                  >
                                    {deletingLeadId === leadId ? (
                                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <span className="text-[12px] text-gray-400">
                  {filteredLeads.length} of{" "}
                  {viewList.total_leads ?? listLeads.length} leads
                </span>
                {Math.ceil(filteredLeads.length / LEADS_PER_PAGE) > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setLeadsPage((p) => Math.max(1, p - 1))}
                      disabled={leadsPage === 1}
                      className="px-2.5 py-1 rounded-lg border border-gray-200 text-[11px] font-[600] text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      ‹ Prev
                    </button>
                    {Array.from(
                      {
                        length: Math.ceil(
                          filteredLeads.length / LEADS_PER_PAGE,
                        ),
                      },
                      (_, idx) => idx + 1,
                    ).map((pg) => (
                      <button
                        key={pg}
                        onClick={() => setLeadsPage(pg)}
                        className={`w-7 h-7 rounded-lg border text-[11px] font-[600] transition ${
                          pg === leadsPage
                            ? "bg-gray-900 text-white border-gray-900"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {pg}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setLeadsPage((p) =>
                          Math.min(
                            Math.ceil(filteredLeads.length / LEADS_PER_PAGE),
                            p + 1,
                          ),
                        )
                      }
                      disabled={
                        leadsPage ===
                        Math.ceil(filteredLeads.length / LEADS_PER_PAGE)
                      }
                      className="px-2.5 py-1 rounded-lg border border-gray-200 text-[11px] font-[600] text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Next ›
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        {deleteTarget && (
          <DeleteConfirmModal
            label={deleteTarget.name}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={() => {
              handleDeleteLead(deleteTarget.id);
              setDeleteTarget(null);
            }}
            loading={deletingLeadId === deleteTarget?.id}
          />
        )}
        {leadInfoModal.open && leadInfoModal.lead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeLeadInfoModal}
            />
            {/* Panel */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                    <Eye className="h-4 w-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-[14px] font-[700] text-gray-900">
                      Lead Intelligence
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {(leadInfoModal.lead.lead_data ?? leadInfoModal.lead)
                        ?.name ?? "Lead"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeLeadInfoModal}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* ── Available on System ── */}
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-blue-500" />
                      <span className="text-[13px] font-[700] text-gray-800">
                        Prospect Information
                      </span>
                    </div>
                    {/* <button
                      onClick={() => fetchLeadSystemData(leadInfoModal.lead)}
                      disabled={systemLoading}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] font-[600] text-gray-600 hover:bg-white transition disabled:opacity-50"
                      title="Refresh system data"
                    >
                      <RefreshCw
                        className={`h-3 w-3 ${systemLoading ? "animate-spin" : ""}`}
                      />
                      Refresh
                    </button> */}
                  </div>
                  <div className="p-4">
                    {systemLoading ? (
                      <div className="flex items-center justify-center py-8 text-[13px] text-gray-400 animate-pulse">
                        Loading system data…
                      </div>
                    ) : systemData ? (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        {Object.entries(systemData)
                          .filter(
                            ([, v]) =>
                              v !== null &&
                              v !== undefined &&
                              v !== "" &&
                              typeof v !== "object",
                          )
                          .map(([key, val]) => {
                            const str = String(val);
                            const isUrl = /^https?:\/\//i.test(str);
                            return (
                              <div key={key} className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-[600] uppercase tracking-wide text-gray-400">
                                  {key.replace(/[_-]+/g, " ")}
                                </span>
                                {isUrl ? (
                                  <a
                                    href={str}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[12px] text-blue-600 hover:text-blue-800 hover:underline break-all font-[500]"
                                  >
                                    {str}
                                  </a>
                                ) : (
                                  <span className="text-[12px] text-gray-700 break-all">
                                    {str}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
                        <Database className="h-8 w-8 opacity-30" />
                        <span className="text-[12px]">
                          No system data available
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Fetched by AI ── */}
                <div className="rounded-xl border border-violet-100 overflow-hidden">
                  <div className="flex items-center justify-between bg-violet-50 px-4 py-3 border-b border-violet-100">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-violet-500" />
                      <span className="text-[13px] font-[700] text-gray-800">
                        Fetched by AI
                      </span>
                    </div>
                    <button
                      onClick={() => fetchLeadAiData(leadInfoModal.lead)}
                      disabled={aiLoading}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-violet-200 text-[11px] font-[600] text-violet-600 hover:bg-white transition disabled:opacity-50"
                      title="Refresh AI insights"
                    >
                      <RefreshCw
                        className={`h-3 w-3 ${aiLoading ? "animate-spin" : ""}`}
                      />
                      Refresh
                    </button>
                  </div>
                  <div className="p-4">
                    {aiLoading ? (
                      <div className="flex items-center justify-center py-8 text-[13px] text-gray-400 animate-pulse">
                        Fetching AI insights…
                      </div>
                    ) : aiData &&
                      (aiData.apollo ||
                        aiData.apify ||
                        aiData.grok ||
                        aiData.groq) ? (
                      <div className="space-y-5">
                        {/* Metadata: enrichment_type + last_updated_at */}
                        {(aiData.enrichment_type || aiData.last_updated_at) && (
                          <div className="flex items-center gap-3 flex-wrap">
                            {aiData.enrichment_type && (
                              <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 text-[10px] font-[700] capitalize">
                                {aiData.enrichment_type}
                              </span>
                            )}
                            {aiData.last_updated_at && (
                              <span className="text-[10px] text-gray-400">
                                Updated{" "}
                                {new Date(
                                  aiData.last_updated_at,
                                ).toLocaleString()}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Apollo flat fields */}
                        {aiData.apollo && typeof aiData.apollo === "object" && (
                          <div>
                            <p className="text-[10px] font-[700] uppercase tracking-widest text-violet-400 mb-2">
                              Apollo
                            </p>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                              {Object.entries(aiData.apollo)
                                .filter(
                                  ([k, v]) =>
                                    k !== "fetched_at" &&
                                    v !== null &&
                                    v !== undefined &&
                                    v !== "" &&
                                    typeof v !== "object",
                                )
                                .map(([key, val]) => {
                                  const str = String(val);
                                  const isUrl = /^https?:\/\//i.test(str);
                                  return (
                                    <div
                                      key={key}
                                      className="flex flex-col gap-0.5"
                                    >
                                      <span className="text-[10px] font-[600] uppercase tracking-wide text-gray-400">
                                        {key.replace(/[_-]+/g, " ")}
                                      </span>
                                      {isUrl ? (
                                        <a
                                          href={str}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-[12px] text-blue-600 hover:text-blue-800 hover:underline break-all font-[500]"
                                        >
                                          {str}
                                        </a>
                                      ) : (
                                        <span className="text-[12px] text-gray-700 break-all">
                                          {str}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}

                        {/* Apify — LinkedIn posts */}
                        {aiData.apify?.linkedin_posts?.length > 0 && (
                          <div>
                            <p className="text-[10px] font-[700] uppercase tracking-widest text-violet-400 mb-2">
                              LinkedIn Posts (
                              {aiData.apify.linkedin_posts.length})
                            </p>
                            <div className="space-y-2 max-h-52 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                              {aiData.apify.linkedin_posts.map((post, idx) => (
                                <div
                                  key={idx}
                                  className="rounded-lg border border-gray-100 bg-gray-50/60 p-3"
                                >
                                  <div className="flex items-center gap-3 mb-1.5 text-[10px] text-gray-400">
                                    <span>👍 {post.likes ?? 0}</span>
                                    <span>💬 {post.comments ?? 0}</span>
                                    <span>🔁 {post.shares ?? 0}</span>
                                    {post.posted_date && (
                                      <span>
                                        {new Date(
                                          post.posted_date,
                                        ).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-gray-600 line-clamp-3 leading-relaxed">
                                    {post.content}
                                  </p>
                                  {post.url && (
                                    <a
                                      href={post.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[10px] text-violet-500 hover:underline mt-1 inline-block"
                                    >
                                      View post →
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Grok */}
                        {aiData.grok && typeof aiData.grok === "object" && (
                          <div>
                            <p className="text-[10px] font-[700] uppercase tracking-widest text-violet-400 mb-2">
                              Grok
                            </p>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                              {Object.entries(aiData.grok)
                                .filter(
                                  ([, v]) =>
                                    v !== null &&
                                    v !== undefined &&
                                    v !== "" &&
                                    typeof v !== "object",
                                )
                                .map(([key, val]) => {
                                  const str = String(val);
                                  const isUrl = /^https?:\/\//i.test(str);
                                  return (
                                    <div
                                      key={key}
                                      className="flex flex-col gap-0.5"
                                    >
                                      <span className="text-[10px] font-[600] uppercase tracking-wide text-gray-400">
                                        {key.replace(/[_-]+/g, " ")}
                                      </span>
                                      {isUrl ? (
                                        <a
                                          href={str}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-[12px] text-blue-600 hover:text-blue-800 hover:underline break-all font-[500]"
                                        >
                                          {str}
                                        </a>
                                      ) : (
                                        <span className="text-[12px] text-gray-700 break-all">
                                          {str}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}

                        {/* Groq */}
                        {aiData.groq && typeof aiData.groq === "object" && (
                          <div>
                            <p className="text-[10px] font-[700] uppercase tracking-widest text-violet-400 mb-2">
                              Groq
                            </p>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                              {Object.entries(aiData.groq)
                                .filter(
                                  ([, v]) =>
                                    v !== null &&
                                    v !== undefined &&
                                    v !== "" &&
                                    typeof v !== "object",
                                )
                                .map(([key, val]) => {
                                  const str = String(val);
                                  const isUrl = /^https?:\/\//i.test(str);
                                  return (
                                    <div
                                      key={key}
                                      className="flex flex-col gap-0.5"
                                    >
                                      <span className="text-[10px] font-[600] uppercase tracking-wide text-gray-400">
                                        {key.replace(/[_-]+/g, " ")}
                                      </span>
                                      {isUrl ? (
                                        <a
                                          href={str}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-[12px] text-blue-600 hover:text-blue-800 hover:underline break-all font-[500]"
                                        >
                                          {str}
                                        </a>
                                      ) : (
                                        <span className="text-[12px] text-gray-700 break-all">
                                          {str}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
                        <Zap className="h-8 w-8 opacity-30" />
                        <span className="text-[12px]">
                          No AI insights yet. Click Refresh to fetch.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={closeLeadInfoModal}
                  className="px-4 py-2 text-[13px] font-[500] text-gray-600 hover:text-gray-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {leadEditModal.open && (
          <Modal
            title="Edit Lead Details"
            onClose={closeLeadEditor}
            width="max-w-lg"
          >
            <style>{`
              .lead-form-scrollable {
                scrollbar-width: none;
                -ms-overflow-style: none;
              }
              .lead-form-scrollable::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <div className="max-h-96 overflow-y-auto lead-form-scrollable">
              <div className="grid grid-cols-2 gap-3.5">
                <Field
                  label={
                    <>
                      Name <span className="text-red-500">*</span>
                    </>
                  }
                  type="text"
                  placeholder="Enter lead name"
                  value={leadEditModal.data.name}
                  onChange={(value) =>
                    setLeadEditModal((s) => ({
                      ...s,
                      data: { ...s.data, name: value },
                    }))
                  }
                />
                {/* <span className="text-red-500">*</span> */}
                <Field
                  label={<>Email Address </>}
                  type="email"
                  placeholder="Enter email address"
                  value={leadEditModal.data.email_address}
                  onChange={(value) =>
                    setLeadEditModal((s) => ({
                      ...s,
                      data: { ...s.data, email_address: value },
                    }))
                  }
                />
                <Field
                  label={<>Contact Number </>}
                  type="text"
                  placeholder="Enter phone number"
                  value={leadEditModal.data.contact_number}
                  onChange={(value) =>
                    setLeadEditModal((s) => ({
                      ...s,
                      data: { ...s.data, contact_number: value },
                    }))
                  }
                />
                <Field
                  label={
                    <>
                      Company <span className="text-red-500">*</span>
                    </>
                  }
                  type="text"
                  placeholder="Enter company name"
                  value={leadEditModal.data.company}
                  onChange={(value) =>
                    setLeadEditModal((s) => ({
                      ...s,
                      data: { ...s.data, company: value },
                    }))
                  }
                />
                <Field
                  label={
                    <>
                      Title <span className="text-red-500">*</span>
                    </>
                  }
                  type="text"
                  placeholder="Enter job title"
                  value={leadEditModal.data.title}
                  onChange={(value) =>
                    setLeadEditModal((s) => ({
                      ...s,
                      data: { ...s.data, title: value },
                    }))
                  }
                />
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-[11px] font-[600] text-gray-400 mb-3">
                  Additional Information (Optional)
                </p>
                <div className="grid grid-cols-2 gap-3.5">
                  <Field
                    label="Lead Source"
                    type="text"
                    placeholder="e.g. Referral"
                    value={leadEditModal.data.lead_source}
                    onChange={(value) =>
                      setLeadEditModal((s) => ({
                        ...s,
                        data: { ...s.data, lead_source: value },
                      }))
                    }
                  />
                  <Field
                    label="Lead Status"
                    type="text"
                    placeholder="e.g. Active"
                    value={leadEditModal.data.lead_status}
                    onChange={(value) =>
                      setLeadEditModal((s) => ({
                        ...s,
                        data: { ...s.data, lead_status: value },
                      }))
                    }
                  />
                  <Field
                    label="Lead Rating"
                    type="text"
                    placeholder="e.g. Hot"
                    value={leadEditModal.data.lead_rating}
                    onChange={(value) =>
                      setLeadEditModal((s) => ({
                        ...s,
                        data: { ...s.data, lead_rating: value },
                      }))
                    }
                  />
                  <Field
                    label="Address Street"
                    type="text"
                    placeholder="e.g. 123 Main St"
                    value={leadEditModal.data.address_street}
                    onChange={(value) =>
                      setLeadEditModal((s) => ({
                        ...s,
                        data: { ...s.data, address_street: value },
                      }))
                    }
                  />
                  <Field
                    label="Address City"
                    type="text"
                    placeholder="e.g. New York"
                    value={leadEditModal.data.address_city}
                    onChange={(value) =>
                      setLeadEditModal((s) => ({
                        ...s,
                        data: { ...s.data, address_city: value },
                      }))
                    }
                  />
                  <Field
                    label="Address State"
                    type="text"
                    placeholder="e.g. NY"
                    value={leadEditModal.data.address_state}
                    onChange={(value) =>
                      setLeadEditModal((s) => ({
                        ...s,
                        data: { ...s.data, address_state: value },
                      }))
                    }
                  />
                  <Field
                    label="Address Zip Code"
                    type="text"
                    placeholder="e.g. 10001"
                    value={leadEditModal.data.address_zip_code}
                    onChange={(value) =>
                      setLeadEditModal((s) => ({
                        ...s,
                        data: { ...s.data, address_zip_code: value },
                      }))
                    }
                  />
                  <Field
                    label="Address Country"
                    type="text"
                    placeholder="e.g. USA"
                    value={leadEditModal.data.address_country}
                    onChange={(value) =>
                      setLeadEditModal((s) => ({
                        ...s,
                        data: { ...s.data, address_country: value },
                      }))
                    }
                  />
                  <Field
                    label="Website"
                    type="text"
                    placeholder="e.g. www.example.com"
                    value={leadEditModal.data.website}
                    onChange={(value) =>
                      setLeadEditModal((s) => ({
                        ...s,
                        data: { ...s.data, website: value },
                      }))
                    }
                  />
                  <Field
                    label="Industry"
                    type="text"
                    placeholder="e.g. Technology"
                    value={leadEditModal.data.industry}
                    onChange={(value) =>
                      setLeadEditModal((s) => ({
                        ...s,
                        data: { ...s.data, industry: value },
                      }))
                    }
                  />
                  <div className="col-span-2">
                    <Field
                      label="LinkedIn URL"
                      type="text"
                      placeholder="e.g. linkedin.com/in/username"
                      value={leadEditModal.data.linkedin_url}
                      onChange={(value) =>
                        setLeadEditModal((s) => ({
                          ...s,
                          data: { ...s.data, linkedin_url: value },
                        }))
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Field
                      label="Notes"
                      type="textarea"
                      placeholder="Add notes..."
                      value={leadEditModal.data.notes}
                      onChange={(value) =>
                        setLeadEditModal((s) => ({
                          ...s,
                          data: { ...s.data, notes: value },
                        }))
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Field
                      label="Description"
                      type="textarea"
                      placeholder="Add description..."
                      value={leadEditModal.data.description}
                      onChange={(value) =>
                        setLeadEditModal((s) => ({
                          ...s,
                          data: { ...s.data, description: value },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeLeadEditor}
                className="px-4 py-2 text-[13px] font-[500] text-gray-600 hover:text-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveLeadEditor}
                disabled={leadEditModal.saving}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-[13px] font-[600] text-white hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {leadEditModal.saving ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </Modal>
        )}
        {leadCreateModal.open && (
          <Modal
            title="Add Lead"
            onClose={closeLeadCreateModal}
            width="max-w-lg"
          >
            <style>{`
              .lead-form-scrollable {
                scrollbar-width: none;
                -ms-overflow-style: none;
              }
              .lead-form-scrollable::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <div className="max-h-96 overflow-y-auto lead-form-scrollable">
              <div className="grid grid-cols-2 gap-3.5">
                <Field
                  label={<>Name </>}
                  required
                  type="text"
                  placeholder="Enter lead name"
                  value={leadCreateModal.data.name}
                  onChange={(value) =>
                    setLeadCreateModal((s) => ({
                      ...s,
                      data: { ...s.data, name: value },
                    }))
                  }
                />
                <Field
                  label={<>Email Address </>}
                  // required
                  type="email"
                  placeholder="Enter email address"
                  value={leadCreateModal.data.email_address}
                  onChange={(value) =>
                    setLeadCreateModal((s) => ({
                      ...s,
                      data: { ...s.data, email_address: value },
                    }))
                  }
                />
                <Field
                  label={<>Contact Number </>}
                  // required
                  type="text"
                  placeholder="Enter phone number"
                  value={leadCreateModal.data.contact_number}
                  onChange={(value) =>
                    setLeadCreateModal((s) => ({
                      ...s,
                      data: { ...s.data, contact_number: value },
                    }))
                  }
                />
                <Field
                  label={<>Company </>}
                  required
                  type="text"
                  placeholder="Enter company name"
                  value={leadCreateModal.data.company}
                  onChange={(value) =>
                    setLeadCreateModal((s) => ({
                      ...s,
                      data: { ...s.data, company: value },
                    }))
                  }
                />
                <Field
                  label={<>Title </>}
                  required
                  type="text"
                  placeholder="Enter job title"
                  value={leadCreateModal.data.title}
                  onChange={(value) =>
                    setLeadCreateModal((s) => ({
                      ...s,
                      data: { ...s.data, title: value },
                    }))
                  }
                />
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-[11px] font-[600] text-gray-400 mb-3">
                  Additional Information (Optional)
                </p>
                <div className="grid grid-cols-2 gap-3.5">
                  <Field
                    label="Lead Source"
                    type="text"
                    placeholder="e.g. Referral"
                    value={leadCreateModal.data.lead_source}
                    onChange={(value) =>
                      setLeadCreateModal((s) => ({
                        ...s,
                        data: { ...s.data, lead_source: value },
                      }))
                    }
                  />
                  <Field
                    label="Lead Status"
                    type="text"
                    placeholder="e.g. Active"
                    value={leadCreateModal.data.lead_status}
                    onChange={(value) =>
                      setLeadCreateModal((s) => ({
                        ...s,
                        data: { ...s.data, lead_status: value },
                      }))
                    }
                  />
                  <Field
                    label="Lead Rating"
                    type="text"
                    placeholder="e.g. Hot"
                    value={leadCreateModal.data.lead_rating}
                    onChange={(value) =>
                      setLeadCreateModal((s) => ({
                        ...s,
                        data: { ...s.data, lead_rating: value },
                      }))
                    }
                  />
                  <Field
                    label="Address Street"
                    type="text"
                    placeholder="e.g. 123 Main St"
                    value={leadCreateModal.data.address_street}
                    onChange={(value) =>
                      setLeadCreateModal((s) => ({
                        ...s,
                        data: { ...s.data, address_street: value },
                      }))
                    }
                  />
                  <Field
                    label="Address City"
                    type="text"
                    placeholder="e.g. New York"
                    value={leadCreateModal.data.address_city}
                    onChange={(value) =>
                      setLeadCreateModal((s) => ({
                        ...s,
                        data: { ...s.data, address_city: value },
                      }))
                    }
                  />
                  <Field
                    label="Address State"
                    type="text"
                    placeholder="e.g. NY"
                    value={leadCreateModal.data.address_state}
                    onChange={(value) =>
                      setLeadCreateModal((s) => ({
                        ...s,
                        data: { ...s.data, address_state: value },
                      }))
                    }
                  />
                  <Field
                    label="Address Zip Code"
                    type="text"
                    placeholder="e.g. 10001"
                    value={leadCreateModal.data.address_zip_code}
                    onChange={(value) =>
                      setLeadCreateModal((s) => ({
                        ...s,
                        data: { ...s.data, address_zip_code: value },
                      }))
                    }
                  />
                  <Field
                    label="Address Country"
                    type="text"
                    placeholder="e.g. USA"
                    value={leadCreateModal.data.address_country}
                    onChange={(value) =>
                      setLeadCreateModal((s) => ({
                        ...s,
                        data: { ...s.data, address_country: value },
                      }))
                    }
                  />
                  <Field
                    label="Website"
                    type="text"
                    placeholder="e.g. www.example.com"
                    value={leadCreateModal.data.website}
                    onChange={(value) =>
                      setLeadCreateModal((s) => ({
                        ...s,
                        data: { ...s.data, website: value },
                      }))
                    }
                  />
                  <Field
                    label="Industry"
                    type="text"
                    placeholder="e.g. Technology"
                    value={leadCreateModal.data.industry}
                    onChange={(value) =>
                      setLeadCreateModal((s) => ({
                        ...s,
                        data: { ...s.data, industry: value },
                      }))
                    }
                  />
                  <div className="col-span-2">
                    <Field
                      label="LinkedIn URL"
                      type="text"
                      placeholder="e.g. linkedin.com/in/username"
                      value={leadCreateModal.data.linkedin_url}
                      onChange={(value) =>
                        setLeadCreateModal((s) => ({
                          ...s,
                          data: { ...s.data, linkedin_url: value },
                        }))
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Field
                      label="Notes"
                      type="textarea"
                      placeholder="Add notes..."
                      value={leadCreateModal.data.notes}
                      onChange={(value) =>
                        setLeadCreateModal((s) => ({
                          ...s,
                          data: { ...s.data, notes: value },
                        }))
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Field
                      label="Description"
                      type="textarea"
                      placeholder="Add description..."
                      value={leadCreateModal.data.description}
                      onChange={(value) =>
                        setLeadCreateModal((s) => ({
                          ...s,
                          data: { ...s.data, description: value },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeLeadCreateModal}
                className="px-4 py-2 text-[13px] font-[500] text-gray-600 hover:text-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveLeadCreate}
                disabled={leadCreateModal.saving}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-[13px] font-[600] text-white hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {leadCreateModal.saving ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Add Lead"
                )}
              </button>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  /* ════ LISTS VIEW ════ */
  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      const res = await axiosInstance.get("/lead-lists/download-template", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      const cd = res.headers?.["content-disposition"] ?? "";
      const match = cd.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      const filename =
        match?.[1]?.replace(/['"]/g, "") ?? "lead-list-template.xlsx";
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Template downloaded successfully.");
    } catch (err) {
      toast.error(getApiError(err, "Failed to download template."));
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleListDownload = async (listId) => {
    try {
      setDownloadingListId(listId);
      const res = await axiosInstance.post(
        `/lead-lists/${listId}/download`,
        { lead_ids: [], select_all: true },
        { responseType: "blob" },
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      const cd = res.headers?.["content-disposition"] ?? "";
      const match = cd.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      const filename =
        match?.[1]?.replace(/['"]/g, "") ?? `leads-${listId}.csv`;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Leads downloaded successfully.");
    } catch (err) {
      toast.error(getApiError(err, "Download failed."));
    } finally {
      setDownloadingListId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Lead Lists"
        subtitle="Manage lead sources and lists for your campaigns"
        onBack={onBack}
        action={
          <div className="flex items-center gap-2">
            {/* <button
              onClick={fetchLists}
              disabled={loading}
              className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition shadow-sm"
              title="Refresh"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </button> */}
            <button
              onClick={handleDownloadTemplate}
              disabled={downloadingTemplate}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] font-[600] text-gray-700 hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
              title="Download template"
            >
              {downloadingTemplate ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              Download Template
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#0a0a0a] px-4 py-2.5 text-[13px] font-[600] text-white hover:bg-gray-800 transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Create
            </button>
          </div>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-[600] text-gray-900">
              All Lead Lists
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchLists(listsPage)}
              disabled={loading}
              className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition"
              title="Refresh"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
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
          <div className="flex items-center justify-center py-20 text-[13px] text-gray-400 animate-pulse">
            Loading lead lists…
          </div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Name", "Total Leads", "Created", "Action"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-[11px] font-[600] uppercase tracking-wide text-gray-500 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLists.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-[13px] text-gray-400"
                    >
                      No lead lists found
                    </td>
                  </tr>
                ) : (
                  filteredLists.map((l, i) => {
                    const totalLeads =
                      l.total_leads ?? l.total ?? l.lead_count ?? l.count ?? 0;
                    return (
                      <tr
                        key={l.id ?? i}
                        className={`border-b border-gray-50 hover:bg-gray-50/60 transition ${
                          i % 2 !== 0 ? "bg-gray-50/30" : ""
                        }`}
                      >
                        <td className="px-5 py-3.5 text-[13px] font-[600] text-gray-900">
                          {l.name}
                        </td>
                        <td className="px-5 py-3.5 text-[13px] font-[700] text-indigo-700">
                          {totalLeads.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-[12px] text-gray-500">
                          {l.created_at
                            ? new Date(l.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </td>
                        <td className="px-5 py-3.5 flex items-center gap-2">
                          <button
                            onClick={() => openDetail(l)}
                            className="rounded-lg p-1.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 transition"
                            title="View leads"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleListDownload(l.id)}
                            disabled={downloadingListId === l.id}
                            className="rounded-lg p-1.5 text-teal-500 hover:text-teal-700 hover:bg-teal-50 transition disabled:opacity-40"
                            title="Download leads"
                          >
                            {downloadingListId === l.id ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <FileDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              setDeleteListTarget({ id: l.id, name: l.name })
                            }
                            disabled={deletingListId === l.id}
                            className="rounded-lg p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-40"
                            title="Delete list"
                          >
                            {deletingListId === l.id ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <span className="text-[12px] text-gray-400">
                {listsTotal === 0
                  ? "0 lists"
                  : `Showing ${
                      (listsPage - 1) * LISTS_PER_PAGE + 1
                    }–${Math.min(listsPage * LISTS_PER_PAGE, listsTotal)} of ${listsTotal} list${
                      listsTotal !== 1 ? "s" : ""
                    }`}
              </span>
              {Math.ceil(listsTotal / LISTS_PER_PAGE) > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setListsPage((p) => Math.max(1, p - 1))}
                    disabled={listsPage === 1}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none transition text-[13px]"
                  >
                    ‹
                  </button>
                  {Array.from(
                    { length: Math.ceil(listsTotal / LISTS_PER_PAGE) },
                    (_, i) => i + 1,
                  )
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === Math.ceil(listsTotal / LISTS_PER_PAGE) ||
                        Math.abs(p - listsPage) <= 1,
                    )
                    .map((p, idx, arr) => (
                      <React.Fragment key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="text-[12px] text-gray-400 px-1">
                            …
                          </span>
                        )}
                        <button
                          onClick={() => setListsPage(p)}
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border text-[12px] font-[500] transition ${
                            listsPage === p
                              ? "bg-black text-white border-black"
                              : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    ))}
                  <button
                    onClick={() =>
                      setListsPage((p) =>
                        Math.min(Math.ceil(listsTotal / LISTS_PER_PAGE), p + 1),
                      )
                    }
                    disabled={
                      listsPage === Math.ceil(listsTotal / LISTS_PER_PAGE)
                    }
                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none transition text-[13px]"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {deleteListTarget && (
        <DeleteConfirmModal
          label={deleteListTarget.name}
          onCancel={() => setDeleteListTarget(null)}
          onConfirm={() => {
            handleDeleteList(deleteListTarget.id);
            setDeleteListTarget(null);
          }}
          loading={deletingListId === deleteListTarget?.id}
        />
      )}

      {showCreate && (
        <Modal
          title={
            wizardStep === 1
              ? "Create Lead List"
              : form.sourceType === "excel"
                ? "Upload Excel"
                : form.sourceType === "apollo"
                  ? "Apollo Import"
                  : "Import from CRM"
          }
          onClose={closeWizard}
        >
          {/* ── Step indicator ── */}
          <div className="flex items-center gap-2 mb-5">
            {[
              "Details",
              form.sourceType === "crm"
                ? "Import CRM"
                : form.sourceType === "apollo"
                  ? "Apollo Filters"
                  : "Upload Excel",
            ].map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && (
                  <div
                    className={`h-px w-8 ${wizardStep > i ? "bg-indigo-400" : "bg-gray-200"}`}
                  />
                )}
                <div
                  className={`flex items-center gap-1.5 text-[11px] font-[600] px-2.5 py-1 rounded-full border transition ${
                    wizardStep === i + 1
                      ? "bg-[#6366f1] text-white border-[#6366f1]"
                      : wizardStep > i + 1
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-400 border-gray-200"
                  }`}
                >
                  <span>{i + 1}</span> <span>{label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ══ STEP 1: Name + Source Type ══ */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <Field
                label="List Name"
                required
                placeholder="e.g. Q2 Enterprise Targets"
                value={form.name}
                onChange={(val) => setForm((f) => ({ ...f, name: val }))}
              />
              <div>
                <label className="block text-[12px] font-[600] text-gray-700 mb-2">
                  Source Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      value: "excel",
                      label: "Excel / CSV",
                      icon: Upload,
                      desc: "Upload a spreadsheet file",
                    },
                    {
                      value: "crm",
                      label: "CRM",
                      icon: Database,
                      desc: "Import directly from CRM",
                    },
                    {
                      value: "apollo",
                      label: "Apollo",
                      icon: Zap,
                      desc: "Find leads via Apollo.io",
                    },
                  ].map(({ value, label, icon: Icon, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, sourceType: value }))
                      }
                      className={`flex flex-col items-start gap-1 rounded-xl border-2 px-4 py-3.5 text-left transition ${
                        form.sourceType === value
                          ? "border-[#6366f1] bg-[#6366f1]/5"
                          : "border-gray-200 bg-gray-50/60 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`flex items-center gap-2 font-[700] text-[13px] ${
                          form.sourceType === value
                            ? "text-[#6366f1]"
                            : "text-gray-800"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
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
                  {creating ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  {creating ? "Creating…" : "Continue →"}
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 2 — EXCEL ══ */}
          {wizardStep === 2 && form.sourceType === "excel" && (
            <div className="space-y-5">
              <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/60 p-6">
                <p className="text-[13px] font-[600] text-gray-700 mb-1 text-center">
                  Select your Excel / CSV file
                </p>
                <p className="text-[11px] text-gray-400 mb-4 text-center">
                  .xlsx, .xls or .csv — leads will be imported into{" "}
                  <span className="font-[600] text-gray-600">{form.name}</span>
                </p>
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
                      <span className="text-[12px] font-[500] text-green-700 truncate max-w-[220px]">
                        {wizardExcelFile.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                <button
                  onClick={() => {
                    setWizardStep(1);
                    setWizardExcelFile(null);
                    if (wizardFileRef.current) wizardFileRef.current.value = "";
                  }}
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
                    {wizardExcelUploading ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Uploading…
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        Import
                      </>
                    )}
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
                <p className="text-[13px] font-[600] text-gray-700 mb-1">
                  Import from CRM
                </p>
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
                    {wizardCrmImporting ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Importing…
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        Import
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══ STEP 2 — APOLLO ══ */}
          {wizardStep === 2 && form.sourceType === "apollo" && (
            <div className="space-y-5">
              {/* Scrollable filter area */}
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {/* Tag fields for keywords, job_titles, locations, industries */}
                {[
                  {
                    key: "keywords",
                    label: "Keywords",
                    placeholder: "e.g. B2B SaaS — press Enter",
                  },
                  {
                    key: "job_titles",
                    label: "Job Titles",
                    placeholder: "e.g. CEO — press Enter",
                  },
                  {
                    key: "locations",
                    label: "Locations",
                    placeholder: "e.g. New York, USA — press Enter",
                  },
                  {
                    key: "industries",
                    label: "Industries",
                    placeholder: "e.g. Technology — press Enter",
                  },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-[11px] font-[600] uppercase tracking-wide text-gray-500 mb-1.5">
                      {label}
                    </label>
                    <div className="min-h-[42px] flex flex-wrap gap-1.5 items-center p-2 rounded-xl border border-gray-200 bg-gray-50/60 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-400/20 focus-within:bg-white transition">
                      {apolloFilters[key].map((tag, ti) => (
                        <span
                          key={ti}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[11px] font-[600]"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() =>
                              setApolloFilters((f) => ({
                                ...f,
                                [key]: f[key].filter((_, i) => i !== ti),
                              }))
                            }
                            className="inline-flex items-center hover:text-violet-900 transition"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={apolloTagInputs[key]}
                        onChange={(e) =>
                          setApolloTagInputs((t) => ({
                            ...t,
                            [key]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (
                            (e.key === "Enter" || e.key === ",") &&
                            apolloTagInputs[key].trim()
                          ) {
                            e.preventDefault();
                            const val = apolloTagInputs[key]
                              .trim()
                              .replace(/,$/, "");
                            if (val && !apolloFilters[key].includes(val)) {
                              setApolloFilters((f) => ({
                                ...f,
                                [key]: [...f[key], val],
                              }));
                            }
                            setApolloTagInputs((t) => ({ ...t, [key]: "" }));
                          } else if (
                            e.key === "Backspace" &&
                            !apolloTagInputs[key] &&
                            apolloFilters[key].length > 0
                          ) {
                            setApolloFilters((f) => ({
                              ...f,
                              [key]: f[key].slice(0, -1),
                            }));
                          }
                        }}
                        placeholder={
                          apolloFilters[key].length === 0 ? placeholder : ""
                        }
                        className="flex-1 min-w-[120px] bg-transparent border-0 ring-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none text-[12px] text-gray-700 placeholder-gray-400 py-0.5"
                        style={{ outline: "none", boxShadow: "none" }}
                      />
                    </div>
                  </div>
                ))}

                {/* Multi-select for seniorities, technologies, company_sizes */}
                {[
                  {
                    key: "seniorities",
                    label: "Seniorities",
                    options: [
                      "Intern",
                      "Junior",
                      "Mid",
                      "Senior",
                      "Lead",
                      "Director",
                      "VP",
                      "C-Level",
                    ],
                  },
                  {
                    key: "technologies",
                    label: "Technologies",
                    options: [
                      "Salesforce",
                      "HubSpot",
                      "Marketo",
                      "Outreach",
                      "Pardot",
                      "Mailchimp",
                      "Zapier",
                      "Other",
                    ],
                  },
                  {
                    key: "company_sizes",
                    label: "Company Sizes",
                    options: [
                      "1-10",
                      "11-50",
                      "51-200",
                      "201-500",
                      "501-1000",
                      "1001-5000",
                      "5001-10000",
                      "10000+",
                    ],
                  },
                ].map(({ key, label, options }) => (
                  <div key={key}>
                    <label className="block text-[11px] font-[600] uppercase tracking-wide text-gray-500 mb-2">
                      {label}
                    </label>

                    {/* ✅ Custom Multi Select Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {options.map((opt) => {
                        const selected = apolloFilters[key]?.includes(opt);

                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setApolloFilters((f) => {
                                const exists = f[key]?.includes(opt);

                                return {
                                  ...f,
                                  [key]: exists
                                    ? f[key].filter((v) => v !== opt)
                                    : [...(f[key] || []), opt],
                                };
                              });
                            }}
                            className={`px-3 py-1 rounded-full text-[12px] font-[600] border transition ${
                              selected
                                ? "bg-violet-100 text-violet-700 border-violet-300"
                                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* ✅ Selected values preview (same as your tags UI) */}
                    {apolloFilters[key]?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {apolloFilters[key].map((val, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[11px] font-[600]"
                          >
                            {val}
                            <button
                              type="button"
                              onClick={() =>
                                setApolloFilters((f) => ({
                                  ...f,
                                  [key]: f[key].filter((_, i) => i !== idx),
                                }))
                              }
                              className="hover:text-violet-900"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Preview result banner */}
              {apolloPreview && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-[13px] font-[700] text-emerald-800">
                      ~
                      {(
                        apolloPreview.estimated_count ??
                        apolloPreview.count ??
                        apolloPreview.total ??
                        0
                      ).toLocaleString()}{" "}
                      leads found
                    </p>
                    <p className="text-[11px] text-emerald-600">
                      Refine your filters above or click Fetch Leads to import.
                    </p>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                <button
                  onClick={() => {
                    setWizardStep(1);
                    setApolloPreview(null);
                  }}
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
                    onClick={handleApolloPreview}
                    disabled={apolloPreviewing || apolloFetching}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-violet-300 bg-violet-50 text-[13px] font-[600] text-violet-700 hover:bg-violet-100 transition disabled:opacity-50"
                  >
                    {apolloPreviewing ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                    {apolloPreviewing ? "Previewing…" : "Preview"}
                  </button>
                  <button
                    type="button"
                    onClick={handleApolloFetch}
                    disabled={apolloFetching || apolloPreviewing}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0a0a0a] text-[13px] font-[600] text-white hover:bg-gray-800 transition disabled:opacity-50"
                  >
                    {apolloFetching ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Zap className="h-3.5 w-3.5" />
                    )}
                    {apolloFetching ? "Fetching…" : "Fetch Leads"}
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
  { key: "name", label: "Name" },
  { key: "contact_number", label: "Contact Number" },
  { key: "email_address", label: "Email Address" },
  { key: "company", label: "Company" },
  { key: "title", label: "Title" },
  { key: "lead_status", label: "Lead Status" },
  { key: "lead_rating", label: "Lead Rating" },
  { key: "lead_source", label: "Lead Source" },
  { key: "lead_owner_email", label: "Lead Owner Email" },
  { key: "notes", label: "Notes" },
  { key: "description", label: "Description" },
  { key: "activities", label: "Activities" },
  { key: "comments", label: "Comments" },
  { key: "attachments", label: "Attachments" },
  { key: "tasks", label: "Tasks" },
  { key: "address_street", label: "Address Street" },
  { key: "address_city", label: "Address City" },
  { key: "address_state", label: "Address State" },
  { key: "address_zip_code", label: "Address Zip Code" },
  { key: "address_country", label: "Address Country" },
  { key: "client_type", label: "Client Type" },
  { key: "business_area", label: "Business Area" },
  { key: "reason_not_interested", label: "Reason Not Interested" },
  {
    key: "reason_not_interested_other",
    label: "Reason Not Interested (Other)",
  },
  { key: "project_name", label: "Project Name" },
  { key: "project_type", label: "Project Type" },
  { key: "website", label: "Website" },
  { key: "industry", label: "Industry" },
  { key: "no_of_employees", label: "No. of Employees" },
  { key: "annual_revenue", label: "Annual Revenue" },
  { key: "add_prompt", label: "Add Prompt" },
  { key: "last_follow_up_date", label: "Last Follow-up Date" },
  { key: "last_modified_date", label: "Last Modified Date" },
  { key: "linkedin_url", label: "LinkedIn URL" },
];

function MappingsPage({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newMap, setNewMap] = useState({ sysKey: "", crmField: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);

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
    SYSTEM_FIELD_KEYS.map((f) => ({
      id: f.key,
      apiKey: f.key,
      label: f.label,
      crmField: "",
      isCustom: false,
    })),
  );

  /* ── Load existing config on mount ── */
  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/get-integration-config")
      .then((res) => {
        const d = res.data ?? {};
        setConfig({
          integration_mode: d.integration_mode ?? "rest",
          crm_type: d.crm_type ?? "",
          fetch_leads_url: d.fetch_leads_url ?? "",
          fetch_details_url: d.fetch_details_url ?? "",
          update_results_url: d.update_results_url ?? "",
          send_email_url: d.send_email_url ?? "",
        });
        const fm = d.field_mappings ?? {};
        /* Populate predefined rows with API values */
        setMappings((prev) =>
          prev.map((m) => ({
            ...m,
            crmField:
              fm[m.apiKey] !== undefined ? String(fm[m.apiKey]) : m.crmField,
          })),
        );
        /* Append any extra custom keys from API not in predefined list */
        const knownKeys = new Set(SYSTEM_FIELD_KEYS.map((f) => f.key));
        const extras = Object.entries(fm)
          .filter(([k]) => !knownKeys.has(k))
          .map(([k, v]) => ({
            id: k,
            apiKey: k,
            label: k,
            crmField: String(v ?? ""),
            isCustom: true,
          }));
        if (extras.length > 0) setMappings((prev) => [...prev, ...extras]);
      })
      .catch(() => {}) /* silently ignore — user fills manually */
      .finally(() => setLoading(false));
  }, []);

  const updateCrmField = (id, val) =>
    setMappings((p) =>
      p.map((m) => (m.id === id ? { ...m, crmField: val } : m)),
    );

  const remove = (id) => setMappings((p) => p.filter((m) => m.id !== id));

  const addMapping = () => {
    if (!newMap.sysKey.trim()) return;
    const key = newMap.sysKey.trim();
    setMappings((p) => [
      ...p,
      {
        id: `custom_${Date.now()}`,
        apiKey: key,
        label: key,
        crmField: newMap.crmField.trim(),
        isCustom: true,
      },
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
      mappings.forEach((m) => {
        field_mappings[m.apiKey] = m.crmField;
      });
      await axiosInstance.post("/save-integration-config", {
        ...config,
        field_mappings,
      });
      setSaved(true);
      toast.success("Integration config saved.");
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      const msg = getApiError(err) || "Failed to save. Please try again.";
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
        {/* ── Integration Config Section ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-[13px] font-[700] text-gray-800 mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4 text-indigo-500" />
            Integration Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-[600] text-gray-600 mb-1">
                Integration Mode
              </label>
              <div className="relative">
                <select
                  value={config.integration_mode}
                  onChange={(e) =>
                    setConfig((p) => ({
                      ...p,
                      integration_mode: e.target.value,
                    }))
                  }
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
              <label className="block text-[11px] font-[600] text-gray-600 mb-1">
                CRM Type
              </label>
              <input
                value={config.crm_type}
                onChange={(e) =>
                  setConfig((p) => ({ ...p, crm_type: e.target.value }))
                }
                placeholder="e.g. salesforce, hubspot, zoho"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-[600] text-gray-600 mb-1">
                Fetch Leads URL
              </label>
              <input
                value={config.fetch_leads_url}
                onChange={(e) =>
                  setConfig((p) => ({ ...p, fetch_leads_url: e.target.value }))
                }
                placeholder="https://your-crm.com/api/leads"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-[600] text-gray-600 mb-1">
                Fetch Details URL
              </label>
              <input
                value={config.fetch_details_url}
                onChange={(e) =>
                  setConfig((p) => ({
                    ...p,
                    fetch_details_url: e.target.value,
                  }))
                }
                placeholder="https://your-crm.com/api/leads/{id}"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-[600] text-gray-600 mb-1">
                Update Results URL
              </label>
              <input
                value={config.update_results_url}
                onChange={(e) =>
                  setConfig((p) => ({
                    ...p,
                    update_results_url: e.target.value,
                  }))
                }
                placeholder="https://your-crm.com/api/leads/{id}/update"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-[600] text-gray-600 mb-1">
                Send Email URL
              </label>
              <input
                value={config.send_email_url}
                onChange={(e) =>
                  setConfig((p) => ({ ...p, send_email_url: e.target.value }))
                }
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
              <span className="text-[13px] font-[600] text-gray-800">
                All Mappings
              </span>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-[600] text-gray-500">
                {mappings.length} fields
              </span>
              {loading && (
                <span className="text-[11px] text-violet-400 animate-pulse">
                  Loading…
                </span>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search fields…"
                className="pl-7 pr-7 py-1.5 text-[12px] border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition w-[190px] placeholder:text-gray-400"
              />
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
                  <th className="px-5 py-3 text-[11px] font-[600] uppercase tracking-wide text-gray-400">
                    #
                  </th>
                  <th className="px-5 py-3 text-[11px] font-[600] uppercase tracking-wide text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Database className="h-3 w-3" />
                      CRM Field
                    </span>
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
                      {search ? "No matching fields." : "No mappings found."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((m, i) => (
                    <tr
                      key={m.id}
                      className="border-b border-gray-50 hover:bg-violet-50/40 transition-colors group"
                    >
                      <td className="px-5 py-3.5 text-[12px] text-gray-400 font-mono">
                        {i + 1}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[13px] font-[600] text-gray-800">
                            {m.label}
                          </span>
                          <span className="text-[11px] font-mono text-gray-400">
                            {m.apiKey}
                          </span>
                        </div>
                      </td>
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
                          onClick={() =>
                            setDeleteTarget({ id: m.id, label: m.apiKey })
                          }
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
            {saveError ? (
              <span className="text-red-500 font-[500]">{saveError}</span>
            ) : (
              <>
                <span className="font-[600] text-gray-700">
                  {mappings.length}
                </span>{" "}
                mappings configured
              </>
            )}
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
        <Modal
          title="Add Custom Field Mapping"
          onClose={() => setShowAdd(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-[600] text-gray-600 mb-1">
                System Field Key <span className="text-red-500">*</span>
              </label>
              <input
                placeholder="e.g. custom_field"
                value={newMap.sysKey}
                onChange={(e) =>
                  setNewMap((p) => ({ ...p, sysKey: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-[600] text-gray-600 mb-1">
                CRM Field Value
              </label>
              <input
                placeholder="e.g. custom_crm_field"
                value={newMap.crmField}
                onChange={(e) =>
                  setNewMap((p) => ({ ...p, crmField: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
              />
            </div>
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
      {deleteTarget && (
        <DeleteConfirmModal
          label={deleteTarget.label}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            remove(deleteTarget.id);
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN SETTINGS DASHBOARD
════════════════════════════════════════════════════════════ */
function GlobalIntegrationsPage({ onBack, canAccess, smtpProviderList = [] }) {
  const [forms, setForms] = useState({
    twilio: {
      twilio_auth_token: "",
      twilio_sid: "",
    },
    elevenlabs: {
      ELEVENLABS_API_KEY: "",
      ELEVENLABS_INBOUND_AGENT_ID: "",
      ELEVENLABS_INBOUND_PHONE_NUMBER: "",
      ELEVEN_LABS_AGENT_ID: "",
      ELEVEN_LABS_API_KEY: "",
      ELEVEN_LABS_BASE_URL: "https://api.elevenlabs.io/v1/convai",
      ELEVEN_LABS_PHONE_NUMBER: "",
      ELEVEN_LABS_PHONE_NUMBER_ID: "",
      OUTBOUND_CALL_ENDPOINT_URL:
        "https://api.elevenlabs.io/v1/convai/twilio/outbound-call",
    },
    linkedin: {
      APIFY_API_TOKEN: "",
      APOLLO_API_KEY: "",
      ENRICHMENT_CACHE_TTL_DAYS: "30",
      ENRICHMENT_ENABLED: "true",
      LINKEDIN_CACHE_TTL_DAYS: "7",
      LINKEDIN_SCRAPING_ENABLED: "true",
    },
    whatsapp: {
      WHATSAPP_ACCESS_TOKEN: "",
      WHATSAPP_DEFAULT_TEMPLATE: "",
      WHATSAPP_DEFAULT_TEMPLATE_LANG: "",
      WHATSAPP_PHONE_NUMBER_ID: "",
      WHATSAPP_WABA_ID: "",
      WHATSAPP_WEBHOOK_VERIFY_TOKEN: "",
    },
    azure: {
      AZURE_OPENAI_API_KEY: "",
      AZURE_OPENAI_API_MODEL: "text-embedding-ada-002",
      AZURE_OPENAI_ENDPOINT: "",
      AZURE_OPENAI_VERSION: "2023-03-15-preview",
    },
    tmOwnSolution: {
      TM_OWN_SOLUTION_AGENT_ID: "",
      TM_OWN_SOLUTION_API_KEY: "",
      TM_OWN_SOLUTION_API_URL: "",
      TM_OWN_SOLUTION_PHONE_NUMBER_ID: "",
    },
    groq: {
      groq_api_key: "",
      email_deliverability_provider: "",
    },
    enrichment: {
      xai_api_key: "",
      grok_enrichment: "",
      grok_email_style: "",
      enable_grok_enrichment: false,
    },
    appConfig: {
      target_mailbox_for_replies: "",
      timezone_configuration: "",
      graph_client_state: "",
      agent_name: "",
      company_name: "",
      default_agent_name: "",
      company_sales_pain_solution: "",
      about_company: "",
      call_service_provider: "elevenlabs",
      skip_weekend_check: true,
      enable_logs: true,
    },
    linkedin_config: {
      api_key: "",
      dsn: "",
      account_id: "",
      webhook_secret: "",
    },
    campaign_email_settings: {
      email: "",
      reply_to_email: "",
      from_name: "",
      template_id: "",
      smtp_provider_name: "",
      credential: "",
      meeting_schedule: "",
      logged_in_user_email: "",
      campaign_prompt: "",
    },
    smartlead: {
      smartlead_api_key: "",
    },
  });
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [whatsappMetrics, setWhatsappMetrics] = useState({
    delivery_status_distribution: [],
    intent_distribution: [],
    conversation_status_distribution: [],
  });
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [enrichmentFetchLoading, setEnrichmentFetchLoading] = useState({
    xai: false,
    grokEnrichment: false,
    emailStyle: false,
  });

  const setField = (section, key) => (input) => {
    const value = input?.target
      ? input.target.type === "checkbox"
        ? input.target.checked
        : input.target.value
      : input;
    setForms((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  // const fetchWhatsappMetrics = useCallback(async () => {
  //   setMetricsLoading(true);
  //   try {
  //     const response = await axiosInstance.post("/api/metrics/whatsapp-campaigns", {
  //       filter: "this_year",
  //     });
  //     setWhatsappMetrics({
  //       delivery_status_distribution: response.data?.delivery_status_distribution || [],
  //       intent_distribution: response.data?.intent_distribution || [],
  //       conversation_status_distribution: response.data?.conversation_status_distribution || [],
  //     });
  //   } catch (error) {
  //     console.error("Failed to fetch WhatsApp metrics:", error);
  //   } finally {
  //     setMetricsLoading(false);
  //   }
  // }, []);

  useEffect(() => {
    if (!canAccess) {
      setLoading(false);
      return;
    }

    const getObject = (raw) => {
      const payload = raw?.data ?? raw ?? {};
      return (
        payload?.credentials ??
        payload?.data?.credentials ??
        payload?.data ??
        payload
      );
    };
    const asBoolean = (v, fallback) => {
      if (typeof v === "boolean") return v;
      if (typeof v === "string") {
        const low = v.toLowerCase();
        if (low === "true") return true;
        if (low === "false") return false;
      }
      return fallback;
    };

    (async () => {
      setLoading(true);
      const [
        twilioRes,
        elevenlabsRes,
        linkedinRes,
        azureRes,
        tmRes,
        groqRes,
        appConfigRes,
        grokEnrichRes,
        grokEmailRes,
        xaiRes,
        linkedinConfigRes,
        emailTemplatesRes,
        campaignEmailSettingsRes,
      ] = await Promise.allSettled([
        axiosInstance.get("/api/globalsetting/twilio"),
        axiosInstance.get("/api/globalsetting/elevenlabs"),
        axiosInstance.get("/api/globalsetting/linkedin-scraping"),
        axiosInstance.get("/api/globalsetting/azure"),
        axiosInstance.get("/api/globalsetting/tm-own-solution"),
        axiosInstance.get("/api/globalsetting/groq"),
        axiosInstance.get("/api/globalsetting/app-config"),
        axiosInstance.get("/api/globalsetting/grok-enrichment"),
        axiosInstance.get("/api/globalsetting/grok-email-style"),
        axiosInstance.get("/api/globalsetting/xai"),
        axiosInstance.get("/api/admin/linkedin/config"),
        axiosInstance.get("/api/email-templates"),
        axiosInstance.get("/campaign-email-settings"),
      ]);

      setForms((prev) => {
        const next = { ...prev };

        if (twilioRes.status === "fulfilled") {
          const d = getObject(twilioRes.value);
          next.twilio = {
            twilio_auth_token:
              d.twilio_auth_token ??
              d.TWILIO_AUTH_TOKEN ??
              prev.twilio.twilio_auth_token,
            twilio_sid: d.twilio_sid ?? d.TWILIO_SID ?? prev.twilio.twilio_sid,
          };
        }

        if (elevenlabsRes.status === "fulfilled") {
          const d = getObject(elevenlabsRes.value);
          next.elevenlabs = {
            ELEVENLABS_API_KEY:
              d.ELEVENLABS_API_KEY ?? prev.elevenlabs.ELEVENLABS_API_KEY,
            ELEVENLABS_INBOUND_AGENT_ID:
              d.ELEVENLABS_INBOUND_AGENT_ID ??
              prev.elevenlabs.ELEVENLABS_INBOUND_AGENT_ID,
            ELEVENLABS_INBOUND_PHONE_NUMBER:
              d.ELEVENLABS_INBOUND_PHONE_NUMBER ??
              prev.elevenlabs.ELEVENLABS_INBOUND_PHONE_NUMBER,
            ELEVEN_LABS_AGENT_ID:
              d.ELEVEN_LABS_AGENT_ID ?? prev.elevenlabs.ELEVEN_LABS_AGENT_ID,
            ELEVEN_LABS_API_KEY:
              d.ELEVEN_LABS_API_KEY ?? prev.elevenlabs.ELEVEN_LABS_API_KEY,
            ELEVEN_LABS_BASE_URL:
              d.ELEVEN_LABS_BASE_URL ?? prev.elevenlabs.ELEVEN_LABS_BASE_URL,
            ELEVEN_LABS_PHONE_NUMBER:
              d.ELEVEN_LABS_PHONE_NUMBER ??
              prev.elevenlabs.ELEVEN_LABS_PHONE_NUMBER,
            ELEVEN_LABS_PHONE_NUMBER_ID:
              d.ELEVEN_LABS_PHONE_NUMBER_ID ??
              prev.elevenlabs.ELEVEN_LABS_PHONE_NUMBER_ID,
            OUTBOUND_CALL_ENDPOINT_URL:
              d.OUTBOUND_CALL_ENDPOINT_URL ??
              prev.elevenlabs.OUTBOUND_CALL_ENDPOINT_URL,
          };
        }

        if (linkedinRes.status === "fulfilled") {
          const d = getObject(linkedinRes.value);
          next.linkedin = {
            APIFY_API_TOKEN: d.APIFY_API_TOKEN ?? prev.linkedin.APIFY_API_TOKEN,
            APOLLO_API_KEY: d.APOLLO_API_KEY ?? prev.linkedin.APOLLO_API_KEY,
            ENRICHMENT_CACHE_TTL_DAYS: String(
              d.ENRICHMENT_CACHE_TTL_DAYS ??
                prev.linkedin.ENRICHMENT_CACHE_TTL_DAYS,
            ),
            ENRICHMENT_ENABLED: String(
              d.ENRICHMENT_ENABLED ?? prev.linkedin.ENRICHMENT_ENABLED,
            ),
            LINKEDIN_CACHE_TTL_DAYS: String(
              d.LINKEDIN_CACHE_TTL_DAYS ??
                prev.linkedin.LINKEDIN_CACHE_TTL_DAYS,
            ),
            LINKEDIN_SCRAPING_ENABLED: String(
              d.LINKEDIN_SCRAPING_ENABLED ??
                prev.linkedin.LINKEDIN_SCRAPING_ENABLED,
            ),
          };
        }

        if (azureRes.status === "fulfilled") {
          const d = getObject(azureRes.value);
          next.azure = {
            AZURE_OPENAI_API_KEY:
              d.AZURE_OPENAI_API_KEY ?? prev.azure.AZURE_OPENAI_API_KEY,
            AZURE_OPENAI_API_MODEL:
              d.AZURE_OPENAI_API_MODEL ?? prev.azure.AZURE_OPENAI_API_MODEL,
            AZURE_OPENAI_ENDPOINT:
              d.AZURE_OPENAI_ENDPOINT ?? prev.azure.AZURE_OPENAI_ENDPOINT,
            AZURE_OPENAI_VERSION:
              d.AZURE_OPENAI_VERSION ?? prev.azure.AZURE_OPENAI_VERSION,
          };
        }

        if (tmRes.status === "fulfilled") {
          const d = getObject(tmRes.value);
          next.tmOwnSolution = {
            TM_OWN_SOLUTION_AGENT_ID:
              d.TM_OWN_SOLUTION_AGENT_ID ??
              prev.tmOwnSolution.TM_OWN_SOLUTION_AGENT_ID,
            TM_OWN_SOLUTION_API_KEY:
              d.TM_OWN_SOLUTION_API_KEY ??
              prev.tmOwnSolution.TM_OWN_SOLUTION_API_KEY,
            TM_OWN_SOLUTION_API_URL:
              d.TM_OWN_SOLUTION_API_URL ??
              prev.tmOwnSolution.TM_OWN_SOLUTION_API_URL,
            TM_OWN_SOLUTION_PHONE_NUMBER_ID:
              d.TM_OWN_SOLUTION_PHONE_NUMBER_ID ??
              prev.tmOwnSolution.TM_OWN_SOLUTION_PHONE_NUMBER_ID,
          };
        }

        if (groqRes.status === "fulfilled") {
          const d = groqRes.value?.data ?? {};
          next.groq = {
            groq_api_key:
              d.groq_api_key ??
              d.GROQ_API_KEY ??
              d?.credentials?.groq_api_key ??
              prev.groq.groq_api_key,
            email_deliverability_provider:
              d.email_deliverability_provider ??
              prev.groq.email_deliverability_provider,
          };
        }

        if (appConfigRes.status === "fulfilled") {
          const d = appConfigRes.value?.data ?? {};
          next.appConfig = {
            target_mailbox_for_replies:
              d.target_mailbox_for_replies ??
              prev.appConfig.target_mailbox_for_replies,
            timezone_configuration:
              d.timezone_configuration ?? prev.appConfig.timezone_configuration,
            graph_client_state:
              d.graph_client_state ?? prev.appConfig.graph_client_state,
            agent_name: d.agent_name ?? prev.appConfig.agent_name,
            company_name: d.company_name ?? prev.appConfig.company_name,
            default_agent_name:
              d.default_agent_name ?? prev.appConfig.default_agent_name,
            company_sales_pain_solution:
              d.company_sales_pain_solution ??
              prev.appConfig.company_sales_pain_solution,
            about_company: d.about_company ?? prev.appConfig.about_company,
            call_service_provider:
              d.call_service_provider ?? prev.appConfig.call_service_provider,
            skip_weekend_check: asBoolean(
              d.skip_weekend_check,
              prev.appConfig.skip_weekend_check,
            ),
            enable_logs: asBoolean(d.enable_logs, prev.appConfig.enable_logs),
          };
        }

        // Enrichment fields
        const enrichNext = { ...prev.enrichment };
        if (xaiRes.status === "fulfilled") {
          const d = xaiRes.value?.data ?? {};
          enrichNext.xai_api_key =
            d.xai_api_key ??
            d.XAI_API_KEY ??
            d?.credentials?.xai_api_key ??
            prev.enrichment.xai_api_key;
        }
        if (grokEnrichRes.status === "fulfilled") {
          const d = grokEnrichRes.value?.data ?? {};
          enrichNext.grok_enrichment =
            d.grok_enrichment ??
            d.value ??
            d.model ??
            d.grok_enrichment_model ??
            prev.enrichment.grok_enrichment;
          enrichNext.enable_grok_enrichment = asBoolean(
            d.enable_grok_enrichment,
            prev.enrichment.enable_grok_enrichment,
          );
          // Also extract options for dropdown if available
          if (Array.isArray(d.options))
            enrichNext._enrichmentOptions = d.options;
        }
        if (grokEmailRes.status === "fulfilled") {
          const d = grokEmailRes.value?.data ?? {};
          enrichNext.grok_email_style =
            d.grok_email_style ??
            d.value ??
            d.style ??
            d.grok_email_style_model ??
            prev.enrichment.grok_email_style;
          if (Array.isArray(d.options))
            enrichNext._emailStyleOptions = d.options;
        }
        next.enrichment = enrichNext;

        // LinkedIn Configuration
        if (linkedinConfigRes.status === "fulfilled") {
          const d = linkedinConfigRes.value?.data ?? {};
          next.linkedin_config = {
            api_key: d.api_key ?? prev.linkedin_config.api_key,
            dsn: d.dsn ?? prev.linkedin_config.dsn,
            account_id: d.account_id ?? prev.linkedin_config.account_id,
            webhook_secret:
              d.webhook_secret ?? prev.linkedin_config.webhook_secret,
          };
        }

        // Email Templates list (for Template ID dropdown only — no form pre-fill)
        if (emailTemplatesRes.status === "fulfilled") {
          const raw = emailTemplatesRes.value?.data ?? [];
          const list = Array.isArray(raw)
            ? raw
            : (raw.data ?? raw.templates ?? raw.results ?? []);
          setEmailTemplates(
            list.map((t) => ({
              id: t.template_id ?? t.id ?? t._id ?? "",
              name: t.name ?? t.template_name ?? t.template_id ?? t.id ?? "",
              email: t.from_email ?? t.email ?? "",
              reply_to_email: t.reply_to_email ?? "",
              from_name: t.from_name ?? "",
              smtp_provider_name: t.smtp_provider_name ?? "",
              meeting_schedule: t.meeting_schedule ?? "",
              logged_in_user_email: t.logged_in_user_email ?? "",
              campaign_prompt: t.ai_context ?? t.campaign_prompt ?? "",
            })),
          );
        }

        // Campaign Email Settings — other fields from /campaign-email-settings
        if (campaignEmailSettingsRes.status === "fulfilled") {
          const d = campaignEmailSettingsRes.value?.data ?? {};
          next.campaign_email_settings = {
            ...prev.campaign_email_settings,
            email:
              d.email ?? d.from_email ?? prev.campaign_email_settings.email,
            reply_to_email:
              d.reply_to_email ?? prev.campaign_email_settings.reply_to_email,
            from_name: d.from_name ?? prev.campaign_email_settings.from_name,
            smtp_provider_name:
              d.smtp_provider_name ??
              prev.campaign_email_settings.smtp_provider_name,
            credential: d.credential ?? prev.campaign_email_settings.credential,
            meeting_schedule:
              d.meeting_schedule ??
              prev.campaign_email_settings.meeting_schedule,
            logged_in_user_email:
              d.logged_in_user_email ??
              prev.campaign_email_settings.logged_in_user_email,
            campaign_prompt:
              d.campaign_prompt ?? prev.campaign_email_settings.campaign_prompt,
            // template_id stays from the dropdown — do not overwrite
          };
        }

        return next;
      });

      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAccess, refreshTrigger]);

  // useEffect(() => {
  //   fetchWhatsappMetrics();
  // }, [fetchWhatsappMetrics]);

  /* ═══════════════════════ ENRICHMENT API FETCHERS ═══════════════════════ */
  const fetchXaiConfig = async () => {
    try {
      setEnrichmentFetchLoading((prev) => ({ ...prev, xai: true }));
      const res = await axiosInstance.get("/api/globalsetting/xai");
      const d = res.data?.data ?? res.data ?? {};
      setForms((prev) => ({
        ...prev,
        enrichment: {
          ...prev.enrichment,
          xai_api_key:
            d.xai_api_key ?? d.API_KEY ?? prev.enrichment.xai_api_key,
        },
      }));
      toast.success("XAI API Key loaded successfully.");
    } catch (err) {
      toast.error(err?.response?.data?.detail ?? "Failed to load XAI config");
    } finally {
      setEnrichmentFetchLoading((prev) => ({ ...prev, xai: false }));
    }
  };

  const fetchGrokEnrichmentConfig = async () => {
    try {
      setEnrichmentFetchLoading((prev) => ({ ...prev, grokEnrichment: true }));
      const res = await axiosInstance.get("/api/globalsetting/grok-enrichment");
      const d = res.data?.data ?? res.data ?? {};
      setForms((prev) => ({
        ...prev,
        enrichment: {
          ...prev.enrichment,
          grok_enrichment:
            d.grok_enrichment ??
            d.value ??
            d.model ??
            prev.enrichment.grok_enrichment,
          enable_grok_enrichment:
            d.enable_grok_enrichment ?? prev.enrichment.enable_grok_enrichment,
          _enrichmentOptions: Array.isArray(d.options)
            ? d.options
            : prev.enrichment._enrichmentOptions,
        },
      }));
      toast.success("Enrichment Level loaded successfully.");
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ?? "Failed to load Enrichment config",
      );
    } finally {
      setEnrichmentFetchLoading((prev) => ({ ...prev, grokEnrichment: false }));
    }
  };

  const fetchEmailStyleConfig = async () => {
    try {
      setEnrichmentFetchLoading((prev) => ({ ...prev, emailStyle: true }));
      const res = await axiosInstance.get(
        "/api/globalsetting/grok-email-style",
      );
      const d = res.data?.data ?? res.data ?? {};
      setForms((prev) => ({
        ...prev,
        enrichment: {
          ...prev.enrichment,
          grok_email_style:
            d.grok_email_style ??
            d.value ??
            d.style ??
            prev.enrichment.grok_email_style,
          _emailStyleOptions: Array.isArray(d.options)
            ? d.options
            : prev.enrichment._emailStyleOptions,
        },
      }));
      toast.success("Email Style loaded successfully.");
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ?? "Failed to load Email Style config",
      );
    } finally {
      setEnrichmentFetchLoading((prev) => ({ ...prev, emailStyle: false }));
    }
  };

  const saveEnrichmentField = async (fieldName) => {
    try {
      let loadingKey, endpoint, payload;

      if (fieldName === "xai_api_key") {
        loadingKey = "xai";
        endpoint = absoluteApiBaseUrl + "/api/globalsetting/xai";
        payload = { xai_api_key: forms.enrichment.xai_api_key };
      } else if (fieldName === "enable_grok_enrichment") {
        loadingKey = "grokEnrichment";
        endpoint = absoluteApiBaseUrl + "/api/globalsetting/grok-enrichment";
        payload = {
          enable_grok_enrichment: forms.enrichment.enable_grok_enrichment,
        };
      } else if (fieldName === "grok_email_style") {
        loadingKey = "emailStyle";
        endpoint = absoluteApiBaseUrl + "/api/globalsetting/grok-email-style";
        payload = { grok_email_style: forms.enrichment.grok_email_style };
      }

      setEnrichmentFetchLoading((prev) => ({ ...prev, [loadingKey]: true }));

      const res = await axiosInstance.put(endpoint, payload);

      const successMessages = {
        xai_api_key: " API Key saved successfully.",
        enable_grok_enrichment: "Enrichment saved successfully.",
        grok_email_style: "Email Style saved successfully.",
      };
      toast.success(
        successMessages[fieldName] ??
          `${fieldName.replace(/_/g, " ")} saved successfully.`,
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ??
          `Failed to save ${fieldName.replace(/_/g, " ")}`,
      );
    } finally {
      const loadingKey =
        fieldName === "xai_api_key"
          ? "xai"
          : fieldName === "enable_grok_enrichment"
            ? "grokEnrichment"
            : fieldName === "grok_email_style"
              ? "emailStyle"
              : "xai";
      setEnrichmentFetchLoading((prev) => ({ ...prev, [loadingKey]: false }));
    }
  };

  const save = async (section) => {
    if (!canAccess) {
      toast.error("Only admin users can update Global Integrations.");
      return;
    }

    setSavingKey(section);
    try {
      if (section === "twilio") {
        await axiosInstance.put("/api/globalsetting/twilio", {
          credentials: forms.twilio,
        });
      }
      if (section === "elevenlabs") {
        await axiosInstance.put("/api/globalsetting/elevenlabs", {
          credentials: forms.elevenlabs,
        });
      }
      if (section === "linkedin") {
        await axiosInstance.put("/api/globalsetting/linkedin-scraping", {
          credentials: forms.linkedin,
        });
      }
      if (section === "whatsapp") {
        await axiosInstance.put("/api/whatsapp/credentials", {
          WHATSAPP_ACCESS_TOKEN: forms.whatsapp.WHATSAPP_ACCESS_TOKEN,
          WHATSAPP_DEFAULT_TEMPLATE: forms.whatsapp.WHATSAPP_DEFAULT_TEMPLATE,
          WHATSAPP_DEFAULT_TEMPLATE_LANG:
            forms.whatsapp.WHATSAPP_DEFAULT_TEMPLATE_LANG,
          WHATSAPP_PHONE_NUMBER_ID: forms.whatsapp.WHATSAPP_PHONE_NUMBER_ID,
          WHATSAPP_WABA_ID: forms.whatsapp.WHATSAPP_WABA_ID,
          WHATSAPP_WEBHOOK_VERIFY_TOKEN:
            forms.whatsapp.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
        });
      }
      if (section === "azure") {
        await axiosInstance.put("/api/globalsetting/azure", {
          credentials: forms.azure,
        });
      }
      if (section === "tmOwnSolution") {
        await axiosInstance.put("/api/globalsetting/tm-own-solution", {
          credentials: forms.tmOwnSolution,
        });
      }
      if (section === "groq") {
        await axiosInstance.put("/api/globalsetting/groq", {
          groq_api_key: forms.groq.groq_api_key,
          email_deliverability_provider:
            forms.groq.email_deliverability_provider,
        });
      }
      if (section === "enrichment") {
        await Promise.all([
          axiosInstance.put("/api/globalsetting/xai", {
            xai_api_key: forms.enrichment.xai_api_key,
          }),
          axiosInstance.put("/api/globalsetting/grok-enrichment", {
            grok_enrichment: forms.enrichment.grok_enrichment,
            enable_grok_enrichment: !!forms.enrichment.enable_grok_enrichment,
          }),
          axiosInstance.put("/api/globalsetting/grok-email-style", {
            grok_email_style: forms.enrichment.grok_email_style,
          }),
        ]);
      }
      if (section === "appConfig") {
        await axiosInstance.put("/api/globalsetting/app-config", {
          target_mailbox_for_replies:
            forms.appConfig.target_mailbox_for_replies,
          timezone_configuration: forms.appConfig.timezone_configuration,
          graph_client_state: forms.appConfig.graph_client_state,
          agent_name: forms.appConfig.agent_name,
          company_name: forms.appConfig.company_name,
          default_agent_name: forms.appConfig.default_agent_name,
          company_sales_pain_solution:
            forms.appConfig.company_sales_pain_solution,
          about_company: forms.appConfig.about_company,
          call_service_provider: forms.appConfig.call_service_provider,
          skip_weekend_check: !!forms.appConfig.skip_weekend_check,
          enable_logs: !!forms.appConfig.enable_logs,
        });
      }
      if (section === "linkedin_config") {
        await axiosInstance.put("/api/admin/linkedin/config", {
          api_key: forms.linkedin_config.api_key,
          dsn: forms.linkedin_config.dsn,
          account_id: forms.linkedin_config.account_id,
          webhook_secret: forms.linkedin_config.webhook_secret,
        });
      }
      if (section === "campaign_email_settings") {
        await axiosInstance.put("/campaign-email-settings", {
          email: forms.campaign_email_settings.email,
          reply_to_email: forms.campaign_email_settings.reply_to_email,
          from_name: forms.campaign_email_settings.from_name,
          template_id: forms.campaign_email_settings.template_id,
          smtp_provider_name: forms.campaign_email_settings.smtp_provider_name,
          credential: forms.campaign_email_settings.credential,
          meeting_schedule: forms.campaign_email_settings.meeting_schedule,
          logged_in_user_email:
            forms.campaign_email_settings.logged_in_user_email,
          campaign_prompt: forms.campaign_email_settings.campaign_prompt,
        });
      }
      if (section === "smartlead") {
        await axiosInstance.put("/api/deliverability/smartlead/settings", {
          smartlead_api_key: forms.smartlead.smartlead_api_key,
        });
      }
      const sectionLabels = {
        twilio: "Twilio",
        elevenlabs: "ElevenLabs",
        linkedin: "LinkedIn",
        whatsapp: "WhatsApp",
        azure: "Azure",
        tmOwnSolution: "TM Own Solution",
        groq: "Groq",
        enrichment: "Grok Enrichment",
        appConfig: "App Configuration",
        linkedin_config: "LinkedIn Config",
        smartlead: "Smartlead",
      };
      toast.success(
        `${sectionLabels[section] ?? "Configuration"} saved successfully.`,
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ??
          getApiError(err) ??
          "Failed to save configuration.",
      );
    } finally {
      setSavingKey(null);
    }
  };

  const SaveBtn = ({ section }) => (
    <button
      type="button"
      onClick={() => save(section)}
      disabled={savingKey === section}
      className="flex items-center justify-center gap-1.5 rounded-xl bg-[#0a0a0a] px-4 py-2 text-[12px] font-[600] text-white hover:bg-gray-800 transition disabled:opacity-60"
    >
      {savingKey === section ? (
        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Settings className="h-3.5 w-3.5" />
      )}
      {savingKey === section ? "Saving…" : "Save"}
    </button>
  );

  return (
    <div className="anim-fade">
      <AnimStyles />
      <PageHeader
        title="Global Integrations"
        subtitle="Configure Twilio, ElevenLabs, LinkedIn scraping, WhatsApp, Azure, TM solution, Groq and app-level settings"
        onBack={onBack}
        action={
          <button
            onClick={() => setRefreshTrigger((t) => t + 1)}
            disabled={loading}
            className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        }
      />

      {!canAccess ? (
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="text-[15px] font-[700] text-gray-900">
                Access Restricted
              </h3>
              <p className="text-[13px] text-gray-500 mt-1">
                Global Integrations can be viewed and updated only by admin
                users.
              </p>
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex items-center justify-center gap-2 text-[13px] text-gray-500">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-500" /> Loading
          global settings...
        </div>
      ) : (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-600" />
                <h3 className="text-[14px] font-[700] text-gray-900">Twilio</h3>
              </div>
              <SaveBtn section="twilio" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Twilio SID"
                value={forms.twilio.twilio_sid}
                onChange={setField("twilio", "twilio_sid")}
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
              <Field
                label="Twilio Auth Token"
                type="password"
                value={forms.twilio.twilio_auth_token}
                onChange={setField("twilio", "twilio_auth_token")}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-violet-600" />
                <h3 className="text-[14px] font-[700] text-gray-900">
                  ElevenLabs Configuration
                </h3>
              </div>
              <SaveBtn section="elevenlabs" />
            </div>
            <div className="space-y-5">
              {/* ── INBOUND CALLS ── */}
              <div className="border-l-4 border-green-400 pl-4">
                <h4 className="text-[12px] font-[700] uppercase tracking-wider text-green-700 mb-3">
                  📲 Inbound Calls Configuration
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="API Key"
                    type="password"
                    value={forms.elevenlabs.ELEVENLABS_API_KEY}
                    onChange={setField("elevenlabs", "ELEVENLABS_API_KEY")}
                    placeholder="sk_..."
                  />
                  <Field
                    label="Agent ID"
                    value={forms.elevenlabs.ELEVENLABS_INBOUND_AGENT_ID}
                    onChange={setField(
                      "elevenlabs",
                      "ELEVENLABS_INBOUND_AGENT_ID",
                    )}
                    placeholder="agent_..."
                  />
                  <div className="sm:col-span-2">
                    <Field
                      label="Inbound Phone Number"
                      value={forms.elevenlabs.ELEVENLABS_INBOUND_PHONE_NUMBER}
                      onChange={setField(
                        "elevenlabs",
                        "ELEVENLABS_INBOUND_PHONE_NUMBER",
                      )}
                      placeholder="+1 929 329 3858"
                      hint="Phone number customers call for inbound calls"
                    />
                  </div>
                </div>
              </div>

              {/* ── OUTBOUND CALLS ── */}
              <div className="border-l-4 border-blue-400 pl-4">
                <h4 className="text-[12px] font-[700] uppercase tracking-wider text-blue-700 mb-3">
                  ☎️ Outbound Calls Configuration
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="API Key"
                    type="password"
                    value={forms.elevenlabs.ELEVEN_LABS_API_KEY}
                    onChange={setField("elevenlabs", "ELEVEN_LABS_API_KEY")}
                    placeholder="sk_..."
                  />
                  <Field
                    label="Agent ID"
                    value={forms.elevenlabs.ELEVEN_LABS_AGENT_ID}
                    onChange={setField("elevenlabs", "ELEVEN_LABS_AGENT_ID")}
                    placeholder="agent_..."
                  />
                  <Field
                    label="Phone Number"
                    value={forms.elevenlabs.ELEVEN_LABS_PHONE_NUMBER}
                    onChange={setField(
                      "elevenlabs",
                      "ELEVEN_LABS_PHONE_NUMBER",
                    )}
                    placeholder="+1 929 329 3858"
                    hint="Phone number used for outbound calls"
                  />
                  <Field
                    label="Phone Number ID"
                    value={forms.elevenlabs.ELEVEN_LABS_PHONE_NUMBER_ID}
                    onChange={setField(
                      "elevenlabs",
                      "ELEVEN_LABS_PHONE_NUMBER_ID",
                    )}
                    placeholder="phnum_..."
                  />
                  <Field
                    label="Base URL"
                    value={forms.elevenlabs.ELEVEN_LABS_BASE_URL}
                    onChange={setField("elevenlabs", "ELEVEN_LABS_BASE_URL")}
                    placeholder="https://api.elevenlabs.io/v1/convai"
                  />
                  <div className="sm:col-span-2">
                    <Field
                      label="Outbound Call Endpoint URL"
                      value={forms.elevenlabs.OUTBOUND_CALL_ENDPOINT_URL}
                      onChange={setField(
                        "elevenlabs",
                        "OUTBOUND_CALL_ENDPOINT_URL",
                      )}
                      placeholder="https://api.elevenlabs.io/v1/convai/twilio/outbound-call"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-sky-600" />
                <h3 className="text-[14px] font-[700] text-gray-900">
                  LinkedIn Scraping
                </h3>
              </div>
              <SaveBtn section="linkedin" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="APIFY API Token"
                type="password"
                value={forms.linkedin.APIFY_API_TOKEN}
                onChange={setField("linkedin", "APIFY_API_TOKEN")}
              />
              <Field
                label="APOLLO API Key"
                type="password"
                value={forms.linkedin.APOLLO_API_KEY}
                onChange={setField("linkedin", "APOLLO_API_KEY")}
              />
              <Field
                label="Enrichment Cache TTL (days)"
                value={forms.linkedin.ENRICHMENT_CACHE_TTL_DAYS}
                onChange={setField("linkedin", "ENRICHMENT_CACHE_TTL_DAYS")}
              />
              <SelectField
                label="Enrichment Enabled"
                value={forms.linkedin.ENRICHMENT_ENABLED}
                onChange={setField("linkedin", "ENRICHMENT_ENABLED")}
                options={[
                  { label: "true", value: "true" },
                  { label: "false", value: "false" },
                ]}
              />
              <Field
                label="LinkedIn Cache TTL (days)"
                value={forms.linkedin.LINKEDIN_CACHE_TTL_DAYS}
                onChange={setField("linkedin", "LINKEDIN_CACHE_TTL_DAYS")}
              />
              <SelectField
                label="LinkedIn Scraping Enabled"
                value={forms.linkedin.LINKEDIN_SCRAPING_ENABLED}
                onChange={setField("linkedin", "LINKEDIN_SCRAPING_ENABLED")}
                options={[
                  { label: "true", value: "true" },
                  { label: "false", value: "false" },
                ]}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-green-600" />
                <h3 className="text-[14px] font-[700] text-gray-900">
                  WhatsApp Integration
                </h3>
              </div>
              <SaveBtn section="whatsapp" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Access Token"
                type="password"
                value={forms.whatsapp.WHATSAPP_ACCESS_TOKEN}
                onChange={setField("whatsapp", "WHATSAPP_ACCESS_TOKEN")}
                placeholder="EAAxxxxxxxxxxxxxxx"
              />
              <Field
                label="Phone Number ID"
                value={forms.whatsapp.WHATSAPP_PHONE_NUMBER_ID}
                onChange={setField("whatsapp", "WHATSAPP_PHONE_NUMBER_ID")}
                placeholder="123456789012345"
              />
              <Field
                label="WABA ID"
                value={forms.whatsapp.WHATSAPP_WABA_ID}
                onChange={setField("whatsapp", "WHATSAPP_WABA_ID")}
                placeholder="987654321098765"
              />
              <Field
                label="Default Template"
                value={forms.whatsapp.WHATSAPP_DEFAULT_TEMPLATE}
                onChange={setField("whatsapp", "WHATSAPP_DEFAULT_TEMPLATE")}
                placeholder="hello-world"
              />
              <Field
                label="Default Template Language"
                value={forms.whatsapp.WHATSAPP_DEFAULT_TEMPLATE_LANG}
                onChange={setField(
                  "whatsapp",
                  "WHATSAPP_DEFAULT_TEMPLATE_LANG",
                )}
                placeholder="en-US"
              />
              <Field
                label="Webhook Verify Token"
                type="password"
                value={forms.whatsapp.WHATSAPP_WEBHOOK_VERIFY_TOKEN}
                onChange={setField("whatsapp", "WHATSAPP_WEBHOOK_VERIFY_TOKEN")}
                placeholder="my-secret-verify-token"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-sky-600" />
                <h3 className="text-[14px] font-[700] text-gray-900">
                  LinkedIn Configuration
                </h3>
              </div>
              <SaveBtn section="linkedin_config" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="API Key"
                type="password"
                value={forms.linkedin_config.api_key}
                onChange={setField("linkedin_config", "api_key")}
                placeholder="your-api-key"
              />
              <Field
                label="DSN"
                value={forms.linkedin_config.dsn}
                onChange={setField("linkedin_config", "dsn")}
                placeholder="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"
              />
              <Field
                label="Account ID"
                value={forms.linkedin_config.account_id}
                onChange={setField("linkedin_config", "account_id")}
                placeholder="account-id"
              />
              <Field
                label="Webhook Secret"
                type="password"
                value={forms.linkedin_config.webhook_secret}
                onChange={setField("linkedin_config", "webhook_secret")}
                placeholder="webhook-secret-key"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-orange-600" />
                <h3 className="text-[14px] font-[700] text-gray-900">
                  Advance Campaign Configuration
                </h3>
              </div>
              <SaveBtn section="campaign_email_settings" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="From Email"
                type="email"
                value={forms.campaign_email_settings.email}
                onChange={setField("campaign_email_settings", "email")}
                placeholder="noreply@company.com"
              />
              <Field
                label="Reply To Email"
                type="email"
                value={forms.campaign_email_settings.reply_to_email}
                onChange={setField("campaign_email_settings", "reply_to_email")}
                placeholder="support@company.com"
              />
              <Field
                label="From Name"
                value={forms.campaign_email_settings.from_name}
                onChange={setField("campaign_email_settings", "from_name")}
                placeholder="Your Company Name"
              />
              <div>
                <label className="block text-[12px] font-[600] text-gray-700 mb-1.5">
                  Template Name
                </label>
                <div className="relative">
                  <select
                    value={forms.campaign_email_settings.template_id}
                    onChange={(e) => {
                      const selected = emailTemplates.find(
                        (t) => String(t.id) === e.target.value,
                      );
                      setForms((prev) => ({
                        ...prev,
                        campaign_email_settings: {
                          ...prev.campaign_email_settings,
                          template_id: e.target.value,
                          ...(selected?.email && { email: selected.email }),
                          ...(selected?.reply_to_email && {
                            reply_to_email: selected.reply_to_email,
                          }),
                          ...(selected?.from_name && {
                            from_name: selected.from_name,
                          }),
                          ...(selected?.smtp_provider_name && {
                            smtp_provider_name: selected.smtp_provider_name,
                          }),
                          ...(selected?.meeting_schedule && {
                            meeting_schedule: selected.meeting_schedule,
                          }),
                          ...(selected?.logged_in_user_email && {
                            logged_in_user_email: selected.logged_in_user_email,
                          }),
                          ...(selected?.campaign_prompt && {
                            campaign_prompt: selected.campaign_prompt,
                          }),
                        },
                      }));
                    }}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 pr-9 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="">— Select a template —</option>
                    {emailTemplates.map((t) => (
                      <option key={t.id} value={String(t.id)}>
                        {t.name || t.id}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-[600] text-gray-700 mb-1.5">
                  SMTP Provider Name
                </label>
                <div className="relative">
                  <select
                    value={forms.campaign_email_settings.smtp_provider_name || ""}
                    onChange={(e) =>
                      setForms((prev) => ({
                        ...prev,
                        campaign_email_settings: {
                          ...prev.campaign_email_settings,
                          smtp_provider_name: e.target.value,
                        },
                      }))
                    }
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 pr-9 cursor-pointer"
                  >
                    <option value="">— Select SMTP Provider —</option>
                    {smtpProviderList.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                </div>
              </div>
              {/* <Field
                label="Credential"
                type="password"
                value={forms.campaign_email_settings.credential}
                onChange={setField("campaign_email_settings", "credential")}
                placeholder="API key or credentials"
              /> */}
              <Field
                label="Meeting Schedule"
                value={forms.campaign_email_settings.meeting_schedule}
                onChange={setField(
                  "campaign_email_settings",
                  "meeting_schedule",
                )}
                placeholder="e.g., cron expression or schedule"
              />
              <Field
                label="Logged In User Email"
                type="email"
                value={forms.campaign_email_settings.logged_in_user_email}
                onChange={setField(
                  "campaign_email_settings",
                  "logged_in_user_email",
                )}
                placeholder="current-user@company.com"
              />
              <div className="sm:col-span-2">
                <label className="block text-[12px] font-[600] text-gray-700 mb-1.5">
                  Campaign Prompt
                </label>
                <textarea
                  rows={4}
                  value={forms.campaign_email_settings.campaign_prompt}
                  onChange={(e) =>
                    setField(
                      "campaign_email_settings",
                      "campaign_prompt",
                    )(e.target.value)
                  }
                  placeholder="Enter the campaign prompt or instructions for the AI agent..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-orange-600" />
                <h3 className="text-[14px] font-[700] text-gray-900">
                  Smart Lead Configuration
                </h3>
              </div>
              <SaveBtn section="smartlead" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
              <Field
                label={
                  <>
                    Smartlead API Key<span className="text-red-500 ml-0.5">*</span>
                  </>
                }
                type="text"
                value={
                  forms.smartlead.smartlead_api_key ||
                  (forms.smartlead.credentials && forms.smartlead.credentials.SMARTLEAD_API_KEY) ||
                  ""
                }
                onChange={e => {
                  setForms(prev => ({
                    ...prev,
                    smartlead: {
                      ...prev.smartlead,
                      smartlead_api_key: e.target.value,
                      credentials: {
                        ...(prev.smartlead.credentials || {}),
                        SMARTLEAD_API_KEY: e.target.value,
                      },
                    },
                  }));
                }}
                placeholder="Enter Smartlead API Key"
              />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-600" />
                <h3 className="text-[14px] font-[700] text-gray-900">
                  Azure Services Key
                </h3>
              </div>
              <SaveBtn section="azure" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Azure OPENAI API Key"
                type="password"
                value={forms.azure.AZURE_OPENAI_API_KEY}
                onChange={setField("azure", "AZURE_OPENAI_API_KEY")}
              />
              <Field
                label=" Azure OPENAI API Model"
                value={forms.azure.AZURE_OPENAI_API_MODEL}
                onChange={setField("azure", "AZURE_OPENAI_API_MODEL")}
              />
              <Field
                label="Azure OPENAI Endpoint"
                value={forms.azure.AZURE_OPENAI_ENDPOINT}
                onChange={setField("azure", "AZURE_OPENAI_ENDPOINT")}
              />
              <Field
                label="Azure OPENAI API Version"
                value={forms.azure.AZURE_OPENAI_VERSION}
                onChange={setField("azure", "AZURE_OPENAI_VERSION")}
              />{" "}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-600" />
                <h3 className="text-[14px] font-[700] text-gray-900">
                  TM Own Solution
                </h3>
              </div>
              <SaveBtn section="tmOwnSolution" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Agent ID"
                value={forms.tmOwnSolution.TM_OWN_SOLUTION_AGENT_ID}
                onChange={setField("tmOwnSolution", "TM_OWN_SOLUTION_AGENT_ID")}
              />
              <Field
                label="API Key"
                type="password"
                value={forms.tmOwnSolution.TM_OWN_SOLUTION_API_KEY}
                onChange={setField("tmOwnSolution", "TM_OWN_SOLUTION_API_KEY")}
              />
              <Field
                label="API URL"
                value={forms.tmOwnSolution.TM_OWN_SOLUTION_API_URL}
                onChange={setField("tmOwnSolution", "TM_OWN_SOLUTION_API_URL")}
              />
              <Field
                label="Phone Number ID"
                value={forms.tmOwnSolution.TM_OWN_SOLUTION_PHONE_NUMBER_ID}
                onChange={setField(
                  "tmOwnSolution",
                  "TM_OWN_SOLUTION_PHONE_NUMBER_ID",
                )}
              />{" "}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-600" />
                <h3 className="text-[14px] font-[700] text-gray-900">
                  AI Services
                </h3>
              </div>
              <SaveBtn section="groq" />
            </div>

            <Field
              label="API Key"
              type="password"
              value={forms.groq.groq_api_key}
              onChange={setField("groq", "groq_api_key")}
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-teal-600" />
                <h3 className="text-[14px] font-[700] text-gray-900">
                  Enrichment
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Field
                      label="API Key (XAI)"
                      type="password"
                      value={forms.enrichment.xai_api_key}
                      onChange={setField("enrichment", "xai_api_key")}
                      placeholder="api-xxxxxxxxxxxxxxxx"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => saveEnrichmentField("xai_api_key")}
                    disabled={enrichmentFetchLoading.xai}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-[#0a0a0a] px-4 py-2 text-[12px] font-[600] text-white hover:bg-gray-800 transition disabled:opacity-60"
                    title="Save XAI API Key"
                  >
                    {enrichmentFetchLoading.xai ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Settings className="h-3.5 w-3.5" />
                    )}
                    {enrichmentFetchLoading.xai ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
              <div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <SelectField
                      label="Enrichment Level"
                      value={String(!!forms.enrichment.enable_grok_enrichment)}
                      onChange={(e) =>
                        setForms((prev) => ({
                          ...prev,
                          enrichment: {
                            ...prev.enrichment,
                            enable_grok_enrichment: e.target.value === "true",
                          },
                        }))
                      }
                      options={[
                        { label: "Advanced", value: "true" },
                        { label: "Base", value: "false" },
                      ]}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      saveEnrichmentField("enable_grok_enrichment")
                    }
                    disabled={enrichmentFetchLoading.grokEnrichment}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-[#0a0a0a] px-4 py-2 text-[12px] font-[600] text-white hover:bg-gray-800 transition disabled:opacity-60"
                    title="Save Enrichment Level"
                  >
                    {enrichmentFetchLoading.grokEnrichment ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Settings className="h-3.5 w-3.5" />
                    )}
                    {enrichmentFetchLoading.grokEnrichment
                      ? "Saving..."
                      : "Save"}
                  </button>
                </div>
              </div>
              <div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <SelectField
                      label="Email Style"
                      value={forms.enrichment.grok_email_style}
                      onChange={setField("enrichment", "grok_email_style")}
                      options={
                        forms.enrichment._emailStyleOptions?.length > 0
                          ? forms.enrichment._emailStyleOptions.map((o) =>
                              typeof o === "string"
                                ? { label: o, value: o }
                                : {
                                    label: o.label ?? o.name ?? o.value,
                                    value: o.value ?? o.name,
                                  },
                            )
                          : [
                              { label: "Select…", value: "" },
                              { label: "Business", value: "business" },
                              { label: "Personal", value: "personal" },
                              { label: "Automated", value: "automated" },
                            ]
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => saveEnrichmentField("grok_email_style")}
                    disabled={enrichmentFetchLoading.emailStyle}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-[#0a0a0a] px-4 py-2 text-[12px] font-[600] text-white hover:bg-gray-800 transition disabled:opacity-60"
                    title="Save Email Style"
                  >
                    {enrichmentFetchLoading.emailStyle ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Settings className="h-3.5 w-3.5" />
                    )}
                    {enrichmentFetchLoading.emailStyle ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="">
            {/* <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-600" />
                <h3 className="text-[14px] font-[700] text-gray-900">Email Deliverability</h3>
              </div>
            </div> */}
            <EmailDeliverabilitySettings />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-700" />
                <h3 className="text-[14px] font-[700] text-gray-900">
                  App Config
                </h3>
              </div>
              <SaveBtn section="appConfig" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Target Mailbox For Replies"
                value={forms.appConfig.target_mailbox_for_replies}
                onChange={setField("appConfig", "target_mailbox_for_replies")}
              />
              <Field
                label="Timezone Configuration"
                value={forms.appConfig.timezone_configuration}
                onChange={setField("appConfig", "timezone_configuration")}
              />
              <Field
                label="Graph Client State"
                value={forms.appConfig.graph_client_state}
                onChange={setField("appConfig", "graph_client_state")}
              />
              <Field
                label="Agent Name"
                value={forms.appConfig.agent_name}
                onChange={setField("appConfig", "agent_name")}
              />
              <Field
                label="Company Name"
                value={forms.appConfig.company_name}
                onChange={setField("appConfig", "company_name")}
              />
              <Field
                label="Default Agent Name"
                value={forms.appConfig.default_agent_name}
                onChange={setField("appConfig", "default_agent_name")}
              />
              <Field
                label="About Company"
                value={forms.appConfig.company_sales_pain_solution}
                onChange={setField("appConfig", "company_sales_pain_solution")}
              />
              <Field
                label="Product/Services Focus"
                value={forms.appConfig.about_company}
                onChange={setField("appConfig", "about_company")}
              />
              <SelectField
                label="Call Service Provider"
                value={forms.appConfig.call_service_provider || "elevenlabs"}
                onChange={setField("appConfig", "call_service_provider")}
                options={[
                  { label: "ElevenLabs", value: "elevenlabs" },
                  { label: "TM Own Solution", value: "tm_own_solution" },
                ]}
              />
              <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-700">
                <input
                  type="checkbox"
                  checked={forms.appConfig.skip_weekend_check}
                  onChange={setField("appConfig", "skip_weekend_check")}
                  className="h-4 w-4 accent-violet-600"
                />
                Skip Weekend Check
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-700">
                <input
                  type="checkbox"
                  checked={forms.appConfig.enable_logs}
                  onChange={setField("appConfig", "enable_logs")}
                  className="h-4 w-4 accent-violet-600"
                />
                Enable Logs
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Setting() {
  const [activePage, setActivePage] = useState(null);
  const [emailPlatform, setEP] = useState("");
  const [emailPlatformOptions, setEmailPlatformOptions] = useState([]);
  const [emailPlatformLoading, setEmailPlatformLoading] = useState(true);
    // Fetch email sending services/platforms
    useEffect(() => {
      const fetchEmailPlatforms = async () => {
        setEmailPlatformLoading(true);
        try {
          const res = await axiosInstance.get("/api/email-sending/services");
          const d = res.data;
          setEmailPlatformOptions(Array.isArray(d?.services) ? d.services : []);
          setEP(d?.selected_service || "");
        } catch {
          setEmailPlatformOptions([
            { service: "SMTP", label: "SMTP" },
            { service: "CRM", label: "CRM" },
          ]);
          setEP("SMTP");
        } finally {
          setEmailPlatformLoading(false);
        }
      };
      fetchEmailPlatforms();
    }, []);
  const [emailPlatformSaving, setEmailPlatformSaving] = useState(false);
  const [smtpProvider, setSMTP] = useState("");
  const [smtpProviderList, setSmtpProviderList] = useState([]); // [{name, description, ready}]
  const [smtpProviderLoading, setSmtpProviderLoading] = useState(false);
  const [smtpSelectSaving, setSmtpSelectSaving] = useState(false);
  const [crmConnected, setCRM] = useState(false);
  const [crmStatusLoading, setCrmStatusLoading] = useState(true);
  const [crmDisconnecting, setCrmDisconnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userCanAccessGlobalSettings, setUserCanAccessGlobalSettings] =
    useState(false);
  const [userIsSuperAdmin, setUserIsSuperAdmin] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedRole = localStorage.getItem("userRole") || "";
    setUserCanAccessGlobalSettings(isAdminRole(storedRole));
    setUserIsSuperAdmin(isSuperAdminRole(storedRole));
  }, []);

  // Fetch CRM OAuth status on mount — show toast if connected, silently mark disconnected
  useEffect(() => {
    const fetchCrmStatus = async () => {
      setCrmStatusLoading(true);
      try {
        const res = await axiosInstance.get("/oauth/status");
        const d = res.data;
        // Connected only when BOTH credentials and tokens are present and not expired
        const isConn =
          d?.has_credentials === true &&
          d?.has_tokens === true &&
          d?.token_expired !== true;
        setCRM(isConn);
        if (isConn) {
          toast.success("CRM is connected and active.", { id: "crm-status" });
        }
      } catch {
        setCRM(false);
      } finally {
        setCrmStatusLoading(false);
      }
    };
    fetchCrmStatus();
  }, []);

  const handleCrmDisconnect = async () => {
    setCrmDisconnecting(true);
    try {
      await axiosInstance.delete("/oauth/tokens");
      // Confirm disconnection via status check
      try {
        const res = await axiosInstance.get("/oauth/status");
        const d = res.data;
        const stillConn =
          d?.has_credentials === true &&
          d?.has_tokens === true &&
          d?.token_expired !== true;
        setCRM(stillConn);
        if (!stillConn) toast.success("CRM disconnected successfully.");
        else
          toast.error("Disconnect may not have completed. Please try again.");
      } catch {
        setCRM(false);
        toast.success("CRM disconnected successfully.");
      }
    } catch (err) {
      toast.error(getApiError(err) || "Failed to disconnect CRM.");
    } finally {
      setCrmDisconnecting(false);
    }
  };

  // Fetch available SMTP providers + currently selected provider on mount
  useEffect(() => {
    const fetchSmtpProviders = async () => {
      setSmtpProviderLoading(true);
      try {
        const res = await axiosInstance.get("/api/smtp/saved-providers");
        const d = res.data;
        const raw = d?.providers ?? (Array.isArray(d) ? d : []);
        
        const providers = raw.map((p) => ({
          name: p.provider ?? p.name ?? String(p),
          description: p.description ?? "",
          ready: p.ready ?? true,
        }));
        
        setSmtpProviderList(providers);

        const activeProvider = raw.find((p) => p.is_selected === true || p.is_active === true || p.is_current === true || p.selected === true);
        
        if (activeProvider) {
          setSMTP(activeProvider.provider ?? activeProvider.name);
        } else if (providers.length > 0) {
          setSMTP(providers[0].name);
        }
      } catch (err) {
        console.error("Failed to fetch SMTP providers:", err);
      } finally {
        setSmtpProviderLoading(false);
      }
    };
    fetchSmtpProviders();
  }, [emailPlatform]);

  const handleSelectEmailPlatform = async (platform) => {
    setEP(platform);
    if (typeof window !== "undefined")
      localStorage.setItem("emailSendingService", platform.toUpperCase());
    setEmailPlatformSaving(true);
    try {
      await axiosInstance.post("/api/email-sending/select-service", {
        service: platform.toLowerCase(),
      });
      toast.success(`Email sending service set to ${platform}`);
    } catch (err) {
      toast.error(
        getApiError(err) ||
          err?.response?.data?.detail ||
          "Failed to set email sending service.",
      );
    } finally {
      setEmailPlatformSaving(false);
    }
  };

  const handleSelectSmtpProvider = async (providerName) => {
    setSMTP(providerName);
    setSmtpSelectSaving(true);
    try {
      await axiosInstance.post("/api/smtp/select-provider", {
        provider_name: providerName,
      });
      toast.success(`SMTP provider set to ${providerName}`);
    } catch (err) {
      toast.error(
        getApiError(err) ||
          err?.response?.data?.detail ||
          "Failed to set SMTP provider.",
      );
    } finally {
      setSmtpSelectSaving(false);
    }
  };

  if (activePage === "crm")
    return (
      <div className="p-6 bg-[#f4f5f7] min-h-[calc(100vh-60px)]">
        <CRMPage
          onBack={() => setActivePage(null)}
          onConnectionChange={setCRM}
        />
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
  if (activePage === "global-integrations")
    return (
      <div className="p-6 bg-[#f4f5f7] min-h-[calc(100vh-60px)]">
        <GlobalIntegrationsPage
          onBack={() => setActivePage(null)}
          canAccess={userCanAccessGlobalSettings}
          smtpProviderList={smtpProviderList}
        />
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
  if (activePage === "users")
    return (
      <div className="p-6 bg-[#f4f5f7] min-h-[calc(100vh-60px)]">
        <UsersPage
          onBack={() => setActivePage(null)}
          isSuperAdmin={userIsSuperAdmin}
        />
      </div>
    );
  if (activePage === "superadmin-metrics")
    return (
      <div className="p-6 bg-[#f4f5f7] min-h-[calc(100vh-60px)]">
        <SuperAdminMetricsPage onBack={() => setActivePage(null)} />
      </div>
    );

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
        <div className="flex items-center gap-2">
          {userCanAccessGlobalSettings && (
            <button
              type="button"
              onClick={() => setActivePage("global-integrations")}
              title="Open Global Integrations"
              className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-400 hover:text-violet-700 hover:bg-violet-50 transition shadow-sm"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 700);
            }}
            title="Refresh"
            className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition shadow-sm"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* ═══ SECTION 1 — CONNECTION ═══ */}
      <div className="mb-2">
        <p className="text-[11px] font-[700] uppercase tracking-widest text-gray-400 mb-3 px-1">
          Connection & Integration
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* {userCanAccessGlobalSettings && (
          <SettingCard
            icon={Settings}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            title="Global Integrations"
            desc="Configure Twilio, ElevenLabs, LinkedIn scraping, WhatsApp, Azure, Groq, TM solution and app config"
            action={<GearBtn page="global-integrations" />}
          />
        )} */}
        <SettingCard
          icon={Database}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          title="Configure CRM"
          desc="Connect & authorise your CRM via OAuth2 credentials"
          action={
            <div className="flex flex-col gap-2">
              {crmConnected ? (
                <>
                  <div className="flex items-center justify-center gap-1.5 text-[12px] font-[600] text-green-700 bg-green-50 border border-green-200 rounded-xl py-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    CRM Connected
                  </div>
                  <button
                    onClick={() => setActivePage("crm")}
                    className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 py-2 text-[12px] font-[500] text-gray-600 hover:bg-white hover:border-violet-300 hover:text-violet-700 transition"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Manage
                  </button>
                  <button
                    onClick={handleCrmDisconnect}
                    disabled={crmDisconnecting}
                    className="w-full rounded-xl bg-red-500 py-2 text-[12px] font-[600] text-white hover:bg-red-600 transition flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    {crmDisconnecting ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Link2Off className="h-3.5 w-3.5" />
                    )}
                    {crmDisconnecting ? "Disconnecting…" : "Disconnect"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActivePage("crm")}
                    className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-[#0a0a0a] py-2 text-[12px] font-[600] text-white hover:bg-gray-800 transition"
                  >
                    <Link2 className="h-3.5 w-3.5" />+ Connect CRM
                  </button>
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                    <AlertCircle className="h-3 w-3 text-amber-400" />
                    Not connected
                  </div>
                </>
              )}
            </div>
          }
        />
        <SettingCard
          icon={Users}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          title="Leads"
          desc="Manage lead lists and data sources for your campaigns"
          action={<GearBtn page="leads" />}
        />
        <SettingCard
          icon={Map}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          title="Field Mappings"
          desc="Map CRM fields to internal system fields for data sync"
          action={<GearBtn page="mappings" />}
        />
      </div>

      {/* ═══ SECTION 2 — AI & AUTOMATION ═══ */}
      <div className="mb-2">
        <p className="text-[11px] font-[700] uppercase tracking-widest text-gray-400 mb-3 px-1">
          AI & Automation
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <SettingCard
          icon={Zap}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          title="Agent"
          desc="Manage AI SDR agents, switching, and parallel call limits"
          action={<GearBtn page="agents" />}
        />
        {userIsSuperAdmin && (
          <SettingCard
            icon={Users}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            title="User Management"
            desc="Add, edit, and manage users with roles and permissions"
            action={<GearBtn page="users" />}
          />
        )}
        {/* {userIsSuperAdmin && (
          <SettingCard icon={ShieldCheck} iconBg="bg-indigo-50" iconColor="text-indigo-600" title="Superadmin Metrics" desc="Select users and send metrics data — superadmin only" action={<GearBtn page="superadmin-metrics" />} />
        )} */}
      </div>

      {/* ═══ SECTION 3 — EMAIL DELIVERY ═══ */}
      <div className="mb-2">
        <p className="text-[11px] font-[700] uppercase tracking-widest text-gray-400 mb-3 px-1">
          Email Delivery
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                {emailPlatformLoading ? (
                  <div className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-400">
                    Loading platforms…
                  </div>
                ) : (
                  <select
                    value={emailPlatform}
                    onChange={(e) => handleSelectEmailPlatform(e.target.value)}
                    disabled={emailPlatformSaving}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 pr-9 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {emailPlatformOptions.map((s) => (
                      <option key={s.service} value={s.service}>
                        {s.label || s.service}
                      </option>
                    ))}
{                    console.log(emailPlatform)
}                  </select>
                )}
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              </div>
              {emailPlatformSaving && (
                <p className="mt-1.5 text-[11px] text-violet-500 font-[500]">
                  Saving…
                </p>
              )}
            </div>
          }
        />

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
                      {console.log(smtpProviderList, "smtpProviderList")}
                      {smtpProviderList?.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                </div>
                {smtpSelectSaving && (
                  <p className="mt-1.5 text-[11px] text-violet-500 font-[500]">
                    Saving…
                  </p>
                )}
              </div>
            }
          />
        )}

        {emailPlatform === "SMTP" && (
          <SettingCard
            icon={Server}
            iconBg="bg-green-50"
            iconColor="text-green-600"
            title="SMTP Providers Configuration"
            desc="Add, configure and test your SMTP delivery providers"
            action={<GearBtn page="smtp-providers" />}
          />
        )}
        {emailPlatform === "SMTP" && (
          <SettingCard
            icon={FileText}
            iconBg="bg-pink-50"
            iconColor="text-pink-600"
            title="Email Templates"
            desc="Create and manage reusable email templates for automation"
            action={<GearBtn page="email-templates" />}
          />
        )}
        {emailPlatform === "CRM" && (
          <SettingCard
            icon={Shield}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            title="Graph Configuration"
            desc="Microsoft Graph API credentials for calendar and mail sync"
            action={<GearBtn page="graph-config" />}
          />
        )}
      </div>
    </main>
  );
}

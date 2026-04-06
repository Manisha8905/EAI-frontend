"use client";
import { useState, useEffect } from "react";
import axiosInstance from "../Redux/axiosInstance";
import { toast } from "react-toastify";
import { Settings, Loader2, ChevronDown } from "lucide-react";

export default function EmailDeliverabilitySettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeProvider, setActiveProvider] = useState(null);
  const [supportedProviders, setSupportedProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerDetails, setProviderDetails] = useState(null);
  const [error, setError] = useState(null);

  /* ── Fetch active provider on mount ── */
  useEffect(() => {
    fetchActiveProvider();
  }, []);

  const fetchActiveProvider = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/api/deliverability/provider");
      const data = res.data;
      
      setActiveProvider(data.active_provider);
      setSupportedProviders(data.supported_providers || []);
      setSelectedProvider(data.active_provider);
      setProviderDetails(data);
      
      // toast.success("Email deliverability settings loaded");
    } catch (err) {
      const errorMsg = err?.response?.data?.detail || 
                       err?.response?.data?.message || 
                       "Failed to load email deliverability settings";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSetProvider = async () => {
    if (!selectedProvider) {
      toast.warning("Please select a provider");
      return;
    }

    setSaving(true);
    try {
      const res = await axiosInstance.put("/api/deliverability/provider", {
        provider: selectedProvider,
      });

      const data = res.data;
      setActiveProvider(data.active_provider);
      setProviderDetails(data);
      
      toast.success(`Email deliverability provider set to ${selectedProvider}`);
    } catch (err) {
      const errorMsg = err?.response?.data?.detail || 
                       err?.response?.data?.message || 
                       "Failed to update email deliverability provider";
      setError(errorMsg);
      toast.error(errorMsg);
      setSelectedProvider(activeProvider);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <p className="text-[13px] text-gray-500">Loading email deliverability settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-emerald-600" />
          <h3 className="text-[14px] font-[700] text-gray-900">Email Deliverability</h3>
        </div>
        <button
          type="button"
          onClick={handleSetProvider}
          disabled={saving}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-[#0a0a0a] px-4 py-2 text-[12px] font-[600] text-white hover:bg-gray-800 transition disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Settings className="h-3.5 w-3.5" />}
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {supportedProviders.length > 0 ? (
        <div>
          <label className="block text-[12px] font-[600] text-gray-700 mb-1.5">
            Deliverability Provider
          </label>
          <div className="relative">
            <select
              value={selectedProvider || ""}
              onChange={(e) => setSelectedProvider(e.target.value)}
              disabled={saving}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 pr-9 cursor-pointer disabled:opacity-60"
            >
              <option value="">— Select Provider —</option>
              {supportedProviders.map((provider) => (
                <option key={provider} value={provider}>
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  {provider === activeProvider ? " (Current)" : ""}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          </div>
        </div>
      ) : (
        <p className="text-[12px] text-gray-500">No deliverability providers available.</p>
      )}

      {/* {error && (
        <p className="text-[12px] text-red-500 font-[500]">{error}</p>
      )}

      {activeProvider && (
        <p className="text-[12px] text-gray-500">
          Current provider: <span className="font-[600] text-gray-700">{String(activeProvider).toUpperCase()}</span>
        </p>
      )} */}

      {/* {providerDetails?.smartlead_configured !== undefined && (
        <p className="text-[11px] text-gray-400">
          Smartlead status: {providerDetails.smartlead_configured ? "Configured" : "Not configured"}
        </p>
      )} */}
    </div>
  );
}

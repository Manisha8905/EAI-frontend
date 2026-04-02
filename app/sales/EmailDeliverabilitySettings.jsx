"use client";
import { useState, useEffect } from "react";
import axiosInstance from "../Redux/axiosInstance";
import { toast } from "react-toastify";
import { Settings, Loader2, Check, AlertCircle } from "lucide-react";

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
      
      toast.success("Email deliverability settings loaded");
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

    if (selectedProvider === activeProvider) {
      toast.info("This provider is already active");
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          <p className="text-[13px] text-gray-500">Loading email deliverability settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 px-6 py-4 flex items-center gap-2">
        <Settings className="h-5 w-5 text-gray-600" />
        <h2 className="text-[15px] font-[700] text-gray-900">Email Deliverability</h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-[600] text-red-900">Configuration Error</p>
              <p className="text-[12px] text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Current Active Provider */}
        {activeProvider && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-5 w-5 text-green-600" />
              <p className="text-[13px] font-[600] text-green-900">Active Provider</p>
            </div>
            <p className="text-[14px] font-[700] text-green-700 uppercase ml-7">
              {activeProvider}
            </p>
          </div>
        )}

        {/* Provider Details */}
        {providerDetails && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-[11px] font-[600] uppercase tracking-wide text-gray-500">Configuration Status</p>
              <p className="text-[13px] font-[600] text-gray-700 mt-1">
                {providerDetails.smartlead_configured ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-[11px] font-[600]">
                    <Check className="h-3 w-3" /> Configured
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-[11px] font-[600]">
                    <AlertCircle className="h-3 w-3" /> Not Configured
                  </span>
                )}
              </p>
            </div>
            {providerDetails.smartlead_api_key_masked && (
              <div>
                <p className="text-[11px] font-[600] uppercase tracking-wide text-gray-500">API Key</p>
                <p className="text-[13px] font-mono text-gray-600 mt-1 bg-white p-2 rounded border border-gray-200">
                  {providerDetails.smartlead_api_key_masked}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Provider Selection */}
        {supportedProviders.length > 0 && (
          <div>
            <label className="text-[12px] font-[600] text-gray-600 block mb-2">
              Select Email Provider
            </label>
            <select
              value={selectedProvider || ""}
              onChange={(e) => setSelectedProvider(e.target.value)}
              disabled={saving}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-[13px] font-[500] text-gray-700 outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition"
            >
              <option value="">— Select Provider —</option>
              {supportedProviders.map((provider) => (
                <option key={provider} value={provider}>
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  {provider === activeProvider && " (Current)"}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-gray-500 mt-2">
              Supported providers: {supportedProviders.join(", ")}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleSetProvider}
            disabled={saving || !selectedProvider || selectedProvider === activeProvider}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-[13px] font-[600] hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-600"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Set Provider
              </>
            )}
          </button>
          <button
            onClick={fetchActiveProvider}
            disabled={loading || saving}
            className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-[13px] font-[600] text-gray-700 hover:bg-gray-50 transition disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

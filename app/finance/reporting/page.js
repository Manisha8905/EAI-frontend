"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import axiosInstance from "../../Redux/axiosInstance";
import { toast } from "react-toastify";

import {
  Mail,
  Truck,
  Package,
  RefreshCw,
  Search,
  Download,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  Layers,
  TrendingUp,
  Paperclip,
  DollarSign,
  UploadCloud,
  Info,
  Eye,
  FileSpreadsheet,
  Clock,
} from "lucide-react";

/* ─── Mock data — Jobs tab ───────────────────────────────────── */
const MOCK_JOBS = [
  { id: 42, subject: "UPS Invoice - March 2026",    sender: "billing@ups.com",     type: "Freight", carrier: "UPS",     attachments: 3, failed: 1, status: "Partial",  createdAt: "Mar 25, 2026, 09:00 AM" },
  { id: 43, subject: "FAP Monthly Invoices",        sender: "invoices@fap.com",     type: "Trade",   carrier: "FAP",     attachments: 5, failed: 0, status: "Success",  createdAt: "Mar 25, 2026, 10:15 AM" },
  { id: 44, subject: "FedEx Freight Bills",         sender: "billing@fedex.com",    type: "Freight", carrier: "FedEx",   attachments: 2, failed: 0, status: "Success",  createdAt: "Mar 25, 2026, 11:30 AM" },
  { id: 45, subject: "REFIN Invoice Documents",     sender: "accounts@refin.com",   type: "Trade",   carrier: "REFIN",   attachments: 4, failed: 2, status: "Partial",  createdAt: "Mar 25, 2026, 12:00 PM" },
  { id: 46, subject: "SAIA Shipping Invoices",      sender: "billing@saia.com",     type: "Freight", carrier: "SAIA",    attachments: 1, failed: 1, status: "Failed",   createdAt: "Mar 25, 2026, 01:20 PM" },
  { id: 47, subject: "Domos Purchase Orders",       sender: "billing@domos.com",    type: "Trade",   carrier: "Domos",   attachments: 3, failed: 0, status: "Success",  createdAt: "Mar 24, 2026, 03:45 PM" },
  { id: 48, subject: "DECOCER Invoice Documents",   sender: "accounts@decocer.com", type: "Trade",   carrier: "DECOCER", attachments: 2, failed: 2, status: "Failed",   createdAt: "Mar 24, 2026, 04:00 PM" },
  { id: 49, subject: "DHL Express Freight - March", sender: "noreply@dhl.com",      type: "Freight", carrier: "DHL",     attachments: 6, failed: 0, status: "Success",  createdAt: "Mar 24, 2026, 09:30 AM" },
  { id: 50, subject: "Acme Trade Invoice Bundle",   sender: "finance@acme.com",     type: "Trade",   carrier: "Acme",    attachments: 4, failed: 1, status: "Partial",  createdAt: "Mar 23, 2026, 02:00 PM" },
  { id: 51, subject: "XPO Logistics Billing",       sender: "invoices@xpo.com",     type: "Freight", carrier: "XPO",     attachments: 3, failed: 3, status: "Failed",   createdAt: "Mar 23, 2026, 11:00 AM" },
];

/* ─── Mock data — Freight Invoices ──────────────────────────── */
const MOCK_FREIGHT = [
  { id: "f1", vendor: "UPS",   invoiceNumber: "INV-20260325-001", invoiceDate: "2026-03-20", dueDate: "2026-04-19", posoNumber: "PO-2026-0051", description: "Ground shipping for March deliveries",   amount: "$1,250.00", status: "Success", errorLog: null, resolutionStatus: null },
  { id: "f2", vendor: "FedEx", invoiceNumber: "FDX-2026-5432",   invoiceDate: "2026-03-22", dueDate: "2026-04-21", posoNumber: "SO-2026-0089", description: "Express delivery for priority orders",    amount: "$890.50",  status: "Success", errorLog: null, resolutionStatus: null },
  { id: "f3", vendor: "SAIA",  invoiceNumber: "SAIA-INV-9876",   invoiceDate: "2026-03-21", dueDate: "2026-04-20", posoNumber: "PO-2026-0052", description: "LTL freight shipment to West Coast",      amount: "$2,340.75", status: "Failed",  errorLog: "Invoice validation failed: Missing required field - Invoice date format incorrect", resolutionStatus: "In Progress - AP" },
  { id: "f4", vendor: "UPS",   invoiceNumber: "INV-20260325-002", invoiceDate: "2026-03-20", dueDate: "2026-04-19", posoNumber: "SO-2026-0091", description: "Next day air for urgent shipments",      amount: "$675.25",  status: "Success", errorLog: null, resolutionStatus: null },
  { id: "f5", vendor: "R+L",   invoiceNumber: "RL-2026-3421",    invoiceDate: "2026-03-23", dueDate: "2026-04-22", posoNumber: "PO-2026-0053", description: "Standard freight delivery",              amount: "$1,580.00", status: "Failed",  errorLog: "System error: Database connection timeout", resolutionStatus: "Fixed - TM" },
];

/* ─── Mock data — Trade Invoices ────────────────────────────── */
const MOCK_TRADE = [
  {
    id: "t1", poNumber: "PO-2026-0042", invoiceNo: "INV-FAP-5001",
    invoiceDate: "2026-03-19", freightCharge: "$450.00", salesTax: "$1,280.00",
    totalAmount: "$25,600.00", palletCharge: "$125.00", packingCharge: "$85.00",
    surCharge: "$50.00", vendorName: "FAP", discount: "$200.00",
    itemCode: "ITM-5001-A", description: "Ceramic tiles - Porcelain collection",
    quantity: 500, amount: "$23,610.00", sfQuantity: 500, sfAmount: "$23,610.00",
    status: "Success", errorLog: null, resolutionStatus: null,
  },
  {
    id: "t2", poNumber: "PO-2026-0043", invoiceNo: "INV-REFIN-3421",
    invoiceDate: "2026-03-20", freightCharge: "$320.50", salesTax: "$937.50",
    totalAmount: "$18,750.50", palletCharge: "$100.00", packingCharge: "$75.00",
    surCharge: "$35.00", vendorName: "REFIN", discount: "$150.00",
    itemCode: "ITM-3421-B", description: "Natural stone tiles - Marble collection",
    quantity: 350, amount: "$17,282.50", sfQuantity: 350, sfAmount: "$17,282.50",
    status: "Success", errorLog: null, resolutionStatus: null,
  },
  {
    id: "t3", poNumber: "PO-2026-0044", invoiceNo: "INV-DOMOS-7654",
    invoiceDate: "2026-03-18", freightCharge: "$550.00", salesTax: "$1,605.00",
    totalAmount: "$32,100.00", palletCharge: "$150.00", packingCharge: "$95.00",
    surCharge: "$60.00", vendorName: "Domos", discount: "$300.00",
    itemCode: "ITM-7654-C", description: "Luxury vinyl tiles - Premium range",
    quantity: 600, amount: "$29,640.00", sfQuantity: 580, sfAmount: "$28,652.00",
    status: "Failed",
    errorLog: "Quantity mismatch: Expected 600, received 580 in Salesforce",
    resolutionStatus: "Have Concern",
  },
  {
    id: "t4", poNumber: "PO-2026-0045", invoiceNo: "INV-FAP-5002",
    invoiceDate: "2026-03-19", freightCharge: "$280.75", salesTax: "$744.50",
    totalAmount: "$14,890.75", palletCharge: "$90.00", packingCharge: "$65.00",
    surCharge: "$40.00", vendorName: "FAP", discount: "$100.00",
    itemCode: "ITM-5002-D", description: "Wall tiles - Contemporary design",
    quantity: 300, amount: "$13,670.50", sfQuantity: 300, sfAmount: "$13,670.50",
    status: "Success", errorLog: null, resolutionStatus: null,
  },
  {
    id: "t5", poNumber: "PO-2026-0046", invoiceNo: "INV-DECOCER-8901",
    invoiceDate: "2026-03-22", freightCharge: "$395.00", salesTax: "$1,125.00",
    totalAmount: "$22,500.00", palletCharge: "$110.00", packingCharge: "$80.00",
    surCharge: "$45.00", vendorName: "DECOCER", discount: "$175.00",
    itemCode: "ITM-8901-E", description: "Floor tiles - Modern collection",
    quantity: 450, amount: "$20,770.00", sfQuantity: 450, sfAmount: "$20,770.00",
    status: "Failed",
    errorLog: "Backend error: Failed to update Salesforce records",
    resolutionStatus: "Fixed - AP",
  },
];

/* ─── Tabs ───────────────────────────────────────────────────── */
const TABS = [
  { key: "Jobs",            label: "Jobs",             icon: Mail      },
  { key: "FreightInvoices", label: "Freight Invoices", icon: Truck     },
  { key: "TradeInvoices",   label: "Trade Invoices",   icon: Package   },
  { key: "Reprocess",       label: "Reprocess",        icon: RefreshCw },
];

const STATUS_OPTIONS = ["All Status", "Success", "Partial", "Failed"];
const DATE_OPTIONS   = ["Last 30 Days", "Last 7 Days", "Last 90 Days", "This Year"];

/* ─── Status badge ───────────────────────────────────────────── */
const statusBadge = (status) => {
  if (status === "Success")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500 text-white px-3 py-1 text-[12px] font-[600]">
        <CheckCircle2 className="w-3.5 h-3.5" /> Success
      </span>
    );
  if (status === "Partial")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 text-white px-3 py-1 text-[12px] font-[600]">
        <AlertCircle className="w-3.5 h-3.5" /> Partial
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500 text-white px-3 py-1 text-[12px] font-[600]">
      <XCircle className="w-3.5 h-3.5" /> Failed
    </span>
  );
};

const typeBadge = (type) => {
  if (type === "Freight")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 text-sky-700 px-3 py-1 text-[11px] font-[600]">
        <Truck className="w-3 h-3" /> Freight
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 text-purple-700 px-3 py-1 text-[11px] font-[600]">
      <Package className="w-3 h-3" /> Trade
    </span>
  );
};

/* ─── Resolution badge ───────────────────────────────────────── */
const resolutionBadge = (val) => {
  if (!val) return <span className="text-[13px] text-gray-400">—</span>;
  if (val.startsWith("Fixed"))
    return <span className="inline-flex items-center rounded-full bg-green-600 text-white px-3 py-1 text-[12px] font-[600]">{val}</span>;
  if (val.startsWith("In Progress"))
    return <span className="inline-flex items-center rounded-full bg-blue-600 text-white px-3 py-1 text-[12px] font-[600]">{val}</span>;
  if (val.startsWith("Pending"))
    return <span className="inline-flex items-center rounded-full bg-amber-500 text-white px-3 py-1 text-[12px] font-[600]">{val}</span>;
  return <span className="text-[13px] text-gray-600 font-[500]">{val}</span>;
};

/* ─── Summary KPI card ───────────────────────────────────────── */
function SummaryCard({ icon: Icon, label, value, grad, shadow, sublabel }) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${grad} p-6 text-white shadow-lg ${shadow} flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center justify-center rounded-xl bg-white/20 p-3">
          <Icon className="h-5 w-5 text-white" />
        </span>
        <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[12px] font-[600] text-white">
          <TrendingUp className="h-3 w-3" />
          {sublabel || "Jobs"}
        </span>
      </div>
      <div className="mt-1">
        <p className="text-[11px] font-[600] uppercase tracking-widest text-white/70 mb-2">{label}</p>
        <p className="text-[48px] font-[800] leading-none tracking-tight">{value}</p>
      </div>
    </div>
  );
}

/* ─── Dropdown ───────────────────────────────────────────────── */
function Dropdown({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-xl border border-gray-200 bg-white pl-3.5 pr-9 py-2 text-[13px] text-gray-700 font-[500] focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer shadow-sm"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
    </div>
  );
}

/* ─── Table primitives ───────────────────────────────────────── */
function Th({ children }) {
  return (
    <th className="px-5 py-3.5 text-left text-[11px] font-[700] text-gray-500 uppercase tracking-wider bg-gray-50/70 whitespace-nowrap">
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return (
    <td className={`px-5 py-4 text-[13px] text-gray-700 align-top ${className}`}>
      {children}
    </td>
  );
}

/* ─── Jobs table ─────────────────────────────────────────────── */
function JobsTable({ rows, loading, error, onRetry }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50">
            <Mail className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Jobs Processing History</p>
            <p className="text-[12px] text-gray-400 mt-0.5">One job = one email processed</p>
          </div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-[12px] font-[600] text-gray-500 hover:bg-gray-50 hover:text-indigo-600 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading…" : "Refresh"}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-gray-100">
              <Th>Job ID</Th>
              <Th>Email Subject</Th>
              <Th>Sender</Th>
              <Th>Type</Th>
              <Th>Carrier / Vendor</Th>
              <Th>Attachments</Th>
              <Th>Status</Th>
              <Th>Created At</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-[13px] text-gray-400">
                  <RefreshCw className="inline h-5 w-5 animate-spin mr-2 text-indigo-400" />
                  Loading jobs…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-[13px] text-red-400">
                  {error} —{" "}
                  <button onClick={onRetry} className="text-indigo-500 underline">retry</button>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={8} className="py-16 text-center text-[13px] text-gray-400">No jobs match your filters.</td></tr>
            ) : rows.map((job) => (
              <tr key={job.id} className="hover:bg-indigo-50/30 transition-colors">
                <Td><span className="font-[700] text-indigo-600">#{job.id}</span></Td>
                <Td><span className="font-[600] text-gray-900">{job.subject}</span></Td>
                <Td><span className="text-gray-500">{job.sender}</span></Td>
                <Td>{typeBadge(job.type)}</Td>
                <Td><span className="font-[600] text-gray-800">{job.carrier}</span></Td>
                <Td>
                  <span className="font-[600] text-gray-800">{job.attachments}</span>
                  {job.failed > 0 && <span className="ml-1.5 text-[12px] text-red-500 font-[600]">({job.failed} failed)</span>}
                </Td>
                <Td>{statusBadge(job.status)}</Td>
                <Td><span className="text-gray-500 whitespace-pre-line leading-snug">{job.createdAt}</span></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Invoices table (Freight & Trade share same layout) ─────── */
function InvoicesTable({ rows, loading, error, onRetry, title, subtitle, icon: Icon, accentColor = "sky" }) {
  const iconBg  = accentColor === "purple" ? "bg-purple-50" : "bg-sky-50";
  const iconCls = accentColor === "purple" ? "text-purple-600" : "text-sky-600";
  const rowHover = accentColor === "purple" ? "hover:bg-purple-50/20" : "hover:bg-sky-50/20";
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconCls}`} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">{title}</p>
            <p className="text-[12px] text-gray-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-[12px] font-[600] text-gray-500 hover:bg-gray-50 hover:text-indigo-600 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading…" : "Refresh"}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-gray-100">
              <Th>Attachment</Th>
              <Th>Vendor Name</Th>
              <Th>Invoice Number</Th>
              <Th>Invoice Date</Th>
              <Th>Invoice Due Date</Th>
              <Th>PO / SO Number</Th>
              <Th>Description</Th>
              <Th>Freight Amount</Th>
              <Th>Status</Th>
              <Th>Error Log</Th>
              <Th>Resolution Status</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={11} className="py-16 text-center text-[13px] text-gray-400">
                  <RefreshCw className="inline h-5 w-5 animate-spin mr-2 text-indigo-400" />
                  Loading invoices…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={11} className="py-16 text-center text-[13px] text-red-400">
                  {error} —{" "}
                  <button onClick={onRetry} className="text-indigo-500 underline">retry</button>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={11} className="py-16 text-center text-[13px] text-gray-400">No invoices match your filters.</td></tr>
            ) : rows.map((inv) => (
              <tr key={inv.id} className={`${rowHover} transition-colors`}>
                <Td>
                  <span className="flex items-center justify-center">
                    <Paperclip className="h-4 w-4 text-indigo-500" />
                  </span>
                </Td>
                <Td><span className="font-[600] text-gray-800">{inv.vendor}</span></Td>
                <Td><span className="text-xs font-bold text-slate-900">{inv.invoiceNumber}</span></Td>
                <Td><span className="text-gray-500">{inv.invoiceDate}</span></Td>
                <Td><span className="text-gray-500">{inv.dueDate}</span></Td>
                <Td><span className="text-indigo-600 font-[500]">{inv.posoNumber}</span></Td>
                <Td><span className="text-gray-700">{inv.description}</span></Td>
                <Td><span className="text-xs font-bold text-slate-900">{inv.amount}</span></Td>
                <Td>{statusBadge(inv.status)}</Td>
                <Td>
                  {inv.errorLog
                    ? <span className="text-[12px] text-red-500 font-[500] leading-snug block">{inv.errorLog}</span>
                    : <span className="text-[13px] text-green-600 font-[500]">None</span>
                  }
                </Td>
                <Td>{resolutionBadge(inv.resolutionStatus)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Vendor name badge (Trade) ─────────────────────────────── */
const VENDOR_COLORS = {
  FAP:     "bg-purple-100 text-purple-700",
  REFIN:   "bg-purple-100 text-purple-700",
  Domos:   "bg-purple-100 text-purple-700",
  DECOCER: "bg-purple-100 text-purple-700",
  Acme:    "bg-purple-100 text-purple-700",
};
const vendorBadge = (name) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-[700] ${VENDOR_COLORS[name] ?? "bg-gray-100 text-gray-600"}`}>
    {name}
  </span>
);

/* ─── Trade Invoices table ───────────────────────────────────── */
function TradeInvoicesTable({ rows, loading, error, onRetry }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-purple-50">
            <Package className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Trade Invoices</p>
            <p className="text-[12px] text-gray-400 mt-0.5">Purchase orders from suppliers (FAP, REFIN, DECOCER, etc.)</p>
          </div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-[12px] font-[600] text-gray-500 hover:bg-gray-50 hover:text-indigo-600 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading…" : "Refresh"}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-gray-100">
              <Th>Attachment</Th>
              <Th>PO Number</Th>
              <Th>Invoice No</Th>
              <Th>Invoice Date</Th>
              <Th>Freight Charge</Th>
              <Th>Sales Tax</Th>
              <Th>Total Amount</Th>
              <Th>Pallet Charge</Th>
              <Th>Packing Charge</Th>
              <Th>Sur Charge</Th>
              <Th>Vendor Name</Th>
              <Th>Discount</Th>
              <Th>Item Code</Th>
              <Th>Description</Th>
              <Th>Quantity</Th>
              <Th>Amount</Th>
              <Th>Salesforce Quantity</Th>
              <Th>Salesforce Amount</Th>
              <Th>Status</Th>
              <Th>Error Log</Th>
              <Th>Resolution Status</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={21} className="py-16 text-center text-[13px] text-gray-400">
                  <RefreshCw className="inline h-5 w-5 animate-spin mr-2 text-indigo-400" />
                  Loading invoices…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={21} className="py-16 text-center text-[13px] text-red-400">
                  {error} —{" "}
                  <button onClick={onRetry} className="text-indigo-500 underline">retry</button>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={21} className="py-16 text-center text-[13px] text-gray-400">No trade invoices match your filters.</td></tr>
            ) : rows.map((inv) => (
              <tr key={inv.id} className="hover:bg-purple-50/20 transition-colors">
                {/* Attachment */}
                <Td>
                  <span className="flex items-center justify-center">
                    <Paperclip className="h-4 w-4 text-indigo-500" />
                  </span>
                </Td>
                {/* PO Number */}
                <Td><span className="text-xs font-bold text-slate-900">{inv.poNumber}</span></Td>
                {/* Invoice No */}
                <Td><span className="text-gray-500 whitespace-nowrap">{inv.invoiceNo}</span></Td>
                {/* Invoice Date */}
                <Td><span className="text-gray-500 whitespace-nowrap">{inv.invoiceDate}</span></Td>
                {/* Freight Charge */}
                <Td><span className="text-gray-700">{inv.freightCharge}</span></Td>
                {/* Sales Tax */}
                <Td><span className="text-gray-700">{inv.salesTax}</span></Td>
                {/* Total Amount */}
                <Td><span className="text-xs font-bold text-slate-900">{inv.totalAmount}</span></Td>
                {/* Pallet Charge */}
                <Td><span className="text-gray-700">{inv.palletCharge}</span></Td>
                {/* Packing Charge */}
                <Td><span className="text-gray-700">{inv.packingCharge}</span></Td>
                {/* Sur Charge */}
                <Td><span className="text-gray-700">{inv.surCharge}</span></Td>
                {/* Vendor Name badge */}
                <Td>{vendorBadge(inv.vendorName)}</Td>
                {/* Discount */}
                <Td><span className="text-green-600 font-[600]">{inv.discount}</span></Td>
                {/* Item Code */}
                <Td><span className="text-gray-500 whitespace-nowrap">{inv.itemCode}</span></Td>
                {/* Description */}
                <Td><span className="text-gray-700 whitespace-nowrap">{inv.description}</span></Td>
                {/* Quantity */}
                <Td><span className="text-gray-800 font-[500]">{inv.quantity}</span></Td>
                {/* Amount */}
                <Td><span className="text-xs font-bold text-slate-900">{inv.amount}</span></Td>
                {/* SF Quantity */}
                <Td><span className="text-indigo-600 font-[600]">{inv.sfQuantity}</span></Td>
                {/* SF Amount */}
                <Td><span className="text-indigo-600 font-[600]">{inv.sfAmount}</span></Td>
                {/* Status */}
                <Td>{statusBadge(inv.status)}</Td>
                {/* Error Log */}
                <Td>
                  {inv.errorLog
                    ? <span className="text-[12px] text-red-500 font-[500] leading-snug block max-w-[160px]">{inv.errorLog}</span>
                    : <span className="text-[13px] text-green-600 font-[500]">None</span>
                  }
                </Td>
                {/* Resolution Status */}
                <Td>{resolutionBadge(inv.resolutionStatus)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Reprocess placeholder ──────────────────────────────────── */
const REPROCESS_HISTORY = [
  {
    id: 1,
    fileName: "invoices_march_2026.xlsx",
    uploadTime: "Mar 29, 2026, 2:45 PM",
    records: 45,
    status: "Success",
    details: [
      { invoiceNo: "INV-001", vendor: "UPS",   type: "Freight", amount: "$1,250.00", status: "Success", errorLog: null },
      { invoiceNo: "INV-002", vendor: "FedEx", type: "Freight", amount: "$890.50",   status: "Success", errorLog: null },
      { invoiceNo: "INV-003", vendor: "FAP",   type: "Trade",   amount: "$25,600.00",status: "Success", errorLog: null },
      { invoiceNo: "INV-004", vendor: "REFIN", type: "Trade",   amount: "$18,750.50",status: "Success", errorLog: null },
      { invoiceNo: "INV-005", vendor: "DHL",   type: "Freight", amount: "$2,100.00", status: "Success", errorLog: null },
    ],
  },
  {
    id: 2,
    fileName: "freight_reprocess.xlsx",
    uploadTime: "Mar 28, 2026, 10:30 AM",
    records: 32,
    status: "Partial",
    details: [
      { invoiceNo: "FRT-101", vendor: "SAIA",  type: "Freight", amount: "$2,340.75", status: "Failed",  errorLog: "Missing invoice date field" },
      { invoiceNo: "FRT-102", vendor: "UPS",   type: "Freight", amount: "$675.25",   status: "Success", errorLog: null },
      { invoiceNo: "FRT-103", vendor: "R+L",   type: "Freight", amount: "$1,580.00", status: "Failed",  errorLog: "Database connection timeout" },
      { invoiceNo: "FRT-104", vendor: "XPO",   type: "Freight", amount: "$980.00",   status: "Success", errorLog: null },
      { invoiceNo: "FRT-105", vendor: "FedEx", type: "Freight", amount: "$430.00",   status: "Success", errorLog: null },
    ],
  },
  {
    id: 3,
    fileName: "trade_invoices_feb.xlsx",
    uploadTime: "Mar 27, 2026, 4:15 PM",
    records: 28,
    status: "Success",
    details: [
      { invoiceNo: "TRD-201", vendor: "FAP",     type: "Trade", amount: "$14,890.75", status: "Success", errorLog: null },
      { invoiceNo: "TRD-202", vendor: "DECOCER", type: "Trade", amount: "$22,500.00", status: "Success", errorLog: null },
      { invoiceNo: "TRD-203", vendor: "Domos",   type: "Trade", amount: "$32,100.00", status: "Success", errorLog: null },
      { invoiceNo: "TRD-204", vendor: "REFIN",   type: "Trade", amount: "$17,282.50", status: "Success", errorLog: null },
      { invoiceNo: "TRD-205", vendor: "FAP",     type: "Trade", amount: "$23,610.00", status: "Success", errorLog: null },
    ],
  },
];

/* ─── Reprocess View Modal ───────────────────────────────────── */
function ReprocessViewModal({ entry, onClose }) {
  if (!entry) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50">
              <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{entry.fileName}</p>
              <p className="text-[12px] text-gray-400 mt-0.5">
                Uploaded {entry.uploadTime} &middot; {entry.records} records &middot; {statusBadge(entry.status)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Summary pills */}
        <div className="flex gap-3 px-6 py-4 bg-gray-50 border-b border-gray-100">
          {[
            { label: "Total",   value: entry.details.length,                                          color: "bg-blue-100 text-blue-700"   },
            { label: "Success", value: entry.details.filter((d) => d.status === "Success").length,    color: "bg-green-100 text-green-700" },
            { label: "Failed",  value: entry.details.filter((d) => d.status === "Failed").length,     color: "bg-red-100 text-red-700"     },
          ].map(({ label, value, color }) => (
            <span key={label} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-[700] ${color}`}>
              {label}: {value}
            </span>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-gray-100">
                {["Invoice No", "Vendor", "Type", "Amount", "Status", "Error Log"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-[700] uppercase tracking-wider text-gray-400 bg-gray-50/80">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entry.details.map((row) => (
                <tr key={row.invoiceNo} className="hover:bg-indigo-50/20 transition-colors">
                  <td className="px-5 py-3.5 text-[13px] font-[700] text-indigo-600">{row.invoiceNo}</td>
                  <td className="px-5 py-3.5 text-xs font-bold text-slate-900">{row.vendor}</td>
                  <td className="px-5 py-3.5">{typeBadge(row.type)}</td>
                  <td className="px-5 py-3.5 text-xs font-bold text-slate-900">{row.amount}</td>
                  <td className="px-5 py-3.5">{statusBadge(row.status)}</td>
                  <td className="px-5 py-3.5">
                    {row.errorLog
                      ? <span className="text-[12px] text-red-500 font-[500]">{row.errorLog}</span>
                      : <span className="text-[12px] text-green-600 font-[500]">None</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-[13px] font-[600] text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ReprocessPanel() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [viewEntry, setViewEntry] = useState(null);
  const [lastViewedId, setLastViewedId] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  return (
    <>
      {/* ── View Modal ── */}
      <ReprocessViewModal entry={viewEntry} onClose={() => setViewEntry(null)} />

      <div className="space-y-5">

        {/* ── Upload card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50">
              <RefreshCw className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Reprocess Invoices</p>
              <p className="text-[12px] text-gray-400 mt-0.5">Upload an Excel file to reprocess invoices</p>
            </div>
          </div>

          <div className="px-6 pb-6">
            {/* Dropzone */}
            <label
              htmlFor="reprocess-file-input"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`flex flex-col items-center justify-center gap-4 cursor-pointer rounded-2xl border-2 border-dashed py-16 transition-colors ${
                dragging
                  ? "border-indigo-500 bg-indigo-50/70"
                  : file
                  ? "border-indigo-400 bg-indigo-50/40"
                  : "border-indigo-300 bg-white hover:border-indigo-500 hover:bg-indigo-50/20"
              }`}
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-violet-100">
                <FileSpreadsheet className="h-7 w-7 text-violet-500" />
              </div>
              {file ? (
                <>
                  <p className="text-[15px] font-[700] text-indigo-700">{file.name}</p>
                  <p className="text-[12px] text-gray-400">{(file.size / 1024).toFixed(1)} KB &mdash; click to change</p>
                </>
              ) : (
                <>
                  <p className="text-[15px] font-[700] text-gray-800">Click to upload Excel file</p>
                  <p className="text-[13px] text-gray-400">Supports .xlsx and .xls formats</p>
                </>
              )}
            </label>
            <input
              id="reprocess-file-input"
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Process button */}
            <div className="flex justify-end mt-5">
              <button
                disabled={!file}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-[600] shadow-sm transition-all ${
                  file
                    ? "bg-violet-500 text-white hover:bg-violet-600 active:bg-violet-700"
                    : "bg-violet-300 text-white cursor-not-allowed"
                }`}
              >
                <UploadCloud className="h-4 w-4" />
                Process File
              </button>
            </div>
          </div>
        </div>

        {/* ── File Requirements ── */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-5 w-5 text-amber-500 shrink-0" />
            <p className="text-[14px] font-[700] text-amber-800">File Requirements</p>
          </div>
          <ul className="space-y-1.5 pl-1">
            {[
              "Excel file must be in .xlsx or .xls format",
              "File should contain invoice data with proper headers",
              "Supported invoice types: Freight and Trade",
              "Maximum file size: 10 MB",
            ].map((req) => (
              <li key={req} className="flex items-start gap-2 text-[13px] text-amber-700">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Recent Reprocessing History ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-gray-500" />
            <p className="text-xs font-bold text-slate-900">Recent Reprocessing History</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-gray-100">
                  {["File Name", "Upload Time", "Records", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-[11px] font-[700] uppercase tracking-wider text-gray-400 bg-gray-50/60">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {REPROCESS_HISTORY.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-indigo-400 shrink-0" />
                        <span className="text-xs font-bold text-slate-900">{row.fileName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-gray-500">{row.uploadTime}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-900">{row.records}</td>
                    <td className="px-6 py-4">{statusBadge(row.status)}</td>
                    <td className="px-6 py-4">
                      {lastViewedId === row.id ? (
                        /* Already-viewed: grey bordered pill */
                        <button
                          onClick={() => { setLastViewedId(row.id); setViewEntry(row); }}
                          className="inline-flex items-center gap-1.5 rounded-lg  text-[13px] font-[600] text-violet-600 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        >
                          <Eye className="h-4 w-4" /> View
                        </button>
                      ) : (
                        /* Default: violet text link — grey bg on hover */
                        <button
                          onClick={() => { setLastViewedId(row.id); setViewEntry(row); }}
                          className="inline-flex items-center gap-1.5 rounded-lg  text-[13px] font-[600] text-violet-600 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        >
                          <Eye className="h-4 w-4" /> View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
/* ─── Helper: format ISO date → "Mar 25, 2026, 09:00 AM" ─── */
function formatCreatedAt(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/* ─── Helper: normalise API status → title-case ─────────── */
function normaliseStatus(s) {
  if (!s) return "";
  const m = { SUCCESS: "Success", PARTIAL: "Partial", FAILED: "Failed" };
  return m[s.toUpperCase()] ?? (s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());
}

/* ─── Helper: normalise API invoice_type → title-case ────── */
function normaliseType(t) {
  if (!t) return "";
  const m = { FREIGHT: "Freight", TRADE: "Trade" };
  return m[t.toUpperCase()] ?? t;
}

export default function FinanceReportingPage() {
  const [activeTab,    setActiveTab]    = useState("Jobs");
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter,   setDateFilter]   = useState("Last 30 Days");

  /* ── Jobs API state ── */
  const [apiJobs,        setApiJobs]        = useState([]);
  const [jobsLoading,    setJobsLoading]    = useState(false);
  const [jobsError,      setJobsError]      = useState(null);
  const [jobsSummary,    setJobsSummary]    = useState(null);

  /* ── Freight API state ── */
  const [apiFreight,     setApiFreight]     = useState([]);
  const [freightLoading, setFreightLoading] = useState(false);
  const [freightError,   setFreightError]   = useState(null);
  const [freightSummary, setFreightSummary] = useState(null);

  /* ── Trade API state ── */
  const [apiTrade,       setApiTrade]       = useState([]);
  const [tradeLoading,   setTradeLoading]   = useState(false);
  const [tradeError,     setTradeError]     = useState(null);
  const [tradeSummary,   setTradeSummary]   = useState(null);

  const fetchJobs = useCallback(async () => {
    setJobsLoading(true);
    setJobsError(null);
    try {
      const res = await axiosInstance.get("/invoice-processing/reporting/jobs");
      const data = res.data?.data ?? {};
      const mapped = (data.jobs ?? []).map((j) => ({
        id:          j.id,
        subject:     j.email_subject,
        sender:      j.email_sender,
        type:        normaliseType(j.invoice_type),
        carrier:     j.carrier,
        attachments: j.total_attachments,
        failed:      j.failed_attachments,
        status:      normaliseStatus(j.status),
        createdAt:   formatCreatedAt(j.created_at),
      }));
      setApiJobs(mapped);
      setJobsSummary(data.summary ?? null);
    } catch (err) {
      const msg = err?.response?.data?.detail ?? err?.detail ?? "Failed to load jobs.";
      toast.error(msg, { toastId: "finance-reporting-api-error" });
      setApiJobs(MOCK_JOBS);
    } finally {
      setJobsLoading(false);
    }
  }, []);

  const fetchFreight = useCallback(async () => {
    setFreightLoading(true);
    setFreightError(null);
    try {
      const res = await axiosInstance.get("/invoice-processing/reporting/freight-invoices");
      const data = res.data?.data ?? {};
      const mapped = (data.invoices ?? []).map((inv) => ({
        id:               inv.id,
        vendor:           inv.vendor_name,
        invoiceNumber:    inv.invoice_number,
        invoiceDate:      inv.invoice_date,
        dueDate:          inv.invoice_due_date,
        posoNumber:       Array.isArray(inv.po_so_number) ? inv.po_so_number.join(", ") : (inv.po_so_number ?? ""),
        description:      inv.description,
        amount:           inv.freight_amount != null ? `$${parseFloat(inv.freight_amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—",
        status:           normaliseStatus(inv.status),
        errorLog:         inv.error_log,
        resolutionStatus: inv.resolution_status,
      }));
      setApiFreight(mapped);
      setFreightSummary(data.summary ?? null);
    } catch (err) {
      const msg = err?.response?.data?.detail ?? err?.detail ?? "Failed to load freight invoices.";
      toast.error(msg, { toastId: "finance-reporting-api-error" });
      setApiFreight(MOCK_FREIGHT);
    } finally {
      setFreightLoading(false);
    }
  }, []);

  const fetchTrade = useCallback(async () => {
    setTradeLoading(true);
    setTradeError(null);
    try {
      const res = await axiosInstance.get("/invoice-processing/reporting/trade-invoices");
      const data = res.data?.data ?? {};
      const fmt = (val) => val != null
        ? `$${parseFloat(val).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "—";
      const mapped = (data.items ?? []).map((inv) => ({
        id:               inv.item_id,
        poNumber:         inv.po_number,
        invoiceNo:        inv.invoice_number,
        invoiceDate:      inv.invoice_date,
        freightCharge:    fmt(inv.freight_charge),
        salesTax:         fmt(inv.sales_tax),
        totalAmount:      fmt(inv.total_amount),
        palletCharge:     fmt(inv.pallet_charge),
        packingCharge:    fmt(inv.packing_charge),
        surCharge:        fmt(inv.sur_charge),
        vendorName:       inv.vendor_name,
        discount:         fmt(inv.discount),
        itemCode:         inv.item_code,
        description:      inv.description,
        quantity:         Array.isArray(inv.quantity) && inv.quantity.length > 0
                            ? inv.quantity[0].value
                            : (inv.quantity ?? "—"),
        amount:           fmt(inv.amount),
        sfQuantity:       inv.salesforce_quantity ?? "—",
        sfAmount:         inv.salesforce_amount != null ? fmt(inv.salesforce_amount) : "—",
        status:           normaliseStatus(inv.status),
        errorLog:         inv.error_log,
        resolutionStatus: inv.resolution_status,
      }));
      setApiTrade(mapped);
      setTradeSummary(data.summary ?? null);
    } catch (err) {
      const msg = err?.response?.data?.detail ?? err?.detail ?? "Failed to load trade invoices.";
      toast.error(msg, { toastId: "finance-reporting-api-error" });
      setApiTrade(MOCK_TRADE);
    } finally {
      setTradeLoading(false);
    }
  }, []);

  /* ── Call the right API whenever the active tab changes ── */
  useEffect(() => {
    if (activeTab === "Jobs")            fetchJobs();
    else if (activeTab === "FreightInvoices") fetchFreight();
    else if (activeTab === "TradeInvoices")   fetchTrade();
  }, [activeTab, fetchJobs, fetchFreight, fetchTrade]);

  const filterRows = (rows) => {
    let r = rows;
    if (statusFilter !== "All Status") r = r.filter((x) => x.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((x) => Object.values(x).some((v) => String(v ?? "").toLowerCase().includes(q)));
    }
    return r;
  };

  const jobRows     = useMemo(() => filterRows(apiJobs),      [search, statusFilter, apiJobs]);
  const freightRows = useMemo(() => filterRows(apiFreight),   [search, statusFilter, apiFreight]);
  const tradeRows   = useMemo(() => filterRows(apiTrade),     [search, statusFilter, apiTrade]);

  const activeRows =
    activeTab === "FreightInvoices" ? freightRows
    : activeTab === "TradeInvoices" ? tradeRows
    : jobRows;

  const isInvoiceTab = activeTab === "FreightInvoices" || activeTab === "TradeInvoices";

  const stats = useMemo(() => {
    /* For Jobs tab, prefer the API summary if available */
    if (activeTab === "Jobs" && jobsSummary) {
      return {
        total:    jobsSummary.total      ?? jobRows.length,
        synced:   jobsSummary.successful ?? jobRows.filter((r) => r.status === "Success").length,
        partial:  jobsSummary.partial    ?? jobRows.filter((r) => r.status === "Partial").length,
        failed:   jobsSummary.failed     ?? jobRows.filter((r) => r.status === "Failed").length,
        totalAmt: null,
      };
    }
    /* For Freight Invoices tab, prefer the API summary if available */
    if (activeTab === "FreightInvoices" && freightSummary) {
      return {
        total:    freightSummary.total_freight_invoices ?? freightRows.length,
        synced:   freightSummary.sf_synced              ?? freightRows.filter((r) => r.status === "Success").length,
        partial:  freightRows.filter((r) => r.status === "Partial").length,
        failed:   freightSummary.sf_failed              ?? freightRows.filter((r) => r.status === "Failed").length,
        totalAmt: freightSummary.total_amount           ?? null,
      };
    }
    /* For Trade Invoices tab, prefer the API summary if available */
    if (activeTab === "TradeInvoices" && tradeSummary) {
      return {
        total:    tradeSummary.total_trade_invoices ?? tradeRows.length,
        synced:   tradeSummary.sf_synced            ?? tradeRows.filter((r) => r.status === "Success").length,
        partial:  tradeRows.filter((r) => r.status === "Partial").length,
        failed:   tradeSummary.sf_failed            ?? tradeRows.filter((r) => r.status === "Failed").length,
        totalAmt: tradeSummary.total_amount         ?? null,
      };
    }
    const total   = activeRows.length;
    const synced  = activeRows.filter((r) => r.status === "Success").length;
    const partial = activeRows.filter((r) => r.status === "Partial").length;
    const failed  = activeRows.filter((r) => r.status === "Failed").length;
    const totalAmt = isInvoiceTab
      ? activeRows.reduce((acc, r) => {
          const amtStr = activeTab === "TradeInvoices" ? r.totalAmount : r.amount;
          return acc + (parseFloat((amtStr || "0").replace(/[$,]/g, "")) || 0);
        }, 0)
      : null;
    return { total, synced, partial, failed, totalAmt };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRows, activeTab, jobsSummary, jobRows, freightSummary, freightRows, tradeSummary, tradeRows]);

  const invLabel = activeTab === "FreightInvoices" ? "Freight" : "Trade";

  // Dark-gradient cards — Jobs, Freight Invoices & Trade Invoices
  const cardConfigs = activeTab === "Jobs"
    ? [
        { key: "total",   label: "Total Jobs",  icon: Layers,       grad: "from-blue-500 to-blue-600",     shadow: "shadow-blue-400/30"   },
        { key: "synced",  label: "Successful",  icon: CheckCircle2, grad: "from-green-500 to-green-600",   shadow: "shadow-green-400/30"  },
        { key: "partial", label: "Partial",     icon: AlertCircle,  grad: "from-orange-500 to-orange-600", shadow: "shadow-orange-400/30" },
        { key: "failed",  label: "Failed",      icon: XCircle,      grad: "from-red-500 to-red-600",       shadow: "shadow-red-400/30"    },
      ]
    : [
        { key: "total",   label: `Total ${invLabel} Invoices`, icon: Layers,       grad: "from-blue-500 to-blue-600",     shadow: "shadow-blue-400/30"   },
        { key: "synced",  label: "SF Synced",                  icon: CheckCircle2, grad: "from-green-500 to-green-600",   shadow: "shadow-green-400/30"  },
        { key: "failed",  label: "SF Failed",                  icon: XCircle,      grad: "from-red-500 to-red-600",       shadow: "shadow-red-400/30"    },
        { key: "amount",  label: "Total Amount",               icon: DollarSign,   grad: "from-yellow-500 to-amber-500",  shadow: "shadow-amber-400/30", sublabel: "Amount" },
      ];

  // ── Card values from local mock row stats ──
  const cardValue = (key) => {
    if (key === "amount") return stats.totalAmt !== null ? `$${(stats.totalAmt / 1000).toFixed(1)}k` : "—";
    return stats[key];
  };

  const handleExport = () => {
    let headers, rows;
    if (activeTab === "TradeInvoices") {
      headers = ["PO Number","Invoice No","Invoice Date","Freight Charge","Sales Tax","Total Amount","Pallet Charge","Packing Charge","Sur Charge","Vendor Name","Discount","Item Code","Description","Quantity","Amount","SF Quantity","SF Amount","Status","Error Log","Resolution Status"];
      rows = activeRows.map((r) => [r.poNumber, r.invoiceNo, r.invoiceDate, r.freightCharge, r.salesTax, r.totalAmount, r.palletCharge, r.packingCharge, r.surCharge, r.vendorName, r.discount, r.itemCode, `"${r.description}"`, r.quantity, r.amount, r.sfQuantity, r.sfAmount, r.status, `"${r.errorLog ?? ""}"`, `"${r.resolutionStatus ?? ""}"`].join(","));
    } else if (activeTab === "FreightInvoices") {
      headers = ["Vendor","Invoice Number","Invoice Date","Due Date","PO/SO","Description","Amount","Status","Error Log","Resolution"];
      rows = activeRows.map((r) => [`"${r.vendor}"`, `"${r.invoiceNumber}"`, r.invoiceDate, r.dueDate, r.posoNumber, `"${r.description}"`, r.amount, r.status, `"${r.errorLog ?? ""}"`, `"${r.resolutionStatus ?? ""}"`].join(","));
    } else {
      headers = ["Job ID","Email Subject","Sender","Type","Carrier","Attachments","Failed","Status","Created At"];
      rows = activeRows.map((r) => [r.id, `"${r.subject}"`, r.sender, r.type, r.carrier, r.attachments, r.failed, r.status, `"${r.createdAt}"`].join(","));
    }
    const csv  = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `${activeTab.toLowerCase()}_report.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const placeholder =
    activeTab === "FreightInvoices" ? "Search freight invoices…"
    : activeTab === "TradeInvoices"  ? "Search trade invoices…"
    : "Search jobs…";

  return (
    <div className="p-6 bg-[#f4f5f7] min-h-screen space-y-5">

      {/* ── Tab bar ── */}
      {/* flex items-center gap-1 rounded-xl bg-white border border-gray-200 p-1 shadow-sm */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-2 py-2 inline-flex gap-1.5">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setSearch(""); setStatusFilter("All Status"); }}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-[600] transition-all ${
              activeTab === key
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Search + Filters ── */}
      {activeTab !== "Reprocess" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-2 py-2 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder={placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2.5 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Dropdown value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
            <div className="relative inline-flex items-center rounded-xl border border-gray-200 bg-white shadow-sm">
              <Calendar className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400 shrink-0" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="appearance-none rounded-xl bg-transparent pl-9 pr-8 py-2 text-[13px] text-gray-700 font-[500] focus:outline-none cursor-pointer"
              >
                {DATE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            </div>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-[13px] font-[600] text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>
      )}
 {/* ── Summary KPI cards ── */}
      {activeTab !== "Reprocess" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {cardConfigs.map(({ key, label, icon, grad, shadow, sublabel }) => (
            <SummaryCard
              key={key}
              icon={icon}
              label={label}
              value={cardValue(key)}
              grad={grad}
              shadow={shadow}
              sublabel={sublabel}
            />
          ))}
        </div>
      )}
      {/* ── Table area ── */}
      {activeTab === "Jobs" && (
        <JobsTable
          rows={jobRows}
          loading={jobsLoading}
          error={jobsError}
          onRetry={fetchJobs}
        />
      )}
      {activeTab === "FreightInvoices" && (
        <InvoicesTable
          rows={freightRows}
          loading={freightLoading}
          error={freightError}
          onRetry={fetchFreight}
          title="Freight Invoices"
          subtitle="Shipping and carrier invoices (UPS, FedEx, SAIA, etc.)"
          icon={Truck}
          accentColor="sky"
        />
      )}
      {activeTab === "TradeInvoices" && (
        <TradeInvoicesTable
          rows={tradeRows}
          loading={tradeLoading}
          error={tradeError}
          onRetry={fetchTrade}
        />
      )}
      {activeTab === "Reprocess" && <ReprocessPanel />}

     

    </div>
  );
}

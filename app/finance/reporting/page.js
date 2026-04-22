"use client";

import { useState, useMemo } from "react";

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
function JobsTable({ rows }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50">
          <Mail className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <p className="text-[15px] font-[700] text-gray-900">Jobs Processing History</p>
          <p className="text-[12px] text-gray-400 mt-0.5">One job = one email processed</p>
        </div>
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
            {rows.length === 0 ? (
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
                <Td><span className="text-gray-500 whitespace-pre-line leading-snug">{job.createdAt.replace(", ", ",\n")}</span></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Invoices table (Freight & Trade share same layout) ─────── */
function InvoicesTable({ rows, title, subtitle, icon: Icon, accentColor = "sky" }) {
  const iconBg  = accentColor === "purple" ? "bg-purple-50" : "bg-sky-50";
  const iconCls = accentColor === "purple" ? "text-purple-600" : "text-sky-600";
  const rowHover = accentColor === "purple" ? "hover:bg-purple-50/20" : "hover:bg-sky-50/20";
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconCls}`} />
        </div>
        <div>
          <p className="text-[15px] font-[700] text-gray-900">{title}</p>
          <p className="text-[12px] text-gray-400 mt-0.5">{subtitle}</p>
        </div>
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
            {rows.length === 0 ? (
              <tr><td colSpan={11} className="py-16 text-center text-[13px] text-gray-400">No invoices match your filters.</td></tr>
            ) : rows.map((inv) => (
              <tr key={inv.id} className={`${rowHover} transition-colors`}>
                <Td>
                  <span className="flex items-center justify-center">
                    <Paperclip className="h-4 w-4 text-indigo-500" />
                  </span>
                </Td>
                <Td><span className="font-[600] text-gray-800">{inv.vendor}</span></Td>
                <Td><span className="font-[700] text-gray-900 whitespace-nowrap">{inv.invoiceNumber}</span></Td>
                <Td><span className="text-gray-500">{inv.invoiceDate}</span></Td>
                <Td><span className="text-gray-500">{inv.dueDate}</span></Td>
                <Td><span className="text-indigo-600 font-[500]">{inv.posoNumber}</span></Td>
                <Td><span className="text-gray-700">{inv.description}</span></Td>
                <Td><span className="font-[700] text-gray-900">{inv.amount}</span></Td>
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
function TradeInvoicesTable({ rows }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-purple-50">
          <Package className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <p className="text-[15px] font-[700] text-gray-900">Trade Invoices</p>
          <p className="text-[12px] text-gray-400 mt-0.5">Purchase orders from suppliers (FAP, REFIN, DECOCER, etc.)</p>
        </div>
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
            {rows.length === 0 ? (
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
                <Td><span className="font-[700] text-gray-900 whitespace-nowrap">{inv.poNumber}</span></Td>
                {/* Invoice No */}
                <Td><span className="text-gray-500 whitespace-nowrap">{inv.invoiceNo}</span></Td>
                {/* Invoice Date */}
                <Td><span className="text-gray-500 whitespace-nowrap">{inv.invoiceDate}</span></Td>
                {/* Freight Charge */}
                <Td><span className="text-gray-700">{inv.freightCharge}</span></Td>
                {/* Sales Tax */}
                <Td><span className="text-gray-700">{inv.salesTax}</span></Td>
                {/* Total Amount */}
                <Td><span className="font-[700] text-gray-900">{inv.totalAmount}</span></Td>
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
                <Td><span className="font-[700] text-gray-900">{inv.amount}</span></Td>
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
function ReprocessPanel() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-24 flex flex-col items-center gap-3 text-center">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50">
        <RefreshCw className="h-7 w-7 text-indigo-500" />
      </div>
      <p className="text-[16px] font-[700] text-gray-900">Reprocess Jobs</p>
      <p className="text-[13px] text-gray-400 max-w-xs leading-relaxed">Select failed or partial jobs from the Jobs tab to reprocess them here.</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function FinanceReportingPage() {
  const [activeTab,    setActiveTab]    = useState("Jobs");
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter,   setDateFilter]   = useState("Last 30 Days");

  const filterRows = (rows) => {
    let r = rows;
    if (statusFilter !== "All Status") r = r.filter((x) => x.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((x) => Object.values(x).some((v) => String(v ?? "").toLowerCase().includes(q)));
    }
    return r;
  };

  const jobRows     = useMemo(() => filterRows(MOCK_JOBS),    [search, statusFilter]);
  const freightRows = useMemo(() => filterRows(MOCK_FREIGHT), [search, statusFilter]);
  const tradeRows   = useMemo(() => filterRows(MOCK_TRADE),   [search, statusFilter]);

  const activeRows =
    activeTab === "FreightInvoices" ? freightRows
    : activeTab === "TradeInvoices" ? tradeRows
    : jobRows;

  const isInvoiceTab = activeTab === "FreightInvoices" || activeTab === "TradeInvoices";

  const stats = useMemo(() => {
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
  }, [activeRows, activeTab]);

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

      {/* ── Table area ── */}
      {activeTab === "Jobs" && <JobsTable rows={jobRows} />}
      {activeTab === "FreightInvoices" && (
        <InvoicesTable
          rows={freightRows}
          title="Freight Invoices"
          subtitle="Shipping and carrier invoices (UPS, FedEx, SAIA, etc.)"
          icon={Truck}
          accentColor="sky"
        />
      )}
      {/* {activeTab === "TradeInvoices" && <TradeInvoicesTable rows={tradeRows} />} */}
      {activeTab === "Reprocess" && <ReprocessPanel />}

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

    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Printer, RotateCcw } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface ReceiptItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

export interface ReceiptData {
  id: string;
  /** Can be a date-only string, or a full "date, time" string — either works. */
  date: string;
  /** Optional. Only rendered as its own row if provided. */
  time?: string;
  items: ReceiptItem[];
  subtotal: number;
  discountAmt: number;
  tax: number;
  total: number;
  payment: "cash" | "card" | "upi" | string;
  amountPaid?: number;
  balance?: number;
  cashierName?: string;
}

export interface BillPrintPreviewProps {
  receipt?: ReceiptData;
  storeName?: string;
  storeTagline?: string;
  storeAddress?: string;
  storePhone?: string;
  storeGST?: string;
  onNewSale?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Demo data — mirrors the sample slip so this renders correctly       */
/*  even before real data is wired up                                   */
/* ------------------------------------------------------------------ */

const DEMO_RECEIPT: ReceiptData = {
  id: "INV-000353",
  date: "05-07-2026",
  time: "06:40 PM",
  payment: "cash",
  cashierName: "Admin",
  items: [
    { id: "1", name: "Tata Salt 1kg", qty: 2, price: 28 },
    { id: "2", name: "Britannia Good Day", qty: 1, price: 30 },
    { id: "3", name: "Bananas", qty: 1, price: 45 },
    { id: "4", name: "Sunflower Oil 1L", qty: 1, price: 149 },
    { id: "5", name: "Red Label Tea 250g", qty: 1, price: 118 },
    { id: "6", name: "Onions", qty: 1, price: 32 },
    { id: "7", name: "Amul Milk 500ml", qty: 1, price: 30 },
    { id: "8", name: "Maggi Noodles", qty: 1, price: 14 },
  ],
  subtotal: 474.0,
  discountAmt: 47.4,
  tax: 21.33,
  total: 447.93,
  amountPaid: 450.0,
  balance: 2.07,
};

/* ------------------------------------------------------------------ */
/*  Safe-number helpers — real data can arrive undefined/NaN; never     */
/*  let that leak into the printed receipt as blank or "NaN".           */
/* ------------------------------------------------------------------ */

function n(value: number | undefined | null): number {
  return typeof value === "number" && !Number.isNaN(value) ? value : 0;
}

/* ------------------------------------------------------------------ */
/*  Monospace formatting helpers — everything below is built to line   */
/*  up in a fixed-width font, the way a real thermal printer would set  */
/*  it, rather than as a flex/grid "card".                              */
/*                                                                       */
/*  LINE_WIDTH is deliberately narrow (42, not the old 48) so the whole  */
/*  line fits inside the on-screen card at this font size without       */
/*  triggering horizontal scroll. The 80mm print output is unaffected —  */
/*  it's governed by @page size, not this character count.              */
/* ------------------------------------------------------------------ */

const LINE_WIDTH = 42;
const NAME_W = 20;
const QTY_W = 4;
const RATE_W = 8;
const AMT_W = 10;

const rupee = (val: number) => `₹${n(val)}`;
const rupee2 = (val: number) => `₹${n(val).toFixed(2)}`;

function centerText(text: string, width = LINE_WIDTH) {
  const pad = Math.max(0, width - text.length);
  const left = Math.floor(pad / 2);
  const right = pad - left;
  return " ".repeat(left) + text + " ".repeat(right);
}

function metaRow(label: string, value: string) {
  return `${label.padEnd(10)} : ${value}`;
}

function itemHeaderRow() {
  return (
    "ITEM".padEnd(NAME_W) +
    "QTY".padStart(QTY_W) +
    "RATE".padStart(RATE_W) +
    "AMT".padStart(AMT_W)
  );
}

function itemRow(name: string, qty: number, rate: number, amount: number) {
  const safeName = name || "Item";
  const trimmedName =
    safeName.length > NAME_W ? safeName.slice(0, NAME_W - 1) + "…" : safeName.padEnd(NAME_W);
  return (
    trimmedName +
    String(n(qty)).padStart(QTY_W) +
    rupee(rate).padStart(RATE_W) +
    rupee(amount).padStart(AMT_W)
  );
}

function summaryRow(label: string, value: string) {
  const gap = Math.max(1, LINE_WIDTH - label.length - value.length);
  return label + " ".repeat(gap) + value;
}

const DIVIDER = "-".repeat(LINE_WIDTH - 1);
const BORDER = "=".repeat(LINE_WIDTH);

const PAYMENT_LABELS: Record<string, string> = { cash: "Cash", card: "Card", upi: "UPI" };

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function BillPrintPreview({
  receipt = DEMO_RECEIPT,
  storeName = "Sai General Store",
  storeTagline = "Grocery & Daily Essentials",
  storeAddress = "12, Main Road, Nagercoil - 629001",
  storePhone = "+91 98765 43210",
  storeGST = "33ABCDE1234F1Z5",
  onNewSale,
}: BillPrintPreviewProps) {
  const [activeName, setActiveName] = useState(storeName);
  const [activeAddr, setActiveAddr] = useState(storeAddress);
  const [activeGstin, setActiveGstin] = useState(storeGST);
  const [activeFooter, setActiveFooter] = useState("THANK YOU • VISIT AGAIN");
  const [activeTerms, setActiveTerms] = useState("Exchange within 3 days\nKeep this bill safely");

  useEffect(() => {
    const loadSettings = () => {
      try {
        const local = localStorage.getItem("shop_settings");
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed.shop_name) setActiveName(parsed.shop_name);
          if (parsed.shop_address) setActiveAddr(parsed.shop_address);
          if (parsed.gstin) setActiveGstin(parsed.gstin);
          if (parsed.footer_message) setActiveFooter(parsed.footer_message);
          if (parsed.terms_conditions) setActiveTerms(parsed.terms_conditions);
        }
      } catch (e) {}
    };
    loadSettings();
    window.addEventListener("settingsUpdated", loadSettings);
    return () => window.removeEventListener("settingsUpdated", loadSettings);
  }, [storeName, storeAddress]);

  const itemCount = receipt.items.reduce((sum, i) => sum + n(i.qty), 0);
  const isCash = receipt.payment === "cash";

  const subtotal = n(receipt.subtotal);
  const discountAmt = n(receipt.discountAmt);
  const tax = n(receipt.tax);
  const total = n(receipt.total);
  const amountPaid = n(receipt.amountPaid ?? receipt.total);
  const balance = n(receipt.balance);

  const lines: string[] = [];
  lines.push(BORDER);
  lines.push(centerText(activeName.toUpperCase()));
  if (storeTagline) lines.push(centerText(storeTagline));
  if (activeAddr) lines.push(centerText(activeAddr));
  if (storePhone) lines.push(centerText(`Ph: ${storePhone}`));
  if (activeGstin) lines.push(centerText(`GSTIN: ${activeGstin}`));
  lines.push(DIVIDER);
  lines.push(metaRow("Invoice No", receipt.id));
  lines.push(metaRow("Date", receipt.date));
  // Only shown when the caller actually supplies a separate time value —
  // avoids ever printing the literal string "undefined".
  if (receipt.time) lines.push(metaRow("Time", receipt.time));
  lines.push(metaRow("Payment", PAYMENT_LABELS[receipt.payment] ?? receipt.payment));
  if (receipt.cashierName) lines.push(metaRow("Cashier", receipt.cashierName));
  lines.push(DIVIDER);
  lines.push(itemHeaderRow());
  lines.push(DIVIDER);
  for (const i of receipt.items) {
    lines.push(itemRow(i.name, i.qty, i.price, n(i.price) * n(i.qty)));
  }
  lines.push(DIVIDER);
  lines.push(summaryRow("Items", String(itemCount)));
  lines.push(summaryRow("Subtotal", rupee2(subtotal)));
  if (discountAmt > 0) {
    lines.push(summaryRow("Discount", `-${rupee2(discountAmt)}`));
  }
  lines.push(summaryRow("GST (5%)", rupee2(tax)));
  lines.push(DIVIDER);
  lines.push(summaryRow("GRAND TOTAL", rupee2(total)));
  lines.push(DIVIDER);
  if (isCash) {
    lines.push(summaryRow("Amount Paid", rupee2(amountPaid)));
    lines.push(summaryRow("Balance", rupee2(balance)));
    lines.push(DIVIDER);
  }
  lines.push("");
  if (activeFooter) {
    activeFooter.split("\n").forEach((line) => lines.push(centerText(line)));
  }
  if (activeTerms) {
    activeTerms.split("\n").forEach((line) => lines.push(centerText(line)));
  }
  lines.push(BORDER);

  const receiptText = lines.join("\n");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F4F5F7",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 16px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          html, body {
            width: 80mm;
            margin: 0;
            padding: 0;
          }
          body * { visibility: hidden; }
          .receipt-print-area, .receipt-print-area * { visibility: visible; }
          .receipt-print-area {
            position: absolute;
            top: 0;
            left: 0;
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            padding: 3mm !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "#0A9A5A", fontSize: 14, fontWeight: 600 }}>
        <CheckCircle2 size={18} /> Sale completed
      </div>

      {/* Printable receipt — width is capped to thermal-slip size, never full page.
          Widened slightly (320 -> 336) and font/columns tuned so the monospace
          text fits without triggering horizontal scroll. */}
      <div
        className="receipt-print-area"
        style={{
          width: "336px",
          maxWidth: "100%",
          background: "#FFFFFF",
          border: "1px solid #E3E6EA",
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(18,21,26,0.08)",
          padding: "16px 14px",
          boxSizing: "border-box",
        }}
      >
        <pre
          style={{
            margin: 0,
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 11,
            lineHeight: 1.55,
            whiteSpace: "pre",
            overflowX: "hidden",
            wordBreak: "keep-all",
            color: "#12151A",
          }}
        >
          {receiptText}
        </pre>
      </div>

      <div className="no-print" style={{ width: 336, maxWidth: "100%", display: "flex", gap: 8, marginTop: 16 }}>
        <button
          onClick={() => window.print()}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "12px 0",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 14,
            background: "#FFFFFF",
            border: "1.5px solid #E3E6EA",
            color: "#12151A",
            cursor: "pointer",
          }}
        >
          <Printer size={16} /> Print receipt
        </button>
        <button
          onClick={onNewSale}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "12px 0",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 14,
            background: "#215CF6",
            border: "none",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          <RotateCcw size={16} /> New sale
        </button>
      </div>
    </div>
  );
}
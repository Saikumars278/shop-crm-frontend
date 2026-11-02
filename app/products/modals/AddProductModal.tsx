"use client";

import { useState } from "react";
import { FiX, FiPackage, FiLoader, FiCamera, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import type { Product } from "../ProductTable";
import BarcodeScannerModal from "@/app/components/BarcodeScannerModal";

type AddProductModalProps = {
  open: boolean;
  onClose: () => void;
  nextId: string;
  onAdd: (product: Product) => void;
};

const CATEGORIES = [
  "Fruits", "Vegetables", "Rice", "Flour", "Pulses",
  "Spices", "Oil & Ghee", "Sugar & Salt", "Tea & Coffee",
  "Milk", "Curd", "Butter & Cheese", "Eggs",
  "Meat", "Chicken", "Fish", "Frozen Foods",
  "Bakery", "Biscuits", "Snacks", "Chocolates", "Ice Cream",
  "Soft Drinks", "Juices", "Water",
  "Instant Foods", "Noodles & Pasta", "Breakfast",
  "Dry Fruits", "Pickles", "Sauces & Ketchup",
  "Baby Care", "Personal Care", "Health Care",
  "Cleaning", "Detergents", "Home Care",
  "Stationery", "Pet Food", "Others",
];

const UNITS = ["pcs", "kg", "g", "L", "mL", "pack", "dozen", "box", "bottle", "pouch"];

// Set this to your Django backend base URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

function getStatus(stock: number): Product["status"] {
  if (stock <= 0) return "Out of Stock";
  if (stock < 10) return "Low Stock";
  return "In Stock";
}

const emptyErrors = {
  name: "",
  category: "",
  buyPrice: "",
  sellPrice: "",
  stock: "",
  unit: "",
};

export default function AddProductModal({
  open,
  onClose,
  nextId,
  onAdd,
}: AddProductModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [expiryDate, setExpiryDate] = useState("");
  const [barcode, setBarcode] = useState("");
  const [errors, setErrors] = useState(emptyErrors);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [existingMsg, setExistingMsg] = useState("");
  const [existingProductId, setExistingProductId] = useState<string | null>(null);

  if (!open) return null;

  const resetForm = () => {
    setName("");
    setCategory(CATEGORIES[0]);
    setBuyPrice("");
    setSellPrice("");
    setStock("");
    setUnit("pcs");
    setExpiryDate("");
    setBarcode("");
    setErrors(emptyErrors);
    setApiError("");
    setExistingMsg("");
    setExistingProductId(null);
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    onClose();
  };

  const checkBarcodeExists = async (codeToCheck: string) => {
    const code = codeToCheck.trim();
    if (!code) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/products/barcode/${encodeURIComponent(code)}/`);
      if (res.ok) {
        const data = await res.json();
        if (data.found && data.product) {
          const p = data.product;
          setExistingProductId(String(p.id));
          setName(p.name || "");
          if (p.category && CATEGORIES.includes(p.category)) setCategory(p.category);
          setBuyPrice(p.buyPrice !== undefined ? String(p.buyPrice) : "");
          setSellPrice(p.sellPrice !== undefined ? String(p.sellPrice) : "");
          setStock(p.stock !== undefined ? String(p.stock) : "");
          if (p.unit && UNITS.includes(p.unit)) setUnit(p.unit);
          setExpiryDate(p.expiry_date || "");
          setExistingMsg(`Barcode matches existing product "${p.name}". Details loaded below.`);
        }
      } else {
        setExistingMsg("");
        setExistingProductId(null);
      }
    } catch (e) {
      // Ignore lookup network errors
    }
  };

  const handleBarcodeScanned = (scannedCode: string) => {
    setBarcode(scannedCode);
    checkBarcodeExists(scannedCode);
  };

  const validate = () => {
    const next = { ...emptyErrors };
    let valid = true;

    if (!name.trim()) {
      next.name = "Product name is required.";
      valid = false;
    }
    if (!category) {
      next.category = "Select a category.";
      valid = false;
    }
    if (buyPrice === "" || Number(buyPrice) < 0) {
      next.buyPrice = "Enter a valid buy price.";
      valid = false;
    }
    if (sellPrice === "" || Number(sellPrice) < 0) {
      next.sellPrice = "Enter a valid sell price.";
      valid = false;
    }
    if (stock === "" || Number(stock) < 0) {
      next.stock = "Enter a valid stock count.";
      valid = false;
    }

    setErrors(next);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (!validate()) return;

    const stockNum = Number(stock);
    const isUpdate = Boolean(existingProductId);
    const url = isUpdate
      ? `${API_BASE_URL}/api/products/${existingProductId}/`
      : `${API_BASE_URL}/api/products/`;
    const method = isUpdate ? "PUT" : "POST";

    const payload = {
      name: name.trim(),
      category,
      buyPrice: Number(buyPrice),
      sellPrice: Number(sellPrice),
      stock: stockNum,
      unit,
      expiry_date: expiryDate || null,
      barcode: barcode.trim() || null,
    };

    setSubmitting(true);

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.duplicate && data.product) {
          const p = data.product;
          setExistingProductId(String(p.id));
          setName(p.name || "");
          setBuyPrice(String(p.buy_price ?? p.buyPrice ?? ""));
          setSellPrice(String(p.sell_price ?? p.sellPrice ?? ""));
          setStock(String(p.stock ?? ""));
          setExistingMsg(`Product "${p.name}" already exists with barcode ${barcode}. You can update its details.`);
          setSubmitting(false);
          return;
        }

        const firstError =
          typeof data === "object"
            ? Object.values(data)[0]
            : "Something went wrong.";
        const message = Array.isArray(firstError)
          ? firstError[0]
          : String(firstError);
        setApiError(message || "Failed to save product.");
        setSubmitting(false);
        return;
      }

      const newProduct: Product = {
        id: String(data.id ?? existingProductId ?? nextId),
        name: data.name ?? name.trim(),
        category: data.category ?? category,
        buyPrice: Number(data.buy_price ?? data.buyPrice ?? buyPrice),
        sellPrice: Number(data.sell_price ?? data.sellPrice ?? sellPrice),
        stock: Number(data.stock ?? stockNum),
        status: getStatus(Number(data.stock ?? stockNum)),
      };

      onAdd(newProduct);
      resetForm();
      onClose();
    } catch (err) {
      setApiError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <BarcodeScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleBarcodeScanned}
        title="Scan Barcode to Add Product"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          onClick={handleClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl">
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-2.5">
                <FiPackage className="text-xl text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {existingProductId ? "Update Existing Product" : "Add Product"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {existingProductId ? (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      Editing Product #{existingProductId}
                    </span>
                  ) : (
                    <>
                      New item ID:{" "}
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {nextId}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              aria-label="Close"
              disabled={submitting}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-slate-300 disabled:opacity-50"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Body */}
          <form
            id="add-product-form"
            onSubmit={handleSubmit}
            className="flex-1 space-y-5 overflow-y-auto px-6 py-6"
          >
            {apiError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
                <FiAlertCircle size={16} />
                <span>{apiError}</span>
              </div>
            )}

            {existingMsg && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-900 px-4 py-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <FiCheckCircle size={16} className="text-emerald-500 shrink-0" />
                <span>{existingMsg}</span>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Product Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tata Salt, Amul Butter..."
                disabled={submitting}
                className={`w-full rounded-xl border px-4 py-3 text-slate-800 dark:text-white dark:bg-slate-800 outline-none transition focus:ring-2 disabled:opacity-60 ${errors.name
                    ? "border-red-300 focus:ring-red-200"
                    : "border-slate-200 dark:border-slate-700 focus:border-blue-400 focus:ring-blue-100"
                  }`}
              />
              {errors.name && (
                <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Category & Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={submitting}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-800 dark:text-white outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  disabled={submitting}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-800 dark:text-white outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Barcode (Scan or Type) */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Barcode (Scan or Type)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onBlur={(e) => checkBarcodeExists(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      checkBarcodeExists(barcode);
                    }
                  }}
                  placeholder="e.g. 8901234567890"
                  disabled={submitting}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-800 dark:text-white outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-60 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  disabled={submitting}
                  className="flex items-center gap-1.5 shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 text-xs font-bold transition shadow-sm"
                  title="Scan Barcode using Camera"
                >
                  <FiCamera size={16} />
                  <span>Scan</span>
                </button>
              </div>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Expiry Date (optional)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-800 dark:text-white outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
              />
              <p className="mt-1.5 text-xs text-slate-400">Leave blank for non-perishable items.</p>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Buy Price (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  placeholder="0"
                  disabled={submitting}
                  className={`w-full rounded-xl border px-4 py-3 text-slate-800 dark:text-white dark:bg-slate-800 outline-none transition focus:ring-2 disabled:opacity-60 ${
                    errors.buyPrice
                      ? "border-red-300 focus:ring-red-200"
                      : "border-slate-200 dark:border-slate-700 focus:border-blue-400 focus:ring-blue-100"
                  }`}
                />
                {errors.buyPrice && (
                  <p className="mt-1.5 text-sm text-red-600">
                    {errors.buyPrice}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Sell Price (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  placeholder="0"
                  disabled={submitting}
                  className={`w-full rounded-xl border px-4 py-3 text-slate-800 dark:text-white dark:bg-slate-800 outline-none transition focus:ring-2 disabled:opacity-60 ${
                    errors.sellPrice
                      ? "border-red-300 focus:ring-red-200"
                      : "border-slate-200 dark:border-slate-700 focus:border-blue-400 focus:ring-blue-100"
                  }`}
                />
                {errors.sellPrice && (
                  <p className="mt-1.5 text-sm text-red-600">
                    {errors.sellPrice}
                  </p>
                )}
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Stock Quantity
              </label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                disabled={submitting}
                className={`w-full rounded-xl border px-4 py-3 text-slate-800 dark:text-white dark:bg-slate-800 outline-none transition focus:ring-2 disabled:opacity-60 ${
                  errors.stock
                    ? "border-red-300 focus:ring-red-200"
                    : "border-slate-200 dark:border-slate-700 focus:border-blue-400 focus:ring-blue-100"
                }`}
              />
              {errors.stock && (
                <p className="mt-1.5 text-sm text-red-600">{errors.stock}</p>
              )}
              <p className="mt-1.5 text-xs text-slate-400">
                Status is set automatically from stock quantity.
              </p>
            </div>
        </form>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-2.5 font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-product-form"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <FiLoader className="animate-spin text-lg" />}
            {submitting ? "Adding..." : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  </>
);
}
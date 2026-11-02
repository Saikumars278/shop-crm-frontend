"use client";

import { useEffect, useState } from "react";
import { FiX, FiEdit2, FiTag, FiHash } from "react-icons/fi";
import type { Product } from "../ProductTable";

type EditProductModalProps = {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onUpdate: (product: Product) => void;
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

function getStatus(stock: number): Product["status"] {
  if (stock <= 0) return "Out of Stock";
  if (stock < 10) return "Low Stock";
  return "In Stock";
}

function statusDot(status: string) {
  if (status === "In Stock") return "bg-emerald-500";
  if (status === "Low Stock") return "bg-amber-500";
  return "bg-rose-500";
}

function statusTextClass(status: string) {
  if (status === "In Stock") return "text-emerald-600";
  if (status === "Low Stock") return "text-amber-600";
  return "text-rose-600";
}

const emptyErrors = {
  name: "",
  category: "",
  buyPrice: "",
  sellPrice: "",
  stock: "",
};

export default function EditProductModal({
  open,
  product,
  onClose,
  onUpdate,
}: EditProductModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [expiryDate, setExpiryDate] = useState("");
  const [barcode, setBarcode] = useState("");
  const [errors, setErrors] = useState(emptyErrors);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category || CATEGORIES[0]);
      setBuyPrice(String(product.buyPrice));
      setSellPrice(String(product.sellPrice));
      setStock(String(product.stock));
      setUnit(product.unit ?? "pcs");
      setExpiryDate(product.expiry_date ?? "");
      setBarcode(product.barcode ?? "");
      setErrors(emptyErrors);
    }
  }, [product]);

  if (!open || !product) return null;

  const validate = () => {
    const next = { ...emptyErrors };
    let valid = true;

    if (!name.trim()) {
      next.name = "Product name is required.";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const stockNum = Number(stock);

    onUpdate({
      ...product,
      name: name.trim(),
      category,
      buyPrice: Number(buyPrice),
      sellPrice: Number(sellPrice),
      stock: stockNum,
      status: getStatus(stockNum),
      unit,
      expiry_date: expiryDate || null,
      barcode: barcode.trim() || null,
    });
  };

  const livePreviewStatus =
    stock !== "" && !Number.isNaN(Number(stock))
      ? getStatus(Number(stock))
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-slate-900/10 dark:ring-white/10">
        
        {/* Header (shrink-0 prevents flex shrink clipping) */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5 border-b border-slate-800">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-teal-500/15 blur-2xl" />

          <div className="relative flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Editing {product.id}
            </span>

            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-full bg-white/10 p-2 text-white/70 backdrop-blur transition hover:bg-white/20 hover:text-white"
            >
              <FiX size={16} />
            </button>
          </div>

          <div className="relative mt-4 flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 ring-1 ring-white/20">
              <FiEdit2 size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-extrabold text-white leading-tight">Edit Grocery Item</h3>
              <p className="text-xs font-medium text-slate-300 mt-0.5">
                Modify item pricing, stock levels, and attributes
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <form
          id="edit-product-form"
          onSubmit={handleSubmit}
          className="flex-1 space-y-4 overflow-y-auto p-6 text-slate-700 dark:text-slate-200"
        >
          {/* Section 1: Basic Info */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 space-y-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Basic Details
            </p>
            
            {/* Item Name */}
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-200">
                Item Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tata Salt, Amul Butter..."
                className={`w-full rounded-xl border bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white outline-none transition focus:ring-2 ${
                  errors.name
                    ? "border-rose-400 focus:ring-rose-400/20"
                    : "border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs font-medium text-rose-500">{errors.name}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-200">
                Category
              </label>
              <div className="relative">
                <FiTag className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 dark:text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Unit & Barcode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-200">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-200">Barcode</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="e.g. 8901234567890"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Section 3: Pricing & Stock */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 space-y-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Pricing & Stock
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Buy Price (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  className={`w-full rounded-xl border bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white outline-none transition focus:ring-2 ${
                    errors.buyPrice
                      ? "border-rose-400 focus:ring-rose-400/20"
                      : "border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20"
                  }`}
                />
                {errors.buyPrice && (
                  <p className="mt-1 text-xs font-medium text-rose-500">{errors.buyPrice}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Sell Price (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  className={`w-full rounded-xl border bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white outline-none transition focus:ring-2 ${
                    errors.sellPrice
                      ? "border-rose-400 focus:ring-rose-400/20"
                      : "border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20"
                  }`}
                />
                {errors.sellPrice && (
                  <p className="mt-1 text-xs font-medium text-rose-500">{errors.sellPrice}</p>
                )}
              </div>
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-200">
                Stock Quantity <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FiHash className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="number"
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className={`w-full rounded-xl border bg-white dark:bg-slate-900 py-2.5 pl-10 pr-3.5 text-xs font-semibold text-slate-800 dark:text-white outline-none transition focus:ring-2 ${
                    errors.stock
                      ? "border-rose-400 focus:ring-rose-400/20"
                      : "border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20"
                  }`}
                />
              </div>
              {errors.stock && (
                <p className="mt-1 text-xs font-medium text-rose-500">{errors.stock}</p>
              )}

              {livePreviewStatus && (
                <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 px-3 py-2 border border-slate-100 dark:border-slate-800">
                  <span className={`h-1.5 w-1.5 rounded-full ${statusDot(livePreviewStatus)}`} />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Status: <span className={`font-bold ${statusTextClass(livePreviewStatus)}`}>{livePreviewStatus}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Expiry Date */}
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-200">Expiry Date (optional)</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <p className="mt-1 text-[11px] text-slate-400">Leave blank for non-perishable grocery items.</p>
          </div>
        </form>

        {/* Footer (shrink-0 keeps action buttons pinned) */}
        <div className="shrink-0 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 px-6 py-4 backdrop-blur-md">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-product-form"
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition hover:opacity-95 hover:shadow-lg active:scale-95"
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
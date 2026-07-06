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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
      />

      {/* Modal */}
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-black/5">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-7 pb-7 pt-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-teal-500/10 blur-2xl" />

          <div className="relative flex items-start justify-between">
            <span className="rounded-full bg-white dark:bg-slate-900/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/70 ring-1 ring-white/10">
              Editing {product.id}
            </span>

            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-full bg-white/10 p-2 text-white/70 backdrop-blur transition hover:bg-white dark:bg-slate-900/20 hover:text-white"
            >
              <FiX />
            </button>
          </div>

          <div className="relative mt-5 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-slate-900/10 ring-1 ring-white/15">
              <FiEdit2 className="text-2xl text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-white">Edit Grocery Item</h3>
              <p className="text-sm font-medium text-white/50">
                Update the details below
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <form
          id="edit-product-form"
          onSubmit={handleSubmit}
          className="flex-1 space-y-5 overflow-y-auto px-7 py-6"
        >
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Item Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tata Salt, Amul Butter..."
              className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:bg-white focus:ring-2 ${
                errors.name
                  ? "border-rose-300 focus:ring-rose-100"
                  : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-100"
              }`}
            />
            {errors.name && (
              <p className="mt-1.5 text-sm text-rose-600">{errors.name}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Category
            </label>
            <div className="relative">
              <FiTag className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-3 pl-11 pr-4 text-slate-800 dark:text-white outline-none transition focus:border-emerald-400 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-100"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Unit + Barcode */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-800 dark:text-white outline-none transition focus:border-emerald-400 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-100"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Barcode (optional)</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="e.g. 8901234567890"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-800 dark:text-white outline-none transition focus:border-emerald-400 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Expiry Date (optional)</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-800 dark:text-white outline-none transition focus:border-emerald-400 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-100"
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
                className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:bg-white focus:ring-2 ${
                  errors.buyPrice
                    ? "border-rose-300 focus:ring-rose-100"
                    : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-100"
                }`}
              />
              {errors.buyPrice && (
                <p className="mt-1.5 text-sm text-rose-600">{errors.buyPrice}</p>
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
                className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:bg-white focus:ring-2 ${
                  errors.sellPrice
                    ? "border-rose-300 focus:ring-rose-100"
                    : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-100"
                }`}
              />
              {errors.sellPrice && (
                <p className="mt-1.5 text-sm text-rose-600">{errors.sellPrice}</p>
              )}
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Stock Quantity
            </label>
            <div className="relative">
              <FiHash className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className={`w-full rounded-xl border bg-slate-50 py-3 pl-11 pr-4 text-slate-800 outline-none transition focus:bg-white focus:ring-2 ${
                  errors.stock
                    ? "border-rose-300 focus:ring-rose-100"
                    : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-100"
                }`}
              />
            </div>
            {errors.stock && (
              <p className="mt-1.5 text-sm text-rose-600">{errors.stock}</p>
            )}

            {livePreviewStatus && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800 px-4 py-2.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${statusDot(livePreviewStatus)}`}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Status will update to{" "}
                  <span className={`font-semibold ${statusTextClass(livePreviewStatus)}`}>
                    {livePreviewStatus}
                  </span>
                </p>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 px-7 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-product-form"
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
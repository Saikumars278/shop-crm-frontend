"use client";
import { API_BASE } from "@/app/lib/api";

import React, { useState } from "react";
import {
  FiSettings,
  FiUser,
  FiFileText,
  FiSave,
  FiRefreshCcw,
  FiCamera,
  FiCheckCircle,
  FiAlertCircle,
  FiEdit2
} from "react-icons/fi";

const TABS = [
  { id: "general", label: "General Information", icon: FiUser },
  { id: "billing", label: "Billing & Tax Settings", icon: FiFileText },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [settings, setSettings] = useState({
    shop_name: "Sai General Store",
    shop_email: "admin@saigeneralstore.com",
    shop_address: "12, Main Road, Nagercoil - 629001",
    gstin: "33ABCDE1234F1Z5",
    default_tax_rate: "18.00",
    pricing_strategy: "Tax Inclusive",
    invoice_prefix: "INV-",
    footer_message: "Thank you for shopping with us! Please visit again.",
    terms_conditions: "1. Goods once sold can be returned within 7 days with valid receipt.\n2. All disputes subject to local jurisdiction."
  });

  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@saigeneralstore.com",
    phone: "+91 98765 43210"
  });

  React.useEffect(() => {
    async function loadSettings() {
      try {
        const local = localStorage.getItem("shop_settings");
        if (local) {
          try { setSettings(JSON.parse(local)); } catch (e) {}
        }
        const res = await fetch(`${API_BASE}/settings/`);
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
          localStorage.setItem("shop_settings", JSON.stringify(data));
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async () => {
    setSaving(true);
    localStorage.setItem("shop_settings", JSON.stringify(settings));
    window.dispatchEvent(new Event("settingsUpdated"));
    try {
      const res = await fetch(`${API_BASE}/settings/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        triggerToast("Settings saved & updated across all bills!", "success");
      } else {
        triggerToast("Saved settings locally for all bills.", "success");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Saved settings locally for all bills.", "success");
    } finally {
      setSaving(false);
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="mx-auto max-w-7xl space-y-6 w-full min-w-0">
          {/* Header Bar Shimmer */}
          <div className="flex flex-col sm:flex-row items-center justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-xs gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="h-12 w-12 rounded-2xl youtube-shimmer shrink-0" />
              <div className="space-y-2">
                <div className="h-5 w-48 rounded-md youtube-shimmer" />
                <div className="h-3 w-72 max-w-full rounded-md youtube-shimmer" />
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="h-9 w-28 rounded-xl youtube-shimmer" />
              <div className="h-9 w-24 rounded-xl youtube-shimmer" />
              <div className="h-9 w-32 rounded-xl youtube-shimmer" />
            </div>
          </div>

          {/* Main Layout Shimmer */}
          <div className="flex flex-col lg:flex-row gap-6 w-full min-w-0">
            {/* Sidebar Shimmer */}
            <div className="w-full lg:w-72 shrink-0 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-3 shadow-xs space-y-2">
              <div className="h-3 w-20 rounded youtube-shimmer my-2 mx-2" />
              <div className="h-11 w-full rounded-xl youtube-shimmer" />
              <div className="h-11 w-full rounded-xl youtube-shimmer" />
            </div>

            {/* Content Panel Shimmer */}
            <div className="flex-1 space-y-6 min-w-0">
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
                <div className="border-b border-slate-100 dark:border-slate-800/80 p-5 flex justify-between items-center">
                  <div className="space-y-1.5">
                    <div className="h-4 w-36 rounded youtube-shimmer" />
                    <div className="h-3 w-56 rounded youtube-shimmer" />
                  </div>
                  <div className="h-8 w-24 rounded-lg youtube-shimmer" />
                </div>
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-5">
                    <div className="h-20 w-20 rounded-2xl youtube-shimmer shrink-0" />
                    <div className="space-y-2">
                      <div className="h-8 w-28 rounded-xl youtube-shimmer" />
                      <div className="h-3 w-40 rounded youtube-shimmer" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-3 w-24 rounded youtube-shimmer" />
                        <div className="h-10 w-full rounded-xl youtube-shimmer" />
                      </div>
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

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 transition-colors">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-2xl backdrop-blur-md transition-all duration-300 animate-bounce ${
          toast.type === "success" 
            ? "bg-emerald-600/95 text-white shadow-emerald-500/20" 
            : "bg-red-600/95 text-white shadow-red-500/20"
        }`}>
          {toast.type === "success" ? <FiCheckCircle size={18} /> : <FiAlertCircle size={18} />}
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      <div className="mx-auto max-w-7xl space-y-6 w-full min-w-0">
        
        {/* Page Header Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
              <FiSettings size={24} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Settings &amp; Preferences</h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Manage business configuration, tax rates, profile and backup data.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <button 
              onClick={() => {
                const nextState = !isEditing;
                setIsEditing(nextState);
                triggerToast(nextState ? "Editing unlocked! Modify any detail now." : "Editing locked.", "success");
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold shadow-md transition active:scale-95 ${
                isEditing 
                  ? "bg-amber-500 text-white shadow-amber-500/20 hover:bg-amber-600" 
                  : "bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700"
              }`}>
              <FiEdit2 size={14} />
              <span>{isEditing ? "Lock Edit" : "Edit Details"}</span>
            </button>

            <button 
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95">
              <FiRefreshCcw size={14} />
              <span>Reset</span>
            </button>
            <button 
              onClick={handleSave}
              disabled={loading || saving}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 sm:px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/25 transition-all hover:from-emerald-700 hover:to-emerald-600 active:scale-95 disabled:opacity-60">
              <FiSave size={14} />
              <span>{saving ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6 w-full min-w-0">
          
          {/* Responsive Tabs Sidebar */}
          <div className="w-full lg:w-72 shrink-0 flex flex-row overflow-x-auto lg:flex-col gap-1.5 lg:space-y-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-2 sm:p-3 shadow-sm h-fit scrollbar-none">
            <p className="hidden lg:block px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Categories
            </p>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 lg:w-full items-center gap-2 sm:gap-3.5 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/25"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon size={17} className={isActive ? "text-white" : "text-slate-400 dark:text-slate-500"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Panels Area */}
          <div className="flex-1 space-y-6 min-w-0">
            
            {/* ---------------- GENERAL TAB ---------------- */}
            {activeTab === "general" && (
              <div className="space-y-6">
                
                {/* Business Profile Card */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                  <div className="border-b border-slate-100 dark:border-slate-800/80 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">Shop Information</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Primary business name, contact, logo and location.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => triggerToast("Edit mode active! You can modify shop name, phone, and address.")}
                        className="flex items-center gap-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 transition hover:bg-blue-100">
                        <FiEdit2 size={13} />
                        Edit Details
                      </button>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Logo Picker */}
                    <div className="col-span-full">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">Shop Logo</label>
                      <div className="flex items-center gap-5">
                        <div className="h-20 w-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:border-blue-500 transition-colors">
                          <FiCamera className="text-2xl" />
                        </div>
                        <div>
                          <button type="button" disabled={!isEditing} className="rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                            Upload Logo Image
                          </button>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">PNG, JPG or SVG up to 2MB. Recommended 512x512px.</p>
                        </div>
                      </div>
                    </div>

                    {/* Shop Name */}
                    <div className="col-span-full">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Shop / Business Name</label>
                      <input 
                        type="text" 
                        disabled={!isEditing}
                        value={settings.shop_name} 
                        placeholder="e.g. My Supermarket & Retail"
                        onChange={(e) => setSettings({ ...settings, shop_name: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/90 px-4 py-3 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-70 disabled:bg-slate-100/60 dark:disabled:bg-slate-800/40 disabled:cursor-not-allowed" 
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Contact Email</label>
                      <input 
                        type="email" 
                        disabled={!isEditing}
                        value={settings.shop_email} 
                        placeholder="admin@mysupermarket.com"
                        onChange={(e) => setSettings({ ...settings, shop_email: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/90 px-4 py-3 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-70 disabled:bg-slate-100/60 dark:disabled:bg-slate-800/40 disabled:cursor-not-allowed" 
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                      <input 
                        type="text" 
                        disabled={!isEditing}
                        value={profile.phone} 
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/90 px-4 py-3 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-70 disabled:bg-slate-100/60 dark:disabled:bg-slate-800/40 disabled:cursor-not-allowed" 
                      />
                    </div>

                    {/* Address */}
                    <div className="col-span-full">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Store Street Address</label>
                      <textarea 
                        rows={3} 
                        disabled={!isEditing}
                        value={settings.shop_address} 
                        placeholder="123 Main Street, Suite 100, City, State"
                        onChange={(e) => setSettings({ ...settings, shop_address: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/90 px-4 py-3 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 resize-none disabled:opacity-70 disabled:bg-slate-100/60 dark:disabled:bg-slate-800/40 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* User Profile Card */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">Admin Account Profile</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage full name and credentials.</p>
                    </div>
                    <button 
                      onClick={() => triggerToast("Edit mode active! You can modify name and credentials.")}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 transition hover:bg-blue-100">
                      <FiEdit2 size={13} />
                      Edit Profile
                    </button>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                      <input 
                        type="text" 
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/90 px-4 py-3 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                      <input 
                        type="email" 
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/90 px-4 py-3 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20" 
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ---------------- BILLING & TAX TAB ---------------- */}
            {activeTab === "billing" && (
              <div className="space-y-6">
                
                {/* GST & Tax Card */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">GST &amp; Tax Configuration</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Configure tax numbers and billing strategies for checkout invoices.</p>
                    </div>
                    <button 
                      onClick={() => triggerToast("Edit mode active! You can modify GSTIN and tax rates.")}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 transition hover:bg-blue-100">
                      <FiEdit2 size={13} />
                      Edit Tax Config
                    </button>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    <div className="col-span-full">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">GSTIN / Tax Identification Number</label>
                      <input 
                        type="text" 
                        value={settings.gstin} 
                        placeholder="22AAAAA0000A1Z5"
                        onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/90 px-4 py-3 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 uppercase" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Default Tax Rate (%)</label>
                      <div className="relative">
                        <select 
                          value={settings.default_tax_rate}
                          onChange={(e) => setSettings({ ...settings, default_tax_rate: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/90 px-4 py-3 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                        >
                          <option value="0.00">0% (Exempt)</option>
                          <option value="5.00">5% Standard GST</option>
                          <option value="12.00">12% GST</option>
                          <option value="18.00">18% GST (Default)</option>
                          <option value="28.00">28% Luxury GST</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Pricing Strategy</label>
                      <select 
                        value={settings.pricing_strategy}
                        onChange={(e) => setSettings({ ...settings, pricing_strategy: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/90 px-4 py-3 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                      >
                        <option value="Tax Inclusive">Tax Inclusive (Price includes tax)</option>
                        <option value="Tax Exclusive">Tax Exclusive (Tax added at checkout)</option>
                      </select>
                    </div>

                  </div>
                </div>

                {/* Invoice Customization */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">Invoice &amp; Receipt Options</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Customize printed receipts and invoice metadata.</p>
                    </div>
                    <button 
                      onClick={() => triggerToast("Edit mode active. Click 'Save Settings' to apply changes.")}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 transition hover:bg-blue-100">
                      <FiEdit2 size={13} />
                      Edit Fields
                    </button>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Invoice Number Prefix</label>
                      <input 
                        type="text" 
                        disabled={!isEditing}
                        value={settings.invoice_prefix || "INV-"} 
                        onChange={(e) => setSettings({ ...settings, invoice_prefix: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/90 px-4 py-3 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-70 disabled:bg-slate-100/60 dark:disabled:bg-slate-800/40 disabled:cursor-not-allowed" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Footer Thank You Message</label>
                      <input 
                        type="text" 
                        disabled={!isEditing}
                        value={settings.footer_message || ""} 
                        onChange={(e) => setSettings({ ...settings, footer_message: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/90 px-4 py-3 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-70 disabled:bg-slate-100/60 dark:disabled:bg-slate-800/40 disabled:cursor-not-allowed" 
                      />
                    </div>
                    <div className="col-span-full">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Terms &amp; Conditions</label>
                      <textarea 
                        rows={3} 
                        disabled={!isEditing}
                        value={settings.terms_conditions || ""} 
                        onChange={(e) => setSettings({ ...settings, terms_conditions: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/90 px-4 py-3 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 resize-none disabled:opacity-70 disabled:bg-slate-100/60 dark:disabled:bg-slate-800/40 disabled:cursor-not-allowed" 
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}


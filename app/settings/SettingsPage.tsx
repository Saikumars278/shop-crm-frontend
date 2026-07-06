"use client";

import React, { useState } from "react";
import {
  FiSettings,
  FiUser,
  FiFileText,
  FiShield,
  FiMonitor,
  FiSave,
  FiRefreshCcw,
  FiCamera,
  FiDownload,
  FiUpload,
  FiBell
} from "react-icons/fi";

const TABS = [
  { id: "general", label: "General", icon: <FiUser /> },
  { id: "billing", label: "Billing & Tax", icon: <FiFileText /> },
  { id: "security", label: "Security & Backup", icon: <FiShield /> },
  { id: "preferences", label: "Preferences", icon: <FiMonitor /> },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    shop_name: "",
    shop_email: "",
    shop_address: "",
    gstin: "",
    default_tax_rate: "18.00",
    pricing_strategy: "Tax Inclusive"
  });

  React.useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/settings/");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/settings/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-5 bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto w-full space-y-4">
        
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2.5 shadow-md shadow-blue-600/20">
              <FiSettings className="text-lg text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Settings & Preferences</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your shop configurations and account settings.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center gap-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:bg-slate-800 active:scale-95">
              <FiRefreshCcw size={14} />
              Reset
            </button>
            <button 
              onClick={handleSave}
              disabled={loading || saving}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-70">
              <FiSave size={14} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mt-6">
          
          {/* Vertical Tabs Navigation */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Settings Content Area */}
          <div className="flex-1 space-y-4">
            
            {/* ---------------- GENERAL SETTINGS ---------------- */}
            {activeTab === "general" && (
              <>
                <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <div className="border-b border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/50">
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">Shop Information</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Update your primary business details.</p>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-full">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Shop Logo</label>
                      <div className="flex items-center gap-4">
                        <div className="h-20 w-20 rounded-xl bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
                          <FiCamera className="text-2xl text-slate-400" />
                        </div>
                        <button className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200">Upload New</button>
                      </div>
                    </div>
                    
                    <div className="col-span-full">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">Shop Name</label>
                      <input 
                        type="text" 
                        value={settings.shop_name} 
                        onChange={(e) => setSettings({ ...settings, shop_name: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-100" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">Contact Email</label>
                      <input 
                        type="email" 
                        value={settings.shop_email} 
                        onChange={(e) => setSettings({ ...settings, shop_email: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-100" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">Phone Number</label>
                      <input 
                        type="text" 
                        defaultValue="+91 98765 43210" 
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-100" 
                      />
                    </div>
                    <div className="col-span-full">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">Store Address</label>
                      <textarea 
                        rows={2} 
                        value={settings.shop_address} 
                        onChange={(e) => setSettings({ ...settings, shop_address: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <div className="border-b border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/50">
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">User Profile</h2>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">Manage your admin account details.</p>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Full Name</label>
                      <input type="text" defaultValue="Admin User" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Email Address</label>
                      <input type="email" defaultValue="admin@supermart.com" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-100" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ---------------- BILLING & TAX SETTINGS ---------------- */}
            {activeTab === "billing" && (
              <>
                <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <div className="border-b border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/50">
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">GST & Tax Settings</h2>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">Configure your tax identification and default rates.</p>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-full space-y-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">GSTIN / Tax ID</label>
                      <input 
                        type="text" 
                        value={settings.gstin} 
                        onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-100" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Default Tax Rate (%)</label>
                      <select 
                        value={settings.default_tax_rate}
                        onChange={(e) => setSettings({ ...settings, default_tax_rate: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="0.00">0%</option>
                        <option value="5.00">5%</option>
                        <option value="12.00">12%</option>
                        <option value="18.00">18%</option>
                        <option value="28.00">28%</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Pricing Strategy</label>
                      <select 
                        value={settings.pricing_strategy}
                        onChange={(e) => setSettings({ ...settings, pricing_strategy: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="Tax Inclusive">Tax Inclusive</option>
                        <option value="Tax Exclusive">Tax Exclusive</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <div className="border-b border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/50">
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">Billing & Invoice Options</h2>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">Customize how your printed invoices appear.</p>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Invoice Prefix</label>
                      <input type="text" defaultValue="INV-" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Footer Greeting</label>
                      <input type="text" defaultValue="Thank you for shopping with us!" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <div className="col-span-full space-y-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Terms & Conditions</label>
                      <textarea rows={3} defaultValue="1. Goods once sold will not be taken back.&#13;&#10;2. Subject to local jurisdiction." className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-100 resize-none" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ---------------- SECURITY & BACKUP ---------------- */}
            {activeTab === "security" && (
              <>
                <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <div className="border-b border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/50">
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">Change Password</h2>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">Ensure your account is using a long, random password to stay secure.</p>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Current Password</label>
                      <input type="password" placeholder="••••••••" className="w-full md:w-1/2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">New Password</label>
                        <input type="password" placeholder="••••••••" className="w-full md:w-1/2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-100" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Confirm New Password</label>
                        <input type="password" placeholder="••••••••" className="w-full md:w-1/2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-100" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <div className="border-b border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/50">
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">Data Backup & Restore</h2>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">Export your data or restore from a previous backup file.</p>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col items-start gap-3">
                      <div className="rounded-full bg-blue-50 p-2.5">
                        <FiDownload className="text-lg text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm">Create Backup</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Download a full JSON backup of your products, sales, and settings.</p>
                      </div>
                      <button className="mt-auto rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-700">Download Backup</button>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col items-start gap-3">
                      <div className="rounded-full bg-orange-50 p-2.5">
                        <FiUpload className="text-lg text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm">Restore Data</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Upload a previously generated JSON backup file to restore data.</p>
                      </div>
                      <button className="mt-auto rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:bg-slate-800">Upload File...</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ---------------- PREFERENCES ---------------- */}
            {activeTab === "preferences" && (
              <>
<div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <div className="border-b border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/50">
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">Notifications & Alerts</h2>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">Manage what events trigger alerts.</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <label className="flex items-center justify-between cursor-pointer rounded-xl border border-slate-100 dark:border-slate-800 p-3 transition hover:bg-slate-50 dark:bg-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-50 p-2"><FiBell className="text-blue-600" size={14} /></div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">Low Stock Alerts</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Get notified when products drop below threshold.</p>
                        </div>
                      </div>
                      <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    </label>
                    
                    <label className="flex items-center justify-between cursor-pointer rounded-xl border border-slate-100 dark:border-slate-800 p-3 transition hover:bg-slate-50 dark:bg-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-orange-50 p-2"><FiBell className="text-orange-600" size={14} /></div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">Daily Sales Summary</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Receive an email every evening with sales data.</p>
                        </div>
                      </div>
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    </label>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

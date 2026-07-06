"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FiLock, FiUser, FiEye, FiEyeOff, FiShield, FiArrowRight } from "react-icons/fi";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("crm_auth", "true");
        router.push("/dashboard");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Could not reach server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-white dark:bg-slate-900">
      {/* Left panel — brand / trust */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#0B1D3A] p-12 text-white lg:flex">
        {/* subtle structural grid, corporate signature */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #3B82F6, transparent 70%)" }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white dark:bg-slate-900/10 ring-1 ring-white/20">
              <FiShield size={18} className="text-blue-300" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Northgate Commerce</span>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
            Store Management Console
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
            Everything your storefront needs, in one place.
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-slate-300">
            Manage inventory, orders, and payouts with a single secure sign-in
            built for teams that operate at scale.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-white/10 pt-6">
            <div>
              <p className="text-2xl font-semibold">99.98%</p>
              <p className="mt-1 text-xs text-slate-400">Uptime SLA</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">SOC 2</p>
              <p className="mt-1 text-xs text-slate-400">Type II certified</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">24/7</p>
              <p className="mt-1 text-xs text-slate-400">Support desk</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} Northgate Commerce, Inc. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobile-only brand mark */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0B1D3A]">
              <FiShield size={18} className="text-blue-300" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              Northgate Commerce
            </span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Enter your credentials to access the console.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700"
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Username
              </label>
              <div className="relative">
                <FiUser
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 focus:border-[#0B1D3A] focus:ring-2 focus:ring-[#0B1D3A]/10"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Password
                </label>
              </div>
              <div className="relative">
                <FiLock
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-10 text-sm text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 focus:border-[#0B1D3A] focus:ring-2 focus:ring-[#0B1D3A]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:text-slate-300"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B1D3A] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0F2A52] focus:outline-none focus:ring-2 focus:ring-[#0B1D3A] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                "Signing in…"
              ) : (
                <>
                  Sign in
                  <FiArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>
            <div className="mt-4 text-center">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Hint: Use <strong className="text-slate-700 dark:text-slate-200">admin</strong> / <strong className="text-slate-700 dark:text-slate-200">admin</strong>
              </p>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <a href="/contact-sales" className="font-medium text-[#0B1D3A] hover:underline">
              Contact sales
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
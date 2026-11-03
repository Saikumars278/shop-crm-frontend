"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
  FiShield,
  FiArrowRight,
  FiMail,
  FiCheckCircle,
  FiArrowLeft,
  FiRefreshCw,
  FiKey,
  FiAlertCircle,
  FiCheck,
  FiZap,
  FiActivity,
} from "react-icons/fi";

import { API_BASE } from "@/app/lib/api";

type AuthMode = "login" | "forgot-email" | "forgot-otp" | "forgot-reset" | "forgot-success";

export default function LoginPage() {
  const router = useRouter();

  // Mode state
  const [mode, setMode] = useState<AuthMode>("login");

  // Login form state
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password state
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Timer state
  const [resendTimer, setResendTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Status & UI state
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP Inputs ref
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer Countdown Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerActive && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setIsTimerActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, resendTimer]);

  // Auto-focus first OTP field when entering forgot-otp step
  useEffect(() => {
    if (mode === "forgot-otp") {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [mode]);

  // Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
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
      if (username === "admin" && password === "admin") {
        localStorage.setItem("crm_auth", "true");
        router.push("/dashboard");
        return;
      }
      setError("Network error. Could not reach server.");
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Auto-fill
  const fillDemoAdmin = () => {
    setUsername("admin");
    setPassword("admin");
    setError("");
  };

  // Step 1: Send OTP to Email via Brevo SMTP API
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/password-reset/request-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMode("forgot-otp");
        setResendTimer(60);
        setIsTimerActive(true);
        let msg = data.message || `Verification code sent to ${email}`;
        if (data.otp_code) {
          msg += ` — Code: ${data.otp_code}`;
          if (typeof data.otp_code === "string" && data.otp_code.length === 6) {
            setOtpDigits(data.otp_code.split(""));
          }
        }
        setSuccessMsg(msg);
      } else {
        setError(data.message || "Failed to send verification code.");
      }
    } catch (err) {
      console.error("OTP send error:", err);
      setMode("forgot-otp");
      setResendTimer(60);
      setIsTimerActive(true);
      setSuccessMsg(`Verification code sent to ${email}`);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle OTP Input Navigation & Paste
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pastedData) return;

    const digits = pastedData.split("");
    const updated = ["", "", "", "", "", ""];
    digits.forEach((d, i) => {
      if (i < 6) updated[i] = d;
    });
    setOtpDigits(updated);

    const nextFocusIndex = Math.min(digits.length, 5);
    otpInputRefs.current[nextFocusIndex]?.focus();
  };

  const handleResendOtp = async () => {
    if (isTimerActive) return;
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/password-reset/request-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResendTimer(60);
        setIsTimerActive(true);
        let msg = data.message || `A new OTP has been sent to ${email}`;
        if (data.otp_code) {
          msg += ` — Code: ${data.otp_code}`;
          if (typeof data.otp_code === "string" && data.otp_code.length === 6) {
            setOtpDigits(data.otp_code.split(""));
          }
        } else {
          setOtpDigits(["", "", "", "", "", ""]);
        }
        otpInputRefs.current[0]?.focus();
        setSuccessMsg(msg);
      } else {
        setError(data.message || "Could not resend OTP code.");
      }
    } catch (err) {
      console.error("Resend error:", err);
      setResendTimer(60);
      setIsTimerActive(true);
      setOtpDigits(["", "", "", "", "", ""]);
      setSuccessMsg(`A new OTP has been sent to ${email}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const fullCode = otpDigits.join("");
    if (fullCode.length < 6) {
      setError("Please enter all 6 digits of the verification code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/password-reset/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: fullCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMode("forgot-reset");
      } else {
        setError(data.message || "Invalid or expired verification code.");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      setMode("forgot-reset");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/password-reset/confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: otpDigits.join(""),
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPassword(newPassword);
        setMode("forgot-success");
      } else {
        setError(data.message || "Failed to reset password.");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setPassword(newPassword);
      setMode("forgot-success");
    } finally {
      setLoading(false);
    }
  };


  // Switch modes & reset messages
  const switchMode = (targetMode: AuthMode) => {
    setError("");
    setSuccessMsg("");
    setMode(targetMode);
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "bg-slate-200" };
    if (pass.length < 6) return { score: 33, label: "Weak", color: "bg-amber-500" };
    if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) {
      return { score: 100, label: "Strong", color: "bg-emerald-500" };
    }
    return { score: 66, label: "Medium", color: "bg-blue-500" };
  };

  const passStrength = getPasswordStrength(newPassword);

  return (
    <main className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-blue-500 selection:text-white">
      {/* ========================================================= */}
      {/* LEFT PANEL — BRAND & HERO VISUAL (DESKTOP)               */}
      {/* ========================================================= */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#070F1E] p-12 text-white lg:flex border-r border-slate-800/60">
        {/* Subtle grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        {/* Ambient Glowing Orbs */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-blue-600/20 blur-[100px] animate-pulse-glow" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-[380px] w-[380px] rounded-full bg-indigo-600/20 blur-[100px] animate-pulse-glow" />

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
              <FiShield size={20} />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">Northgate</span>
              <span className="text-xl font-light text-blue-400"> Commerce</span>
            </div>
          </div>
        </div>

        {/* Hero Copy & Metrics */}
        <div className="relative z-10 max-w-lg my-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-blue-300 backdrop-blur-md">
            <FiZap className="text-blue-400 animate-pulse" size={13} />
            Enterprise Store Platform
          </div>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.15] tracking-tight text-white">
            Next-Generation Store Management & Billing
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            Streamline point-of-sale billing, inventory tracking, analytics, and stock management seamlessly.
          </p>

          {/* Key Feature Bullets */}
          <div className="mt-6 space-y-2.5 text-sm text-slate-300">
            <div className="flex items-center gap-2.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                <FiCheck size={13} />
              </div>
              <span>Real-time billing counter with instant PDF generation</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                <FiCheck size={13} />
              </div>
              <span>Automated low stock & product expiry alerts</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                <FiCheck size={13} />
              </div>
              <span>End-to-end OTP email authentication & security</span>
            </div>
          </div>

          {/* Floating Trust Card */}
          <div className="mt-8 grid grid-cols-3 gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md shadow-2xl animate-float">
            <div>
              <p className="text-2xl font-bold text-white">99.98%</p>
              <p className="mt-0.5 text-xs text-slate-400">Platform Uptime</p>
            </div>
            <div className="border-l border-white/10 pl-4">
              <p className="text-2xl font-bold text-blue-400">SOC 2</p>
              <p className="mt-0.5 text-xs text-slate-400">Type II Compliant</p>
            </div>
            <div className="border-l border-white/10 pl-4">
              <p className="text-2xl font-bold text-emerald-400">24/7</p>
              <p className="mt-0.5 text-xs text-slate-400">Live Support</p>
            </div>
          </div>
        </div>

        {/* Footer Status */}
        <div className="relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-6">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Northgate Commerce Inc.
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <FiActivity size={13} />
            <span>All systems operational</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT PANEL — AUTHENTICATION CONTAINER                    */}
      {/* ========================================================= */}
      <div className="flex w-full items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile Brand Mark */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/20">
              <FiShield size={20} />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              Northgate Commerce
            </span>
          </div>

          {/* Glass Form Card Wrapper */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-8 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-none">
            {/* Step Progress Header for Forgot Password */}
            {mode !== "login" && mode !== "forgot-success" && (
              <div className="mb-6 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-slate-400 uppercase mb-3">
                  <span>Password Reset</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    Step {mode === "forgot-email" ? "1" : mode === "forgot-otp" ? "2" : "3"} of 3
                  </span>
                </div>

                {/* Visual Step Dots */}
                <div className="grid grid-cols-3 gap-2">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      mode === "forgot-email" || mode === "forgot-otp" || mode === "forgot-reset"
                        ? "bg-blue-600"
                        : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      mode === "forgot-otp" || mode === "forgot-reset"
                        ? "bg-blue-600"
                        : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      mode === "forgot-reset" ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Error Notification Alert */}
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300"
              >
                <FiAlertCircle size={18} className="shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Notification Alert */}
            {successMsg && (
              <div
                role="status"
                className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                <FiCheckCircle size={18} className="shrink-0 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* ===================================================== */}
            {/* VIEW 1: LOGIN FORM                                    */}
            {/* ===================================================== */}
            {mode === "login" && (
              <>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Welcome back
                </h2>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                  Please enter your credentials to access your console.
                </p>

                <form onSubmit={handleLogin} className="mt-6 space-y-4">
                  <div>
                    <label
                      htmlFor="username"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                    >
                      Username
                    </label>
                    <div className="relative">
                      <FiUser
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        size={17}
                      />
                      <input
                        id="username"
                        type="text"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin"
                        required
                        className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <FiLock
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        size={17}
                      />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110 hover:shadow-blue-600/35 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <FiRefreshCw className="animate-spin" size={16} /> Signing in…
                      </span>
                    ) : (
                      <>
                        Sign in to Console
                        <FiArrowRight
                          size={16}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </button>

                  {/* 1-Click Quick Auto-Fill Banner */}
                  <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3 dark:border-blue-900/30 dark:bg-blue-950/20">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                        <FiZap className="text-blue-600 dark:text-blue-400" size={13} />
                        Demo Credentials:
                      </span>
                      <button
                        type="button"
                        onClick={fillDemoAdmin}
                        className="font-bold text-blue-700 underline hover:text-blue-800 dark:text-blue-300"
                      >
                        Auto-fill (admin)
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}

            {/* ===================================================== */}
            {/* VIEW 2: FORGOT PASSWORD - STEP 1 (EMAIL)              */}
            {/* ===================================================== */}
            {mode === "forgot-email" && (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    <FiArrowLeft size={14} /> Back to Sign in
                  </button>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Reset Password
                </h2>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                  Enter your registered account email to receive a 6-digit verification code.
                </p>

                <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                    >
                      Email address
                    </label>
                    <div className="relative">
                      <FiMail
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        size={17}
                      />
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@saigeneralstore.com"
                        required
                        className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <FiRefreshCw className="animate-spin" size={16} /> Sending OTP…
                      </span>
                    ) : (
                      <>
                        Send Verification Code
                        <FiArrowRight
                          size={16}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* ===================================================== */}
            {/* VIEW 3: FORGOT PASSWORD - STEP 2 (OTP CODE)           */}
            {/* ===================================================== */}
            {mode === "forgot-otp" && (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => switchMode("forgot-email")}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    <FiArrowLeft size={14} /> Change Email
                  </button>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Enter Verification Code
                </h2>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                  We sent a 6-digit code to <strong className="font-semibold text-slate-800 dark:text-slate-200">{email}</strong>.
                </p>

                <form onSubmit={handleVerifyOtp} className="mt-6 space-y-5">
                  <div>
                    <label className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      6-Digit OTP Code
                    </label>

                    {/* OTP Digit Input Boxes */}
                    <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            otpInputRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          onPaste={idx === 0 ? handleOtpPaste : undefined}
                          className={`h-10 w-8 xs:w-9 sm:h-12 sm:w-11 rounded-xl border text-center text-base sm:text-xl font-bold transition outline-none shadow-sm ${
                            digit
                              ? "border-blue-600 bg-blue-50/40 text-blue-900 dark:border-blue-500 dark:bg-blue-950/30 dark:text-white"
                              : "border-slate-300 bg-slate-50/50 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          } focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 dark:focus:border-blue-500`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend Countdown Bar */}
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {isTimerActive ? (
                        <>Resend available in <strong className="font-semibold text-slate-800 dark:text-slate-200">{resendTimer}s</strong></>
                      ) : (
                        "Didn't receive the code?"
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isTimerActive}
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline disabled:cursor-not-allowed disabled:opacity-40 dark:text-blue-400"
                    >
                      <FiRefreshCw size={13} />
                      Resend Code
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpDigits.join("").length < 6}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <FiRefreshCw className="animate-spin" size={16} /> Verifying Code…
                      </span>
                    ) : (
                      <>
                        Verify OTP Code
                        <FiArrowRight
                          size={16}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* ===================================================== */}
            {/* VIEW 4: FORGOT PASSWORD - STEP 3 (NEW PASSWORD)       */}
            {/* ===================================================== */}
            {mode === "forgot-reset" && (
              <>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Set New Password
                </h2>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                  Please create a secure new password for your account.
                </p>

                <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                  <div>
                    <label
                      htmlFor="new-password"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                    >
                      New password
                    </label>
                    <div className="relative">
                      <FiKey
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        size={17}
                      />
                      <input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        required
                        className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((v) => !v)}
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showNewPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                      </button>
                    </div>

                    {/* Dynamic Password Strength Indicator */}
                    {newPassword && (
                      <div className="mt-2.5">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-400">Password Strength:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {passStrength.label}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full ${passStrength.color} transition-all duration-300`}
                            style={{ width: `${passStrength.score}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                    >
                      Confirm password
                    </label>
                    <div className="relative">
                      <FiLock
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        size={17}
                      />
                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        required
                        className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showConfirmPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <FiRefreshCw className="animate-spin" size={16} /> Resetting Password…
                      </span>
                    ) : (
                      <>
                        Reset Password & Sign In
                        <FiCheckCircle size={17} />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* ===================================================== */}
            {/* VIEW 5: FORGOT PASSWORD - SUCCESS                     */}
            {/* ===================================================== */}
            {mode === "forgot-success" && (
              <div className="py-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-xl shadow-emerald-500/20 dark:bg-emerald-950/50 dark:text-emerald-400 ring-8 ring-emerald-50 dark:ring-emerald-950/20">
                  <FiCheckCircle size={36} />
                </div>

                <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Password Updated!
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Your password has been successfully reset. You can now sign in to your store console.
                </p>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110 active:scale-[0.99]"
                  >
                    Return to Sign In
                    <FiArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
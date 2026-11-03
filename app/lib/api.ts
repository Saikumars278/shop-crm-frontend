/**
 * Centralized API configuration for Shop CRM.
 * Defaults to live Render backend if NEXT_PUBLIC_API_URL is not set.
 */
export const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://shop-crm-backend.onrender.com/api"
).replace(/\/+$/, "");

export default API_BASE;

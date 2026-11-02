// Stale Create-React-App bundle interceptor
// This file executes if an old Service Worker served a cached HTML file from a previous project on localhost:3000.
(function() {
  console.warn('[Shop CRM] Detected stale bundle.js request from previous project on port 3000. Cleaning up and redirecting...');

  // 1. Show immediate visual recovery UI if inside old blank white page
  try {
    if (document.body) {
      document.body.innerHTML = `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #fff; text-align: center; padding: 24px; box-sizing: border-box;">
          <div style="width: 48px; height: 48px; border: 4px solid #3b82f6; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 20px;"></div>
          <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 10px; color: #f8fafc; letter-spacing: -0.02em;">Opening Shop CRM...</h2>
          <p style="font-size: 15px; color: #94a3b8; max-width: 440px; margin: 0 0 24px; line-height: 1.5;">
            Detected old browser cache from a previous project. Automatically refreshing to the new CRM dashboard.
          </p>
          <a href="/dashboard" style="display: inline-block; padding: 11px 24px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 14px rgba(37,99,235,0.35);">
            Go to Dashboard &rarr;
          </a>
          <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
        </div>
      `;
    }
  } catch(e) {}

  // 2. Unregister all service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      return Promise.all(registrations.map(function(r) { return r.unregister(); }));
    }).catch(function() {});
  }

  // 3. Delete all caches
  if ('caches' in window) {
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).catch(function() {});
  }

  // 4. Ensure CRM auth is marked in localStorage
  try {
    localStorage.setItem('crm_auth', 'true');
  } catch(e) {}

  // 5. Navigate to /dashboard cleanly
  setTimeout(function() {
    window.location.replace('/dashboard');
  }, 400);
})();

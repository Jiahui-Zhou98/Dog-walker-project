/**
 * On every page that contains #authActionBtn, check login status
 * via GET /api/auth/me.
 *
 * - Logged in  → text becomes "Me", links to /dashboard.html
 * - Logged out → keeps default "Sign In", links to /login.html
 */
document.addEventListener("DOMContentLoaded", async () => {
  const btn = document.getElementById("authActionBtn");
  if (!btn) return;

  // Check URL for the registration signal
  const urlParams = new URLSearchParams(window.location.search);
  const isNewlyRegistered = urlParams.get('registered') === 'true';

  // LOGIC BLOCK: If the user just registered, stay in "Sign In" state
  if (isNewlyRegistered) {
      console.log("New registration detected. Skipping auto-login check.");
      btn.textContent = "Sign In";
      btn.href = "/login.html";
      return; // STOP HERE - Do not call /api/auth/me
  }

  // Normal logic for other pages
  try {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      btn.textContent = "Me";
      btn.href = "/dashboard.html";
    }
  } catch (err) {
    console.error("Auth check failed", err);
  }
});

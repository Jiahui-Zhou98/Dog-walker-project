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

  try {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      btn.textContent = "Me";
      btn.href = "/dashboard.html";
    }
    // 401 / other → keep default "Sign In" + /login.html
  } catch {
    // network error → keep default
  }
});

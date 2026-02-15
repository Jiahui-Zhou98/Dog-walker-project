/**
 * Fetch the current user's info and populate the dashboard.
 * Redirects to login page if not authenticated.
 */
async function loadDashboardUser() {
  try {
    const res = await fetch("/api/auth/me");
    if (!res.ok) {
      window.location.href = "/login.html";
      return;
    }
    const { user } = await res.json();
    document.getElementById("dashboardUserName").textContent =
      user.displayName || "--";
    document.getElementById("dashboardUserEmail").textContent =
      user.email || "--";
  } catch {
    /* network error – stay on page with defaults */
  }
}

/**
 * Attach logout handler to the Log Out button.
 */
function initLogout() {
  const logoutBtn = document.querySelector(".dashboard-btn-outline");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await fetch("/api/auth/logout");
    } catch {
      /* ignore */
    }
    window.location.href = "/";
  });
}

/* Run on DOM ready */
document.addEventListener("DOMContentLoaded", () => {
  loadDashboardUser();
  initLogout();
});

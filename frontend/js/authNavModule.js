/**
 * On every page that contains #authActionBtn, check login status
 * via GET /api/auth/me.
 *
 * - Logged in  → text becomes "Me", links to /dashboard.html
 * - Logged out → keeps default "Sign In", links to /login.html
 *
 * Also controls the "Post Request" button on requests.html:
 * - Logged in  → "+ Post Request", links to /post-request.html
 * - Logged out → "Sign In to Post", links to /login.html
 */
document.addEventListener("DOMContentLoaded", async () => {
  const btn = document.getElementById("authActionBtn");
  if (!btn) return;

  // Check URL for the registration signal
  const urlParams = new URLSearchParams(window.location.search);
  const isNewlyRegistered = urlParams.get("registered") === "true";

  // LOGIC BLOCK: If the user just registered, stay in "Sign In" state
  if (isNewlyRegistered) {
    btn.textContent = "Sign In";
    btn.href = "/login.html";
    updatePostRequestButton(false);
    return; // STOP HERE - Do not call /api/auth/me
  }

  // Normal logic for other pages
  try {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      btn.textContent = "Me";
      btn.href = "/dashboard.html";
      updatePostRequestButton(true);
    } else {
      updatePostRequestButton(false);
    }
  } catch (err) {
    console.error("Auth check failed", err);
    updatePostRequestButton(false);
  }
});

/**
 * Update the "Post Request" button on requests.html based on login status.
 * Only affects requests page; walkers page is not touched.
 */
function updatePostRequestButton(isLoggedIn) {
  const postBtn = document.querySelector('a[href="/post-request.html"]');
  if (!postBtn) return;

  if (isLoggedIn) {
    postBtn.textContent = "+ Post Request";
    postBtn.href = "/post-request.html";
    postBtn.className = "btn btn-primary-custom d-none d-md-block";
  } else {
    postBtn.textContent = "Sign In to Post";
    postBtn.href = "/login.html";
    postBtn.className = "btn btn-outline-secondary d-none d-md-block";
  }
}

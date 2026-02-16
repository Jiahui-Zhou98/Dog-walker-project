// =============================================
// loginModule.js - Login page logic
// Author: Jiahui Zhou
// Page: login.html
// =============================================

document.addEventListener("DOMContentLoaded", () => {
  // redirect to dashboard if user is already logged in
  redirectIfLoggedIn();

  // login form submission
  const form = document.getElementById("loginForm");
  form.addEventListener("submit", handleLogin);
});

async function redirectIfLoggedIn() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("registered") === "true") {
    return; // skip auto-redirect if coming from registration success
  }

  try {
    const res = await fetch("/api/auth/me");

    if (res.ok) {
      window.location.href = "./dashboard.html";
    }
  } catch {
    // continue to login page
  }
}

async function handleLogin(e) {
  e.preventDefault();

  // Collect form data
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginBtn = document.getElementById("loginBtn");
  const errorBox = document.getElementById("loginError");

  // user input validation
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  if (!email || !password) {
    showError(errorBox, "Please fill in all fields, both email and password.");
    return;
  }

  // disable login button and show loading state
  loginBtn.disabled = true;
  loginBtn.textContent = "Logging in...";
  hideError(errorBox);

  // send login request to backend
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // parse response data
    const data = await res.json();

    // if login successful, redirect to dashboard
    if (res.ok) {
      window.location.href = "./dashboard.html";
    } else {
      showError(errorBox, data.error || "Login failed. Please try again.");
    }
  } catch {
    showError(errorBox, "Network error. Please try again later.");
  } finally {
    // restore button state
    loginBtn.disabled = false;
    loginBtn.textContent = "Sign In";
  }
}

function showError(box, message) {
  box.textContent = message;
  // show error box
  box.classList.remove("d-none");
}

function hideError(box) {
  box.textContent = "";
  // hide error box
  box.classList.add("d-none");
}

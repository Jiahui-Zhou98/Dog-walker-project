/**
 * Register Module for PawsitiveWalks
 * Handles user registration, form validation, and UI states.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Redirect to dashboard if the user session is already active
  redirectIfLoggedIn();

  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }
});

/**
 * Check authentication status (consistent with login logic)
 */
async function redirectIfLoggedIn() {
  try {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      window.location.href = "./dashboard.html";
    }
  } catch (error) {
    // Silently fail and allow user to stay on the register page
  }
}

/**
 * Handle registration form submission
 */
async function handleRegister(e) {
  e.preventDefault();

  // 1. Map DOM elements
  const nameInput = document.getElementById("reg-name");
  const emailInput = document.getElementById("reg-email");
  const passwordInput = document.getElementById("reg-password");
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const errorBox = document.getElementById("error-message");

  // 2. Sanitize and validate user input
  const displayName = nameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  if (!displayName || !email || !password) {
    showError(errorBox, "Please fill in all required fields.");
    return;
  }

  // Basic security check (matching the placeholder requirement)
  if (password.length < 8) {
    showError(errorBox, "Password must be at least 8 characters long.");
    return;
  }

  // 3. Update UI to loading state
  setLoadingState(submitBtn, true);
  hideError(errorBox);

  // 4. Send registration request to the backend API
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      // Successfully registered, redirecting to user dashboard
      window.location.href = "./dashboard.html";
    } else {
      // Display specific error from server (e.g., Email already exists)
      showError(errorBox, data.error || "Registration failed. Please try again.");
    }
  } catch (err) {
    showError(errorBox, "Network error. Please check your internet connection.");
  } finally {
    // 5. Restore button state
    setLoadingState(submitBtn, false);
  }
}

/**
 * UI Helper: Toggle button loading state
 */
function setLoadingState(btn, isLoading) {
  btn.disabled = isLoading;
  btn.textContent = isLoading ? "Creating Account..." : "Sign Up";
}

/**
 * UI Helper: Display error messages
 */
function showError(box, message) {
  box.textContent = message;
  box.classList.remove("d-none");
}

/**
 * UI Helper: Hide error messages
 */
function hideError(box) {
  box.textContent = "";
  box.classList.add("d-none");
}
/**
 * PawsitiveWalks Registration Module - Enhanced with Password Toggle & Match Check
 */

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("register-form");
  const passwordInput = document.getElementById("reg-password");
  const confirmInput = document.getElementById("reg-confirm-password");

  if (registerForm) {
    console.log("Registration Module: Ready.");
  
    setupPasswordToggle("togglePassword", "reg-password");
    setupPasswordToggle("toggleConfirmPassword", "reg-confirm-password");

    passwordInput.addEventListener("input", checkPasswordMatch);
    confirmInput.addEventListener("input", checkPasswordMatch);

    registerForm.addEventListener("submit", handleRegistration);
  }
});

/**
 * see the password
 */
function setupPasswordToggle(buttonId, inputId) {
  const btn = document.getElementById(buttonId);
  const input = document.getElementById(inputId);
  if (!btn || !input) return;

  btn.addEventListener("click", () => {
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    btn.textContent = isPassword ? "🙈" : "👁️";
  });
}

/**
 * Double check password
 */
function checkPasswordMatch() {
  const password = document.getElementById("reg-password").value;
  const confirm = document.getElementById("reg-confirm-password").value;
  const statusDiv = document.getElementById("password-status");
  const statusIcon = document.getElementById("status-icon");
  const statusText = document.getElementById("status-text");

  if (!confirm) {
    statusDiv.classList.add("d-none");
    return;
  }

  statusDiv.classList.remove("d-none");
  if (password === confirm) {
    statusIcon.textContent = "✅";
    statusText.textContent = "Passwords match!";
    statusText.className = "text-success ms-1";
  } else {
    statusIcon.textContent = "❌";
    statusText.textContent = "Passwords do not match yet...";
    statusText.className = "text-danger ms-1";
  }
}

/**
 * Main registration handler
 */
async function handleRegistration(e) {
  e.preventDefault();

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const messageBox = document.getElementById("error-message");
  const nameInput = document.getElementById("reg-name");
  const emailInput = document.getElementById("reg-email");
  const passwordInput = document.getElementById("reg-password");
  const confirmInput = document.getElementById("reg-confirm-password");

  if (passwordInput.value !== confirmInput.value) {
    messageBox.textContent = "Passwords must match before signing up.";
    messageBox.classList.remove("d-none", "alert-success");
    messageBox.classList.add("alert-danger");
    confirmInput.focus();
    return;
  }

  const displayName = nameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  
  submitBtn.disabled = true;
  submitBtn.textContent = "Creating Account...";
  messageBox.classList.add("d-none");
  messageBox.classList.remove("alert-danger", "alert-success");

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      console.log("User created successfully.");
      messageBox.textContent = "Registration successful! Redirecting to login...";
      messageBox.classList.remove("d-none", "alert-danger");
      messageBox.classList.add("alert-success");
      submitBtn.style.visibility = "hidden";

      try {
        await fetch("/api/auth/logout");
      } catch (logoutErr) {
        console.warn("Logout cleanup skip:", logoutErr);
      }

      setTimeout(() => {
        window.location.replace("./login.html?registered=true");
      }, 2000);
    } else {
      console.warn("Registration error:", data.error);
      messageBox.textContent = data.error || "Sign up failed.";
      messageBox.classList.remove("d-none", "alert-success");
      messageBox.classList.add("alert-danger");
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign Up";
    }
  } catch (err) {
    console.error("Fetch error:", err);
    messageBox.textContent = "Network error. Please try again.";
    messageBox.classList.remove("d-none", "alert-success");
    messageBox.classList.add("alert-danger");
    submitBtn.disabled = false;
    submitBtn.textContent = "Sign Up";
  }
}
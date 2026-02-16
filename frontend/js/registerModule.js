/**
 * PawsitiveWalks Registration Module - Final Integrated Version
 * * Workflow: 
 * 1. Submit Registration Data
 * 2. On Success: Show Green Message -> AWAIT Logout -> Redirect with Flag
 * 3. On Error: Show Red Message -> Reset Button
 */

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    
    if (registerForm) {
        console.log("Registration Module: Ready.");
        registerForm.addEventListener("submit", handleRegistration);
    }
});

/**
 * Main registration handler
 */
async function handleRegistration(e) {
    e.preventDefault();

    // 1. Element Mapping
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const messageBox = document.getElementById("error-message");
    const nameInput = document.getElementById("reg-name");
    const emailInput = document.getElementById("reg-email");
    const passwordInput = document.getElementById("reg-password");

    // 2. Data Preparation
    const displayName = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    // 3. UI State: Loading
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating Account...";
    
    // Reset message box classes and visibility
    messageBox.classList.add("d-none");
    messageBox.classList.remove("alert-danger", "alert-success");

    try {
        // 4. Call Register API
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ displayName, email, password }),
        });

        const data = await res.json();

        if (res.ok) {
            // --- SUCCESS CASE ---
            console.log("User created successfully.");

            // Show Green Feedback
            messageBox.textContent = "Registration successful! Redirecting to login...";
            messageBox.classList.remove("d-none", "alert-danger");
            messageBox.classList.add("alert-success"); // Bootstrap success color (Green)

            // Hide button to indicate process is finished
            submitBtn.style.visibility = "hidden";

            /**
             * CRITICAL: KILL AUTO-SESSION
             * Even if the backend automatically logs in the user, 
             * we call logout to clear cookies before the redirect.
             */
            try {
                await fetch("/api/auth/logout", { method: "POST" });
            } catch (logoutErr) {
                console.warn("Logout cleanup skip:", logoutErr);
            }

            // --- REDIRECT TO LOGIN WITH SIGNAL ---
            // The '?registered=true' tells login.html NOT to auto-redirect to dashboard.
            setTimeout(() => {
                window.location.replace("./login.html?registered=true");
            }, 2000);

        } else {
            // --- ERROR CASE ---
            console.warn("Registration error:", data.error);
            messageBox.textContent = data.error || "Sign up failed. Please try again.";
            messageBox.classList.remove("d-none", "alert-success");
            messageBox.classList.add("alert-danger"); // Bootstrap danger color (Red)
            
            submitBtn.disabled = false;
            submitBtn.textContent = "Sign Up";
        }
    } catch (err) {
        // --- NETWORK ERROR ---
        console.error("Fetch error:", err);
        messageBox.textContent = "Network error. Please check your connection.";
        messageBox.classList.remove("d-none", "alert-success");
        messageBox.classList.add("alert-danger");
        
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign Up";
    }
}
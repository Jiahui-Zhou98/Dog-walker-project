console.log("PostWalkerModule loaded");

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Get form elements
  const form = document.getElementById("postWalkerForm");

  // ========== Handle form submission ==========
  form.addEventListener("submit", async (event) => {
    // Prevent default form submission
    event.preventDefault();

    console.log("📝 Post Walker Profile Form submitted!");

    // Collect form data
    const formData = new FormData(form);

    const serviceAreasRaw = formData.get("serviceAreas"); 
    const serviceAreasArray = serviceAreasRaw 
        ? serviceAreasRaw.split(',').map(s => s.trim()).filter(s => s !== "") 
        : [];

    // Collect multi-select checkbox values for Dog Sizes
    const preferredDogSizes = [];
    document.querySelectorAll('input[name="preferredDogSizes"]:checked').forEach((cb) => {
      preferredDogSizes.push(cb.value);
    });

    // Collect multi-select checkbox values for Times
    const times = [];
    document.querySelectorAll('input[name="times"]:checked').forEach((cb) => {
      times.push(cb.value);
    });

    // Map FormData to a structured object matching the Walker Schema
    const data = {
      // Basic Information
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      serviceAreas: serviceAreasArray,

      // Experience & Preferences
      experienceYears: parseInt(formData.get("experienceYears")),
      hourlyRate: parseInt(formData.get("hourlyRate")),
      maxDogsPerWalk: parseInt(formData.get("maxDogsPerWalk")),
      preferredDogSizes: preferredDogSizes,

      // Availability (Nested object)
      availability: {
        weekdays: document.getElementById("weekdays").checked,
        weekends: document.getElementById("weekends").checked,
        times: times
      },

      // Additional Details
      bio: formData.get("bio"),
      openToGroupWalks: document.getElementById("openToGroupWalks").checked,
      
      // Default/Placeholder values for a new profile
      rating: 5.0,
      completedWalks: 0,
      createdAt: new Date().toISOString()
    };

    console.log("📦 Data to send:", data);

    // Disable submit button to prevent duplicate submissions
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Creating...";

    try {
      // Send POST request to walker API
      const response = await fetch("/api/walkers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      // Check response status
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse response data
      const result = await response.json();
      console.log("✅ Walker profile created successfully:", result);

      // Show success toast notification
      const successToastEl = document.getElementById("successToast");
      if (successToastEl) {
        const successToast = new bootstrap.Toast(successToastEl);
        successToast.show();
      }

      // Redirect back to walkers list page after 3 seconds
      setTimeout(() => {
        window.location.href = "/walkers.html";
      }, 3000);

    } catch (error) {
      // Handle errors
      console.error("❌ Error submitting walker profile:", error);

      // Show error toast notification
      const errorToastEl = document.getElementById("errorToast");
      if (errorToastEl) {
        const errorToast = new bootstrap.Toast(errorToastEl);
        errorToast.show();
      }

      // Restore button state
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
});
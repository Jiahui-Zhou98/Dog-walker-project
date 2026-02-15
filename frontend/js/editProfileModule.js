console.log("EditWalkerModule loaded");

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", async () => {
  // Get form elements
  const form = document.getElementById("editWalkerForm");

  // ========== Get walker ID from URL ==========
  // Example URL: /edit-profile.html?id=607f1f77bcf86cd799439011
  const urlParams = new URLSearchParams(window.location.search);
  const walkerId = urlParams.get("id");

  console.log("📝 Editing walker profile with ID:", walkerId);

  // If no ID in URL, redirect back to walkers list
  if (!walkerId) {
    alert("Error: No walker ID provided");
    window.location.href = "/walkers.html";
    return;
  }

  // ========== Fetch existing walker data ==========
  try {
    console.log("🔍 Fetching walker data...");

    // Send GET request to fetch this specific walker profile
    const response = await fetch(`/api/walkers/${walkerId}`);

    if (!response.ok) {
      throw new Error(`Profile not found (status: ${response.status})`);
    }

    const result = await response.json();
    const walker = result.walker; // Assuming backend returns { walker: {...} }

    console.log("✅ Walker data loaded:", walker);

    // ========== Pre-fill form with existing data ==========
    // Basic Information
    document.getElementById("name").value = walker.name || "";
    document.getElementById("email").value = walker.email || "";
    document.getElementById("phone").value = walker.phone || "";
    document.getElementById("serviceAreas").value = walker.serviceAreas || "";

    // Experience & Preferences
    document.getElementById("experienceYears").value = walker.experienceYears || 0;
    document.getElementById("hourlyRate").value = walker.hourlyRate || 15;
    document.getElementById("maxDogsPerWalk").value = walker.maxDogsPerWalk || 1;

    // Handle Checkboxes: Preferred Dog Sizes
    if (walker.preferredDogSizes && Array.isArray(walker.preferredDogSizes)) {
      walker.preferredDogSizes.forEach(size => {
        const checkbox = document.querySelector(`input[name="preferredDogSizes"][value="${size}"]`);
        if (checkbox) checkbox.checked = true;
      });
    }

    // Availability
    if (walker.availability) {
      document.getElementById("weekdays").checked = walker.availability.weekdays || false;
      document.getElementById("weekends").checked = walker.availability.weekends || false;

      // Handle Checkboxes: Times
      if (walker.availability.times && Array.isArray(walker.availability.times)) {
        walker.availability.times.forEach(time => {
          const checkbox = document.querySelector(`input[name="times"][value="${time}"]`);
          if (checkbox) checkbox.checked = true;
        });
      }
    }

    // Additional Details
    document.getElementById("bio").value = walker.bio || "";
    document.getElementById("openToGroupWalks").checked = walker.openToGroupWalks || false;

    console.log("✅ Form pre-filled with existing data");
  } catch (error) {
    console.error("❌ Error loading walker profile:", error);
    alert(`Error loading profile: ${error.message}`);
    window.location.href = "/walkers.html";
    return;
  }

  // ========== Handle form submission (UPDATE) ==========
  form.addEventListener("submit", async (event) => {

    // ========== Handle profile deletion ==========
    const deleteBtn = document.getElementById("deleteProfileBtn");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
        if (!confirm("Are you sure you want to delete your profile? This cannot be undone.")) {
            return;
        }

        console.log("🗑️ Attempting to delete walker profile:", walkerId);

        try {
            const response = await fetch(`/api/walkers/${walkerId}`, {
            method: "DELETE"
            });

            if (!response.ok) {
            throw new Error(`Delete failed with status: ${response.status}`);
            }

            console.log("✅ Profile deleted successfully");

            const successToastEl = document.getElementById("successToast");
            if (successToastEl) {
            const successToast = new bootstrap.Toast(successToastEl);
            successToast.show();
            } else {
            alert("Profile deleted successfully.");
            }

            setTimeout(() => {
            window.location.href = "/walkers.html";
            }, 1500);

        } catch (error) {
            console.error("❌ Error deleting profile:", error);
            
            
            const errorToastEl = document.getElementById("errorToast");
            if (errorToastEl) {
            const errorToast = new bootstrap.Toast(errorToastEl);
            errorToast.show();
            } else {
            alert("Failed to delete profile. Please try again.");
            }
        }
        });
    }
    // Prevent default form submission
    event.preventDefault();

    console.log("📝 Update profile form submitted!");

    // Collect form data
    const formData = new FormData(form);

    // Collect multi-select checkbox values
    const preferredDogSizes = [];
    document.querySelectorAll('input[name="preferredDogSizes"]:checked').forEach((cb) => {
      preferredDogSizes.push(cb.value);
    });

    const times = [];
    document.querySelectorAll('input[name="times"]:checked').forEach((cb) => {
      times.push(cb.value);
    });

    // Convert FormData to structured object
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      serviceAreas: formData.get("serviceAreas"),
      experienceYears: parseInt(formData.get("experienceYears")),
      hourlyRate: parseInt(formData.get("hourlyRate")),
      maxDogsPerWalk: parseInt(formData.get("maxDogsPerWalk")),
      preferredDogSizes: preferredDogSizes,
      availability: {
        weekdays: document.getElementById("weekdays").checked,
        weekends: document.getElementById("weekends").checked,
        times: times
      },
      bio: formData.get("bio"),
      openToGroupWalks: document.getElementById("openToGroupWalks").checked
    };

    console.log("📦 Updated data to send:", data);

    // Disable submit button
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Updating...";

    try {
      // Send PUT request to backend
      const response = await fetch(`/api/walkers/${walkerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Profile updated successfully:", result);

      // Show success toast
      const successToastEl = document.getElementById("successToast");
      if (successToastEl) {
        const successToast = new bootstrap.Toast(successToastEl);
        successToast.show();
      }

      // Redirect back to walkers list page after 1.5 seconds
      setTimeout(() => {
        window.location.href = "/walkers.html";
      }, 1500);
    } catch (error) {
      console.error("❌ Error updating profile:", error);

      // Show error toast
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
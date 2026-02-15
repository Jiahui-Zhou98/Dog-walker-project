console.log("EditWalkerModule loaded");

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("editWalkerForm");
  const deleteBtn = document.getElementById("deleteProfileBtn");

  // ========== Get walker ID from URL ==========
  const urlParams = new URLSearchParams(window.location.search);
  const walkerId = urlParams.get("id");

  console.log("Editing walker profile with ID:", walkerId);

  if (!walkerId) {
    alert("Error: No walker ID provided");
    window.location.href = "/walkers.html";
    return;
  }

  // ========== Handle profile deletion (Independent Logic) ==========
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      // Show the Bootstrap Modal
      const deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"));
      deleteModal.show();

      const confirmBtn = document.getElementById("confirmDeleteBtn");

      // Clear previous listeners to prevent multiple deletions
      const newConfirmBtn = confirmBtn.cloneNode(true);
      confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

      newConfirmBtn.addEventListener("click", async () => {
        deleteModal.hide();
        console.log("Attempting to delete walker profile:", walkerId);

        try {
          const response = await fetch(`/api/walkers/${walkerId}`, {
            method: "DELETE",
          });

          if (!response.ok) throw new Error(`Delete failed: ${response.status}`);

          // Show Success Toast
          const successToastEl = document.getElementById("successToast");
          if (successToastEl) {
            const successToast = new bootstrap.Toast(successToastEl);
            successToast.show();
          }

          // Redirect after short delay
          setTimeout(() => {
            window.location.href = "/walkers.html";
          }, 1500);

        } catch (error) {
          console.error("Error deleting walker:", error);
          alert("Failed to delete profile. Please try again.");
        }
      });
    });
  }

  // ========== Fetch existing walker data ==========
  try {
    console.log("Fetching walker data...");
    const response = await fetch(`/api/walkers/${walkerId}`);

    if (!response.ok) {
      throw new Error(`Profile not found (status: ${response.status})`);
    }

    const result = await response.json();
    const walker = result.walker;

    console.log("Walker data loaded:", walker);

    // Pre-fill form fields
    document.getElementById("name").value = walker.name || "";
    document.getElementById("email").value = walker.email || "";
    document.getElementById("phone").value = walker.phone || "";
    document.getElementById("serviceAreas").value = walker.serviceAreas || "";
    document.getElementById("experienceYears").value = walker.experienceYears || 0;
    document.getElementById("hourlyRate").value = walker.hourlyRate || 15;
    document.getElementById("maxDogsPerWalk").value = walker.maxDogsPerWalk || 1;

    if (walker.preferredDogSizes && Array.isArray(walker.preferredDogSizes)) {
      walker.preferredDogSizes.forEach(size => {
        const checkbox = document.querySelector(`input[name="preferredDogSizes"][value="${size}"]`);
        if (checkbox) checkbox.checked = true;
      });
    }

    if (walker.availability) {
      document.getElementById("weekdays").checked = walker.availability.weekdays || false;
      document.getElementById("weekends").checked = walker.availability.weekends || false;

      if (walker.availability.times && Array.isArray(walker.availability.times)) {
        walker.availability.times.forEach(time => {
          const checkbox = document.querySelector(`input[name="times"][value="${time}"]`);
          if (checkbox) checkbox.checked = true;
        });
      }
    }

    document.getElementById("bio").value = walker.bio || "";
    document.getElementById("openToGroupWalks").checked = walker.openToGroupWalks || false;

    console.log("Form pre-filled successfully");
  } catch (error) {
    console.error("Error loading walker profile:", error);
    alert(`Error loading profile: ${error.message}`);
    window.location.href = "/walkers.html";
    return;
  }

  // ========== Handle form submission (UPDATE) ==========
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const preferredDogSizes = [];
    document.querySelectorAll('input[name="preferredDogSizes"]:checked').forEach((cb) => {
      preferredDogSizes.push(cb.value);
    });

    const times = [];
    document.querySelectorAll('input[name="times"]:checked').forEach((cb) => {
      times.push(cb.value);
    });

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

    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Updating...";

    try {
      const response = await fetch(`/api/walkers/${walkerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const successToastEl = document.getElementById("successToast");
      if (successToastEl) {
        const successToast = new bootstrap.Toast(successToastEl);
        successToast.show();
      }

      setTimeout(() => {
        window.location.href = "/walkers.html";
      }, 1500);
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorToastEl = document.getElementById("errorToast");
      if (errorToastEl) {
        const errorToast = new bootstrap.Toast(errorToastEl);
        errorToast.show();
      }
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
});
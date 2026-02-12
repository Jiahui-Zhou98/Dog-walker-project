console.log("EditRequestModule loaded");

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", async () => {
  // Get form elements
  const form = document.getElementById("editRequestForm");
  const openToSocialCheckbox = document.getElementById("openToSocial");
  const socialNoteContainer = document.getElementById("socialNoteContainer");

  // ========== Get request ID from URL ==========
  // Example URL: /edit-request.html?id=507f1f77bcf86cd799439011
  const urlParams = new URLSearchParams(window.location.search);
  const requestId = urlParams.get("id");

  console.log("📝 Editing request with ID:", requestId);

  // If no ID in URL, redirect back to requests list
  if (!requestId) {
    alert("Error: No request ID provided");
    window.location.href = "/requests.html";
    return;
  }

  // ========== Fetch existing request data ==========
  try {
    console.log("🔍 Fetching request data...");

    // Send GET request to fetch this specific request
    const response = await fetch(`/api/requests/${requestId}`);

    if (!response.ok) {
      throw new Error(`Request not found (status: ${response.status})`);
    }

    const result = await response.json();
    const request = result.request;

    console.log("✅ Request data loaded:", request);

    // ========== Pre-fill form with existing data ==========
    // Dog information
    document.getElementById("dogName").value = request.dogName || "";
    document.getElementById("breed").value = request.breed || "";
    document.getElementById("age").value = request.age || "";
    document.getElementById("size").value = request.size || "";
    document.getElementById("temperament").value = request.temperament || "";

    // Walking details
    document.getElementById("frequency").value = request.frequency || "";
    document.getElementById("preferredTime").value =
      request.preferredTime || "";
    document.getElementById("duration").value = request.duration || "";
    document.getElementById("startDate").value = request.startDate || "";
    document.getElementById("budget").value = request.budget || "";

    // Location
    document.getElementById("location").value = request.location || "";
    document.getElementById("pickupLocation").value =
      request.pickupLocation || "";

    // Owner information
    document.getElementById("ownerName").value = request.ownerName || "";
    document.getElementById("ownerPhone").value = request.ownerPhone || "";
    document.getElementById("ownerEmail").value = request.ownerEmail || "";

    // Request status
    document.getElementById("status").value = request.status || "open";

    // Additional information
    document.getElementById("specialNeeds").value = request.specialNeeds || "";

    // Social preference
    if (request.openToSocial) {
      openToSocialCheckbox.checked = true;
      socialNoteContainer.style.display = "block";
      document.getElementById("socialNote").value = request.socialNote || "";
    }

    console.log("✅ Form pre-filled with existing data");
  } catch (error) {
    console.error("❌ Error loading request:", error);
    alert(`Error loading request: ${error.message}`);
    window.location.href = "/requests.html";
    return;
  }

  // ========== Show/Hide social note textarea ==========
  openToSocialCheckbox.addEventListener("change", () => {
    if (openToSocialCheckbox.checked) {
      socialNoteContainer.style.display = "block";
    } else {
      socialNoteContainer.style.display = "none";
      document.getElementById("socialNote").value = "";
    }
  });

  // ========== Handle form submission (UPDATE) ==========
  form.addEventListener("submit", async (event) => {
    // Prevent default form submission
    event.preventDefault();

    console.log("📝 Update form submitted!");

    // Collect form data
    const formData = new FormData(form);

    // Convert FormData to plain object
    const data = {
      // Dog information
      dogName: formData.get("dogName"),
      breed: formData.get("breed"),
      age: parseInt(formData.get("age")),
      size: formData.get("size"),
      temperament: formData.get("temperament"),

      // Walking details
      frequency: formData.get("frequency"),
      preferredTime: formData.get("preferredTime"),
      duration: parseInt(formData.get("duration")),
      startDate: formData.get("startDate"),
      budget: parseInt(formData.get("budget")),

      // Location
      location: formData.get("location"),
      pickupLocation: formData.get("pickupLocation"),

      // Owner information
      ownerName: formData.get("ownerName"),
      ownerPhone: formData.get("ownerPhone"),
      ownerEmail: formData.get("ownerEmail"),

      // Request status
      status: formData.get("status"),

      // Additional information
      specialNeeds: formData.get("specialNeeds") || "",
      openToSocial: openToSocialCheckbox.checked,
      socialNote: openToSocialCheckbox.checked
        ? formData.get("socialNote") || ""
        : "",
    };

    console.log("📦 Updated data to send:", data);

    // Disable submit button
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Updating...";

    try {
      // Send PUT request to backend
      const response = await fetch(`/api/requests/${requestId}`, {
        method: "PUT",
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
      console.log("✅ Request updated successfully:", result);

      // Show success toast
      const successToast = new bootstrap.Toast(
        document.getElementById("successToast"),
      );
      successToast.show();

      // Redirect back to requests list page after toast is shown
      setTimeout(() => {
        window.location.href = "/requests.html";
      }, 1500);
    } catch (error) {
      // Handle errors
      console.error("❌ Error updating request:", error);

      // Show error toast
      const errorToast = new bootstrap.Toast(
        document.getElementById("errorToast"),
      );
      errorToast.show();

      // Restore button state
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
});

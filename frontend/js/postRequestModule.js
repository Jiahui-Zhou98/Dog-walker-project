// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Get form elements
  const form = document.getElementById("postRequestForm");
  const openToSocialCheckbox = document.getElementById("openToSocial");
  const socialNoteContainer = document.getElementById("socialNoteContainer");

  // ========== Show/Hide social note textarea ==========
  openToSocialCheckbox.addEventListener("change", () => {
    if (openToSocialCheckbox.checked) {
      // Show social note input when checkbox is checked
      socialNoteContainer.style.display = "block";
    } else {
      // Hide and clear when unchecked
      socialNoteContainer.style.display = "none";
      document.getElementById("socialNote").value = "";
    }
  });

  // ========== Handle form submission ==========
  form.addEventListener("submit", async (event) => {
    // Prevent default form submission (prevent page refresh)
    event.preventDefault();

    // Collect form data
    const formData = new FormData(form);

    // Convert FormData to plain object
    const data = {
      // Dog information
      dogName: formData.get("dogName"),
      breed: formData.get("breed"),
      age: parseInt(formData.get("age")), // Convert to number
      size: formData.get("size"),
      temperament: formData.get("temperament"),

      // Walking details
      frequency: formData.get("frequency"),
      preferredTime: formData.get("preferredTime"),
      duration: parseInt(formData.get("duration")), // Convert to number
      startDate: formData.get("startDate"),
      budget: parseInt(formData.get("budget")), // Convert to number

      // Location
      location: formData.get("location"),
      pickupLocation: formData.get("pickupLocation"),

      // Owner information
      ownerName: formData.get("ownerName"),
      ownerPhone: formData.get("ownerPhone"),
      ownerEmail: formData.get("ownerEmail"),

      // Additional information
      specialNeeds: formData.get("specialNeeds") || "", // Optional field, default empty string
      openToSocial: openToSocialCheckbox.checked, // Convert to boolean
      socialNote: openToSocialCheckbox.checked
        ? formData.get("socialNote") || ""
        : "",
    };

    // Disable submit button to prevent duplicate submissions
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    try {
      // Send POST request to backend
      const response = await fetch("/api/requests", {
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

      // Show success toast notification
      const successToast = new bootstrap.Toast(
        document.getElementById("successToast"),
      );
      successToast.show();

      // Redirect back to requests list page after toast is shown
      setTimeout(() => {
        window.location.href = "/requests.html";
      }, 3000); // Wait 3 seconds to show the toast before redirecting
    } catch (error) {
      // Handle errors
      console.error("❌ Error submitting request:", error);

      // Show error toast notification
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

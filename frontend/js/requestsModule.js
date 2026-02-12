console.log("RequestsModule loaded");

function RequestsModule() {
  const me = {};
  let currentPage = 1;
  const pageSize = 20;
  let allRequests = [];
  let totalRequests = 0;
  let isLoading = false;

  // Fetch requests from API
  const fetchRequests = async () => {
    isLoading = true;
    renderLoading();

    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage,
        pageSize: pageSize,
      });

      // Add filters
      const size = document.getElementById("filterSize")?.value;
      const location = document.getElementById("filterLocation")?.value;
      const time = document.getElementById("filterTime")?.value;
      const status = document.getElementById("filterStatus")?.value;
      const social = document.getElementById("filterSocial")?.value;

      if (size) params.append("size", size);
      if (location) params.append("location", location);
      if (time) params.append("preferredTime", time);
      if (status) params.append("status", status);
      if (social) params.append("openToSocial", social);

      const response = await fetch(`/api/requests?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      allRequests = result.data || [];
      totalRequests = result.total || 0;

      renderRequests();
    } catch (error) {
      console.error("Error fetching requests:", error);
      renderError(error.message);
    } finally {
      isLoading = false;
    }
  };

  // Render loading state
  const renderLoading = () => {
    const container = document.getElementById("requests-list");
    if (!container) return;

    container.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading requests...</p>
      </div>
    `;
  };

  // Render error state
  const renderError = (message) => {
    const container = document.getElementById("requests-list");
    if (!container) return;

    container.innerHTML = `
      <div class="text-center py-5">
        <h3 class="text-danger">⚠️ Error Loading Requests</h3>
        <p class="text-muted">${message}</p>
        <button class="btn btn-primary-custom mt-3" onclick="location.reload()">
          Try Again
        </button>
      </div>
    `;
  };

  // Render a single request card
  const renderRequestCard = (request) => {
    const statusMap = {
      open: { class: "badge-open", text: "Available" },
      matched: { class: "badge-matched", text: "Matched" },
      completed: { class: "badge-completed", text: "Completed" },
    };
    const statusInfo = statusMap[request.status] || statusMap.open;
    const statusClass = statusInfo.class;
    const statusText = statusInfo.text;

    // Social badge (new feature)
    const socialBadge = request.openToSocial
      ? `<span class="badge-social ms-2">Open to Social</span>`
      : "";

    // Social note (new feature)
    const socialNote =
      request.openToSocial && request.socialNote
        ? `<div class="social-note">
           <strong>Social Note:</strong> ${request.socialNote}
         </div>`
        : "";

    return `
      <div class="col-12 mb-3">
        <div class="item-card">
          <div class="row g-0">
            <div class="col-md-3">
              <div class="card-image-placeholder">
                <div style="font-size: 4rem;">🐕</div>
              </div>
            </div>
            <div class="col-md-9">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h3 class="card-title mb-1">${request.dogName}${socialBadge}</h3>
                    <p class="card-subtitle">${request.breed} • ${request.age} years old</p>
                  </div>
                  <span class="badge-status ${statusClass}">${statusText}</span>
                </div>
                
                <div class="row">
                  <div class="col-md-6">
                    <div class="info-row">
                      <strong>Size:</strong>
                      <span>${request.size.charAt(0).toUpperCase() + request.size.slice(1)}</span>
                    </div>
                    <div class="info-row">
                      <strong>Temperament:</strong>
                      <span>${request.temperament.charAt(0).toUpperCase() + request.temperament.slice(1)}</span>
                    </div>
                    <div class="info-row">
                      <strong>Frequency:</strong>
                      <span>${request.frequency.charAt(0).toUpperCase() + request.frequency.slice(1)}</span>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="info-row">
                      <strong>Preferred Time:</strong>
                      <span>${request.preferredTime.charAt(0).toUpperCase() + request.preferredTime.slice(1)}</span>
                    </div>
                    <div class="info-row">
                      <strong>Duration:</strong>
                      <span>${request.duration} minutes</span>
                    </div>
                    <div class="info-row">
                      <strong>Budget:</strong>
                      <span style="color: var(--primary-color); font-weight: 700;">$${request.budget}</span>
                    </div>
                  </div>
                </div>

                <div class="info-row mt-3">
                  <strong>Location:</strong>
                  <span>${request.location}</span>
                </div>

                <div class="info-row">
                  <strong>Owner:</strong>
                  <span>${request.ownerName} • ${request.ownerPhone}</span>
                </div>

                ${socialNote}

                <div class="mt-3 d-flex gap-2 justify-content-end">
                  <a href="/edit-request.html?id=${request._id}" class="btn btn-outline-primary btn-sm">
                    Edit
                  </a>
                  <button 
                    class="btn btn-outline-danger btn-sm" 
                    onclick="window.requestsModule.deleteRequest('${request._id}', '${request.dogName}')">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  // Render all requests
  const renderRequests = () => {
    const container = document.getElementById("requests-list");
    if (!container) return;

    if (allRequests.length === 0 && !isLoading) {
      container.innerHTML = `
        <div class="text-center py-5">
          <h3>No requests found</h3>
          <p class="text-muted">Try adjusting your filters</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="row">
        ${allRequests.map((request) => renderRequestCard(request)).join("")}
      </div>
    `;

    renderPagination();
  };

  // Render pagination
  const renderPagination = () => {
    const paginationEl = document.getElementById("pagination");
    if (!paginationEl) return;

    const totalPages = Math.ceil(totalRequests / pageSize);

    if (totalPages <= 1) {
      paginationEl.innerHTML = "";
      return;
    }

    let html = `
      <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
        <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
      </li>
    `;

    // Show page numbers (max 10 pages visible)
    const maxVisible = 10;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      html += `
        <li class="page-item ${i === currentPage ? "active" : ""}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `;
    }

    html += `
      <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
        <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
      </li>
    `;

    paginationEl.innerHTML = html;

    // Add click handlers
    paginationEl.querySelectorAll(".page-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const page = parseInt(e.target.dataset.page);
        if (page >= 1 && page <= totalPages && page !== currentPage) {
          currentPage = page;
          fetchRequests();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    });
  };

  // Apply filters
  me.applyFilters = () => {
    currentPage = 1; // Reset to first page
    fetchRequests(); // Fetch with new filters
  };

  // Initialize
  me.init = () => {
    // Initial data fetch
    fetchRequests();

    // Setup filter button
    const filterBtn = document.getElementById("applyFilters");
    if (filterBtn) {
      filterBtn.addEventListener("click", me.applyFilters);
    }

    // Allow Enter key in location input
    const locationInput = document.getElementById("filterLocation");
    if (locationInput) {
      locationInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          me.applyFilters();
        }
      });
    }
  };

  // Delete request
  me.deleteRequest = (requestId, dogName) => {
    console.log("🗑️ Delete button clicked for:", requestId, dogName);

    // Update modal content with dog name
    document.getElementById("deleteRequestName").textContent = dogName;

    // Show Bootstrap modal
    const deleteModal = new bootstrap.Modal(
      document.getElementById("deleteModal"),
    );
    deleteModal.show();

    // Handle confirm button click
    const confirmBtn = document.getElementById("confirmDeleteBtn");

    // Remove old event listeners by cloning the button
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    // Add new event listener for this specific delete
    newConfirmBtn.addEventListener("click", async () => {
      console.log("🗑️ Delete confirmed, sending request...");

      // Hide the modal
      deleteModal.hide();

      try {
        // Send DELETE request to backend
        const response = await fetch(`/api/requests/${requestId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("✅ Request deleted successfully");

        // Show success toast
        const successToast = new bootstrap.Toast(
          document.getElementById("deleteSuccessToast"),
          {
            delay: 3000,
          },
        );
        successToast.show();

        // Refresh the requests list after a short delay
        setTimeout(() => {
          fetchRequests();
        }, 500);
      } catch (error) {
        console.error("❌ Error deleting request:", error);

        // Show error toast
        const errorToast = new bootstrap.Toast(
          document.getElementById("deleteErrorToast"),
        );
        errorToast.show();
      }
    });
  };

  return me;
}

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    const module = RequestsModule();
    module.init();
    window.requestsModule = module; // Make module accessible globally for onclick handlers
  });
} else {
  const module = RequestsModule();
  module.init();
  window.requestsModule = module; // Make module accessible globally for onclick handlers
}

export default RequestsModule;

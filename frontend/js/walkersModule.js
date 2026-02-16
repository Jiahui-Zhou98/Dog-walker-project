console.log("WalkersModule loaded");

function WalkersModule() {
  const me = {};
  let currentPage = 1;
  const pageSize = 12;
  let totalWalkers = 0;
  let allWalkers = [];
  let isLoading = false;

  /**
   * Check authentication status to enable/disable "My Posts" checkbox
   */
  const checkAuthForMyPosts = async () => {
    const myPostsCheckbox = document.getElementById("filterMyPosts");
    const myPostsLabel = document.querySelector('label[for="filterMyPosts"]');
    if (!myPostsCheckbox) return;

    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        // User is logged in: enable the checkbox
        myPostsCheckbox.disabled = false;
        if (myPostsLabel) myPostsLabel.classList.remove("text-muted");
      } else {
        // Not logged in: keep it disabled and unchecked
        myPostsCheckbox.disabled = true;
        myPostsCheckbox.checked = false;
        if (myPostsLabel) myPostsLabel.classList.add("text-muted");
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    }
  };

  /**
   * Fetch walkers data from API with filters and pagination
   */
  const fetchWalkers = async () => {
    isLoading = true;
    renderLoading();

    try {
      const params = new URLSearchParams({
        page: currentPage,
        pageSize: pageSize,
      });

      // Get values from standard filters
      const size = document.getElementById("filterSize")?.value;
      const location = document.getElementById("filterLocation")?.value;
      const experience = document.getElementById("filterExperience")?.value;
      const time = document.getElementById("filterTime")?.value;
      const availability = document.getElementById("filterAvailability")?.value;

      // Get value from My Posts filter
      const myPosts = document.getElementById("filterMyPosts")?.checked;

      if (size) params.append("size", size);
      if (location) params.append("location", location);
      if (experience) params.append("experience", experience);
      if (time) params.append("time", time);
      if (availability) params.append("availability", availability);

      // Add myPosts parameter if checked
      if (myPosts) params.append("myPosts", "true");

      const res = await fetch(`/api/walkers?${params.toString()}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const result = await res.json();
      allWalkers = result.data || [];
      totalWalkers = result.total || 0;

      renderWalkers();
    } catch (err) {
      console.error("❌ Failed to load walkers:", err);
      renderError(err.message);
    } finally {
      isLoading = false;
    }
  };

  /**
   * Render loading spinner
   */
  const renderLoading = () => {
    const list = document.getElementById("walkers-list");
    if (list) {
      list.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2 text-muted">Finding awesome walkers...</p>
        </div>`;
    }
  };

  /**
   * Render error message
   */
  const renderError = (msg) => {
    const list = document.getElementById("walkers-list");
    if (list) {
      list.innerHTML = `<div class="col-12 text-center py-5 text-danger">⚠️ Error: ${msg}</div>`;
    }
  };

  /**
   * Render individual Walker Card
   */
  const renderWalkerCard = (w) => {
    const schedule = [];
    if (w.availability?.weekdays) schedule.push("Weekdays");
    if (w.availability?.weekends) schedule.push("Weekends");
    const timeSlots = (w.availability?.times || []).join(", ");

    const displayAreas = Array.isArray(w.serviceAreas)
      ? w.serviceAreas.join(", ")
      : w.serviceAreas || "N/A";

    const displaySizes = Array.isArray(w.preferredDogSizes)
      ? w.preferredDogSizes.join(", ")
      : w.preferredDogSizes || "N/A";

    return `
      <div class="col-md-4 mb-4">
        <div class="item-card h-100 shadow-sm border-0">
          <div class="card-body p-4">
            <h5 class="card-title fw-bold mb-3">${w.name}</h5>
            <div class="walker-info">
              <p class="mb-2">
                <i class="bi bi-envelope-fill me-2 text-primary"></i> 
                <a href="mailto:${w.email}" class="text-decoration-none text-dark">${w.email || "N/A"}</a>
              </p>
              <p class="mb-2">
                <i class="bi bi-star-fill me-2 text-warning"></i> 
                <strong>Exp:</strong> ${w.experienceYears}y | <strong>Rate:</strong> $${w.hourlyRate}/hr
              </p>
              <p class="mb-2">
                <i class="bi bi-geo-alt-fill me-2 text-danger"></i> 
                <strong>Areas:</strong> ${displayAreas}
              </p>
              <hr class="my-3">
              <p class="mb-1 small text-muted">
                <strong>Schedule:</strong> ${schedule.join(" & ") || "N/A"}
              </p>
              <p class="mb-1 small text-muted">
                <strong>Times:</strong> ${timeSlots || "N/A"}
              </p>
              <div class="mt-3 d-flex justify-content-between align-items-center">
                <span class="badge bg-light text-primary border text-uppercase" style="font-size: 0.65rem;">
                  Sizes: ${displaySizes}
                </span>
                <div class="d-flex gap-2">
                  <a href="/edit-profile.html?id=${w._id}" class="btn btn-outline-primary btn-sm">Edit</a>
                  <button 
                    class="btn btn-outline-danger btn-sm" 
                    onclick="window.walkersModule.deleteWalker('${w._id}', '${w.name}')">
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

  /**
   * Render the list of walkers and trigger pagination rendering
   */
  const renderWalkers = () => {
    const list = document.getElementById("walkers-list");
    if (!list) return;

    if (allWalkers.length === 0) {
      list.innerHTML = `
        <div class="col-12 text-center py-5">
          <h3 class="text-muted">No walkers found</h3>
        </div>`;
      const nav = document.getElementById("pagination-container");
      if (nav) nav.innerHTML = "";
      return;
    }

    list.innerHTML = allWalkers.map((w) => renderWalkerCard(w)).join("");
    renderPagination();
  };

  /**
   * Render pagination controls and handle click events
   */
  const renderPagination = () => {
    const nav = document.getElementById("pagination-container");
    if (!nav) return;
    const totalPages = Math.ceil(totalWalkers / pageSize);
    if (totalPages <= 1) {
      nav.innerHTML = "";
      return;
    }
    let html = "";
    html += `<li class="page-item ${currentPage === 1 ? "disabled" : ""}"><a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a></li>`;
    const range = 2;
    let startPage = Math.max(1, currentPage - range);
    let endPage = Math.min(totalPages, currentPage + range);
    if (endPage - startPage < 4) {
      if (startPage === 1) endPage = Math.min(totalPages, 5);
      else if (endPage === totalPages) startPage = Math.max(1, totalPages - 4);
    }
    for (let i = startPage; i <= endPage; i++) {
      html += `<li class="page-item ${i === currentPage ? "active" : ""}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
    }
    html += `<li class="page-item ${currentPage === totalPages ? "disabled" : ""}"><a class="page-link" href="#" data-page="${currentPage + 1}">Next</a></li>`;
    nav.innerHTML = html;
    nav.querySelectorAll(".page-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const p = parseInt(link.getAttribute("data-page"));
        if (p && p >= 1 && p <= totalPages && p !== currentPage) {
          currentPage = p;
          fetchWalkers();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    });
  };

  /**
   * Delete Walker Profile with Confirmation Modal
   */
  me.deleteWalker = (walkerId, walkerName) => {
    console.log("🗑️ Delete initiated for walker:", walkerId, walkerName);

    const modalNameEl = document.getElementById("deleteRequestName");
    if (modalNameEl) modalNameEl.textContent = walkerName;

    const deleteModal = new bootstrap.Modal(
      document.getElementById("deleteModal"),
    );
    deleteModal.show();

    const confirmBtn = document.getElementById("confirmDeleteBtn");

    // Replace the button to remove old event listeners (prevents multiple deletes)
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    newConfirmBtn.addEventListener("click", async () => {
      deleteModal.hide();
      try {
        const response = await fetch(`/api/walkers/${walkerId}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error(`Delete failed: ${response.status}`);

        // Success Feedback
        const successToast = new bootstrap.Toast(
          document.getElementById("deleteSuccessToast"),
        );
        successToast.show();

        // Refresh list after a short delay
        setTimeout(() => fetchWalkers(), 500);
      } catch (error) {
        console.error("❌ Error deleting walker:", error);
        const errorToast = new bootstrap.Toast(
          document.getElementById("deleteErrorToast"),
        );
        errorToast.show();
      }
    });
  };

  /**
   * Apply selected filters and reset to page 1
   */
  me.applyFilters = () => {
    currentPage = 1;
    fetchWalkers();
  };

  /**
   * Reset all filters and fetch default list
   */
  me.resetFilters = () => {
    [
      "filterSize",
      "filterLocation",
      "filterExperience",
      "filterTime",
      "filterAvailability",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    // Reset My Posts Checkbox
    const myPosts = document.getElementById("filterMyPosts");
    if (myPosts) myPosts.checked = false;

    currentPage = 1;
    fetchWalkers();
  };

  /**
   * Initialize Module: Attach listeners and initial fetch
   */
  me.init = () => {
    fetchWalkers();
    checkAuthForMyPosts(); // Check if user is logged in to enable "My Posts"

    document
      .getElementById("applyFilters")
      ?.addEventListener("click", me.applyFilters);
    document
      .getElementById("resetFilters")
      ?.addEventListener("click", me.resetFilters);

    document
      .getElementById("filterLocation")
      ?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") me.applyFilters();
      });
  };

  return me;
}

document.addEventListener("DOMContentLoaded", () => {
  const module = WalkersModule();
  module.init();
  // Attach to window for global access (e.g., from onclick in cards)
  window.walkersModule = module;
});

function WalkersModule() {
  const me = {};
  let currentPage = 1;
  const pageSize = 12;
  let totalWalkers = 0;
  let allWalkers = [];
  let loggedInUserId = null;
  const HTML_ESCAPE_MAP = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch]);

  const safeText = (value, fallback = "N/A") => {
    const normalized = String(value ?? "").trim();
    return normalized || fallback;
  };

  const safeId = (value) => encodeURIComponent(String(value ?? ""));

  const isSafeEmail = (value) =>
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);

  const formatList = (value) => {
    if (Array.isArray(value)) {
      const normalized = value
        .map((item) => String(item ?? "").trim())
        .filter((item) => item);
      return normalized.length ? normalized.join(", ") : "N/A";
    }
    return safeText(value);
  };

  /**
   * Check authentication status to enable "My Posts" and identify the user
   */
  const checkAuthStatus = async () => {
    const myPostsCheckbox = document.getElementById("filterMyPosts");
    const myPostsLabel = document.querySelector('label[for="filterMyPosts"]');
    const postProfileBtn = document.getElementById("postProfileBtn");

    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const result = await res.json();
        loggedInUserId = result.user ? result.user._id : result._id;

        if (myPostsCheckbox) {
          myPostsCheckbox.disabled = false;
          if (myPostsLabel) myPostsLabel.classList.remove("text-muted");
        }

        // Update button style if logged in
        if (postProfileBtn) {
          postProfileBtn.classList.remove("btn-outline-secondary");
          postProfileBtn.classList.add("btn-primary-custom");
          postProfileBtn.textContent = "+ Post Profile";
        }
      } else {
        loggedInUserId = null;
        if (myPostsCheckbox) {
          myPostsCheckbox.disabled = true;
          myPostsCheckbox.checked = false;
          if (myPostsLabel) myPostsLabel.classList.add("text-muted");
        }

        // Hint to sign in on the button
        if (postProfileBtn) {
          postProfileBtn.classList.add("btn-outline-secondary");
          postProfileBtn.classList.remove("btn-primary-custom");
          postProfileBtn.textContent = "Sign in to Post";
        }
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      loggedInUserId = null;
    }
  };

  /**
   * Fetch walkers data from API with filters and pagination
   */
  const fetchWalkers = async () => {
    renderLoading();

    try {
      const params = new URLSearchParams({
        page: currentPage,
        pageSize: pageSize,
      });

      const size = document.getElementById("filterSize")?.value;
      const location = document.getElementById("filterLocation")?.value;
      const experience = document.getElementById("filterExperience")?.value;
      const time = document.getElementById("filterTime")?.value;
      const availability = document.getElementById("filterAvailability")?.value;
      const myPosts = document.getElementById("filterMyPosts")?.checked;

      if (size) params.append("size", size);
      if (location) params.append("location", location);
      if (experience) params.append("experience", experience);
      if (time) params.append("time", time);
      if (availability) params.append("availability", availability);
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
    }
  };

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

  const renderError = (msg) => {
    const list = document.getElementById("walkers-list");
    if (list) {
      list.innerHTML = `
        <div class="col-12 text-center py-5 text-danger">
          ⚠️ Error: <span id="walkersErrorMessage"></span>
        </div>
      `;
      const messageEl = list.querySelector("#walkersErrorMessage");
      if (messageEl) {
        messageEl.textContent = safeText(msg, "Unknown error");
      }
    }
  };

  /**
   * Render individual Walker Card
   */
  const renderWalkerCard = (w) => {
    const schedule = [];
    if (w.availability?.weekdays) schedule.push("Weekdays");
    if (w.availability?.weekends) schedule.push("Weekends");
    const timeSlots = formatList(w.availability?.times || []);

    const displayAreas = formatList(w.serviceAreas);
    const displaySizes = formatList(w.preferredDogSizes);
    const walkerName = escapeHtml(safeText(w.name));
    const walkerNameAttr = escapeHtml(safeText(w.name, ""));
    const walkerId = safeId(w._id);
    const scheduleText = escapeHtml(schedule.join(" & ") || "N/A");
    const experienceYears = Number.isFinite(Number(w.experienceYears))
      ? String(Number(w.experienceYears))
      : "N/A";
    const hourlyRate = Number.isFinite(Number(w.hourlyRate))
      ? String(Number(w.hourlyRate))
      : "N/A";
    const rawEmail = safeText(w.email, "");
    const emailMarkup = isSafeEmail(rawEmail)
      ? `<a href="mailto:${rawEmail}" class="text-decoration-none text-dark">${escapeHtml(rawEmail)}</a>`
      : "N/A";

    const isOwner =
      loggedInUserId && String(w.userId) === String(loggedInUserId);

    return `
      <div class="col-md-4 mb-4">
        <div class="item-card h-100 shadow-sm border-0">
          <div class="card-body p-4">
            <h5 class="card-title fw-bold mb-3">${walkerName}</h5>
            <div class="walker-info">
              <p class="mb-2">
                <i class="bi bi-envelope-fill me-2 text-primary"></i> 
                ${emailMarkup}
              </p>
              <p class="mb-2">
                <i class="bi bi-star-fill me-2 text-warning"></i> 
                <strong>Exp:</strong> ${experienceYears}y | <strong>Rate:</strong> $${hourlyRate}/hr
              </p>
              <p class="mb-2">
                <i class="bi bi-geo-alt-fill me-2 text-danger"></i> 
                <strong>Areas:</strong> ${escapeHtml(displayAreas)}
              </p>
              <hr class="my-3">
              <p class="mb-1 small text-muted"><strong>Schedule:</strong> ${scheduleText}</p>
              <p class="mb-1 small text-muted"><strong>Times:</strong> ${escapeHtml(timeSlots)}</p>
              
              <div class="mt-3 d-flex justify-content-between align-items-center">
                <span class="badge bg-light text-primary border text-uppercase" style="font-size: 0.65rem;">
                  Sizes: ${escapeHtml(displaySizes)}
                </span>
                
                <div class="d-flex gap-2">
                  ${
                    isOwner
                      ? `
                    <a href="/edit-profile.html?id=${walkerId}" class="btn btn-outline-primary btn-sm">Edit</a>
                    <button 
                      class="btn btn-outline-danger btn-sm" 
                      data-action="delete-walker"
                      data-walker-id="${walkerId}"
                      data-walker-name="${walkerNameAttr}">
                      Delete
                    </button>
                  `
                      : ""
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const bindWalkerCardActions = (list) => {
    list
      .querySelectorAll('button[data-action="delete-walker"]')
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          me.deleteWalker(
            btn.dataset.walkerId,
            btn.dataset.walkerName || "N/A",
          );
        });
      });
  };

  const renderWalkers = () => {
    const list = document.getElementById("walkers-list");
    if (!list) return;

    if (allWalkers.length === 0) {
      list.innerHTML = `<div class="col-12 text-center py-5"><h3 class="text-muted">No walkers found</h3></div>`;
      const paginationEl = document.getElementById("pagination"); // Match Requests style ID
      if (paginationEl) paginationEl.innerHTML = "";
      return;
    }

    list.innerHTML = allWalkers.map((w) => renderWalkerCard(w)).join("");
    bindWalkerCardActions(list);

    renderPagination();
  };

  const renderPagination = () => {
    const paginationEl = document.getElementById("pagination");
    if (!paginationEl) return;

    const totalPages = Math.ceil(totalWalkers / pageSize);

    if (totalPages <= 1) {
      paginationEl.innerHTML = "";
      return;
    }

    let html = `
        <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
          <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
        </li>
      `;

    const maxVisible = 5;
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

    paginationEl.querySelectorAll(".page-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        const page = parseInt(e.target.dataset.page);
        if (page && page >= 1 && page <= totalPages && page !== currentPage) {
          currentPage = page;
          fetchWalkers();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    });
  };

  me.deleteWalker = (walkerId, walkerName) => {
    const modalNameEl = document.getElementById("deleteRequestName");
    if (modalNameEl) modalNameEl.textContent = walkerName;

    const deleteModal = new bootstrap.Modal(
      document.getElementById("deleteModal"),
    );
    deleteModal.show();

    const confirmBtn = document.getElementById("confirmDeleteBtn");
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    newConfirmBtn.addEventListener("click", async () => {
      deleteModal.hide();
      try {
        const response = await fetch(`/api/walkers/${walkerId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error(`Delete failed: ${response.status}`);

        const successToast = new bootstrap.Toast(
          document.getElementById("deleteSuccessToast"),
        );
        successToast.show();
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

  me.applyFilters = () => {
    currentPage = 1;
    fetchWalkers();
  };

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
    const myPosts = document.getElementById("filterMyPosts");
    if (myPosts) myPosts.checked = false;
    currentPage = 1;
    fetchWalkers();
  };

  me.init = async () => {
    await checkAuthStatus();
    fetchWalkers();

    const postProfileBtn = document.getElementById("postProfileBtn");
    if (postProfileBtn) {
      postProfileBtn.addEventListener("click", (e) => {
        if (!loggedInUserId) {
          e.preventDefault();
          window.location.href =
            "/login.html?message=signin_to_post&returnTo=post-profile.html";
        }
      });
    }

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
  window.walkersModule = module;
});

export default WalkersModule;

console.log("WalkersModule loaded");

function WalkersModule() {
  const me = {};
  let currentPage = 1;
  const pageSize = 12; 
  let totalWalkers = 0;
  let allWalkers = [];
  let isLoading = false;

  // 1. Fetch data from API
  const fetchWalkers = async () => {
    isLoading = true;
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

      if (size) params.append("size", size);
      if (location) params.append("location", location);
      if (experience) params.append("experience", experience);
      if (time) params.append("time", time);
      if (availability) params.append("availability", availability);

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

  // 2. Render Loading
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

  // 3. Render Error
  const renderError = (msg) => {
    const list = document.getElementById("walkers-list");
    if (list) {
      list.innerHTML = `<div class="col-12 text-center py-5 text-danger">⚠️ Error: ${msg}</div>`;
    }
  };

  // 4. Render Individual Walker Card
  const renderWalkerCard = (w) => {
    const schedule = [];
    if (w.availability?.weekdays) schedule.push("Weekdays");
    if (w.availability?.weekends) schedule.push("Weekends");
    const timeSlots = (w.availability?.times || []).join(", ");

    return `
      <div class="col-md-4 mb-4">
        <div class="item-card h-100 shadow-sm border-0">
          <div class="card-body p-4">
            <h5 class="card-title fw-bold mb-3">${w.name}</h5>
            <div class="walker-info">
              <p class="mb-2">
                <i class="bi bi-envelope-fill me-2 text-primary"></i> 
                <a href="mailto:${w.email}" class="text-decoration-none text-dark">${w.email || 'N/A'}</a>
              </p>
              <p class="mb-2">
                <i class="bi bi-star-fill me-2 text-warning"></i> 
                <strong>Exp:</strong> ${w.experienceYears}y | <strong>Rate:</strong> $${w.hourlyRate}/hr
              </p>
              <p class="mb-2">
                <i class="bi bi-geo-alt-fill me-2 text-danger"></i> 
                <strong>Areas:</strong> ${(w.serviceAreas || []).join(", ")}
              </p>
              <hr class="my-3">
              <p class="mb-1 small text-muted">
                <strong>Schedule:</strong> ${schedule.join(" & ") || "N/A"}
              </p>
              <p class="mb-1 small text-muted">
                <strong>Times:</strong> ${timeSlots || "N/A"}
              </p>
              <div class="mt-3">
                <span class="badge bg-light text-primary border text-uppercase" style="font-size: 0.65rem;">
                  Sizes: ${(w.preferredDogSizes || []).join(", ")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  // 5. Render List & Pagination
  const renderWalkers = () => {
    const list = document.getElementById("walkers-list");
    if (!list) return;

    if (allWalkers.length === 0) {
      list.innerHTML = `
        <div class="col-12 text-center py-5">
          <h3 class="text-muted">No walkers found</h3>
          <p>Try adjusting your filters or location.</p>
        </div>`;
      return;
    }

    list.innerHTML = allWalkers.map(w => renderWalkerCard(w)).join("");
    renderPagination();
  };

  const renderPagination = () => {
    const nav = document.getElementById("pagination-container");
    if (!nav) return;

    const totalPages = Math.ceil(totalWalkers / pageSize);
    if (totalPages <= 1) {
      nav.innerHTML = "";
      return;
    }

    let html = "";

    // Previous 
    html += `
      <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
        <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
      </li>
    `;

    
    const range = 2; 
    let startPage = Math.max(1, currentPage - range);
    let endPage = Math.min(totalPages, currentPage + range);

    
    if (endPage - startPage < 4) {
      if (startPage === 1) endPage = Math.min(totalPages, 5);
      else if (endPage === totalPages) startPage = Math.max(1, totalPages - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      html += `
        <li class="page-item ${i === currentPage ? "active" : ""}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `;
    }

    // Next 
    html += `
      <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
        <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
      </li>
    `;

    nav.innerHTML = html;

  
    nav.querySelectorAll(".page-link").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const p = parseInt(link.getAttribute("data-page")); 
        
        
        if (p && p >= 1 && p <= totalPages && p !== currentPage) {
          console.log(`🚀 Jumping to page: ${p}`); 
          currentPage = p;
          fetchWalkers(); 
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    });
  };

  me.applyFilters = () => {
    currentPage = 1;
    fetchWalkers();
  };

  me.resetFilters = () => {
    ["filterSize", "filterLocation", "filterExperience", "filterTime", "filterAvailability"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    currentPage = 1;
    fetchWalkers();
  };

  me.init = () => {
    fetchWalkers();
    document.getElementById("applyFilters")?.addEventListener("click", me.applyFilters);
    document.getElementById("resetFilters")?.addEventListener("click", me.resetFilters);

    document.getElementById("filterLocation")?.addEventListener("keypress", (e) => {
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
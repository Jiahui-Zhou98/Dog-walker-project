/**
 * WalkersModule: Manages data fetching, UI rendering, and pagination state.
 * This module follows the functional module pattern.
 */
function WalkersModule() {
  const me = {};
  
  // --- Internal State Management ---
  let currentFilters = {}; 
  const pageSize = 20;

  /**
   * Core method to fetch data from the server and trigger UI updates.
   * @param {number} page - The specific page number to retrieve (defaults to 1).
   */
  me.fetchAndRender = async function (page = 1) {
    try {
      // Build search parameters combining filters and pagination logic
      const params = new URLSearchParams(currentFilters);
      params.append("page", page);
      params.append("pageSize", pageSize);

      // Request data from the REST API
      const res = await fetch(`/api/walkers?${params.toString()}`);
      if (!res.ok) throw new Error(`Server responded with status: ${res.status}`);

      const json = await res.json();
      
      // Update the UI components
      me.renderCards(json.data);
      me.renderPagination(json.totalPages, json.currentPage);
      
    } catch (err) {
      console.error("[WalkersModule] Fetch error:", err);
    }
  };

  /**
   * Renders walker data cards into the DOM.
   * @param {Array} data - Array of walker objects fetched from the API.
   */
  me.renderCards = function (data) {
    const list = document.getElementById("walkers-list");
    if (!list) return;

    list.innerHTML = ""; // Reset container content

    if (!data || data.length === 0) {
      list.innerHTML = `
        <div class="col-12 text-center">
          <p class="text-muted">No walkers found matching your criteria.</p>
        </div>`;
      return;
    }

    data.forEach((w) => {
      const col = document.createElement("div");
      col.className = "col-md-4 mb-4";
      
      // Format availability labels
      const schedule = [];
      if (w.availability?.weekdays) schedule.push("Weekdays");
      if (w.availability?.weekends) schedule.push("Weekends");

      col.innerHTML = `
        <div class="card h-100 shadow-sm border-0">
          <div class="card-body">
            <h5 class="card-title fw-bold text-orange">${w.name}</h5>
            <div class="card-text">
              <p class="mb-1"><strong>Rate:</strong> $${w.hourlyRate}/hr</p>
              <p class="mb-1 small text-muted">Areas: ${(w.serviceAreas || []).join(", ")}</p>
              <hr class="my-2">
              <p class="mb-0 small text-uppercase" style="letter-spacing: 0.5px;">
                ${schedule.join(" & ") || "Full Availability"}
              </p>
            </div>
          </div>
        </div>`;
      list.appendChild(col);
    });
  };

  /**
   * Dynamically generates pagination buttons based on total pages.
   * @param {number} totalPages - Total number of pages calculated by the server.
   * @param {number} currentPage - The page currently being viewed.
   */
  me.renderPagination = function (totalPages, currentPage) {
    const nav = document.getElementById("pagination-container");
    if (!nav) return;
    
    nav.innerHTML = ""; // Clear existing pagination links

    for (let i = 1; i <= totalPages; i++) {
      const li = document.createElement("li");
      li.className = `page-item ${i === currentPage ? "active" : ""}`;
      
      // Inject orange theme styling for active page
      li.innerHTML = `
        <a class="page-link ${i === currentPage ? 'bg-orange border-orange' : ''}" href="#">
          ${i}
        </a>`;
      
      // Handle page switching click event
      li.addEventListener("click", (e) => {
        e.preventDefault();
        me.fetchAndRender(i); // Refresh data for the selected page
      });
      nav.appendChild(li);
    }
  };

  /**
   * Updates the global filter state and resets to page 1.
   * @param {Object} newFilters - The filter criteria collected from the UI.
   */
  me.updateFilters = function (newFilters) {
    currentFilters = newFilters;
    me.fetchAndRender(1); // Always reset to page 1 upon new search
  };

  return me;
}
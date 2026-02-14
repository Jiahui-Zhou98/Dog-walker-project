/**
 * Fetches walker data from the API and renders cards into the DOM.
 * @param {string} queryString - The parameters for filtering and pagination.
 */
async function fetchAndRenderWalkers(queryString = "") {
  try {
    const res = await fetch(`/api/walkers?${queryString}`);
    
    // Check if the server response is successful
    if (!res.ok) throw new Error(`Server error: ${res.status}`);

    const json = await res.json();
    const list = document.getElementById("walkers-list");
    
    // Clear existing content
    list.innerHTML = "";

    // Handle case where no results are found
    if (!json.data || json.data.length === 0) {
      list.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No walkers found matching your criteria.</p></div>';
      return;
    }

    // Iterate through the data and create HTML cards
    json.data.forEach((w) => {
      const col = document.createElement("div");
      col.className = "col-md-4 mb-4";

      col.innerHTML = `
        <div class="card h-100 shadow-sm border-0">
          <div class="card-body">
            <h5 class="card-title fw-bold text-primary">${w.name}</h5>
            <p class="card-text">
              <i class="bi bi-star-fill text-warning"></i> <strong>Experience:</strong> ${w.experienceYears} years<br/>
              <strong>Rate:</strong> $${w.hourlyRate}/hour<br/>
              <strong>Areas:</strong> ${(w.serviceAreas || []).join(", ")}<br/>
              <small class="text-muted">Sizes: ${(w.preferredDogSizes || []).join(", ")}</small>
            </p>
          </div>
        </div>
      `;
      list.appendChild(col);
    });
  } catch (err) {
    console.error("Failed to load walkers:", err);
  }
}

// Initialize the page and set up event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Initial load with default page size
  fetchAndRenderWalkers("pageSize=20");

  const applyBtn = document.getElementById("applyFilters");
  
  if (applyBtn) {
    // Inside the applyBtn listener in walkersModule.js
    applyBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // 1. Get values from all filter elements
    const size = document.getElementById("filterSize")?.value;
    const location = document.getElementById("filterLocation")?.value;
    const experience = document.getElementById("filterExperience")?.value;
    const time = document.getElementById("filterTime")?.value;
    const availability = document.getElementById("filterAvailability")?.value;

    // 2. Build the query string using URLSearchParams
    const params = new URLSearchParams();
    
    if (size) params.append("size", size);
    if (location) params.append("location", location);
    if (experience) params.append("experience", experience);
    if (time) params.append("time", time);
    if (availability) params.append("availability", availability);
    
    // Set default page size for each filter action
    params.append("pageSize", 20);
    params.append("page", 1); // Reset to page 1 on every new filter

    console.log("🔍 Dynamic Query Sent:", params.toString());
    
    // 3. Trigger the fetch and render process
    fetchAndRenderWalkers(params.toString());
  });
  }
});
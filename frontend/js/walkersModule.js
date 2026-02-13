// frontend/js/walkersModule.js

async function loadWalkers() {
  try {
    const res = await fetch("/api/walkers?pageSize=20");
    const json = await res.json();

    const list = document.getElementById("walkers-list");
    list.innerHTML = "";

    json.data.forEach((w) => {
      const col = document.createElement("div");
      col.className = "col-md-4";

      col.innerHTML = `
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">${w.name}</h5>
            <p class="card-text">
              <strong>Bio:</strong> ${w.bio || "N/A"}<br/>
              <strong>Experience:</strong> ${w.experienceYears} years<br/>
              <strong>Rate:</strong> $${w.hourlyRate}/hour<br/>
              <strong>Areas:</strong> ${(w.serviceAreas || []).join(", ")}
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

document.addEventListener("DOMContentLoaded", loadWalkers);

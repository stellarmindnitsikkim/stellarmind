// =============================
// Stellar Mind Website JS
// =============================

// Supabase Client Setup
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://ivirtknjuflrcldghnfv.supabase.co";
const SUPABASE_ANON_KEY ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // shorten for clarity

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =============================
// Navbar Toggle (Mobile)
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }

  // Restore login state
  checkLogin();

  // Load Events when page loads
  loadEvents();
});

// =============================
// Persistent Login System
// =============================
function checkLogin() {
  const user = JSON.parse(localStorage.getItem("user"));
  const authBtn = document.getElementById("auth-btn");

  if (user) {
    authBtn.innerHTML = `<a href="index.html"><i class="fas fa-user"></i> ${user.username} (Logout)</a>`;
    authBtn.addEventListener("click", logoutUser);
  } else {
    authBtn.innerHTML = `<a href="login/index.html"><i class="fas fa-user"></i> Login</a>`;
    authBtn.addEventListener("click", loginUser);
  }
}

function loginUser() {
  // Simulate login (replace with Supabase Auth if needed)
  localStorage.setItem("user", JSON.stringify(dummyUser));
  checkLogin();
}

function logoutUser() {
  localStorage.removeItem("user");
  checkLogin();
}

// =============================
// Fetch & Display Upcoming Events
// =============================
async function loadEvents() {
  const eventsList = document.getElementById("events-list");
  if (!eventsList) return;

  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    eventsList.innerHTML = "";

    if (error) {
      eventsList.innerHTML = `<p class="error">⚠️ Failed to load events</p>`;
      return;
    }

    if (!data || data.length === 0) {
      eventsList.innerHTML = "<p>No upcoming events 🎉</p>";
      return;
    }

    data.forEach((event) => {
      const eventCard = document.createElement("div");
      eventCard.classList.add("event-card");

      eventCard.innerHTML = `
        <h3><i class="fas fa-star"></i> ${event.name}</h3>
        <p><i class="fas fa-calendar-alt"></i> ${event.date}</p>
        <p><i class="fas fa-clock"></i> ${event.time}</p>
      `;

      eventsList.appendChild(eventCard);
    });
  } catch (err) {
    console.error("🔥 Unexpected error:", err);
    eventsList.innerHTML = `<p class="error">⚠️ Could not load events</p>`;
  }
}

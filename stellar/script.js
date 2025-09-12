// =============================
// Supabase Setup
// =============================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://yrzpuxhvktpcwksmlnwl.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyenB1eGh2a3RwY3drc21sbndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTY1NzksImV4cCI6MjA3MTg3MjU3OX0.rjUVbGsQvPsLaua936DqA9fB5CVq8puRTq6DgJ1L_bs";

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

  checkLogin();   // Show welcome & set attendance link
  loadEvents();   // Fetch events from Supabase
  loadClasses();  // Load today's classes
});

// =============================
// Check Login & Role-Based Attendance
// =============================
let currentUser = null;

async function checkLogin() {
  try {
    currentUser = JSON.parse(localStorage.getItem("user"));
  } catch {}

  const authBtn = document.getElementById("auth-btn");
  const welcomeUser = document.getElementById("welcome-user");
  const attendanceLink = document.getElementById("attendance-link");

  if (currentUser && (currentUser.username || currentUser.studentname) && currentUser.role) {
    // Prefer studentname if exists, otherwise fallback to username
    const displayName = currentUser.studentname || currentUser.username;

    authBtn.innerHTML = `<a href="#" id="logout-link"><i class="fas fa-user"></i> ${displayName} (Logout)</a>`;
    if (welcomeUser) welcomeUser.textContent = `Hi, ${displayName} 👋`;

    if (attendanceLink) {
      if (currentUser.role === "admin") attendanceLink.href = "admin/index.html";
      else if (currentUser.role === "teacher") attendanceLink.href = "teacher/index.html";
      else attendanceLink.href = "attendence/index.html";
    }

    document.getElementById("logout-link").addEventListener("click", (e) => {
      e.preventDefault();
      logoutUser();
    });
  } else {
    authBtn.innerHTML = `<a href="login/index.html"><i class="fas fa-user"></i> Login</a>`;
    if (welcomeUser) welcomeUser.textContent = "";
    if (attendanceLink) attendanceLink.href = "attendence/index.html";
  }
}

function logoutUser() {
  localStorage.removeItem("user");
  currentUser = null;
  checkLogin();
}

// =============================
// Master Timetable Data
// =============================
const timetable = {
  MON: [
    "08:30 - 09:30 → AI13103 (ECE Faculty) Shed III",
    "09:30 - 10:30 → AI13105 (RS) Shed III",
    "10:30 - 11:30 → AI13101 (LA) Shed III",
    "11:30 - 12:30 → BREAK",
    "12:30 - 01:30 → AI13203 (ECE Faculty) ECE Lab",
    "02:00 - 03:00 → AI13201 (LA/AKT/BBS) CL-4",
  ],
  TUE: [
    "08:30 - 09:30 → AI13102 (ALM) Shed III",
    "09:30 - 10:30 → AI13101 (LA) Shed III",
    "10:30 - 11:30 → AI13201 (LA/AKT/BBS) CL-4",
    "11:30 - 12:30 → BREAK",
    "12:30 - 01:30 → AI13103 (ECE Faculty) Shed III",
    "02:00 - 03:00 → AI13203 (ECE Faculty) ECE Lab",
  ],
  WED: [
    "08:30 - 09:30 → AI13102 (ALM) Shed III",
    "09:30 - 10:30 → AI13106 (BBS) Shed III",
    "10:30 - 11:30 → AI13105 (RS) Shed III",
    "11:30 - 12:30 → BREAK",
    "12:30 - 01:30 → AI13104 (PKK) Shed III",
    "02:00 - 03:00 → AI13103 (ECE Faculty) Shed III",
    "03:00 - 04:00 → AI13203 (ECE Faculty) ECE Lab",
  ],
  THU: [
    "08:30 - 09:30 → ZZ13201 (BBS) Shed III",
    "09:30 - 10:30 → AI13105 (RS) Shed III",
    "10:30 - 11:30 → AI13102 (ALM) Shed III",
    "11:30 - 12:30 → AI13202 (ALM) CL-4",
    "12:30 - 01:30 → BREAK",
    "01:30 - 02:30 → AI13104 (PKK) Shed III",
    "02:30 - 03:30 → AI13203 (ECE Faculty) ECE Lab",
  ],
  FRI: [
    "08:30 - 09:30 → ZZ13201 (BBS) Shed III",
    "09:30 - 10:30 → AI13102 (ALM) Shed III",
    "10:30 - 11:30 → AI13106 (BBS) Shed III",
    "11:30 - 12:30 → AI13106 (BBS) Shed III",
    "12:30 - 01:30 → BREAK",
    "01:30 - 02:30 → AI13104 (PKK) Shed III",
    "02:30 - 03:30 → AI13101 (LA) Shed III",
    "03:30 - 04:30 → AI13204 (PKK) CL-3",
  ],
};

// =============================
// Load Classes Based on User
// =============================
function loadClasses() {
  const classList = document.getElementById("classes-list");
  if (!classList) return;

  const today = new Date().toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();

  if (today === "SAT" || today === "SUN") {
    classList.innerHTML = `<div class="holiday">🎉 Today is a Holiday 🎉</div>`;
    return;
  }

  // Check if user is from B.Tech. AI batch
  if (currentUser && /^b2400\d{2}$/i.test(currentUser.username)) {
    const todaySchedule = timetable[today] || [];
    classList.innerHTML = "";

    todaySchedule.forEach((item) => {
      const card = document.createElement("div");
      card.className = "class-card fade-in";
      card.innerHTML = `<p>${item}</p>`;
      classList.appendChild(card);
    });
  } else {
    // Cool animated fallback
    classList.innerHTML = `
      <div class="uploading-soon">
        <span>📡 Your schedule is uploading soon...</span>
      </div>
    `;
  }
}

// =============================
// Load Events from Supabase
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
      const card = document.createElement("div");
      card.className = "event-card";
      card.innerHTML = `
        <h3><i class="fas fa-star"></i> ${event.name}</h3>
        <p><i class="fas fa-calendar-alt"></i> ${event.date}</p>
        <p><i class="fas fa-clock"></i> ${event.time}</p>
      `;
      eventsList.appendChild(card);
    });
  } catch (err) {
    console.error("🔥 Error loading events:", err);
    eventsList.innerHTML = `<p class="error">⚠️ Could not load events</p>`;
  }
}

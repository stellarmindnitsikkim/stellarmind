// =============================
// Stellar Mind Website JS
// =============================

// Supabase Client Setup
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

  // Restore login state
  checkLogin();

  // Load Events when page loads
  loadEvents();

  // Load Today’s Classes
  loadClasses();
});

// =============================
// Check Login + Admin Redirect
// =============================
async function checkLogin() {
  const user = JSON.parse(localStorage.getItem("user"));
  const authBtn = document.getElementById("auth-btn");
  const welcomeUser = document.getElementById("welcome-user");

  if (user) {
    try {
      // Check if this user exists in admins table
      const { data: adminData, error } = await supabase
        .from("admins")
        .select("*")
        .eq("username", user.username)
        .single();

      if (adminData) {
        // ✅ If user is admin → redirect to admin panel
        window.location.href = "admin.html";
        return;
      }

      // Otherwise, show normal user navbar
      authBtn.innerHTML = `<a href="#" id="logout-link"><i class="fas fa-user"></i> ${user.username} (Logout)</a>`;

      document.getElementById("logout-link").addEventListener("click", (e) => {
        e.preventDefault();
        logoutUser();
      });

      if (welcomeUser) {
        welcomeUser.textContent = `Hi, ${user.username} 👋`;
      }
    } catch (err) {
      console.error("Error checking admin:", err);
    }
  } else {
    // Not logged in
    authBtn.innerHTML = `<a href="login/index.html"><i class="fas fa-user"></i> Login</a>`;
    if (welcomeUser) {
      welcomeUser.textContent = "";
    }
  }
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

// =============================
// Today's Classes
// =============================
const classSchedule = {
  MON: {
    "08:30 AM - 09:30 AM": "",
    "09:30 AM - 10:30 AM": "CS13113 (ECE Faculty) Shed III",
    "10:30 AM - 11:30 AM": "CS13115 (RS) Shed III",
    "11:30 AM - 12:30 PM": "CS13111 (LA) Shed III",
    "12:30 PM - 01:30 PM": "BREAK",
    "02:00 PM - 03:00 PM": "CS13213 (ECE Faculty) ECE Lab",
    "04:00 PM - 05:00 PM": "CS13211 (LA/AKT/BBS) CL-4",
  },
  TUE: {
    "09:30 AM - 10:30 AM": "CS13112 (ALM) Shed III",
    "10:30 AM - 11:30 AM": "CS13111 (LA) Shed III",
    "11:30 AM - 12:30 PM": "CS13211 (LA/AKT/BBS) CL-4",
    "01:30 PM - 02:00 PM": "BREAK",
    "03:00 PM – 04:00 PM": "CS13113 (ECE Faculty) Shed III",
    "04:00 PM - 05:00 PM": "CS13213 (ECE Faculty) ECE Lab",
  },
  WED: {
    "09:30 AM - 10:30 AM": "CS13112 (ALM) Shed III",
    "10:30 AM - 11:30 AM": "CS13116 (BBS) Shed III",
    "11:30 AM - 12:30 PM": "CS13115 (RS) Shed III",
    "12:30 PM - 01:30 PM": "BREAK",
    "02:00 PM - 03:00 PM": "CS13114 (PKK) Shed III",
    "03:00 PM – 04:00 PM": "CS13113 (ECE Faculty) Shed III",
    "04:00 PM - 05:00 PM": "CS13213 (ECE Faculty) ECE Lab",
  },
  THU: {
    "08:30 AM - 09:30 AM": "ZZ13201 (BBS) Shed III",
    "09:30 AM - 10:30 AM": "CS13115 (RS) Shed III",
    "10:30 AM - 11:30 AM": "CS13112 (ALM) Shed III",
    "11:30 AM - 12:30 PM": "CS13212 (ALM) CL-4",
    "01:30 PM - 02:00 PM": "BREAK",
    "03:00 PM – 04:00 PM": "CS13114 (PKK) Shed III",
    "04:00 PM - 05:00 PM": "CS13213 (ECE Faculty) ECE Lab",
  },
  FRI: {
    "08:30 AM - 09:30 AM": "ZZ13201 (BBS) Shed III",
    "09:30 AM - 10:30 AM": "CS13112 (ALM) Shed III",
    "10:30 AM - 11:30 AM": "CS13116 (BBS) Shed III",
    "11:30 AM - 12:30 PM": "CS13116 (BBS) Shed III",
    "12:30 PM - 01:30 PM": "BREAK",
    "02:00 PM - 03:00 PM": "CS13114 (PKK) Shed III",
    "03:00 PM – 04:00 PM": "CS13111 (LA) Shed III",
    "04:00 PM - 05:00 PM": "CS13214 (PKK) CL-3",
  },
};

function loadClasses() {
  const classList = document.getElementById("classes-list");
  const today = new Date()
    .toLocaleDateString("en-US", { weekday: "short" })
    .toUpperCase();

  if (today === "SAT" || today === "SUN") {
    classList.innerHTML = `<div class="holiday">🎉 Today is a Holiday 🎉</div>`;
    return;
  }

  const todaySchedule = classSchedule[today];
  if (!todaySchedule) {
    classList.innerHTML = `<p>No classes scheduled for today.</p>`;
    return;
  }

  classList.innerHTML = "";
  Object.entries(todaySchedule).forEach(([time, subject]) => {
    if (subject && subject !== "") {
      const card = document.createElement("div");
      card.className = "class-card";
      card.innerHTML = `<h3>${time}</h3><p>${subject}</p>`;
      classList.appendChild(card);
    }
  });
}

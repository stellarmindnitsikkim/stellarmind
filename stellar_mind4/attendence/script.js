document.addEventListener("DOMContentLoaded", async () => {
  // --- Mobile menu toggle: attach FIRST so it always works ---
  const menuToggle = document.getElementById("mobile-menu");
  const navLinks = document.querySelector(".nav-links");

  function setIcon(open) {
    const icon = menuToggle.querySelector("i");
    menuToggle.setAttribute("aria-expanded", String(open));
    if (open) {
      icon.classList.remove("fa-bars");
      icon.classList.add("fa-xmark"); // FA 6
      document.body.classList.add("no-scroll");
    } else {
      icon.classList.add("fa-bars");
      icon.classList.remove("fa-xmark");
      document.body.classList.remove("no-scroll");
    }
  }

  menuToggle.addEventListener("click", () => {
    const open = !navLinks.classList.contains("show");
    navLinks.classList.toggle("show", open);
    setIcon(open);
  });

  // Close menu on link click (except disabled Attendance tab)
  document.querySelectorAll(".nav-links a:not(.disabled)").forEach(a => {
    a.addEventListener("click", () => {
      navLinks.classList.remove("show");
      setIcon(false);
    });
  });

  // --- Attendance / auth logic ---
  const container = document.getElementById("attendance-table");
  const heading = document.getElementById("attendance-heading");
  const navUsername = document.getElementById("nav-username");

  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    heading.textContent = "Login Required";
    container.innerHTML = "<p>⚠️ Please login first.</p>";
    return; // menu still works because we attached it above
  }

  navUsername.textContent = user.name;
  heading.textContent = `${user.name}'s Attendance Record`;

  try {
    const response = await fetch(`/api/attendance/${user.id}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });

    if (!response.ok) {
      container.innerHTML = "<p>⚠️ Failed to load attendance</p>";
      return;
    }

    const data = await response.json();
    const attendance = data.attendance || [];

    if (attendance.length === 0) {
      container.innerHTML = "<p>No attendance records found.</p>";
      return;
    }

    let tableHTML = `
      <table>
        <thead>
          <tr><th>Subject</th><th>Date</th><th>Status</th></tr>
        </thead><tbody>
    `;

    attendance.forEach(record => {
      tableHTML += `
        <tr>
          <td>${record.subject}</td>
          <td>${record.date}</td>
          <td style="color:${record.status === 'Present' ? 'lightgreen' : 'red'}">${record.status}</td>
        </tr>
      `;
    });

    tableHTML += "</tbody></table>";
    container.innerHTML = tableHTML;

  } catch (err) {
    console.error("Error fetching attendance:", err);
    container.innerHTML = "<p>🔥 Unexpected error loading attendance</p>";
  }

  // Logout
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.href = "index.html";
    });
  }
});

// ================= Supabase Client =================
const SUPABASE_URL = "https://yrzpuxhvktpcwksmlnwl.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyenB1eGh2a3RwY3drc21sbndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTY1NzksImV4cCI6MjA3MTg3MjU3OX0.rjUVbGsQvPsLaua936DqA9fB5CVq8puRTq6DgJ1L_bs";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ================= Elements =================
const studentNameEl = document.getElementById("studentName");
const attendanceHead = document.getElementById("attendanceHead");
const attendanceBody = document.getElementById("attendanceBody");
const logoutBtn = document.getElementById("logoutBtn");
const toggleBtn = document.getElementById("toggleViewBtn");
const attendanceGrid = document.getElementById("attendanceGrid");

let currentMonth = new Date();
let tableVisible = false;

// ================= Navbar Toggle =================
document.getElementById("mobile-menu").addEventListener("click", () => {
  document.getElementById("nav-links").classList.toggle("active");
});

// ================= Get logged-in user =================
function getUser() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    studentNameEl.textContent = user.username || user.email;
    loadAttendance(user.username || user.email);
  } else {
    window.location.href = "../login/index.html";
  }
}

// ================= Month navigation =================
document.getElementById("prevMonth").addEventListener("click", () => {
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  getUser();
});
document.getElementById("nextMonth").addEventListener("click", () => {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  getUser();
});

// ================= Update month label =================
function updateMonthLabel() {
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  document.getElementById("currentMonth").textContent =
    `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
}

// ================= Load attendance =================
async function loadAttendance(username) {
  const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  // ---- Monthly Data (for table) ----
  const { data: monthData, error } = await supabaseClient
    .from("attendance")
    .select("*")
    .eq("username", username)
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: true });

  updateMonthLabel();

  if (error) {
    console.error(error);
    attendanceBody.innerHTML = `<tr><td colspan="10">⚠️ Error loading data</td></tr>`;
  } else if (!monthData || monthData.length === 0) {
    attendanceBody.innerHTML = `<tr><td colspan="10">No records found</td></tr>`;
  } else {
    const subjects = [...new Set(monthData.map(r => r.subject))];
    const dates = [...new Set(monthData.map(r => r.date))];

    // Build table header
    attendanceHead.innerHTML = `
      <tr>
        <th>Date</th>
        ${subjects.map(sub => `<th>${sub}</th>`).join("")}
      </tr>
    `;

    // Build table body
    attendanceBody.innerHTML = dates
      .map(date => {
        const rowCells = subjects
          .map(sub => {
            const record = monthData.find(r => r.date === date && r.subject === sub);
            if (!record) return `<td>-</td>`;

            let short = record.status.charAt(0).toUpperCase(); // P/A/L
            return `<td class="${record.status.toLowerCase()}"><span class="status">${short}</span></td>`;
          })
          .join("");

        return `
          <tr>
            <td>${date}</td>
            ${rowCells}
          </tr>
        `;
      })
      .join("");
  }

  // ---- All-time Data (for summary charts) ----
  const { data: allData, error: allError } = await supabaseClient
    .from("attendance")
    .select("*")
    .eq("username", username);

  if (allError) {
    console.error(allError);
    return;
  }

  const allSubjects = [...new Set(allData.map(r => r.subject))];
  renderSummary(allData, allSubjects); // ✅ all-time data for charts
}

// ================= Render Summary Charts =================
function renderSummary(data, subjects) {
  const summaryTop = document.getElementById("summaryTop");
  summaryTop.innerHTML = ""; // clear old

  subjects.forEach(sub => {
    const records = data.filter(r => r.subject === sub);
    const present = records.filter(r => r.status.toLowerCase() === "present").length;
    const absent = records.filter(r => r.status.toLowerCase() === "absent").length;
    const total = present + absent;
    const percent = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    // Create container
    const div = document.createElement("div");
    div.className = "subject-chart";
    div.innerHTML = `
      <h4>${sub}</h4>
      <canvas id="chart-${sub}"></canvas>
      <p>${percent}% Present</p>
    `;
    summaryTop.appendChild(div);

    // Draw chart (only Present & Absent)
    const ctx = document.getElementById(`chart-${sub}`).getContext("2d");
    new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Present", "Absent"],
        datasets: [
          {
            data: [present, absent],
            backgroundColor: ["#4caf50", "#f44336"],
          },
        ],
      },
      options: {
        plugins: {
          legend: { display: true, labels: { color: "#ddd" } },
        },
      },
    });
  });
}

// ================= Toggle Attendance Table =================
toggleBtn.addEventListener("click", () => {
  tableVisible = !tableVisible;
  if (tableVisible) {
    attendanceGrid.style.display = "block";
    toggleBtn.textContent = "Hide Daily Attendance";
  } else {
    attendanceGrid.style.display = "none";
    toggleBtn.textContent = "See Attendance by Day";
  }
});

// ================= Logout =================
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "../login/index.html";
});

// ================= Init =================
getUser();

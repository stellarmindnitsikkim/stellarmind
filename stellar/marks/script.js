import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://yrzpuxhvktpcwksmlnwl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyenB1eGh2a3RwY3drc21sbndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTY1NzksImV4cCI6MjA3MTg3MjU3OX0.rjUVbGsQvPsLaua936DqA9fB5CVq8puRTq6DgJ1L_bs"; // replace with your real anon key

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (toggleBtn) toggleBtn.addEventListener("click", () => navLinks.classList.toggle("active"));

  try { 
    currentUser = JSON.parse(localStorage.getItem("user")); 
  } catch (e) {}

  // 🔹 Update navbar + welcome text
  updateNavbarAuth();

  // Setup exam tabs
  setupTabs();
  loadMarks("mid1");
});

function updateNavbarAuth() {
  const authBtn = document.getElementById("auth-btn");
  const welcomeStudent = document.getElementById("welcome-student");

  if (currentUser && (currentUser.username || currentUser.studentname)) {
    // Change Login → Logout
    authBtn.innerHTML = `<a href="#" id="logout-link"><i class="fas fa-sign-out-alt"></i> Logout</a>`;

    // Show welcome message in hero
    const name = currentUser.studentname || currentUser.username;
    if (welcomeStudent) {
      welcomeStudent.textContent = `Welcome, ${name}`;
    }

    // Logout handler
    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
      logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("user");
        window.location.href = "../login/index.html";
      });
    }
  } else {
    // If not logged in → keep Login button and clear welcome text
    if (welcomeStudent) welcomeStudent.textContent = "";
  }
}

function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadMarks(btn.dataset.exam);
    });
  });
  document.querySelector('.tab-btn')?.classList.add('active');
}

async function loadMarks(examType) {
  const area = document.getElementById('marks-area');
  area.innerHTML = '<div id="marks-loading" class="uploading-soon">Loading marks...</div>';

  if (!currentUser || !(currentUser.username || currentUser.studentname)) {
    area.innerHTML = `<div class="uploading-soon">Please <a href="../login/index.html">login</a> to view marks.</div>`;
    return;
  }

  const username = (currentUser.username || currentUser.studentname).toLowerCase();

  const { data, error } = await supabase
    .from('cse_marks')
    .select('*')
    .eq('username', username)
    .eq('exam_type', examType)
    .order('subject_code', { ascending: true });

  if (error) {
    console.error(error);
    area.innerHTML = `<div class="uploading-soon">⚠️ Error loading marks. Try again later.</div>`;
    return;
  }

  if (!data || data.length === 0) {
    area.innerHTML = `<div class="uploading-soon">No records found for <strong>${examType}</strong>.</div>`;
    return;
  }

  const table = document.createElement('table');
  table.className = 'marks-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Subject Code</th>
        <th>Subject Name</th>
        <th>Marks</th>
        <th>Max Marks</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector('tbody');
  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.subject_code}</td>
      <td>${row.subject_name}</td>
      <td>${row.marks ?? '-'}</td>
      <td>${row.max_marks ?? '-'}</td>
    `;
    tbody.appendChild(tr);
  });

  area.innerHTML = '';
  area.appendChild(table);
}

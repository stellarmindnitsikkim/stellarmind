// =============================
// Stellar Mind Attendance JS - Demo
// =============================

// Dummy login (student or developer)
const user = JSON.parse(localStorage.getItem("user")) || { username:"Alice", role:"student" };

document.addEventListener("DOMContentLoaded", () => {
  // Navbar login button
  const authBtn = document.getElementById("auth-btn");
  if(user){
    authBtn.innerHTML = `<a href="#"><i class="fas fa-user"></i> ${user.username} (Logout)</a>`;
    authBtn.addEventListener("click", () => { localStorage.removeItem("user"); location.reload(); });
  } else authBtn.innerHTML = `<a href="#"><i class="fas fa-user"></i> Login</a>`;

  // Mobile toggle
  const toggleBtn = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  toggleBtn.addEventListener("click", () => navLinks.classList.toggle("active"));

  loadAttendance();
});

// Dummy students data
const demoStudents = [
  { name:"Alice", branch:"CSE" },
  { name:"Bob", branch:"ECE" },
  { name:"Charlie", branch:"ME" },
  { name:"David", branch:"CSE" },
  { name:"Eve", branch:"ECE" }
];

function loadAttendance(){
  const totalStudentsElem = document.getElementById("total-students");
  const totalClassesElem = document.getElementById("total-classes");
  const studentsDashboard = document.getElementById("students-dashboard");

  const totalClasses = 50; // demo total classes
  totalStudentsElem.innerText = demoStudents.length;
  totalClassesElem.innerText = totalClasses;

  studentsDashboard.innerHTML = "";

  // Filter for student or developer
  let displayData = user.role==="developer" ? demoStudents : demoStudents.filter(d=>d.name===user.username);

  // Add random attendance %
  displayData = displayData.map(student=>{
    const attended = Math.floor(Math.random()*(totalClasses+1));
    return {...student, attended, total_classes:totalClasses};
  });

  // Render student cards
  displayData.forEach(student=>{
    const remainingLeaves = student.total_classes - student.attended;
    const card = document.createElement("div");
    card.className = "student-card";
    card.innerHTML = `
      <h4>${student.name}</h4>
      <p><strong>Branch:</strong> ${student.branch}</p>
      <p><strong>Attendance:</strong> ${student.attended}/${student.total_classes}</p>
      <p>Total Absent :</strong> ${remainingLeaves}</p>
    `;
    studentsDashboard.appendChild(card);
  });

  renderChart(displayData);
}


// Render demo chart
function renderChart(data){
  const ctx = document.getElementById('attendanceChartDemo').getContext('2d');
  const labels = data.map(d => d.name);

  // Attendance % values
  const attendanceData = data.map(d => ((d.attended/d.total_classes)*100).toFixed(1));

  // Bar colors based on condition
  const barColors = attendanceData.map(value => {
    if (value < 75 && value >60) {
      return 'rgba(210, 229, 87, 0.9)'; // yellow
    }else if(value < 60 )
    {
      return 'rgba(229, 108, 87, 0.9)'; // yellow
    }else {
      return 'rgba(87, 229, 111, 0.7)'; // purple
    }
  });

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Attendance %',
        data: attendanceData,
        backgroundColor: barColors,
        borderColor: '#57abff',
        borderWidth: 2,
        borderRadius: 6
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { callback: v => v + '%' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ctx.raw + '%' } }
      },
      animation: { duration: 1500, easing: 'easeOutBounce' }
    }
  });
}

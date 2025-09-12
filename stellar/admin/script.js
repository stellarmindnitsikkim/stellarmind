// ---- Supabase ----
const SUPABASE_URL = "https://yrzpuxhvktpcwksmlnwl.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyenB1eGh2a3RwY3drc21sbndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTY1NzksImV4cCI6MjA3MTg3MjU3OX0.rjUVbGsQvPsLaua936DqA9fB5CVq8puRTq6DgJ1L_bs";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ---- Branch Data ----
const BRANCHES = {
  CSE: {
    subjects: [
      { code: "CS13111", name: "Data Structure and Algorithms" },
      { code: "CS13112", name: "Computer Networks" },
      { code: "CS13113", name: "Digital Logic Design" },
      { code: "CS13114", name: "Object Oriented System Design" },
      { code: "CS13115", name: "Computational Mathematics" },
      { code: "CS13116", name: "Foundation of Machine Learning" },
      { code: "CS13211", name: "DSA Laboratory" },
      { code: "CS13212", name: "Computer Networks Laboratory" },
      { code: "CS13213", name: "Digital Logic Design Laboratory" },
      { code: "CS13214", name: "System Design Lab using Python" }
    ],
    rollRange: [1, 64],
    exclude: [],
    extra: ["b240086", "b240091", "b240158"]
  },
  ECE: {
    subjects: [
      { code: "EC13101_2", name: "Mathematics III" },
      { code: "EC13102_2", name: "Analog Electronic Circuits" },
      { code: "EC13103_2", name: "Signals and Systems" },
      { code: "EC13104_2", name: "Electromagnetic Theory" },
      { code: "EC13105_2", name: "Communication Systems" },
      { code: "EC13201_2", name: "Analog Electronic Circuits Lab" },
      { code: "EC13202_2", name: "Signals and Systems Lab" },
      { code: "EC13203_2", name: "Communication Systems Lab" }
    ],
    rollRange: [65, 92],
    exclude: [86, 91],
    extra: []
  },
  EEE: {
    subjects: [
      { code: "EE13101_2", name: "Mathematics III" },
      { code: "EE13102_2", name: "Electrical Machines I" },
      { code: "EE13103_2", name: "Power Systems I" },
      { code: "EE13104_2", name: "Control Systems" },
      { code: "EE13105_2", name: "Electromagnetic Theory" },
      { code: "EE13201_2", name: "Electrical Machines I Lab" },
      { code: "EE13202_2", name: "Control Systems Lab" }
    ],
    rollRange: [93, 119],
    exclude: [],
    extra: []
  },
  CE: {
    subjects: [
      { code: "CE13112_2", name: "Mathematics III" },
      { code: "ZZ13201_2", name: "Professional Practice I" },
      { code: "CE13108_2", name: "Structural Analysis I" },
      { code: "CE13111_2", name: "Transportation Engineering I" },
      { code: "CE13206_2", name: "Transportation Engineering Lab" },
      { code: "CE13110", name: "Surveying And Remote Sensing" },
      { code: "CE13107", name: "Building Material and Construction" },
      { code: "CE13205_2", name: "Applied Engineering Geology & Material Testing" },
      { code: "CE13207_2", name: "Building Drawing" },
      { code: "CE13207_2", name: "Building Drawing" }
    ],
    rollRange: [120, 142],
    exclude: [138],
    extra: []
  },
  ME: {
    subjects: [
      { code: "ME13101_2", name: "Mathematics III" },
      { code: "ME13102_2", name: "Fluid Mechanics" },
      { code: "ME13104_2", name: "Thermodynamics" },
      { code: "ME13105_2", name: "Materials Science and Metallurgy" },
      { code: "ME13106_2", name: "Metrology and Measurements" },
      { code: "ME13107_2", name: "Kinematics of Machinery" },
      { code: "ME13201_2", name: "Fluid Mechanics Lab" },
      { code: "ME13203_2", name: "Metrology Lab" },
      { code: "ME13204_2", name: "Machine Drawing" },
      { code: "ME13205_2", name: "Kinematics Lab" }
    ],
    rollRange: [143, 167],
    exclude: [158],
    extra: []
  }
};

// ---- Elements ----
const attDate = document.getElementById("attDate");
const subjectsBox = document.getElementById("subjectsBox");
const branchSelect = document.getElementById("branchSelect");
const buildGridBtn = document.getElementById("buildGridBtn");
const clearGridBtn = document.getElementById("clearGridBtn");
const gridSection = document.getElementById("gridSection");
const attHead = document.getElementById("attHead");
const attBody = document.getElementById("attBody");
const bulkToolbar = document.getElementById("bulkToolbar");
const saveBtn = document.getElementById("saveBtn");
const saveStatus = document.getElementById("saveStatus");
const logoutBtn = document.getElementById("logoutBtn");

let currentBranch = null;

// Default date to today
attDate.valueAsDate = new Date();

// Render subjects when branch changes
branchSelect.addEventListener("change", () => {
  currentBranch = branchSelect.value;
  if (!currentBranch) {
    subjectsBox.innerHTML = "";
    return;
  }
  const branch = BRANCHES[currentBranch];
  subjectsBox.innerHTML = branch.subjects
    .map(
      (s) => `
    <label class="subject-check">
      <input type="checkbox" value="${s.code}" />
      <span>${s.code} — ${s.name}</span>
    </label>
  `
    )
    .join("");
});

// Generate roll numbers
function getRolls(branchKey) {
  const b = BRANCHES[branchKey];
  if (!b) return [];
  const rolls = [];
  for (let i = b.rollRange[0]; i <= b.rollRange[1]; i++) {
    if (!b.exclude.includes(i)) {
      rolls.push("b240" + String(i).padStart(3, "0"));
    }
  }
  return [...rolls, ...b.extra].sort();
}

function selectedSubjectCodes() {
  return [...subjectsBox.querySelectorAll('input[type="checkbox"]:checked')].map(
    (i) => i.value
  );
}

// Build Grid
function buildGrid() {
  const when = attDate.value;
  if (!currentBranch) {
    alert("Pick a branch first.");
    return;
  }
  const activeCodes = selectedSubjectCodes();
  if (!when || activeCodes.length === 0) {
    alert("Pick a date and select at least one subject.");
    return;
  }

  const currentRolls = getRolls(currentBranch);

  attHead.innerHTML = `
    <tr>
      <th>Roll No.</th>
      ${activeCodes.map((c) => `<th data-code="${c}">${c}</th>`).join("")}
    </tr>
  `;

  attBody.innerHTML = currentRolls
    .map(
      (r) => `
    <tr data-roll="${r}">
      <td class="roll">${r.toUpperCase()}</td>
      ${activeCodes
        .map(
          (c) => `
        <td data-code="${c}">
          <select class="status-select">
            <option value="Present" selected>Present</option>
            <option value="Absent">Absent</option>
          </select>
        </td>
      `
        )
        .join("")}
    </tr>
  `
    )
    .join("");

  bulkToolbar.innerHTML = activeCodes
    .map(
      (c) => `
    <div class="bulk">
      <span class="chip">${c}</span>
      <button class="btn xs" data-bulk-absent="${c}">Mark All Absent</button>
    </div>
  `
    )
    .join("");

  bulkToolbar.querySelectorAll("button[data-bulk-absent]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const code = btn.dataset.bulkAbsent;
      attBody
        .querySelectorAll(`td[data-code="${code}"] .status-select`)
        .forEach((s) => {
          s.value = "Absent";
        });
    });
  });

  gridSection.style.display = "block";
  saveStatus.textContent = "";
}

buildGridBtn.addEventListener("click", buildGrid);
clearGridBtn.addEventListener("click", () => {
  subjectsBox.querySelectorAll('input[type="checkbox"]').forEach(
    (c) => (c.checked = false)
  );
  gridSection.style.display = "none";
  attHead.innerHTML = "";
  attBody.innerHTML = "";
  bulkToolbar.innerHTML = "";
});

// Save Attendance
saveBtn.addEventListener("click", async () => {
  const when = attDate.value;
  const activeCodes = [...attHead.querySelectorAll("th[data-code]")].map(
    (th) => th.dataset.code
  );
  const allRollsInGrid = [...attBody.querySelectorAll("tr")].map(
    (tr) => tr.dataset.roll
  );

  if (!when || activeCodes.length === 0 || !currentBranch || allRollsInGrid.length === 0) {
    alert("Please build the grid first.");
    return;
  }

  // Collect ALL attendance data
  const rowsToInsert = [];
  attBody.querySelectorAll("tr").forEach((tr) => {
    const roll = tr.dataset.roll;
    tr.querySelectorAll("td[data-code]").forEach((td) => {
      const code = td.dataset.code;
      const status = td.querySelector(".status-select").value;
      rowsToInsert.push({
        username: roll,
        branch: currentBranch,
        date: when,
        subject: code,
        status: status, // ✅ Save both Present & Absent
      });
    });
  });

  saveBtn.disabled = true;
  saveStatus.textContent = "Saving…";

  try {
    // Delete old records first
    const { error: delErr } = await supabaseClient
      .from("attendance")
      .delete()
      .in("username", allRollsInGrid)
      .eq("date", when)
      .in("subject", activeCodes)
      .eq("branch", currentBranch);

    if (delErr) throw delErr;

    // Insert all attendance records
    if (rowsToInsert.length > 0) {
      const { error: insErr } = await supabaseClient
        .from("attendance")
        .insert(rowsToInsert);
      if (insErr) throw insErr;
    }

    saveStatus.textContent = `✅ Saved attendance for ${rowsToInsert.length} entries.`;
  } catch (e) {
    console.error(e);
    saveStatus.textContent = "❌ Error while saving. Check console.";
  } finally {
    saveBtn.disabled = false;
  }
});

// ---- Logout ----
logoutBtn.addEventListener("click", async () => {
  try {
    await supabaseClient.auth.signOut();
    window.location.href = "../index.html";
  } catch (err) {
    console.error("Logout error:", err);
    alert("Error logging out. Please try again.");
  }
});

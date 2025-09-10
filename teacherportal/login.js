import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://yrzpuxhvktpcwksmlnwl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyenB1eGh2a3RwY3drc21sbndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTY1NzksImV4cCI6MjA3MTg3MjU3OX0.rjUVbGsQvPsLaua936DqA9fB5CVq8puRTq6DgJ1L_bs";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("login-message");

  message.textContent = "⏳ Logging in...";
  message.style.color = "white";

  try {
    // Step 1: Check in admins table
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single();

    if (adminData) {
      // ✅ Admin found → redirect to admin page
      localStorage.setItem("user", JSON.stringify({ username: adminData.username, role: "admin" }));
      message.textContent = "✅ Welcome Admin! Redirecting...";
      message.style.color = "lime";

      setTimeout(() => {
        window.location.href = "/admin/index.html";
      }, 1200);

      return; // stop further checks
    }

    // --- Step 2: If not admin, check teacherportal table ---
    const { data: teacherData, error: teacherError } = await supabase
      .from("teacherportal")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single();
    
    if (teacherData) {
      // ✅ Teacher found → store their details and redirect
      localStorage.setItem("user", JSON.stringify({ 
        username: teacherData.username, 
        role: "teacher",
        teacher_name: teacherData.teacher_name,
        subject_code: teacherData.subject_code,
        subject_name: teacherData.subject_name
      }));
      message.textContent = `✅ Welcome ${teacherData.teacher_name}! Redirecting...`;
      message.style.color = "lime";

      setTimeout(() => {
        // Make sure this is the correct path to your teacher's page
        window.location.href = "/index.html"; 
      }, 1200);

      return; // stop further checks
    }


    // Step 3: If not admin or teacher, check users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single();

    if (userData) {
      // ✅ Normal user
      localStorage.setItem("user", JSON.stringify({ username: userData.username, role: "user" }));
      message.textContent = "✅ Login successful! Redirecting...";
      message.style.color = "lime";

      setTimeout(() => {
        window.location.href = "/index.html"; // Or student page
      }, 1200);

      return;
    }

    // Step 4: If no user was found in any table
    message.textContent = "❌ Invalid username or password.";
    message.style.color = "red";

  } catch (err) {
    // This catch block handles cases where .single() finds more than one user,
    // or if there's a general network error. We ignore the "no rows found" error
    // because our logic handles that by checking if the data variables are null.
    if (err && err.code !== 'PGRST116') {
        console.error(err);
        message.textContent = "⚠️ Something went wrong. Try again.";
        message.style.color = "orange";
    } else {
        // This is the expected path when no user is found
        message.textContent = "❌ Invalid username or password.";
        message.style.color = "red";
    }
  }
});


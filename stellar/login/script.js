import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://yrzpuxhvktpcwksmlnwl.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyenB1eGh2a3RwY3drc21sbndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTY1NzksImV4cCI6MjA3MTg3MjU3OX0.rjUVbGsQvPsLaua936DqA9fB5CVq8puRTq6DgJ1L_bs";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("login-message");

  message.textContent = "⏳ Logging in...";
  message.style.color = "white";

  try {
    let user = null;

    // Step 1: Check admins table
    const { data: adminData } = await supabase
      .from("admins")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single();

    if (adminData) {
      user = { username: adminData.username, role: "admin" };
    }

    // Step 2: Check teacherportal (if not found in admins)
    if (!user) {
      const { data: teacherData } = await supabase
        .from("teacherportal")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .single();

      if (teacherData) {
        user = {
          username: teacherData.username,
          role: "teacher",
          teacher_name: teacherData.teacher_name,
          subject_code: teacherData.subject_code,
          subject_name: teacherData.subject_name,
        };
      }
    }

    // Step 3: Check users (if not found earlier)
    if (!user) {
      const { data: userData } = await supabase
        .from("users")
        .select("username, studentname") // 👈 fetch studentname too
        .eq("username", username)
        .eq("password", password)
        .single();

      if (userData) {
        user = {
          username: userData.username,
          role: "user",
          studentname: userData.studentname, // 👈 store studentname
        };
      }
    }

    // ✅ If any match is found
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      message.textContent = "✅ Login successful! Redirecting...";
      message.style.color = "lime";

      setTimeout(() => {
        window.location.href = "/index.html"; // 👈 always redirect here
      }, 1200);
      return;
    }

    // ❌ If no user was found in any table
    message.textContent = "❌ Invalid username or password.";
    message.style.color = "red";
  } catch (err) {
    console.error(err);
    message.textContent = "⚠️ Something went wrong. Try again.";
    message.style.color = "orange";
  }
});

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://yrzpuxhvktpcwksmlnwl.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyenB1eGh2a3RwY3drc21sbndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTY1NzksImV4cCI6MjA3MTg3MjU3OX0.rjUVbGsQvPsLaua936DqA9fB5CVq8puRTq6DgJ1L_bs";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const message = document.getElementById("login-message");

  message.textContent = "⏳ Logging in...";
  message.style.color = "white";

  try {
    let role = null;
    let userData = null;

    // 1️⃣ Try USERS table (encrypted login via Edge Function)
    const { data: user, error: userErr } = await supabase.functions.invoke("login-user", {
      body: { username, password },
    });

    if (user && !user.error) {
      role = "user";
      userData = user;
    }

    // 2️⃣ If not found in users, try TEACHERPORTAL (plain password)
    if (!userData) {
      const { data: teacher, error: teacherErr } = await supabase
        .from("teacherportal")
        .select("*")
        .eq("username", username)
        .eq("password", password) // plain password check
        .maybeSingle();

      if (teacher && !teacherErr) {
        role = "teacher";
        userData = teacher;
      }
    }

    // 3️⃣ If still not found, try ADMINS (plain password)
    if (!userData) {
      const { data: admin, error: adminErr } = await supabase
        .from("admins")
        .select("*")
        .eq("username", username)
        .eq("password", password) // plain password check
        .maybeSingle();

      if (admin && !adminErr) {
        role = "admin";
        userData = admin;
      }
    }

    // ✅ If found
    if (userData) {
      // Save role + data in localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...userData,
          role: role,
        })
      );

      message.textContent = `✅ Logged in as ${role}. Redirecting...`;
      message.style.color = "lime";

      // Redirect based on role
      setTimeout(() => {
        if (role === "admin") {
          window.location.href = "/index.html";
        } else if (role === "teacher") {
          window.location.href = "/index.html";
        } else {
          window.location.href = "/index.html";
        }
      }, 1200);
      return;
    }

    // ❌ If no match
    throw new Error("Invalid credentials");
  } catch (err) {
    console.error(err);
    message.textContent = "❌ Invalid username or password.";
    message.style.color = "red";
  }
});

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
      .eq("password", password)  // Add password column in admins table if needed
      .single();

    if (adminData) {
      // ✅ Admin found → redirect to admin page
      localStorage.setItem("user", JSON.stringify({ username: adminData.username, role: "admin" }));
      message.textContent = "✅ Welcome Admin! Redirecting...";
      message.style.color = "lime";

      setTimeout(() => {
        window.location.href = "/admin/index.html";
      }, 1200);

      return; // stop further check
    }

    // Step 2: If not admin, check users table
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
        window.location.href = "/index.html";
      }, 1200);

      return;
    }

    // Step 3: If neither admin nor user
    message.textContent = "❌ Invalid username or password.";
    message.style.color = "red";

  } catch (err) {
    console.error(err);
    message.textContent = "⚠️ Something went wrong. Try again.";
    message.style.color = "orange";
  }
});

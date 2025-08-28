
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://yrzpuxhvktpcwksmlnwl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyenB1eGh2a3RwY3drc21sbndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTY1NzksImV4cCI6MjA3MTg3MjU3OX0.rjUVbGsQvPsLaua936DqA9fB5CVq8puRTq6DgJ1L_bs"; // replace with real key

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("login-message");

  message.textContent = "⏳ Logging in...";

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single();

    if (error || !data) {
      message.textContent = "❌ Invalid username or password.";
      message.style.color = "red";
      return;
    }

    // Save user info in localStorage
    localStorage.setItem("user", JSON.stringify({ username: data.username }));

    message.textContent = "✅ Login successful! Redirecting...";
    message.style.color = "lime";

    setTimeout(() => {
      window.location.href = "/index.html"; // redirect back to homepage
    }, 1200);

  } catch (err) {
    console.error(err);
    message.textContent = "⚠️ Something went wrong. Try again.";
    message.style.color = "orange";
  }
});

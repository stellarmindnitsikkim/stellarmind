import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://yrzpuxhvktpcwksmlnwl.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyenB1eGh2a3RwY3drc21sbndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTY1NzksImV4cCI6MjA3MTg3MjU3OX0.rjUVbGsQvPsLaua936DqA9fB5CVq8puRTqDgJ1L_bs";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const message = document.getElementById("login-message");

  message.textContent = "⏳ Logging in...";
  message.style.color = "white";

  try {
    let role = null;
    let userData = null;

    // 1️⃣ Try USERS table (encrypted login via Edge Function)
    const { data: userLoginData, error: userLoginError } = await supabase.functions.invoke("login-user", {
      body: { username, password },
    });
    
    // Check for success from the function itself
    if (userLoginData && !userLoginData.error) {
      role = "user";
      userData = userLoginData;
    }

    // 2️⃣ If not a user, try TEACHERPORTAL (NEW encrypted login via Edge Function)
    if (!userData) {
      // Call the new 'login-teacher' edge function
      const { data: teacherLoginData, error: teacherLoginError } = await supabase.functions.invoke("login-teacher", {
        body: { username, password },
      });

      // Check for success from the function
      if (teacherLoginData && !teacherLoginData.error) {
        role = "teacher";
        userData = teacherLoginData;
      }
    }

    // 3️⃣ If still not found, try ADMINS (plain password, as before)
    if (!userData) {
      const { data: admin, error: adminErr } = await supabase
        .from("admins")
        .select("*")
        .eq("username", username)
        .eq("password", password) // Assuming admin login remains plain text
        .maybeSingle();

      if (admin && !adminErr) {
        role = "admin";
        userData = admin;
      }
    }

    // ✅ If any login attempt succeeded
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
        // Customize your redirects as needed
        if (role === "admin") {
          window.location.href = "/index.html"; // Or admin dashboard
        } else if (role === "teacher") {
          window.location.href = "/index.html"; // Or teacher dashboard
        } else {
          window.location.href = "/index.html"; // Or student dashboard
        }
      }, 1200);
      return;
    }

    // ❌ If no match after all attempts
    throw new Error("Invalid credentials");
  } catch (err) {
    console.error("Login failed:", err.message);
    message.textContent = "❌ Invalid username or password.";
    message.style.color = "red";
  }
});

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://yrzpuxhvktpcwksmlnwl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyenB1eGh2a3RwY3drc21sbndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTY1NzksImV4cCI6MjA3MTg3MjU3OX0.rjUVbGsQvPsLaua936DqA9fB5CVq8puRTq6DgJ1L_bs";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value; // Don't trim passwords
  const message = document.getElementById("login-message");

  message.textContent = "⏳ Logging in...";
  message.style.color = "white";

  try {
    // ---===[ NEW SECURE LOGIN LOGIC ]===---
    // Calls the secure backend function to verify the password
    const { data: user, error } = await supabase.functions.invoke('login-user', {
      body: { username, password },
    });

    if (error) throw error;
    // The function itself can return an error message in the 'data' object
    if (user.error) throw new Error(user.error);
    
    // ---===[ SUCCESSFUL LOGIN ]===---
    // The 'user' object is returned from the function on success
    if (user) {
      // Save the user's data (without the password hash) to local storage
      localStorage.setItem("user", JSON.stringify(user));
      message.textContent = "✅ Login successful! Redirecting...";
      message.style.color = "lime";

      setTimeout(() => {
        // Redirect to your main application page
        window.location.href = "/index.html"; 
      }, 1200);
      return;
    }

  } catch (err) {
    console.error(err);
    // Use a generic error message for security. 
    // This prevents attackers from knowing if they guessed a username correctly.
    message.textContent = "❌ Invalid username or password.";
    message.style.color = "red";
  }
});


const iframe = document.getElementById("stellar-chat");
const loader = document.getElementById("custom-loader");

function showChatbox() {
  loader.classList.add("hidden");  // fade out loader
  iframe.style.display = "block";  // show chatbox
}

// Wait for iframe to load completely
iframe.onload = () => {
  setTimeout(showChatbox, 2000); // delay 2s to bypass botpress splash
}

// Fallback: force show chat if onload fails
setTimeout(showChatbox, 6000);

// Mobile nav toggle
const menuToggle = document.getElementById("mobile-menu");
const navLinks = document.getElementById("nav-links");
if(menuToggle && navLinks){
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}

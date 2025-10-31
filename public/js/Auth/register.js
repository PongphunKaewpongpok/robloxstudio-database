document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const msg = document.getElementById("reg-msg");

  const showMessage = (text, type = "info") => {
    msg.textContent = text;
    msg.className = "message " + type;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = form.username.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    if (password !== confirmPassword) {
      showMessage("❌ Passwords do not match", "error");
      return;
    }

    try {
      const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        showMessage("✅ Registered successfully!", "success");
        setTimeout(() => (window.location.href = "/login"), 1000);
      } else {
        showMessage("⚠️ " + (data.message || "Registration failed"), "error");
      }
    } catch (err) {
      console.error("Register error:", err);
      showMessage("⚠️ " + err.message, "error");
    }
  });

  
});

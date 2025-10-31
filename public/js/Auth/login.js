document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const messageDiv = document.getElementById("login-msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = form.username.value.trim();
    const password = form.password.value.trim();

    if (!username || !password) {
      showMessage("Please fill in both fields", "error");
      return;
    }

    try {
        const res = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        let data;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await res.json();
        } else {
            throw new Error("Server did not return JSON");
        }

        if (res.ok && data.status === "success") {
            showMessage("✅ Login successful!", "success");
            setTimeout(() => (window.location.href = "/dashboard/player"), 1000);
        } else {
            showMessage("❌ " + (data.message || "Login failed"), "error");
        }
    } catch (err) {
        console.error("Login error:", err);
        showMessage("⚠️ " + err.message, "error");
    }
  });

  function showMessage(msg, type) {
    messageDiv.textContent = msg;
    messageDiv.className = "message " + type;
  }
});

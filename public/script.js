
document.addEventListener("DOMContentLoaded", () => {
  const settingsBtn = document.getElementById("settingsBtn");
  if (settingsBtn) {
    settingsBtn.onclick = () => {
      window.location.href = "settings.html";
    };
  }
});

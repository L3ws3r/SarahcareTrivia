window.onload = () => {
  const settingsBtn = document.getElementById("settingsBtn");
  const backBtn = document.getElementById("backToHomeBtn");
  const clearBtn = document.getElementById("clearHistoryBtn");
  const themeSelect = document.getElementById("themePicker");

  if (settingsBtn) {
    settingsBtn.onclick = () => {
      document.getElementById("homeScreen").classList.add("hidden");
      document.getElementById("settingsScreen").classList.remove("hidden");
    };
  }

  if (backBtn) {
    backBtn.onclick = () => {
      document.getElementById("settingsScreen").classList.add("hidden");
      document.getElementById("homeScreen").classList.remove("hidden");
    };
  }

  if (clearBtn) {
    clearBtn.onclick = () => {
      localStorage.removeItem("seenQuestions");
      alert("Question history cleared!");
    };
  }

  if (themeSelect) {
    // Load saved theme
    const savedTheme = localStorage.getItem("selectedTheme");
    if (savedTheme) {
      themeSelect.value = savedTheme;
      document.body.className = savedTheme;
    }

    // Save + apply new theme
    themeSelect.onchange = (e) => {
      const theme = e.target.value;
      localStorage.setItem("selectedTheme", theme);
      document.body.className = theme;
    };
  }
};
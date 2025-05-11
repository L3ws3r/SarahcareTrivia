
// Basic routing
document.getElementById("settingsBtn").addEventListener("click", () => {
    document.getElementById("homeScreen").classList.add("hidden");
    document.getElementById("gameScreen").classList.add("hidden");
    document.getElementById("settingsScreen").classList.remove("hidden");
});

document.getElementById("homeBtn").addEventListener("click", () => {
    document.getElementById("settingsScreen").classList.add("hidden");
    document.getElementById("gameScreen").classList.add("hidden");
    document.getElementById("homeScreen").classList.remove("hidden");
});

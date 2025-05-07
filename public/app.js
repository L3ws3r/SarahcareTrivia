function setCategory(cat) {
  document.getElementById("category-input").value = cat;
}
function startGame() {
  document.getElementById("home-screen").style.display = "none";
  document.getElementById("trivia-screen").style.display = "block";
}
function goHome() {
  document.querySelectorAll(".screen").forEach(el => el.style.display = "none");
  document.getElementById("home-screen").style.display = "block";
}
function showHint() { alert("Hint: You got this!"); }
function toggleFunFact() {
  const fact = document.getElementById("fun-fact");
  fact.style.display = fact.style.display === "none" ? "block" : "none";
}
function nextQuestion() {
  goHome();
}

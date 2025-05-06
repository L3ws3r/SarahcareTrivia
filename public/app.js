
let currentQuestionIndex = 0;
let currentQuestions = [];
let score = 0;

async function startGame() {
  const category = "General Trivia";
  const questionCount = 3;
  const answerCount = 4;

  const response = await fetch("/ask-gpt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, questionCount, answerCount })
  });

  currentQuestions = await response.json();
  currentQuestionIndex = 0;
  displayQuestion();
}

function displayQuestion() {
  const q = currentQuestions[currentQuestionIndex];
  document.getElementById("question-text").innerText = q.question;
  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";
  Object.entries(q.choices).forEach(([key, value]) => {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.innerText = `${key}: ${value}`;
    btn.onclick = () => selectAnswer(key);
    answersDiv.appendChild(btn);
  });
  document.getElementById("feedback").innerText = "";
  document.getElementById("fun-fact").innerText = q.fact;
  document.getElementById("fun-fact").style.display = "none";
}

function selectAnswer(letter) {
  const correct = currentQuestions[currentQuestionIndex].correct;
  const feedback = document.getElementById("feedback");
  feedback.innerText = letter === correct ? "Correct!" : `Wrong! Correct was ${correct}`;
}

function toggleFunFact() {
  const el = document.getElementById("fun-fact");
  el.style.display = el.style.display === "none" ? "block" : "none";
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < currentQuestions.length) {
    displayQuestion();
  } else {
    alert("End of game!");
  }
}

function goHome() {
  location.reload();
}

startGame();

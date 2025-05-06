
let currentQuestionIndex = 0;
let currentQuestions = [];
let score = 0;

function setCategory(name) {
  document.getElementById("category-input").value = name;
}

async function startGame() {
  const category = document.getElementById("category-input").value || "General";
  const questionCount = parseInt(document.querySelector('input[name="qCount"]:checked').value) || 5;
  const answerCount = document.getElementById("five-answers").checked ? 5 : 4;

  score = 0;
  currentQuestionIndex = 0;
  currentQuestions = [];

  document.getElementById("home-screen").style.display = "none";
  document.getElementById("trivia-screen").style.display = "block";

  const res = await fetch("/ask-gpt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, questionCount, answerCount })
  });

  currentQuestions = await res.json();
  displayQuestion();
}

function displayQuestion() {
  const q = currentQuestions[currentQuestionIndex];
  document.getElementById("question-text").innerText = q.question;
  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  Object.entries(q.choices).forEach(([key, val]) => {
    const btn = document.createElement("button");
    btn.className = "btn answer-btn";
    btn.innerText = `${key}: ${val}`;
    btn.onclick = () => selectAnswer(key, btn);
    answersDiv.appendChild(btn);
  });

  document.getElementById("feedback").innerText = "";
  document.getElementById("fun-fact").innerText = q.fact;
  document.getElementById("fun-fact").style.display = "none";

  const status = `Question ${currentQuestionIndex + 1} of ${currentQuestions.length} — ✅ ${score} correct | ❌ ${currentQuestionIndex - score} wrong`;
  document.getElementById("question-status").innerText = status;
}

function selectAnswer(letter, button) {
  const correct = currentQuestions[currentQuestionIndex].correct;
  const allButtons = document.querySelectorAll(".answer-btn");

  allButtons.forEach(btn => {
    btn.disabled = true;
    const isCorrect = btn.innerText.startsWith(correct);
    const isSelected = btn.innerText.startsWith(letter);
    btn.style.backgroundColor = isCorrect ? "green" : isSelected ? "red" : "";
    btn.style.color = "white";
  });

  if (letter === correct) {
    document.getElementById("feedback").innerText = "Correct! 🎉";
    score++;
  } else {
    document.getElementById("feedback").innerText = `Oops! Correct answer was ${correct}`;
  }
}

function toggleFunFact() {
  const factEl = document.getElementById("fun-fact");
  factEl.style.display = factEl.style.display === "none" ? "block" : "none";
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex >= currentQuestions.length) {
    
function endGame() {
  document.getElementById("trivia-screen").style.display = "none";
  document.getElementById("end-screen").style.display = "block";

  const scoreTitle = document.getElementById("score-title");
  const endMessage = document.getElementById("end-message");
  scoreTitle.innerText = `You scored ${score} out of ${currentQuestions.length}`;

  if (score === currentQuestions.length) {
    endMessage.innerHTML = "<p style='color:green; font-weight:bold;'>🎉 Perfect! You crushed it like a true trivia champ! 🧠</p>";
  } else if (score >= currentQuestions.length / 2) {
    endMessage.innerHTML = "<p style='color:orange;'>👏 Not bad! You remembered more than your grandkids think you can!</p>";
  } else {
    endMessage.innerHTML = "<p style='color:red;'>😅 Oof! Did you nap through the last century? Better luck next time!</p>";
  }
}

  } else {
    displayQuestion();
  }
}

function goHome() {
  document.getElementById("trivia-screen").style.display = "none";
  document.getElementById("home-screen").style.display = "block";
}

function showHint() {
  const q = currentQuestions[currentQuestionIndex];
  fetch("/ask-gpt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      category: `Give a helpful, senior-friendly hint for this trivia question: "${q.question}"`,
      answerCount: 0
    })
  })
  .then(res => res.json())
  .then(data => {
    alert("Hint: " + (data.question || "No hint available."));
  });
}
